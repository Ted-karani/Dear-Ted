import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { useAppData } from '../hooks/useAppData'
import { downloadFile } from '../utils/exportData'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'

const prompts = ['What am I feeling right now?', 'What do I hope I learn?', 'What do I want to remember about this relationship?', 'What do I want to forgive myself for?', 'What do I hope my future looks like?', 'What do I want to say to the person I will become?', 'What do I hope I will be proud of?', 'What do I want to remember about my faith and family?']
const todayKey = () => new Date().toLocaleDateString('en-CA')

export default function FutureMe() {
  const { data, update } = useAppData()
  const [form, setForm] = useState({ title: '', body: '', revisitOn: '' })
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const addPrompt = (p) => setForm((f) => ({ ...f, body: (f.body ? f.body + '\n\n' : '') + p + '\n' }))
  const save = () => {
    if (!form.body.trim()) { setError('Write a few words to your future self first.'); return }
    setError('')
    update((prev) => ({ ...prev, futureLetters: [...prev.futureLetters, { id: crypto.randomUUID(), title: form.title.trim() || 'A letter to future me', body: form.body.trim(), revisitOn: form.revisitOn, ready: false, createdAt: new Date().toISOString() }] }))
    setForm({ title: '', body: '', revisitOn: '' })
  }
  const toggleReady = (id) => update((prev) => ({ ...prev, futureLetters: prev.futureLetters.map((l) => (l.id === id ? { ...l, ready: !l.ready } : l)) }))
  const remove = () => { update((prev) => ({ ...prev, futureLetters: prev.futureLetters.filter((l) => l.id !== deleteId) })); setDeleteId(null) }
  const download = (l) => downloadFile(`${l.title}.txt`, `${l.title}\nWritten ${new Date(l.createdAt).toLocaleDateString()}\n\n${l.body}\n`)

  const letters = [...data.futureLetters].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="page">
      <PageHeader title="Future Me" subtitle="One day, you will look back at the person you are today. What do you want him to remember?" />
      <Card title="Write a letter">
        <label className="field">Title (optional)<input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <p className="muted small">Need a place to start? Tap a question to add it to your letter.</p>
        <div className="chips">{prompts.map((p) => <button key={p} className="chip" onClick={() => addPrompt(p)}>{p}</button>)}</div>
        <label className="field">Your letter<textarea className="tall short" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
        <label className="field">Date to revisit (optional)<input type="date" value={form.revisitOn} onChange={(e) => setForm({ ...form, revisitOn: e.target.value })} /></label>
        {error && <p className="alert" role="alert">{error}</p>}
        <Button onClick={save}>Save letter</Button>
        <p className="muted small">This app can't send you notifications when it's closed, so a revisit date is only a marker. Letters never leave this browser.</p>
      </Card>

      <h2>My letters</h2>
      {letters.length === 0 && <p className="muted">Your letters will gather here as a timeline.</p>}
      <ul className="timeline">
        {letters.map((l) => {
          const ready = l.ready || (l.revisitOn && l.revisitOn <= todayKey())
          return (
            <li key={l.id}>
              <b>{l.title}</b> {ready && <span className="badge">Ready to revisit</span>}
              <p className="muted small">Written {new Date(l.createdAt).toLocaleDateString()}{l.revisitOn && ` · revisit on ${l.revisitOn}`}</p>
              <details><summary>Read it</summary><p className="entry-body">{l.body}</p></details>
              <div className="row">
                <Button variant="quiet" onClick={() => toggleReady(l.id)}><Check size={16} aria-hidden="true" /> {l.ready ? 'Not ready yet' : 'Ready to revisit'}</Button>
                <Button variant="quiet" onClick={() => download(l)}><Download size={16} aria-hidden="true" /> Download</Button>
                <Button variant="quiet" onClick={() => setDeleteId(l.id)}>Delete</Button>
              </div>
            </li>
          )
        })}
      </ul>
      {deleteId && <ConfirmDialog title="Delete this letter?" message="This cannot be undone." confirmLabel="Delete letter" onConfirm={remove} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
