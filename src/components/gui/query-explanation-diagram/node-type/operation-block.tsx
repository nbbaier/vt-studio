import { Position } from "@xyflow/react";
import { BaseHandle } from "@/components/base-handle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExplainNodeProps } from "../build-query-explanation-flow";

export function OperationBlock(props: ExplainNodeProps) {
  const borderColor = props.data.using_filesort
    ? "border-rose-500"
    : "border-yellow-500";
  const label = props.type === "ORDERING_OPERATION" ? "ORDER" : "GROUP";
  const subLabel =
    props.type === "ORDERING_OPERATION" ? "filesort" : "tmp table";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
            id={props.id}
            className="h-[10px]! w-[10px]! opacity-0 group-hover:opacity-100"
          />
          <div className="flex flex-row items-center justify-between text-[8pt]">
            <small>{subLabel}</small>
          </div>
          <div className="flex flex-row items-center">
            <div
              className={`w-[100px] max-w-[200px] bg-gray-300 p-2 text-center text-gray-900 ${borderColor} rounded-md border-2 py-4 text-[9pt]`}
            >
              <div>
                <small>{label}</small>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div>
          {props.data.using_temporary_table && (
            <p className="text-[9pt]!">Using Temporary Table: True</p>
          )}
          <p className="text-[9pt]!">
            Using Filesort: {props.data.using_filesort ? "True" : "False"}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
