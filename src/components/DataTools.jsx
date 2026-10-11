import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { downloadFile } from '../utils/exportData'
import { parseBackup } from '../utils/importData'
import { defaultData } from '../utils/storage'
import Card from './Card'
import Button from './Button'
import ConfirmDialog from './ConfirmDialog'

export default function DataTools() {
  const { data, update } = useAppData()
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(null)   // a checked backup waiting for confirmation
  const [askClear, setAskClear] = useState(false)
  const [askLetter, setAskLetter] = useState(false)

  const exportAll = () => downloadFile(`dear-ted-backup-${new Date().toLocaleDateString('en-CA')}.json`, JSON.stringify(data, null, 2), 'application/json')

  const chooseFile = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    const result = parseBackup(await file.text())
    if (!result.ok) { setMessage(result.error); return }
    setMessage(''); setPending(result)
  }
  const confirmImport = () => { update(() => pending.data); setPending(null); setMessage('Backup restored.') }
  const confirmClear = () => { update(() => defaultData()); setAskClear(false); setMessage('Everything has been cleared from this browser.') }
  const confirmLetter = () => { update({ selfLetter: null }); setAskLetter(false); setMessage('The original letter is back.') }

  return (
    <Card title="Your data">
      <div className="row">
        <Button variant="quiet" onClick={exportAll}>Export everything</Button>
        <label className="btn btn-quiet">Import a backup<input type="file" accept="application/json,.json" onChange={chooseFile} className="sr-only" /></label>
        <Button variant="quiet" onClick={() => setAskLetter(true)}>Restore original letter</Button>
        <Button variant="quiet" onClick={() => setAskClear(true)}>Clear all data</Button>
      </div>
      {message && <p role="status">{message}</p>}
      {pending && (
        <ConfirmDialog title="Replace your current data?" confirmLabel="Replace with backup" onConfirm={confirmImport} onCancel={() => setPending(null)}
          message={`This backup has ${pending.summary.journal} journal entries, ${pending.summary.moods} mood check-ins, ${pending.summary.gratitude} gratitude days, ${pending.summary.prayers} prayers and ${pending.summary.futureLetters} future letters. Importing replaces what is saved now. Export first if you want to keep it.`} />
      )}
      {askClear && <ConfirmDialog title="Clear everything?" message="All entries, letters and settings in this browser will be deleted. Export a backup first if you might want them." confirmLabel="Clear all data" onConfirm={confirmClear} onCancel={() => setAskClear(false)} />}
      {askLetter && <ConfirmDialog title="Restore the original letter?" message="Your edited version of the Dear Ted letter will be replaced." confirmLabel="Restore" onConfirm={confirmLetter} onCancel={() => setAskLetter(false)} />}
    </Card>
  )
}
