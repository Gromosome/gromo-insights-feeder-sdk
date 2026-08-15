import type { InsightEvent } from "./types.js";

export class EventStore {
  constructor(private readonly key: string) {}
  read(): InsightEvent[] {
    try { return JSON.parse(localStorage.getItem(this.key) ?? "[]") as InsightEvent[]; } catch { return []; }
  }
  write(events: InsightEvent[]): void {
    try { localStorage.setItem(this.key, JSON.stringify(events)); } catch { /* memory-only environments */ }
  }
  append(event: InsightEvent): InsightEvent[] { const events = [...this.read(), event]; this.write(events); return events; }
}

export function persistentId(key: string): string {
  try { const found = localStorage.getItem(key); if (found) return found; const id = crypto.randomUUID(); localStorage.setItem(key, id); return id; }
  catch { return crypto.randomUUID(); }
}
