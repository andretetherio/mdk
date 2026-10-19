import type { ReactNode } from 'react'

export type DetailLegendItem = {
  /** Display label; also passed to `onToggle` */
  label: string
  /** Hex color for the default swatch (border, plus 20% opacity fill) and the `color` of a custom `icon` */
  color: string
  /** Custom icon replacing the default color swatch */
  icon?: ReactNode
  /** Value shown below the label, numbers formatted, with optional `unit`; also the row that holds `percentChange` */
  currentValue?: {
    value: number | string
    unit?: string
  }
  /** Percentage change shown after `currentValue`: positive as a green ▲, negative as a red ▼; hidden when `0`, `null` or without `currentValue` */
  percentChange?: number | null
  /** Dims the item (30% opacity) to show its dataset is hidden */
  hidden?: boolean
}

export type DetailLegendProps = {
  /** Legend items to display */
  items: DetailLegendItem[]
  /** Callback when a legend item is toggled */
  onToggle?: (label: string, index: number) => void
  /** Custom class name */
  className?: string
}
