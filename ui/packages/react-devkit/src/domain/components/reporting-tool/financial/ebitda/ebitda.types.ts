/**
 * Display metrics for the financial EBITDA reporting surface (foundation).
 * Values mirror the reference app `Views/Financial/EBITDA/EBITDA.types` `EbitdaMetrics`.
 */
export type EbitdaDisplayMetrics = {
  /** Average cost to produce one BTC over the range, in USD (API `avgBtcProductionCost`, 0 when unavailable) */
  bitcoinProductionCost: number
  /** Mean of the per-period BTC prices over the range, in USD; falls back to the current BTC price when the log is empty */
  bitcoinPrice: number
  /** BTC mined over the range (API `totalRevenueBTC`), in BTC */
  bitcoinProduced: number
  /** EBITDA over the range assuming all mined BTC is sold, in USD (API `totalEbitdaSelling`) */
  ebitdaSellingBTC: number
  /** Realised EBITDA over the range, in USD; currently the same value as `ebitdaSellingBTC` */
  actualEbitda: number
  /** EBITDA over the range assuming no mined BTC is sold (HODL), in USD (API `totalEbitdaHodl`) */
  ebitdaNotSellingBTC: number
}
