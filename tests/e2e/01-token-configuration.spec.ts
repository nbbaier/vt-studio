import { test, expect } from "@playwright/test";
import { TokenConfigPage } from "./page-objects/token-config.page";
import { StudioPage } from "./page-objects/studio.page";
import {
  TestHelpers,
  ValtownAPIMock,
  TEST_DATA,
} from "./fixtures/test-helpers";

test.describe("Token Configuration Flow", () => {
  let tokenConfigPage: TokenConfigPage;
  let studioPage: StudioPage;
  let helpers: TestHelpers;
  let apiMock: ValtownAPIMock;

  test.beforeEach(async ({ page }) => {
    tokenConfigPage = new TokenConfigPage(page);
    studioPage = new StudioPage(page);
    helpers = new TestHelpers(page);
    apiMock = new ValtownAPIMock(page);

    // Clear token before each test
    await helpers.clearValtownToken();
  });

  test("should show token configuration UI when no token exists", async ({
    page,
  }) => {
    await tokenConfigPage.goto();

    // Token config should be visible
    await tokenConfigPage.waitForLoad();
    expect(await tokenConfigPage.isVisible()).toBe(true);

    // Should have heading
    await expect(tokenConfigPage.heading).toBeVisible();

    // Should have input fields
    await expect(tokenConfigPage.nameInput).toBeVisible();
    await expect(tokenConfigPage.tokenInput).toBeVisible();

    // Should have connect button
    await expect(tokenConfigPage.connectButton).toBeVisible();
    await expect(tokenConfigPage.connectButton).toBeDisabled();
  });

  test("should have link to Val Town API settings", async ({ page }) => {
    await tokenConfigPage.goto();
    await tokenConfigPage.waitForLoad();

    // Should have API link
    expect(await tokenConfigPage.hasAPILink()).toBe(true);

    const href = await tokenConfigPage.getAPILinkHref();
    expect(href).toContain("val.town");
    expect(href).toContain("settings");
  });

  test("should enable connect button when token is entered", async ({
    page,
  }) => {
    await tokenConfigPage.goto();
    await tokenConfigPage.waitForLoad();

    // Initially disabled
    await expect(tokenConfigPage.connectButton).toBeDisabled();

    // Enter token
    await tokenConfigPage.fillToken(TEST_DATA.validToken);

    // Should be enabled
    await expect(tokenConfigPage.connectButton).toBeEnabled();
  });

  test("should connect successfully with valid token", async ({ page }) => {
    await tokenConfigPage.goto();
    await tokenConfigPage.waitForLoad();

    // Mock successful API response
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    // Fill and connect
    await tokenConfigPage.fillConnectionName(TEST_DATA.connectionName);
    await tokenConfigPage.fillToken(TEST_DATA.validToken);
    await tokenConfigPage.clickConnect();

    // Should navigate to Studio
    await studioPage.waitForLoad();
    expect(await studioPage.studioContainer.isVisible()).toBe(true);

    // Token should be saved
    const savedToken = await helpers.getValtownToken();
    expect(savedToken).toBe(TEST_DATA.validToken);
  });

  test("should show error message with invalid token", async ({ page }) => {
    await tokenConfigPage.goto();
    await tokenConfigPage.waitForLoad();

    // Mock unauthorized response
    await apiMock.mockUnauthorized();

    // Fill and connect
    await tokenConfigPage.fillToken(TEST_DATA.invalidToken);
    await tokenConfigPage.clickConnect();

    // Should show error
    await page.waitForTimeout(1000); // Wait for error to appear
    expect(await tokenConfigPage.hasError()).toBe(true);

    const errorText = await tokenConfigPage.getErrorText();
    expect(errorText.toLowerCase()).toContain("token");
  });

  test("should persist connection name", async ({ page }) => {
    await tokenConfigPage.goto();
    await tokenConfigPage.waitForLoad();

    // Mock successful API response
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    // Connect with name
    await tokenConfigPage.connectWithToken(
      TEST_DATA.validToken,
      TEST_DATA.connectionName
    );

    // Verify name is saved
    const savedName = await page.evaluate(() => {
      return localStorage.getItem("valtown_connection_name");
    });

    expect(savedName).toBe(TEST_DATA.connectionName);
  });

  test("should handle empty token submission", async ({ page }) => {
    await tokenConfigPage.goto();
    await tokenConfigPage.waitForLoad();

    // Button should be disabled with empty token
    await expect(tokenConfigPage.connectButton).toBeDisabled();

    // Fill with spaces
    await tokenConfigPage.fillToken("   ");

    // Should still be disabled or show validation error
    await expect(tokenConfigPage.connectButton).toBeDisabled();
  });
});
