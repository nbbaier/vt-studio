import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  color?: string | null;
  onRemove?: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function TagBadge({
  tag,
  onRemove,
  size = "sm",
  className,
}: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border font-medium",
        "border-neutral-300 bg-neutral-100 text-neutral-700",
        "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
        className,
      )}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 focus:opacity-70 focus:outline-hidden"
          aria-label={`Remove ${tag} tag`}
        >
          <X size={size === "sm" ? 12 : 14} weight="bold" />
        </button>
      )}
    </span>
  );
}
