/**
 * React hooks for managing table tags
 */

import { useCallback, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import type { BaseDriver } from "@/drivers/base-driver";
import { SYSTEM_TABLES } from "@/lib/system-tables";

export interface Tag {
	tag: string;
	color?: string | null;
	description?: string | null;
	created_at?: string;
}

export interface TableTag {
	table_name: string;
	tag: string;
	created_at?: string;
}

/**
 * Hook to fetch and manage all tags
 */
export function useTags(driver: BaseDriver | null) {
	const { mutate: globalMutate } = useSWRConfig();
	const { data, error, mutate } = useSWR(
		driver ? ["tags", driver] : null,
		async () => {
			if (!driver) return [];
			const result = await driver.query(
				`SELECT tag, color, description, created_at FROM ${SYSTEM_TABLES.TAGS} ORDER BY tag`,
			);
			return result.rows as unknown as Tag[];
		},
	);

	const createTag = useCallback(
		async (tag: string, color?: string, description?: string) => {
			if (!driver) return;

			await driver.query(
				`INSERT INTO ${SYSTEM_TABLES.TAGS} (tag, color, description)
				 VALUES (${driver.escapeValue(tag)}, ${driver.escapeValue(color ?? null)}, ${driver.escapeValue(description ?? null)})`,
			);
			// Invalidate all tag-related caches
			await mutate();
			await globalMutate(
				(key) => Array.isArray(key) && key[0] === "all-table-tags",
			);
		},
		[driver, mutate, globalMutate],
	);

	const updateTag = useCallback(
		async (tag: string, color?: string, description?: string) => {
			if (!driver) return;

			await driver.query(
				`UPDATE ${SYSTEM_TABLES.TAGS}
				 SET color = ${driver.escapeValue(color ?? null)},
				     description = ${driver.escapeValue(description ?? null)}
				 WHERE tag = ${driver.escapeValue(tag)}`,
			);
			// Invalidate all tag-related caches
			await mutate();
			await globalMutate(
				(key) => Array.isArray(key) && key[0] === "all-table-tags",
			);
		},
		[driver, mutate, globalMutate],
	);

	const deleteTag = useCallback(
		async (tag: string) => {
			if (!driver) return;

			await driver.query(
				`DELETE FROM ${SYSTEM_TABLES.TAGS} WHERE tag = ${driver.escapeValue(tag)}`,
			);
			// Invalidate all tag-related caches
			await mutate();
			await globalMutate(
				(key) => Array.isArray(key) && key[0] === "all-table-tags",
			);
			await globalMutate(
				(key) => Array.isArray(key) && key[0] === "table-tags",
			);
		},
		[driver, mutate, globalMutate],
	);

	return {
		tags: data ?? [],
		isLoading: !error && !data,
		isError: error,
		createTag,
		updateTag,
		deleteTag,
		refresh: mutate,
	};
}

/**
 * Hook to fetch and manage tags for a specific table
 */
export function useTableTags(driver: BaseDriver | null, tableName?: string) {
	const { mutate: globalMutate } = useSWRConfig();
	const { data, error, mutate } = useSWR(
		driver && tableName ? ["table-tags", driver, tableName] : null,
		async () => {
			if (!driver || !tableName) return [];
			const result = await driver.query(
				`SELECT tt.table_name, tt.tag, tt.created_at, t.color, t.description
				 FROM ${SYSTEM_TABLES.TABLE_TAGS} tt
				 LEFT JOIN ${SYSTEM_TABLES.TAGS} t ON tt.tag = t.tag
				 WHERE tt.table_name = ${driver.escapeValue(tableName)}
				 ORDER BY tt.tag`,
			);
			return result.rows as unknown as (TableTag &
				Pick<Tag, "color" | "description">)[];
		},
	);

	const addTagToTable = useCallback(
		async (tag: string) => {
			if (!driver || !tableName) return;

			await driver.query(
				`INSERT OR IGNORE INTO ${SYSTEM_TABLES.TABLE_TAGS} (table_name, tag)
				 VALUES (${driver.escapeValue(tableName)}, ${driver.escapeValue(tag)})`,
			);
			// Invalidate both specific table tags and all table tags
			await mutate();
			await globalMutate(
				(key) => Array.isArray(key) && key[0] === "all-table-tags",
			);
		},
		[driver, tableName, mutate, globalMutate],
	);

	const removeTagFromTable = useCallback(
		async (tag: string) => {
			if (!driver || !tableName) return;

			await driver.query(
				`DELETE FROM ${SYSTEM_TABLES.TABLE_TAGS}
				 WHERE table_name = ${driver.escapeValue(tableName)}
				   AND tag = ${driver.escapeValue(tag)}`,
			);
			// Invalidate both specific table tags and all table tags
			await mutate();
			await globalMutate(
				(key) => Array.isArray(key) && key[0] === "all-table-tags",
			);
		},
		[driver, tableName, mutate, globalMutate],
	);

	return {
		tableTags: data ?? [],
		isLoading: !error && !data,
		isError: error,
		addTagToTable,
		removeTagFromTable,
		refresh: mutate,
	};
}

/**
 * Hook to fetch all table-tag relationships
 */
export function useAllTableTags(driver: BaseDriver | null) {
	const { data, error, mutate } = useSWR(
		driver ? ["all-table-tags", driver] : null,
		async () => {
			if (!driver) return [];
			const result = await driver.query(
				`SELECT tt.table_name, tt.tag, t.color, t.description
				 FROM ${SYSTEM_TABLES.TABLE_TAGS} tt
				 LEFT JOIN ${SYSTEM_TABLES.TAGS} t ON tt.tag = t.tag
				 ORDER BY tt.table_name, tt.tag`,
			);
			return result.rows as unknown as (TableTag &
				Pick<Tag, "color" | "description">)[];
		},
	);

	// Group tags by table name
	const tagsByTable = useMemo(() => {
		const grouped: Record<
			string,
			(TableTag & Pick<Tag, "color" | "description">)[]
		> = {};
		for (const row of data ?? []) {
			if (!grouped[row.table_name]) {
				grouped[row.table_name] = [];
			}
			grouped[row.table_name].push(row);
		}
		return grouped;
	}, [data]);

	return {
		allTableTags: data ?? [],
		tagsByTable,
		isLoading: !error && !data,
		isError: error,
		refresh: mutate,
	};
}
