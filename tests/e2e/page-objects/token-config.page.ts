import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the Token Configuration interface
 */
export class TokenConfigPage {
	readonly page: Page;

	// Main elements
	readonly container: Locator;
	readonly heading: Locator;
	readonly nameInput: Locator;
	readonly tokenInput: Locator;
	readonly connectButton: Locator;
	readonly errorMessage: Locator;

	// Instructions
	readonly instructions: Locator;
	readonly apiLink: Locator;

	constructor(page: Page) {
		this.page = page;

		this.container = page.locator('[data-testid="token-config"]');
		this.heading = page
			.locator("h1, h2")
			.filter({ hasText: /Val Town|Connect/i });
		this.nameInput = page.locator(
			'input[name="name"], input[placeholder*="name" i]',
		);
		this.tokenInput = page.locator(
			'textarea[name="token"], textarea[placeholder*="token" i]',
		);
		this.connectButton = page.locator('button:has-text("Connect")');
		this.errorMessage = page.locator(
			'[data-testid="error-message"], [role="alert"]',
		);

		this.instructions = page.locator("text=/API token/i");
		this.apiLink = page.locator('a[href*="val.town"]');
	}

	async goto() {
		await this.page.goto("/");
	}

	async waitForLoad() {
		await this.container.waitFor({ state: "visible", timeout: 10000 });
	}

	async isVisible(): Promise<boolean> {
		return await this.container.isVisible().catch(() => false);
	}

	async fillConnectionName(name: string) {
		await this.nameInput.fill(name);
	}

	async fillToken(token: string) {
		await this.tokenInput.fill(token);
	}

	async clickConnect() {
		await this.connectButton.click();
	}

	async connectWithToken(token: string, name?: string) {
		if (name) {
			await this.fillConnectionName(name);
		}
		await this.fillToken(token);
		await this.clickConnect();
	}

	async hasError(): Promise<boolean> {
		return await this.errorMessage.isVisible().catch(() => false);
	}

	async getErrorText(): Promise<string> {
		return (await this.errorMessage.textContent()) || "";
	}

	async hasAPILink(): Promise<boolean> {
		return await this.apiLink.isVisible().catch(() => false);
	}

	async getAPILinkHref(): Promise<string> {
		return (await this.apiLink.getAttribute("href")) || "";
	}
}
