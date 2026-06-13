#!/usr/bin/env node
'use strict';

/**
 * check-architecture.mjs
 * Valida las reglas de dependencia de la clean architecture del wiki
 * (wiki/architecture/frontend-clean-architecture/dependency-rules.md)
 * de forma ejecutable, leyendo arch-rules.json en la raiz del proyecto.
 *
 * Uso:
 *   node check-architecture.mjs                      # escanea todas las capas
 *   node check-architecture.mjs src/domains/x.ts ... # solo archivos dados
 *
 * Exit codes: 0 ok | 1 violaciones
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, walkFiles, extractImports, relToRoot } from './lib-rules.mjs';

const ROOT = process.cwd();

function layerOf(relPath, layers) {
  for (const [name, prefix] of Object.entries(layers)) {
    const clean = prefix.replace(/\/$/, '');
    if (relPath === clean || relPath.startsWith(clean + '/')) return name;
  }
  return null;
}

function resolveImport(spec, fromFile, aliases) {
  // Alias del proyecto (ej: "@/": "src/")
  for (const [alias, target] of Object.entries(aliases || {})) {
    if (spec.startsWith(alias)) {
      return spec.replace(alias, target.replace(/\/$/, '') + '/').split('//').join('/');
    }
  }
  // Relativo
  if (spec.startsWith('.')) {
    const abs = path.resolve(path.dirname(fromFile), spec);
    return relToRoot(ROOT, abs);
  }
  // Paquete externo
  return { pkg: spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0] };
}

export function checkArchitecture(files, config) {
  const layers = config.layers || {};
  const rules = config.rules || [];
  const aliases = config.aliases || {};
  const violations = [];

  if (Object.keys(layers).length === 0) return violations;

  for (const file of files) {
    const rel = relToRoot(ROOT, file);
    const fromLayer = layerOf(rel, layers);
    if (!fromLayer) continue;

    const rule = rules.find((r) => r.from === fromLayer);
    if (!rule) continue;

    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    for (const spec of extractImports(content)) {
      const resolved = resolveImport(spec, file, aliases);

      // Paquete externo prohibido en esta capa (ej: react en domains)
      if (typeof resolved === 'object' && resolved.pkg) {
        if ((rule.denyImports || []).includes(resolved.pkg)) {
          violations.push({
            file: rel,
            type: 'package',
            detail: `importa "${resolved.pkg}" (prohibido en capa ${fromLayer})`
          });
        }
        continue;
      }

      // Import interno: verificar capa destino
      const toLayer = layerOf(resolved, layers);
      if (!toLayer || toLayer === fromLayer) continue;
      if ((rule.deny || []).includes(toLayer)) {
        violations.push({
          file: rel,
          type: 'layer',
          detail: `${fromLayer} -> ${toLayer} via "${spec}" (flujo prohibido)`
        });
      }
      if (rule.allow && !rule.allow.includes(toLayer)) {
        violations.push({
          file: rel,
          type: 'layer',
          detail: `${fromLayer} -> ${toLayer} via "${spec}" (no esta en la lista allow)`
        });
      }
    }
  }
  return violations;
}

function main() {
  const args = process.argv.slice(2);
  const config = loadConfig(ROOT);

  if (config.__missing) {
    console.log('check-architecture: sin arch-rules.json en la raiz; nada que validar.');
    console.log('Crea arch-rules.json (hay template en .agents/scripts/arch-rules.example.json).');
    process.exit(0);
  }

  let files;
  if (args.length > 0) {
    files = args.filter((f) => fs.existsSync(f) && fs.statSync(f).isFile());
  } else {
    const include = Object.values(config.layers || {});
    files = include.length > 0 ? walkFiles(ROOT, include) : [];
  }

  const violations = checkArchitecture(files, config);

  if (violations.length === 0) {
    console.log(`check-architecture: OK (${files.length} archivo(s) verificados)`);
    process.exit(0);
  }

  console.error(`check-architecture: ${violations.length} violacion(es) de arquitectura\n`);
  for (const v of violations) {
    console.error(`  ✗ ${v.file}`);
    console.error(`    ${v.detail}`);
  }
  console.error('\nRevisa wiki/architecture/frontend-clean-architecture/dependency-rules.md');
  console.error('Si es una excepcion legitima, documentala en docs/architecture/decisions.md y ajusta arch-rules.json.');
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
