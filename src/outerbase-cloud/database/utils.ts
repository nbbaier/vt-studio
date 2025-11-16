import type { DatabaseResultSet } from "@/drivers/base-driver";
import { SqliteLikeBaseDriver } from "@/drivers/sqlite-base-driver";
import type {
  OuterbaseAPIQueryRaw,
  OuterbaseDatabaseConfig,
} from "../api-type";
import { OuterbaseQueryable } from "./query";

export function transformOuterbaseResult(
  result: OuterbaseAPIQueryRaw
): DatabaseResultSet {
  return {
    rows: result.items,
    headers: result.headers,
    stat: result.stat ?? {
      rowsAffected: 0,
      rowsRead: null,
      rowsWritten: null,
      queryDurationMs: null,
    },
    lastInsertRowid: result.lastInsertRowid,
  };
}

export function createOuterbaseDatabaseDriver(
  _type: string,
  config: OuterbaseDatabaseConfig
) {
  const queryable = new OuterbaseQueryable(config);

  // Val Town-only migration: Only SQLite dialect is supported
  return new SqliteLikeBaseDriver(queryable);
}
