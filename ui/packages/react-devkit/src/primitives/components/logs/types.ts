import type { CSSProperties } from 'react'

export type LogData = {
  /** Unique identifier */
  uuid: string
  /** Body text; `|`-separated values are split into separate lines */
  body: string
  /** Primary text */
  title: string
  /** Severity / status string (`'Critical'`, `'High'`, `'Medium'`, activity status, etc.) */
  status: string
  /** Secondary text (truncated with `title` tooltip) */
  subtitle: string
}

export type LogRowProps = {
  /** Log entry data */
  log: LogData
  /** Log type (controls dot appearance) */
  type: string
  /** Inline style for the row container */
  style?: CSSProperties
  /** Click handler */
  onLogClicked?: (uuid: string) => void
}

export type LogPagination = {
  /** Current page number */
  current: number
  /** Total number of items */
  total: number
  /** Items per page */
  pageSize: number
  /** Fired when the user changes the page */
  handlePaginationChange: (page: number) => void
}

export type LogsCardProps = Partial<{
  /** Log type (`'Incidents'` or `'Activity'`); controls the `LogDot` appearance */
  type: string
  /** Card header label */
  label: string
  /**
   * Applies dark card theme
   * @default false
   */
  isDark: boolean
  /**
   * Shows skeleton rows while loading
   * @default false
   */
  isLoading: boolean
  /**
   * Array of log entries to display
   * @default []
   */
  logsData: LogData[]
  /**
   * Message shown when `logsData` is empty
   * @default 'No active incidents'
   */
  emptyMessage: string
  /**
   * Number of skeleton rows shown during loading
   * @default 4
   */
  skeletonRows: number
  /** Pagination config; hides pagination when on page 1 or data is empty */
  pagination: LogPagination
  /** Fired with the log UUID when a row is clicked */
  onLogClicked: (uuid: string) => void
}>

export type LogDotProps = {
  /** `'Incidents'` renders a colored circle; `'Activity'` renders an activity icon */
  type: string
  /** Severity string for color mapping */
  status: string
}

export type LogItemProps = {
  data: LogData
  onLogClicked?: (uuid: string) => void
}

export type LogActivityIconProps = {
  status: string
}
