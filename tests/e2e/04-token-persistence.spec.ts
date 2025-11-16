import { expect, test } from "@playwright/test";
import {
	ensureCryptoGetRandomValues,
	TEST_DATA,
	TestHelpers,
	ValtownAPIMock,
} from "./fixtures/test-helpers";
import { StudioPage } from "./page-objects/studio.page";
import { TokenConfigPage } from "./page-objects/token-config.page";

test.describe("Token Persistence and Disconnect", () => {
	let tokenConfigPage: TokenConfigPage;
	let studioPage: StudioPage;
	let helpers: TestHelpers;
	let apiMock: ValtownAPIMock;

	test.beforeEach(async ({ page }) => {
		// Ensure window.crypto.getRandomValues is available
		// This fixes the issue where window.crypto.random is not available in Playwright's environment
		await ensureCryptoGetRandomValues(page);
		tokenConfigPage = new TokenConfigPage(page);
		studioPage = new StudioPage(page);
		helpers = new TestHelpers(page);
		apiMock = new ValtownAPIMock(page);
	});

	test("should persist token across page reloads", async ({ page }) => {
		// Clear any existing token
		await helpers.clearValtownToken();

		// Connect with token
		await tokenConfigPage.goto();
		await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);
		await tokenConfigPage.connectWithToken(TEST_DATA.validToken);

		await studioPage.waitForLoad();

		// Reload page
		await page.reload();

		// Should still be in Studio (not token config)
		await studioPage.waitForLoad();
		expect(await studioPage.studioContainer.isVisible()).toBe(true);

		// Token should still be in localStorage
		const token = await helpers.getValtownToken();
		expect(token).toBe(TEST_DATA.validToken);
	});

	test("should persist token across browser sessions", async ({
		page,
		context,
	}) => {
		// Clear token
		await helpers.clearValtownToken();

		// Connect
		await tokenConfigPage.goto();
		await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);
		await tokenConfigPage.connectWithToken(
			TEST_DATA.validToken,
			TEST_DATA.connectionName,
		);

		await studioPage.waitForLoad();

		// Simulate new session by creating new page
		const newPage = await context.newPage();
		const newHelpers = new TestHelpers(newPage);
		const newStudioPage = new StudioPage(newPage);
		const newApiMock = new ValtownAPIMock(newPage);

		await newApiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);
		await newPage.goto("/");

		// Should load Studio immediately
		await newStudioPage.waitForLoad();

		// Token should be present
		const token = await newHelpers.getValtownToken();
		expect(token).toBe(TEST_DATA.validToken);

		await newPage.close();
	});

	test("should return to token config when disconnecting", async ({ page }) => {
		// Set token
		await helpers.setValtownToken(TEST_DATA.validToken);
		await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

		await studioPage.goto();
		await studioPage.waitForLoad();

		// Disconnect
		await studioPage.clickDisconnect();

		// Should show token config
		await page.waitForTimeout(1000);
		expect(await tokenConfigPage.isVisible()).toBe(true);

		// Token should be cleared
		const token = await helpers.getValtownToken();
		expect(token).toBeNull();
	});

	test("should clear connection name when disconnecting", async ({ page }) => {
		await helpers.setValtownToken(TEST_DATA.validToken);
		await page.evaluate((name) => {
			localStorage.setItem("valtown_connection_name", name);
		}, TEST_DATA.connectionName);

		await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);
		await studioPage.goto();
		await studioPage.waitForLoad();

		// Disconnect
		await studioPage.clickDisconnect();

		// Connection name should be cleared
		const name = await page.evaluate(() => {
			return localStorage.getItem("valtown_connection_name");
		});
		expect(name).toBeNull();
	});

	test("should allow reconnecting after disconnect", async ({ page }) => {
		// First connection
		await helpers.clearValtownToken();
		await tokenConfigPage.goto();
		await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);
		await tokenConfigPage.connectWithToken(TEST_DATA.validToken);

		await studioPage.waitForLoad();

		// Disconnect
		await studioPage.clickDisconnect();
		await page.waitForTimeout(1000);

		// Reconnect with different token
		const newToken = "new-token-456";
		await tokenConfigPage.connectWithToken(newToken);

		await studioPage.waitForLoad();

		// New token should be saved
		const token = await helpers.getValtownToken();
		expect(token).toBe(newToken);
	});

	test("should handle expired token gracefully", async ({ page }) => {
		// Set token
		await helpers.setValtownToken(TEST_DATA.validToken);

		// Mock unauthorized (token expired)
		await apiMock.mockUnauthorized();

		await studioPage.goto();

		// Should show error or redirect to token config
		await page.waitForTimeout(2000);

		// Either error message or back to config
		const hasError = await studioPage.hasError();
		const hasTokenConfig = await tokenConfigPage.isVisible();

		expect(hasError || hasTokenConfig).toBe(true);
	});

	test("should preserve token when navigating within app", async ({ page }) => {
		await helpers.setValtownToken(TEST_DATA.validToken);
		await apiMock.mockSuccessfulQuery(TEST_DATA.sampleResults.users);

		await studioPage.goto();
		await studioPage.waitForLoad();

		// Open settings
		await studioPage.settingsButton.click();

		// Token should still be there
		let token = await helpers.getValtownToken();
		expect(token).toBe(TEST_DATA.validToken);

		// Close settings (click elsewhere or escape)
		await page.keyboard.press("Escape");

		// Token still preserved
		token = await helpers.getValtownToken();
		expect(token).toBe(TEST_DATA.validToken);
	});
});
