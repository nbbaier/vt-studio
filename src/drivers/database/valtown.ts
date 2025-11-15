import {
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  QueryableBaseDriver,
} from "@/drivers/base-driver";
import { InStatement, ResultSet } from "@libsql/client";
import { convertSqliteType } from "@/drivers/sqlite/sql-helper";

function transformRawResult(raw: ResultSet): DatabaseResultSet {
  const headerSet = new Set();

  const headers: DatabaseHeader[] = raw.columns.map((colName, colIdx) => {
    const colType = raw.columnTypes[colIdx];
    let renameColName = colName;

    for (let i = 0; i < 20; i++) {
      if (!headerSet.has(renameColName)) break;
      renameColName = `__${colName}_${i}`;
    }

    headerSet.add(renameColName);

    return {
      name: renameColName,
      displayName: colName,
      originalType: colType,
      type: convertSqliteType(colType),
    };
  });

  const rows = raw.rows.map((r) =>
    headers.reduce((a, b, idx) => {
      const cellValue = r[idx];
      if (cellValue instanceof Uint8Array) {
        a[b.name] = Array.from(cellValue);
      } else {
        a[b.name] = r[idx];
      }
      return a;
    }, {} as DatabaseRow)
  );

  return {
    rows,
    stat: {
      rowsAffected: raw.rowsAffected,

      // This is unique for stateless driver
      rowsRead: (raw as any).rowsRead ?? null,
      rowsWritten: (raw as any).rowsWritten ?? null,
      queryDurationMs: (raw as any).queryDurationMS ?? null,
    },

    headers,
    lastInsertRowid:
      raw.lastInsertRowid === undefined
        ? undefined
        : Number(raw.lastInsertRowid),
  };
}

export class ValtownQueryable implements QueryableBaseDriver {
  constructor(protected token: string) {}

  async transaction(stmts: InStatement[]): Promise<DatabaseResultSet[]> {
    const r = await fetch(`https://api.val.town/v1/sqlite/batch`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statements: stmts,
        mode: "write",
      }),
    });

    const json = await r.json();
    return json.map(transformRawResult);
  }

  async query(stmt: InStatement): Promise<DatabaseResultSet> {
    const r = await fetch(`https://api.val.town/v1/sqlite/execute`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ statement: stmt }),
    });

    const json = await r.json();

    return transformRawResult(json as ResultSet);
  }
}
