<p align="center"><img src="https://www.cdn.gromosome.com/main/img/logos/gromo-core/gromo-insights.png" alt="Gromo Insights" width="180" /></p>

# Gromo Insights Feeder SDK

Framework-neutral browser analytics with first-party adapters for React, Vue, and Angular.

## Packages

| Package | Purpose |
| --- | --- |
| `@gromosome/insights-core` | Event capture, batching, durable queue, consent, clicks, impressions, dwell, page views and custom events |
| `@gromosome/insights-react` | React provider, hook and tracked component |
| `@gromosome/insights-vue` | Vue plugin, composable and directive |
| `@gromosome/insights-angular` | Angular provider, service and directive |

## Development

```bash
npm install
npm run build
npm run typecheck
```

See each package README for integration examples. Tracking is disabled until consent is granted unless `consent: "granted"` is configured.
