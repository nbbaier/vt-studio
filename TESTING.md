# Testing Guide for Val Town Studio

This document covers all testing approaches for Val Town Studio.

## Test Types

### 1. Unit Tests (Jest)

**Location:** `src/**/*.test.ts`, `src/**/*.test.tsx`

**Purpose:** Test individual functions and utilities

**Run:**

```bash
npm test
```

**Coverage:**

- SQL parsing logic (`src/drivers/sqlite/*.test.ts`)
- Utility functions
- Helper methods

### 2. Integration Tests (Jest + React Testing Library)

**Location:** `src/**/*.test.tsx`

**Purpose:** Test component integration and interactions

**Run:**

```bash
npm test
```

**Coverage:**

- Component behavior
- React hooks
- Context providers

### 3. End-to-End Tests (Playwright)

**Location:** `tests/e2e/*.spec.ts`

**Purpose:** Test complete user journeys

**Run:**

```bash
npm run test:e2e
```

**Coverage:**

- Token configuration flow
- Studio interface
- Query execution
- Schema browsing
- Error handling
- Accessibility

## E2E Testing with Playwright

### Quick Start

1. **Install dependencies:**

```bash
npm install
```

2. **Install Playwright browsers:**

```bash
npx playwright install
```

3. **Start dev server** (in separate terminal):

```bash
npm run dev
```

4. **Run tests:**

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test 01-token-configuration

# Debug a test
npm run test:e2e:debug
```

### Test Structure

```
tests/e2e/
├── fixtures/
│   └── test-helpers.ts          # Utilities and test data
├── page-objects/
│   ├── studio.page.ts           # Studio page object
│   └── token-config.page.ts     # Token config page object
├── 01-token-configuration.spec.ts
├── 02-studio-interface.spec.ts
├── 03-query-execution.spec.ts
├── 04-token-persistence.spec.ts
├── 05-schema-browsing.spec.ts
├── 06-error-handling.spec.ts
└── 07-accessibility.spec.ts
```

### Test Categories

| Category            | Tests  | Priority |
| ------------------- | ------ | -------- |
| Token Configuration | 8      | P0       |
| Studio Interface    | 10     | P0-P2    |
| Query Execution     | 13     | P0-P2    |
| Token Persistence   | 7      | P0-P1    |
| Schema Browsing     | 8      | P1-P2    |
| Error Handling      | 10     | P0-P2    |
| Accessibility       | 9      | P1-P2    |
| **Total**           | **65** |          |

### Running Tests

#### All Tests

```bash
npm run test:e2e
```

#### Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

#### Specific Test File

```bash
npx playwright test 01-token-configuration
npx playwright test 03-query-execution
```

#### With UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:

- See all tests
- Run tests individually
- Watch tests execute
- Inspect DOM snapshots
- View traces

#### Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector for step-by-step debugging.

#### View Last Report

```bash
npm run test:e2e:report
```

### Writing New Tests

1. **Choose appropriate test file** based on category
2. **Use page objects** for interactions:

```typescript
import { test, expect } from "@playwright/test";
import { StudioPage } from "./page-objects/studio.page";
import {
  TestHelpers,
  ValtownAPIMock,
  TEST_DATA,
} from "./fixtures/test-helpers";

test.describe("My Feature", () => {
  let studioPage: StudioPage;
  let helpers: TestHelpers;
  let apiMock: ValtownAPIMock;

  test.beforeEach(async ({ page }) => {
    studioPage = new StudioPage(page);
    helpers = new TestHelpers(page);
    apiMock = new ValtownAPIMock(page);

    // Set up test state
    await helpers.setValtownToken(TEST_DATA.validToken);
  });

  test("should do something", async ({ page }) => {
    await studioPage.goto();
    await studioPage.waitForLoad();

    // Your test logic
    await studioPage.typeSQL("SELECT 1");
    await studioPage.executeQuery();

    // Assertions
    expect(await studioPage.hasError()).toBe(false);
  });
});
```

3. **Mock API responses:**

```typescript
// Mock successful query
await apiMock.mockSuccessfulQuery({
  columns: ["id", "name"],
  rows: [
    [1, "John"],
    [2, "Jane"],
  ],
});

// Mock error
await apiMock.mockFailedQuery("Syntax error");

// Mock unauthorized
await apiMock.mockUnauthorized();
```

### Adding data-testid Attributes

For reliable test selectors, add `data-testid` to components:

```tsx
// Good - testable
<button data-testid="execute-query-btn">Run</button>

// Avoid - fragile selectors
<button className="btn-primary">Run</button>
```

### Best Practices

#### 1. Test Independence

Each test should be completely independent:

```typescript
test.beforeEach(async ({ page }) => {
  // Clean state for each test
  await helpers.clearValtownToken();
});
```

#### 2. Explicit Waits

Use explicit waits instead of arbitrary timeouts:

```typescript
// Good
await page.waitForSelector('[data-testid="results"]', { timeout: 5000 });

// Avoid
await page.waitForTimeout(2000);
```

#### 3. Page Object Model

Encapsulate page interactions in page objects:

```typescript
// Good - maintainable
await studioPage.executeQuery();

// Avoid - brittle
await page.click('[data-testid="execute-query-btn"]');
```

#### 4. Descriptive Test Names

```typescript
// Good
test('should display error message when executing invalid SQL', async ({ page }) => {

// Avoid
test('error test', async ({ page }) => {
```

#### 5. Mock External Dependencies

Always mock Val Town API to avoid flaky tests:

```typescript
await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);
```

### Debugging Failed Tests

#### 1. View Trace

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

#### 2. Screenshots

Failed tests automatically capture screenshots in `test-results/`

#### 3. Videos

Failed tests record video (if configured) in `test-results/`

#### 4. Console Logs

```typescript
page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
page.on("pageerror", (err) => console.log("PAGE ERROR:", err));
```

#### 5. Pause Execution

```typescript
await page.pause(); // Opens Playwright Inspector
```

### CI/CD Integration

Tests automatically run on GitHub Actions:

- **On push** to main/develop branches
- **On pull requests** to main/develop
- **Results uploaded** as artifacts (30-day retention)

View results in the Actions tab of your GitHub repository.

### Configuration

**playwright.config.ts** contains:

- **Base URL:** `http://localhost:3008`
- **Browsers:** Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Timeout:** 30s per test
- **Retries:** 2 on CI, 0 locally
- **Workers:** 1 on CI, parallel locally
- **Screenshots:** On failure
- **Videos:** On failure
- **Traces:** On first retry

### Test Data

Test fixtures in `tests/e2e/fixtures/test-helpers.ts`:

```typescript
TEST_DATA = {
  validToken: 'test-valid-token-123456',
  invalidToken: 'invalid-token',
  connectionName: 'Test Connection',

  sampleQueries: {
    select: 'SELECT * FROM users LIMIT 10',
    create: 'CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)',
    insert: "INSERT INTO test_table (name) VALUES ('Test User')",
    // ... more
  },

  sampleResults: {
    users: {
      columns: ['id', 'name', 'email'],
      rows: [[1, 'John Doe', 'john@example.com'], ...],
    },
  },
}
```

## Performance Testing

(Future implementation)

## Accessibility Testing

Included in E2E tests (`07-accessibility.spec.ts`):

- Keyboard navigation
- ARIA labels
- Semantic HTML
- Focus management
- Screen reader support
- Color contrast
- Reduced motion

## Coverage Goals

| Test Type         | Target Coverage        |
| ----------------- | ---------------------- |
| Unit Tests        | 80% of utilities       |
| Integration Tests | 70% of components      |
| E2E Tests         | 100% of critical paths |

## Resources

- [Playwright Docs](https://playwright.dev)
- [E2E Test Plan](./E2E_TEST_PLAN.md)
- [E2E Test README](./tests/e2e/README.md)
- [Jest Docs](https://jestjs.io)
- [Testing Library](https://testing-library.com)

## Troubleshooting

### Tests fail locally but pass in CI

- CI is slower, may need increased timeouts
- Check for timing issues
- Review CI artifacts (screenshots/videos)

### Flaky tests

- Add explicit waits
- Check for race conditions
- Ensure test independence
- Review API mock timing

### Browser not found

```bash
npx playwright install
```

### Port already in use

Change port in `playwright.config.ts`:

```typescript
baseURL: 'http://localhost:3009',
```

Then start dev server on that port:

```bash
PORT=3009 npm run dev
```

## Getting Help

- Check existing tests for patterns
- Review page objects for available methods
- Consult [Playwright documentation](https://playwright.dev)
- Review test failures in CI artifacts
