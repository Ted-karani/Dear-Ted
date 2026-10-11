import { Heart, Mail, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../hooks/useAppData'
import { reminders } from '../data/reminders'
import { friendlyDate, dayOfYear } from '../utils/dates'
import Card from '../components/Card'
import Button from '../components/Button'
import MoodCheckIn from '../components/MoodCheckIn'
import HomeExtras from '../components/HomeExtras'

export default function Home() {
  const { data, update } = useAppData()
  const name = data.settings.displayName.trim() || 'Ted'

  // Same reminder all day: the day number picks a line from the list.
  const reminder = reminders[dayOfYear() % reminders.length]
  const isFavourite = data.favoriteReminders.includes(reminder)

  const toggleFavourite = () =>
    update((prev) => ({
      ...prev,
      favoriteReminders: isFavourite
        ? prev.favoriteReminders.filter((r) => r !== reminder)
        : [...prev.favoriteReminders, reminder],
    }))

  return (
    <div className="page">
      <p className="muted">{friendlyDate()}</p>
      <h1 className="hero">Hey, {name}.</h1>
      <p className="lead">Take a breath. You don't have to figure everything out today.</p>

      {data.settings.dailyRemindersEnabled && (
        <Card title="Today's reminder">
          <p className="reminder">{reminder}</p>
          <Button variant="quiet" onClick={toggleFavourite} aria-pressed={isFavourite}>
            <Heart size={16} aria-hidden="true" fill={isFavourite ? 'currentColor' : 'none'} />
            {isFavourite ? 'Saved to favourites' : 'Save to favourites'}
          </Button>
        </Card>
      )}

      <MoodCheckIn />
      <HomeExtras />

      <div className="quick">
        <Link to="/miss-her" className="quick-card"><Heart size={22} aria-hidden="true" /><span>I'm missing her</span></Link>
        <Link to="/dear-ted" className="quick-card"><Mail size={22} aria-hidden="true" /><span>Read my letter</span></Link>
        <Link to="/journal" className="quick-card"><BookOpen size={22} aria-hidden="true" /><span>Write in my journal</span></Link>
      </div>

      <p className="muted tagline">A little space to heal, remember, and become.</p>
    </div>
  )
}
