'use strict';

/**
 * lib-rules.mjs
 * Utilidades compartidas por check-limits y check-architecture.
 * Sin dependencias externas (Node 18+).
 */

import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte'];

const DEFAULT_IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.turbo', 'out', '.agents'
]);

export function loadConfig(root) {
  const file = path.join(root, 'arch-rules.json');
  if (!fs.existsSync(file)) {
    return { __missing: true, fileLimits: { maxLines: 200 }, layers: {}, rules: [], aliases: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`arch-rules.json invalido: ${err.message}`);
    process.exit(1);
  }
}

export function relToRoot(root, file) {
  return path.relative(root, path.resolve(file)).split(path.sep).join('/');
}

/**
 * Matcher simple de patrones estilo glob reducido:
 * soporta "**" (cualquier ruta), "*" (cualquier segmento sin /) y sufijos de extension.
 * Suficiente para exclude/include sin traer dependencias.
 */
export function matchAny(relPath, patterns) {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((p) => toRegex(p).test(relPath));
}

const regexCache = new Map();
function toRegex(pattern) {
  if (regexCache.has(pattern)) return regexCache.get(pattern);
  let re = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§§')
    .replace(/\*/g, '[^/]*')
    .replace(/§§/g, '.*')
    .replace(/\\\{([^}]+)\\\}/g, (_, group) => `(${group.split(',').join('|')})`);
  const compiled = new RegExp(`^${re}$`);
  regexCache.set(pattern, compiled);
  return compiled;
}

/**
 * Recorre directorios y devuelve archivos con extensiones de codigo.
 * "include" acepta rutas de carpeta (src) o patrones (src/**\/*.tsx).
 */
export function walkFiles(root, include, extensions) {
  const exts = new Set(extensions || DEFAULT_EXTENSIONS);
  const results = [];
  const dirsToScan = [];
  const patterns = [];

  for (const entry of include) {
    const abs = path.join(root, entry);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
      dirsToScan.push(abs);
    } else {
      patterns.push(entry);
      const base = entry.split('*')[0].replace(/\/$/, '');
      const baseAbs = path.join(root, base || '.');
      if (fs.existsSync(baseAbs) && fs.statSync(baseAbs).isDirectory()) dirsToScan.push(baseAbs);
    }
  }
  if (dirsToScan.length === 0) dirsToScan.push(root);

  const seen = new Set();
  const visit = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith('.') && e.name !== '.') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (DEFAULT_IGNORED_DIRS.has(e.name)) continue;
        visit(full);
      } else if (exts.has(path.extname(e.name))) {
        const rel = relToRoot(root, full);
        if (patterns.length > 0 && !matchAny(rel, patterns)) continue;
        if (!seen.has(full)) {
          seen.add(full);
          results.push(full);
        }
      }
    }
  };

  for (const d of dirsToScan) visit(d);
  return results;
}

/** Extrae especificadores de import/require/dynamic import de un archivo. */
export function extractImports(content) {
  const specs = [];
  const patterns = [
    /import\s+[^'"]*?from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /export\s+[^'"]*?from\s+['"]([^'"]+)['"]/g,
    /require\(\s*['"]([^'"]+)['"]\s*\)/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(content)) !== null) specs.push(m[1]);
  }
  return specs;
}
