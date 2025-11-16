import { Position } from "@xyflow/react";
import { BaseHandle } from "@/components/base-handle";
import {
  type ExplainNodeProps,
  formatCost,
} from "../build-query-explanation-flow";
import { TooltipExplainHandle } from "./tooltip-handle";

export function NestedLoop(props: ExplainNodeProps) {
  return (
    <TooltipExplainHandle
      content={
        <div>
          <p className="text-[9pt]!">
            Prefix Cost: {props.data.cost_info.prefix_cost}
            {props.id}
          </p>
        </div>
      }
      disabled={props.data.cost_info.prefix_cost === 0}
    >
      <div>
        <BaseHandle
          type="source"
          position={Position.Right}
          id={props.id}
          className="h-[10px]! w-[10px]! opacity-0 group-hover:opacity-100"
        />
        <BaseHandle
          type="target"
          position={Position.Left}
          id={"left"}
          className="h-[10px]! w-[10px]! opacity-0 group-hover:opacity-100"
        />
        <BaseHandle
          type="target"
          position={Position.Bottom}
          id={"bottom"}
          className="h-[10px]! w-[10px]! opacity-0 group-hover:opacity-100"
        />
        <div className="flex flex-row items-center justify-between text-[8pt]">
          <div
            className={`${props.data.cost_info.prefix_cost === 0 ? "hidden" : ""}`}
          >
            <small>{formatCost(props.data.cost_info.prefix_cost)}</small>
          </div>
        </div>
        <div className="bg-secondary text-muted-foreground mx-2 my-2 h-[50px] w-[50px] rotate-45 overflow-hidden rounded-md border-b p-2 text-center text-[9pt]">
          <div className="-rotate-45">
            <small>{props.data.label}</small>
          </div>
        </div>
      </div>
    </TooltipExplainHandle>
  );
}
