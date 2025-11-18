import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
	tag: string;
	color?: string | null;
	onRemove?: () => void;
	size?: "sm" | "md";
	className?: string;
}

const DEFAULT_COLORS = [
	"#3b82f6", // blue
	"#8b5cf6", // purple
	"#ec4899", // pink
	"#f59e0b", // amber
	"#10b981", // emerald
	"#06b6d4", // cyan
	"#f97316", // orange
	"#6366f1", // indigo
];

function getTagColor(tag: string, customColor?: string | null): string {
	if (customColor) return customColor;

	// Generate consistent color from tag name
	const hash = tag.split("").reduce((acc, char) => {
		return char.charCodeAt(0) + ((acc << 5) - acc);
	}, 0);

	return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

function getContrastColor(hexColor: string): "light" | "dark" {
	// Remove # if present
	const hex = hexColor.replace("#", "");

	// Parse RGB values
	const r = Number.parseInt(hex.substr(0, 2), 16);
	const g = Number.parseInt(hex.substr(2, 2), 16);
	const b = Number.parseInt(hex.substr(4, 2), 16);

	// Calculate relative luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	return luminance > 0.5 ? "dark" : "light";
}

export function TagBadge({
	tag,
	color,
	onRemove,
	size = "sm",
	className,
}: TagBadgeProps) {
	const bgColor = getTagColor(tag, color);
	const textColor = getContrastColor(bgColor);

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded font-medium",
				size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
				className,
			)}
			style={{
				backgroundColor: bgColor,
				color: textColor === "light" ? "#ffffff" : "#000000",
			}}
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
