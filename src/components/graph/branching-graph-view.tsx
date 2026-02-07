"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useGraphNodes } from "@/lib/hooks/useGraphNodes";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { EventNode } from "./event-node";
import { CustomEdge } from "./custom-edge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes = { event: EventNode } as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes = { custom: CustomEdge } as any;

export function BranchingGraphView() {
  const timeline = useTimelineStore((s) => s.currentTimeline);
  const { nodes: graphNodes, edges: graphEdges } = useGraphNodes();
  const [nodes, setNodes, onNodesChange] = useNodesState(graphNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphEdges);

  useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [graphNodes, graphEdges, setNodes, setEdges]);

  const onInit = useCallback(() => {
    // Fit view on init
  }, []);

  if (!timeline) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-400 dark:text-zinc-500">No timeline generated yet</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
          Go to the home page and enter a premise
        </p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-400 dark:text-zinc-500">Waiting for events...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] rounded-xl border border-zinc-200 dark:border-white/[0.06] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(0,0,0,0.05)" />
        <MiniMap
          nodeColor="rgba(245, 158, 11, 0.3)"
          maskColor="rgba(0,0,0,0.1)"
          pannable
          zoomable
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
