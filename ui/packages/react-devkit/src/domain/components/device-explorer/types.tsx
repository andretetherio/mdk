import type { Device } from '../../types/device'

export type GetColumnConfigParams = {
  getFormattedDate: (date: Date) => string
  renderAction: (device: DeviceExplorerDeviceData) => React.ReactNode
}

export type DeviceExplorerFilterOption = {
  /** Category key at the top level (e.g. `status`), or a selectable value under it; selections reach `onFiltersChange` as `[category, value]` paths */
  value: string
  /** Text shown in the filter cascader */
  label: string
  /** Values selectable under this category; omit on leaf options */
  children?: DeviceExplorerFilterOption[]
}

export type DeviceExplorerSearchOption = {
  /** Tag added to `searchTags` when this suggestion is picked (free-text tags are also allowed) */
  value: string
  /** Suggestion text, matched case-insensitively against the typed query and shown on the chip */
  label: string
}

export type DeviceExplorerDeviceData = Device

export { type Alert } from '../../types/alerts'

/**
 * The Explorer tabs — one per device kind the list can page through. Named
 * constants for the {@link DeviceExplorerDeviceType} union so callers branch on
 * `DEVICE_EXPLORER_DEVICE_TYPE.CONTAINER` instead of a bare string literal.
 *
 * @tier internal
 */
export const DEVICE_EXPLORER_DEVICE_TYPE = {
  CONTAINER: 'container',
  MINER: 'miner',
  CABINET: 'cabinet',
} as const

export type DeviceExplorerDeviceType =
  (typeof DEVICE_EXPLORER_DEVICE_TYPE)[keyof typeof DEVICE_EXPLORER_DEVICE_TYPE]
