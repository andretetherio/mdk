# SupplyLiquidBox

Status card for the dielectric supply tank in a Bitmain Hydro container. Shows supply-liquid temperature, pressure, and flow readings with color/flash states driven by configurable thresholds.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `containerSettings` | Optional | `SupplyLiquidBoxContainerSettings \| null` | `null` | Optional threshold map that controls colour and flash states on readings |
| `data` | Optional | `Device` | - | Live device object. Returns `null` when omitted |

### `SupplyLiquidBoxContainerSettings`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `thresholds` | Optional | `Record<string, UnknownRecord>` | - | Container threshold config from the API; `waterTemperature` (`criticalLow`, `alarmLow`, `normal`, `alarmHigh`, `criticalHigh`) and `supplyLiquidPressure` (`criticalLow`, `alarmLow`, `alarmHigh`, `criticalHigh`) set the reading colors and flashing; a group missing any key falls back to built-in defaults |
<!-- END GENERATED: props -->

## Minimal example

```tsx
import { SupplyLiquidBox } from "@tetherto/mdk-react-devkit";

<SupplyLiquidBox data={device} />
```

## Notes

- Returns `null` when `data` is falsy
