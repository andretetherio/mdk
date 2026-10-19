/** The spare part targeted for deletion. */
export type ConfirmDeleteSparePartModalSparePart = {
  /** Part identifier; not rendered, passed back to `onConfirm` with the part */
  id: string
  /** Part code, quoted in the confirmation message */
  code: string
}

/** Props for `ConfirmDeleteSparePartModal`. */
export type ConfirmDeleteSparePartModalProps = {
  /** Whether the modal is open */
  isOpen?: boolean
  /** Called when the modal requests to close */
  onClose?: VoidFunction
  /** Called with the part when the user confirms */
  onConfirm?: (sparePart: ConfirmDeleteSparePartModalSparePart) => Promise<void> | void
  /** The part to delete; when omitted the modal renders nothing */
  sparePart?: ConfirmDeleteSparePartModalSparePart
  /** Disables the action buttons while the delete is in flight */
  isLoading?: boolean
}
