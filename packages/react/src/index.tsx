import { createContext, useContext, useEffect, useRef, type PropsWithChildren } from "react";
import { createInsights, type InsightsClient, type InsightsConfig, type ObserveOptions } from "@gromosome/insights-core";

const Context = createContext<InsightsClient | null>(null);
export function InsightsProvider({ config, children }: PropsWithChildren<{ config: InsightsConfig }>) { const ref = useRef<InsightsClient | null>(null); if (!ref.current && typeof window !== "undefined") ref.current = createInsights(config); useEffect(() => { ref.current?.startAutoTracking(); return () => ref.current?.destroy(); }, []); return <Context.Provider value={ref.current}>{children}</Context.Provider>; }
export function useInsights(): InsightsClient { const client = useContext(Context); if (!client) throw new Error("useInsights must be used inside InsightsProvider"); return client; }
export function Tracked({ id, options, children }: PropsWithChildren<{ id: string; options?: ObserveOptions }>) { const client = useInsights(); const ref = useRef<HTMLDivElement>(null); useEffect(() => ref.current ? client.observe(ref.current, id, options) : undefined, [client, id]); return <div ref={ref} data-gromo-id={id}>{children}</div>; }
