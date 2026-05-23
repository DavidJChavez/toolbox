# Toolbox — Agent Guide

Colección de utilidades para developers que corre **100% en el navegador**. Cada herramienta resuelve micro-tareas de debugging (decodificar Base64, validar JSON, decodificar JWT, etc.) en una sola UI consistente.

Lee este archivo **antes** de explorar el código. Para el roadmap por fases consulta [`README.md`](README.md).

## Stack

- **SvelteKit** + **Svelte 5** (runes: `$state`, `$derived`, `$derived.by`, `$props`, `$effect`)
- **shadcn-svelte** (preset `b6rt8ttCM`, tema `mist`) — componentes en `src/lib/components/ui/`
- **Tailwind CSS 4**
- **TypeScript** estricto
- **Bun** como package manager (no usar `npm` / `pnpm`)
- **Vitest** para tests, **Prettier** + **ESLint** para lint

## Reglas duras (no negociables)

1. **100% shadcn-svelte sin modificar.** No edites archivos dentro de `src/lib/components/ui/`. Si necesitas un patrón nuevo, compón con primitivos existentes (`Card`, `Tabs`, `Select`, `Table`, `ScrollArea`, etc.).
2. **Íconos solo desde `@lucide/svelte`.** Import por archivo: `import KeyRoundIcon from '@lucide/svelte/icons/key-round';`.
3. **Svelte 5 runes únicamente.** Nada de `let` reactivo legacy, ni stores `writable/readable` salvo que ya estén en el proyecto.
4. **Lógica pura separada de UI.** Toda la lógica de una tool vive en `tool.ts`, no inline en el `.svelte`.
5. **No introducir librerías de UI alternativas** (nada de DaisyUI, Flowbite, Skeleton, etc.). El estilo lo da shadcn + Tailwind.
6. **Idioma**: copy de la UI en inglés, comentarios y respuestas al usuario en español.

## Arquitectura de tools

Cada herramienta sigue exactamente este patrón:

```
src/lib/tools/<id>/tool.ts          → funciones puras exportadas (reutilizables en futuro dataflow)
src/lib/tools/<id>/<Id>Tool.svelte  → UI con <ToolShell> + shadcn-svelte
src/lib/tools/registry.ts           → fuente única de verdad (sidebar, command palette, dashboard)
src/routes/(app)/tools/<id>/+page.svelte → wrapper de 9 líneas que importa el componente
```

`registry.ts` alimenta automáticamente sidebar, command palette (`⌘K`) y dashboard. **No** hardcodees menús en otros archivos.

`ToolShell` (en `src/lib/components/tool-shell/`) provee el header común (icono, nombre, descripción, badges, botón Clear). Cada `*Tool.svelte` envuelve su contenido en `<ToolShell {tool} onClear={clearAll}>`.

Convenciones internas:

- Lógica síncrona → `$derived(funcionPura(input))`.
- Lógica async (Web Crypto, fetch) → `$effect` con flag `cancelled` o función `async` en el handler. Evita asignar dentro de `$effect` si puedes usar `$derived.by`.
- Errores se devuelven en el resultado (`{ result, error? }`), no se lanzan, salvo en cómputos triviales que el componente atrapa con try/catch dentro de `$derived.by`.
- Tipos compartidos en `src/lib/tools/types.ts` (`ToolDefinition`, `ToolCategory`, `NodeSpec`). El campo opcional `run()` y `node` están reservados para Fase 4 (dataflow editor).

## Cómo agregar una tool nueva

1. Crear `src/lib/tools/<id>/tool.ts` con funciones puras exportadas (con tipos explícitos).
2. Crear `src/lib/tools/<id>/<Id>Tool.svelte` con `<ToolShell>` + componentes shadcn.
3. Registrar la tool en `src/lib/tools/registry.ts` (icono Lucide, `category`, `keywords`, `node` con `inputs`/`outputs`).
4. Crear ruta en `src/routes/(app)/tools/<id>/+page.svelte` (wrapper mínimo).
5. Marcar el item en el roadmap del `README.md`.
6. Correr `bun run check && bun run lint`.

El sidebar, command palette y dashboard se actualizan solos.

## Estado actual

Tools en producción: **Base64**, **JSON**, **URL**, **JWT**, **Hash + HMAC**, **Timestamp**, **UUID/NanoID/ULID**, **Regex**, **Text Diff**, **Markdown**, **CSV**, **Cron**, **Color**, **Image**, **QR Code**. Ver tabla detallada en [`README.md`](README.md).

Fase activa: **Fase 4 — Dataflow editor**. Próximo paso: instalar `@xyflow/svelte` y conectar el catálogo de nodos desde el registry.

Fases pendientes: **4** Dataflow editor (`@xyflow/svelte`), **5** Persistencia/share, **6** PWA + tests.

## Comandos

```sh
bun install
bun run dev        # http://localhost:5173
bun run check      # svelte-check (type-check)
bun run lint       # prettier --check + eslint
bun run format     # prettier --write
bun run build      # build de producción
bun run test       # vitest --run
```

Antes de cerrar cualquier cambio: `bun run check && bun run lint`.

## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: prettier, eslint, vitest, tailwindcss, mcp

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
