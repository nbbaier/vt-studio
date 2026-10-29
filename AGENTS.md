# Val Town Studio

Browser-based SQLite GUI for Val Town databases. Next.js 15, React 19,
Tailwind 4, Biome. Imports from `src/` use the `@/*` alias.

## Commands

- `bun run dev` (port 3008), `bun run build`
- `bun run test` runs Vitest; `bun run test <path>` runs one file. Plain
  `bun test` is Bun's own runner and skips the jsdom setup.
- `bun run test:e2e` runs Playwright against `tests/e2e/`.
- `bun run tsc`, `bun run lint`, `bun run format:write`

## Rules

- **Val Town only**: Do not add Postgres/MySQL/Turso support or reference
  removed drivers.
- **Security**: No secrets in code. Tokens live in `localStorage` via
  `src/lib/valtown-token-storage.ts`.
- **Tooling**: Use `bun` for all package commands.

## Connections and drivers

- One Val Town token, one active connection. `ValtownStudioWrapper` reads the
  stored token, builds the driver with `createValtownDriver(token)`, and
  renders Studio directly; disconnect removes the token.
- `createValtownDriver` wraps `ValtownQueryable` in `SqliteLikeBaseDriver`.
- `Studio` wraps the driver in a Proxy that routes `query` and `transaction`
  through the extensions' `beforeQuery` pipeline. Every query goes through it.

## Before editing `src/`

Read `CODING_STANDARDS.md`.

## Done means

`bun run tsc`, `bun run lint`, and `bun run test` pass. Run `bun run tsc`
before every commit.
