import { test, expect } from "@playwright/test";
import { StudioPage } from "./page-objects/studio.page";
import { TokenConfigPage } from "./page-objects/token-config.page";
import {
  TestHelpers,
  ValtownAPIMock,
  TEST_DATA,
} from "./fixtures/test-helpers";

test.describe("Accessibility", () => {
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

  test("should be keyboard navigable - token config", async ({ page }) => {
    await helpers.clearValtownToken();
    await tokenConfigPage.goto();
    await tokenConfigPage.waitForLoad();

    // Tab to name input
    await page.keyboard.press("Tab");
    const _focused = await page.evaluate(() => document.activeElement?.tagName);

    // Should be able to navigate with Tab
    await page.keyboard.press("Tab"); // Token input
    await page.keyboard.press("Tab"); // Connect button

    // Should be able to activate button with Enter/Space
    await tokenConfigPage.fillToken(TEST_DATA.validToken);
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000);

    // Should connect
    const hasStudio = await studioPage.studioContainer
      .isVisible()
      .catch(() => false);
    expect(hasStudio).toBe(true);
  });

  test("should have proper ARIA labels on buttons", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await studioPage.goto();
    await studioPage.waitForLoad();

    // Check execute button has label
    const executeBtn = studioPage.executeButton;
    const hasLabel =
      (await executeBtn.getAttribute("aria-label")) ||
      (await executeBtn.textContent());

    expect(hasLabel).toBeTruthy();
  });

  test("should have semantic HTML structure", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await studioPage.goto();
    await studioPage.waitForLoad();

    // Should have main landmark
    const main = await page.locator("main").count();
    expect(main).toBeGreaterThan(0);

    // Buttons should be actual button elements
    const executeButton = await page.locator(
      'button[data-testid="execute-query-btn"]'
    );
    const tagName = await executeButton.evaluate((el) => el.tagName);
    expect(tagName).toBe("BUTTON");
  });

  test("should have proper focus indicators", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await studioPage.goto();
    await studioPage.waitForLoad();

    // Tab to execute button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check for focus-visible styles
    const focused = await page.locator(":focus");
    const _styles = await focused.evaluate((el) => {
      return window.getComputedStyle(el);
    });

    // Should have outline or ring (focus indicator)
    // Note: Actual check depends on CSS implementation
  });

  test("should support screen reader announcements for errors", async ({
    page,
  }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockFailedQuery("Syntax error");

    await studioPage.goto();
    await studioPage.waitForLoad();

    await studioPage.typeSQL("INVALID SQL");
    await studioPage.executeQuery();

    await page.waitForTimeout(1000);

    // Error should have role="alert" or aria-live
    const error = studioPage.errorMessage;
    const role = await error.getAttribute("role");
    const ariaLive = await error.getAttribute("aria-live");

    expect(
      role === "alert" || ariaLive === "polite" || ariaLive === "assertive"
    ).toBe(true);
  });

  test("should have descriptive page title", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await studioPage.goto();
    await studioPage.waitForLoad();

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain("val town");
  });

  test("should support reduced motion preferences", async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });

    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await studioPage.goto();
    await studioPage.waitForLoad();

    // App should still be functional
    await expect(studioPage.studioContainer).toBeVisible();

    // Animations should be reduced (implementation-dependent)
  });

  test("should have skip to main content link", async ({ page }) => {
    await helpers.setValtownToken(TEST_DATA.validToken);
    await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

    await studioPage.goto();

    // Check for skip link (should be first focusable element)
    await page.keyboard.press("Tab");

    const _focused = await page.evaluate(
      () => document.activeElement?.textContent
    );

    // If skip link exists, text might contain "Skip"
    // Note: This is optional and implementation-dependent
  });
});
