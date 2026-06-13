# Diagramas del README

Diagramas editoriales en HTML + SVG, estilo [diagram-design](https://github.com/cathrynlavery/diagram-design) (skill incluida en `tools/agents-kit/skills/diagram-design/`).

| Archivo | Tipo | Contenido |
|---------|------|-----------|
| `01-kit-overview` | Architecture | Cuatro piezas del kit |
| `02-quickstart-flow` | Flowchart | Instalar → discovery → uso diario |
| `03-orchestrator` | Flowchart | Flujo del orquestador |
| `04-ide-adapters` | Architecture | init → .agents → adaptadores IDE |

## Regenerar PNG

```bash
npm install --no-save playwright
npx playwright install chromium
node docs/readme/diagrams/export-png.mjs
```

Abre cualquier `.html` en el navegador para previsualizar.
