#!/usr/bin/env node
'use strict';

/**
 * check-limits.mjs
 * Valida que ningun archivo de codigo supere el limite de lineas (default: 200).
 * Configuracion: arch-rules.json en la raiz del proyecto (seccion "fileLimits").
 *
 * Uso:
 *   node check-limits.mjs                      # escanea segun config
 *   node check-limits.mjs src/a.tsx src/b.ts   # solo archivos dados
 *
 * Exit codes: 0 ok | 1 violaciones | 0 si no hay config ni archivos (no bloquea)
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, walkFiles, matchAny, relToRoot } from './lib-rules.mjs';

const ROOT = process.cwd();

export function checkLimits(files, config) {
  const limits = config.fileLimits || {};
  const maxLines = Number(limits.maxLines) || 200;
  const exclude = limits.exclude || [];
  const violations = [];

  for (const file of files) {
    const rel = relToRoot(ROOT, file);
    if (matchAny(rel, exclude)) continue;
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const lines = content.split('\n').length;
    if (lines > maxLines) {
      violations.push({ file: rel, lines, maxLines });
    }
  }
  return violations;
}

export function suggestFor(file) {
  const ext = path.extname(file);
  if (ext === '.tsx' || ext === '.jsx') {
    return 'extraer subcomponentes, mover logica a un hook (use-*.ts) o helpers puros';
  }
  if (file.includes('hook') || /use-[a-z-]+\.(t|j)s$/.test(file)) {
    return 'dividir en hooks mas pequenos o extraer logica pura a utils del dominio';
  }
  return 'dividir por responsabilidad: un archivo, una razon de cambio';
}

function main() {
  const args = process.argv.slice(2);
  const config = loadConfig(ROOT);
  let files;

  if (args.length > 0) {
    files = args.filter((f) => fs.existsSync(f) && fs.statSync(f).isFile());
  } else {
    const include = (config.fileLimits && config.fileLimits.include) || ['src'];
    files = walkFiles(ROOT, include, config.fileLimits?.extensions);
  }

  const violations = checkLimits(files, config);

  if (violations.length === 0) {
    console.log(`check-limits: OK (${files.length} archivo(s), limite ${config.fileLimits?.maxLines || 200} lineas)`);
    process.exit(0);
  }

  console.error(`check-limits: ${violations.length} violacion(es) de limite de lineas\n`);
  for (const v of violations) {
    console.error(`  ✗ ${v.file} — ${v.lines} lineas (max ${v.maxLines})`);
    console.error(`    sugerencia: ${suggestFor(v.file)}`);
  }
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
