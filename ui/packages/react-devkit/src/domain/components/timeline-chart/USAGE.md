# `TimelineChart`

Discrete-event timeline chart (e.g. miner state over time) with a category
legend. Supports streaming updates via `newData`.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `initialData` | Required | `TimelineChartData` | - | Initial timeline data |
| `axisTitleText` | Optional | `AxisTitleText` | `{ x: "Time", y: "" }` | Axis title strings |
| `height` | Optional | `number` | - | Chart pixel height |
| `isLoading` | Optional | `boolean` | `false` | Show loader |
| `newData` | Optional | `TimelineChartData` | - | Streaming updates appended to the initial data |
| `range` | Optional | `ChartRange` | - | Visible time window |
| `skipUpdates` | Optional | `boolean` | `false` | Ignore `newData` |
| `title` | Optional | `string` | - | Chart title |

### `TimelineChartData`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `datasets` | Required | `TimelineChartDataset[]` | - | Bar series; each dataset's `label` is its tooltip title and legend entry |
| `labels` | Required | `string[]` | - | Row labels, one row each; a data point lands in the row whose label equals its `y`. Nothing renders when empty |

### `ChartRange`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `max` | Required | `number \| Date` | - | Right edge of the time axis (`Date` or epoch ms) |
| `min` | Required | `number \| Date` | - | Left edge of the time axis (`Date` or epoch ms); without a range the axis spans the data |

### `AxisTitleText`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `x` | Required | `string` | - | Title under the time axis; hidden when empty |
| `y` | Required | `string` | - | Title beside the row labels; hidden when empty |
<!-- END GENERATED: props -->

## Example

```tsx
<TimelineChart initialData={data} range={{ min, max }} title="State" />
```

## Data contracts

`TimelineChartData` lives in [`timeline-chart.types.ts`](./timeline-chart.types.ts). Each dataset has a
`label` plus a list of `{ x: [startMs, endMs], y, mode }` items where `mode`
maps to a category color in the legend.
