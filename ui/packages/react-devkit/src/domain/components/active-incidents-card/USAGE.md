# ActiveIncidentsCard

Summary card displaying a list of active incidents/alerts with severity
indicators, loading skeleton, and empty state.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `className` | Optional | `string` | - | Additional class names appended to the root |
| `emptyMessage` | Optional | `string` | - | Message rendered when no items |
| `isLoading` | Optional | `boolean` | `false` | Show skeleton rows instead of items |
| `items` | Optional | `TIncidentRowProps[]` | `[]` | Incident rows to render |
| `label` | Optional | `string` | `"Active Alerts"` | Header label shown above the list |
| `onItemClick` | Optional | `(id: string) => void` | - | Called with the incident id when a row is clicked |
| `skeletonRows` | Optional | `number` | `4` | Number of skeleton rows shown when `isLoading` |

### `TIncidentRowProps`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `body` | Required | `string` | - | Third line of the row, under `subtitle` |
| `id` | Required | `string` | - | Incident identifier; the virtual-list row key and the argument passed to the click handler |
| `severity` | Required | `"high" \| "medium" \| "critical"` | - | `critical`, `high` or `medium`; sets the colored severity dot beside the row |
| `subtitle` | Required | `string` | - | Second line of the row, under `title` |
| `title` | Required | `string` | - | First line of the row |
| `onClick` | Optional | `((id: string) => void)` | - | Row click handler, called with `id`; in `ActiveIncidentsCard` it is always replaced by `onItemClick` |
<!-- END GENERATED: props -->

## Minimal example

```tsx
<ActiveIncidentsCard
  label="Active Alerts"
  items={alerts}
  onItemClick={(id) => router.push(`/alerts/${id}`)}
/>
```

## Data contracts

`TIncidentRowProps` is exported alongside the component. Each item needs at
least an `id`, `severity` (`critical | warning | info`), and `title`.

## Notes

- Designed for a side-panel placement, but works equally well as a section
  inside a dashboard page
- Rows are virtualized via `@tanstack/react-virtual` — the card stays
  responsive even with thousands of incidents in `items`
- Use `CurrentAlerts` / `HistoricalAlerts` instead when you need the full
  filterable, sortable data-table experience
