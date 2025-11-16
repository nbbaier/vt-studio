import type { Page } from "@playwright/test";

/**
 * Ensure window.crypto.getRandomValues is available in the page context
 * This fixes the issue where window.crypto.random is not available in Playwright's environment
 * The correct method is window.crypto.getRandomValues() for generating cryptographically secure random numbers
 */
export async function ensureCryptoGetRandomValues(page: Page) {
	await page.addInitScript(() => {
		if (typeof window !== "undefined" && window.crypto) {
			// Ensure getRandomValues exists (it should in modern browsers, but ensure it's there)
			if (!window.crypto.getRandomValues) {
				// Polyfill for environments where getRandomValues is not available
				// This shouldn't happen in real browsers, but ensures compatibility
				window.crypto.getRandomValues = <T extends ArrayBufferView | null>(
					array: T,
				): T => {
					if (!array) {
						throw new TypeError("getRandomValues() requires an array argument");
					}
					const buffer = array.buffer;
					const view = new Uint8Array(
						buffer,
						array.byteOffset,
						array.byteLength,
					);
					for (let i = 0; i < view.length; i++) {
						view[i] = Math.floor(Math.random() * 256);
					}
					return array;
				};
			}
		}
	});
}

/**
 * Helper utilities for E2E tests
 */

export class TestHelpers {
	constructor(private page: Page) {}

	/**
	 * Set Val Town token in localStorage
	 */
	async setValtownToken(token: string, name?: string) {
		await this.page.evaluate(
			({ token, name }) => {
				localStorage.setItem("valtown_token", token);
				if (name) {
					localStorage.setItem("valtown_connection_name", name);
				}
			},
			{ token, name },
		);
	}

	/**
	 * Get Val Town token from localStorage
	 */
	async getValtownToken(): Promise<string | null> {
		return await this.page.evaluate(() => {
			return localStorage.getItem("valtown_token");
		});
	}

	/**
	 * Clear Val Town token from localStorage
	 */
	async clearValtownToken() {
		await this.page.evaluate(() => {
			localStorage.removeItem("valtown_token");
			localStorage.removeItem("valtown_connection_name");
		});
	}

	/**
	 * Wait for Studio to be fully loaded
	 */
	async waitForStudioLoad() {
		// Wait for the main Studio container
		await this.page.waitForSelector('[data-testid="studio-container"]', {
			timeout: 10000,
		});

		// Wait for SQL editor to be ready
		await this.page.waitForSelector(".cm-editor", { timeout: 5000 });
	}

	/**
	 * Wait for token configuration UI
	 */
	async waitForTokenConfigUI() {
		await this.page.waitForSelector('[data-testid="token-config"]', {
			timeout: 5000,
		});
	}

	/**
	 * Type into CodeMirror editor
	 */
	async typeInSQLEditor(sql: string) {
		const editor = this.page.locator(".cm-content");
		await editor.click();
		await editor.pressSequentially(sql, { delay: 10 });
	}

	/**
	 * Clear CodeMirror editor
	 */
	async clearSQLEditor() {
		await this.page.keyboard.press("Control+A");
		await this.page.keyboard.press("Backspace");
	}

	/**
	 * Execute SQL query using run button
	 */
	async executeQuery() {
		await this.page.click('[data-testid="execute-query-btn"]');
	}

	/**
	 * Wait for query results
	 */
	async waitForQueryResults() {
		await this.page.waitForSelector('[data-testid="query-results"]', {
			timeout: 10000,
		});
	}

	/**
	 * Get query result rows
	 */
	async getQueryResultRows() {
		const rows = await this.page.locator('[data-testid="result-row"]').all();
		return rows;
	}

	/**
	 * Check if error message is displayed
	 */
	async hasError(): Promise<boolean> {
		const errorElement = await this.page.locator(
			'[data-testid="error-message"]',
		);
		return await errorElement.isVisible().catch(() => false);
	}

	/**
	 * Get error message text
	 */
	async getErrorMessage(): Promise<string> {
		const errorElement = await this.page.locator(
			'[data-testid="error-message"]',
		);
		return (await errorElement.textContent()) || "";
	}

	/**
	 * Take a screenshot with a custom name
	 */
	async takeScreenshot(name: string) {
		await this.page.screenshot({ path: `tests/e2e/screenshots/${name}.png` });
	}
}

/**
 * Mock Val Town API responses
 */
export class ValtownAPIMock {
	constructor(private page: Page) {}

	/**
	 * Mock successful query execution
	 */
	async mockSuccessfulQuery(result: { columns: string[]; rows: unknown[][] }) {
		await this.page.route(
			"https://api.val.town/v1/sqlite/execute",
			async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						columns: result.columns,
						rows: result.rows,
					}),
				});
			},
		);
	}

	/**
	 * Mock failed query execution
	 */
	async mockFailedQuery(errorMessage: string) {
		await this.page.route(
			"https://api.val.town/v1/sqlite/execute",
			async (route) => {
				await route.fulfill({
					status: 400,
					contentType: "application/json",
					body: JSON.stringify({
						error: errorMessage,
					}),
				});
			},
		);
	}

	/**
	 * Mock batch query execution
	 */
	async mockBatchQuery(
		results: Array<{ columns: string[]; rows: unknown[][] }>,
	) {
		await this.page.route(
			"https://api.val.town/v1/sqlite/batch",
			async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(results),
				});
			},
		);
	}

	/**
	 * Mock unauthorized response
	 */
	async mockUnauthorized() {
		await this.page.route(
			"https://api.val.town/v1/sqlite/**",
			async (route) => {
				await route.fulfill({
					status: 401,
					contentType: "application/json",
					body: JSON.stringify({
						error: "Unauthorized",
					}),
				});
			},
		);
	}
}

/**
 * Test data fixtures
 */
export const TEST_DATA = {
	validToken: "test-valid-token-123456",
	invalidToken: "invalid-token",
	connectionName: "Test Connection",

	sampleQueries: {
		select: "SELECT * FROM users LIMIT 10",
		create: "CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)",
		insert: "INSERT INTO test_table (name) VALUES ('Test User')",
		update: "UPDATE test_table SET name = 'Updated User' WHERE id = 1",
		delete: "DELETE FROM test_table WHERE id = 1",
	},

	sampleResults: {
		users: {
			columns: ["id", "name", "email"],
			rows: [
				[1, "John Doe", "john@example.com"],
				[2, "Jane Smith", "jane@example.com"],
			],
		},
		empty: {
			columns: [],
			rows: [],
		},
	},
};
