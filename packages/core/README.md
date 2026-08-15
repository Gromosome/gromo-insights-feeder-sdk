<p align="center"><img src="https://www.cdn.gromosome.com/main/img/logos/gromo-core/gromo-insights.png" alt="Gromo Insights" width="160" /></p>

# @gromosome/insights-core

```ts
import { createInsights } from "@gromosome/insights-core";

const insights = createInsights({ endpoint: "https://insights.example.com/v1/feeds", siteId: "store", consent: "granted" });
insights.startAutoTracking();
insights.observe(document.querySelector("#pricing")!, "pricing-card");
```
