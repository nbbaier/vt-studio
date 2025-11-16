import type { DatabaseTableColumnConstraint } from "@/drivers/base-driver";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { LucideStar } from "lucide-react";
import { Button } from "../../ui/button";
import ConflictClauseOptions from "./column-conflict-clause";
import type { ColumnChangeEvent } from "./schema-editor-column-list";

export default function ColumnUniquePopup({
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
        <span className="block rounded border bg-yellow-200 p-1 shadow-sm dark:bg-yellow-600">
          <LucideStar className="h-4 w-4" />
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Unique</div>
          <ConflictClauseOptions
            value={constraint.uniqueConflict}
            disabled={disabled}
            onChange={(v) => {
              onChange({
                constraint: {
                  uniqueConflict: v,
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
                  unique: undefined,
                  uniqueConflict: undefined,
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
