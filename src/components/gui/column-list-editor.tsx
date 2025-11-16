import { LucidePlus, LucideX } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { useState } from "react";

interface Props {
  value: string[];
  columns: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export default function ColumnListEditor({
  value,
  columns,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      {value.map((columnName, idx) => {
        return (
          <div
            key={idx}
            className="bg-secondary flex items-center rounded px-2"
          >
            <span className="p-1">{columnName}</span>
            {!disabled && (
              <span
                className="ml-1 cursor-pointer rounded-full p-1 hover:bg-red-400"
                onClick={() => {
                  onChange(value.filter((c) => c !== columnName));
                }}
              >
                <LucideX className="h-3 w-3" />
              </span>
            )}
          </div>
        );
      })}

      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <button className="bg-secondary rounded p-1">
              <LucidePlus className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search column name..." />

              <CommandEmpty>No column found.</CommandEmpty>
              <CommandGroup className="max-h-[250px] overflow-y-auto">
                {columns
                  .filter((c) => !value.includes(c))
                  .map((column) => (
                    <CommandItem
                      key={column}
                      value={column}
                      onSelect={() => {
                        setOpen(false);
                        onChange([...value, column]);
                      }}
                    >
                      {column}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
