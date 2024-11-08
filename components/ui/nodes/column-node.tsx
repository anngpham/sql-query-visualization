import React from "react";
import { Handle, Position } from "@xyflow/react";

type ColumnNodeProps = {
  data: {
    label: string;
    detail?: string;
  };
};

const ColumnNode: React.FC<ColumnNodeProps> = ({ data }) => {
  return (
    <div className="bg-yellow-300 w-full h-full group relative border border-gray-200 rounded shadow-lg">
      <Handle type="target" position={Position.Left} className="invisible" />
      <div className="text-start mb-2">{data.label}</div>
      {data.detail && (
        <div className="absolute left-full top-0 ml-2 z-10 hidden group-hover:block bg-white border border-gray-200 rounded shadow-lg text-sm">
          {data.detail}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="invisible" />
    </div>
  );
};

export default ColumnNode;
