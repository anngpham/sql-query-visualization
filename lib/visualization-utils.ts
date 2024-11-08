import { Node, Edge } from "./elk";

export type IResponse = {
  result: {
    name: string;
    value: string[];
    detail?: string;
  }[];
  tables: {
    name: string;
    columns: string[];
  }[];
};

/**
 * Convert the response from the API to the data structure used by React Flow.
 * @param response - The response from the API.
 * @returns The data structure used by React Flow.
 */
export function convertResponseToVisualizationData(response: IResponse): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes for each table
  response.tables.forEach((table) => {
    nodes.push({
      id: table.name,
      data: { label: table.name },
      type: "table",
      children: table.columns.map((column) => ({
        id: `${table.name}.${column}`,
        type: "column",
        data: { label: column },
      })),
    });
  });

  // add table result as nodes
  nodes.push({
    id: "result",
    data: { label: "result" },
    type: "result",
    children: response.result.map((item) => ({
      id: `result.${item.name}`,
      data: { label: item.name },
      detail: item.detail,
      type: "column",
    })),
  });

  // Create nodes and edges for computed columns/relationships
  response.result.forEach((item) => {
    item.value.forEach((column) => {
      edges.push({
        id: `${column}-result.${item.name}`,
        source: column,
        target: `result.${item.name}`,
      });
    });
  });

  return { nodes, edges };
}
