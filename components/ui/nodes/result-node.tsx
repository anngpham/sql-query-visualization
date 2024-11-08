import React from "react";

type ResultNodeProps = {
  data: {
    label: string;
  };
};

const ResultNode: React.FC<ResultNodeProps> = ({ data }) => {
  return (
    <div className="bg-green-200 w-full h-full border border-gray-200 rounded shadow-lg">
      <div className="font-bold text-center mb-2">{data.label}</div>
    </div>
  );
};

export default ResultNode;
