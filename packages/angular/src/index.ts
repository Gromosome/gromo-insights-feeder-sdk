import { Directive, ElementRef, Inject, Injectable, InjectionToken, Input, OnDestroy, OnInit, makeEnvironmentProviders } from "@angular/core";
import { createInsights, type InsightsClient, type InsightsConfig } from "@gromosome/insights-core";
export const GROMO_INSIGHTS_CONFIG = new InjectionToken<InsightsConfig>("GROMO_INSIGHTS_CONFIG");
@Injectable({ providedIn: "root" })
export class GromoInsightsService {
    readonly client: InsightsClient;
    constructor(@Inject(GROMO_INSIGHTS_CONFIG) config: InsightsConfig) {
        this.client = createInsights(config); this.client.startAutoTracking();
    }
}
export function provideGromoInsights(config: InsightsConfig) {
    return makeEnvironmentProviders([{ provide: GROMO_INSIGHTS_CONFIG,
        useValue: config
    }, GromoInsightsService]
    );
}
@Directive({ selector: "[gromoTrack]", standalone: true })
export class GromoTrackDirective implements OnInit, OnDestroy {
    @Input({ required: true }) gromoTrack!: string;
    @Input() gromoCustomKeys?: Record<string, unknown>;
    private dispose?: () => void;
    constructor(private host: ElementRef<HTMLElement>, private insights: GromoInsightsService) {} ngOnInit() {
        this.host.nativeElement.dataset.gromoId = this.gromoTrack;
        this.dispose = this.insights.client.observe(this.host.nativeElement, this.gromoTrack, { customKeys: this.gromoCustomKeys });
    } ngOnDestroy() {
        this.dispose?.();
    }
}
