# Implement Feature

Implementa la feature aprobada.

Antes de editar:

- Confirma que existe spec (specs/<feature>/01-requirement.md y 03-plan.md aprobados), Mini Spec o task directa.
- Lee `AGENTS.md` y `specs/<feature>/02-current-state.md`.
- Lee solo documentos relacionados con la feature.
- Revisa `git status` si el proyecto usa git.

Reglas:

- Trabaja task por task segun 04-tasks.md; marca cada checkbox al completar.
- Mantente dentro del ownership asignado.
- No reestructures areas fuera del scope.
- Reutiliza componentes, hooks y services existentes.
- Manten cada archivo bajo el limite de `arch-rules.json` (default 200 lineas); si un archivo va a superarlo, divide antes de continuar.
- Registra decisiones nuevas en `specs/<feature>/05-decisions.md` en el momento, no al final.
- Agrega tests proporcionales.

Validacion por task (no solo al final):

- `node .agents/scripts/lint.mjs <archivos tocados>` en verde.
- Validaciones relevantes del proyecto.

Al terminar todas las tasks, ejecuta `/close-feature`. Reporta archivos modificados, comandos ejecutados (con salida del lint literal) y riesgos pendientes.
