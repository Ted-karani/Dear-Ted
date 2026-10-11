import { useEffect } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { useAppData } from './hooks/useAppData'
import { resolveTheme } from './utils/theme'
import { mainNav } from './data/navItems'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import CalmButton from './components/CalmButton'
import Home from './pages/Home'
import Settings from './pages/Settings'
import DearTed from './pages/DearTed'
import Journal from './pages/Journal'
import MissHer from './pages/MissHer'
import Faith from './pages/Faith'
import Journey from './pages/Journey'
import FutureMe from './pages/FutureMe'
import Letters from './pages/Letters'
import Memories from './pages/Memories'
import QuietMoments from './pages/QuietMoments'
import ComingSoon from './pages/ComingSoon'

// Applies the saved theme and animation choice to the whole page.
function ThemeApplier() {
  const { data } = useAppData()
  const { theme, animationsEnabled } = data.settings
  useEffect(() => {
    const root = document.documentElement
    const apply = () => { root.dataset.theme = resolveTheme(theme) }
    apply()
    root.dataset.motion = animationsEnabled ? 'on' : 'off'
    if (theme !== 'system') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme, animationsEnabled])
  return null
}

// The frame around every page: sidebar, mobile bar, and a warning if saving fails.
function Layout() {
  const { saveFailed } = useAppData()
  return (
    <div className="app">
      <ThemeApplier />
      <Sidebar />
      <MobileNav />
      <CalmButton />
      <main className="content">
        {saveFailed && (
          <p className="alert" role="alert">Your browser would not let us save. Recent changes may be lost when you close this page.</p>
        )}
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="settings" element={<Settings />} />
        <Route path="dear-ted" element={<DearTed />} />
        <Route path="journal" element={<Journal />} />
        <Route path="miss-her" element={<MissHer />} />
        <Route path="faith" element={<Faith />} />
        <Route path="journey" element={<Journey />} />
        <Route path="future-me" element={<FutureMe />} />
        <Route path="letters" element={<Letters />} />
        <Route path="memories" element={<Memories />} />
        <Route path="quiet" element={<QuietMoments />} />
        {mainNav.filter((n) => n.phase).map((n) => (
          <Route key={n.path} path={n.path.slice(1)} element={<ComingSoon title={n.label} blurb={n.blurb} phase={n.phase} />} />
        ))}
        <Route path="*" element={<ComingSoon title="Page not found" blurb="That page does not exist." phase="-" />} />
      </Route>
    </Routes>
  )
}
