"use client";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge as FlowEdge,
  Node as FlowNode,
  MiniMap,
  NodeTypes,
  OnEdgesChange,
  OnNodesChange,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildGraph,
  Edge,
  graphToFlow,
  layoutGraph,
  Node,
  nodeDataToMap,
} from "@/lib/elk";
import TableNode from "./ui/nodes/table-node";
import ColumnNode from "./ui/nodes/column-node";
import ResultNode from "./ui/nodes/result-node";

export default function Visualization({
  data,
}: {
  data: { nodes: Node[]; edges: Edge[] };
}) {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);

  const getLayoutedFlow = async () => {
    // Build a map of node id to node (for quick lookup later)
    const nodeDataTable = nodeDataToMap(data.nodes);

    // Build a graph from nodes and edges, return the root node
    const graph = buildGraph(data.nodes, data.edges);

    // Layout the graph using ELK algorithm with direction option
    const layoutedGraph = await layoutGraph(graph, {
      "elk.direction": "RIGHT",
    });

    // convert graph to React Flow nodes and edges
    const result = graphToFlow(layoutedGraph);

    result.nodes.forEach((node) => {
      node.type = nodeDataTable[node.id].type;
      node.data = {
        ...node.data,
        detail: nodeDataTable[node.id].detail,
      };
      node.extent = node.parentId ? "parent" : undefined;
      node.targetPosition = Position.Left;
      node.sourcePosition = Position.Right;
    });

    setNodes(result.nodes);
    setEdges(result.edges);
  };

  useEffect(() => {
    getLayoutedFlow();
  }, [data]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      table: TableNode,
      column: ColumnNode,
      result: ResultNode,
    }),
    []
  );

  return (
    <div style={{ height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
