# BitMainImmersionUnitControlBox / BitMainImmersionCompactUnitControlBox

Individual unit control box for a pump or dry-cooler within a Bitmain immersion container. `BitMainImmersionUnitControlBox` displays running state, frequency, and alarm status. `BitMainImmersionCompactUnitControlBox` is a compact variant showing open/closed status with transition states, for units like valves.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `alarmStatus` | Optional | `boolean` | `false` | Alarm/fault status |
| `className` | Optional | `string` | - | Custom className |
| `frequency` | Optional | `number` | - | Frequency value in Hz |
| `isDryCooler` | Optional | `boolean` | `false` | Whether this is a dry cooler unit |
| `running` | Optional | `boolean` | `false` | Whether the unit is running |
| `secondary` | Optional | `boolean` | `false` | Secondary variant (no border) |
| `showFrequencyInLeftColumn` | Optional | `boolean` | `false` | Show frequency in left column instead of right |
| `title` | Optional | `string` | - | Box title |
<!-- END GENERATED: props -->

## BitMainImmersionCompactUnitControlBox Props detail

> **Props and the object shapes they reference are generated from this component's TypeScript types, the source of truth.** The following is supplementary (sub-component props, allowed values, `ref` methods, or passthrough props), not the full prop list.

| Prop | Status | Type / Options | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | Optional | `string` | — | Unit label (e.g. `"Valve Control"`) |
| `opening` | Optional | `boolean` | `false` | Show the "Opening" transition state |
| `closing` | Optional | `boolean` | `false` | Show the "Closing" transition state |
| `isOpen` | Optional | `boolean` | `false` | Whether the unit is currently open |
| `className` | Optional | `string` | — | Custom class name |

## Minimal example

```tsx
import {
  BitMainImmersionUnitControlBox,
  BitMainImmersionCompactUnitControlBox,
} from "@tetherto/mdk-react-devkit";

<BitMainImmersionUnitControlBox
  title="Pump 1"
  running={true}
  frequency={50}
  alarmStatus={false}
/>

<BitMainImmersionCompactUnitControlBox title="Valve Control" isOpen={true} />
```
