export type ConsentState = "granted" | "denied" | "unknown";
export type KnownEventType = "page_view" | "click" | "pointer" | "impression" | "dwell" | "visibility" | "custom" | "video.play" | "video.pause" | "video.ended" | "video.progress" | "audio.play" | "audio.pause" | "audio.ended" | "audio.progress";
export type EventType = KnownEventType | (string & {});

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
  eventType: EventType;
  siteId: string;
  sessionId: string;
  visitorId: string;
  occurredAt: string;
  page: { url: string; path: string; title: string; referrer?: string };
  componentId?: string;
  customKeys?: Record<string, unknown>;
  durationMs?: number;
  position?: { x: number; y: number };
  properties?: Record<string, unknown>;
}

export interface TrackOptions { componentId?: string; customKeys?: Record<string, unknown>; durationMs?: number; position?: { x: number; y: number }; properties?: Record<string, unknown> }
export interface ObserveOptions { customKeys?: Record<string, unknown>; threshold?: number; trackClicks?: boolean; trackPointer?: boolean; trackDwell?: boolean }
export interface DOMTrackOptions { componentId: string; customKeys?: Record<string, unknown>; events: string[] }
