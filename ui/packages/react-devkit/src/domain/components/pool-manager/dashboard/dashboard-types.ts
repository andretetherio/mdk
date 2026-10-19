import type { ReactNode } from 'react'

export type NavigationBlockItem = {
  icon: ReactNode
  title: string
  description: string
  navText: string
  url: string
}

export type StatItemType = 'ERROR' | 'SUCCESS'

type StatItem = {
  label: string
  value: number
  type?: StatItemType
  secondaryValue?: string
}

export type DashboardStats = {
  /** One stat block each, in order: `label` (also the React key), `value`, optional `/ secondaryValue` and an `ERROR`/`SUCCESS` status dot */
  items: StatItem[]
}
