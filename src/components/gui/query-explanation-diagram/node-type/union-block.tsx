import { Position } from "@xyflow/react";
import { BaseHandle } from "@/components/base-handle";
import type { ExplainNodeProps } from "../build-query-explanation-flow";

export function UnionBlock(props: ExplainNodeProps) {
  return (
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
      <div className="flex w-[150px] max-w-[200px] flex-row items-center justify-center border-gray-900 bg-gray-300 p-2 text-[8pt] text-gray-900">
        <small>{props.data.label}</small>
      </div>
    </div>
  );
}
