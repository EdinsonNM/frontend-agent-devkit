# Mejoras frontend-agent-devkit — guardrails ejecutables + flujo analyze

Paquete de mejoras para `frontend-agent-devkit@1.7.1`. Todo sigue las convenciones del kit (espanol sin tildes, mismas rutas, mismos formatos de agentes/skills/comandos).

## Que incluye

```text
tools/agents-kit/scripts/          # NUEVO: validadores ejecutables (Node 18+, cero dependencias)
  lint.mjs                         # entrada unica: lineas + arquitectura; modo --stdin-hook para Claude Code
  check-limits.mjs                 # limite de lineas (default 200)
  check-architecture.mjs           # reglas de dependencia entre capas
  lib-rules.mjs                    # utilidades compartidas
  arch-rules.example.json          # template de configuracion

arch-rules.json                    # NUEVO: contrato ejecutable (copiar a la raiz del proyecto destino)
.claude/settings.json              # NUEVO: hook PostToolUse (validacion automatica tras cada Edit/Write)

tools/agents-kit/skills/
  code-guardrails/SKILL.md         # NUEVO: skill que envuelve los validadores
  frontend-analyze/SKILL.md        # NUEVO: analisis brownfield persistente por area
  frontend-spec-kit/SKILL.md       # ACTUALIZADO: estructura 00-06 + gate brownfield

tools/agents-kit/commands/
  analyze.md                       # NUEVO: /analyze
  close-feature.md                 # NUEVO: /close-feature (cierre formal con lint + 06-changes)
  create-spec.md                   # ACTUALIZADO: estructura 00-06, gates de aprobacion
  implement-feature.md             # ACTUALIZADO: lint por task, decisiones en caliente

tools/agents-kit/agents/
  orchestrator.md                  # ACTUALIZADO: gate brownfield (paso 2) + gate de cierre (paso 10)

specs/_template/                   # ACTUALIZADO: 00-summary, 01-requirement, 02-current-state,
                                   # 03-plan, 04-tasks, 05-decisions, 06-changes + README
docs/analysis/_template/           # NUEVO: templates del flujo /analyze
```

## Instalacion en tu repo

1. Copia las carpetas respetando rutas (los `_template` reemplazan los actuales; `spec.md/plan.md/tasks.md` viejos equivalen a 01/03/04).
2. Registra el comando `lint` en `bin/frontend-agent-devkit.js`:

```js
// en main(), junto a init/setup/verify:
if (command === 'lint') {
  const { spawnSync } = require('child_process');
  const script = path.join(CWD, '.agents', 'scripts', 'lint.mjs');
  const local = fs.existsSync(script) ? script : path.join(TOOLS_AGENTS_KIT, 'scripts', 'lint.mjs');
  const res = spawnSync('node', [local, ...args._.slice(1)], { stdio: 'inherit', cwd: CWD });
  process.exit(res.status || 0);
}
```

3. Agrega `"lint": "node bin/frontend-agent-devkit.js lint"` a los scripts del package.json del kit.
4. Sube version (cambio de templates = minor) y publica.

## Setup en un proyecto consumidor

1. `npx frontend-agent-devkit init --tool claude` (copia `.agents/` incluidos los scripts).
2. Copia `arch-rules.example.json` a la raiz como `arch-rules.json` y ajusta `layers` y `aliases` a las carpetas reales.
3. Fusiona el bloque `hooks` de `.claude/settings.json` con el settings del proyecto.
4. Verifica: `node .agents/scripts/lint.mjs`.
5. Opcional: agrega el mismo comando al CI y a un pre-commit.

## Como queda el sistema completo

- **Hook PostToolUse**: cada Edit/Write dispara `lint.mjs --stdin-hook`; si hay violacion, Claude recibe el reporte por stderr (exit 2) y corrige en el momento. La regla de 200 lineas y las capas dejan de depender de la memoria del agente.
- **Orquestador**: paso 2 (gate brownfield) manda a `/analyze` antes de especificar features sobre areas desconocidas; paso 10 (gate de cierre) rechaza cualquier cierre sin salida literal del lint en verde.
- **Flujo feature**: `/create-spec` (00-04, con gates humanos tras 01 y 03) -> `/implement-feature` (task por task, lint por task, decisiones a 05) -> `/close-feature` (lint + tests + criterios + 06-changes).
- **Flujo brownfield**: `/analyze <area>` -> `docs/analysis/<area>/` (resumen ejecutivo, estado actual, arquitectura/decisiones inferidas, riesgos) -> las specs lo referencian desde `02-current-state.md`.
- **Excepciones**: nunca se silencian en `arch-rules.json` directamente; primero decision del usuario en `docs/architecture/decisions.md`.

## Validado

Probado contra un proyecto de ejemplo: detecta archivo de 251 lineas, import de `react` en `domains`, e import `domains -> presentation` via alias `@/`; pasa archivos limpios; el modo hook extrae `file_path` del payload de Claude Code y sale con codigo 2; sin `arch-rules.json` no bloquea (reporta como configurarlo).
