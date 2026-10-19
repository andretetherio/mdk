# EnergyReport

Operational **Energy** report with three tabs: site consumption trend, power modes by miner type, and bar charts by miner type / mining unit.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `className` | Optional | `string` | - | - |
| `defaultTab` | Optional | `"site-view" \| "miner-type-view" \| "miner-unit-view"` | - | - |
| `minerTypeView` | Optional | `EnergyReportGroupedBarViewProps` | - | - |
| `minerUnitView` | Optional | `EnergyReportGroupedBarViewProps` | - | - |
| `siteView` | Optional | `(Omit<EnergyReportSiteViewProps, "dateRange"> & { dateRange?: EnergyReportDateRange })` | - | - |

### `EnergyReportGroupedBarViewProps`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `containers` | Optional | `Container[]` | - | Containers used to turn container keys into display names (miner-unit view only) |
| `groupedConsumption` | Optional | `MetricsConsumptionGroupedResponse` | - | Consumption grouped by miner model or container; bars come from the last `log` entry's `powerW`, shown in MW |
| `isLoading` | Optional | `boolean` | - | Shows the chart's loading state and suppresses the empty state |
| `onTimeFrameChange` | Optional | `((start: Date, end: Date) => void)` | - | Called with the selected start and end dates on mount and whenever the time-frame selector changes them |
<!-- END GENERATED: props -->

## Composite

```tsx
import { EnergyReport } from "@tetherto/mdk-react-devkit";

<EnergyReport
  siteView={{
    dateRange: { start, end },
    onDateRangeChange: setRange,
    consumptionLog,
    nominalPowerAvailabilityMw: 600,
    tailLog,
    containers,
    onRefetchSnapshot: refetch,
  }}
  minerTypeView={{
    groupedConsumption,
    containers,
    isLoading,
    onTimeFrameChange: (start, end) => fetchGrouped("miner", start, end),
  }}
  minerUnitView={{
    groupedConsumption: containerGrouped,
    containers,
    isLoading,
  }}
/>
```

## Hooks / utils

- `useEnergyReportSite` — derives site chart series, power-mode table rows, and container cards from v2 consumption + tail log.
- `transformToBarData` / `toEnergyReportBarChartInput` — latest-day grouped consumption bars (miner vs container `groupBy`).

## Demo

`apps/demo` route: `/operational-energy`
