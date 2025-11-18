import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Funnel, LucideSearch, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { scc } from "@/core/command";
import type { StudioExtensionMenuItem } from "@/core/extension-manager";
import { useTags } from "@/hooks/use-table-tags";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import SchemaCreateDialog from "./schema-editor/schema-create";
import SchemaList from "./schema-sidebar-list";

export default function SchemaView() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { databaseDriver, extensions } = useStudioContext();
  const { currentSchemaName } = useSchema();
  const [isCreateSchema, setIsCreateSchema] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(true);
  const { tags } = useTags(databaseDriver);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setShowButton(width >= 200);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const contentMenu = useMemo(() => {
    const items: StudioExtensionMenuItem[] = [];

    const flags = databaseDriver.getFlags();

    if (flags.supportCreateUpdateTable) {
      items.push({
        title: "Create Table",
        key: "create-table",
        onClick: () => {
          scc.tabs.openBuiltinSchema({ schemaName: currentSchemaName });
        },
      });
    }

    if (flags.supportCreateUpdateDatabase) {
      items.push({
        title: "Create Database/Schema",
        key: "create-schema",
        onClick: () => {
          setIsCreateSchema(true);
        },
      });
    }

    return [...items, ...extensions.getResourceCreateMenu()];
  }, [databaseDriver, currentSchemaName, extensions]);

  const activatorButton = useMemo(() => {
    if (contentMenu.length === 0) return null;

    if (contentMenu.length === 1) {
      return (
        <button
          type="button"
          className={cn(
            buttonVariants({ size: "icon" }),
            "h-8 w-8 rounded-full bg-neutral-800 dark:bg-neutral-200",
            !showButton && "invisible pointer-events-none",
          )}
          onClick={contentMenu[0].onClick}
        >
          <Plus size={16} />
        </button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              buttonVariants({ size: "icon" }),
              "h-8 w-8 rounded-full bg-neutral-800 dark:bg-neutral-200",
              !showButton && "invisible pointer-events-none",
            )}
          >
            <Plus size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
          {contentMenu.map((menu) => {
            return (
              <DropdownMenuItem key={menu.title} onClick={menu.onClick}>
                {menu.title}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [contentMenu, showButton]);
  return (
    <div ref={containerRef} className="flex grow flex-col overflow-hidden">
      {isCreateSchema && (
        <SchemaCreateDialog
          onClose={() => {
            setIsCreateSchema(false);
          }}
        />
      )}

      <div className="flex flex-col p-4 pb-2">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-primary text-xl font-medium">Tables</h1>
          <div className="flex items-center gap-2">
            {tags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      buttonVariants({ size: "icon" }),
                      "h-8 w-8 rounded-full",
                      selectedTags.length > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-neutral-200 dark:bg-neutral-800",
                    )}
                  >
                    <Funnel size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {tags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag.tag}
                      checked={selectedTags.includes(tag.tag)}
                      onCheckedChange={(checked) => {
                        setSelectedTags((prev) =>
                          checked
                            ? [...prev, tag.tag]
                            : prev.filter((t) => t !== tag.tag),
                        );
                      }}
                    >
                      {tag.tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedTags.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setSelectedTags([])}
                        className="text-sm"
                      >
                        Clear filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {activatorButton}
          </div>
        </div>

        <div className="flex h-[32px] w-full cursor-text items-center overflow-hidden rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline-1 outline-neutral-200 focus:outline-neutral-400/70 disabled:cursor-not-allowed disabled:opacity-50 has-focus:outline-neutral-400/70 has-enabled:active:outline-neutral-400/70 has-disabled:cursor-not-allowed has-disabled:opacity-50 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600 dark:has-focus:outline-neutral-600 dark:has-enabled:active:outline-neutral-600">
          <div className="flex h-full items-center text-sm">
            <LucideSearch
              className="text-neutral-500"
              style={{ width: 14, height: 14 }}
            />
          </div>
          <input
            type="text"
            className="h-full flex-1 grow bg-transparent p-2 pr-2 pl-2 text-sm font-light outline-hidden placeholder:text-neutral-500"
            value={search}
            placeholder="Search tables"
            onChange={(e) => {
              setSearch(e.currentTarget.value);
            }}
          />
        </div>
      </div>

      <SchemaList search={search} selectedTags={selectedTags} />
    </div>
  );
}
