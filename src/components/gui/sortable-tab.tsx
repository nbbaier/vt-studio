import { useSortable } from "@dnd-kit/sortable";
import { type LucideIcon, LucideX } from "lucide-react";
import { forwardRef } from "react";
import { CSS } from "@/lib/dnd-kit";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "../ui/button";
import type { WindowTabItemProps } from "./windows-tab";

interface SortableTabProps {
  tab: WindowTabItemProps;
  selected: boolean;
  index: number;
  tabCount: number;
  onSelectChange: () => void;
  onClose?: () => void;
}

type WindowTabItemButtonProps = ButtonProps & {
  selected?: boolean;
  title: string;
  icon: LucideIcon;
  onClose?: () => void;
  isDragging?: boolean;
  index: number;
};

export const WindowTabItemButton = forwardRef<
  HTMLDivElement,
  WindowTabItemButtonProps
>(function WindowTabItemButton(props: WindowTabItemButtonProps, ref) {
  const {
    icon: Icon,
    selected,
    title,
    onClose,
    isDragging,
    index,
    onClick,
    onKeyDown,
    style,
    ...rest
  } = props;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const handleAuxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1 && onClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onClick) {
        onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    }
    if (onKeyDown) {
      onKeyDown(e as unknown as React.KeyboardEvent<HTMLButtonElement>);
    }
  };

  const divProps: React.HTMLAttributes<HTMLDivElement> = {
    ...(rest as React.HTMLAttributes<HTMLDivElement>),
    style,
  };

  return (
    <div
      role="tab"
      aria-selected={selected}
      aria-label={title}
      tabIndex={0}
      className={cn(
        "relative flex h-[40px] max-w-[300px] min-w-[170px] items-center border-x bg-neutral-100 px-2 text-left text-sm text-neutral-500 hover:text-black dark:bg-neutral-900 dark:hover:text-white cursor-pointer",
        isDragging && "z-20",
        selected
          ? "text-primary bg-neutral-50 dark:bg-neutral-950"
          : "border-b border-x-transparent",
        index === 0 ? "border-l-0" : "",
      )}
      onAuxClick={handleAuxClick}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={ref}
      {...divProps}
    >
      <Icon className="ml-2 h-4 w-4 shrink-0 grow-0" />
      <div className="line-clamp-1 grow px-2">{title}</div>
      {onClose && (
        <button
          type="button"
          className={cn(
            "ml-2 flex h-5 w-5 items-center justify-center rounded border-0 bg-transparent p-0 hover:bg-neutral-800 hover:text-white",
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          aria-label="Close tab"
        >
          <LucideX className={cn("h-3 w-3 shrink-0 grow-0")} />
        </button>
      )}

      {!selected && (
        <div className="bg-border absolute top-2 -right-px h-6 w-px dark:bg-neutral-800" />
      )}
    </div>
  );
});

export function SortableTab({
  index,
  tab,
  selected,
  onSelectChange,
  onClose,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
    setNodeRef,
  } = useSortable({ id: tab.key });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <WindowTabItemButton
      ref={setNodeRef}
      icon={tab.icon}
      title={tab.title}
      onClick={onSelectChange}
      selected={selected}
      onClose={onClose}
      style={style}
      index={index}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    />
  );
}
