import { Edge as FlowEdge, Node as FlowNode, MarkerType } from "@xyflow/react";
import { ElkExtendedEdge, ElkNode, LayoutOptions } from "elkjs/lib/elk-api";
import ELK from "elkjs/lib/elk.bundled.js";

const GRAPH_ROOT_ID = "SAM_GRAPH";
const DEFAULT_ELK_OPTIONS: LayoutOptions = {
  "elk.algorithm": "layered",
  "elk.padding": "[left=0, top=40, right=0, bottom=0]",
  "elk.hierarchyHandling": "INCLUDE_CHILDREN",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.separateConnectedComponents": "false",
};

const DEFAULT_NODE_NAME = "Untitled Node";
const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 30;

export class Node {
  id!: string;
  data!: { label: string };
  detail?: string;
  children?: Node[] | undefined;
  type!: string;
}

export class Edge {
  id!: string;
  source!: string;
  target!: string;
}

/**
 * Convert nodes to a map for quick lookup
 * @param nodes list of node entities
 * @returns a map of node id to node
 */
export function nodeDataToMap(nodes: Node[] = []): Record<string, Node> {
  const nodeDataTable: Record<string, Node> = {};
  const addNodeToTable = (node: Node) => {
    nodeDataTable[node.id] = node;
    node.children?.forEach(addNodeToTable);
  };
  nodes.forEach(addNodeToTable);
  return nodeDataTable;
}

/**
 * Convert a node entity to ELK node
 * @param node node entity
 * @returns ELK node
 */
export function toElkNode(node: Node): ElkNode {
  return {
    id: node.id,
    children: node.children?.map(toElkNode) ?? [],
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT,
    labels: [{ text: node.data.label }],
  };
}

/**
 * Build a graph from nodes and edges, return the root node
 * @param node node entity
 * @returns the graph root node
 */
export function buildGraph(nodes: Node[] = [], edges: Edge[] = []): ElkNode {
  return {
    id: GRAPH_ROOT_ID,
    children: nodes.map(toElkNode),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };
}

/**
 * Layout the graph using ELK
 * @param graph the graph root node
 * @param options layout options. Check https://eclipse.dev/elk/reference/options.html
 * @returns the layouted graph
 */
export async function layoutGraph(
  graph: ElkNode,
  options: LayoutOptions = {}
): Promise<ElkNode> {
  const elk = new ELK({
    defaultLayoutOptions: DEFAULT_ELK_OPTIONS,
  });
  const layoutedGraph = await elk.layout({
    ...graph,
    layoutOptions: { ...DEFAULT_ELK_OPTIONS, ...options },
  });
  return layoutedGraph;
}

/**
 * Convert ELK node to React Flow node
 * @param node ELK node
 * @returns React Flow node
 */
export const toFlowNode = (elkNode: ElkNode): FlowNode => {
  return {
    id: elkNode.id,
    data: { label: elkNode.labels?.[0].text ?? DEFAULT_NODE_NAME },
    position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
    style: {
      width: elkNode.width ?? DEFAULT_NODE_WIDTH,
      height: elkNode.height ?? DEFAULT_NODE_HEIGHT,
    },
  };
};

/**
 * Convert ELK edge to React Flow edge
 * @param elkEdge ELK edge
 * @returns React Flow edge
 */
export const toFlowEdge = (elkEdge: ElkExtendedEdge): FlowEdge => {
  return {
    id: elkEdge.id,
    source: elkEdge.sources[0],
    target: elkEdge.targets[0],
    // type: "smoothstep",
    style: { stroke: "#FF0072", strokeWidth: 1 },
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#FF0072",
    },
    zIndex: 1001,
  };
};

/**
 * Convert graph to flow nodes and edges
 * @param graph the graph root node
 * @returns React Flow nodes and edges
 */
export function graphToFlow(graph: ElkNode): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const nodes: FlowNode[] = [];
  const addNode = (node: ElkNode, parentId?: string) => {
    nodes.push({
      ...toFlowNode(node),
      parentId,
      extent: parentId ? "parent" : undefined,
    });
    node.children?.forEach((child) => addNode(child, node.id));
  };
  graph.children?.forEach((child) => addNode(child));
  return { nodes, edges: graph.edges?.map(toFlowEdge) ?? [] };
}
