# Val Town Only Migration Plan - Moderate Approach

**Goal**: Transition Outerbase Studio to support only Val Town SQLite connections while maintaining code quality and allowing future extensibility.

**Approach**: Remove other drivers but keep lightweight architectural abstractions for maintainability.

**Estimated Effort**: 3-5 days

---

## Phase 1: Audit and Document Current Val Town Implementation

**Duration**: 0.5 day

### Tasks:
1. **Document Val Town driver implementation**
   - Review `/src/drivers/database/valtown.ts` (40 lines)
   - Document API endpoints and authentication
   - Note inherited functionality from `SqliteLikeBaseDriver`

2. **Test current Val Town functionality**
   - Create test connection with Val Town
   - Test all major features (query, transaction, batch)
   - Document any limitations or issues

3. **Identify dependencies**
   - Review Val Town-specific dependencies (if any)
   - Document which base classes are used

### Deliverables:
- Val Town functionality test report
- Dependency map

---

## Phase 2: Remove Non-Val Town Database Drivers

**Duration**: 1 day

### Files to DELETE:

#### SQLite-based drivers:
- `/src/drivers/database/turso.tsx` - Turso/LibSQL driver
- `/src/drivers/database/rqlite.ts` - rqlite driver
- `/src/drivers/database/cloudflare-d1.ts` - Cloudflare D1 driver
- `/src/drivers/database/starbasedb.ts` - StarbaseDB driver
- `/src/drivers/database/sqljs.ts` - SQL.js in-memory SQLite
- `/src/drivers/database/cloudflare-wae.ts` - Cloudflare Worker Analytics

#### Relational drivers:
- `/src/drivers/postgres/` - Entire PostgreSQL directory
- `/src/drivers/mysql/` - Entire MySQL directory

#### Connection templates:
- `/src/components/connection-config-editor/template/turso.tsx`
- `/src/components/connection-config-editor/template/rqlite.tsx`
- `/src/components/connection-config-editor/template/cloudflare-d1.tsx`
- `/src/components/connection-config-editor/template/cloudflare-wae.tsx`
- `/src/components/connection-config-editor/template/starbase.tsx`
- `/src/components/connection-config-editor/template/sqljs.tsx`
- `/src/components/connection-config-editor/template/postgres.tsx`
- `/src/components/connection-config-editor/template/mysql.tsx`
- `/src/components/connection-config-editor/template/durable-object.tsx`

#### Documentation:
- `/src/app/(public)/docs/connect-turso/`
- `/src/app/(public)/docs/connect-postgres/`
- `/src/app/(public)/docs/connect-mysql/`
- `/src/app/(public)/docs/connect-cloudflare/`
- `/src/app/(public)/docs/connect-rqlite/`
- `/src/app/(public)/docs/connect-starbasedb/`
- Any other database-specific documentation (keep only `/src/app/(public)/docs/connect-valtown/`)

### Files to MODIFY:

#### 1. `/src/drivers/helpers.ts`
**Before:**
```typescript
export function createLocalDriver(conn: SavedConnectionRawLocalStorage) {
  if (conn.driver === "rqlite") {
    return new SqliteLikeBaseDriver(
      new RqliteQueryable(conn.url!, conn.username, conn.password)
    );
  } else if (conn.driver === "valtown") {
    return new SqliteLikeBaseDriver(new ValtownQueryable(conn.token!));
  } else if (conn.driver === "cloudflare-d1") {
    // ... other drivers
  }
  return new TursoDriver(conn.url!, conn.token!, true);
}
```

**After:**
```typescript
export function createLocalDriver(conn: SavedConnectionRawLocalStorage) {
  if (conn.driver === "valtown") {
    return new SqliteLikeBaseDriver(new ValtownQueryable(conn.token!));
  }
  throw new Error("Only Val Town connections are supported");
}
```

#### 2. Remove imports from `/src/drivers/helpers.ts`
Remove all imports except:
```typescript
import { SavedConnectionRawLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import { ValtownQueryable } from "./database/valtown";
import { SqliteLikeBaseDriver } from "./sqlite-base-driver";
```

### Dependencies to REMOVE from `package.json`:

```json
"@libsql/client": "^0.5.3",  // Turso driver
"libsql-stateless-easy": "^1.6.11",  // Turso stateless
```

Also remove from `overrides`:
```json
"@libsql/client": "^0.5.3"
```

### Validation:
- Run `npm install` after package.json changes
- Ensure no import errors remain
- Check that build succeeds: `npm run build`

---

## Phase 3: Simplify Connection UI to Val Town Only

**Duration**: 1 day

### Files to MODIFY:

#### 1. `/src/app/(outerbase)/new-resource-list.tsx`

**Before:**
```typescript
export function getCreateResourceTypeList(workspaceId?: string): NewResourceType[] {
  return [
    { name: "Cloudflare D1", icon: CloudflareIcon, href: ... },
    { name: "Turso/LibSQL", icon: TursoIcon, href: ... },
    { name: "Postgres", icon: PostgreIcon, href: ... },
    { name: "MySQL", icon: MySQLIcon, href: ... },
    { name: "val.town", icon: ValTownIcon, href: ... },
    // ... others
  ].filter((resource) => resource.href);
}
```

**After:**
```typescript
export function getCreateResourceTypeList(workspaceId?: string): NewResourceType[] {
  return [
    {
      name: "val.town",
      icon: ValTownIcon,
      href: workspaceId ? "" : "/local/new-base/valtown",
    },
  ];
}
```

#### 2. `/src/app/(outerbase)/base-template.tsx` (or similar template dictionary file)

Find `ConnectionTemplateDictionary` and remove all entries except `valtown`:

**After:**
```typescript
export const ConnectionTemplateDictionary = {
  valtown: ValtownConnectionTemplate,
};
```

#### 3. Remove unused icons

Check `/src/components/resource-card/icon.tsx` and `/src/components/icons/outerbase-icon.tsx`:
- Keep: `ValTownIcon`, `SQLiteIcon` (might be used generically)
- Optional removal: `TursoIcon`, `CloudflareIcon`, `StarbaseIcon`, `RQLiteIcon`, `PostgreIcon`, `MySQLIcon`

### UI Flow Changes:

#### Simplify connection creation flow
- Users should go directly to Val Town connection form
- Remove database type selection step
- Consider simplifying route from `/local/new-base/valtown` to `/local/new-base` or `/local/connect`

### Validation:
- Navigate to connection creation
- Verify only Val Town is shown
- Test creating a new Val Town connection

---

## Phase 4: Update Type System

**Duration**: 0.5 day

### Files to MODIFY:

#### 1. `/src/app/(theme)/connect/saved-connection-storage.ts`

**Before:**
```typescript
export type SupportedDriver =
  | "turso"
  | "rqlite"
  | "valtown"
  | "starbase"
  | "cloudflare-d1"
  | "cloudflare-wae"
  | "sqlite-filehandler";
```

**After:**
```typescript
export type SupportedDriver = "valtown";
```

#### 2. `/src/drivers/base-driver.ts`

**Before:**
```typescript
export type SupportedDialect = "sqlite" | "mysql" | "postgres" | "dolt";
```

**After (option 1 - keep for future):**
```typescript
export type SupportedDialect = "sqlite"; // Val Town uses SQLite dialect
```

**After (option 2 - simplify completely):**
Remove `SupportedDialect` type entirely and hardcode `"sqlite"` where needed

#### 3. Search for other driver-related types

Run global search for:
- `"turso"`, `"postgres"`, `"mysql"`, `"rqlite"`, etc. in type definitions
- Update or remove as needed

### Type cleanup checklist:
- [ ] Remove driver union types except "valtown"
- [ ] Update dialect types to "sqlite" only
- [ ] Remove database-specific configuration interfaces
- [ ] Update function signatures that reference removed drivers

### Validation:
- Run TypeScript compiler: `npm run tsc`
- Fix any type errors
- Ensure no references to removed drivers remain

---

## Phase 5: Simplify Driver Architecture (Keep Extensibility)

**Duration**: 0.5 day

### Keep These Abstractions (for maintainability):
- `QueryableBaseDriver` interface - Clean abstraction
- `BaseDriver` abstract class - Provides common functionality
- `SqliteLikeBaseDriver` - Val Town inherits from this
- `DriverFlags` interface - Useful for future features

### Simplifications:

#### 1. Update `/src/drivers/base-driver.ts`
Keep the file but add comment:
```typescript
/**
 * Base driver abstractions.
 * Currently supports only Val Town SQLite, but architecture
 * allows for future database additions if needed.
 */
```

#### 2. Update `/src/drivers/sqlite-base-driver.ts`
Add comment about Val Town being the primary implementation

#### 3. Clean up unused driver flag options
Review `DriverFlags` interface and remove any flags that were specific to removed databases

### Optional: Create simplified factory

In `/src/drivers/helpers.ts`, simplify but keep factory pattern:

```typescript
/**
 * Creates a database driver instance.
 * Currently supports only Val Town SQLite connections.
 */
export function createLocalDriver(conn: SavedConnectionRawLocalStorage) {
  if (conn.driver !== "valtown") {
    throw new Error("Only Val Town connections are supported");
  }

  return new SqliteLikeBaseDriver(new ValtownQueryable(conn.token!));
}

/**
 * Convenience function for creating Val Town driver
 */
export function createValtownDriver(token: string) {
  return new SqliteLikeBaseDriver(new ValtownQueryable(token));
}
```

### Validation:
- Existing Val Town connections still work
- Code is well-documented
- Architecture remains clean

---

## Phase 6: Handle Existing Connections Migration

**Duration**: 1 day

### Migration Strategy:

#### 1. Create migration utility

Create `/src/lib/migration/valtown-only-migration.ts`:

```typescript
import { SavedConnectionItem } from "@/app/(theme)/connect/saved-connection-storage";

export interface MigrationReport {
  total: number;
  valtown: number;
  removed: string[];
}

/**
 * Migrates saved connections to Val Town only.
 * Removes all non-Val Town connections and returns a report.
 */
export function migrateToValtownOnly(
  connections: SavedConnectionItem[]
): { connections: SavedConnectionItem[]; report: MigrationReport } {
  const valtownConnections = connections.filter(
    (conn) => conn.driver === "valtown"
  );

  const removedConnections = connections
    .filter((conn) => conn.driver !== "valtown")
    .map((conn) => `${conn.name} (${conn.driver})`);

  return {
    connections: valtownConnections,
    report: {
      total: connections.length,
      valtown: valtownConnections.length,
      removed: removedConnections,
    },
  };
}
```

#### 2. Create migration UI component

Create `/src/components/migration/valtown-migration-notice.tsx`:

```typescript
/**
 * Shows a one-time notice about the migration to Val Town only.
 * Displays which connections were removed.
 */
export function ValtownMigrationNotice({ report }: { report: MigrationReport }) {
  if (report.removed.length === 0) return null;

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <h3>Database Migration Notice</h3>
      <p>
        This app now supports only Val Town SQLite connections.
        The following connections were removed:
      </p>
      <ul>
        {report.removed.map((conn) => (
          <li key={conn}>{conn}</li>
        ))}
      </ul>
      <p>
        You have {report.valtown} Val Town connection(s) remaining.
      </p>
    </div>
  );
}
```

#### 3. Run migration on app startup

Update connection loading logic to run migration once:

```typescript
// In your connection initialization code
const rawConnections = loadConnectionsFromStorage();
const { connections, report } = migrateToValtownOnly(rawConnections);

// Save back migrated connections
saveConnectionsToStorage(connections);

// Show notice if needed (store in localStorage to show once)
if (!localStorage.getItem("valtown-migration-shown") && report.removed.length > 0) {
  showMigrationNotice(report);
  localStorage.setItem("valtown-migration-shown", "true");
}
```

### Validation:
- Test with existing connections of various types
- Verify Val Town connections are preserved
- Verify other connections are removed gracefully
- Check migration notice displays correctly

---

## Phase 7: Update Documentation and Branding

**Duration**: 0.5 day

### Documentation Updates:

#### 1. Update `/README.md`

**Key changes:**
- Update description: "A database GUI for Val Town SQLite"
- Remove references to other databases
- Simplify "Getting Started" to focus on Val Town
- Update feature list to reflect Val Town only
- Add note about previous multi-database support if relevant

#### 2. Update main documentation

Keep only:
- `/src/app/(public)/docs/connect-valtown/page.mdx`

Update index/navigation to remove other database docs.

#### 3. Update configuration examples

Remove example configs for other databases.

#### 4. Update package.json metadata

```json
{
  "name": "@outerbase/studio",
  "description": "A modern database GUI for Val Town SQLite",
  "keywords": ["valtown", "sqlite", "database", "gui", "studio"]
}
```

### Branding Considerations:

**Option 1 - Keep "Outerbase Studio"**
- Add subtitle: "for Val Town"
- Update marketing copy

**Option 2 - Rebrand to "Val Town Studio"**
- Requires more extensive changes
- Better clarity for users
- May need coordination with Val Town team

**Recommendation**: Keep "Outerbase Studio" for now, clearly indicate Val Town support.

### Validation:
- Review all user-facing documentation
- Check for broken links
- Verify examples work

---

## Phase 8: Testing and Validation

**Duration**: 1 day

### Testing Checklist:

#### Unit Tests:
- [ ] Val Town driver tests pass
- [ ] Factory function tests updated
- [ ] Type tests pass
- [ ] Migration utility tests

#### Integration Tests:
- [ ] Create new Val Town connection
- [ ] Connect to existing Val Town database
- [ ] Query execution
- [ ] Transaction support
- [ ] Batch operations
- [ ] Table browsing
- [ ] Schema viewing
- [ ] Data editing
- [ ] Export functionality

#### UI Tests:
- [ ] Connection creation flow
- [ ] Connection list shows only Val Town
- [ ] Migration notice displays (if applicable)
- [ ] Error messages are clear
- [ ] No references to removed databases in UI

#### Build Tests:
- [ ] `npm run build` succeeds
- [ ] `npm run tsc` succeeds (no type errors)
- [ ] `npm run lint` succeeds
- [ ] No console errors
- [ ] Bundle size reduced (check with `npm run build`)

#### Migration Tests:
- [ ] Test with no existing connections
- [ ] Test with only Val Town connections
- [ ] Test with mixed connections (should remove non-Val Town)
- [ ] Test with many connections (performance)

### Performance Validation:
- [ ] App startup time
- [ ] Connection creation speed
- [ ] Query execution speed
- [ ] No memory leaks
- [ ] Check bundle size reduction

### Documentation Validation:
- [ ] README is accurate
- [ ] All links work
- [ ] Examples are correct
- [ ] Screenshots updated (if needed)

---

## Rollback Plan

If issues arise, here's how to rollback:

1. **Git branch**: Keep original code in separate branch
2. **Checkpoint commits**: Commit after each phase
3. **Tagged release**: Tag last multi-database version

### Quick rollback steps:
```bash
git checkout main
git revert <migration-commit-range>
npm install
npm run build
```

---

## Success Criteria

Migration is complete when:

- ✅ Only Val Town driver code remains
- ✅ All tests pass
- ✅ Build succeeds with no errors
- ✅ Documentation is updated
- ✅ Migration handles existing connections gracefully
- ✅ Bundle size is reduced
- ✅ Code is well-documented
- ✅ Future extensibility is preserved

---

## Post-Migration Optimization (Optional)

After successful migration, consider:

1. **Further simplification**: If Val Town is truly the only driver forever, remove more abstractions
2. **Val Town-specific features**: Add features unique to Val Town
3. **Performance optimization**: Optimize for Val Town API specifically
4. **Branding**: Consider full rebrand if partnership with Val Town
5. **Documentation**: Create comprehensive Val Town integration guide

---

## Key Files Reference

### Keep and Modify:
- `/src/drivers/database/valtown.ts` - Core driver (KEEP)
- `/src/drivers/helpers.ts` - Factory function (SIMPLIFY)
- `/src/drivers/base-driver.ts` - Base abstractions (KEEP, ADD COMMENTS)
- `/src/drivers/sqlite-base-driver.ts` - SQLite base class (KEEP)
- `/src/components/connection-config-editor/template/valtown.tsx` - Connection UI (KEEP)
- `/src/app/(public)/docs/connect-valtown/page.mdx` - Documentation (KEEP)

### Delete:
- All other drivers in `/src/drivers/database/` (except valtown.ts)
- `/src/drivers/postgres/` directory
- `/src/drivers/mysql/` directory
- All other connection templates
- All other database documentation

### Modify Extensively:
- `/src/app/(outerbase)/new-resource-list.tsx` - Show only Val Town
- `/src/app/(theme)/connect/saved-connection-storage.ts` - Update types
- `/package.json` - Remove dependencies
- `/README.md` - Update documentation

---

## Timeline Summary

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 1. Audit & Document | 0.5 day | 0.5 day |
| 2. Remove Drivers | 1 day | 1.5 days |
| 3. Simplify UI | 1 day | 2.5 days |
| 4. Update Types | 0.5 day | 3 days |
| 5. Simplify Architecture | 0.5 day | 3.5 days |
| 6. Migration Handling | 1 day | 4.5 days |
| 7. Documentation | 0.5 day | 5 days |
| 8. Testing | 1 day | **6 days** |

**Total Estimated Time**: 5-6 days with buffer

---

## Questions to Answer Before Starting

1. **Branding**: Keep "Outerbase Studio" or rebrand?
2. **Migration**: Should we notify users about removed database support?
3. **Backwards Compatibility**: Any old connections we must preserve?
4. **Feature Parity**: Are there Val Town-specific features we should add?
5. **Testing**: What's the testing strategy for this migration?
6. **Release**: Will this be a major version bump (breaking change)?

---

## Next Steps

To begin execution:
1. Create a feature branch: `git checkout -b feat/valtown-only-migration`
2. Start with Phase 1 (Audit & Document)
3. Commit after each phase
4. Create PR for review before merging
5. Deploy to staging environment for validation
6. Announce breaking change to users
