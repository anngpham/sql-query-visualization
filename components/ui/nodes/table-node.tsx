import React from "react";

type TableNodeProps = {
  data: {
    label: string;
  };
};

const TableNode: React.FC<TableNodeProps> = ({ data }) => {
  return (
    <div className="bg-sky-100 w-full h-full border border-sky-200 rounded shadow-lg">
      <div className="font-bold text-center mb-2 text-sky-900">
        {data.label}
      </div>
    </div>
  );
};

export default TableNode;
