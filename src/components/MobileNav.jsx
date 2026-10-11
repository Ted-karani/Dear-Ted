import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, Moon, X, Home, BookOpen, Heart, Mail } from 'lucide-react'
import { NavList, SidebarFooter } from './Sidebar'

const tabs = [{ to: '/', label: 'Home', icon: Home }, { to: '/journal', label: 'Journal', icon: BookOpen }, { to: '/miss-her', label: 'Miss her', icon: Heart }, { to: '/dear-ted', label: 'Letter', icon: Mail }]

// On phones: a small top bar, a bottom tab bar for the pages you use most, and a full menu.
export default function MobileNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="mobile-header">
        <span className="brand"><Moon size={20} aria-hidden="true" /> Dear Ted</span>
        <button className="icon-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={22} aria-hidden="true" /></button>
      </header>
      <nav className="bottom-bar" aria-label="Quick pages">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}><Icon size={20} aria-hidden="true" />{label}</NavLink>
        ))}
        <button onClick={() => setOpen(true)}><Menu size={20} aria-hidden="true" />More</button>
      </nav>
      {open && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}><X size={22} aria-hidden="true" /></button>
          <nav aria-label="Pages"><NavList onNavigate={() => setOpen(false)} /></nav>
          <SidebarFooter onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
