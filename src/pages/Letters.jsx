import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../hooks/useAppData'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'

// Two kinds of letters live here. "Dear Ted" has its own page.
const sections = [
  { kind: 'written', heading: 'The Letter I Wrote', intro: 'The letter you wrote to Elsie.', empty: "Paste your own letter here, in your own words. Nothing is written for you, and nothing is sent anywhere." },
  { kind: 'unsent', heading: 'The Letter I Never Sent', intro: 'Writing a letter does not mean you have to send it. This one is only for you.', empty: 'Say what you need to say. It stays here.' },
]

export default function Letters() {
  const { data, update } = useAppData()
  const [form, setForm] = useState(null)   // the letter being written, or null
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const save = () => {
    if (!form.body.trim()) { setError('Add some text first.'); return }
    const now = new Date().toISOString()
    const clean = { ...form, title: form.title.trim() || 'Untitled letter', body: form.body.trim(), updatedAt: now }
    update((prev) => ({ ...prev, letters: form.id ? prev.letters.map((l) => (l.id === form.id ? clean : l)) : [...prev.letters, { ...clean, id: crypto.randomUUID() }] }))
    setForm(null); setError(''); setStatus(`Saved at ${new Date(now).toLocaleTimeString([], { timeStyle: 'short' })}`)
  }
  const remove = () => { update((prev) => ({ ...prev, letters: prev.letters.filter((l) => l.id !== deleteId) })); setDeleteId(null) }
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  if (form) {
    return (
      <div className="page">
        <PageHeader title={form.id ? 'Edit letter' : 'New letter'} subtitle={form.kind === 'unsent' ? 'You are not obligated to send this to anyone.' : undefined} />
        <label className="field">Title<input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
        <label className="field">Date (optional)<input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></label>
        <label className="field">Short description (optional)<input type="text" value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
        <label className="field">Letter<textarea className="tall" value={form.body} onChange={(e) => set('body', e.target.value)} /></label>
        {error && <p className="alert" role="alert">{error}</p>}
        <div className="row"><Button onClick={save}>Save letter</Button><Button variant="quiet" onClick={() => { setForm(null); setError('') }}>Cancel</Button></div>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Letters & Our Story" subtitle="Your letters, kept in one quiet place." />
      {status && <p role="status" className="muted">{status}</p>}

      <Card title="Dear Ted">
        <p>The letter you wrote to yourself.{data.selfLetter ? ' You have edited it.' : ''}</p>
        <Link to="/dear-ted" className="btn btn-quiet">Read it</Link>
      </Card>

      {sections.map((s) => {
        const list = data.letters.filter((l) => l.kind === s.kind).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        return (
          <Card key={s.kind} title={s.heading}>
            <p className="muted">{s.intro}</p>
            {list.length === 0 && <p>{s.empty}</p>}
            {list.map((l) => (
              <div key={l.id} className="entry-row">
                <b>{l.title}</b>
                <p className="muted small">{l.date && `${l.date} · `}Last edited {new Date(l.updatedAt).toLocaleDateString()}</p>
                {l.description && <p>{l.description}</p>}
                <details><summary>Read</summary><p className="entry-body">{l.body}</p></details>
                <div className="row">
                  <Button variant="quiet" onClick={() => setForm(l)}>Edit</Button>
                  <Button variant="quiet" onClick={() => setDeleteId(l.id)}>Delete</Button>
                </div>
              </div>
            ))}
            <Button onClick={() => setForm({ id: null, kind: s.kind, title: '', date: '', description: '', body: '' })}>{list.length ? 'Add another' : 'Write or paste a letter'}</Button>
          </Card>
        )
      })}
      {deleteId && <ConfirmDialog title="Delete this letter?" message="This cannot be undone." confirmLabel="Delete letter" onConfirm={remove} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
