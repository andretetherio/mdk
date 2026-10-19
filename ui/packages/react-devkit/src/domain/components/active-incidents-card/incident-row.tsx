import { cn } from '@primitives'
import { IncidentSeverity } from './incident-severity'
import type { TIncidentSeverity } from './types'

import type { JSX } from 'react'

export type TIncidentRowProps = {
  /** Incident identifier; the virtual-list row key and the argument passed to the click handler */
  id: string
  /** First line of the row */
  title: string
  /** Third line of the row, under `subtitle` */
  body: string
  /** Second line of the row, under `title` */
  subtitle: string
  /** `critical`, `high` or `medium`; sets the colored severity dot beside the row */
  severity: TIncidentSeverity
  /** Row click handler, called with `id`; in `ActiveIncidentsCard` it is always replaced by `onItemClick` */
  onClick?: (id: string) => void
}

const IncidentRow = ({
  id,
  body,
  title,
  onClick,
  severity,
  subtitle,
}: TIncidentRowProps): JSX.Element => {
  const handleClick = (): void => {
    onClick?.(id)
  }

  return (
    <div
      className={cn(
        'mdk-active-incidents-card__row',
        onClick && 'mdk-active-incidents-card__row--clickable',
      )}
    >
      <IncidentSeverity severity={severity} />
      <div className="mdk-active-incidents-card__row-content" onClick={handleClick}>
        <div className="mdk-active-incidents-card__row-data">
          <div className="mdk-active-incidents-card__row-title">{title}</div>
          <div className="mdk-active-incidents-card__row-subtitle">{subtitle}</div>
          <div className="mdk-active-incidents-card__row-body">{body}</div>
        </div>
        {onClick && <div className="mdk-active-incidents-card__arrow">&#x2192;</div>}
      </div>
    </div>
  )
}

IncidentRow.displayName = 'IncidentRow'

export { IncidentRow }
