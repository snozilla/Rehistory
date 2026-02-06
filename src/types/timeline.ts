export type EventCategory =
  | "Politics"
  | "Technology"
  | "Culture"
  | "Economy"
  | "Military"
  | "Science"
  | "Society";

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  category: EventCategory;
  significance: 1 | 2 | 3 | 4 | 5;
  causedBy: string[];
  realWorldCounterpart?: string | null;
}

export interface EventConnection {
  sourceId: string;
  targetId: string;
  relationship: string;
}

export interface GeneratedTimeline {
  id: string;
  premise: string;
  divergenceYear: number;
  divergenceDescription: string;
  events: TimelineEvent[];
  connections: EventConnection[];
  realHistoryEvents: TimelineEvent[];
  createdAt: number;
}

export interface SavedTimeline {
  id: string;
  premise: string;
  timeline: GeneratedTimeline;
  savedAt: number;
}
