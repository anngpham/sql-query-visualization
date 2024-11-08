import React from "react";

type ResultNodeProps = {
  data: {
    label: string;
  };
};

const ResultNode: React.FC<ResultNodeProps> = ({ data }) => {
  return (
    <div className="bg-indigo-100 w-full h-full border border-indigo-200 rounded shadow-lg">
      <div className="font-bold text-center mb-2 text-indigo-800">
        {data.label}
      </div>
    </div>
  );
};

export default ResultNode;
