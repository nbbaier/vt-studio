import { expect, test } from "@playwright/test";
import {
  TEST_DATA,
  TestHelpers,
  ValtownAPIMock,
} from "./fixtures/test-helpers";
import { StudioPage } from "./page-objects/studio.page";
import { TokenConfigPage } from "./page-objects/token-config.page";

test.describe("Error Handling", () => {
  let studioPage: StudioPage;
  let tokenConfigPage: TokenConfigPage;
  let helpers: TestHelpers;
  let apiMock: ValtownAPIMock;

  test.beforeEach(async ({ page }) => {
    studioPage = new StudioPage(page);
    tokenConfigPage = new TokenConfigPage(page);
    helpers = new TestHelpers(page);
    apiMock = new ValtownAPIMock(page);
  });

  test("should show error for SQL syntax errors", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockFailedQuery('near "SELCT": syntax error');

    await studioPage.goto();
    await studioPage.waitForLoad();

    // Execute invalid SQL
    await studioPage.typeSQL("SELCT * FROM users");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Error should be displayed
    expect(await studioPage.hasError()).toBe(true);

    const errorText = await studioPage.getErrorText();
    expect(errorText.toLowerCase()).toContain("syntax");
  });

  test("should show error for non-existent table", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockFailedQuery("no such table: nonexistent_table");

    await studioPage.goto();
    await studioPage.waitForLoad();

    await studioPage.typeSQL("SELECT * FROM nonexistent_table");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    expect(await studioPage.hasError()).toBe(true);

    const errorText = await studioPage.getErrorText();
    expect(errorText.toLowerCase()).toContain("table");
  });

  test("should show error for invalid token", async ({ page }) => {
    await tokenConfigPage.goto();
    await apiMock.mockUnauthorized();

    await tokenConfigPage.connectWithToken("invalid-token-xyz");

    await page.waitForTimeout(1000);

    // Should show error
    expect(await tokenConfigPage.hasError()).toBe(true);
  });

  test("should handle network errors gracefully", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);

    // Simulate network failure
    await page.route("https://api.val.town/v1/sqlite/**", (route) => {
      route.abort("failed");
    });

    await studioPage.goto();
    await studioPage.waitForLoad();

    await studioPage.typeSQL("SELECT 1");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Should show network error
    expect(await studioPage.hasError()).toBe(true);
  });

  test("should show error for permission denied", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockFailedQuery("Permission denied");

    await studioPage.goto();
    await studioPage.waitForLoad();

    await studioPage.typeSQL("DROP TABLE users");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    expect(await studioPage.hasError()).toBe(true);
  });

  test("should clear error when executing successful query", async ({
    page,
  }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);

    await studioPage.goto();
    await studioPage.waitForLoad();

    // First, execute failing query
    await apiMock.mockFailedQuery("Syntax error");
    await studioPage.typeSQL("INVALID SQL");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);
    expect(await studioPage.hasError()).toBe(true);

    // Then execute successful query
    await studioPage.clearSQL();
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);
    await studioPage.typeSQL("SELECT * FROM users");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Error should be cleared
    expect(await studioPage.hasError()).toBe(false);
  });

  test("should handle malformed API responses", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);

    // Mock malformed response
    await page.route(
      "https://api.val.town/v1/sqlite/execute",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "invalid json{",
        });
      }
    );

    await studioPage.goto();
    await studioPage.waitForLoad();

    await studioPage.typeSQL("SELECT 1");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Should handle gracefully
    expect(await studioPage.hasError()).toBe(true);
  });

  test("should show user-friendly error messages", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockFailedQuery("UNIQUE constraint failed: users.email");

    await studioPage.goto();
    await studioPage.waitForLoad();

    await studioPage.typeSQL(
      "INSERT INTO users (email) VALUES ('test@example.com')"
    );
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    const errorText = await studioPage.getErrorText();
    expect(errorText.length).toBeGreaterThan(0);
    // Should contain the actual error message
    expect(errorText.toLowerCase()).toContain("constraint");
  });
});
