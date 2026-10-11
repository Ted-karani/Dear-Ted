import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import Card from './Card'
import Button from './Button'

const moods = ['Peaceful', 'Okay', 'Sad', 'Missing her', 'Confused', 'Anxious', 'Hopeful', 'Grateful', 'Numb', 'Other']

export default function MoodCheckIn() {
  const { data, update } = useAppData()
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  const save = () => {
    update((prev) => ({ ...prev, moodEntries: [...prev.moodEntries, { id: crypto.randomUUID(), mood, note: note.trim(), at: new Date().toISOString() }] }))
    setMood(''); setNote(''); setJustSaved(true)
  }
  const recent = [...data.moodEntries].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5)

  return (
    <Card title="How are you feeling today?">
      <div className="chips" role="group" aria-label="Mood">
        {moods.map((m) => (
          <button key={m} className="chip" aria-pressed={mood === m} onClick={() => { setMood(m); setJustSaved(false) }}>{m}</button>
        ))}
      </div>
      {mood && (
        <>
          <label className="field">A few words about why (optional)<input type="text" value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <Button onClick={save}>Save how I feel</Button>
        </>
      )}
      {justSaved && <p className="muted" role="status">Saved. Whatever you feel is allowed.</p>}
      {recent.length > 0 && (
        <ul className="timeline">
          {recent.map((e) => (
            <li key={e.id}><span className="muted small">{new Date(e.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span> <b>{e.mood}</b>{e.note && <> – {e.note}</>}</li>
          ))}
        </ul>
      )}
    </Card>
  )
}
