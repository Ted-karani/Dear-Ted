import { NavLink } from 'react-router-dom'
import { Moon, Settings as SettingsIcon } from 'lucide-react'
import { mainNav } from '../data/navItems'
import ThemeToggle from './ThemeToggle'

// The list of links. NavLink adds the "active" class (and aria-current) on the current page.
export function NavList({ onNavigate }) {
  return (
    <ul className="nav">
      {mainNav.map(({ path, label, icon: Icon }) => (
        <li key={path}>
          <NavLink to={path} end={path === '/'} onClick={onNavigate} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function SidebarFooter({ onNavigate }) {
  return (
    <div className="sidebar-foot">
      <ThemeToggle />
      <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
        <SettingsIcon size={18} aria-hidden="true" />
        Settings & Privacy
      </NavLink>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main">
      <div className="brand"><Moon size={22} aria-hidden="true" /> Dear Ted</div>
      <nav aria-label="Pages"><NavList /></nav>
      <SidebarFooter />
    </aside>
  )
}
