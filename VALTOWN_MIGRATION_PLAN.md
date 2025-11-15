# Val Town Only Migration Plan - Moderate Approach

**Goal**: Transition Outerbase Studio to support only Val Town SQLite connections while maintaining code quality and allowing future extensibility.

**Approach**: Remove other drivers but keep lightweight architectural abstractions for maintainability.

**Deployment Context**: Standalone deployment (no existing connection migration needed)

**Estimated Effort**: 3-4 days

---

## 📊 Migration Progress (Updated: Nov 15, 2025)

**Current Status**: Phase 7 Complete - Studio-First UI Implemented

| Phase | Status |
|-------|--------|
| ✅ Phase 1: Audit & Document | Complete |
| ✅ Phase 2: Remove Drivers & Update Types | Complete |
| ✅ Phase 3: Simplify UI | Complete |
| ✅ Phase 4: Simplify Architecture | Complete |
| ✅ Phase 5: Update Documentation | Complete |
| ✅ Phase 6: Testing | Complete |
| ✅ Phase 7: Studio-First UI Implementation | Complete |
| 📋 Phase 8: Final Testing & Deployment | Not started |

**Overall**: ~95% complete

**Phase 7 Completed** (Studio-First UI):
- Implemented Studio-First approach (Option 1 from UI Simplification Proposal)
- Created simplified token storage system (`lib/valtown-token-storage.ts`)
- Created `ValtownStudioWrapper` component with inline token configuration
- Updated root route (`/`) to render Studio directly
- Removed connection management UI (moved `(outerbase)` and `(theme)` routes to `_old` directories)
- Moved `saved-connection-storage.ts` to `src/lib/` for better organization
- Updated branding to "Val Town Studio" throughout UI
- Changed "Back to bases" to "Disconnect" in sidebar menu
- Updated website metadata and descriptions

**Next Actions**:
- Run comprehensive test suite on new Studio-First flow
- Verify token persistence and driver initialization
- Test disconnect/reconnect functionality
- Performance validation

See [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) for detailed task tracking.

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

## Phase 2: Remove Drivers and Update Type System

**Duration**: 1.5 days

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

### Type System Updates:

#### 3. `/src/app/(theme)/connect/saved-connection-storage.ts`

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

#### 4. `/src/drivers/base-driver.ts`

**Before:**
```typescript
export type SupportedDialect = "sqlite" | "mysql" | "postgres" | "dolt";
```

**After:**
```typescript
export type SupportedDialect = "sqlite"; // Val Town uses SQLite dialect
```

#### 5. Global type cleanup

Run global search for:
- `"turso"`, `"postgres"`, `"mysql"`, `"rqlite"`, etc. in type definitions
- Update or remove as needed

### Validation:
- Run `npm install` after package.json changes
- Ensure no import errors remain
- Run TypeScript compiler: `npm run tsc`
- Fix any type errors
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

## Phase 4: Simplify Driver Architecture (Keep Extensibility)

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

## Phase 5: Update Documentation and Branding

**Duration**: 0.5 day

**Note**: This is a standalone deployment, so no migration handling for existing connections is needed.

### Documentation Updates:

#### 1. Update `/README.md`

**Key changes:**
- Update description: "A database GUI for Val Town SQLite"
- Remove references to other databases
- Simplify "Getting Started" to focus on Val Town
- Update feature list to reflect Val Town only
- Emphasize this is purpose-built for Val Town

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

## Phase 6: Testing and Validation

**Duration**: 1 day

### Testing Checklist:

#### Unit Tests:
- [ ] Val Town driver tests pass
- [ ] Factory function tests updated
- [ ] Type tests pass

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
- [ ] Error messages are clear
- [ ] No references to removed databases in UI

#### Build Tests:
- [ ] `npm run build` succeeds
- [ ] `npm run tsc` succeeds (no type errors)
- [ ] `npm run lint` succeeds
- [ ] No console errors
- [ ] Bundle size reduced (check with `npm run build`)

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

## Phase 7: Studio-First UI Implementation

**Duration**: 1 day

**Goal**: Radically simplify the UI by implementing a Studio-First approach where users land directly in the Studio interface, eliminating connection management pages entirely.

### Overview

Implemented Option 1 from the UI Simplification Proposal (see `VALTOWN_UI_SIMPLIFICATION_PROPOSAL.md`):
- Remove connections page entirely
- Studio IS the app - users land directly in the query editor
- Token configuration happens inline when no connection exists
- Single-token storage model (one Val Town token at a time)
- "Disconnect" replaces navigation back to connection list

### New Architecture

#### 1. Simplified Token Storage
Created `/src/lib/valtown-token-storage.ts`:
```typescript
export interface ValtownTokenData {
  token: string;
  name?: string;
}

export function getValtownToken(): ValtownTokenData | null
export function setValtownToken(data: ValtownTokenData): void
export function removeValtownToken(): void
export function hasValtownToken(): boolean
```

**Storage**: Uses `localStorage` with keys:
- `valtown_token` - The API token
- `valtown_connection_name` - Optional connection name

#### 2. Studio Wrapper Component
Created `/src/components/valtown-studio-wrapper.tsx`:
- Checks for stored token on mount
- Shows token configuration UI if no token exists
- Creates driver and renders Studio if token exists
- Handles disconnect via `onBack` callback

**Token Configuration UI includes**:
- Connection name input (optional)
- Token textarea
- Instructions with link to val.town/settings/api
- Clean, centered layout

#### 3. Root Route Update
Updated `/src/app/page.tsx`:
```typescript
export default function HomePage() {
  return (
    <ClientOnly>
      <ValtownStudioWrapper />
    </ClientOnly>
  );
}
```

**User Flow:**
1. User visits `/` (root)
2. If token exists → Studio loads immediately (0 clicks)
3. If no token → Token configuration UI appears
4. After entering token → Studio loads
5. Click "Disconnect" in settings → Returns to token configuration

### Files Changed

#### Created:
- `/src/lib/valtown-token-storage.ts` - Token storage utilities
- `/src/components/valtown-studio-wrapper.tsx` - Main wrapper component
- `/src/app/page.tsx` - New root route

#### Moved:
- `/src/app/(outerbase)/` → `/src/app/_outerbase_old/` (deactivated)
- `/src/app/(theme)/` → `/src/app/_theme_old/` (deactivated)
- `/src/app/(theme)/connect/saved-connection-storage.ts` → `/src/lib/saved-connection-storage.ts`

#### Modified:
- `/src/components/gui/sidebar-tab.tsx` - Updated branding and disconnect button
- `/src/const.ts` - Changed website name to "Val Town Studio"
- `/src/indexdb.ts` - Updated import path for saved-connection-storage
- `/src/drivers/helpers.ts` - Updated import path for saved-connection-storage
- `/src/drivers/board-source/local.tsx` - Updated import path

### Branding Updates

Changed throughout the codebase:
- **App Name**: "Outerbase Studio" → "Val Town Studio"
- **Tagline**: Updated to "A modern SQLite GUI for Val Town"
- **Sidebar Menu**: "Back to bases" → "Disconnect"
- **Description**: Updated in `const.ts` and metadata

### Removed UI Elements

**Eliminated completely:**
- Workspace navigation sidebar
- Connection list/grid pages
- "New Resource" dropdowns with driver selection
- Connection create/edit forms (separate pages)
- "Local" vs "Cloud" workspace distinction
- Connection cards and management UI
- Playground shortcuts from main UI (SQLite/MySQL playgrounds)

### User Experience Improvements

**Before (Complex):**
- 5-6 clicks to execute first query
- 4 different pages to navigate
- Connection management, workspace selection, driver choice

**After (Simplified):**
- 0 clicks if token saved
- 1 field + 1 click if new user
- Single page (Studio)
- Direct path to database work

### Token Management

**Single-token model:**
- One Val Town token active at a time
- Stored in localStorage (future: could support multiple saved tokens)
- Disconnect clears token and returns to configuration UI
- Token persists across sessions

**Future enhancement possibilities:**
- Add token list in settings dropdown
- "Switch Account" functionality
- Token validation/health check

### Backward Compatibility

**Migration for existing users:**
- Old connection data remains in IndexedDB (unused but not deleted)
- New users start fresh with simplified flow
- No breaking changes to driver layer or Studio component

**Old routes:**
- Moved to `_old` directories (not deleted)
- Can be restored if needed
- Preserved for reference during testing

### Testing Checklist

- [ ] Token storage works correctly (set/get/remove)
- [ ] Token configuration UI appears when no token
- [ ] Studio loads correctly with valid token
- [ ] Driver initialization works from stored token
- [ ] Disconnect button clears token and returns to config UI
- [ ] Token persists across browser sessions
- [ ] No console errors during flow
- [ ] Build succeeds with new structure

### Performance Benefits

- Eliminated multiple route/component loads
- Faster initial page load (single route)
- Reduced bundle size (removed connection management UI)
- Simpler React component tree

### Documentation

Created comprehensive proposal document:
- `VALTOWN_UI_SIMPLIFICATION_PROPOSAL.md` - Full analysis and alternatives
  - Option 1 (Studio-First) - IMPLEMENTED ✅
  - Option 2 (Minimal Connection Page) - Alternative approach
  - Option 3 (Hybrid) - Alternative approach
  - Comparison matrix and implementation details

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
| 2. Remove Drivers & Update Types | 1.5 days | 2 days |
| 3. Simplify UI | 1 day | 3 days |
| 4. Simplify Architecture | 0.5 day | 3.5 days |
| 5. Documentation | 0.5 day | 4 days |
| 6. Testing | 1 day | **5 days** |

**Total Estimated Time**: 4-5 days with buffer

---

## Questions to Answer Before Starting

1. **Branding**: Keep "Outerbase Studio" or rebrand to "Val Town Studio"?
2. **Feature Additions**: Are there Val Town-specific features we should add?
3. **Testing Strategy**: What's the testing approach for this migration?
4. **Release Strategy**: Version numbering and deployment plan?

---

## Next Steps

To begin execution:
1. Create a feature branch: `git checkout -b feat/valtown-only-migration`
2. Start with Phase 1 (Audit & Document)
3. Commit after each phase
4. Create PR for review before merging
5. Deploy to staging environment for validation
6. Announce breaking change to users
