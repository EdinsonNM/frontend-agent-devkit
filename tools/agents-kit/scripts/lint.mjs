#!/usr/bin/env node
'use strict';

/**
 * lint.mjs
 * Punto de entrada unico de los guardrails: limite de lineas + arquitectura.
 *
 * Uso:
 *   node .agents/scripts/lint.mjs                 # escaneo completo segun arch-rules.json
 *   node .agents/scripts/lint.mjs src/a.tsx ...   # solo archivos dados
 *   node .agents/scripts/lint.mjs --stdin-hook    # modo hook de Claude Code (PostToolUse)
 *
 * En modo hook lee el JSON del hook por stdin, extrae el archivo editado,
 * lo valida y, si hay violaciones, sale con codigo 2 para que Claude
 * reciba el reporte por stderr y corrija de inmediato.
 */

import fs from 'node:fs';
import { loadConfig, walkFiles, matchAny, relToRoot, DEFAULT_EXTENSIONS } from './lib-rules.mjs';
import { checkLimits, suggestFor } from './check-limits.mjs';
import { checkArchitecture } from './check-architecture.mjs';
import path from 'node:path';

const ROOT = process.cwd();

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function filesFromHookPayload(raw) {
  try {
    const payload = JSON.parse(raw);
    const input = payload.tool_input || {};
    const candidates = [input.file_path, input.path, input.notebook_path].filter(Boolean);
    if (Array.isArray(input.edits)) {
      for (const e of input.edits) if (e.file_path) candidates.push(e.file_path);
    }
    return [...new Set(candidates)];
  } catch {
    return [];
  }
}

function run(files, config, { hookMode }) {
  const codeFiles = files.filter((f) => {
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return false;
    return DEFAULT_EXTENSIONS.includes(path.extname(f));
  });
  if (codeFiles.length === 0) {
    if (!hookMode) console.log('lint: sin archivos de codigo que validar.');
    process.exit(0);
  }

  const limitViolations = checkLimits(codeFiles, config);
  const archViolations = config.__missing ? [] : checkArchitecture(codeFiles, config);
  const total = limitViolations.length + archViolations.length;

  if (total === 0) {
    if (!hookMode) console.log(`lint: OK (${codeFiles.length} archivo(s))`);
    process.exit(0);
  }

  const out = [];
  out.push(`devkit lint: ${total} violacion(es) — la tarea NO puede cerrarse en este estado.`);
  if (limitViolations.length > 0) {
    out.push('\n[limite de lineas]');
    for (const v of limitViolations) {
      out.push(`  ✗ ${v.file} — ${v.lines} lineas (max ${v.maxLines}). Sugerencia: ${suggestFor(v.file)}`);
    }
  }
  if (archViolations.length > 0) {
    out.push('\n[arquitectura]');
    for (const v of archViolations) {
      out.push(`  ✗ ${v.file} — ${v.detail}`);
    }
    out.push('  Referencia: wiki/architecture/frontend-clean-architecture/dependency-rules.md');
  }
  out.push('\nCorrige las violaciones o documenta la excepcion en docs/architecture/decisions.md antes de continuar.');

  console.error(out.join('\n'));
  // Exit 2 en modo hook: Claude Code muestra stderr al agente para que corrija.
  process.exit(hookMode ? 2 : 1);
}

function main() {
  const args = process.argv.slice(2);
  const config = loadConfig(ROOT);
  const hookMode = args.includes('--stdin-hook');

  if (hookMode) {
    const files = filesFromHookPayload(readStdin());
    if (files.length === 0) process.exit(0);
    run(files, config, { hookMode: true });
    return;
  }

  const fileArgs = args.filter((a) => !a.startsWith('--'));
  if (fileArgs.length > 0) {
    run(fileArgs, config, { hookMode: false });
    return;
  }

  const include =
    (config.fileLimits && config.fileLimits.include) ||
    (Object.keys(config.layers || {}).length > 0 ? Object.values(config.layers) : ['src']);
  const files = walkFiles(ROOT, include, config.fileLimits?.extensions).filter(
    (f) => !matchAny(relToRoot(ROOT, f), config.fileLimits?.exclude || [])
  );
  run(files, config, { hookMode: false });
}

main();
