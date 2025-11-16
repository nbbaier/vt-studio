import React from "react";
import { cn } from "@/lib/utils";

export const BaseNode = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"bg-card text-card-foreground rounded-md border p-5",
			className,
			selected ? "border-muted-foreground shadow-lg" : "",
			"hover:ring-1",
		)}
		{...props}
	/>
));
BaseNode.displayName = "BaseNode";
