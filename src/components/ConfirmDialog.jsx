import { useEffect } from 'react'
import Button from './Button'

// Asks "are you sure?" before anything is deleted or replaced. Escape cancels.
export default function ConfirmDialog({ title, message, confirmLabel = 'Yes, continue', onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <div className="overlay">
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title">
        <h2 id="dlg-title">{title}</h2>
        <p>{message}</p>
        <div className="row">
          <Button variant="quiet" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
