# Val Town Studio - E2E Test Suite

Comprehensive end-to-end test suite for Val Town Studio using Playwright.

## Overview

This test suite validates the entire user journey from token configuration through to database operations in the Studio interface.

## Test Structure

```
tests/e2e/
├── fixtures/
│   └── test-helpers.ts          # Helper utilities and test data
├── page-objects/
│   ├── studio.page.ts           # Studio interface page object
│   └── token-config.page.ts     # Token configuration page object
├── 01-token-configuration.spec.ts   # Token setup and validation
├── 02-studio-interface.spec.ts      # Studio UI and navigation
├── 03-query-execution.spec.ts       # SQL query execution
├── 04-token-persistence.spec.ts     # Session management
├── 05-schema-browsing.spec.ts       # Database schema exploration
├── 06-error-handling.spec.ts        # Error scenarios
├── 07-accessibility.spec.ts         # A11y compliance
└── README.md                        # This file
```

## Test Categories

### 1. Token Configuration (`01-token-configuration.spec.ts`)

Tests the first-time user experience and token setup:

- ✅ Token configuration UI displays correctly
- ✅ Link to Val Town API settings present
- ✅ Connect button enables/disables appropriately
- ✅ Successful connection with valid token
- ✅ Error handling for invalid tokens
- ✅ Connection name persistence
- ✅ Empty token validation

**Critical User Flow:** New user → Enter token → Connect → Studio loads

### 2. Studio Interface (`02-studio-interface.spec.ts`)

Tests the main Studio UI and components:

- ✅ Studio loads with valid token
- ✅ SQL editor ready for input
- ✅ Execute query button present
- ✅ Schema sidebar visible
- ✅ Settings menu with disconnect option
- ✅ Multiple tabs support
- ✅ SQL preservation when switching tabs
- ✅ Keyboard shortcuts
- ✅ Val Town branding displayed
- ✅ Responsive on mobile viewports

**Critical User Flow:** Token exists → Studio loads → UI components accessible

### 3. Query Execution (`03-query-execution.spec.ts`)

Tests SQL query execution and result display:

- ✅ Execute SELECT queries successfully
- ✅ Display results in table format
- ✅ Show column headers
- ✅ Handle query errors gracefully
- ✅ Execute CREATE TABLE statements
- ✅ Execute INSERT/UPDATE/DELETE statements
- ✅ Handle empty queries
- ✅ Clear previous results
- ✅ Handle large result sets (1000+ rows)
- ✅ Support SQL comments
- ✅ Display NULL values correctly

**Critical User Flow:** Type SQL → Execute → View results

### 4. Token Persistence (`04-token-persistence.spec.ts`)

Tests session management and authentication:

- ✅ Token persists across page reloads
- ✅ Token persists across browser sessions
- ✅ Return to token config when disconnecting
- ✅ Clear connection name on disconnect
- ✅ Allow reconnecting after disconnect
- ✅ Handle expired tokens gracefully
- ✅ Preserve token during navigation

**Critical User Flow:** Connect → Reload → Still connected → Disconnect → Reconnect

### 5. Schema Browsing (`05-schema-browsing.spec.ts`)

Tests database schema exploration:

- ✅ Display schema sidebar
- ✅ List database tables
- ✅ Open table when clicked
- ✅ Show table columns in schema tree
- ✅ Show column types
- ✅ Support refreshing schema
- ✅ Show views in schema sidebar
- ✅ Handle empty database

**Critical User Flow:** Browse schema → Click table → View data

### 6. Error Handling (`06-error-handling.spec.ts`)

Tests error scenarios and recovery:

- ✅ Show error for SQL syntax errors
- ✅ Show error for non-existent tables
- ✅ Show error for invalid tokens
- ✅ Handle network errors gracefully
- ✅ Handle API timeout
- ✅ Show error for permission denied
- ✅ Clear error on successful query
- ✅ Handle malformed API responses
- ✅ Show user-friendly error messages

**Critical User Flow:** Execute invalid SQL → See error → Fix SQL → Execute → Success

### 7. Accessibility (`07-accessibility.spec.ts`)

Tests accessibility compliance:

- ✅ Keyboard navigation (token config)
- ✅ Proper ARIA labels on buttons
- ✅ Semantic HTML structure
- ✅ Proper focus indicators
- ✅ Screen reader announcements for errors
- ✅ Descriptive page title
- ✅ Contrast-compliant colors
- ✅ Support reduced motion preferences
- ✅ Skip to main content link

**Critical User Flow:** Navigate entire app with keyboard only

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests

```bash
# Run all E2E tests
npx playwright test

# Run with UI mode (recommended for development)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed
```

### Run Specific Test Files

```bash
# Run only token configuration tests
npx playwright test 01-token-configuration

# Run only query execution tests
npx playwright test 03-query-execution
```

### Run Tests by Browser

```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Debug Tests

```bash
# Run with debugger
npx playwright test --debug

# Run specific test with debugger
npx playwright test 01-token-configuration --debug
```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL:** `http://localhost:3008` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Timeout:** Default test timeout is 30s
- **Retries:** 2 retries on CI, 0 locally
- **Workers:** 1 worker on CI, parallel locally
- **Browsers:** Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Test Data

Test data and helpers are in `fixtures/test-helpers.ts`:

```typescript
TEST_DATA = {
  validToken: 'test-valid-token-123456',
  invalidToken: 'invalid-token',
  connectionName: 'Test Connection',
  sampleQueries: { ... },
  sampleResults: { ... },
}
```

## Page Object Model

Tests use the Page Object Model pattern for maintainability:

### StudioPage

Encapsulates Studio interface interactions:
- `typeSQL(sql)` - Type into SQL editor
- `executeQuery()` - Click execute button
- `getResultRowCount()` - Count result rows
- `clickDisconnect()` - Disconnect from database

### TokenConfigPage

Encapsulates token configuration interactions:
- `fillToken(token)` - Enter API token
- `connectWithToken(token, name?)` - Fill and connect
- `hasError()` - Check for error message

## Mocking Val Town API

Tests use API mocking to avoid real API calls:

```typescript
const apiMock = new ValtownAPIMock(page);

// Mock successful query
await apiMock.mockSuccessfulQuery({
  columns: ['id', 'name'],
  rows: [[1, 'John'], [2, 'Jane']],
});

// Mock error response
await apiMock.mockFailedQuery('Syntax error');

// Mock unauthorized
await apiMock.mockUnauthorized();
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Reports

After running tests:

```bash
# View HTML report
npx playwright show-report
```

Reports include:
- Test results and timing
- Screenshots on failure
- Video recordings on failure
- Trace files for debugging

## Adding New Tests

### 1. Create New Spec File

```typescript
import { test, expect } from '@playwright/test';
import { StudioPage } from './page-objects/studio.page';

test.describe('My New Feature', () => {
  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### 2. Update This README

Document the new test category and critical user flows.

### 3. Add to CI Pipeline

Ensure new tests run in CI (should happen automatically).

## Important Notes

### Data Attributes for Testing

Components should use `data-testid` attributes for reliable selectors:

```tsx
<button data-testid="execute-query-btn">Run</button>
```

### Test Independence

- Each test should be independent
- Use `beforeEach` to set up clean state
- Clear localStorage between tests
- Mock API responses for each test

### Performance

- Tests run in parallel by default
- Use API mocking to avoid network latency
- Keep tests focused and fast

### Flakiness

If tests are flaky:
1. Add explicit waits: `await page.waitForSelector()`
2. Use `waitFor` with timeout
3. Check for race conditions
4. Review API mock timing

## Troubleshooting

### Tests Fail Locally

1. Ensure dev server is running: `npm run dev`
2. Clear localStorage: Use incognito mode or clear manually
3. Check Playwright version: `npx playwright --version`

### Tests Pass Locally but Fail on CI

1. Check timing issues (CI is slower)
2. Increase timeouts
3. Add more explicit waits
4. Review screenshots/videos from CI artifacts

### API Mocking Not Working

1. Verify route URL matches exactly
2. Check timing (await route before navigation)
3. Use `page.route()` before navigating to page

## Coverage Goals

Target test coverage:

- ✅ **100% critical user paths** (token config, query execution, disconnect)
- ✅ **90% UI components** (sidebar, editor, results table)
- ✅ **80% error scenarios** (syntax errors, network failures)
- ✅ **WCAG 2.1 AA compliance** (keyboard nav, ARIA labels, focus management)

## Future Enhancements

- [ ] Visual regression testing with Percy or Playwright screenshots
- [ ] Performance testing (load time, query execution time)
- [ ] API contract testing with Pact
- [ ] Cross-browser video recording
- [ ] Automated accessibility scanning with axe-core
- [ ] Load testing with k6
- [ ] Integration with real Val Town test database

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
