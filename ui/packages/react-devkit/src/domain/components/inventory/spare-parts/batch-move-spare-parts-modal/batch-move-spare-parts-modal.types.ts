import type { FormSelectOption } from '@primitives'

/** A spare part shown in the batch-move table. */
export type BatchMoveSparePart = {
  /** Part identifier; not rendered, kept so the caller can map the move back to its records */
  id: string
  /** Part code, shown in the Code column */
  code: string
  /** Current location value; shown as the matching `locationOptions` label, or the raw value when none matches */
  location: string
  /** Current status value; shown as the matching `statusOptions` label, or the raw value when none matches */
  status: string
}

/** Props for `BatchMoveSparePartsModal`; unselected location/status arrive as `null` on submit. */
export type BatchMoveSparePartsModalProps = {
  /** Whether the modal is open */
  isOpen: boolean
  /** Called when the modal requests to close */
  onClose: VoidFunction
  /** The parts to move, rendered in the table */
  spareParts: BatchMoveSparePart[]
  /** New-location options */
  locationOptions: FormSelectOption[]
  /** New-status options */
  statusOptions: FormSelectOption[]
  /** Submit handler; unselected fields are `null` */
  onSubmit: (values: {
    location: string | null
    status: string | null
    observation: string | null
  }) => Promise<void> | void
}
