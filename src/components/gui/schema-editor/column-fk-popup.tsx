import { LucideArrowUpRight } from "lucide-react";
import type { DatabaseForeignKeyClause } from "@/drivers/base-driver";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Separator } from "../../ui/separator";
import TableColumnCombobox from "../table-combobox/TableColumnCombobox";
import TableCombobox from "../table-combobox/TableCombobox";
import type { ColumnChangeEvent } from "./schema-editor-column-list";

export default function ColumnForeignKeyPopup({
  constraint,
  disabled,
  schemaName,
  onChange,
}: Readonly<{
  constraint: DatabaseForeignKeyClause;
  schemaName: string;
  disabled: boolean;
  onChange: ColumnChangeEvent;
}>) {
  return (
    <Popover>
      <PopoverTrigger>
        <span className="block rounded border bg-blue-300 p-1 shadow-sm dark:bg-blue-600">
          <LucideArrowUpRight className="h-4 w-4" />
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Foreign Key</div>

          <Separator />

          <div className="mt-2 flex flex-col gap-2">
            <Label className="text-xs font-normal">Foreign Table Name</Label>
            <TableCombobox
              schemaName={schemaName}
              value={constraint.foreignTableName}
              disabled={disabled}
              onChange={(newTable) => {
                onChange({
                  constraint: {
                    foreignKey: {
                      ...constraint,
                      foreignTableName: newTable,
                    },
                  },
                });
              }}
            />
          </div>

          {constraint.foreignTableName && (
            <div className="mt-2 flex flex-col gap-2">
              <Label className="text-xs font-normal">Foreign Column Name</Label>
              <TableColumnCombobox
                value={(constraint.foreignColumns ?? [undefined])[0]}
                disabled={disabled}
                onChange={(colName) => {
                  onChange({
                    constraint: {
                      foreignKey: {
                        ...constraint,
                        foreignColumns: [colName],
                      },
                    },
                  });
                }}
                schemaName={schemaName}
                tableName={constraint.foreignTableName}
              />
            </div>
          )}

          <Button
            size="sm"
            className="mt-4"
            variant={"destructive"}
            disabled={disabled}
            onClick={() => {
              onChange({
                constraint: {
                  foreignKey: undefined,
                },
              });
            }}
          >
            Remove Constraint
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
