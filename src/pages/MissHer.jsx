import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../hooks/useAppData'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'

const missing = ['Her presence', 'Our conversations', 'The good memories', 'The future I imagined', 'Feeling loved', 'Having someone to share things with', 'The person I was during that time', 'Something else']
const grounding = ['Take a few slow breaths.', 'Drink some water.', 'Stretch or step outside.', 'Pray or sit quietly.', 'Write down what you wish you could say.', 'Listen to peaceful music.', 'Talk to someone you trust.', 'Do one small task that reconnects you with everyday life.']
const needs = [
  { id: 'reassure', label: 'Reassurance', text: "Missing her doesn't mean you did something wrong, and it doesn't mean you must go back. It means something mattered to you." },
  { id: 'quiet', label: 'A quiet moment', text: "Put the phone down for a few minutes. Breathe in gently, breathe out a little longer, and let your shoulders drop. There's nothing you have to solve right now." },
  { id: 'write', label: 'Writing my thoughts down', text: 'Writing can make a feeling smaller and clearer.', link: ['/journal', 'Open my journal'] },
  { id: 'distract', label: 'A distraction', text: 'Give your hands or body something to do: tidy a shelf, go outside, work on a small piece of code, or call a friend. A break is not running away.' },
  { id: 'pray', label: 'Prayer and gratitude', text: "You can be honest about how much it hurts, and still notice one thing you're thankful for.", link: ['/faith', 'Open Faith & Gratitude'] },
  { id: 'learn', label: 'A reminder of what I am learning', text: "You were learning while you were living it. You can keep what you learned without carrying the whole ending on your shoulders." },
]

export default function MissHer() {
  const { update } = useAppData()
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState([])
  const [thought, setThought] = useState('')
  const [need, setNeed] = useState(null)
  const [saved, setSaved] = useState(false)

  const toggle = (item) => setPicked((p) => (p.includes(item) ? p.filter((x) => x !== item) : [...p, item]))
  const chosen = needs.find((n) => n.id === need)

  // Nothing is saved unless he presses this button at the end.
  const saveToJournal = () => {
    const now = new Date().toISOString()
    const body = `What I was missing: ${picked.join(', ') || 'not sure'}\n\nWhat the feeling is telling me, and what I might be assuming:\n${thought.trim() || '(left blank)'}`
    update((prev) => ({ ...prev, journalEntries: [...prev.journalEntries, { id: crypto.randomUUID(), title: 'When I missed her', category: 'Missing her', body, createdAt: now, updatedAt: now }] }))
    setSaved(true)
  }

  return (
    <div className="page">
      <PageHeader title="When I Miss Her" subtitle={step > 0 ? `Step ${step} of 4. Take your time.` : undefined} />

      {step === 0 && (
        <Card>
          <p className="lead">Hey, Ted. It's okay that you miss her. You don't need to make a decision about your entire future just because today feels difficult.</p>
          <Button onClick={() => setStep(1)}>Begin gently</Button>
        </Card>
      )}

      {step === 1 && (
        <Card title="What are you missing right now?">
          <fieldset className="plain"><legend className="sr-only">What are you missing</legend>
            {missing.map((m) => (
              <label key={m} className="choice"><input type="checkbox" checked={picked.includes(m)} onChange={() => toggle(m)} />{m}</label>
            ))}
          </fieldset>
        </Card>
      )}

      {step === 2 && (
        <Card title="What is the feeling telling you, and what are you assuming because of it?">
          <p>Feelings are real. The conclusions that come with them are not always facts.</p>
          <blockquote className="quote">Feeling: "I miss her." Assumption: "I'll never be happy with anyone else."</blockquote>
          <blockquote className="quote">Feeling: "I wish things had worked." Assumption: "The breakup proves I wasn't good enough."</blockquote>
          <label className="field">Your own words (optional)<textarea value={thought} onChange={(e) => setThought(e.target.value)} /></label>
          <p className="muted">Am I missing the person, the relationship as it actually was, or the future I imagined? There is no single right answer.</p>
        </Card>
      )}

      {step === 3 && (
        <Card title="Ground yourself, if you'd like">
          <p className="muted">Pick whatever feels doable. None of it is required.</p>
          <ul className="plain-list">{grounding.map((g) => <li key={g}>{g}</li>)}</ul>
        </Card>
      )}

      {step === 4 && (
        <Card title="What would help you most right now?">
          <fieldset className="plain"><legend className="sr-only">What would help</legend>
            {needs.map((n) => (
              <label key={n.id} className="choice"><input type="radio" name="need" checked={need === n.id} onChange={() => setNeed(n.id)} />{n.label}</label>
            ))}
          </fieldset>
          {chosen && (
            <div className="answer">
              <p className="reminder">{chosen.text}</p>
              {chosen.link && <Link to={chosen.link[0]} className="btn btn-quiet">{chosen.link[1]}</Link>}
            </div>
          )}
          <div className="row">
            <Button variant="quiet" onClick={saveToJournal} disabled={saved}>{saved ? 'Saved to your journal' : 'Save this to my journal'}</Button>
          </div>
        </Card>
      )}

      {step > 0 && (
        <div className="row">
          {step > 1 && <Button variant="quiet" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 4 && <Button onClick={() => setStep(step + 1)}>Next</Button>}
          <Link to="/" className="btn btn-quiet">Leave without saving</Link>
        </div>
      )}
    </div>
  )
}
