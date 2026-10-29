# Coding standards

## Drivers

- Keep the abstraction: `ValtownQueryable` implements `QueryableBaseDriver`;
  `SqliteLikeBaseDriver` extends `CommonSQLImplement`, which builds on
  `BaseDriver` in `src/drivers/base-driver.ts`.
- `ValtownQueryable` talks to the Val Town `sqlite/execute` and `sqlite/batch`
  endpoints and converts every response with `transformRawResult()` into a
  `DatabaseResultSet`.
- SQLite parsing and schema generation live in `src/drivers/sqlite/`. Tests sit
  beside the parser as `*.test.ts`.

## Extending the Studio

- **Extension**: subclass `StudioExtension`, hook in from `init()` with the
  `register*` methods on `StudioExtensionContext`, and add it to
  `createStandardExtensions()` or `createSQLiteExtensions()` in
  `src/core/standard-extension.tsx`.
- **Query rewriting**: register a `beforeQuery` handler that edits the
  `BeforeQueryPipeline` statements. Leave the Proxy in `Studio` alone.
- **Tab**: put the component in `src/components/gui/tabs/`, define it with
  `createTabExtension()` in `src/core/builtin-tab/`, and expose its opener on
  `scc.tabs` in `src/core/command/index.ts`.

## Styling

- Tailwind utilities. Inline `style` only for values from props or state,
  properties Tailwind lacks, and performance-critical table cells.
- CSS Modules only for complex animation or performance-critical rendering.
- Orbit (`src/components/orbit/`, `ob-*` classes in `src/app/globals.css`) for
  connection, settings, and account UI. shadcn (`src/components/ui/`) for the
  database GUI and anything Orbit lacks. Button, Input, and Label exist in
  both; match the file you are in.

## Accessibility

- Every interactive element shows focus with `ob-focus` or `focus-visible:`.
- Icon-only buttons carry `aria-label`.
- Custom widgets carry ARIA roles (`tablist`, `tab`, and so on).
- Tooltips show keyboard shortcuts in a `<kbd>` element.
