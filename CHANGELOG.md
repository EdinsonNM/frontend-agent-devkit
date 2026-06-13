# Changelog

Todos los cambios notables del paquete se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado [SemVer](https://semver.org/lang/es/).

## [Unreleased]

## [1.8.0] - 2026-06-13

### Added
- Guardrails ejecutables en `tools/agents-kit/scripts/`: `lint.mjs` (entrada unica), `check-limits.mjs` (limite de 200 lineas), `check-architecture.mjs` (reglas de dependencia), `lib-rules.mjs`. Sin dependencias, Node 18+.
- Comando `frontend-agent-devkit lint [archivos...]`.
- `arch-rules.json` en la raiz: contrato declarativo y ejecutable de la arquitectura (espejo de dependency-rules.md). Se distribuye e instala en el proyecto consumidor via `init`.
- `.claude/settings.json` con hook `PostToolUse` que valida tras cada Edit/Write (exit 2 devuelve el reporte al agente).
- Skill `code-guardrails`: envuelve los validadores.
- Skill `frontend-analyze` y comando `/analyze`: analisis brownfield persistente en `docs/analysis/<area>/`.
- Comando `/close-feature`: cierre formal con lint + tests + criterios + 06-changes.
- Templates de `docs/analysis/_template/`.
- Diagramas editoriales del README en `docs/readme/diagrams/` (HTML + PNG, estilo diagram-design).
- Guia extendida en `docs/readme/GUIA.md`.

### Changed
- README: seccion Autor y contribuciones (Edinson Nuñez More, contacto y como enviar cambios).
- `specs/_template/` migrado a estructura 00-06 (resumen ejecutivo, requerimiento, estado actual, plan, tasks, decisiones, cambios). `spec.md`/`plan.md`/`tasks.md` ahora son `01`/`03`/`04`.
- Orquestador: gate brownfield (analyze antes de feature sobre area desconocida) y gate de cierre (no cierra sin lint en verde).
- `frontend-spec-kit`, `create-spec`, `implement-feature`: alineados a la estructura 00-06 y a la validacion por task.
- README simplificado (~75% menos texto) con diagramas; detalle operativo movido a `docs/readme/GUIA.md`.

## [1.7.1] - 2026-05-07

### Changed

- Integraciones y discovery: backends propios o proveedores (BaaS, etc.) sin asumir uno fijo; `docs/integrations/api.md` como punto de referencia con tabla de fuentes (incluido esquema mixto); obligación de mantener docs al día en proyectos existentes y preguntar si falta información (`wiki/architecture/frontend-integration.md`, `wiki/delivery/project-discovery.md`, `wiki/delivery/architecture-alignment.md`, `docs/integrations/environment.md`, `AGENTS.md`, `integration-agent`).
- Réplicas coherentes en `demo/` donde aplica.

## [1.7.0] - 2026-05-07

### Added

- GitHub Copilot: réplica de agentes, skills y `AGENTS-CATALOG.md` bajo `.github/` para mejor indexación; ajustes en `bin/frontend-agent-devkit.js`, `setup-agent-tools` y documentación asociada.

### Changed

- Wiki de arquitectura: un solo arquetipo canónico; “escala” se limita a adopción incremental y migración; se eliminan variantes `app/features/shared` por tamaño de proyecto (`application-scales`, `simplification`, `project-organization`, `layers-and-structure`, hub e índice).

## [1.6.0] - 2026-05-07

### Added

- Soporte para **GitHub Copilot**: `init` / `setup --tool copilot` copian el adaptador a `.github/` (p. ej. `copilot-instructions.md`); fallback al kit empaquetado si falta en `.agents`.
- `scripts/setup-agent-tools.sh` y `install.sh`: herramientas `copilot` y `opencode`; `all` incluye ambas alineado con el CLI.

### Changed

- Documentación (`README`, comando `setup-agent-tools`, skill `agent-setup`, `wiki/delivery/tool-compatibility`) para Copilot y OpenCode en el script bash.

## [1.5.0] - 2026-05-04
## [1.4.0] - 2026-05-03

### Added

- Soporte para **OpenCode** en el CLI (`--tool opencode`). Genera la estructura `.opencode/agents`, `.opencode/skills` y `.opencode/commands`.
- Documentación para la herramienta OpenCode en el `README.md` y en `wiki/delivery/tool-compatibility.md`.

### Changed

- Se modificó el encabezado (frontmatter YAML) de todos los agentes en `tools/agents-kit/agents/` para incluir `mode: subagent`, `model: inherit`, `temperature: 0.1` y la lista de herramientas deshabilitadas (`write`, `edit`, `bash`), unificando el formato para el orquestador y los subagentes.
## [1.3.0] - 2026-05-02

### Added

- Skill `diagram-design` para generar diagramas HTML independientes.
- Agente `diagram-documentation-agent` modificado para usar el skill `diagram-design` y requerir la generación del archivo HTML resultante.

## [1.2.0] - 2026-05-02

### Added

- `init` / `setup`: si se omiten archivos por existir ya y no usaste `--force`, al final se muestra un recordatorio con el comando sugerido (incluye `--force`) para reemplazar por la copia del kit.

### Changed

- Wiki y `AGENTS.md`: alineación con la estrategia de librerías y arquitectura (`wiki/architecture/library-strategy.md` y documentos relacionados).

## [1.1.1] - 2026-05-02

### Fixed

- `init` / `setup`: si las carpetas destino ya existían (p. ej. `.agents`, `wiki`), se fusionan y se copian los archivos que faltan; antes se omitía todo el árbol. Los archivos ya existentes solo se sobrescriben con `--force`.

### Changed

- Documentación del secreto `NPM_TOKEN`: token granular npm con **Bypass 2FA** (Classic/Automation ya no aplican).

## [1.1.0] - 2026-05-02

### Changed

- Catálogo del kit en `tools/agents-kit/`; `init` y `install.sh` copian a `.agents/` en proyectos consumidores; CLI y `setup-agent-tools.sh` resuelven fuente desde ahí o desde `.agents`.
- `.claude/`, `.codex/` y `.agent/` dejan de versionarse; `.gitignore` las ignora; se regeneran con `setup --tool`.
- Cursor en este repo: reglas en `.cursor/rules` y skill `npm-publish-release`; no se duplica el kit publicado bajo `.cursor`.
- Publicación npm vía GitHub Actions: solo `npm publish` cuando `package.json` supera el registry; sin bump ni commits en CI. Skill de mantenedor: commits de trabajo primero, luego changelog y push.
- Documentación: `README`, `CLAUDE.md`, `STARTER-AUDIT`, `wiki/delivery/tool-compatibility.md`, plantilla `templates/cursor/rules/project-context.mdc`.
