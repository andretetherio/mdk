import type { MinMaxAvgValues } from '../min-max-avg/types'

export type ChartStatsFooterItem = {
  /** Stat label */
  label: string
  /** Stat value */
  value: string | number
}

export type SecondaryLabel = {
  /** Label text */
  title: string
  /** Value text */
  value: string | number
}

export type ChartStatsFooterProps = Partial<{
  /** Min/Max/Avg values row */
  minMaxAvg: MinMaxAvgValues
  /** Additional stats displayed in a columnar grid */
  stats: ChartStatsFooterItem[]
  /**
   * Number of stat items per column (default: 1)
   * @default 1
   */
  statsPerColumn: number
  /** Secondary label displayed below stats */
  secondaryLabel: SecondaryLabel
  /** Custom class name */
  className: string
}>
