# `PowerModeTimelineChart`

Timeline chart for power-mode state changes over time. Wraps `TimelineChart`
with mining-specific data shaping.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `data` | Optional | `PowerModeTimelineEntry[]` | `[]` | Initial power-mode entries (each with start/end ts + mode) |
| `dataUpdates` | Optional | `PowerModeTimelineEntry[]` | `[]` | Streaming updates appended to the initial data |
| `isLoading` | Optional | `boolean` | `false` | Show a loading skeleton instead of the chart |
| `timezone` | Optional | `string` | `"UTC"` | IANA timezone string for x-axis tick formatting |
| `title` | Optional | `string` | `CHART_TITLES.POWER_MODE_TIMELINE` | Chart title |

### `PowerModeTimelineEntry`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `power_mode_group_aggr` | Optional | `Record<string, string>` | - | Power mode keyed by miner; takes precedence over the miner's status for the bar's mode |
| `status_group_aggr` | Optional | `Record<string, string>` | - | Status keyed by miner; its keys decide which miners get a row, and an entry without it adds nothing |
| `ts` | Optional | `number` | - | Sample time (epoch ms); consecutive samples with the same mode merge into one bar |
<!-- END GENERATED: props -->

## Example

```tsx
<PowerModeTimelineChart data={powerModeLog} timezone="UTC" />
```

## Data contracts

`PowerModeTimelineEntry` lives in [`power-mode-timeline-chart.helper.ts`](./power-mode-timeline-chart.helper.ts).
