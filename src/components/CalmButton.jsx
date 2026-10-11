import { useEffect, useState } from 'react'
import { Wind } from 'lucide-react'
import { reminders } from '../data/reminders'
import Button from './Button'

const actions = ['Drink a glass of water.', 'Put your phone down for ten minutes.', 'Step outside for a minute.', 'Message someone you trust.', 'Stretch your shoulders and jaw.', 'Eat something small.']
const rand = (list) => list[Math.floor(Math.random() * list.length)]

// A floating button that opens a calm full-screen pause: one line, one slow breath, one small action.
export default function CalmButton() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState('in')
  const [pick, setPick] = useState({ line: '', action: '' })

  const show = () => { setPick({ line: rand(reminders), action: rand(actions) }); setOpen(true) }

  // Breathing rhythm while open: 4 seconds in, 6 seconds out. Escape closes.
  useEffect(() => {
    if (!open) return
    let inhale = true, timer
    const tick = () => { setPhase(inhale ? 'in' : 'out'); timer = setTimeout(tick, inhale ? 4000 : 6000); inhale = !inhale }
    tick()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(timer); window.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <>
      <button className="calm-fab" onClick={show} aria-label="I need a moment"><Wind size={20} aria-hidden="true" /><span>I need a moment</span></button>
      {open && (
        <div className="calm" role="dialog" aria-modal="true" aria-label="A calm moment">
          <p className="calm-line">{pick.line}</p>
          <div className={`breath ${phase}`} aria-hidden="true" />
          <p className="reminder center" role="status">{phase === 'in' ? 'Breathe in' : 'Breathe out'}</p>
          <p className="muted center">{pick.action}</p>
          <div className="row center-row">
            <Button variant="quiet" onClick={show}>Another</Button>
            <Button onClick={() => setOpen(false)}>I'm okay for now</Button>
          </div>
        </div>
      )}
    </>
  )
}
