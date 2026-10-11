import { useState } from 'react'
import { Heart, ArrowUp, Check, Pencil } from 'lucide-react'
import { useAppData } from '../hooks/useAppData'
import { defaultLetter } from '../data/defaultLetter'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'

export default function DearTed() {
  const { data, update } = useAppData()
  const text = data.selfLetter ?? defaultLetter          // edited version, or the original
  const favourites = data.favoritePassages || []
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim())

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [fade, setFade] = useState(true)
  const [size, setSize] = useState(1.12)   // letter text size in rem
  const [askRestore, setAskRestore] = useState(false)

  const startEdit = () => { setDraft(text); setError(''); setEditing(true) }
  const saveEdit = () => {
    if (!draft.trim()) { setError('The letter cannot be empty. Use "Restore original" if you want to start again.'); return }
    update({ selfLetter: draft.trim() })
    setEditing(false)
  }
  const restore = () => { update({ selfLetter: null }); setAskRestore(false); setEditing(false) }
  const toggleFav = (p) =>
    update((prev) => {
      const list = prev.favoritePassages || []
      return { ...prev, favoritePassages: list.includes(p) ? list.filter((x) => x !== p) : [...list, p] }
    })
  const markRevisited = () => update({ letterRevisitedAt: new Date().toISOString() })

  if (editing) {
    return (
      <div className="page">
        <PageHeader title="Edit your letter" subtitle="A blank line starts a new paragraph." />
        <label className="field">Letter text
          <textarea className="tall" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        {error && <p className="alert" role="alert">{error}</p>}
        <div className="row">
          <Button onClick={saveEdit}>Save letter</Button>
          <Button variant="quiet" onClick={() => setEditing(false)}>Cancel</Button>
          <Button variant="quiet" onClick={() => setAskRestore(true)}>Restore original</Button>
        </div>
        {askRestore && <ConfirmDialog title="Restore the original letter?" message="Your edits to this letter will be replaced by the original version." confirmLabel="Restore original" onConfirm={restore} onCancel={() => setAskRestore(false)} />}
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Dear Ted" subtitle="A letter from you, to you. Read it when you need it. It's never a daily task." />
      <div className="row tools">
        <Button variant="quiet" onClick={startEdit}><Pencil size={16} aria-hidden="true" /> Edit</Button>
        <label className="choice"><input type="checkbox" checked={fade} onChange={(e) => setFade(e.target.checked)} /> Fade in slowly</label>
        <Button variant="quiet" onClick={() => setSize(Math.max(0.95, size - 0.1))} aria-label="Smaller text">A-</Button>
        <Button variant="quiet" onClick={() => setSize(Math.min(1.6, size + 0.1))} aria-label="Larger text">A+</Button>
      </div>

      <article className="letter" style={{ '--letter-size': `${size}rem` }}>
        {paragraphs.map((p, i) => (
          <div key={i} className={`para ${i === 0 ? 'salutation' : ''} ${fade ? 'fade' : ''}`} style={fade ? { animationDelay: `${Math.min(i, 14) * 0.1}s` } : undefined}>
            <p>{p}</p>
            {i > 0 && (
              <button className="fav" aria-pressed={favourites.includes(p)} aria-label={favourites.includes(p) ? 'Remove from favourite passages' : 'Save as favourite passage'} onClick={() => toggleFav(p)}>
                <Heart size={16} aria-hidden="true" fill={favourites.includes(p) ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        ))}
      </article>

      <div className="row tools">
        <Button variant="quiet" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={16} aria-hidden="true" /> Back to the beginning</Button>
        <Button variant="quiet" onClick={markRevisited}><Check size={16} aria-hidden="true" /> Mark as revisited</Button>
      </div>
      {data.letterRevisitedAt && <p className="muted">Last revisited {new Date(data.letterRevisitedAt).toLocaleDateString()}</p>}

      <Card title="Passages I saved">
        {favourites.length === 0
          ? <p className="muted">Tap the heart beside any line that you want to keep close.</p>
          : favourites.map((f) => <blockquote key={f} className="quote">{f}</blockquote>)}
      </Card>
    </div>
  )
}
