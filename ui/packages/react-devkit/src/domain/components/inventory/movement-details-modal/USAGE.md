# `MovementDetailsModal`

Modal that shows the details of a single historical device movement: a device summary
(code, model, site, container, serial number, MAC) and the origin → destination transition
of both location and status, with color-coded badges.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `isOpen` | Optional | `boolean` | `false` | Whether the modal is open |
| `movement` | Optional | `MovementData` | - | The selected movement; when omitted the modal renders nothing |
| `onClose` | Optional | `() => void` | - | Called when the modal requests to close (overlay click, escape, or close button) |

### `MovementData`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `destination` | Required | `string` | - | Location key after the move (a `MINER_LOCATIONS` value); drives the destination badge label and color |
| `newStatus` | Required | `string` | - | Status key after the move (a `MINER_STATUSES` value); shown via `MINER_STATUS_NAMES`, raw key if unmapped |
| `origin` | Required | `string` | - | Location key before the move (a `MINER_LOCATIONS` value such as `site.warehouse`); drives the origin badge label and color |
| `previousStatus` | Required | `string` | - | Status key before the move (a `MINER_STATUSES` value such as `faulty`); shown via `MINER_STATUS_NAMES`, raw key if unmapped |
| `comments` | Optional | `React.ReactNode` | - | Free-form notes rendered below the transition; hidden when empty |
| `device` | Optional | `object` | - | Moved device; when omitted the device summary panel is hidden |
<!-- END GENERATED: props -->

## When to use

Use this in an inventory "Historical Movements" view when a user selects a movement row and
you want to show the full before/after detail of where a device moved and how its status changed.

## Data shape

```ts
const movement: MovementData = {
  origin: 'site.warehouse',          // dot-separated location key
  destination: 'workshop.lab',
  previousStatus: 'ok_brand_new',    // miner status key
  newStatus: 'faulty',
  device: {                          // raw device record (miner / spare part)
    code: 'M-123',
    tags: ['code-M-123'],
    type: 'antminer',
    info: { site: 'Site A', container: 'C1', serialNum: 'SN-9', macAddress: 'AA:BB' },
  },
  comments: 'Moved for repair',      // optional ReactNode
}
```

## Example

```tsx
import { MovementDetailsModal } from '@tetherto/mdk-react-devkit/domain'

<MovementDetailsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  movement={selectedMovement}
/>
```

## Label & color resolution

The component renders data only — all resolution happens in `buildMovementDetailsViewModel`:
- Location labels come from `getLocationLabel` (`'site.warehouse'` → `Site Warehouse`)
- Location/status badge colors come from `MINER_LOCATION_*` / `MINER_STATUS_*` constants, falling
  back to a neutral border when a key is unknown
- Status labels come from `MINER_STATUS_NAMES` (`'ok_brand_new'` → `Brand New`)
- The device `code` is resolved with `getMinerShortCode`, and `model` falls back from
  `info.subType` → `type` → `-`
