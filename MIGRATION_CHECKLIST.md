# Val Town Migration Checklist

Quick reference for the moderate approach migration.

**Note**: Standalone deployment - no existing connection migration needed.

**Last Updated**: Nov 15, 2025
**Current Status**: Phase 2 (90% complete) - Dependencies cleanup needed

---

## Phase 1: Audit & Document ⚠️
- [x] Test current Val Town functionality
- [x] Document API endpoints and auth
- [x] Create dependency map

## Phase 2: Remove Drivers & Update Types (IN PROGRESS - 90%)
### Code Cleanup ✅
- [x] Delete 6 SQLite-based drivers (turso, rqlite, cloudflare-d1, starbase, sqljs, cloudflare-wae)
- [x] Delete postgres and mysql directories
- [x] Delete all connection templates except valtown
- [x] Remove from `/src/drivers/helpers.ts`: all driver imports except ValtownQueryable
- [x] Simplify `createLocalDriver()` to only support valtown
- [x] Update `SupportedDriver` to only `"valtown"` in saved-connection-storage.ts
- [x] Update `SupportedDialect` to only `"sqlite"` in base-driver.ts
- [x] Search and remove references to other drivers in types

### Dependencies & Build 🔄 **← NEXT STEP**
- [ ] Remove `@libsql/client` from package.json dependencies
- [ ] Remove `@libsql/client` from package.json overrides (if present)
- [ ] Remove `libsql-stateless-easy` from package.json (if present)
- [ ] Run `npm install`
- [ ] Run `npm run tsc` to verify
- [ ] Verify build: `npm run build`

## Phase 3: Simplify UI ✅
- [x] Update `/src/app/(outerbase)/new-resource-list.tsx` - return only val.town
- [x] Update ConnectionTemplateDictionary - keep only valtown
- [x] Fix Val Town href for workspace mode
- [ ] Remove unused database icons (optional - low priority)
- [ ] Test connection creation flow (pending Phase 2 completion)

## Phase 4: Simplify Architecture 📋
- [ ] Add documentation comments to base-driver.ts
- [ ] Add documentation comments to sqlite-base-driver.ts
- [x] Keep factory pattern but simplify (already done in helpers.ts)
- [ ] Review and clean unused DriverFlags options

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
| Phase 1: Audit & Document | ⚠️ Informal | ~80% |
| Phase 2: Remove Drivers & Types | 🔄 In Progress | 90% |
| Phase 3: Simplify UI | ✅ Complete | 95% |
| Phase 4: Architecture Docs | 📋 Not Started | 0% |
| Phase 5: Documentation | 📋 Not Started | 0% |
| Phase 6: Testing | 📋 Not Started | 0% |

**Overall Progress**: ~45%

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
