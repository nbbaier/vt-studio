/**
 * System tables for Val Town Studio internal metadata storage.
 *
 * These tables are automatically created when a user connects and are hidden
 * from the main UI to avoid cluttering the user's database view.
 */

import type { QueryableBaseDriver } from "@/drivers/base-driver";

/**
 * Prefix for all system tables
 */
export const SYSTEM_TABLE_PREFIX = "_vt_studio_";

/**
 * System table names
 */
export const SYSTEM_TABLES = {
  TABLE_TAGS: `${SYSTEM_TABLE_PREFIX}table_tags`,
  TAGS: `${SYSTEM_TABLE_PREFIX}tags`,
} as const;

/**
 * Check if a table name is a system table
 */
export function isSystemTable(tableName: string): boolean {
  return tableName.startsWith(SYSTEM_TABLE_PREFIX);
}

/**
 * SQL statements to create system tables
 */
const CREATE_SYSTEM_TABLES_SQL = [
  // Tags metadata table
  `CREATE TABLE IF NOT EXISTS ${SYSTEM_TABLES.TAGS} (
		tag TEXT PRIMARY KEY,
		color TEXT,
		description TEXT,
		created_at TEXT DEFAULT (datetime('now'))
	)`,

  // Table-to-tags junction table
  `CREATE TABLE IF NOT EXISTS ${SYSTEM_TABLES.TABLE_TAGS} (
		table_name TEXT NOT NULL,
		tag TEXT NOT NULL,
		created_at TEXT DEFAULT (datetime('now')),
		PRIMARY KEY (table_name, tag),
		FOREIGN KEY (tag) REFERENCES ${SYSTEM_TABLES.TAGS}(tag) ON DELETE CASCADE
	)`,

  // Index for faster tag lookups
  `CREATE INDEX IF NOT EXISTS idx_table_tags_tag
	 ON ${SYSTEM_TABLES.TABLE_TAGS}(tag)`,
];

/**
 * Initialize system tables in the Val Town database.
 * This function is idempotent - it's safe to call multiple times.
 *
 * @param driver - The queryable database driver
 * @returns Promise that resolves when tables are created
 */
export async function initializeSystemTables(
  driver: QueryableBaseDriver,
): Promise<void> {
  try {
    // Use transaction to ensure all tables are created atomically
    await driver.transaction(CREATE_SYSTEM_TABLES_SQL);
  } catch (error) {
    // Log error but don't throw - we don't want to block connection
    // if system tables fail to create
    console.error("Failed to initialize system tables:", error);
  }
}

/**
 * Check if system tables exist in the database
 *
 * @param driver - The queryable database driver
 * @returns Promise that resolves to true if tables exist
 */
export async function systemTablesExist(
  driver: QueryableBaseDriver,
): Promise<boolean> {
  try {
    const result = await driver.query(
      `SELECT COUNT(*) as count FROM sqlite_master
			 WHERE type='table' AND name LIKE '${SYSTEM_TABLE_PREFIX}%'`,
    );

    const count = result.rows[0]?.count as number;
    return count >= Object.keys(SYSTEM_TABLES).length;
  } catch {
    return false;
  }
}
