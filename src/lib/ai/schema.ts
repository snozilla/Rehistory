import { z } from "zod";

export const timelineEventSchema = z.object({
  id: z.string().describe("Unique identifier for the event"),
  year: z.number().describe("Year the event occurs"),
  title: z.string().describe("Short title for the event"),
  description: z
    .string()
    .describe("Detailed description of the event and its consequences"),
  category: z.enum([
    "Politics",
    "Technology",
    "Culture",
    "Economy",
    "Military",
    "Science",
    "Society",
  ]),
  significance: z
    .number()
    .describe("How impactful this event is, integer from 1 to 5"),
  causedBy: z
    .array(z.string())
    .describe("IDs of events that directly caused this event"),
  realWorldCounterpart: z
    .string()
    .nullable()
    .describe(
      "What happened in real history instead, or null if no direct counterpart"
    ),
});

export const eventConnectionSchema = z.object({
  sourceId: z.string().describe("ID of the cause event"),
  targetId: z.string().describe("ID of the effect event"),
  relationship: z
    .string()
    .describe("Brief label describing the causal relationship"),
});

export const generatedTimelineSchema = z.object({
  divergenceYear: z.number().describe("Year when history diverges"),
  divergenceDescription: z
    .string()
    .describe("Description of the point of divergence from real history"),
  events: z
    .array(timelineEventSchema)
    .describe(
      "15-25 alternative history events from the divergence point to present day"
    ),
  connections: z
    .array(eventConnectionSchema)
    .describe("Causal connections between events"),
  realHistoryEvents: z
    .array(timelineEventSchema)
    .describe(
      "10-15 corresponding real history events for comparison, covering the same time period"
    ),
});

export type GeneratedTimelineOutput = z.infer<typeof generatedTimelineSchema>;
