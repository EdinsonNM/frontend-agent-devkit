---
name: frontend-analyze
description: Analiza en profundidad un area de codigo existente (modulo, feature, dominio) y PERSISTE el analisis como documentos en docs/analysis/<area>/ (resumen ejecutivo, estado actual, arquitectura y decisiones inferidas, riesgos). Usar cuando se pida un feature sobre una arquitectura que no se conoce bien, antes de crear la spec de un feature que toca un area sin analisis previo, cuando el usuario pida "analizar el estado actual", entender codigo legacy, o documentar como funciona algo hoy. Distinto de frontend-discovery: discovery es onboarding global de solo lectura de docs; analyze lee codigo de un area y produce documentos persistentes.
---

# Frontend Analyze

Analisis brownfield por area. El resultado no es un mensaje en el chat: son documentos versionados que el Spec Kit referencia despues.

## Read First

- `AGENTS.md`
- `docs/architecture/overview.md` y `docs/architecture/boundaries.md`, si existen
- `arch-rules.json`, si existe
- `docs/analysis/<area>/`, si ya existe (actualizar, no duplicar)
- Codigo del area objetivo, de entrada hacia adentro: rutas/paginas -> hooks -> use cases -> services

## Workflow

1. Delimita el area con el usuario si es ambigua (carpeta, feature o dominio concreto).
2. Mapea modulos del area: archivos, responsabilidad de cada uno, tamano en lineas (`wc -l`).
3. Traza los flujos de datos principales: de donde entran los datos, donde se transforman, donde se renderizan.
4. Infiere la arquitectura real (no la deseada): capas presentes, equivalencias con la wiki, dependencias entrantes y salientes del area.
5. Ejecuta `node .agents/scripts/lint.mjs <archivos del area>` para obtener deuda objetiva (archivos sobre 200 lineas, violaciones de capas).
6. Identifica decisiones tecnicas implicitas en el codigo y la razon aparente de cada una.
7. Lista riesgos: que se romperia al tocar X, acoplamientos ocultos, falta de tests.
8. Escribe los documentos en `docs/analysis/<area>/` usando `docs/analysis/_template/`.
9. Genera el diagrama de arquitectura del area con el skill `diagram-design` (o Mermaid si no esta disponible).

## Output

```text
docs/analysis/<area>/
  00-executive-summary.md   # una pagina: que hace, salud, riesgos top
  01-current-state.md       # mapa de modulos, flujos de datos, deuda medida
  02-architecture.md        # capas reales, diagrama, decisiones inferidas
  03-risks.md               # riesgos y huecos de informacion
```

Cierra reportando: rutas creadas, hallazgos top 3 y siguiente paso recomendado (normalmente `/create-spec` referenciando este analisis).

## Do Not

- No edites codigo del proyecto; este skill es de solo lectura sobre `src`.
- No propongas reestructuras; eso es trabajo de `architecture-alignment`.
- No dejes el analisis solo en el chat: si no se escribieron los documentos, el skill no termino.
- No inventes razones de decisiones tecnicas; marca como "razon no clara" lo que no se pueda inferir.
- No analices todo el repo; manten el alcance en el area pedida.
