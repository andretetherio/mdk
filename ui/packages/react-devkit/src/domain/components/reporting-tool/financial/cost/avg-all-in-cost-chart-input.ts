import type { FinancialDateRange } from '../../utils/financial-period'
import { getPeriodKey, getPeriodType } from '../../utils/financial-period'
import type { ToBarChartDataInput } from '../../utils/to-bar-chart-data'

import { COST_BAR_WIDTH, COST_COLOR, REVENUE_COLOR } from './cost-chart-shared'

export type AvgAllInCostDataPoint = {
  /** Period timestamp (ms epoch); formatted as the bucket's x-axis label for the selected period */
  ts: number
  /** Revenue per MWh consumed in the period, in USD/MWh; drawn as the Revenue bar */
  revenueUSDPerMWh: number
  /** All-in cost per MWh consumed in the period, in USD/MWh; drawn as the Cost bar */
  costUSDPerMWh: number
}

export type BuildAvgAllInCostInputArgs = {
  data?: ReadonlyArray<AvgAllInCostDataPoint>
  dateRange: FinancialDateRange | null
}

/**
 * Build the Chart.js input for the Avg All-in Cost bar chart.
 *
 * Returns `null` when the consumer hasn't wired revenue/cost data through yet
 * so the component can render its empty-state placeholder.
 */
export const buildAvgAllInCostInput = ({
  data,
  dateRange,
}: BuildAvgAllInCostInputArgs): ToBarChartDataInput | null => {
  if (!data || data.length === 0) return null

  const periodType = getPeriodType(dateRange)
  const sorted = [...data].sort((a, b) => a.ts - b.ts)

  return {
    labels: sorted.map((entry) => getPeriodKey(entry.ts, periodType)),
    barWidth: COST_BAR_WIDTH,
    series: [
      {
        label: 'Revenue',
        values: sorted.map((entry) => entry.revenueUSDPerMWh),
        color: REVENUE_COLOR,
      },
      {
        label: 'Cost',
        values: sorted.map((entry) => entry.costUSDPerMWh),
        color: COST_COLOR,
      },
    ],
  }
}
