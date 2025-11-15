# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Outerbase Studio** is a browser-based SQLite database GUI, currently being migrated to support **Val Town only**. This is a Next.js 15 application built with React 19, TypeScript, and Tailwind CSS 4.

The codebase is currently in **Phase 2 (90% complete)** of a migration to support only Val Town SQLite connections. See `VALTOWN_MIGRATION_PLAN.md` and `MIGRATION_CHECKLIST.md` for detailed migration status.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on port 3008
- `npm run build` - Build production bundle
- `npm run tsc` - Type check without emitting files
- `npm test` - Run Jest test suite
- `npm run lint` - Run ESLint
- `npm run format` - Check formatting with Prettier

### Testing
- `npm test` - Run all tests
- `jest <file-path>` - Run specific test file
- Test files are located in `src/**/*.test.ts` or `src/**/*.test.tsx`
- Jest is configured with Next.js integration (see `jest.config.ts`)

### Type Checking
- Always run `npm run tsc` before committing to verify type correctness
- The build uses `skipLibCheck` for faster compilation

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
   - `createLocalDriver(conn)` - Creates driver instance from connection config
   - `createValtownDriver(token)` - Convenience method for Val Town connections
   - **Currently only supports Val Town** (migration in progress)

### Application Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (outerbase)/         # Main authenticated routes
│   │   ├── local/           # Local connection management
│   │   └── w/[workspaceId]/ # Workspace routes
│   ├── (theme)/             # Database GUI routes
│   │   └── client/          # Main Studio interface
│   └── (public)/            # Public pages (docs, marketing)
│
├── components/
│   ├── gui/                 # Studio GUI components
│   │   ├── studio.tsx       # Main Studio component with proxy driver
│   │   ├── sql-editor/      # CodeMirror-based SQL editor
│   │   ├── schema-editor/   # Visual schema designer
│   │   ├── table-optimized/ # High-performance table renderer
│   │   └── tabs/            # Tab system (query, table, ERD, etc.)
│   │
│   └── connection-config-editor/ # Connection configuration UI
│       └── template/        # Database-specific templates (Val Town only)
│
├── drivers/                 # Database driver layer (see above)
│   ├── sqlite/             # SQLite parsing utilities
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
├── lib/                    # Utility functions
└── env.ts                  # Environment validation (t3-env)
```

### Key Patterns

#### Studio Component Flow
1. Connection config → `createLocalDriver()` → `SqliteLikeBaseDriver(ValtownQueryable)`
2. Driver wrapped in Proxy for query pipeline hooks (`studio.tsx:46-80`)
3. Extensions manager processes queries via `beforeQuery()` pipeline
4. Results rendered through optimized table component

#### Extension System
- Extensions are created per dialect: `createSQLiteExtensions()`, etc.
- `StudioExtensionManager` manages lifecycle and hooks
- Extensions can intercept queries via `BeforeQueryPipeline`
- Located in `src/extensions/` and registered in `src/core/standard-extension.ts`

#### Type System
- `SupportedDriver` type in `src/app/(theme)/connect/saved-connection-storage.ts` - currently only `"valtown"`
- `SupportedDialect` in `src/drivers/base-driver.ts` - currently only `"sqlite"`
- Database operations use `DatabaseResultSet`, `DatabaseTableSchema`, etc.

## Migration Context (IMPORTANT)

This codebase is undergoing migration to Val Town-only support:

- **Phase 2 (90%)**: Driver removal and type cleanup mostly complete
- **Next step**: Remove `@libsql/client` dependency and verify build
- **Important files to keep**: `valtown.ts`, `sqlite-base-driver.ts`, `base-driver.ts`, `helpers.ts`
- **Files being removed**: All non-Val Town drivers (Turso, PostgreSQL, MySQL, etc.)

When making changes:
- Do NOT add support for other databases
- Do NOT reference removed drivers (turso, postgres, mysql, etc.)
- DO maintain the driver abstraction layer for future extensibility
- Check `MIGRATION_CHECKLIST.md` for current status

## Common Tasks

### Adding a New Feature to the GUI
1. Create component in `src/components/gui/`
2. If it's a new tab type, extend tab system in `src/components/gui/tabs/`
3. Register with Studio Core Commands if needed (`src/core/command/`)
4. Add to appropriate extension in `src/extensions/` or `src/core/standard-extension.ts`

### Modifying Val Town Driver
1. Edit `src/drivers/database/valtown.ts`
2. Ensure `ValtownQueryable` implements `QueryableBaseDriver` interface
3. Transform API responses to `DatabaseResultSet` format
4. Test with actual Val Town connection

### Adding SQL Parsing Features
1. SQLite parsing logic is in `src/drivers/sqlite/`
2. Parser functions: `parseCreateTableScript()`, `parseCreateTriggerScript()`, etc.
3. Schema generation: `generateSqlSchemaChange()` in `sqlite-generate-schema.ts`
4. Add tests in `src/drivers/sqlite/*.test.ts`

### Working with the Query Pipeline
1. Query interception happens in `studio.tsx` via Proxy pattern
2. Extensions can hook into `beforeQuery()` via `BeforeQueryPipeline`
3. Pipeline allows statement modification before execution
4. Used for query logging, query rewriting, etc.

## Path Aliases

- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- Always use path aliases for imports from `src/`

## Important Notes

- **Database**: Only Val Town SQLite is supported (migration in progress)
- **React**: Using React 19 with Server Components (Next.js 15)
- **Styling**: Tailwind CSS 4 with custom design system in `components/ui/`
- **State**: Mix of React Context and SWR for data fetching
- **Storage**: IndexedDB for saved queries/docs, localStorage for connections
- **Code Editor**: CodeMirror 6 with custom SQL extensions

## Testing Strategy

- Unit tests for SQL parsing logic (drivers/sqlite/*.test.ts)
- Component tests use Jest + React Testing Library
- No E2E tests currently in the codebase
- Focus testing on driver layer and SQL utilities

## Performance Considerations

- Table rendering is highly optimized (see `src/components/gui/table-optimized/`)
- Virtual scrolling for large result sets
- Query results are streamed when possible
- Connection state managed carefully to avoid re-renders
