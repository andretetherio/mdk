# `DetailLegend`

An enhanced chart legend that displays color swatches, current values, units, and percentage-change indicators. Each item is a clickable button for toggling dataset visibility.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `items` | Required | `DetailLegendItem[]` | - | Legend items to display |
| `className` | Optional | `string` | - | Custom class name |
| `onToggle` | Optional | `((label: string, index: number) => void)` | - | Callback when a legend item is toggled |

### `DetailLegendItem`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `color` | Required | `string` | - | Hex color for the default swatch (border, plus 20% opacity fill) and the `color` of a custom `icon` |
| `label` | Required | `string` | - | Display label; also passed to `onToggle` |
| `currentValue` | Optional | `{ value: string \| number; unit?: string }` | - | Value shown below the label, numbers formatted, with optional `unit`; also the row that holds `percentChange` |
| `hidden` | Optional | `boolean` | - | Dims the item (30% opacity) to show its dataset is hidden |
| `icon` | Optional | `React.ReactNode` | - | Custom icon replacing the default color swatch |
| `percentChange` | Optional | `number \| null` | - | Percentage change shown after `currentValue`: positive as a green ▲, negative as a red ▼; hidden when `0`, `null` or without `currentValue` |
<!-- END GENERATED: props -->

## Example

```tsx
import { DetailLegend } from "@tetherto/mdk-react-devkit"

const [hiddenSets, setHiddenSets] = useState<Record<number, boolean>>({})

<DetailLegend
  items={[
    {
      label: "Hashrate",
      color: "#59E8E8",
      currentValue: { value: 3590, unit: "TH/s" },
      percentChange: 2.5,
      hidden: hiddenSets[0],
    },
    {
      label: "Power",
      color: "#FF9500",
      currentValue: { value: 1200, unit: "W" },
      percentChange: -0.8,
      hidden: hiddenSets[1],
    },
  ]}
  onToggle={(label, index) =>
    setHiddenSets((prev) => ({ ...prev, [index]: !prev[index] }))
  }
/>
```

## Notes

- Returns `null` when `items` is empty or undefined
- `percentChange` of `0` is treated as "no change" and the indicator is not rendered
