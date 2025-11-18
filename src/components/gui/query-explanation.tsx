import { useMemo } from "react";
import { z } from "zod";
import type {
  DatabaseResultSet,
  SupportedDialect,
} from "@/drivers/base-driver";
import QueryExplanationDiagram from "./query-explanation-diagram";
import { convertSQLiteRowToQueryPlan } from "./query-explanation-diagram/build-query-explanation-flow";

interface QueryExplanationProps {
  data: DatabaseResultSet;
  dialect?: SupportedDialect;
}

export interface ExplanationRow {
  id: number;
  parent: number;
  notused: number;
  detail: string;
}

export type ExplanationRowWithChildren = ExplanationRow & {
  children: ExplanationRowWithChildren[];
};

const queryExplanationRowSchema = z.object({
  id: z.number(),
  parent: z.number(),
  notused: z.number(),
  detail: z.string(),
});

export function isExplainQueryPlan(sql: string, dialect: SupportedDialect) {
  // Val Town-only migration: Only SQLite is supported
  if (dialect !== "sqlite") return false;

  if (sql.toLowerCase().startsWith("explain query plan")) {
    return true;
  }

  return false;
}

function buildQueryExplanationTree(nodes: ExplanationRow[]) {
  const map: Record<number, ExplanationRowWithChildren> = {};
  const tree: ExplanationRowWithChildren[] = [];

  nodes.forEach((node) => {
    map[node.id] = { ...node, children: [] };
  });

  nodes.forEach((node) => {
    if (node.parent === 0) {
      tree.push(map[node.id]);
    } else {
      map[node.parent].children.push(map[node.id]);
    }
  });

  return tree;
}

function mapExplanationRows(props: QueryExplanationProps) {
  // Val Town-only migration: Only SQLite is supported
  if (props.dialect !== "sqlite") {
    return {
      _tag: "ERROR" as const,
      value: new Error("Only SQLite dialect is supported"),
    };
  }

  const isExplanationRows = z.array(queryExplanationRowSchema).safeParse(
    props.data.rows.map((r) => ({
      ...r,
      id: Number(r.id),
      parent: Number(r.parent),
      notused: Number(r.notused),
    })),
  );

  if (isExplanationRows?.error) {
    return { _tag: "ERROR" as const, value: isExplanationRows.error };
  }

  return {
    _tag: "SUCCESS" as const,
    value: buildQueryExplanationTree(isExplanationRows?.data || []),
  };
}

export function QueryExplanation(props: QueryExplanationProps) {
  const tree = useMemo(() => mapExplanationRows(props), [props]);

  if (tree._tag === "ERROR") {
    // The row structure doesn't match the explanation structure
    return (
      <div>
        <p className="text-destructive">
          Something went wrong while trying to display the explanation!
        </p>
      </div>
    );
  }

  // Transform SQLite EXPLAIN QUERY PLAN output into flow diagram format
  const value = convertSQLiteRowToQueryPlan(
    props.data.rows as unknown as ExplanationRow[],
  );

  return (
    <div className="h-full overflow-y-auto p-5 font-mono">
      <QueryExplanationDiagram items={value} />
    </div>
  );
}
