# Bitmain container settings sub-panels

Three focused settings panels composing the Bitmain container settings view:

| Component | Description |
|---|---|
| `BitMainBasicSettings` | Top-level composite: cooling system + power + GPS positioning |
| `BitMainCoolingSystem` | Pumps, fans, and dry-cooler running state |
| `BitMainPowerAndPositioning` | Distribution-box power consumption and rack-slot GPS coordinates |

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `data` | Optional | `Device` | - | Container data |
<!-- END GENERATED: props -->

## Props detail

These props apply to all three components.


> **Props and the object shapes they reference are generated from this component's TypeScript types, the source of truth.** The following is supplementary (sub-component props, allowed values, `ref` methods, or passthrough props), not the full prop list.

| Prop | Status | Type / Options | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | Optional | `Device` | — | Live device object |

## Minimal example

```tsx
import { BitMainBasicSettings } from "@tetherto/mdk-react-devkit";

<BitMainBasicSettings data={device} />
```
