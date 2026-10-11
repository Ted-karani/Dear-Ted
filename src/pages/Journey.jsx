import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'

const topics = ['Communication', 'Boundaries', 'Emotional needs', 'Self-respect', 'Attachment patterns', 'Handling uncertainty', 'Expressing affection', 'Taking responsibility', 'Recognising compatibility', 'What a healthy relationship means to me']
const starterMilestones = ['I wrote honestly about my feelings.', 'I recognised a painful assumption.', 'I did something kind for myself.', 'I spent meaningful time with family or friends.', 'I made progress on a personal project.', 'I recorded something I was grateful for.', 'I reflected on a mistake without insulting myself.', 'I allowed myself to enjoy something.', 'I identified a boundary that matters to me.', 'I wrote down something I want for my future.']
const goalCategories = ['Learning and coding', 'Family', 'Faith', 'Friendships', 'Hobbies', 'Personal development', 'Health and daily routines', 'Future plans']

export default function Journey() {
  const { data, update } = useAppData()
  const learnings = data.learnings || []
  const [lesson, setLesson] = useState({ topic: topics[0], text: '' })
  const [custom, setCustom] = useState('')
  const [goal, setGoal] = useState({ title: '', description: '', category: goalCategories[0], targetDate: '', reflection: '' })
  const [gError, setGError] = useState('')
  const [deleteGoal, setDeleteGoal] = useState(null)

  const addLesson = () => {
    if (!lesson.text.trim()) return
    update((prev) => ({ ...prev, learnings: [...(prev.learnings || []), { id: crypto.randomUUID(), topic: lesson.topic, text: lesson.text.trim(), at: new Date().toISOString() }] }))
    setLesson({ ...lesson, text: '' })
  }
  const removeLesson = (id) => update((prev) => ({ ...prev, learnings: (prev.learnings || []).filter((l) => l.id !== id) }))

  // A milestone is "done" if it appears in data.milestones
  const isDone = (label) => data.milestones.some((m) => m.label === label)
  const toggleMilestone = (label, isCustom = false) =>
    update((prev) => ({ ...prev, milestones: prev.milestones.some((m) => m.label === label) ? prev.milestones.filter((m) => m.label !== label) : [...prev.milestones, { id: crypto.randomUUID(), label, custom: isCustom, at: new Date().toISOString() }] }))
  const addCustom = () => { const label = custom.trim(); if (label && !isDone(label)) { toggleMilestone(label, true); setCustom('') } }
  const customMilestones = data.milestones.filter((m) => m.custom)

  const addGoal = () => {
    if (!goal.title.trim()) { setGError('Give your goal a short title.'); return }
    setGError('')
    update((prev) => ({ ...prev, goals: [...prev.goals, { ...goal, title: goal.title.trim(), id: crypto.randomUUID(), done: false }] }))
    setGoal({ title: '', description: '', category: goalCategories[0], targetDate: '', reflection: '' })
  }
  const toggleGoal = (id) => update((prev) => ({ ...prev, goals: prev.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)) }))
  const removeGoal = () => { update((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== deleteGoal) })); setDeleteGoal(null) }

  const doneGoals = data.goals.filter((g) => g.done).length

  return (
    <div className="page">
      <PageHeader title="My Healing Journey" subtitle="No countdown and no score. Small actions matter even when the feelings are still heavy." />

      <Card title="Things I'm learning">
        <p className="muted small">These are reflection topics, not diagnoses.</p>
        <label className="field">Topic<select value={lesson.topic} onChange={(e) => setLesson({ ...lesson, topic: e.target.value })}>{topics.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="field">What I've noticed<textarea value={lesson.text} onChange={(e) => setLesson({ ...lesson, text: e.target.value })} /></label>
        <Button onClick={addLesson}>Add</Button>
        {learnings.map((l) => (
          <div key={l.id} className="entry-row"><span className="badge">{l.topic}</span><p className="entry-body">{l.text}</p><Button variant="quiet" onClick={() => removeLesson(l.id)}>Remove</Button></div>
        ))}
      </Card>

      <Card title="Small milestones">
        <p className="muted small">Tick what's true for you. All optional.</p>
        {starterMilestones.map((m) => <label key={m} className="choice"><input type="checkbox" checked={isDone(m)} onChange={() => toggleMilestone(m)} />{m}</label>)}
        {customMilestones.map((m) => (
          <div key={m.id} className="row"><span>✓ {m.label}</span><Button variant="quiet" onClick={() => toggleMilestone(m.label)}>Remove</Button></div>
        ))}
        <label className="field">Add your own<input type="text" value={custom} onChange={(e) => setCustom(e.target.value)} /></label>
        <Button variant="quiet" onClick={addCustom}>Add milestone</Button>
      </Card>

      <Card title="Personal goals">
        <p className="muted small">Productivity is not a cure for grief. Pick goals that feel kind.</p>
        <label className="field">Goal<input type="text" value={goal.title} onChange={(e) => setGoal({ ...goal, title: e.target.value })} /></label>
        <label className="field">Details (optional)<textarea value={goal.description} onChange={(e) => setGoal({ ...goal, description: e.target.value })} /></label>
        <label className="field">Category<select value={goal.category} onChange={(e) => setGoal({ ...goal, category: e.target.value })}>{goalCategories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field">Target date (optional)<input type="date" value={goal.targetDate} onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })} /></label>
        {gError && <p className="alert" role="alert">{gError}</p>}
        <Button onClick={addGoal}>Add goal</Button>
        {data.goals.map((g) => (
          <div key={g.id} className="entry-row">
            <label className="choice"><input type="checkbox" checked={g.done} onChange={() => toggleGoal(g.id)} /><b>{g.title}</b></label>
            <p className="muted small"><span className="badge">{g.category}</span>{g.targetDate && ` · by ${g.targetDate}`}</p>
            {g.description && <p className="entry-body">{g.description}</p>}
            <Button variant="quiet" onClick={() => setDeleteGoal(g.id)}>Delete</Button>
          </div>
        ))}
      </Card>

      <Card title="What I've done so far">
        <p>{learnings.length} lessons noted, {data.milestones.length} milestones, {doneGoals} goals completed.</p>
        <p className="muted small">These are only things you chose to record. They aren't a recovery score.</p>
      </Card>
      {deleteGoal && <ConfirmDialog title="Delete this goal?" message="This cannot be undone." confirmLabel="Delete goal" onConfirm={removeGoal} onCancel={() => setDeleteGoal(null)} />}
    </div>
  )
}
