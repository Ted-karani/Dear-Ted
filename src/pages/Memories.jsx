import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { resizeImage } from '../utils/image'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'

const categories = ['Happy memories', 'Things I appreciated', 'Things I learned', 'Difficult moments', 'Things I am ready to release']
const blank = { id: null, title: '', date: '', category: categories[0], description: '', reflection: '', lesson: '', image: '' }

export default function Memories() {
  const { data, update } = useAppData()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [layout, setLayout] = useState('cards')
  const [archived, setArchived] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const list = data.memories
    .filter((m) => !!m.archived === archived && (filter === 'All' || m.category === filter))
    .sort((a, b) => (b.date || b.createdAt).localeCompare(a.date || a.createdAt))

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const pickImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try { set('image', await resizeImage(file)); setError('') } catch { setError('That image could not be read. Try a different one.') }
  }
  const save = () => {
    if (!form.title.trim()) { setError('Give this memory a title.'); return }
    const clean = { ...form, title: form.title.trim() }
    update((prev) => ({ ...prev, memories: form.id ? prev.memories.map((m) => (m.id === form.id ? clean : m)) : [...prev.memories, { ...clean, id: crypto.randomUUID(), archived: false, createdAt: new Date().toISOString() }] }))
    setForm(null); setError('')
  }
  const toggleArchive = (id) => update((prev) => ({ ...prev, memories: prev.memories.map((m) => (m.id === id ? { ...m, archived: !m.archived } : m)) }))
  const remove = () => { update((prev) => ({ ...prev, memories: prev.memories.filter((m) => m.id !== deleteId) })); setDeleteId(null) }

  // One memory, shown the same way in both layouts
  const view = (m) => (
    <>
      <h2 className="card-title">{m.title}</h2>
      <p className="muted small">{m.date && `${m.date} `}<span className="badge">{m.category}</span></p>
      {m.image && <img className="memory-img" src={m.image} alt={m.title} />}
      {m.description && <p className="entry-body">{m.description}</p>}
      {m.reflection && <p className="entry-body"><b>My reflection: </b>{m.reflection}</p>}
      {m.lesson && <p className="entry-body"><b>What I learned: </b>{m.lesson}</p>}
      <div className="row">
        <Button variant="quiet" onClick={() => setForm(m)}>Edit</Button>
        <Button variant="quiet" onClick={() => toggleArchive(m.id)}>{m.archived ? 'Unarchive' : 'Archive'}</Button>
        <Button variant="quiet" onClick={() => setDeleteId(m.id)}>Delete</Button>
      </div>
    </>
  )

  if (form) {
    return (
      <div className="page">
        <PageHeader title={form.id ? 'Edit memory' : 'New memory'} />
        <Card>
          <label className="field">Title<input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
          <label className="field">Date, if you know it<input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></label>
          <label className="field">Category<select value={form.category} onChange={(e) => set('category', e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="field">What happened<textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
          <label className="field">My reflection (optional)<textarea value={form.reflection} onChange={(e) => set('reflection', e.target.value)} /></label>
          <label className="field">Lesson learned (optional)<input type="text" value={form.lesson} onChange={(e) => set('lesson', e.target.value)} /></label>
          <label className="field">Photo (optional)<input type="file" accept="image/*" onChange={pickImage} /></label>
          <p className="muted small">Photos are shrunk and kept in this browser only. Browser storage is limited, so a few photos is best.</p>
          {form.image && <><img className="memory-img" src={form.image} alt="Chosen" /><Button variant="quiet" onClick={() => set('image', '')}>Remove photo</Button></>}
          {error && <p className="alert" role="alert">{error}</p>}
          <div className="row"><Button onClick={save}>Save memory</Button><Button variant="quiet" onClick={() => { setForm(null); setError('') }}>Cancel</Button></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Memory Archive" subtitle="A relationship happened, and it mattered. You decide what place these memories have, and when." />
      <Button onClick={() => setForm(blank)}>Add a memory</Button>
      <div className="filters">
        <label className="field"><span className="sr-only">Category</span><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field"><span className="sr-only">Layout</span><select value={layout} onChange={(e) => setLayout(e.target.value)}><option value="cards">Cards</option><option value="timeline">Timeline</option></select></label>
        <label className="choice"><input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} /> Show archived</label>
      </div>
      {list.length === 0 && <Card><p>{archived ? 'No archived memories.' : 'No memories here yet. Add one only when you feel ready.'}</p></Card>}
      {layout === 'cards'
        ? list.map((m) => <Card key={m.id}>{view(m)}</Card>)
        : <ul className="timeline">{list.map((m) => <li key={m.id}>{view(m)}</li>)}</ul>}
      {deleteId && <ConfirmDialog title="Delete this memory?" message="This cannot be undone." confirmLabel="Delete memory" onConfirm={remove} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
