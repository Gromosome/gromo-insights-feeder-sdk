import { inject, type App, type InjectionKey, type ObjectDirective } from "vue";
import { createInsights, type InsightsClient, type InsightsConfig, type ObserveOptions } from "@gromosome/insights-core";
const key: InjectionKey<InsightsClient> = Symbol("GromoInsights");
export const GromoInsightsPlugin = { install(app: App, config: InsightsConfig) { const client = createInsights(config); client.startAutoTracking(); app.provide(key, client); app.directive("gromo-track", trackDirective(client)); } };
export function useInsights(): InsightsClient { const client = inject(key); if (!client) throw new Error("GromoInsightsPlugin is not installed"); return client; }
type TrackBinding = string | { id: string; customKeys?: Record<string, unknown>; options?: ObserveOptions };
export const trackDirective = (client: InsightsClient): ObjectDirective<HTMLElement, TrackBinding> => ({ mounted(el, binding) { const value = typeof binding.value === "string" ? { id: binding.value } : binding.value; (el as HTMLElement & { __gromoDispose?: () => void }).__gromoDispose = client.observe(el, value.id, { ...value.options, customKeys: value.customKeys }); el.dataset.gromoId = value.id; }, unmounted(el) { (el as HTMLElement & { __gromoDispose?: () => void }).__gromoDispose?.(); } });
