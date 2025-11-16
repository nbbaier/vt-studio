import type {
  DatabaseTableColumnConstraint,
  SqlOrder,
} from "@/drivers/base-driver";
import { LucideKeyRound } from "lucide-react";
import { Button } from "../../ui/button";
import ConflictClauseOptions from "./column-conflict-clause";
import type { ColumnChangeEvent } from "./schema-editor-column-list";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export default function ColumnPrimaryKeyPopup({
  constraint,
  disabled,
  onChange,
}: Readonly<{
  constraint: DatabaseTableColumnConstraint;
  disabled: boolean;
  onChange: ColumnChangeEvent;
}>) {
  return (
    <Popover>
      <PopoverTrigger>
        <span className="block rounded border bg-green-200 p-1 shadow-sm dark:bg-green-600">
          <LucideKeyRound className="h-4 w-4" />
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Primary Key</div>
          <Select
            value={constraint.primaryKeyOrder}
            disabled={disabled}
            onValueChange={(v) => {
              onChange({
                constraint: {
                  primaryKeyOrder: v as SqlOrder,
                },
              });
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASC">ASC</SelectItem>
              <SelectItem value="DESC">DESC</SelectItem>
            </SelectContent>
          </Select>
          <ConflictClauseOptions
            value={constraint.primaryKeyConflict}
            disabled={disabled}
            onChange={(v) => {
              onChange({
                constraint: {
                  primaryKeyConflict: v,
                },
              });
            }}
          />
          <Button
            size="sm"
            className="mt-4"
            variant={"destructive"}
            disabled={disabled}
            onClick={() => {
              onChange({
                constraint: {
                  primaryKey: undefined,
                  primaryKeyConflict: undefined,
                  primaryKeyOrder: undefined,
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
