export type TimelineChartDataPoint = {
  x: [number, number]
  y: string | undefined
}

export type TimelineChartDataset = {
  label: string
  data: TimelineChartDataPoint[]
  borderColor?: string[]
  backgroundColor?: string[]
  color?: string
}

export type TimelineChartData = {
  /** Row labels, one row each; a data point lands in the row whose label equals its `y`. Nothing renders when empty */
  labels: string[]
  /** Bar series; each dataset's `label` is its tooltip title and legend entry */
  datasets: TimelineChartDataset[]
}

export type ChartRange = {
  /** Left edge of the time axis (`Date` or epoch ms); without a range the axis spans the data */
  min: Date | number
  /** Right edge of the time axis (`Date` or epoch ms) */
  max: Date | number
}

export type AxisTitleText = {
  /** Title under the time axis; hidden when empty */
  x: string
  /** Title beside the row labels; hidden when empty */
  y: string
}

export type TimelineChartProps = {
  /** Initial timeline data */
  initialData: TimelineChartData
  /** Streaming updates appended to the initial data */
  newData?: TimelineChartData
  /**
   * Ignore `newData`
   * @default false
   */
  skipUpdates?: boolean
  /** Visible time window */
  range?: ChartRange
  /**
   * Axis title strings
   * @default { x: "Time", y: "" }
   */
  axisTitleText?: AxisTitleText
  /**
   * Show loader
   * @default false
   */
  isLoading?: boolean
  /** Chart title */
  title?: string
  /** Chart pixel height */
  height?: number
}
