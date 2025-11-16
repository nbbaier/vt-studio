import { Position } from "@xyflow/react";
import { BaseHandle } from "@/components/base-handle";
import {
	type ExplainNodeProps,
	formatCost,
} from "../build-query-explanation-flow";
import { TooltipExplainHandle } from "./tooltip-handle";

export function TableBlock(props: ExplainNodeProps) {
	let bgColor = "bg-emerald-700";
	let label = "Unique Key Lookup";

	if (props.data.access_type === "ALL") {
		bgColor = "bg-rose-700";
		label = "Full Table Scan";
	}

	if (props.data.access_type === "range") {
		bgColor = "bg-yellow-700";
		label = "Index Range Scan";
	}

	if (props.data.access_type === "ref") {
		label = "Non-Unique Key Lookup";
	}

	if (props.data.access_type === "index") {
		bgColor = "bg-rose-700";
		label = "Full Index Scan";
	}

	if (props.data.access_type === "const") {
		label = "Single Row (constant)";
		bgColor = "bg-sky-700";
	}

	return (
		<TooltipExplainHandle
			content={
				<div>
					<p className="text-[9pt]!">
						Prefix Cost: {props.data.cost_info.prefix_cost}
					</p>
				</div>
			}
			disabled={props.data.cost_info.prefix_cost === 0}
		>
			<div>
				<BaseHandle
					type="source"
					position={Position.Top}
					id={props.id}
					className="h-[10px]! w-[10px]! opacity-0 group-hover:opacity-100"
				/>
				<BaseHandle
					type="source"
					position={Position.Right}
					id={"right"}
					className="h-[10px]! w-[10px]! opacity-0 group-hover:opacity-100"
				/>
				<div
					className={`flex flex-row items-center justify-between text-[8pt]`}
				>
					<div
						className={`${props.data.cost_info.read_cost === 0 ? "hidden" : ""}`}
					>
						<small>
							{formatCost(
								Number(props.data.cost_info.read_cost) +
									Number(props.data.cost_info.eval_cost),
							)}
						</small>
					</div>
					<div
						className={`${props.data.rows_examined_per_scan === "0" ? "hidden" : ""}`}
					>
						<small>
							{formatCost(Number(props.data.rows_examined_per_scan))} rows
						</small>
					</div>
				</div>
				<div
					className={`rounded-md border-b p-2 text-center text-[9pt] text-white ${bgColor}`}
				>
					<small>{label}</small>
				</div>
				<div className="flex flex-col items-center justify-center text-[8pt]">
					<div>
						<small>{props.data.table_name}</small>
					</div>
					<div>
						<small className="font-bold">{props.data.key}</small>
					</div>
				</div>
			</div>
		</TooltipExplainHandle>
	);
}
