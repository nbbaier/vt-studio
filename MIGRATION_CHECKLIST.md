# Val Town Migration Checklist

Quick reference for the moderate approach migration.

**Note**: Standalone deployment - no existing connection migration needed.

## Phase 1: Audit & Document ✓
- [ ] Test current Val Town functionality
- [ ] Document API endpoints and auth
- [ ] Create dependency map

## Phase 2: Remove Drivers & Update Types ✓
- [ ] Delete 6 SQLite-based drivers (turso, rqlite, cloudflare-d1, starbase, sqljs, cloudflare-wae)
- [ ] Delete postgres and mysql directories
- [ ] Delete all connection templates except valtown
- [ ] Remove from `/src/drivers/helpers.ts`: all driver imports except ValtownQueryable
- [ ] Simplify `createLocalDriver()` to only support valtown
- [ ] Remove `@libsql/client` and `libsql-stateless-easy` from package.json
- [ ] Update `SupportedDriver` to only `"valtown"` in saved-connection-storage.ts
- [ ] Update `SupportedDialect` to only `"sqlite"` in base-driver.ts
- [ ] Search and remove references to other drivers in types
- [ ] Run `npm install`
- [ ] Run `npm run tsc` to verify
- [ ] Verify build: `npm run build`

## Phase 3: Simplify UI ✓
- [ ] Update `/src/app/(outerbase)/new-resource-list.tsx` - return only val.town
- [ ] Update ConnectionTemplateDictionary - keep only valtown
- [ ] Remove unused database icons (optional)
- [ ] Test connection creation flow

## Phase 4: Simplify Architecture ✓
- [ ] Add documentation comments to base-driver.ts
- [ ] Add documentation comments to sqlite-base-driver.ts
- [ ] Keep factory pattern but simplify
- [ ] Review and clean unused DriverFlags options

## Phase 5: Documentation ✓
- [ ] Update README.md - focus on Val Town
- [ ] Delete non-Val Town database docs
- [ ] Update package.json description
- [ ] Review all user-facing text
- [ ] Decide on branding (keep Outerbase or rename)
- [ ] Emphasize standalone deployment for Val Town

## Phase 6: Testing ✓
- [ ] All unit tests pass
- [ ] Integration tests (create connection, query, transactions, etc.)
- [ ] UI tests (no references to removed DBs)
- [ ] Build tests (build, tsc, lint all pass)
- [ ] Performance validation (bundle size reduced)

## Final Checklist
- [ ] All phases complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Bundle size reduced
- [ ] Committed to feature branch
- [ ] Ready for deployment

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
