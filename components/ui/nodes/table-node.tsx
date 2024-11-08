import React from "react";

type TableNodeProps = {
  data: {
    label: string;
  };
};

const TableNode: React.FC<TableNodeProps> = ({ data }) => {
  return (
    <div className="bg-blue-300 w-full h-full border border-gray-200 rounded shadow-lg">
      <div className="font-bold text-center mb-2">{data.label}</div>
    </div>
  );
};

export default TableNode;
