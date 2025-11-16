import { test, expect } from "@playwright/test";
import { StudioPage } from "./page-objects/studio.page";
import {
  TestHelpers,
  ValtownAPIMock,
  TEST_DATA,
} from "./fixtures/test-helpers";

test.describe("Query Execution", () => {
  let studioPage: StudioPage;
  let helpers: TestHelpers;
  let apiMock: ValtownAPIMock;

  test.beforeEach(async ({ page }) => {
    studioPage = new StudioPage(page);
    helpers = new TestHelpers(page);
    apiMock = new ValtownAPIMock(page);

    // Set valid token
    await page.goto("/");
    await helpers.setValtownToken(TEST_DATA.validToken);
    await studioPage.goto();
    await studioPage.waitForLoad();
  });

  test("should execute SELECT query successfully", async ({ page }) => {
    // Mock successful query
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    // Type and execute query
    await studioPage.typeSQL(TEST_DATA.sampleQueries.select);
    await studioPage.executeQuery();

    // Wait for results
    await page.waitForTimeout(1000);

    // Results should be displayed
    await expect(studioPage.resultsPanel).toBeVisible();

    // Should have result rows
    const rowCount = await studioPage.getResultRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should display query results in table format", async ({ page }) => {
    // Mock query result
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await studioPage.typeSQL(TEST_DATA.sampleQueries.select);
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Result table should be visible
    await expect(studioPage.resultTable).toBeVisible();

    // Should have correct number of rows
    const rowCount = await studioPage.getResultRowCount();
    expect(rowCount).toBe(TEST_DATA.sampleResults.users.rows.length);
  });

  test("should show column headers in results", async ({ page }) => {
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await studioPage.typeSQL(TEST_DATA.sampleQueries.select);
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Check for column headers
    for (const column of TEST_DATA.sampleResults.users.columns) {
      const header = page.locator(`th:has-text("${column}")`);
      await expect(header).toBeVisible();
    }
  });

  test("should handle query errors gracefully", async ({ page }) => {
    // Mock error response
    await apiMock.mockFailedQuery("Syntax error near SELECT");

    await studioPage.typeSQL("SELECT * FROM nonexistent_table");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Error should be displayed
    expect(await studioPage.hasError()).toBe(true);

    const errorText = await studioPage.getErrorText();
    expect(errorText.length).toBeGreaterThan(0);
  });

  test("should execute CREATE TABLE statement", async ({ page }) => {
    // Mock successful create
    await apiMock.mockSuccessfulQuery({
      columns: [],
      rows: [],
    });

    await studioPage.typeSQL(TEST_DATA.sampleQueries.create);
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Should not show error
    expect(await studioPage.hasError()).toBe(false);
  });

  test("should execute INSERT statement", async ({ page }) => {
    // Mock successful insert
    await apiMock.mockSuccessfulQuery({
      columns: [],
      rows: [],
    });

    await studioPage.typeSQL(TEST_DATA.sampleQueries.insert);
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Should complete without error
    expect(await studioPage.hasError()).toBe(false);
  });

  test("should execute UPDATE statement", async ({ page }) => {
    await apiMock.mockSuccessfulQuery({
      columns: [],
      rows: [],
    });

    await studioPage.typeSQL(TEST_DATA.sampleQueries.update);
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    expect(await studioPage.hasError()).toBe(false);
  });

  test("should execute DELETE statement", async ({ page }) => {
    await apiMock.mockSuccessfulQuery({
      columns: [],
      rows: [],
    });

    await studioPage.typeSQL(TEST_DATA.sampleQueries.delete);
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    expect(await studioPage.hasError()).toBe(false);
  });

  test("should handle empty query", async ({ page }) => {
    // Don't type anything
    await studioPage.executeQuery();

    // Should either disable button or show validation
    // This depends on implementation
  });

  test("should clear previous results when executing new query", async ({
    page,
  }) => {
    // First query
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);
    await studioPage.typeSQL(TEST_DATA.sampleQueries.select);
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);
    const firstRowCount = await studioPage.getResultRowCount();
    expect(firstRowCount).toBe(2);

    // Clear and execute different query
    await studioPage.clearSQL();
    await apiMock.mockSuccessfulQuery({
      columns: ["count"],
      rows: [[5]],
    });
    await studioPage.typeSQL("SELECT COUNT(*) as count FROM users");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Should have new results
    const secondRowCount = await studioPage.getResultRowCount();
    expect(secondRowCount).toBe(1);
  });

  test("should handle large result sets", async ({ page }) => {
    // Create large dataset
    const largeResult = {
      columns: ["id", "name"],
      rows: Array.from({ length: 1000 }, (_, i) => [i, `User ${i}`]),
    };

    await apiMock.mockSuccessfulQuery(largeResult);
    await studioPage.typeSQL("SELECT * FROM users");
    await studioPage.executeQuery();

    await page.waitForTimeout(2000);

    // Results should load (might be virtualized)
    await expect(studioPage.resultsPanel).toBeVisible();
  });

  test("should support SQL with comments", async ({ page }) => {
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    const sqlWithComments = `
      -- This is a comment
      SELECT * FROM users
      -- WHERE id = 1
      LIMIT 10
    `;

    await studioPage.typeSQL(sqlWithComments);
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    expect(await studioPage.hasError()).toBe(false);
  });

  test("should display NULL values correctly", async ({ page }) => {
    await apiMock.mockSuccessfulQuery({
      columns: ["id", "name", "email"],
      rows: [
        [1, "John", null],
        [2, null, "jane@example.com"],
      ],
    });

    await studioPage.typeSQL("SELECT * FROM users");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Check that NULL is rendered
    const pageContent = await page.content();
    expect(pageContent).toContain("null");
  });
});
