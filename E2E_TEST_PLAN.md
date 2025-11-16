# Val Town Studio - End-to-End Test Plan

## Document Information

**Project:** Val Town Studio
**Test Type:** End-to-End (E2E) Testing
**Testing Framework:** Playwright
**Last Updated:** November 16, 2025
**Status:** Ready for Implementation

## Executive Summary

This document outlines the comprehensive end-to-end testing strategy for Val Town Studio, a browser-based SQLite database GUI for Val Town. The test plan covers all critical user journeys from initial token configuration through database operations, ensuring reliability, accessibility, and user experience quality.

## Test Objectives

### Primary Goals

1. **Validate Critical User Paths** - Ensure all essential user flows work end-to-end
2. **Verify Data Integrity** - Confirm database operations execute correctly
3. **Ensure Accessibility** - Validate WCAG 2.1 AA compliance
4. **Test Cross-Browser Compatibility** - Verify functionality across major browsers
5. **Validate Error Handling** - Ensure graceful degradation and error recovery

### Success Criteria

- ✅ 100% of critical user paths pass
- ✅ All tests pass on Chrome, Firefox, Safari
- ✅ Zero critical bugs in production flows
- ✅ Accessibility score of 90+ (automated tools)
- ✅ Test suite completes in < 10 minutes

## Scope

### In Scope

- ✅ Token configuration and authentication
- ✅ Studio interface and navigation
- ✅ SQL query execution (SELECT, INSERT, UPDATE, DELETE, CREATE)
- ✅ Result display and data visualization
- ✅ Schema browsing and exploration
- ✅ Token persistence and session management
- ✅ Disconnect and reconnect flows
- ✅ Error handling and recovery
- ✅ Keyboard navigation and accessibility
- ✅ Mobile responsive behavior

### Out of Scope

- ❌ Backend Val Town API testing (covered by Val Town)
- ❌ Unit tests (covered by Jest)
- ❌ Performance benchmarking (separate test plan)
- ❌ Security penetration testing (separate audit)
- ❌ Load testing (separate test plan)

## Test Environment

### Test Configurations

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local Dev | http://localhost:3008 | Development and debugging |
| Staging | TBD | Pre-production validation |
| Production | TBD | Smoke tests post-deployment |

### Browser Matrix

| Browser | Version | Desktop | Mobile |
|---------|---------|---------|--------|
| Chrome | Latest | ✅ | ✅ (Pixel 5) |
| Firefox | Latest | ✅ | ❌ |
| Safari | Latest | ✅ | ✅ (iPhone 12) |
| Edge | Latest | ❌ | ❌ |

### Test Data

**Mock API Tokens:**
- Valid: `test-valid-token-123456`
- Invalid: `invalid-token`
- Expired: `expired-token-789`

**Sample Databases:**
- Users table (3 columns, 100 rows)
- Posts table (5 columns, 500 rows)
- Empty database

## Test Strategy

### Testing Approach

1. **Page Object Model (POM)** - Maintainable, reusable page abstractions
2. **API Mocking** - Fast, reliable tests without external dependencies
3. **Parallel Execution** - Run independent tests concurrently
4. **Visual Regression** - Screenshot comparison for UI consistency (future)
5. **Accessibility Scanning** - Automated WCAG validation

### Test Levels

```
┌─────────────────────────────────────────┐
│  E2E Tests (Playwright)                 │  ← This Test Plan
│  - Full user journeys                   │
│  - Cross-browser validation             │
│  - Integration with mocked APIs         │
└─────────────────────────────────────────┘
           ↑ Calls ↑
┌─────────────────────────────────────────┐
│  Integration Tests (Jest)               │  ← Existing
│  - Component integration                │
│  - Driver layer testing                 │
└─────────────────────────────────────────┘
           ↑ Uses ↑
┌─────────────────────────────────────────┐
│  Unit Tests (Jest)                      │  ← Existing
│  - SQL parsing                          │
│  - Utility functions                    │
└─────────────────────────────────────────┘
```

## Critical User Paths

### Path 1: First-Time User Setup

**Priority:** P0 (Critical)

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Visit App   │ ───> │  Enter Token │ ───> │ Studio Loads │
└──────────────┘      └──────────────┘      └──────────────┘
```

**Steps:**
1. User navigates to root URL (/)
2. Token configuration UI displays
3. User enters Val Town API token
4. User clicks "Connect"
5. Studio interface loads with SQL editor

**Expected Results:**
- Token config UI appears within 2 seconds
- Link to val.town/settings/api is present
- Connect button disabled until token entered
- Successful connection transitions to Studio
- Token persists in localStorage

**Test Coverage:** `01-token-configuration.spec.ts`

---

### Path 2: Returning User

**Priority:** P0 (Critical)

```
┌──────────────┐      ┌──────────────┐
│  Visit App   │ ───> │ Studio Loads │
│ (has token)  │      │  Immediately │
└──────────────┘      └──────────────┘
```

**Steps:**
1. User with saved token navigates to /
2. Studio loads immediately (no token config)

**Expected Results:**
- Studio appears within 3 seconds
- No token configuration step
- User can immediately execute queries

**Test Coverage:** `04-token-persistence.spec.ts`

---

### Path 3: Execute SQL Query

**Priority:** P0 (Critical)

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Type SQL    │ ───> │ Click Execute│ ───> │View Results  │
└──────────────┘      └──────────────┘      └──────────────┘
```

**Steps:**
1. User types SQL query in editor
2. User clicks "Execute" or presses Ctrl+Enter
3. Query sent to Val Town API
4. Results displayed in table

**Expected Results:**
- SQL editor accepts input
- Execute button clickable
- Results appear within 5 seconds
- Columns and rows displayed correctly
- NULL values shown appropriately

**Test Coverage:** `03-query-execution.spec.ts`

---

### Path 4: Browse Schema

**Priority:** P1 (High)

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ View Sidebar │ ───> │ Click Table  │ ───> │View Table Data│
└──────────────┘      └──────────────┘      └──────────────┘
```

**Steps:**
1. User sees schema sidebar on left
2. Tables listed in tree view
3. User clicks table name
4. Table data loads in new tab

**Expected Results:**
- Schema sidebar visible on load
- Tables appear within 3 seconds
- Clicking table opens data view
- Table structure shown (columns, types)

**Test Coverage:** `05-schema-browsing.spec.ts`

---

### Path 5: Handle Query Error

**Priority:** P1 (High)

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│Execute Invalid│ ───>│ See Error    │ ───> │ Fix & Retry  │
│     SQL      │      │   Message    │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

**Steps:**
1. User executes invalid SQL
2. Error message displays
3. User corrects SQL
4. User re-executes successfully

**Expected Results:**
- Error shown within 2 seconds
- Error message is clear and actionable
- Previous results cleared
- Error clears on successful query

**Test Coverage:** `06-error-handling.spec.ts`

---

### Path 6: Disconnect and Reconnect

**Priority:** P1 (High)

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Click        │ ───> │ Return to    │ ───> │ Reconnect    │
│  Disconnect  │      │ Token Config │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

**Steps:**
1. User clicks settings menu
2. User clicks "Disconnect"
3. Token cleared, returns to token config
4. User enters token again
5. Studio loads

**Expected Results:**
- Disconnect button visible in settings
- Token cleared from localStorage
- Token config UI appears
- Can reconnect with same or different token

**Test Coverage:** `04-token-persistence.spec.ts`

## Test Cases by Category

### 1. Token Configuration (8 tests)

| ID | Test Name | Priority | Status |
|----|-----------|----------|--------|
| TC-01 | Show token config when no token | P0 | ✅ |
| TC-02 | Link to Val Town API settings | P1 | ✅ |
| TC-03 | Enable connect button with token | P0 | ✅ |
| TC-04 | Connect successfully with valid token | P0 | ✅ |
| TC-05 | Show error with invalid token | P0 | ✅ |
| TC-06 | Persist connection name | P2 | ✅ |
| TC-07 | Handle empty token | P1 | ✅ |
| TC-08 | Validate token format | P2 | ⏸️ |

### 2. Studio Interface (10 tests)

| ID | Test Name | Priority | Status |
|----|-----------|----------|--------|
| TC-10 | Load Studio with valid token | P0 | ✅ |
| TC-11 | SQL editor ready for input | P0 | ✅ |
| TC-12 | Execute query button present | P0 | ✅ |
| TC-13 | Schema sidebar visible | P1 | ✅ |
| TC-14 | Settings menu with disconnect | P1 | ✅ |
| TC-15 | Multiple tabs support | P2 | ✅ |
| TC-16 | Preserve SQL when switching tabs | P1 | ✅ |
| TC-17 | Keyboard shortcuts work | P2 | ✅ |
| TC-18 | Val Town branding displayed | P2 | ✅ |
| TC-19 | Responsive on mobile | P1 | ✅ |

### 3. Query Execution (13 tests)

| ID | Test Name | Priority | Status |
|----|-----------|----------|--------|
| TC-20 | Execute SELECT query | P0 | ✅ |
| TC-21 | Display results in table | P0 | ✅ |
| TC-22 | Show column headers | P0 | ✅ |
| TC-23 | Handle query errors | P0 | ✅ |
| TC-24 | Execute CREATE TABLE | P1 | ✅ |
| TC-25 | Execute INSERT statement | P1 | ✅ |
| TC-26 | Execute UPDATE statement | P1 | ✅ |
| TC-27 | Execute DELETE statement | P1 | ✅ |
| TC-28 | Handle empty query | P2 | ✅ |
| TC-29 | Clear previous results | P1 | ✅ |
| TC-30 | Handle large result sets | P1 | ✅ |
| TC-31 | Support SQL comments | P2 | ✅ |
| TC-32 | Display NULL values | P1 | ✅ |

### 4. Token Persistence (7 tests)

| ID | Test Name | Priority | Status |
|----|-----------|----------|--------|
| TC-40 | Persist token across reloads | P0 | ✅ |
| TC-41 | Persist across sessions | P0 | ✅ |
| TC-42 | Return to config on disconnect | P0 | ✅ |
| TC-43 | Clear connection name | P1 | ✅ |
| TC-44 | Allow reconnect after disconnect | P1 | ✅ |
| TC-45 | Handle expired token | P1 | ✅ |
| TC-46 | Preserve token during navigation | P1 | ✅ |

### 5. Schema Browsing (8 tests)

| ID | Test Name | Priority | Status |
|----|-----------|----------|--------|
| TC-50 | Display schema sidebar | P1 | ✅ |
| TC-51 | List database tables | P1 | ✅ |
| TC-52 | Open table when clicked | P1 | ✅ |
| TC-53 | Show table columns | P1 | ✅ |
| TC-54 | Show column types | P2 | ✅ |
| TC-55 | Refresh schema | P2 | ✅ |
| TC-56 | Show views in sidebar | P2 | ✅ |
| TC-57 | Handle empty database | P1 | ✅ |

### 6. Error Handling (10 tests)

| ID | Test Name | Priority | Status |
|----|-----------|----------|--------|
| TC-60 | SQL syntax error | P0 | ✅ |
| TC-61 | Non-existent table error | P0 | ✅ |
| TC-62 | Invalid token error | P0 | ✅ |
| TC-63 | Network error handling | P1 | ✅ |
| TC-64 | API timeout handling | P1 | ✅ |
| TC-65 | Permission denied error | P1 | ✅ |
| TC-66 | Clear error on success | P1 | ✅ |
| TC-67 | Malformed API response | P2 | ✅ |
| TC-68 | User-friendly error messages | P1 | ✅ |
| TC-69 | Constraint violation error | P2 | ⏸️ |

### 7. Accessibility (9 tests)

| ID | Test Name | Priority | Status |
|----|-----------|----------|--------|
| TC-70 | Keyboard navigation | P1 | ✅ |
| TC-71 | ARIA labels on buttons | P1 | ✅ |
| TC-72 | Semantic HTML structure | P1 | ✅ |
| TC-73 | Focus indicators | P1 | ✅ |
| TC-74 | Screen reader announcements | P1 | ✅ |
| TC-75 | Descriptive page title | P2 | ✅ |
| TC-76 | Color contrast compliance | P1 | ✅ |
| TC-77 | Reduced motion support | P2 | ✅ |
| TC-78 | Skip to main content | P2 | ✅ |

## Test Execution

### Pre-Execution Checklist

- [ ] Development server running (`npm run dev`)
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Environment variables configured
- [ ] Test data prepared
- [ ] API mocks configured

### Execution Schedule

**Local Development:**
- Run on every commit (pre-commit hook)
- Full suite before PR

**CI/CD Pipeline:**
- Run on every push to feature branch
- Run on every PR
- Run on merge to main
- Run nightly for extended tests

### Command Reference

```bash
# Run all tests
npx playwright test

# Run with UI (interactive mode)
npx playwright test --ui

# Run specific category
npx playwright test 01-token-configuration
npx playwright test 03-query-execution

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox

# Debug mode
npx playwright test --debug

# Generate report
npx playwright show-report
```

## Defect Management

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P0 (Critical) | Blocks critical user path | Fix immediately |
| P1 (High) | Degrades user experience | Fix within 24h |
| P2 (Medium) | Minor impact | Fix within 1 week |
| P3 (Low) | Cosmetic issue | Fix when possible |

### Bug Report Template

```markdown
## Bug Description
[Brief description]

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Result
[What should happen]

## Actual Result
[What actually happens]

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Test: TC-XX

## Screenshots
[Attach screenshots]

## Logs
[Attach console logs]
```

## Metrics and Reporting

### Key Metrics

- **Test Pass Rate:** Target > 98%
- **Execution Time:** Target < 10 minutes
- **Flakiness Rate:** Target < 2%
- **Code Coverage:** Target > 80% (for tested components)

### Reports Generated

1. **HTML Report** - Visual test results with screenshots
2. **JUnit XML** - For CI integration
3. **Trace Files** - For debugging failures
4. **Video Recordings** - On failure only

## Maintenance

### Review Schedule

- **Weekly:** Review failed tests and flaky tests
- **Monthly:** Review and update test data
- **Quarterly:** Review and update test strategy

### Adding New Tests

1. Create test file in appropriate category
2. Use page object model pattern
3. Add test to this document
4. Update README in `tests/e2e/`
5. Run locally and verify
6. Submit PR with tests

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Flaky tests | High | Medium | Use explicit waits, stable selectors |
| API changes | High | Low | Mock API, maintain test fixtures |
| Browser updates | Medium | Medium | Pin browser versions, test matrix |
| Test maintenance | Medium | High | Use POM, clear documentation |

## Appendices

### Appendix A: Data-TestId Conventions

Components should use these `data-testid` attributes:

```tsx
// Buttons
data-testid="execute-query-btn"
data-testid="connect-btn"
data-testid="disconnect-btn"

// Containers
data-testid="studio-container"
data-testid="token-config"
data-testid="query-results"

// Lists
data-testid="table-item"
data-testid="result-row"
data-testid="result-cell"

// Inputs
data-testid="token-input"
data-testid="name-input"
```

### Appendix B: CI/CD Integration

**GitHub Actions Workflow:**

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Appendix C: Resources

- [Playwright Documentation](https://playwright.dev)
- [Val Town API Docs](https://docs.val.town)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Page Object Model](https://playwright.dev/docs/pom)

---

**Document Version:** 1.0
**Approved By:** [Pending]
**Next Review Date:** [After implementation]
