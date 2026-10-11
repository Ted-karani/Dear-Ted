import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'

const prayerCategories = ['Gratitude', 'Guidance', 'Family', 'Healing', 'Forgiveness', 'Future', 'Other']
const prompts = ['What do I need help carrying today?', 'What am I grateful for, even while things are difficult?', 'What does patience look like for me today?', 'What am I finding difficult to understand?', 'What would trusting the process look like without pretending I am not hurting?']
const todayKey = () => new Date().toLocaleDateString('en-CA')   // e.g. 2026-10-12

export default function Faith() {
  const { data, update } = useAppData()
  const todays = data.gratitudeEntries.find((g) => g.date === todayKey())

  // Gratitude: up to three lines for today
  const [items, setItems] = useState(todays ? [...todays.items, '', '', ''].slice(0, 3) : ['', '', ''])
  const [gError, setGError] = useState('')
  const [gSaved, setGSaved] = useState(false)
  const saveGratitude = () => {
    const filled = items.map((i) => i.trim()).filter(Boolean)
    if (!filled.length) { setGError('Add at least one thing, even something small.'); return }
    setGError(''); setGSaved(true)
    update((prev) => ({ ...prev, gratitudeEntries: [...prev.gratitudeEntries.filter((g) => g.date !== todayKey()), { id: crypto.randomUUID(), date: todayKey(), items: filled }] }))
  }

  // Prayer journal
  const [prayer, setPrayer] = useState({ title: '', category: 'Gratitude', text: '' })
  const [pError, setPError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const savePrayer = () => {
    if (!prayer.text.trim()) { setPError('Write a few words first.'); return }
    setPError('')
    update((prev) => ({ ...prev, prayers: [...prev.prayers, { ...prayer, title: prayer.title.trim() || 'Untitled', text: prayer.text.trim(), id: crypto.randomUUID(), createdAt: new Date().toISOString() }] }))
    setPrayer({ title: '', category: 'Gratitude', text: '' })
  }
  const removePrayer = () => { update((prev) => ({ ...prev, prayers: prev.prayers.filter((p) => p.id !== deleteId) })); setDeleteId(null) }

  // Reflection prompt
  const [promptIndex, setPromptIndex] = useState(0)

  const history = [...data.gratitudeEntries].sort((a, b) => b.date.localeCompare(a.date))
  const prayers = [...data.prayers].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="page">
      <PageHeader title="Faith & Gratitude" subtitle="You don't have to understand everything to be honest with God about how you feel." />

      <Card title="Three things I'm grateful for today">
        <p className="muted">Gratitude can sit next to sadness. It doesn't cancel it.</p>
        {items.map((v, i) => (
          <label key={i} className="field"><span className="sr-only">Gratitude {i + 1}</span>
            <input type="text" value={v} placeholder={['Something about family', 'Something I learned', 'A small moment of peace'][i]} onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); setGSaved(false) }} />
          </label>
        ))}
        {gError && <p className="alert" role="alert">{gError}</p>}
        <Button onClick={saveGratitude}>{todays ? 'Update today' : 'Save today'}</Button>
        {gSaved && <span className="muted" role="status"> Saved.</span>}
      </Card>

      <Card title="A question to sit with">
        <p className="reminder">{prompts[promptIndex]}</p>
        <Button variant="quiet" onClick={() => setPromptIndex((promptIndex + 1) % prompts.length)}>Another question</Button>
      </Card>

      <Card title="Prayer journal">
        <label className="field">Title (optional)<input type="text" value={prayer.title} onChange={(e) => setPrayer({ ...prayer, title: e.target.value })} /></label>
        <label className="field">Category
          <select value={prayer.category} onChange={(e) => setPrayer({ ...prayer, category: e.target.value })}>{prayerCategories.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="field">My prayer<textarea value={prayer.text} onChange={(e) => setPrayer({ ...prayer, text: e.target.value })} /></label>
        {pError && <p className="alert" role="alert">{pError}</p>}
        <Button onClick={savePrayer}>Save prayer</Button>
        {prayers.map((p) => (
          <div key={p.id} className="entry-row">
            <b>{p.title}</b> <span className="badge">{p.category}</span>
            <p className="muted small">{new Date(p.createdAt).toLocaleDateString()}</p>
            <p className="entry-body">{p.text}</p>
            <Button variant="quiet" onClick={() => setDeleteId(p.id)}>Delete</Button>
          </div>
        ))}
      </Card>

      <Card title="Gratitude history">
        {history.length === 0 ? <p className="muted">Your saved gratitude will gather here.</p> : history.map((g) => (
          <div key={g.id} className="entry-row"><span className="muted small">{g.date}</span><ul className="plain-list">{g.items.map((it, i) => <li key={i}>{it}</li>)}</ul></div>
        ))}
      </Card>
      {deleteId && <ConfirmDialog title="Delete this prayer?" message="This cannot be undone." confirmLabel="Delete prayer" onConfirm={removePrayer} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
