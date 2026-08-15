import { EventStore, persistentId } from "./storage.js";
import type { ConsentState, DOMTrackOptions, EventType, InsightEvent, InsightsConfig, ObserveOptions, TrackOptions } from "./types.js";

const defaults = { flushIntervalMs: 5000, batchSize: 20, storageKey: "gromo.insights.events", redactText: true };

export class InsightsClient {
  private readonly config: Required<Pick<InsightsConfig,"flushIntervalMs"|"batchSize"|"storageKey"|"redactText">> & InsightsConfig;
  private readonly store: EventStore;
  private readonly visitorId: string;
  private readonly sessionId: string;
  private consent: ConsentState;
  private timer?: number;
  private flushing = false;
  private disposers: Array<() => void> = [];

  constructor(config: InsightsConfig) {
    if (!config.endpoint || !config.siteId) throw new Error("endpoint and siteId are required");
    this.config = { ...defaults, ...config };
    this.store = new EventStore(this.config.storageKey);
    this.visitorId = persistentId("gromo.insights.visitor");
    this.sessionId = sessionStorage.getItem("gromo.insights.session") ?? crypto.randomUUID();
    try { sessionStorage.setItem("gromo.insights.session", this.sessionId); } catch { /* ignored */ }
    this.consent = config.consent ?? "unknown";
  }

  setConsent(state: ConsentState): void { this.consent = state; if (state === "denied") this.store.write([]); }
  track(eventType: EventType, options: TrackOptions = {}): InsightEvent | undefined {
    if (this.consent !== "granted") return;
    const event: InsightEvent = { id: crypto.randomUUID(), eventType, siteId: this.config.siteId, sessionId: this.sessionId, visitorId: this.visitorId, occurredAt: new Date().toISOString(), page: { url: location.href, path: location.pathname, title: document.title, referrer: document.referrer || undefined }, ...options };
    const queue = this.store.append(event);
    if (this.config.debug) console.debug("[Gromo Insights]", event);
    if (queue.length >= this.config.batchSize) void this.flush();
    return event;
  }
  pageView(properties?: Record<string, unknown>): void { this.track("page_view", { properties }); }
  custom(event: string, properties?: Record<string, unknown>): void { this.track("custom", { properties: { event, ...properties } }); }

  trackDOMEvents(element: Element, options: DOMTrackOptions): () => void {
    const listeners = options.events.map(domEventType => {
      const listener = (nativeEvent: Event) => this.track(
        `${element.tagName.toLowerCase()}.${nativeEvent.type}`,
        { componentId: options.componentId, customKey: options.customKey, properties: { domEventType: nativeEvent.type } }
      );
      element.addEventListener(domEventType, listener);
      return { domEventType, listener };
    });
    const dispose = () => listeners.forEach(({ domEventType, listener }) => element.removeEventListener(domEventType, listener));
    this.disposers.push(dispose);
    return dispose;
  }

  trackMedia(element: HTMLVideoElement | HTMLAudioElement, componentId: string, customKey?: string): () => void {
    const mediaType = element instanceof HTMLVideoElement ? "video" : "audio";
    const milestones = new Set<number>();
    const disposeEvents = this.trackDOMEvents(element, { componentId, customKey, events: ["play", "pause", "ended", "seeking", "volumechange"] });
    const progress = () => {
      if (!Number.isFinite(element.duration) || element.duration <= 0) return;
      const percentage = Math.floor((element.currentTime / element.duration) * 100);
      for (const milestone of [25, 50, 75, 100]) {
        if (percentage >= milestone && !milestones.has(milestone)) {
          milestones.add(milestone);
          this.track(`${mediaType}.progress`, { componentId, customKey, durationMs: Math.round(element.currentTime * 1000), properties: { milestone, durationSeconds: element.duration } });
        }
      }
    };
    element.addEventListener("timeupdate", progress);
    const dispose = () => { element.removeEventListener("timeupdate", progress); disposeEvents(); };
    this.disposers.push(dispose);
    return dispose;
  }

  observe(element: Element, componentId: string, options: ObserveOptions = {}): () => void {
    const started = new Map<Element, number>();
    const threshold = options.threshold ?? 0.5;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) { if (!started.has(entry.target)) { started.set(entry.target, performance.now()); this.track("impression", { componentId }); } }
      else { const start = started.get(entry.target); if (start !== undefined) { this.track("dwell", { componentId, durationMs: Math.round(performance.now() - start) }); started.delete(entry.target); } }
    }), { threshold: [threshold] });
    observer.observe(element);
    const onClick = () => this.track("click", { componentId });
    const onPointer = (e: Event) => { const p = e as PointerEvent; this.track("pointer", { componentId, position: { x: p.clientX, y: p.clientY } }); };
    if (options.trackClicks !== false) element.addEventListener("click", onClick);
    if (options.trackPointer) element.addEventListener("pointerdown", onPointer);
    const dispose = () => { observer.disconnect(); element.removeEventListener("click", onClick); element.removeEventListener("pointerdown", onPointer); const start = started.get(element); if (options.trackDwell !== false && start !== undefined) this.track("dwell", { componentId, durationMs: Math.round(performance.now() - start) }); };
    this.disposers.push(dispose); return dispose;
  }

  startAutoTracking(): void {
    this.pageView();
    const click = (e: MouseEvent) => { const el = (e.target as Element | null)?.closest<HTMLElement>("[data-gromo-id]"); if (el) this.track("click", { componentId: el.dataset.gromoId }); };
    const visibility = () => this.track("visibility", { properties: { state: document.visibilityState } });
    document.addEventListener("click", click); document.addEventListener("visibilitychange", visibility);
    this.disposers.push(() => { document.removeEventListener("click", click); document.removeEventListener("visibilitychange", visibility); });
    this.timer = window.setInterval(() => void this.flush(), this.config.flushIntervalMs);
    window.addEventListener("pagehide", this.flushOnExit);
  }

  private flushOnExit = (): void => { const events = this.store.read(); if (!events.length) return; const body = JSON.stringify({ events }); const sent = navigator.sendBeacon?.(this.config.endpoint, new Blob([body], { type: "application/json" })); if (sent) this.store.write([]); };
  async flush(): Promise<void> {
    if (this.flushing || this.consent !== "granted") return;
    const events = this.store.read().slice(0, this.config.batchSize); if (!events.length) return;
    this.flushing = true;
    try { const response = await fetch(this.config.endpoint, { method: "POST", headers: { "content-type": "application/json", ...(this.config.apiKey ? { authorization: `Bearer ${this.config.apiKey}` } : {}) }, body: JSON.stringify({ events }), keepalive: true }); if (!response.ok) throw new Error(`collector returned ${response.status}`); const sent = new Set(events.map(e => e.id)); this.store.write(this.store.read().filter(e => !sent.has(e.id))); }
    finally { this.flushing = false; }
  }
  destroy(): void { if (this.timer) clearInterval(this.timer); window.removeEventListener("pagehide", this.flushOnExit); this.disposers.splice(0).forEach(dispose => dispose()); void this.flush(); }
}

export const createInsights = (config: InsightsConfig): InsightsClient => new InsightsClient(config);
