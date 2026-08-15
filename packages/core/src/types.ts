export type ConsentState = "granted" | "denied" | "unknown";
export type EventName = "page_view" | "click" | "pointer" | "impression" | "dwell" | "visibility" | "custom";

export interface InsightsConfig {
  endpoint: string;
  siteId: string;
  apiKey?: string;
  flushIntervalMs?: number;
  batchSize?: number;
  consent?: ConsentState;
  debug?: boolean;
  storageKey?: string;
  redactText?: boolean;
}

export interface InsightEvent {
  id: string;
  name: EventName;
  siteId: string;
  sessionId: string;
  visitorId: string;
  occurredAt: string;
  page: { url: string; path: string; title: string; referrer?: string };
  componentId?: string;
  durationMs?: number;
  position?: { x: number; y: number };
  properties?: Record<string, unknown>;
}

export interface TrackOptions { componentId?: string; durationMs?: number; position?: { x: number; y: number }; properties?: Record<string, unknown> }
export interface ObserveOptions { threshold?: number; trackClicks?: boolean; trackPointer?: boolean; trackDwell?: boolean }
