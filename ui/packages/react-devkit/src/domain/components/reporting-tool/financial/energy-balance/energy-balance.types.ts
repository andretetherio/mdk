/**
 * Display types for the financial Energy Balance reporting surface (foundation).
 * Wire types (EnergyBalanceResponse, EnergyBalanceLogEntry, EnergyBalanceTotals)
 * live in @/types/finance and are re-exported here for consumer convenience.
 */
export type {
  EnergyBalanceLogEntry,
  EnergyBalanceResponse,
  EnergyBalanceTotals,
} from '@domain/types/finance'

export type EnergyBalanceTab = 'revenue' | 'cost'

export type EnergyRevenueMetrics = {
  /** Average curtailment rate over the range, as a percentage (0-100) */
  curtailmentRate: number
  /** Average rate of downtime from operational issues over the range, as a percentage (0-100) */
  operationalIssuesRate: number
}

export type EnergyCostMetrics = {
  /** Mean site power draw across the periods, in MW */
  avgPowerConsumption: number
  /** Average energy cost, shown in USD/MWh */
  avgEnergyCost: number
  /** Average energy plus operational cost, shown in USD/MWh */
  avgAllInCost: number
  /** Available site power passed in as `availablePowerMW`, in MW */
  avgPowerAvailability: number
  /** Average operational (non-energy) cost, shown in USD/MWh */
  avgOperationsCost: number
  /** Average revenue per unit of energy, shown in USD/MWh */
  avgEnergyRevenue: number
}

export type ThresholdBarChartInput = {
  labels: string[]
  series: Array<{
    label: string
    values: number[]
    color?: string
    stack?: string
  }>
}

export type EnergyCostChartInput = ThresholdBarChartInput & {
  btcUnit: string | null
}

export type ThresholdLineChartInput = {
  /** Plotted lines; each point is `{ ts, value }` with `ts` in ms epoch. The first series' timestamps set the x positions of the `constants` lines */
  series: Array<{
    label: string
    points: Array<{ ts: number; value: number }>
    color?: string
  }>
  /** Horizontal reference lines (e.g. Power Availability) drawn at `value` across the first series' timestamps */
  constants?: Array<{
    label: string
    value: number
    color?: string
    style?: { borderDash?: number[] }
  }>
}
