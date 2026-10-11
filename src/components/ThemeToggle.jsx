import { Moon, Sun } from 'lucide-react'
import { useAppData } from '../hooks/useAppData'
import { resolveTheme } from '../utils/theme'

// Flips between the cream and dark themes and remembers the choice.
export default function ThemeToggle() {
  const { data, update } = useAppData()
  const isDark = resolveTheme(data.settings.theme) === 'dark'
  const flip = () => update((prev) => ({ ...prev, settings: { ...prev.settings, theme: isDark ? 'cream' : 'dark' } }))
  return (
    <button className="nav-button" onClick={flip}>
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      {isDark ? 'Switch to dawn theme' : 'Switch to midnight theme'}
    </button>
  )
}
