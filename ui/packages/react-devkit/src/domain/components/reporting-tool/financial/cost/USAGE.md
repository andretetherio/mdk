# Cost

Composite financial reporting page for a single mining site. Renders a page header,
a period selector slot, and a 2×2 grid of charts and metric tiles driven by the
cost-summary view model.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

### `AvgAllInCostChart` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `dateRange` | Required | `FinancialDateRange \| null` | - | - |
| `data` | Optional | `readonly AvgAllInCostDataPoint[]` | - | - |
| `isLoading` | Optional | `boolean` | - | - |

### `Cost` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `btcPriceLog` | Required | `readonly BtcPriceTimeSeriesEntry[]` | - | BTC price time series aligned to `costLog` buckets |
| `controls` | Required | `React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | - | Period selector element. Pass `<TimeframeControls>` for the OSS-style year/month picker |
| `costLog` | Required | `readonly CostTimeSeriesEntry[]` | - | Monthly/weekly production-cost time series for the Production Cost / Price chart |
| `dateRange` | Required | `FinancialDateRange \| null` | - | Active date range; drives x-axis labels across all charts |
| `metrics` | Required | `CostSummaryDisplayMetrics \| null` | - | Headline $/MWh tiles (all-in, energy, operations). Pass `null` while loading |
| `totals` | Required | `CostSummaryMonetaryTotals \| null` | - | Period totals (energy + operations USD) for the Operations vs Energy doughnut |
| `avgAllInCostData` | Optional | `readonly AvgAllInCostDataPoint[]` | - | Optional revenue/cost time-series for the Avg All-in Cost panel |
| `error` | Optional | `unknown` | - | When truthy, renders an error message in place of the chart grid |
| `isLoading` | Optional | `boolean` | `false` | Shows a loading spinner overlay over the chart grid |
| `setCostAction` | Optional | `React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | - | Optional "Set Monthly Cost" header action slot. A `ReactElement` slot (rather than an href string) so consumers can hand in router-aware components like `<Link>` or `<Button onClick={...} />` without triggering a full page reload |

### `CostCharts` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `btcPriceLog` | Required | `readonly BtcPriceTimeSeriesEntry[]` | - | - |
| `costLog` | Required | `readonly CostTimeSeriesEntry[]` | - | - |
| `dateRange` | Required | `FinancialDateRange \| null` | - | - |
| `totals` | Required | `CostSummaryMonetaryTotals \| null` | - | - |
| `avgAllInCostData` | Optional | `readonly AvgAllInCostDataPoint[]` | - | - |
| `isLoading` | Optional | `boolean` | - | - |

### `CostContent` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `btcPriceLog` | Required | `readonly BtcPriceTimeSeriesEntry[]` | - | BTC price time series aligned to `costLog` buckets |
| `costLog` | Required | `readonly CostTimeSeriesEntry[]` | - | Monthly/weekly production-cost time series for the Production Cost / Price chart |
| `dateRange` | Required | `FinancialDateRange \| null` | - | Active date range; drives x-axis labels across all charts |
| `metrics` | Required | `CostSummaryDisplayMetrics \| null` | - | Headline $/MWh tiles (all-in, energy, operations). Pass `null` while loading |
| `totals` | Required | `CostSummaryMonetaryTotals \| null` | - | Period totals (energy + operations USD) for the Operations vs Energy doughnut |
| `avgAllInCostData` | Optional | `readonly AvgAllInCostDataPoint[]` | - | Optional revenue/cost time-series for the Avg All-in Cost panel |
| `error` | Optional | `unknown` | - | When truthy, renders an error message in place of the chart grid |
| `isLoading` | Optional | `boolean` | `false` | Shows a loading spinner overlay over the chart grid |

### `CostMetrics` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `metrics` | Required | `CostSummaryDisplayMetrics` | - | - |

### `OperationsEnergyChart` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `totals` | Required | `CostSummaryMonetaryTotals \| null` | - | - |
| `isLoading` | Optional | `boolean` | - | - |

### `ProductionCostChart` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `btcPriceLog` | Required | `readonly BtcPriceTimeSeriesEntry[]` | - | - |
| `costLog` | Required | `readonly CostTimeSeriesEntry[]` | - | - |
| `dateRange` | Required | `FinancialDateRange \| null` | - | - |
| `isLoading` | Optional | `boolean` | - | - |

### `AvgAllInCostDataPoint`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `costUSDPerMWh` | Required | `number` | - | All-in cost per MWh consumed in the period, in USD/MWh; drawn as the Cost bar |
| `revenueUSDPerMWh` | Required | `number` | - | Revenue per MWh consumed in the period, in USD/MWh; drawn as the Revenue bar |
| `ts` | Required | `number` | - | Period timestamp (ms epoch); formatted as the bucket's x-axis label for the selected period |

### `CostSummaryDisplayMetrics`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `allInCost` | Required | `CostSummaryMetric` | - | All-in cost per MWh for the range (API `avgAllInCostPerMWh`); the highlighted first tile |
| `energyCost` | Required | `CostSummaryMetric` | - | Energy cost per MWh for the range (API `avgEnergyCostPerMWh`) |
| `operationsCost` | Required | `CostSummaryMetric` | - | Operational cost per MWh, derived as `totalOperationalCostsUSD / totalConsumptionMWh`; `value` is `null` when consumption is zero |

### `CostTimeSeriesEntry`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `energyCostUSD` | Required | `number` | - | Energy cost for the period, in USD |
| `operationalCostUSD` | Required | `number` | - | Operational (non-energy) cost for the period, in USD |
| `totalCostUSD` | Required | `number` | - | Total (energy + operational) cost for the period, in USD; drawn as the Production Cost bar |
| `ts` | Required | `number` | - | Period timestamp (ms epoch); formatted as the bucket's x-axis label for the selected period; joined with `btcPriceLog` entries on this value |

### `BtcPriceTimeSeriesEntry`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `priceUSD` | Required | `number` | - | BTC price for the period, in USD; drawn as the BTC Price bar (0 when the period has no entry) |
| `ts` | Required | `number` | - | Period timestamp (ms epoch); must match the `costLog` entry it pairs with |

### `CostSummaryMonetaryTotals`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `totalConsumptionMWh` | Required | `number` | - | Energy consumed over the range, in MWh |
| `totalCostsUSD` | Required | `number` | - | Energy plus operational cost summed over the range, in USD |
| `totalEnergyCostsUSD` | Required | `number` | - | Energy cost summed over the range, in USD; the Energy slice of the doughnut (omitted when 0) |
| `totalOperationalCostsUSD` | Required | `number` | - | Operational cost summed over the range, in USD; the Operations slice of the doughnut (omitted when 0) |
<!-- END GENERATED: props -->

## Minimal example

```tsx
import {
  buildCostSummaryViewModel,
  Cost,
  PERIOD,
  TimeframeControls,
} from "@tetherto/mdk-react-devkit/domain";

const viewModel = buildCostSummaryViewModel({ data: costSummaryApiResponse });

<Cost
  metrics={viewModel.metrics}
  costLog={viewModel.costLog}
  btcPriceLog={viewModel.btcPriceLog}
  totals={viewModel.totals}
  dateRange={{ start, end, period: PERIOD.MONTHLY }}
  controls={<TimeframeControls dateRange={{ start, end }} onRangeChange={handleChange} />}
/>
```

## Notes

- Use `buildCostSummaryViewModel` to transform the raw API response into the props this component expects
- `avgAllInCostData` comes from a separate endpoint (`useAvgAllInPowerCostData` in the OSS app) — omit it to hide the Avg All-in Cost panel
- For a custom page layout (different header, navigation), mount `CostContent` directly instead and supply your own Chrome
- Multi-site aggregation is out of scope for this component; mount one `Cost` per site and compose them yourself
