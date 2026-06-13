# Analyze

Analiza en profundidad un area de codigo existente y persiste el resultado en `docs/analysis/<area>/`.

Usa el skill `frontend-analyze`.

Lee:

- `AGENTS.md`
- `docs/architecture/overview.md` y `boundaries.md`, si existen
- `arch-rules.json`, si existe
- codigo del area objetivo (solo lectura)

Produce:

```text
docs/analysis/<area>/00-executive-summary.md
docs/analysis/<area>/01-current-state.md
docs/analysis/<area>/02-architecture.md
docs/analysis/<area>/03-risks.md
```

Reglas:

- Ejecuta `node .agents/scripts/lint.mjs` sobre el area para medir deuda objetiva.
- No edites codigo ni propongas reestructura.
- Si el area ya tiene analisis, actualizalo; no dupliques.
- Cierra con hallazgos top 3 y siguiente paso (normalmente `/create-spec`).
