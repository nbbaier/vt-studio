# Val Town Migration Checklist

Quick reference for the moderate approach migration.

**Note**: Standalone deployment - no existing connection migration needed.

**Last Updated**: Nov 15, 2025
**Current Status**: Phase 4 (95% complete) - Architecture documentation complete

---

## Phase 1: Audit & Document ✅
- [x] Test current Val Town functionality
- [x] Document API endpoints and auth
- [x] Create dependency map

## Phase 2: Remove Drivers & Update Types ✅ COMPLETE
### Code Cleanup ✅
- [x] Delete 6 SQLite-based drivers (turso, rqlite, cloudflare-d1, starbase, sqljs, cloudflare-wae)
- [x] Delete postgres and mysql directories
- [x] Delete all connection templates except valtown
- [x] Delete obsolete directories (starbase, mysql playground, dolt extension)
- [x] Remove from `/src/drivers/helpers.ts`: all driver imports except ValtownQueryable
- [x] Simplify `createLocalDriver()` to only support valtown
- [x] Update `SupportedDriver` to only `"valtown"` in saved-connection-storage.ts
- [x] Update `SupportedDialect` to only `"sqlite"` in base-driver.ts
- [x] Search and remove references to other drivers in types
- [x] Fix all TypeScript errors related to removed drivers

### Dependencies & Build ✅
- [x] Remove `@libsql/client` from package.json dependencies
- [x] Remove `@opennextjs/cloudflare` (caused build issues)
- [x] Remove @libsql/client imports from valtown.ts (added local types)
- [x] Run `npm install`
- [x] Run `npm run tsc` to verify - PASSED
- [x] Verify build: `npm run build` - PASSED

### Files Fixed (23 files total) ✅
- [x] `/src/core/standard-extension.tsx` - Removed MySQL/Postgres extension functions
- [x] `/src/app/(theme)/embed/[driver]/page-client.tsx` - SQLite only
- [x] `/src/app/(outerbase)/w/[workspaceId]/[baseId]/page.tsx` - SQLite only
- [x] `/src/outerbase-cloud/database/utils.ts` - SQLite only
- [x] `/src/app/(theme)/client/s/[[...driver]]/page-client.tsx` - SQLite only
- [x] `/src/components/gui/query-explanation.tsx` - SQLite only
- [x] `/src/components/gui/schema-editor/column-default-value-input.tsx` - Removed Postgres checks
- [x] `/src/components/gui/schema-sidebar-list.tsx` - Removed Postgres logic
- [x] `/src/components/gui/tabs/query-tab.tsx` - SQLite EXPLAIN only
- [x] `/src/app/(outerbase)/local/page.tsx` - Removed old driver references
- [x] `/src/app/(outerbase)/local/edit-base/[baseId]/page.tsx` - Val Town only
- [x] `/src/app/(outerbase)/local/new-base/[driver]/page.tsx` - Val Town only
- [x] `/src/app/(outerbase)/account/editor-theme.tsx` - Changed to SQLite
- [x] `/src/app/(outerbase)/resource-item-helper.tsx` - Fixed function call
- [x] `/src/app/api/events/insert-tracking-record.ts` - Disabled analytics (StarbaseQuery removed)
- [x] `/src/app/storybook/column-type/page.tsx` - SQLite types
- [x] `/src/app/(theme)/playground/client/page-client.tsx` - Type fixes for sql.js
- [x] `/src/drivers/database/sqljs.ts` - Restored, removed @libsql/client dependency
- [x] `/src/drivers/database/valtown.ts` - Added local InStatement and ResultSet types

## Phase 3: Simplify UI ✅ COMPLETE
- [x] Update `/src/app/(outerbase)/new-resource-list.tsx` - return only val.town
- [x] Update ConnectionTemplateDictionary - keep only valtown
- [x] Fix Val Town href for workspace mode
- [ ] Remove unused database icons (optional - low priority)
- [x] Connection creation flow verified working

## Phase 4: Simplify Architecture ✅ COMPLETE
- [x] Add documentation comments to base-driver.ts
- [x] Add documentation comments to sqlite-base-driver.ts
- [x] Keep factory pattern but simplify (already done in helpers.ts)
- [x] Documentation added to driver architecture files

## Phase 5: Documentation 📋
- [ ] Update README.md - focus on Val Town (currently lists all old databases)
- [ ] Delete non-Val Town database docs in `/src/app/(public)/docs/`
- [ ] Update package.json description and keywords
- [ ] Review all user-facing text
- [ ] Decide on branding (keep Outerbase or rename)
- [ ] Emphasize standalone deployment for Val Town

## Phase 6: Testing 📋
- [ ] All unit tests pass
- [ ] Integration tests (create connection, query, transactions, etc.)
- [ ] UI tests (no references to removed DBs)
- [ ] Build tests (build, tsc, lint all pass)
- [ ] Performance validation (bundle size reduced)

## Progress Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Audit & Document | ✅ Complete | 100% |
| Phase 2: Remove Drivers & Types | ✅ Complete | 100% |
| Phase 3: Simplify UI | ✅ Complete | 100% |
| Phase 4: Architecture Docs | ✅ Complete | 100% |
| Phase 5: Documentation | 📋 Not Started | 0% |
| Phase 6: Testing | 📋 Not Started | 0% |

**Overall Progress**: ~75%

## Final Checklist
- [ ] All phases complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Bundle size reduced
- [ ] Committed to feature branch
- [ ] Ready for deployment

---

## 🎯 Immediate Next Actions

**Priority 1: Complete Phase 2 (Dependencies)**
1. Remove `@libsql/client` from package.json
2. Run `npm install`
3. Verify TypeScript and build

**Priority 2: Phase 4 (Architecture Documentation)**
4. Add comments to base-driver.ts
5. Add comments to sqlite-base-driver.ts

**Priority 3: Phase 5 (Update Documentation)**
6. Update README.md
7. Update package.json metadata
8. Remove old database docs

**Priority 4: Phase 6 (Testing)**
9. Run full test suite
10. Verify build size reduction

---

## Quick Commands

```bash
# Verify TypeScript
npm run tsc

# Run build
npm run build

# Run tests
npm test

# Check bundle size
npm run build && du -sh .next/

# Commit progress
git add .
git commit -m "Phase X: [description]"
```

## Important Files to Modify

| File | Action |
|------|--------|
| `/src/drivers/helpers.ts` | Simplify to Val Town only |
| `/src/app/(outerbase)/new-resource-list.tsx` | Show only Val Town |
| `/src/app/(theme)/connect/saved-connection-storage.ts` | Update types |
| `/package.json` | Remove unused deps |
| `/README.md` | Update docs |

## Files to Keep
- `/src/drivers/database/valtown.ts` ✓
- `/src/drivers/base-driver.ts` ✓
- `/src/drivers/sqlite-base-driver.ts` ✓
- `/src/components/connection-config-editor/template/valtown.tsx` ✓

## Estimated Bundle Size Reduction
- Before: ~XX MB (measure with current build)
- After: Estimated 15-20% reduction (removing postgres, mysql, libsql deps)
