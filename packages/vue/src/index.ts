import { inject, type App, type InjectionKey, type ObjectDirective } from "vue";
import { createInsights, type InsightsClient, type InsightsConfig } from "@gromosome/insights-core";
const key: InjectionKey<InsightsClient> = Symbol("GromoInsights");
export const GromoInsightsPlugin = { install(app: App, config: InsightsConfig) { const client = createInsights(config); client.startAutoTracking(); app.provide(key, client); app.directive("gromo-track", trackDirective(client)); } };
export function useInsights(): InsightsClient { const client = inject(key); if (!client) throw new Error("GromoInsightsPlugin is not installed"); return client; }
export const trackDirective = (client: InsightsClient): ObjectDirective<HTMLElement, string> => ({ mounted(el, binding) { (el as HTMLElement & { __gromoDispose?: () => void }).__gromoDispose = client.observe(el, binding.value); el.dataset.gromoId = binding.value; }, unmounted(el) { (el as HTMLElement & { __gromoDispose?: () => void }).__gromoDispose?.(); } });
