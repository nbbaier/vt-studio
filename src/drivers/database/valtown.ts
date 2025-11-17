import type {
	DatabaseHeader,
	DatabaseResultSet,
	DatabaseRow,
	QueryableBaseDriver,
} from "@/drivers/base-driver";
import { convertSqliteType } from "@/drivers/sqlite/sql-helper";
import ValTown from "@valtown/sdk";
import type { ResultSet } from "@valtown/sdk/resources/shared";

// Val Town statement types (for compatibility with existing code)
export type InStatement =
	| string
	| {
			sql: string;
			args: unknown[];
	  };

function transformRawResult(raw: ResultSet): DatabaseResultSet {
	const headerSet = new Set();

	const headers: DatabaseHeader[] = raw.columns.map(
		(colName: string, colIdx: number) => {
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
		},
	);

	const rows = raw.rows.map((r: unknown[]) =>
		headers.reduce((a, b, idx) => {
			const cellValue = r[idx];
			if (cellValue instanceof Uint8Array) {
				a[b.name] = Array.from(cellValue);
			} else {
				a[b.name] = r[idx];
			}
			return a;
		}, {} as DatabaseRow),
	);

	return {
		rows,
		stat: {
			rowsAffected: raw.rowsAffected,

			// These fields may not be present in all responses
			// but are maintained for compatibility with existing interfaces
			rowsRead: (raw as any).rowsRead ?? null,
			rowsWritten: (raw as any).rowsWritten ?? null,
			queryDurationMs: (raw as any).queryDurationMS ?? null,
		},

		headers,
		lastInsertRowid:
			raw.lastInsertRowid === undefined || raw.lastInsertRowid === null
				? undefined
				: typeof raw.lastInsertRowid === "string"
					? Number(raw.lastInsertRowid)
					: Number(raw.lastInsertRowid),
	};
}

export class ValtownQueryable implements QueryableBaseDriver {
	private client: ValTown;

	constructor(protected token: string) {
		this.client = new ValTown({
			bearerToken: token,
		});
	}

	async transaction(stmts: InStatement[]): Promise<DatabaseResultSet[]> {
		try {
			const response = await this.client.sqlite.batch({
				statements: stmts,
				mode: "write",
			});

			return response.map(transformRawResult);
		} catch (error) {
			// Handle SDK errors
			if (error instanceof Error) {
				throw new Error(`Val Town API error: ${error.message}`);
			}
			throw error;
		}
	}

	async query(stmt: InStatement): Promise<DatabaseResultSet> {
		try {
			const response = await this.client.sqlite.execute({
				statement: stmt,
			});

			return transformRawResult(response);
		} catch (error) {
			// Handle SDK errors
			if (error instanceof Error) {
				throw new Error(`Val Town API error: ${error.message}`);
			}
			throw error;
		}
	}
}
