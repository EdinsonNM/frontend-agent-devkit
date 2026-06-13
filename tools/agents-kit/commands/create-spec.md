# Create Spec

Crea una spec para una feature mediana o grande.

Lee:

- `AGENTS.md`
- `wiki/delivery/spec-driven-development.md`
- `wiki/delivery/feature-solution-plan.md`
- `specs/_template/*`
- `docs/analysis/<area>/`, si existe (obligatorio referenciarlo en 02-current-state.md)
- docs/features relacionados si existen

Si el feature toca un area sin analisis y que no conoces: detente y ejecuta `/analyze` primero.

Crea o actualiza:

```text
specs/<feature-id>/00-summary.md
specs/<feature-id>/01-requirement.md
specs/<feature-id>/02-current-state.md
specs/<feature-id>/03-plan.md
specs/<feature-id>/04-tasks.md
specs/<feature-id>/05-decisions.md   (vacio o con decisiones ya tomadas)
```

Gates: pide aprobacion del usuario tras 01-requirement.md y tras 03-plan.md.
No implementes codigo. No crees 06-changes.md todavia (se completa con /close-feature).
