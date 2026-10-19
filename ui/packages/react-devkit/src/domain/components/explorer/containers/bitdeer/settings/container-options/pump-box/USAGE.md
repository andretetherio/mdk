# `PumpBox`

Single-pump status card showing RPM, flow, and fault state for one immersion-cooling pump. Renders a coloured indicator (green = running, grey = off). Returns `null` if `pumpItem.enabled` is not a boolean.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `pumpTitle` | Required | `string` | - | Label prefix for the pump (e.g. `"Circulation"`) |
| `pumpItem` | Optional | `PumpItem` | - | Pump data. `index` is 0-based; displayed as `index + 1` |

### `PumpItem`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `index` | Required | `number` | - | 0-based pump index, shown as `index + 1` in the title |
| `enabled` | Optional | `boolean` | - | Running state: `true` shows a green Running indicator, `false` a gray Off one; when not a boolean the box renders nothing |
<!-- END GENERATED: props -->

## Minimal example

```tsx
import { PumpBox } from "@tetherto/mdk-react-devkit";

<PumpBox pumpTitle="Circulation" pumpItem={{ enabled: true, index: 0 }} />
```
