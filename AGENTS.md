# Val Town Studio Agent Guide

## Commands
- **Run**: `bun run dev` (port 3008) | **Build**: `bun run build`
- **Test**: `bun test` | **Single Test**: `bun test <path/to/file>`
- **Check**: `bun run tsc` (Types) | `bun run lint` (Biome) | `bun run format`

## Code Style & Conventions
- **Stack**: Next.js 15, React 19, Tailwind 4, Bun, Biome.
- **Imports**: Use `@/*` aliases (maps to `src/*`). Avoid relative paths for distant files.
- **Formatting**: Use Biome (tabs, double quotes). Run `bun run format:write` before committing.
- **Styling**: Prefer Tailwind utility classes. Use `ob-*` (Orbit) for settings, `shadcn` for GUI.
- **Database**: ONLY support "valtown" (SQLite). Use `createValtownDriver(token)`.
- **Architecture**: "Studio-First" UI. `src/drivers` abstracts DB ops. `ValtownQueryable` implements `QueryableBaseDriver`.
- **Testing**: Vitest for unit, Playwright for E2E. Test driver/parsing logic heavily.

## Rules
- **No new drivers**: Do not add Postgres/MySQL support.
- **Security**: No secrets in code. `localStorage` handles tokens.
- **Files**: Use `bun` for all package commands.
