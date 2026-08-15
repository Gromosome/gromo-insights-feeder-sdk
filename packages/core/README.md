<p align="center"><img src="https://www.cdn.gromosome.com/main/img/logos/gromo-core/gromo-insights.png" alt="Gromo Insights" width="160" /></p>

# @gromosome/insights-core

```ts
import { createInsights } from "@gromosome/insights-core";

const insights = createInsights({ endpoint: "https://insights.example.com/v1/feeds", siteId: "store", consent: "granted" });
insights.startAutoTracking();
insights.observe(document.querySelector("#pricing")!, "pricing-card");

const video = document.querySelector("video")!;
insights.trackMedia(video, "hero-video", "marketing-content");

insights.trackDOMEvents(document.querySelector("#download")!, {
  componentId: "download",
  customKey: "lead-generation",
  events: ["click", "focus", "blur"]
});
```

Every feed contains an explicit `eventType` such as `video.play`, `audio.pause`, or `button.click`. Developers can set `customKey` to group events by their own business category.

Declarative HTML works for any native event:

```html
<video
  data-gromo-id="course-introduction"
  data-gromo-event-type="play,pause,ended"
  data-gromo-custom-key="learning-content"
></video>
```
