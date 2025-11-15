"use client";
import ColumnTypeSelector from "@/components/gui/schema-editor/column-type-selector";
import { ColumnTypeSuggestionGroup } from "@/drivers/base-driver";
import { useState } from "react";

// Val Town-only migration: Using SQLite data types instead of MySQL
const SQLITE_DATA_TYPE_SUGGESTIONS: ColumnTypeSuggestionGroup[] = [
  {
    name: "Numeric",
    suggestions: [
      { name: "INTEGER", description: "Signed integer" },
      { name: "REAL", description: "Floating point value" },
      { name: "NUMERIC", description: "Numeric value" },
    ],
  },
  {
    name: "Text",
    suggestions: [
      { name: "TEXT", description: "Text string" },
      { name: "VARCHAR", description: "Variable character string" },
    ],
  },
  {
    name: "Binary",
    suggestions: [{ name: "BLOB", description: "Binary large object" }],
  },
];

export default function ColumnTypeStorybook() {
  const [value, setValue] = useState("");

  return (
    <div className="p-4">
      <ColumnTypeSelector
        value={value}
        onChange={setValue}
        suggestions={SQLITE_DATA_TYPE_SUGGESTIONS}
      />
    </div>
  );
}
