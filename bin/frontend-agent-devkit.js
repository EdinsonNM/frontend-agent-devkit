#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CWD = process.cwd();
const VALID_TOOLS = new Set(['codex', 'cursor', 'claude', 'claude-code', 'antigravity', 'opencode', 'copilot', 'all']);

const TOOLS_AGENTS_KIT = path.join(ROOT, 'tools', 'agents-kit');

const STARTER_ENTRIES = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'README.md',
  'STARTER-AUDIT.md',
  'arch-rules.json',
  '.claude',
  'docs',
  'install.sh',
  'scripts',
  'specs',
  'templates',
  'wiki'
];

function usage() {
  console.log(`frontend-agent-devkit

Usage:
  frontend-agent-devkit init [--tool codex|cursor|claude|antigravity|opencode|copilot|all] [--force]
  frontend-agent-devkit setup --tool codex|cursor|claude|antigravity|opencode|copilot|all [--force]
  frontend-agent-devkit verify
  frontend-agent-devkit lint [archivos...]
  frontend-agent-devkit help

Examples:
  npx frontend-agent-devkit init --tool cursor
  frontend-agent-devkit setup --tool claude
  frontend-agent-devkit verify
  frontend-agent-devkit lint
  frontend-agent-devkit lint src/presentation/foo.tsx

El comando lint corre los guardrails (limite de lineas + arquitectura) usando
arch-rules.json de la raiz del proyecto. Requiere haber ejecutado init/setup antes.

Sin --force: las carpetas existentes se fusionan (se copian archivos que faltan); los archivos que ya existen no se sobrescriben. Con --force también se sobrescriben archivos.

Si hubo archivos omitidos, al finalizar verás un recordatorio con el comando sugerido usando --force.
`);
}

function printForceHintIfNeeded(options, command) {
  if (options.force) return;
  const n = options.skippedExisting;
  if (typeof n !== 'number' || n < 1) return;

  const tool = options.tool ? ` --tool ${options.tool}` : '';
  const base = `frontend-agent-devkit ${command}${tool} --force`;
  console.log('');
  console.log(
    `Nota: se omitieron ${n} archivo(s) que ya existían en el proyecto. ` +
      'Para reemplazarlos por la copia del kit (útil tras actualizar el paquete), ejecuta de nuevo:'
  );
  console.log(`  npx ${base}`);
  console.log('(Si tienes el CLI global: el mismo comando sin npx.)');
}

function parseArgs(argv) {
  const args = { _: [], tool: '', force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--tool') {
      args.tool = argv[i + 1] || '';
      i += 1;
    } else if (arg.startsWith('--tool=')) {
      args.tool = arg.slice('--tool='.length);
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '-h' || arg === '--help') {
      args._.push('help');
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(target) {
  return fs.existsSync(target);
}

function hasToolsAgentsKitAt(cwd) {
  return exists(path.join(cwd, 'tools', 'agents-kit', 'AGENTS-CATALOG.md'));
}

function agentsSourceForSetup() {
  const dot = path.join(CWD, '.agents');
  if (exists(path.join(dot, 'AGENTS-CATALOG.md'))) return dot;
  const localKit = path.join(CWD, 'tools', 'agents-kit');
  if (exists(path.join(localKit, 'AGENTS-CATALOG.md'))) return localKit;
  return dot;
}

function resolveAgentsRootForVerify() {
  const dot = path.join(CWD, '.agents');
  if (exists(path.join(dot, 'AGENTS-CATALOG.md'))) return dot;
  const localKit = path.join(CWD, 'tools', 'agents-kit');
  if (exists(path.join(localKit, 'AGENTS-CATALOG.md'))) return localKit;
  return dot;
}

function copyPath(src, dest, options = {}) {
  const force = Boolean(options.force);
  const label = path.relative(CWD, dest) || path.basename(dest);

  if (!exists(src)) return;

  const statSrc = fs.statSync(src);

  // Carpetas: fusionar siempre (añadir hijos que falten). No saltar la carpeta entera si ya existe.
  if (statSrc.isDirectory()) {
    ensureDir(dest);
    for (const child of fs.readdirSync(src)) {
      if (child === '.git' || child === 'node_modules') continue;
      copyPath(path.join(src, child), path.join(dest, child), options);
    }
    return;
  }

  // Archivos: no sobrescribir si ya existe salvo --force
  if (exists(dest) && !force) {
    console.log(`skip existing: ${label}`);
    if (typeof options.skippedExisting === 'number') {
      options.skippedExisting += 1;
    }
    return;
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`installed: ${label}`);
}

function copyDirFiles(srcDir, destDir, options = {}) {
  if (!exists(srcDir)) return;
  ensureDir(destDir);
  for (const child of fs.readdirSync(srcDir)) {
    copyPath(path.join(srcDir, child), path.join(destDir, child), options);
  }
}

function validateTool(tool, required = false) {
  if (!tool && !required) return;
  if (!tool || !VALID_TOOLS.has(tool)) {
    console.error(`Invalid --tool value: ${tool || '(missing)'}`);
    process.exit(1);
  }
}

function init(options) {
  if (!exists(path.join(TOOLS_AGENTS_KIT, 'AGENTS-CATALOG.md'))) {
    console.error('Missing tools/agents-kit in this package. Reinstall frontend-agent-devkit.');
    process.exit(1);
  }

  copyPath(TOOLS_AGENTS_KIT, path.join(CWD, '.agents'), options);

  for (const entry of STARTER_ENTRIES) {
    copyPath(path.join(ROOT, entry), path.join(CWD, entry), options);
  }

  if (options.tool) {
    setup(options.tool, options);
  }

  console.log('frontend-agent-devkit starter installed.');
  console.log('Next: ask your agent to read AGENTS.md and run discovery.');
}

function setup(tool, options) {
  validateTool(tool, true);

  if (tool === 'all') {
    setup('codex', options);
    setup('cursor', options);
    setup('claude', options);
    setup('antigravity', options);
    setup('opencode', options);
    setup('copilot', options);
    return;
  }

  if (tool === 'claude-code') {
    setup('claude', options);
    return;
  }

  const src = agentsSourceForSetup();

  if (tool === 'copilot') {
    console.log('== GitHub Copilot ==');
    const primary = path.join(src, 'github-copilot', '.github');
    const bundled = path.join(ROOT, 'tools', 'agents-kit', 'github-copilot', '.github');
    const copilotGithub = exists(primary) ? primary : bundled;
    copyDirFiles(copilotGithub, path.join(CWD, '.github'), options);
    if (!exists(copilotGithub)) {
      console.warn(
        'warn: no se encontró github-copilot/.github en .agents ni en el paquete. Ejecuta init o instala la última versión del CLI.'
      );
    }
    // Copilot no define rutas tipo .claude/skills; replicamos catálogo bajo .github/ como contexto indexable (convive con workflows).
    copyDirFiles(path.join(src, 'agents'), path.join(CWD, '.github', 'agents'), options);
    copyDirFiles(path.join(src, 'skills'), path.join(CWD, '.github', 'skills'), options);
    copyPath(path.join(src, 'AGENTS-CATALOG.md'), path.join(CWD, '.github', 'AGENTS-CATALOG.md'), options);
    console.log('ready: .github/copilot-instructions.md, .github/agents, .github/skills, AGENTS-CATALOG.md');
    return;
  }

  if (tool === 'codex') {
    console.log('== Codex ==');
    ensureDir(path.join(CWD, '.agents', 'skills'));
    ensureDir(path.join(CWD, '.agents', 'commands'));
    ensureDir(path.join(CWD, '.agents', 'agents'));
    console.log('ready: .agents/skills');
    console.log('ready: .agents/commands');
    console.log('ready: .agents/agents');
    copyDirFiles(path.join(src, 'agents'), path.join(CWD, '.codex', 'agents'), options);
    console.log('ready: .codex/agents');
    return;
  }

  if (tool === 'cursor') {
    console.log('== Cursor ==');
    copyDirFiles(path.join(CWD, 'templates', 'cursor', 'rules'), path.join(CWD, '.cursor', 'rules'), options);
    if (hasToolsAgentsKitAt(CWD)) {
      console.log('frontend-agent-devkit repo: solo reglas en .cursor; el kit publicado está en tools/agents-kit (no se copia catalogo a .cursor).');
      return;
    }
    copyDirFiles(path.join(src, 'commands'), path.join(CWD, '.cursor', 'commands'), options);
    copyDirFiles(path.join(src, 'skills'), path.join(CWD, '.cursor', 'skills'), options);
    copyDirFiles(path.join(src, 'agents'), path.join(CWD, '.cursor', 'agents'), options);
    copyPath(path.join(src, 'AGENTS-CATALOG.md'), path.join(CWD, '.cursor', 'AGENTS-CATALOG.md'), options);
    console.log('ready: .cursor/agents');
    console.log('note: Cursor Project Rules live in .cursor/rules.');
    console.log('note: .cursor/skills support may depend on your Cursor version; rules and commands are the stable path.');
    return;
  }

  if (tool === 'claude') {
    console.log('== Claude Code ==');
    copyPath(path.join(CWD, 'CLAUDE.md'), path.join(CWD, 'CLAUDE.md'), options);
    copyDirFiles(path.join(src, 'agents'), path.join(CWD, '.claude', 'agents'), options);
    copyDirFiles(path.join(src, 'skills'), path.join(CWD, '.claude', 'skills'), options);
    copyDirFiles(path.join(src, 'commands'), path.join(CWD, '.claude', 'commands'), options);
    copyPath(path.join(src, 'AGENTS-CATALOG.md'), path.join(CWD, '.claude', 'AGENTS-CATALOG.md'), options);
    console.log('ready: .claude/agents');
    console.log('ready: .claude/skills');
    console.log('ready: .claude/commands');
    return;
  }

  if (tool === 'antigravity') {
    console.log('== Antigravity ==');
    copyPath(path.join(CWD, 'GEMINI.md'), path.join(CWD, 'GEMINI.md'), options);
    copyDirFiles(path.join(CWD, 'templates', 'antigravity', 'rules'), path.join(CWD, '.agent', 'rules'), options);
    copyDirFiles(path.join(src, 'commands'), path.join(CWD, '.agent', 'workflows'), options);
    copyPath(path.join(src, 'AGENTS-CATALOG.md'), path.join(CWD, '.agent', 'AGENTS-CATALOG.md'), options);
    console.log('note: Antigravity paths can vary by version. Verify .agent/rules and .agent/workflows in the IDE.');
  }

  if (tool === 'opencode') {
    console.log('== OpenCode ==');
    copyDirFiles(path.join(src, 'agents'), path.join(CWD, '.opencode', 'agents'), options);
    copyDirFiles(path.join(src, 'skills'), path.join(CWD, '.opencode', 'skills'), options);
    copyDirFiles(path.join(src, 'commands'), path.join(CWD, '.opencode', 'commands'), options);
    copyPath(path.join(src, 'AGENTS-CATALOG.md'), path.join(CWD, '.opencode', 'AGENTS-CATALOG.md'), options);
    console.log('ready: .opencode/agents');
    console.log('ready: .opencode/skills');
    console.log('ready: .opencode/commands');
  }
}

function countFiles(dir, predicate) {
  if (!exists(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath, predicate);
    } else if (predicate(fullPath)) {
      count += 1;
    }
  }
  return count;
}

function verify() {
  const agentsRoot = resolveAgentsRootForVerify();
  const catalogPath = path.join(agentsRoot, 'AGENTS-CATALOG.md');
  const checks = [
    ['AGENTS.md', exists(path.join(CWD, 'AGENTS.md'))],
    ['wiki/index.md', exists(path.join(CWD, 'wiki', 'index.md'))],
    ['agents kit catalog', exists(catalogPath)]
  ];

  let ok = true;
  for (const [label, pass] of checks) {
    console.log(`${pass ? 'ok' : 'missing'}: ${label}`);
    ok = ok && pass;
  }

  const agents = countFiles(path.join(agentsRoot, 'agents'), file => file.endsWith('.md'));
  const skills = countFiles(path.join(agentsRoot, 'skills'), file => path.basename(file) === 'SKILL.md');
  const commands = countFiles(path.join(agentsRoot, 'commands'), file => file.endsWith('.md'));

  console.log(`agents: ${agents} / 20`);
  console.log(`skills: ${skills} / 14`);
  console.log(`commands: ${commands} / 10`);

  ok = ok && agents === 20 && skills === 14 && commands === 10;

  if (!ok) {
    process.exitCode = 1;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'help';

  if (command === 'help') {
    usage();
    return;
  }

  if (command === 'init') {
    validateTool(args.tool, false);
    args.skippedExisting = 0;
    init(args);
    printForceHintIfNeeded(args, 'init');
    return;
  }

  if (command === 'setup') {
    validateTool(args.tool, true);
    args.skippedExisting = 0;
    setup(args.tool, args);
    printForceHintIfNeeded(args, 'setup');
    return;
  }

  if (command === 'verify') {
    verify();
    return;
  }

  if (command === 'lint') {
    const { spawnSync } = require('child_process');
    const localScript = path.join(CWD, '.agents', 'scripts', 'lint.mjs');
    const script = fs.existsSync(localScript)
      ? localScript
      : path.join(TOOLS_AGENTS_KIT, 'scripts', 'lint.mjs');
    const rest = args._.slice(1);
    const res = spawnSync('node', [script, ...rest], { stdio: 'inherit', cwd: CWD });
    process.exit(res.status == null ? 1 : res.status);
  }

  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(1);
}

main();
