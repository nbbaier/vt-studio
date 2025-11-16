import type { SavedConnectionRawLocalStorage } from "@/lib/saved-connection-storage";
import { ValtownQueryable } from "./database/valtown";
import { SqliteLikeBaseDriver } from "./sqlite-base-driver";

/**
 * Creates a database driver instance.
 * Currently supports only Val Town SQLite connections.
 */
export function createLocalDriver(conn: SavedConnectionRawLocalStorage) {
	if (conn.driver !== "valtown") {
		throw new Error("Only Val Town connections are supported");
	}

	if (!conn.token) {
		throw new Error("Token is required for Val Town connections");
	}

	return new SqliteLikeBaseDriver(new ValtownQueryable(conn.token));
}

/**
 * Convenience function for creating Val Town driver
 */
export function createValtownDriver(token: string) {
	return new SqliteLikeBaseDriver(new ValtownQueryable(token));
}
