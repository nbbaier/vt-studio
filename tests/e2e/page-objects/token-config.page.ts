import type { Locator, Page } from "@playwright/test";

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
    this.heading = page.getByRole("heading", { name: "Connect to Val Town" });
    this.nameInput = page.locator(
      'input[name="name"], input[placeholder*="name" i]'
    );
    this.tokenInput = page.locator(
      'textarea[name="token"], textarea[placeholder*="token" i]'
    );
    this.connectButton = page.locator('button:has-text("Connect")');
    this.errorMessage = page.locator(
      '[data-testid="error-message"], [role="alert"]'
    );

    this.instructions = page.locator("text=/API token/i");
    this.apiLink = page.locator('a[href*="val.town"]');
  }

  async goto() {
    await this.page.goto("/", { waitUntil: "networkidle" });
  }

  async waitForLoad() {
    // Wait for the token config container to be visible
    // Using waitForSelector is more reliable than locator.waitFor for initial page loads
    // Also wait for a child element (heading) to ensure React has fully rendered
    await this.page.waitForSelector('[data-testid="token-config"]', {
      state: "visible",
      timeout: 10000,
    });
    // Additional check: wait for heading to ensure content is rendered
    await this.heading.waitFor({ state: "visible", timeout: 5000 });
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
