# frontend-agent-devkit

Kit npm para **organizar como trabajan los agentes de IA** en tu proyecto frontend (Cursor, Claude Code, Codex, Copilot…). Lo instalas en la **raiz del repo** — no se importa en tu bundle ni reemplaza tu codigo.

[![npm version](https://img.shields.io/npm/v/frontend-agent-devkit)](https://www.npmjs.com/package/frontend-agent-devkit)
[![license MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Motivacion

Este kit nacio de un problema que se repite en el dia a dia: al crear proyectos nuevos o trabajar en repos existentes — sobre todo con **React** — suelo usar la **misma arquitectura**, las **mismas librerias** y los **mismos skills** para agentes de IA. Sin un punto de partida comun, cada chat improvisa carpetas, dependencias y enfoque; la IA no sigue tu metodo y pierdes tiempo reconfigurando lo mismo en cada repo.

`frontend-agent-devkit` busca reducir esa friccion:

- **Un solo setup** — `init` deja listos agentes, skills, wiki y el contrato en `AGENTS.md`.
- **IA alineada con tu arquitectura** — capas, librerias acordadas y lectura gradual de contexto, no codigo a ciegas.
- **Skills reutilizables** en todos tus proyectos — el mismo catalogo donde trabajes.
- **Menos tiempo configurando, mas tiempo ensenando** — sobre todo con quienes estan aprendiendo: puedes centrarte en explicar el *por que* de la arquitectura en lugar de montar el entorno desde cero.
- **Orquestador como primer paso** — con `/orquestador` defines como abordar cada tarea (feature, bug, refactor…) antes de implementar.

La idea no es reemplazar tu criterio ni tu codigo: es que el agente **coordine** contigo y siga el mismo sistema en cada proyecto.

---

## Que hace

| Sin el kit | Con el kit |
|------------|------------|
| Cada chat improvisa carpetas y arquitectura | Reglas fijas en `AGENTS.md` + metodo en `wiki/` |
| El agente lee todo o inventa contexto | Lee **poco y en orden** (`AGENTS.md` → `wiki/` → `docs/`) |
| Tu pides "implementa X" y codifica a ciegas | **`/orquestador`** clasifica la tarea y elige el agente correcto |

**No es:** framework UI, generador de apps ni dependencia de runtime.  
**Si es:** plantillas + catalogo de agentes/skills/comandos que copias a tu repo.

![Cuatro piezas del kit](docs/readme/diagrams/01-kit-overview.png)

---

## Requisitos

- **Node.js 18+**
- Un proyecto frontend existente (o vacio) donde quieras usar agentes de IA
- Un IDE con agentes: Cursor, Claude Code, Codex, OpenCode, Copilot o Antigravity

---

## Instalacion

Abre una terminal en la **raiz de tu proyecto frontend** (donde esta `package.json` de tu app):

```bash
npx frontend-agent-devkit init --tool cursor
```

Sustituye `cursor` por tu herramienta:

| Herramienta | Comando |
|-------------|---------|
| **Cursor** | `npx frontend-agent-devkit init --tool cursor` |
| **Claude Code** | `npx frontend-agent-devkit init --tool claude` |
| **Codex** | `npx frontend-agent-devkit init --tool codex` |
| **GitHub Copilot** | `npx frontend-agent-devkit init --tool copilot` |
| **OpenCode** | `npx frontend-agent-devkit init --tool opencode` |
| **Antigravity** | `npx frontend-agent-devkit init --tool antigravity` |
| **Varias a la vez** | `npx frontend-agent-devkit init --tool all` |

Comprueba que todo se copio bien:

```bash
npx frontend-agent-devkit verify
```

Instalacion global (opcional):

```bash
npm install -g frontend-agent-devkit
frontend-agent-devkit init --tool cursor
```

### Que aparece en tu repo

```text
AGENTS.md          ← contrato: que lee el agente primero
wiki/              ← metodo (discovery, specs, arquitectura objetivo)
docs/              ← documentacion de TU proyecto (rellenar con discovery)
specs/             ← specs de features
.agents/           ← 20 agentes, 14 skills, 10 comandos
arch-rules.json    ← reglas ejecutables de capas (opcional configurar)
.cursor/ …         ← solo si usaste --tool cursor (igual para claude, codex, etc.)
```

Por defecto **no sobrescribe** archivos que ya existan. Para refrescar plantillas del kit:

```bash
npx frontend-agent-devkit init --force
npx frontend-agent-devkit setup --tool cursor --force
```

![init → .agents → tu IDE](docs/readme/diagrams/04-ide-adapters.png)

---

## Como usarlo

### 1. Primera vez — discovery (una sola sesion)

Despues de instalar, abre tu IDE y pega esto en el chat del agente:

```text
/orquestador Necesito discovery del proyecto sin editar codigo ni refactorizar.
Explora el repo y resume: stack, carpetas, scripts de package.json, integraciones y riesgos.
Indica que archivos de docs/ debo actualizar primero.
```

Con esa respuesta, rellena (tu o el agente) al menos:

```text
docs/project-overview.md
docs/architecture/overview.md
docs/architecture/boundaries.md
docs/operations/scripts.md
```

Asi, cuando pidas features o bugs, el agente **no inventa** como esta organizado tu proyecto.

### 2. Uso diario — siempre empieza con `/orquestador`

Ante **cada pedido nuevo** (feature, bug, refactor, QA, docs…), no pidas directamente "implementa" o "usa el bug agent". Primero:

```text
/orquestador Necesito: <describe en lenguaje normal lo que quieres>
```

El orquestador te responde con:

- tipo de tarea (feature, bug, discovery…)
- modo de trabajo: **Spec Kit**, **Mini Spec** o **tarea directa**
- que documentos leer
- **que agente o skill ejecutar despues** (en el mismo hilo)

![Flujo del orquestador](docs/readme/diagrams/03-orchestrator.png)

### 3. Ejemplos listos para copiar

**Bug**

```text
/orquestador El boton Guardar en perfil no hace nada cuando hay errores de validacion.
```

**Feature**

```text
/orquestador Necesito recuperacion de contrasena: pantalla olvide, email con link y pantalla nueva contrasena.
```

**Solo revisar antes de un PR**

```text
/orquestador Revisa tests faltantes, regresiones obvias y accesibilidad basica en esta rama.
```

**Documentacion desactualizada**

```text
/orquestador Actualizamos el API de pagos ayer. Alinea docs/ con el codigo real.
```

Cuando el orquestador te diga el siguiente paso, **ejecutalo en el mismo hilo**. Si cambias de objetivo, **nuevo mensaje** → otra vez `/orquestador`.

Mas plantillas: [docs/readme/GUIA.md#orquestador](docs/readme/GUIA.md#orquestador)

---

## Flujo completo (resumen)

![Instalar → discovery → orquestador → implementar](docs/readme/diagrams/02-quickstart-flow.png)

```text
1. npx frontend-agent-devkit init --tool <tu-ide>
2. /orquestador + discovery  →  rellenar docs/
3. /orquestador + tu tarea     →  agente especializado → codigo + validacion
```

---

## Comandos CLI

```bash
frontend-agent-devkit init [--tool cursor|claude|codex|…] [--force]
frontend-agent-devkit setup --tool … [--force]   # refresca adaptadores del IDE
frontend-agent-devkit verify                       # comprueba agentes, skills, comandos
frontend-agent-devkit lint [archivos…]             # guardrails de lineas y capas
frontend-agent-devkit help
```

Tras `init`, configura `arch-rules.json` en la raiz si quieres validar imports entre capas automaticamente. Plantilla: `tools/agents-kit/scripts/arch-rules.example.json`.

---

## Arquitectura frontend (opcional, para profundizar)

El kit encamina el codigo hacia **clean architecture frontend**. La wiki es el norte; `docs/architecture/` describe **tu** repo.

| Tema | Documento |
|------|-----------|
| Capas y dependencias | [wiki/architecture/frontend-clean-architecture.md](wiki/architecture/frontend-clean-architecture.md) |
| Librerias acordadas | [wiki/architecture/library-strategy.md](wiki/architecture/library-strategy.md) |
| Alinear legacy sin migracion masiva | [wiki/delivery/architecture-alignment.md](wiki/delivery/architecture-alignment.md) |
| Estado real de tu proyecto | [docs/architecture/overview.md](docs/architecture/overview.md) |

---

## Documentacion

| Necesitas | Enlace |
|-----------|--------|
| Guia completa (instalacion, prompts, referencia) | [docs/readme/GUIA.md](docs/readme/GUIA.md) |
| Setup detallado | [docs/operations/setup.md](docs/operations/setup.md) |
| Contrato para agentes | [AGENTS.md](AGENTS.md) |
| Catalogo de agentes y skills | [.agents/AGENTS-CATALOG.md](tools/agents-kit/AGENTS-CATALOG.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |

---

## Autor y contribuciones

**Desarrollador:** Edinson Nuñez More · [edi-developer.dev](https://edi-developer.dev)

| Contacto | |
|----------|--|
| Web | [edi-developer.dev](https://edi-developer.dev) |
| Email | [edi.developer.dev@gmail.com](mailto:edi.developer.dev@gmail.com) |
| Repo | [github.com/EdinsonNM/frontend-agent-devkit](https://github.com/EdinsonNM/frontend-agent-devkit) |

**Enviar cambios o sugerencias**

1. **Issues** — bug, idea o mejora en el [repositorio de GitHub](https://github.com/EdinsonNM/frontend-agent-devkit/issues).
2. **Pull requests** — fork, rama con tu cambio y PR contra `main` (describe el problema y la solucion).
3. **Email** — si prefieres contacto directo: [edi.developer.dev@gmail.com](mailto:edi.developer.dev@gmail.com).

Antes de un PR grande, abre un issue para alinear alcance. Para releases en npm, el mantenedor sube version en `package.json` + `CHANGELOG.md` en `main`; CI publica si la version es mayor que la del registry.

---

## Licencia

MIT · Diagramas con estilo [diagram-design](https://github.com/cathrynlavery/diagram-design).
