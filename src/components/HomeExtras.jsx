import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import Card from './Card'
import Button from './Button'

const todayKey = () => new Date().toLocaleDateString('en-CA')

export default function HomeExtras() {
  const { data, update } = useAppData()
  const saved = data.dailyIntentions.find((d) => d.date === todayKey())
  const [intention, setIntention] = useState(saved ? saved.text : '')
  const [reflection, setReflection] = useState('')
  const [status, setStatus] = useState('')

  const saveIntention = () => {
    const text = intention.trim()
    if (!text) return
    update((prev) => ({ ...prev, dailyIntentions: [...prev.dailyIntentions.filter((d) => d.date !== todayKey()), { id: crypto.randomUUID(), date: todayKey(), text }] }))
    setStatus('Intention saved.')
  }
  const saveReflection = () => {
    if (!reflection.trim()) return
    const now = new Date().toISOString()
    update((prev) => ({ ...prev, journalEntries: [...prev.journalEntries, { id: crypto.randomUUID(), title: "Today's reflection", category: 'Self-worth', body: reflection.trim(), createdAt: now, updatedAt: now }] }))
    setReflection(''); setStatus('Saved to your journal.')
  }

  return (
    <>
      <Card title="What is one kind thing you can do for yourself today?">
        <label className="field"><span className="sr-only">Today's intention</span><input type="text" value={intention} onChange={(e) => setIntention(e.target.value)} /></label>
        <Button variant="quiet" onClick={saveIntention}>{saved ? 'Update intention' : 'Save intention'}</Button>
      </Card>
      <Card title="Today's reflection">
        <p>What is one thing you wish you could stop blaming yourself for?</p>
        <label className="field"><span className="sr-only">Your reflection</span><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} /></label>
        <Button variant="quiet" onClick={saveReflection}>Save to my journal</Button>
        {status && <p role="status" className="muted">{status}</p>}
      </Card>
    </>
  )
}
