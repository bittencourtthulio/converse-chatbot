// runx-ponte.js — traduz eventos do OpenCode/MimoCode para o payload e o
// despachante que os hooks Python do runx ja entendem (D-14, "Sessoes
// paralelas" do SKILL.md).
//
// Um so arquivo serve aos dois harnesses: OpenCode e MimoCode aceitam a mesma
// assinatura de plugin e os mesmos nomes de evento (tool.execute.before,
// tool.execute.after, shell.env) — ver docs/sessoes-paralelas/base/harnesses.md.
// CommonJS sem dependencias externas, so a biblioteca padrao do Node.
//
// O aviso emitido no `before` (exit 0 com stderr) precisa aparecer no
// `after` da MESMA chamada de ferramenta. Cada hook do OpenCode/MimoCode e
// invocado num processo `node` distinto — um Map em memoria module-level NAO
// sobrevive entre eles (achado e corrigido durante a validacao de bancada da
// T-01.03, com dois processos node reais). Por isso o aviso e persistido em
// disco, por callID, e apagado quando o `after` o consome.

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

function saneCallId(callID) {
  return String(callID).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function arquivoAviso(callID) {
  return path.join(os.tmpdir(), "runx-ponte-aviso-" + saneCallId(callID) + ".txt");
}

function detectarHarness() {
  const alvo = __filename.replace(/\\/g, "/");
  if (alvo.includes("/.mimocode/") || alvo.includes("/mimocode/")) return "mimocode";
  return "opencode";
}

function localizarDespachante(cwd) {
  // So teste: aponta direto para um despachante isolado, sem hooks.json ao
  // lado (a fixture de teste nao tem um hooks.json real ali perto).
  if (process.env.RUNX_PONTE_DESPACHANTE) return process.env.RUNX_PONTE_DESPACHANTE;

  const candidatos = [
    path.join(cwd || ".", ".claude", "runx-hooks", "comum", "despachante.py"),
    path.join(os.homedir(), ".claude", "runx-hooks", "comum", "despachante.py"),
    // Este proprio repositorio (runx), onde os scripts vivem em hooks/ direto.
    path.join(cwd || ".", ".claude", "hooks", "comum", "despachante.py"),
  ];
  for (const c of candidatos) {
    try {
      if (fs.existsSync(c)) return c;
    } catch (e) {
      // ignora e tenta o proximo candidato
    }
  }
  return null;
}

function lerHooksJson(despachantePath) {
  try {
    const p = path.join(path.dirname(despachantePath), "..", "hooks.json");
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return { hooks: {} };
  }
}

function grupoArgs(hooksJson, evento, matcherAlvo) {
  const grupos = (hooksJson.hooks && hooksJson.hooks[evento]) || [];
  for (const g of grupos) {
    if (g.matcher !== matcherAlvo) continue;
    const cmd = g.hooks && g.hooks[0] && g.hooks[0].command;
    if (!cmd) continue;
    const partes = cmd.split(/\s+/).filter(Boolean);
    const idx = partes.findIndex((p) => p.includes("despachante.py"));
    return idx >= 0 ? partes.slice(idx + 1) : [];
  }
  return null;
}

function traduzToolNome(tool) {
  return { write: "Write", edit: "Edit", bash: "Bash" }[tool] || null;
}

function montarToolInput(tool, args) {
  args = args || {};
  if (tool === "write") return { file_path: args.filePath, content: args.content };
  if (tool === "edit") {
    return {
      file_path: args.filePath,
      old_string: args.oldString,
      new_string: args.newString,
      replace_all: !!args.replaceAll,
    };
  }
  if (tool === "bash") return { command: args.command };
  return {};
}

/**
 * @param {{directory?: string, worktree?: string}} ctx
 */
async function RunxPonte(ctx) {
  ctx = ctx || {};
  const cwd = ctx.worktree || ctx.directory || process.cwd();
  const harness = detectarHarness();

  function despachar(evento, matcher, payload) {
    const despachantePath = localizarDespachante(cwd);
    if (!despachantePath || !fs.existsSync(despachantePath)) {
      return { codigo: 0, stderr: "" }; // falha aberta: sem motor, sem verificacao
    }

    let args = [];
    if (!process.env.RUNX_PONTE_DESPACHANTE) {
      const hooksJson = lerHooksJson(despachantePath);
      const encontrados = grupoArgs(hooksJson, evento, matcher);
      if (!encontrados) return { codigo: 0, stderr: "" }; // grupo nao registrado
      args = encontrados;
    }

    let r;
    try {
      r = spawnSync("python3", [despachantePath, ...args], {
        input: JSON.stringify(payload),
        encoding: "utf8",
        timeout: 15000,
      });
    } catch (e) {
      return { codigo: 0, stderr: "" }; // falha aberta
    }
    const codigo = r.status == null ? 0 : r.status;
    return { codigo, stderr: r.stderr || "" };
  }

  return {
    "tool.execute.before": async (input, output) => {
      const toolName = traduzToolNome(input.tool);
      if (!toolName) return;

      const matcher = toolName === "Bash" ? "Bash" : "Write|Edit";
      const payload = {
        hook_event_name: "PreToolUse",
        session_id: input.sessionID,
        cwd,
        tool_name: toolName,
        tool_input: montarToolInput(input.tool, output.args),
      };

      const r = despachar("PreToolUse", matcher, payload);
      if (r.codigo === 2) {
        output.cancel = true;
        output.cancelReason = r.stderr;
        throw new Error(r.stderr || "bloqueado pelo runx");
      }
      if (r.stderr && r.stderr.trim()) {
        try {
          fs.writeFileSync(arquivoAviso(input.callID), r.stderr);
        } catch (e) {
          // guardar o aviso e' melhor esforco; nunca quebra o before por isso
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      const toolName = traduzToolNome(input.tool);
      if (toolName) {
        const matcher = toolName === "Bash" ? "Bash" : "Write|Edit";
        const args = input.args || {};
        const temExitCode =
          args.command != null && output.metadata && typeof output.metadata.exit === "number";
        const payload = {
          hook_event_name: "PostToolUse",
          session_id: input.sessionID,
          cwd,
          tool_name: toolName,
          tool_input: montarToolInput(input.tool, args),
          tool_response: temExitCode ? { exit_code: output.metadata.exit } : {},
        };
        despachar("PostToolUse", matcher, payload);
      }

      const arqAviso = arquivoAviso(input.callID);
      try {
        if (fs.existsSync(arqAviso)) {
          const aviso = fs.readFileSync(arqAviso, "utf8");
          output.output = String(output.output || "") + "\n\n" + aviso;
          fs.unlinkSync(arqAviso);
        }
      } catch (e) {
        // ler/apagar o aviso e' melhor esforco; nunca quebra o after por isso
      }
    },

    "shell.env": async (input, output) => {
      output.env = output.env || {};
      output.env.EXPX_HARNESS = harness;
      output.env.EXPX_SESSAO = harness + "@" + (input.sessionID || "sem-id");
    },
  };
}

module.exports = { RunxPonte };
