import type { DatabaseTableColumn } from "@/drivers/base-driver";
import type { ColumnType } from "@outerbase/sdk-transform";

export interface TableHeaderMetadata {
  from?: {
    schema: string;
    table: string;
    column: string;
  };

  // Primary key
  isPrimaryKey: boolean;

  // Foreign key reference
  referenceTo?: {
    schema: string;
    table: string;
    column: string;
  };

  type?: ColumnType;
  originalType?: string;

  columnSchema?: DatabaseTableColumn;
}
