# Specs Template

Flujo de feature (SDD). Las fases tienen gate humano: no avanzar sin aprobacion.

```text
specs/<feature-id>/
  00-summary.md        # resumen ejecutivo
  01-requirement.md    # requerimiento y criterios de aceptacion
  02-current-state.md  # estado actual (referencia docs/analysis si existe)
  03-plan.md           # plan de accion
  04-tasks.md          # tareas atomicas
  05-decisions.md      # decisiones tecnicas (ADRs del feature)
  06-changes.md        # se completa al cerrar con /close-feature
```

Orden: 00-04 antes de implementar (gate del usuario tras 01 y tras 03).
05 se alimenta durante la implementacion. 06 al cierre.

Si el area es desconocida: `/analyze` primero; 02-current-state.md referencia el resultado.

Compatibilidad: `spec.md`, `plan.md`, `tasks.md` del template anterior equivalen a 01, 03 y 04.
