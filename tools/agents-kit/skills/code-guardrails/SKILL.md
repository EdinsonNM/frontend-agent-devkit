---
name: code-guardrails
description: Ejecuta los validadores deterministas del proyecto (limite de 200 lineas por archivo y reglas de dependencia de la clean architecture) y guia la correccion. Usar SIEMPRE antes de cerrar cualquier tarea de implementacion, refactor o bugfix; cuando un archivo crezca durante una edicion; cuando se muevan archivos o cambien imports; o cuando el orquestador pida la validacion final. Tambien usar si el usuario menciona limites de lineas, componentes grandes, violaciones de capas o "respeta la arquitectura".
---

# Code Guardrails

Las reglas de arquitectura del wiki son prosa; este skill las hace verificables. La fuente de verdad ejecutable es `arch-rules.json` en la raiz del proyecto.

## Read First

- `arch-rules.json` (raiz del proyecto; si no existe, ver Setup)
- `wiki/architecture/frontend-clean-architecture/dependency-rules.md`, solo si hay violaciones de capa

## Comandos

```bash
# Validacion completa (limite de lineas + arquitectura)
node .agents/scripts/lint.mjs

# Solo archivos tocados en la tarea
node .agents/scripts/lint.mjs src/presentation/foo.tsx src/infra/bar.ts

# Validadores individuales
node .agents/scripts/check-limits.mjs
node .agents/scripts/check-architecture.mjs
```

## Workflow

1. Ejecuta `node .agents/scripts/lint.mjs` con los archivos tocados (o sin args para escaneo completo).
2. Si sale OK, reporta la salida literal como evidencia de cierre.
3. Si hay violaciones de limite de lineas: extrae subcomponentes, hooks o helpers. Un archivo, una razon de cambio. Vuelve a ejecutar.
4. Si hay violaciones de arquitectura: corrige el import hacia el flujo permitido (presentation -> hooks -> use cases -> repositories). No muevas la regla para que pase el codigo.
5. Si la violacion es una excepcion legitima: pide confirmacion al usuario, documentala en `docs/architecture/decisions.md` y solo entonces ajusta `arch-rules.json`.

## Setup (primera vez en un proyecto)

1. Copia `.agents/scripts/arch-rules.example.json` a `arch-rules.json` en la raiz.
2. Ajusta `layers` y `aliases` a las carpetas reales del proyecto (usa las equivalencias de `docs/architecture/overview.md`).
3. Verifica con `node .agents/scripts/lint.mjs` y corrige falsos positivos en la config, no en el codigo.
4. Recomienda al usuario activar el hook de Claude Code (`.claude/settings.json`) y agregar `lint` al CI.

## Do Not

- No cerrar una tarea con lint en rojo sin excepcion documentada por el usuario.
- No editar `arch-rules.json` para silenciar una violacion sin decision explicita del usuario.
- No reemplazar la ejecucion del script por una revision manual "a ojo".
- No excluir archivos del limite de lineas como atajo; primero intenta dividir.
