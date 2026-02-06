import dagre from "dagre";
import type { TimelineEvent, EventConnection } from "@/types/timeline";
import type { EventNode, CustomEdge } from "@/types/graph";

const NODE_WIDTH = 280;
const NODE_HEIGHT = 120;

export function createGraphLayout(
  events: TimelineEvent[],
  connections: EventConnection[],
  expandedNodes: Set<string>,
  filteredCategories: Set<string>
): { nodes: EventNode[]; edges: CustomEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 100 });

  events.forEach((event) => {
    const isExpanded = expandedNodes.has(event.id);
    g.setNode(event.id, {
      width: NODE_WIDTH,
      height: isExpanded ? NODE_HEIGHT + 80 : NODE_HEIGHT,
    });
  });

  connections.forEach((conn) => {
    if (g.hasNode(conn.sourceId) && g.hasNode(conn.targetId)) {
      g.setEdge(conn.sourceId, conn.targetId);
    }
  });

  dagre.layout(g);

  const nodes: EventNode[] = events.map((event) => {
    const nodeWithPosition = g.node(event.id);
    const isFiltered =
      filteredCategories.size > 0 && !filteredCategories.has(event.category);

    return {
      id: event.id,
      type: "event",
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      data: {
        event,
        expanded: expandedNodes.has(event.id),
        filtered: isFiltered,
      },
    };
  });

  const edges: CustomEdge[] = connections.map((conn) => ({
    id: `${conn.sourceId}-${conn.targetId}`,
    source: conn.sourceId,
    target: conn.targetId,
    type: "custom",
    animated: true,
    data: { relationship: conn.relationship },
  }));

  return { nodes, edges };
}
