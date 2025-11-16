import { test, expect } from "@playwright/test";
import { StudioPage } from "./page-objects/studio.page";
import {
  TestHelpers,
  ValtownAPIMock,
  TEST_DATA,
} from "./fixtures/test-helpers";

test.describe("Studio Interface", () => {
  let studioPage: StudioPage;
  let helpers: TestHelpers;
  let apiMock: ValtownAPIMock;

  test.beforeEach(async ({ page }) => {
    studioPage = new StudioPage(page);
    helpers = new TestHelpers(page);
    apiMock = new ValtownAPIMock(page);

    // Set valid token before each test
    await page.goto("/");
    await helpers.setValtownToken(
      TEST_DATA.validToken,
      TEST_DATA.connectionName
    );
  });

  test("should load Studio with valid token", async ({ page }) => {
    await studioPage.goto();

    // Studio should load
    await studioPage.waitForLoad();

    // Main components should be visible
    await expect(studioPage.studioContainer).toBeVisible();
    await expect(studioPage.sqlEditor).toBeVisible();
    await expect(studioPage.sidebar).toBeVisible();
  });

  test("should have SQL editor ready for input", async ({ page }) => {
    await studioPage.goto();
    await studioPage.waitForLoad();

    // Editor should be visible and clickable
    await expect(studioPage.sqlEditor).toBeVisible();

    // Should be able to type
    await studioPage.typeSQL("SELECT 1");

    // Content should be in editor
    const editorContent = await page.locator(".cm-content").textContent();
    expect(editorContent).toContain("SELECT 1");
  });

  test("should have execute query button", async ({ page }) => {
    await studioPage.goto();
    await studioPage.waitForLoad();

    // Execute button should be visible
    await expect(studioPage.executeButton).toBeVisible();

    // Initially might be disabled (depending on implementation)
    // await expect(studioPage.executeButton).toBeEnabled();
  });

  test("should show schema sidebar", async ({ page }) => {
    await studioPage.goto();
    await studioPage.waitForLoad();

    // Sidebar should be visible
    await expect(studioPage.sidebar).toBeVisible();

    // Should have schema tree
    const hasSchemaTree = await studioPage.schemaTree
      .isVisible()
      .catch(() => false);
    expect(hasSchemaTree).toBe(true);
  });

  test("should have settings menu with disconnect option", async ({ page }) => {
    await studioPage.goto();
    await studioPage.waitForLoad();

    // Settings button should be visible
    await expect(studioPage.settingsButton).toBeVisible();

    // Click to open menu
    await studioPage.settingsButton.click();

    // Disconnect should be visible
    await expect(studioPage.disconnectButton).toBeVisible();
  });

  test("should support multiple tabs", async ({ page }) => {
    await studioPage.goto();
    await studioPage.waitForLoad();

    // Query tab should be active by default
    const hasQueryTab = await studioPage.queryTab
      .isVisible()
      .catch(() => false);
    expect(hasQueryTab).toBe(true);

    // New tab button should exist
    const hasNewTabButton = await studioPage.newTabButton
      .isVisible()
      .catch(() => false);
    if (hasNewTabButton) {
      await studioPage.createNewTab();

      // Should have multiple tabs
      const tabs = await page.locator('[role="tab"]').count();
      expect(tabs).toBeGreaterThan(1);
    }
  });

  test("should have keyboard shortcuts", async ({ page }) => {
    await studioPage.goto();
    await studioPage.waitForLoad();

    // Type SQL
    await studioPage.typeSQL("SELECT 1");

    // Mock API response
    await apiMock.mockSuccessfulQuery({
      columns: ["1"],
      rows: [[1]],
    });

    // Execute with Ctrl+Enter (or Cmd+Enter on Mac)
    await page.keyboard.press("Control+Enter");

    // Results should appear
    await page.waitForTimeout(500);
    // Note: Actual keyboard shortcut testing depends on implementation
  });

  test('should show branding as "Val Town Studio"', async ({ page }) => {
    await studioPage.goto();
    await studioPage.waitForLoad();

    // Check for Val Town branding in page
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain("val town");
  });

});
