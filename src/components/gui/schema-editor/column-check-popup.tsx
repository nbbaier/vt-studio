import { LucideCheck } from "lucide-react";
import type { DatabaseTableColumnConstraint } from "@/drivers/base-driver";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Textarea } from "../../ui/textarea";
import type { ColumnChangeEvent } from "./schema-editor-column-list";

export default function ColumnCheckPopup({
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
				<span className="block rounded border p-1 shadow-sm">
					<LucideCheck className="h-4 w-4" />
				</span>
			</PopoverTrigger>
			<PopoverContent>
				<div className="flex flex-col gap-2">
					<div className="text-sm font-semibold">Check</div>

					<Textarea
						rows={4}
						placeholder="Check Expression"
						className="bg-background font-mono"
						disabled={disabled}
						value={constraint.checkExpression ?? ""}
						onChange={(e) => {
							onChange({
								constraint: {
									checkExpression: e.currentTarget.value,
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
									checkExpression: undefined,
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
