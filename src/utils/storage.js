// All reading and writing of saved data happens in this one file.
export const STORAGE_KEY = 'dearTed:v1'

// The starting shape of everything the app saves. "version" lets us upgrade old data later.
export const defaultData = () => ({
  version: 1,
  settings: { theme: 'cream', displayName: 'Ted', dailyRemindersEnabled: true, animationsEnabled: true },
  letters: [], memories: [], journalEntries: [], moodEntries: [], gratitudeEntries: [],
  prayers: [], milestones: [], goals: [], futureLetters: [], favoriteReminders: [], dailyIntentions: [],
})

// Load saved data. If it is missing or broken, fall back to the defaults instead of crashing.
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const saved = JSON.parse(raw)
    const base = defaultData()
    return { ...base, ...saved, settings: { ...base.settings, ...saved.settings } }
  } catch {
    return defaultData()
  }
}

// Save data. Returns true if it worked and false if the browser refused (full or blocked storage).
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
