import type { Locator, Page } from "@playwright/test";

/**
 * Page Object Model for the Studio interface
 */
export class StudioPage {
  readonly page: Page;

  // Main components
  readonly studioContainer: Locator;
  readonly sqlEditor: Locator;
  readonly executeButton: Locator;
  readonly resultsPanel: Locator;

  // Sidebar
  readonly sidebar: Locator;
  readonly schemaTree: Locator;
  readonly settingsButton: Locator;
  readonly disconnectButton: Locator;

  // Tabs
  readonly queryTab: Locator;
  readonly tableTab: Locator;
  readonly schemaTab: Locator;
  readonly newTabButton: Locator;

  // Results
  readonly resultTable: Locator;
  readonly resultRows: Locator;
  readonly errorMessage: Locator;

  // Schema Editor
  readonly schemaEditor: Locator;
  readonly tableList: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main components
    this.studioContainer = page.locator('[data-testid="studio-container"]');
    this.sqlEditor = page.locator(".cm-editor");
    this.executeButton = page.locator('[data-testid="execute-query-btn"]');
    this.resultsPanel = page.locator('[data-testid="query-results"]');

    // Sidebar
    this.sidebar = page.locator('[data-testid="studio-sidebar"]');
    this.schemaTree = page.locator('[data-testid="schema-tree"]');
    this.settingsButton = page.locator('[data-testid="settings-button"]');
    this.disconnectButton = page.locator('button:has-text("Disconnect")');

    // Tabs
    this.queryTab = page.locator('[role="tab"]:has-text("Query")');
    this.tableTab = page.locator('[role="tab"]:has-text("Table")');
    this.schemaTab = page.locator('[role="tab"]:has-text("Schema")');
    this.newTabButton = page.locator('[data-testid="new-tab-button"]');

    // Results
    this.resultTable = page.locator('[data-testid="result-table"]');
    this.resultRows = page.locator('[data-testid="result-row"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');

    // Schema Editor
    this.schemaEditor = page.locator('[data-testid="schema-editor"]');
    this.tableList = page.locator('[data-testid="table-list"]');
  }

  async goto() {
    await this.page.goto("/");
  }

  async waitForLoad() {
    await this.studioContainer.waitFor({ state: "visible", timeout: 10000 });
    await this.sqlEditor.waitFor({ state: "visible", timeout: 5000 });
  }

  async typeSQL(sql: string) {
    await this.sqlEditor.click();
    await this.page.keyboard.type(sql);
  }

  async clearSQL() {
    await this.sqlEditor.click();
    await this.page.keyboard.press("Control+A");
    await this.page.keyboard.press("Backspace");
  }

  async executeQuery() {
    await this.executeButton.click();
  }

  async getResultRowCount(): Promise<number> {
    return await this.resultRows.count();
  }

  async getResultCellValue(row: number, column: number): Promise<string> {
    const cell = this.page.locator(
      `[data-testid="result-row"]:nth-child(${row + 1}) [data-testid="result-cell"]:nth-child(${column + 1})`,
    );
    return (await cell.textContent()) || "";
  }

  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  async getErrorText(): Promise<string> {
    return (await this.errorMessage.textContent()) || "";
  }

  async clickDisconnect() {
    await this.settingsButton.click();
    await this.disconnectButton.click();
  }

  async openTable(tableName: string) {
    const tableItem = this.page.locator(
      `[data-testid="table-item"]:has-text("${tableName}")`,
    );
    await tableItem.click();
  }

  async createNewTab() {
    await this.newTabButton.click();
  }

  async switchToTab(tabName: string) {
    const tab = this.page.locator(`[role="tab"]:has-text("${tabName}")`);
    await tab.click();
  }

  async getActiveTabName(): Promise<string> {
    const activeTab = this.page.locator('[role="tab"][aria-selected="true"]');
    return (await activeTab.textContent()) || "";
  }

  async getTables(): Promise<string[]> {
    const tableItems = await this.page
      .locator('[data-testid="table-item"]')
      .all();
    const names: string[] = [];
    for (const item of tableItems) {
      const text = await item.textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }
}
