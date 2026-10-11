import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useAppData } from '../hooks/useAppData'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'

const categories = ['General reflection', 'Missing her', 'Self-worth', 'Faith', 'Gratitude', 'Lessons learned', 'Personal growth', 'Future plans', 'Unsent thoughts']
const blank = { id: null, title: '', category: categories[0], body: '' }

export default function Journal() {
  const { data, update } = useAppData()
  const [form, setForm] = useState(null)       // null = not writing, otherwise the entry being written
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [deleteId, setDeleteId] = useState(null)

  // Newest edits first, then apply search and category filter
  const entries = [...data.journalEntries]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .filter((e) => (filter === 'All' || e.category === filter) && (e.title + ' ' + e.body).toLowerCase().includes(query.trim().toLowerCase()))

  const save = () => {
    if (!form.body.trim()) { setError('Write something first, even a few words.'); return }
    const now = new Date().toISOString()
    const clean = { ...form, title: form.title.trim() || 'Untitled', body: form.body.trim() }
    update((prev) => ({
      ...prev,
      journalEntries: form.id
        ? prev.journalEntries.map((e) => (e.id === form.id ? { ...e, ...clean, updatedAt: now } : e))
        : [...prev.journalEntries, { ...clean, id: crypto.randomUUID(), createdAt: now, updatedAt: now }],
    }))
    setForm(null); setError('')
  }
  const remove = () => {
    update((prev) => ({ ...prev, journalEntries: prev.journalEntries.filter((e) => e.id !== deleteId) }))
    setDeleteId(null)
  }
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  if (form) {
    return (
      <div className="page">
        <PageHeader title={form.id ? 'Edit entry' : 'New entry'} subtitle="Your words don't have to be perfect. Start wherever you are." />
        <Card>
          <label className="field">Title (optional)<input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
          <label className="field">Category
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="field">What's on your mind?<textarea className="tall" value={form.body} onChange={(e) => set('body', e.target.value)} /></label>
          {error && <p className="alert" role="alert">{error}</p>}
          <div className="row">
            <Button onClick={save}>Save entry</Button>
            <Button variant="quiet" onClick={() => { setForm(null); setError('') }}>Cancel</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Private Journal" subtitle="No schedule, no streaks. Write when you want to." />
      <Button onClick={() => setForm(blank)}><Plus size={18} aria-hidden="true" /> New entry</Button>

      {data.journalEntries.length > 0 && (
        <div className="filters">
          <label className="field grow"><span className="sr-only">Search entries</span>
            <input type="text" placeholder="Search your entries" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <label className="field"><span className="sr-only">Filter by category</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
        </div>
      )}

      {data.journalEntries.length === 0 && <Card><p className="lead">Your words don't have to be perfect. Start wherever you are.</p></Card>}
      {data.journalEntries.length > 0 && entries.length === 0 && <p className="muted"><Search size={16} aria-hidden="true" /> Nothing matches that search.</p>}

      {entries.map((e) => (
        <Card key={e.id}>
          <h2 className="card-title">{e.title}</h2>
          <p className="muted small">{new Date(e.createdAt).toLocaleDateString()} <span className="badge">{e.category}</span>{e.updatedAt !== e.createdAt && ' · edited'}</p>
          <p className="entry-body">{e.body}</p>
          <div className="row">
            <Button variant="quiet" onClick={() => setForm(e)}>Edit</Button>
            <Button variant="quiet" onClick={() => setDeleteId(e.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {deleteId && <ConfirmDialog title="Delete this entry?" message="This cannot be undone." confirmLabel="Delete entry" onConfirm={remove} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
