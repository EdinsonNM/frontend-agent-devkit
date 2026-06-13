# Close Feature

Cierra formalmente una feature. Sin este comando la feature no esta terminada.

Pasos obligatorios, en orden:

1. Ejecuta `node .agents/scripts/lint.mjs` sobre los archivos tocados. Si esta en rojo, no continues: corrige o documenta excepcion en `docs/architecture/decisions.md`.
2. Ejecuta los tests y validaciones del proyecto (`package.json`).
3. Verifica los criterios de aceptacion de `specs/<feature>/01-requirement.md`.
4. Completa `specs/<feature>/06-changes.md`: archivos tocados, decisiones tomadas, desviaciones del plan, deuda pendiente.
5. Registra decisiones nuevas en `specs/<feature>/05-decisions.md` y, si afectan al proyecto, en `docs/architecture/decisions.md`.
6. Actualiza docs afectadas (`docs/features/<feature>/`, `docs/log/changelog.md`).

Reporta: salida literal del lint, comandos ejecutados, criterios cumplidos y riesgos pendientes.
