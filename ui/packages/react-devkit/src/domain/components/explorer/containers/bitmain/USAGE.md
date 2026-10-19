# Bitmain hydro container components

Components for the Bitmain hydro-cooled container explorer view.

| Component | Description |
|---|---|
| `BitMainHydroSettings` | Full settings form: basic settings, threshold configuration for water temperature and pressure |
| `BitMainBasicSettings` | Cooling system status, power distribution, and GPS positioning |
| `BitMainCoolingSystem` | Pumps, fans, and dry-cooler status panel |
| `BitMainPowerAndPositioning` | Power circuits, phase readings, and rack-slot GPS coordinates |
| `StatusItem` | Compact labelled status pill for boolean or enum readings |

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `data` | Optional | `Device` | - | Device data |
<!-- END GENERATED: props -->

## Props detail

> **Props and the object shapes they reference are generated from this component's TypeScript types, the source of truth.** The following is supplementary (sub-component props, allowed values, `ref` methods, or passthrough props), not the full prop list.

**BitMainHydroSettings / BitMainBasicSettings / BitMainCoolingSystem / BitMainPowerAndPositioning**

**StatusItem**

| Prop | Status | Type / Options | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | Optional | `string` | — | Display label for the status |
| `status` | Optional | `StatusType` | — | Status value that drives the color indicator |

## Minimal example

```tsx
import { BitMainHydroSettings, StatusItem } from "@tetherto/mdk-react-devkit";

<BitMainHydroSettings data={device} />
<StatusItem label="Circulation Pump" status="normal" />
```
