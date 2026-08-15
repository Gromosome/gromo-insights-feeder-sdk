<p align="center"><img src="https://www.cdn.gromosome.com/main/img/logos/gromo-core/gromo-insights.png" alt="Gromo Insights" width="160" /></p>

# @gromosome/insights-core

```ts
import { createInsights } from "@gromosome/insights-core";

const insights = createInsights({ endpoint: "https://insights.example.com/v1/feeds", siteId: "store", consent: "granted" });
insights.startAutoTracking();
insights.observe(document.querySelector("#pricing")!, "pricing-card");

const video = document.querySelector("video")!;
insights.trackMedia(video, "hero-video", { contentGroup: "marketing", campaignId: "summer-2026" });

insights.trackDOMEvents(document.querySelector("#download")!, {
  componentId: "download",
  customKeys: { funnel: "lead-generation", placement: "header" },
  events: ["click", "focus", "blur"]
});
```

Every feed contains an explicit `eventType`. Developers can attach any JSON object through `customKeys`; the server keeps the full object and can promote configured keys into typed report columns.

Declarative HTML works for any native event:

```html
<video
  data-gromo-id="course-introduction"
  data-gromo-event-type="play,pause,ended"
  data-gromo-custom-keys='{"contentGroup":"learning","courseId":"go-101"}'
></video>
```
