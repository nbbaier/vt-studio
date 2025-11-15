# Manual Testing Checklist - Val Town Studio

This checklist covers manual testing for the Studio-First UI implementation and Val Town-only migration.

**Date Created**: 2025-11-15
**Migration Phase**: Phase 6 - Testing & Validation

---

## Prerequisites

- [ ] Have a valid Val Town API token ready
  - Get one from: https://val.town/settings/api
- [ ] Browser with localStorage enabled
- [ ] Fresh browser session recommended for initial test

---

## 🎯 Core User Flow Tests

### 1. First-Time User Experience (No Token Stored)

- [ ] **Navigate to root (`/`)**
  - Should display token configuration UI immediately
  - UI should show:
    - "Val Town Studio" heading
    - Connection name input (optional)
    - Token textarea
    - Link to val.town/settings/api
    - Submit button

- [ ] **Test form validation**
  - Try submitting without token → Should show error
  - Enter invalid/whitespace-only token → Should show error

- [ ] **Enter valid token and submit**
  - Fill in connection name (optional): "My Val Town DB"
  - Paste valid Val Town API token
  - Click submit/connect
  - Should transition to Studio interface
  - No page reload should occur

### 2. Studio Interface Loads Successfully

- [ ] **Studio UI appears**
  - Left sidebar with schema browser visible
  - Main content area with SQL editor
  - Top toolbar with tabs system
  - Settings menu accessible

- [ ] **Branding is correct**
  - Title shows "Val Town Studio" (not "Outerbase Studio")
  - No references to other databases (Turso, Postgres, MySQL, etc.)

- [ ] **Check browser console**
  - No JavaScript errors
  - No failed network requests (other than expected API calls)

### 3. Database Operations

- [ ] **Execute a simple query**
  ```sql
  SELECT 1 as test;
  ```
  - Query executes successfully
  - Results display in table view
  - No errors in console

- [ ] **Browse schema** (if database has tables)
  - Click on database in sidebar
  - Should show list of tables
  - Click on a table
  - Should load table data in main view

- [ ] **Create a new table** (if permitted)
  ```sql
  CREATE TABLE test_migration (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
  - Execute successfully
  - Table appears in schema sidebar
  - Can browse table contents

- [ ] **Insert data**
  ```sql
  INSERT INTO test_migration (name) VALUES ('Test Row 1');
  ```
  - Executes successfully
  - Can query the data back

- [ ] **Transaction support**
  ```sql
  BEGIN TRANSACTION;
  INSERT INTO test_migration (name) VALUES ('Transaction Test');
  COMMIT;
  ```
  - Transaction executes successfully

### 4. Token Persistence

- [ ] **Refresh browser page**
  - Studio should reload automatically with same connection
  - No token re-entry required
  - Database state maintained

- [ ] **Close and reopen browser**
  - Navigate to root (`/`)
  - Studio should load automatically
  - Token persisted in localStorage

### 5. Disconnect Functionality

- [ ] **Locate disconnect button**
  - Open settings/sidebar menu
  - Should show "Disconnect" option (not "Back to bases")

- [ ] **Click disconnect**
  - Should clear connection
  - Should return to token configuration UI
  - localStorage should be cleared

- [ ] **Verify token is cleared**
  - Check browser DevTools → Application → Local Storage
  - Keys `valtown_token` and `valtown_connection_name` should be gone

### 6. Reconnect After Disconnect

- [ ] **Re-enter token**
  - Enter same or different connection name
  - Enter same or different token
  - Click submit

- [ ] **Studio loads again**
  - Successfully connects
  - Can execute queries
  - Schema visible

---

## 🧪 Edge Cases & Error Handling

### Invalid Token Scenarios

- [ ] **Enter expired/invalid token**
  - Submit token configuration
  - Should show appropriate error (may need to execute query first)
  - Error message should be clear

- [ ] **Token with insufficient permissions**
  - Test if error handling is graceful
  - User should understand what went wrong

### Network Issues

- [ ] **Test with slow connection**
  - Enable network throttling in DevTools
  - Operations should show loading states
  - No UI freezing

- [ ] **Test offline behavior**
  - Disable network
  - Appropriate error messages displayed

### Browser Compatibility

- [ ] **Test in Chrome/Chromium**
- [ ] **Test in Firefox**
- [ ] **Test in Safari** (if available)
- [ ] **Test in mobile browser** (responsive design)

---

## 🎨 UI/UX Validation

### Token Configuration UI

- [ ] **Layout is centered and clean**
- [ ] **Form inputs are properly styled**
- [ ] **Focus states work correctly** (keyboard navigation)
- [ ] **Button hover/active states work**
- [ ] **Error messages are visible and clear**
- [ ] **Link to Val Town API settings opens correctly**

### Studio Interface

- [ ] **Sidebar toggles correctly**
- [ ] **Tabs system works** (create new tab, switch tabs, close tabs)
- [ ] **SQL editor has syntax highlighting**
- [ ] **Table results scroll properly** (test with large result sets)
- [ ] **Responsive design works** (resize window)
- [ ] **Dark/light theme works** (if theme toggle exists)
- [ ] **Keyboard shortcuts work** (Cmd/Ctrl+Enter to run query, etc.)

### Accessibility

- [ ] **Tab navigation works throughout UI**
- [ ] **Focus indicators visible on all interactive elements**
- [ ] **Screen reader compatibility** (basic test with screen reader)
- [ ] **Adequate color contrast** (use browser DevTools accessibility checker)

---

## 🔍 Data Integrity Tests

### Query Results

- [ ] **SELECT queries return correct data**
- [ ] **Column types display correctly** (INTEGER, TEXT, REAL, BLOB)
- [ ] **NULL values display correctly**
- [ ] **Large text values are readable**
- [ ] **Date/time values format correctly**

### Data Editing (if supported)

- [ ] **Can edit cell values inline**
- [ ] **Changes persist correctly**
- [ ] **Undo/redo works**

### Export Functionality (if supported)

- [ ] **Can export query results to CSV**
- [ ] **Can export table data**
- [ ] **Exported files contain correct data**

---

## 📊 Performance Tests

### Initial Load

- [ ] **Measure time from navigation to Studio ready**
  - Target: < 3 seconds on good connection
  - Check Network tab in DevTools

- [ ] **Check bundle size**
  - First Load JS for `/` route: ~682 kB (from build output)
  - No unusually large chunks

### Query Execution

- [ ] **Simple queries execute quickly** (< 500ms)
- [ ] **Complex queries show loading state**
- [ ] **Large result sets render without freezing UI**
  - Test with: `SELECT * FROM table LIMIT 10000;` (if possible)

### Memory Usage

- [ ] **No memory leaks during extended use**
  - Open DevTools → Memory
  - Take heap snapshot before operations
  - Execute queries, browse tables for 5-10 minutes
  - Take another heap snapshot
  - Check for unexpected growth

---

## 🚫 Migration Validation

### No References to Removed Features

- [ ] **Search UI for "Turso"** → Should find nothing visible to user
- [ ] **Search UI for "Postgres"** → Should find nothing visible to user
- [ ] **Search UI for "MySQL"** → Should find nothing visible to user
- [ ] **Search UI for "LibSQL"** → Should find nothing visible to user
- [ ] **No "Select Database Type" dropdowns**
- [ ] **No workspace/account management UI visible**
- [ ] **No connection list/grid pages**

### Val Town-Specific Features

- [ ] **Only Val Town connection option available**
- [ ] **Documentation mentions Val Town exclusively**
- [ ] **No confusing multi-database language**

---

## 📝 Console Checks

Throughout all testing, monitor browser console for:

- [ ] **No JavaScript errors**
- [ ] **No React warnings** (key props, etc.)
- [ ] **No failed network requests** (except intentional error tests)
- [ ] **No deprecation warnings**
- [ ] **Appropriate logging only** (no spam)

---

## ✅ Success Criteria

All tests above should pass with:
- ✅ No critical bugs or errors
- ✅ Smooth user experience for first-time and returning users
- ✅ Token persistence working correctly
- ✅ Disconnect/reconnect flow functioning
- ✅ Database operations executing successfully
- ✅ No references to removed database providers
- ✅ Performance within acceptable ranges
- ✅ Accessible and responsive UI

---

## 🐛 Bug Reporting

If any test fails, document:
1. **Test step that failed**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser/environment details**
5. **Console errors** (if any)
6. **Steps to reproduce**
7. **Screenshots/videos** (if helpful)

---

## 📋 Test Results

**Tester Name**: _____________
**Test Date**: _____________
**Browser**: _____________
**OS**: _____________

**Overall Result**: ⬜ PASS / ⬜ FAIL / ⬜ PASS WITH ISSUES

**Notes**:
```
[Add any observations, issues found, or recommendations here]
```

---

## Next Steps After Manual Testing

Once all manual tests pass:
1. Document any issues found and create tickets
2. Perform final bundle size analysis
3. Update migration documentation to "Complete"
4. Prepare for deployment
5. Plan post-deployment smoke tests
