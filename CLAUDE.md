# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Val Town Studio** is a browser-based SQLite database GUI purpose-built exclusively for **Val Town**. This is a Next.js 15 application built with React 19, TypeScript, and Tailwind CSS 4.

The codebase has completed migration to Val Town-only support (97% complete - automated testing done, manual testing pending). See `VALTOWN_MIGRATION_PLAN.md` and `MIGRATION_CHECKLIST.md` for migration history.

## Development Commands

**Note**: This project uses **Bun** as the package manager (see `bun.lock`). Use `bun` instead of `npm` for all commands.

### Package Management

- `bun install` - Install all dependencies
- `bun add <package>` - Add a new dependency
- `bun add -d <package>` - Add a dev dependency
- `bun remove <package>` - Remove a dependency

### Core Commands

- `bun run dev` - Start development server on port 3008
- `bun run build` - Build production bundle
- `bun run tsc` - Type check without emitting files
- `bun test` - Run Vitest test suite
- `bun run lint` - Run Biome linter
- `bun run format` - Check formatting with Biome

### Testing

- `bun test` - Run all unit tests (Vitest)
- `bun run test:watch` - Run tests in watch mode
- `bun run test:ui` - Run tests with Vitest UI
- `bun run test:e2e` - Run Playwright E2E tests
- `bun run test:e2e:ui` - Run E2E tests with Playwright UI
- Test files: `src/**/*.test.ts` or `src/**/*.test.tsx`
- E2E tests: `tests/e2e/**/*.spec.ts`
- Vitest configured with jsdom environment (see `vitest.config.ts`)

### Type Checking & Formatting

- `bun run tsc` - Type check without emitting files
- `bun run typecheck` - Alias for `bun run tsc`
- `bun run lint` - Run Biome linter
- `bun run lint:write` - Run Biome linter and fix issues
- `bun run format` - Check formatting with Biome
- `bun run format:write` - Format code with Biome
- Always run `bun run tsc` before committing
- Biome is configured for tab indentation and double quotes (see `biome.json`)

## Architecture Overview

### Driver Architecture (Core Abstraction Layer)

The application uses a **driver pattern** to abstract database operations:

1. **Base Abstractions** (`src/drivers/base-driver.ts`):
   - `QueryableBaseDriver` - Interface for executing queries and transactions
   - `BaseDriver` - Abstract class with common database operations
   - `DriverFlags` - Feature flags for database capabilities
   - `SupportedDialect` - Currently only `"sqlite"` (Val Town uses SQLite)

2. **SQLite Implementation** (`src/drivers/sqlite-base-driver.ts`):
   - `SqliteLikeBaseDriver` - Extends `CommonSQLImplement`, provides SQLite-specific functionality
   - Handles schema parsing, table operations, triggers, views
   - Uses SQL parsing utilities from `src/drivers/sqlite/` directory

3. **Val Town Driver** (`src/drivers/database/valtown.ts`):
   - `ValtownQueryable` - Implements `QueryableBaseDriver` for Val Town API
   - Communicates with `https://api.val.town/v1/sqlite/execute` and `/batch` endpoints
   - Uses Bearer token authentication
   - Transforms Val Town API responses to standard `DatabaseResultSet` format

4. **Driver Factory** (`src/drivers/helpers.ts`):
   - `createLocalDriver(conn)` - Creates driver instance from connection config (legacy)
   - `createValtownDriver(token)` - Convenience method for Val Town connections (recommended)
   - **Only supports Val Town SQLite**

### Application Structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Root route - loads ValtownStudioWrapper
│   ├── (public)/            # Public pages (docs, marketing)
│   ├── connect/             # Standalone connection page (optional route)
│   └── storybook/           # Component development/testing pages
│
├── components/
│   ├── gui/                          # Studio GUI components
│   │   ├── studio.tsx                # Main Studio component with proxy driver
│   │   ├── sql-editor/               # CodeMirror-based SQL editor
│   │   ├── schema-editor/            # Visual schema designer
│   │   ├── table-optimized/          # High-performance table renderer
│   │   └── tabs/                     # Tab system (query, table, ERD, etc.)
│   │
│   ├── valtown-studio-wrapper.tsx    # Token management + Studio loader
│   ├── orbit/                        # Orbit Design System components
│   └── ui/                           # shadcn/ui components
│
├── drivers/                 # Database driver layer (see above)
│   ├── database/
│   │   └── valtown.ts      # Val Town API driver (ONLY driver)
│   ├── sqlite/             # SQLite parsing utilities
│   ├── sqlite-base-driver.ts # SQLite implementation base
│   ├── base-driver.ts      # Driver abstractions
│   ├── helpers.ts          # Driver factory (Val Town only)
│   ├── agent/              # AI agent integrations
│   ├── board-storage/      # Dashboard storage backends
│   └── saved-doc/          # Document persistence (IndexedDB)
│
├── core/                   # Core framework
│   ├── extension-manager.ts # Plugin system
│   ├── query-pipeline.ts   # Query middleware pipeline
│   ├── standard-extension.ts # Built-in extensions
│   └── command/            # Studio Core Commands (scc)
│
├── extensions/             # Optional feature extensions
│   ├── trigger-editor/     # Trigger management
│   ├── view-editor/        # View management
│   ├── data-catalog/       # Metadata management
│   └── query-console-log/  # Query logging
│
├── context/                # React context providers
├── lib/
│   ├── valtown-token-storage.ts  # Token persistence (localStorage)
│   └── ...                       # Utility functions
└── env.ts                  # Environment validation (t3-env)
```

**Note**: Legacy connection management UI has been moved to `_outerbase_old/` and `_theme_old/` directories (deactivated but preserved for reference).

### Key Patterns

#### Studio Component Flow (Studio-First Architecture)

**User lands on root route (`/`):**

1. `ValtownStudioWrapper` component checks for stored token (`src/lib/valtown-token-storage.ts`)
2. **If token exists**: Immediately create driver and render Studio (0-click startup)
3. **If no token**: Show inline token configuration UI
4. **After token submission**: Store token → create driver → render Studio
5. Driver creation: `ValtownQueryable(token)` → `SqliteLikeBaseDriver` (via `createValtownDriver()`)
6. Driver wrapped in Proxy for query pipeline hooks (`studio.tsx:46-80`)
7. Extensions manager processes queries via `beforeQuery()` pipeline
8. Results rendered through optimized table component
9. **Disconnect**: Clears token, returns to configuration UI

**Key insight**: No separate connection management page - Studio IS the app.

#### Extension System

- Extensions are created per dialect: `createSQLiteExtensions()`, etc.
- `StudioExtensionManager` manages lifecycle and hooks
- Extensions can intercept queries via `BeforeQueryPipeline`
- Located in `src/extensions/` and registered in `src/core/standard-extension.ts`

#### Type System

- `SupportedDriver` type in `src/lib/saved-connection-storage.ts` - only `"valtown"`
- `SupportedDialect` in `src/drivers/base-driver.ts` - only `"sqlite"`
- `ValtownTokenData` in `src/lib/valtown-token-storage.ts` - token storage interface
- Database operations use `DatabaseResultSet`, `DatabaseTableSchema`, etc.
- Val Town API types defined inline in `src/drivers/database/valtown.ts` (`InStatement`, `ResultSet`)

## Val Town-Only Architecture (IMPORTANT)

This codebase supports **only Val Town SQLite** connections:

- **Migration Status**: 97% complete (Phase 7 Studio-First UI implemented)
- **Architecture**: Driver abstraction layer maintained for code quality and future extensibility
- **UI**: Studio-First approach - users land directly in database GUI
- **Storage**: Single-token localStorage model (one Val Town connection active at a time)

When making changes:

- Do NOT add support for other databases (Turso, PostgreSQL, MySQL, etc.)
- Do NOT reference removed drivers in new code
- DO maintain the driver abstraction layer (`QueryableBaseDriver`, `BaseDriver`, etc.)
- DO use `createValtownDriver(token)` helper for creating driver instances
- Check `MIGRATION_CHECKLIST.md` for migration history

## Common Development Tasks

### Working with Val Town Token Storage

**Token management** (`src/lib/valtown-token-storage.ts`):

```typescript
import { getValtownToken, setValtownToken, removeValtownToken } from "@/lib/valtown-token-storage";

// Get current token
const tokenData = getValtownToken(); // { token: string, name?: string } | null

// Store new token
setValtownToken({ token: "vtok_...", name: "My Database" });

// Clear token (disconnect)
removeValtownToken();
```

**Storage**: Uses `localStorage` with keys:
- `valtown_token` - API token
- `valtown_connection_name` - Optional connection name

### Adding a New Feature to the GUI

1. Create component in `src/components/gui/`
2. If it's a new tab type, extend tab system in `src/components/gui/tabs/`
3. Register with Studio Core Commands if needed (`src/core/command/`)
4. Add to appropriate extension in `src/extensions/` or `src/core/standard-extension.ts`

### Modifying Val Town Driver

1. Edit `src/drivers/database/valtown.ts`
2. Ensure `ValtownQueryable` implements `QueryableBaseDriver` interface
3. API endpoints: `https://api.val.town/v1/sqlite/execute` (single query) and `/batch` (transactions)
4. Transform API responses to `DatabaseResultSet` format using `transformRawResult()`
5. Test with actual Val Town API token

### Adding SQL Parsing Features

1. SQLite parsing logic is in `src/drivers/sqlite/`
2. Parser functions: `parseCreateTableScript()`, `parseCreateTriggerScript()`, etc.
3. Schema generation: `generateSqlSchemaChange()` in `sqlite-generate-schema.ts`
4. Add tests in `src/drivers/sqlite/*.test.ts`

### Working with the Query Pipeline

1. Query interception happens in `studio.tsx` via Proxy pattern (`studio.tsx:46-80`)
2. Extensions hook into `beforeQuery()` via `BeforeQueryPipeline`
3. Pipeline allows statement modification before execution
4. Used for query logging, query rewriting, etc.
5. Extensions created per dialect: `createSQLiteExtensions()` in `src/core/standard-extension.ts`

## Path Aliases

- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- Always use path aliases for imports from `src/`

## Styling Standards

### Component Libraries

The codebase uses **two component systems** (migration in progress):

1. **Orbit Design System** (`src/components/orbit/`)
   - Newer design system with custom `ob-*` classes
   - Components: Button, Input, Label, Avatar, Select, Toggle
   - Uses `ob-focus` class for focus-visible states
   - Preferred for new development in connection/account UIs

2. **shadcn/ui Components** (`src/components/ui/`)
   - Based on Radix UI primitives
   - Comprehensive component library (Dialog, Separator, Checkbox, etc.)
   - Uses class-variance-authority (CVA) for button/input variants
   - Used throughout GUI and extensions

**When to use which:**

- **Orbit**: Use for connection flows, settings pages, account management
- **shadcn/ui**: Use for database GUI, tables, dialogs, and components not in Orbit
- **Note**: Button, Input, and Label exist in both - check existing patterns in your file

### Styling Approach

**Primary:** Tailwind CSS 4 utility classes

```tsx
// Good - Tailwind utilities
<div className="flex h-[40px] items-center border-b">

// Avoid - Inline styles (except for dynamic values)
<div style={{ height: 40, display: "flex" }}>
```

**When inline styles are acceptable:**

1. Dynamic values from props/state: `style={{ width: columnWidth }}`
2. CSS properties not in Tailwind: `style={{ contentVisibility: "auto" }}`
3. Performance-critical styles (table cells)

**CSS Modules:**

- Only use for complex animations or performance-critical rendering
- Currently used in: `src/components/gui/table-cell/styles.module.css`

### Orbit Custom Classes

Located in `src/app/globals.css`:

- `.ob-btn` - Base button styles
- `.ob-focus` - Focus-visible ring (use on all interactive elements)
- `.ob-disable` - Disabled state styling
- `.ob-size-sm`, `.ob-size-base`, `.ob-size-lg` - Size variants
- `.interactive` - Hover/active states
- `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-destructive` - Button variants

### Accessibility Requirements

All interactive elements must have:

1. **Keyboard navigation**: Ensure `focus-visible` styles (use `ob-focus` or Tailwind's `focus-visible:`)
2. **ARIA labels**: `aria-label` for icon-only buttons
3. **ARIA roles**: `role="tablist"`, `role="tab"`, etc. for custom components
4. **Keyboard shortcuts**: Show shortcuts in tooltips with `<kbd>` element

## Important Notes

- **Database**: Only Val Town SQLite is supported
- **React**: Using React 19 with Server Components (Next.js 15)
- **State**: Mix of React Context and SWR for data fetching
- **Storage**:
  - localStorage for Val Town token (single-token model)
  - IndexedDB for saved queries/docs and legacy connection data
- **Code Editor**: CodeMirror 6 with custom SQL extensions
- **Branding**: "Val Town Studio" (changed from "Outerbase Studio" in Phase 7)

## Testing Strategy

- **Unit tests**: SQL parsing logic (`src/drivers/sqlite/*.test.ts`) using Vitest
- **Component tests**: React components with Vitest + React Testing Library
- **E2E tests**: Playwright (see `tests/e2e/` and `playwright.config.ts`)
- **Test commands**: `bun test` (unit), `bun run test:e2e` (E2E), `bun run test:ui` (Vitest UI)
- Focus testing on driver layer, SQL utilities, and critical user flows

## Performance Considerations

- Table rendering is highly optimized (see `src/components/gui/table-optimized/`)
- Virtual scrolling for large result sets
- Query results are streamed when possible
- Connection state managed carefully to avoid re-renders
