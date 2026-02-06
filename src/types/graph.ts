import type { Node, Edge } from "@xyflow/react";
import type { TimelineEvent } from "./timeline";

export interface EventNodeData extends Record<string, unknown> {
  event: TimelineEvent;
  expanded: boolean;
  filtered: boolean;
}

export type EventNode = Node<EventNodeData, "event">;

export interface CustomEdgeData extends Record<string, unknown> {
  relationship: string;
}

export type CustomEdge = Edge<CustomEdgeData>;
