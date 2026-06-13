---
name: frontend-spec-kit
description: Crear y mantener specs completas para features frontend medianas o grandes con la estructura 00-06 (resumen ejecutivo, requerimiento, estado actual, plan de accion, tasks, decisiones, cambios). Usar al iniciar cualquier feature no trivial, cuando el usuario pida "crear spec", o cuando el orquestador elija modo Spec Kit.
---

# Frontend Spec Kit

## Read First

- `AGENTS.md`
- `wiki/delivery/spec-driven-development.md`
- `wiki/delivery/feature-solution-plan.md`
- `specs/README.md`
- `specs/_template/*`
- `docs/analysis/<area>/`, si existe para el area afectada

## Workflow

1. Confirmar que la tarea requiere Spec Kit completo.
2. **Si el area afectada no tiene analisis previo y no se conoce bien: detener y ejecutar el skill `frontend-analyze` primero.** El estado actual se referencia, no se inventa.
3. Crear `specs/<feature-id>/` desde el template, en orden:
   - `00-summary.md` — resumen ejecutivo.
   - `01-requirement.md` — requerimiento y criterios de aceptacion. **Gate: aprobacion del usuario.**
   - `02-current-state.md` — estado actual, referenciando `docs/analysis/<area>/` y la salida de `lint.mjs`.
   - `03-plan.md` — plan de accion. **Gate: aprobacion del usuario.**
   - `04-tasks.md` — tareas atomicas, cada una verificable en una sesion.
   - `05-decisions.md` — vacio o con decisiones ya tomadas.
4. Incluir estrategia de skills y subagentes si participaran varios agentes.
5. No implementar hasta que existan criterios de aceptacion, tasks claras y los dos gates aprobados.

## Do Not

- No crear specs para cambios triviales.
- No convertir la spec en documentacion decorativa.
- No implementar codigo dentro de este skill.
- No escribir 02-current-state.md desde suposiciones si el area es desconocida.
- No crear 06-changes.md al inicio; lo completa `/close-feature`.
