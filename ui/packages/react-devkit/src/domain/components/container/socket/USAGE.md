# Socket

Per-socket panel representing a single PDU slot in a container. Shows the miner slotted into that slot, its power/current draw, operating status, heatmap data (temperature or hashrate), and quick actions (add miner, edit flow).

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `clickDisabled` | Optional | `boolean` | `false` | Whether click is disabled |
| `cooling` | Optional | `boolean` | `undefined` | Cooling status |
| `current_a` | Optional | `number \| null` | `null` | Current in amperes |
| `enabled` | Optional | `boolean` | `false` | Whether socket is enabled |
| `heatmap` | Optional | `Heatmap \| null` | `null` | Heatmap configuration |
| `innerRef` | Optional | `React.ForwardedRef<HTMLDivElement>` | - | Forwarded ref for the container |
| `isContainerControlSupported` | Optional | `boolean` | `false` | Whether container control is supported |
| `isEditFlow` | Optional | `boolean` | `false` | Whether in edit flow mode |
| `isEmptyPowerDashed` | Optional | `boolean` | `false` | Whether to show dashed border for empty power |
| `miner` | Optional | `Miner \| null` | `null` | Miner data |
| `pdu` | Optional | `Pdu` | - | PDU information |
| `power_w` | Optional | `number \| null` | `null` | Power in watts |
| `selected` | Optional | `boolean` | `false` | Whether socket is selected |
| `socket` | Optional | `number \| null` | `null` | Socket number/index |

### `Heatmap`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `isHeatmapMode` | Optional | `boolean` | - | Show the heatmap value and color in place of the socket index |
| `mode` | Optional | `string` | - | Metric to plot: `pcb`, `chip` or `inlet` (read from `miner.temperature`) or `hashrate` (a `HEATMAP_MODE` value) |
| `ranges` | Optional | `Record<string, { min?: number; max?: number }>` | - | Color-scale bounds keyed by mode; `ranges[mode]` sets the min/max the value is colored against (missing bounds count as 0) |

### `Pdu`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `pdu` | Optional | `string \| number` | - | PDU identifier, written to the socket's `data-pdu-index` attribute; not displayed |
<!-- END GENERATED: props -->

## Minimal example

```tsx
import { Socket } from "@tetherto/mdk-react-devkit";

<Socket socket={1} enabled={true} power_w={3250} current_a={14.5} />
```
