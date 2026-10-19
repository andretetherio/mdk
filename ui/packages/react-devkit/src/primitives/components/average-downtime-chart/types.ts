export type AverageDowntimeChartData = {
  /** X-axis period labels, one per bar; empty renders the empty state */
  labels: string[]
  /** "Curtailment" downtime rate per period, as a fraction (0–1), aligned to `labels` */
  curtailment?: number[]
  /** "Op. Issues" downtime rate per period, as a fraction (0–1), stacked on `curtailment` */
  operationalIssues?: number[]
}

export type AverageDowntimeChartProps = Partial<{
  /**
   * Chart title (unit renders on its own line below)
   * @default "Monthly Average Downtime"
   */
  title: string
  /**
   * Unit subtitle under the title
   * @default %
   */
  unit: string
  /**
   * Chart height in pixels
   * @default 280
   */
  height: number
  /**
   * Max bar thickness
   * @default 38
   */
  barWidth: number
  /** Extra class on the container */
  className: string
  /**
   * Shows loading overlay
   * @default false
   */
  isLoading: boolean
  /** Message when there are no period labels or rate series */
  emptyMessage: string
  /** Period labels and rate arrays (fractions 0–1) */
  data: AverageDowntimeChartData
  /**
   * Formats Y-axis ticks, tooltips, and bar data labels (values are 0–1 rates).
   * Defaults to rate × 100 via `formatNumber`.
   */
  yTicksFormatter: (value: number) => string
  /**
   * Show values above stacked bars
   * @default false
   */
  showDataLabels: boolean
}>
