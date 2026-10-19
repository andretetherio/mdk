import type { TimeRangeType } from '@primitives'

export type ChartDataPoint = {
  x: number | string
  y: number
}

export type ChartDataset = {
  type: 'line'
  label: string
  data: ChartDataPoint[]
  borderColor: string
  pointRadius: number
}

export type EntryData = {
  [key: string]: number | null | undefined
}

export type ChartEntry = {
  /** Sample timestamp (epoch ms), used as the x value; entries are expected oldest first */
  ts: number | string
  /** Per-device readings keyed by device name; each value maps a stat key (e.g. `cold_temp_c_1_group`) to its reading, and `null`/missing devices are skipped */
  container_specific_stats_group_aggr: Record<string, EntryData | null | undefined>
}

export type ChartDataByDevice = {
  [deviceName: string]: ChartDataset
}

export type OverviewChartResult = {
  yTicksFormatter: (value: number) => string
  timeRange: TimeRangeType | null
  datasets: ChartDataset[]
}
