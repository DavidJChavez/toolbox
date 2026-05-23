# Toolbox

Colección de utilidades para desarrolladores, pensada para resolver pequeños problemas que aparecen durante el **análisis y debugging** de software: decodificar un Base64, validar un JSON, inspeccionar payloads, comparar respuestas, etc.

En lugar de depender de sitios externos o scripts sueltos, Toolbox concentra esas tareas en un solo lugar. Todo corre **100% en el navegador**: tus datos no salen de tu máquina.

## Motivación

Cuando debuggeamos APIs, revisamos logs o analizamos respuestas de servicios, repetimos las mismas micro-tareas: convertir Base64 a imagen, formatear JSON ilegible, validar si un payload es válido, comparar dos respuestas, etc. Son fricciones pequeñas, pero interrumpen el flujo.

Toolbox existe para eliminar esa fricción: herramientas rápidas, locales y encadenables (en el futuro) dentro de una interfaz consistente.

## Stack

- [SvelteKit](https://kit.svelte.dev/) + Svelte 5 (runes)
- [shadcn-svelte](https://shadcn-svelte.com/) (preset `b6rt8ttCM`, tema `mist`)
- Tailwind CSS 4
- [Bun](https://bun.sh/) como package manager

## Desarrollo

```sh
bun install
bun run dev
```

Otros comandos útiles:

```sh
bun run build      # build de producción
bun run preview    # preview del build
bun run check      # type-check con svelte-check
bun run test       # tests con vitest
bun run lint       # prettier + eslint
```

## Estado actual

### Infraestructura

- [x] Layout con sidebar, navbar y command palette (`⌘K`)
- [x] Dashboard generado desde el tool registry
- [x] Dark mode (`mode-watcher`)
- [x] Componente `ToolShell` reutilizable por herramienta
- [x] Tool registry como fuente única de verdad (`src/lib/tools/registry.ts`)

### Herramientas disponibles

| Tool                                                                           | Ruta               | Estado         |
| ------------------------------------------------------------------------------ | ------------------ | -------------- |
| Base64 encode/decode (texto, archivos, preview de imagen/PDF)                  | `/tools/base64`    | ✅             |
| JSON (prettify, minify, validate, sort, escape, JSON→TS, YAML, JSONPath, diff) | `/tools/json`      | ✅             |
| URL encode/decode + query-string parser                                        | `/tools/url`       | ✅             |
| JWT decoder (header/payload/signature, validación de `exp`)                    | `/tools/jwt`       | ✅             |
| UUID / NanoID / ULID generator                                                 | `/tools/uuid`      | ✅             |
| Hash (MD5, SHA-1/256/512) y HMAC                                               | `/tools/hash`      | ✅             |
| Regex tester con highlight de matches y replace                                | `/tools/regex`     | ✅             |
| Timestamp ↔ fecha humana (Unix, ISO, zonas horarias)                           | `/tools/timestamp` | ✅             |
| Text diff (Myers diff, inline + unified)                                       | `/tools/diff`      | ✅             |
| Markdown preview (GFM → HTML sanitizado)                                       | `/tools/markdown`  | ✅             |
| CSV ↔ JSON (delimitadores custom, dynamic typing)                              | `/tools/csv`       | ✅             |
| Cron expression parser (próximas ejecuciones)                                  | `/tools/cron`      | ✅             |
| Color converter (HEX ↔ RGB ↔ HSL ↔ OKLCH ↔ OKLab)                              | `/tools/color`     | ✅             |
| Image → WebP/AVIF/JPEG/PNG (client-side con canvas)                            | `/tools/image`     | ✅             |
| QR code generator (text, URL, WiFi, vCard, geo, calendar)                      | `/tools/qr`        | ✅             |
| Dataflow (editor de nodos)                                                     | `/dataflow`        | 🔜 placeholder |

## Roadmap

Roadmap pensado para crecer por fases. Marca `[x]` conforme avances en futuras sesiones.

### Fase 0 — Fundación ✅

- [x] Tool registry + tipos (`ToolDefinition`, categorías, `NodeSpec`)
- [x] Layout (sidebar + navbar + command palette + theme toggle)
- [x] Dashboard con cards desde el registry
- [x] `ToolShell` (header, descripción, clear, copy/download, toasts)

### Fase 1 — Base64 ✅

- [x] Encode: texto y archivos (drag & drop)
- [x] Decode: data URLs, sniff de MIME, preview imagen/PDF/texto/binario
- [x] Lógica pura en `src/lib/tools/base64/tool.ts`

### Fase 2 — JSON toolkit ✅

- [x] Prettify, minify, validate, sort keys
- [x] Escape / unescape, JSON → TypeScript
- [x] JSON ↔ YAML, JSONPath, diff lado a lado
- [x] Lógica pura en `src/lib/tools/json/tool.ts`

### Fase 3 — Catálogo incremental ✅

Prioridad sugerida según utilidad diaria en debugging:

- [x] URL encode/decode + query-string parser
- [x] JWT decoder (header/payload/signature, validación de `exp`)
- [x] UUID / NanoID / ULID generator
- [x] Hash (MD5, SHA-1/256/512) y HMAC
- [x] Regex tester con highlight de matches y replace
- [x] Cron expression parser (próximas ejecuciones)
- [x] Timestamp ↔ fecha humana (Unix, ISO, zonas horarias)
- [x] Color converter (HEX ↔ RGB ↔ HSL ↔ OKLCH)
- [x] Text diff (Myers diff)
- [x] Markdown preview
- [x] QR code generator / reader
- [x] Image → WebP/AVIF (client-side con `<canvas>`)
- [x] CSV ↔ JSON

**Cómo agregar una tool nueva:**

1. Crear `src/lib/tools/<id>/tool.ts` (funciones puras `run()`)
2. Crear `src/lib/tools/<id>/<Id>Tool.svelte` (UI con `ToolShell`)
3. Registrar en `src/lib/tools/registry.ts`
4. Crear ruta en `src/routes/(app)/tools/<id>/+page.svelte`

El sidebar, command palette y dashboard se actualizan solos.

### Fase 4 — Dataflow editor (endgame)

- [ ] Instalar `@xyflow/svelte` (Svelte Flow)
- [ ] Canvas en `/dataflow` con catálogo de nodos desde el registry
- [ ] Conexiones tipadas (`text`, `json`, `binary`, `image`)
- [ ] Ejecutor: topological sort → `tool.run()` por nodo → propagar resultado
- [ ] Persistencia del flow en `localStorage`

### Fase 5 — Persistencia y compartir

- [ ] Historial por tool (últimos N inputs/outputs) en `localStorage`
- [ ] Flows guardados con nombre
- [ ] Export/import de flows como `.json`
- [ ] URL share opcional (input comprimido en hash `#data=...`)

### Fase 6 — Pulido

- [ ] PWA (offline real)
- [ ] Tests con vitest para cada `tool.run()`
- [ ] Atajos de teclado por tool

## Arquitectura (resumen)

```
src/lib/tools/registry.ts     → sidebar, command palette, dashboard, (futuro) nodos
src/lib/tools/<id>/tool.ts      → lógica pura, reutilizable en dataflow
src/lib/tools/<id>/*Tool.svelte → UI de la herramienta
src/routes/(app)/               → layout + rutas
```

Principio clave: cada herramienta expone una función `run(input) → output` además de su UI, para poder encadenarlas en el editor de nodos.

## Dependencias previstas por fase

| Fase     | Paquetes                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 2 (JSON) | `yaml`, `jsonpath-plus` ✅ instalados                                                                    |
| 3        | `cron-parser`, `cronstrue`, `culori`, `diff`, `marked`, `dompurify`, `qrcode`, `papaparse` ✅ instalados |
| 4        | `@xyflow/svelte`                                                                                         |
