import { Home, Mail, Library, Archive, Heart, BookOpen, Sun, Sprout, Hourglass, Music } from 'lucide-react'

// Every page in the sidebar. "phase" says when the real page gets built.
export const mainNav = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dear-ted', label: 'Dear Ted', icon: Mail },
  { path: '/letters', label: 'Letters & Our Story', icon: Library },
  { path: '/memories', label: 'Memory Archive', icon: Archive },
  { path: '/miss-her', label: 'When I Miss Her', icon: Heart },
  { path: '/journal', label: 'Private Journal', icon: BookOpen },
  { path: '/faith', label: 'Faith & Gratitude', icon: Sun },
  { path: '/journey', label: 'My Healing Journey', icon: Sprout },
  { path: '/future-me', label: 'Future Me', icon: Hourglass },
  { path: '/quiet', label: 'Music & Quiet Moments', icon: Music },
]
