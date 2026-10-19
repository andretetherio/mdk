import type { ReactNode } from 'react'

/** Device record attached to a movement (e.g. a miner or spare part). All fields optional. */
export type MovementDevice = Partial<{
  code: string
  tags: string[]
  type: string
  info: Partial<{
    subType: string
    site: string
    container: string
    serialNum: string
    macAddress: string
  }>
}>

/** A single historical device movement: a location/status transition for one device. */
export type MovementData = {
  /** Location key before the move (a `MINER_LOCATIONS` value such as `site.warehouse`); drives the origin badge label and color */
  origin: string
  /** Location key after the move (a `MINER_LOCATIONS` value); drives the destination badge label and color */
  destination: string
  /** Status key before the move (a `MINER_STATUSES` value such as `faulty`); shown via `MINER_STATUS_NAMES`, raw key if unmapped */
  previousStatus: string
  /** Status key after the move (a `MINER_STATUSES` value); shown via `MINER_STATUS_NAMES`, raw key if unmapped */
  newStatus: string
  /** Moved device; when omitted the device summary panel is hidden */
  device?: MovementDevice
  /** Free-form notes rendered below the transition; hidden when empty */
  comments?: ReactNode
}

/** Props for `MovementDetailsModal`; pass the selected movement and open/close handlers. */
export type MovementDetailsModalProps = Partial<{
  /**
   * Whether the modal is open
   * @default false
   */
  isOpen: boolean
  /** Called when the modal requests to close (overlay click, escape, or close button) */
  onClose: () => void
  /** The selected movement; when omitted the modal renders nothing */
  movement: MovementData
}>
