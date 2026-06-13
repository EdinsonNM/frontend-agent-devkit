# Guia completa · frontend-agent-devkit

Documentacion extendida del kit. El [README raiz](../../README.md) resume el proposito con diagramas; aqui esta el detalle operativo.

---

## Por que existe

Sin reglas compartidas, los asistentes de codigo **improvisan**: recomiendan carpetas nuevas, contradicen decisiones ya tomadas o leen documentacion de mas o de menos. El kit da un **marco repetible**: contrato del repo (`AGENTS.md`), metodo en `wiki/`, catalogo operativo en `.agents/` y plantillas en `docs/`.

## Que no es

- Una libreria npm que se importa en tu bundle.
- Un generador de apps ni un framework de UI.
- Un sustituto de revisar codigo: **orienta**; tu sigues validando.

---

## Arquitectura frontend

El kit ancla el trabajo en una **arquitectura frontend explicita**. Detalle completo en la wiki:

| Tema | Documento |
|------|-----------|
| Hub de capas | [wiki/architecture/frontend-clean-architecture.md](../../wiki/architecture/frontend-clean-architecture.md) |
| Tabla de librerias (obligatoria al codificar) | [wiki/architecture/library-strategy.md](../../wiki/architecture/library-strategy.md) |
| Alinear sin reestructurar de mas | [wiki/delivery/architecture-alignment.md](../../wiki/delivery/architecture-alignment.md) |
| Estado real de tu repo | [docs/architecture/overview.md](../architecture/overview.md) |
| Excepciones documentadas | [docs/architecture/decisions.md](../architecture/decisions.md) |

### Regla rectora

**La wiki es el objetivo de alineacion** (salvo excepcion explicita del usuario en chat o en `docs/architecture/decisions.md`).

### Capas tipicas

| Area | Rol |
|------|-----|
| **presentation** | Componentes, paginas, layouts, hooks de UI |
| **domains / use cases** | Reglas y orquestacion testeable |
| **infra** | HTTP, adapters, mocks, mappers |
| **core** | Config, errores, logging, tipos compartidos |

---

## Orquestador

Rol definido en [`.agents/agents/orchestrator.md`](../../tools/agents-kit/agents/orchestrator.md) (copiado a tu proyecto tras `init`).

### Que hace

1. Entiende la intencion (feature, bug, refactor, QA, docs, discovery…).
2. Elige modo: **Spec Kit completo**, **Mini Spec** o **tarea directa**.
3. Define ruta de lectura minima en `wiki/`, `docs/` y `specs/`.
4. Protege la arquitectura: no delega reestructuras amplias sin alineacion.
5. Delega con contrato: ownership, archivos permitidos, validacion.

### Regla de uso

**Cada mensaje nuevo con intencion distinta** empieza con `/orquestador` + tu objetivo. No invoques agentes especializados directamente en un hilo nuevo.

### Plantilla recomendada

```text
/orquestador Necesito: <que quieres lograr>

Respuesta que espero:
- Tipo de tarea
- Modo de trabajo (Spec Kit / Mini Spec / directo) y por que
- Ruta de lectura minima
- Siguiente agente o skill del catalogo
- Como validar y riesgos
```

### Ejemplos listos

**Bug**

```text
/orquestador Quiero corregir un error: en perfil, Guardar no hace nada con errores de validacion. No se si es estado, submit o API.
```

**Feature grande**

```text
/orquestador Necesito recuperacion de contrasena: pantalla olvide, email con link, pantalla nueva contrasena, backend. Coordinar UI, flujo y seguridad.
```

**Discovery**

```text
/orquestador Necesito discovery del proyecto sin editar codigo. Resume stack, carpetas, scripts, riesgos y que actualizar en docs/.
```

**Refactor**

```text
/orquestador Sacar logica de precios del componente del carrito sin romper comportamiento. Respeta docs/architecture y dime si hace falta architecture-alignment.
```

Catalogo maestro: [`.agents/AGENTS-CATALOG.md`](../../tools/agents-kit/AGENTS-CATALOG.md).

---

## Instalacion

Requisito: **Node.js 18+**.

```bash
npx frontend-agent-devkit init
npx frontend-agent-devkit init --tool cursor
npx frontend-agent-devkit init --tool claude
npx frontend-agent-devkit init --tool codex
npx frontend-agent-devkit init --tool opencode
npx frontend-agent-devkit init --tool copilot
npx frontend-agent-devkit init --tool all
```

Comandos CLI:

```bash
frontend-agent-devkit init [--tool …] [--force]
frontend-agent-devkit setup --tool … [--force]
frontend-agent-devkit verify
frontend-agent-devkit help
```

Por defecto **no** sobrescribe archivos existentes; usa `--force` para refrescar plantillas.

### Que copia `setup`

| Herramienta | Destino |
|-------------|---------|
| Codex | `AGENTS.md`, `.agents/*`, `.codex/agents` |
| Cursor | `.cursor/rules`, `.cursor/commands`, `.cursor/skills`, `.cursor/agents` |
| Claude Code | `.claude/agents`, `.claude/skills`, `.claude/commands` |
| Antigravity | `.agent/rules`, `.agent/workflows`, `AGENTS.md`, `GEMINI.md` |
| OpenCode | `.opencode/agents`, `.opencode/skills`, `.opencode/commands` |
| Copilot | `.github/copilot-instructions.md`, `.github/agents`, `.github/skills` |

Verificacion esperada tras `verify`:

```text
20 subagentes · 12 skills · 8 comandos
```

Mas detalle: [docs/operations/setup.md](../operations/setup.md).

---

## Uso diario

### Discovery (primer uso)

Tras instalar, actualiza con la realidad del proyecto:

```text
docs/project-overview.md
docs/architecture/overview.md
docs/architecture/boundaries.md
docs/operations/scripts.md
```

### Prompts de referencia (tras clasificacion del orquestador)

| Objetivo | Prompt |
|----------|--------|
| Planificar feature | `Usa Solution Planner. Decide Spec Kit / Mini Spec / directo: …` |
| Crear spec | `Usa frontend-spec-kit y crea specs/<feature>/… No implementes aun.` |
| Implementar | `Usa Frontend Feature Agent. Implementa tasks aprobadas respetando AGENTS.md.` |
| Bug | `Usa Bug Triage Agent. Reproduce y propone fix minimo: …` |
| Arquitectura | `Usa Architecture Alignment Agent. …` |
| QA | `Usa QA Agent. Revisa tests, regresiones, a11y basica.` |
| Docs | `Usa Project Docs Agent. Actualiza docs/ segun cambios reales.` |

### Contexto gradual

1. `AGENTS.md`
2. `wiki/index.md`
3. Documento especifico segun la tarea
4. Archivos afectados

---

## Referencia rapida de documentos

```text
AGENTS.md
.agents/AGENTS-CATALOG.md
.agents/agents/orchestrator.md
wiki/index.md
wiki/delivery/feature-solution-plan.md
wiki/delivery/spec-driven-development.md
wiki/delivery/architecture-alignment.md
```

---

## Mantenedores del paquete

Publicacion npm: workflow **Publish npm** + skill [`.cursor/skills/npm-publish-release/SKILL.md`](../../.cursor/skills/npm-publish-release/SKILL.md).

El kit publicado vive en `tools/agents-kit/`; `.cursor/` es solo para desarrollar este repo.

Migracion desde `wiki-frontend`: mismo contenido; el CLI pasa a llamarse `frontend-agent-devkit`.
