import { useAppData } from '../hooks/useAppData'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import DataTools from '../components/DataTools'

const themes = [
  { value: 'cream', label: 'Dawn (light)' },
  { value: 'dark', label: 'Midnight (dark)' },
  { value: 'system', label: 'Match my device' },
]

export default function Settings() {
  const { data, update } = useAppData()
  const s = data.settings

  // Change one setting and keep the rest.
  const setSetting = (key, value) => update((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }))

  return (
    <div className="page">
      <PageHeader title="Settings & Privacy" subtitle="Make the space feel like yours." />

      <Card title="Theme">
        <fieldset className="plain">
          <legend className="sr-only">Theme</legend>
          {themes.map((t) => (
            <label key={t.value} className="choice">
              <input type="radio" name="theme" value={t.value} checked={s.theme === t.value} onChange={() => setSetting('theme', t.value)} />
              {t.label}
            </label>
          ))}
        </fieldset>
      </Card>

      <Card title="Personal touches">
        <label className="field">Name shown on the home page
          <input type="text" value={s.displayName} maxLength={30} onChange={(e) => setSetting('displayName', e.target.value)} />
        </label>
        <label className="choice">
          <input type="checkbox" checked={s.dailyRemindersEnabled} onChange={(e) => setSetting('dailyRemindersEnabled', e.target.checked)} />
          Show a daily reminder on the home page
        </label>
        <label className="choice">
          <input type="checkbox" checked={s.animationsEnabled} onChange={(e) => setSetting('animationsEnabled', e.target.checked)} />
          Use gentle animations
        </label>
      </Card>

      <DataTools />

      <Card title="Where your data lives">
        <p>Everything you save stays in this browser on this device. Nothing is sent anywhere. It is not encrypted, so anyone who can open this browser profile could see it, and clearing browser data removes it.</p>
      </Card>
    </div>
  )
}
