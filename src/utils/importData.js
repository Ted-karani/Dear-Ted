import { defaultData } from './storage'

// Checks a backup file before it is allowed anywhere near the real data.
// Returns { ok: true, data, summary } or { ok: false, error }.
export function parseBackup(text) {
  let parsed
  try { parsed = JSON.parse(text) } catch { return { ok: false, error: 'That file is not valid JSON, so it cannot be a Dear Ted backup.' } }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ok: false, error: 'That file does not look like a Dear Ted backup.' }
  if (typeof parsed.version !== 'number' || parsed.version > 1) return { ok: false, error: 'This backup comes from a newer or unknown version of the app.' }
  const base = defaultData()
  for (const key of Object.keys(base)) {
    if (Array.isArray(base[key]) && key in parsed && !Array.isArray(parsed[key])) return { ok: false, error: `The "${key}" section of this backup is damaged.` }
  }
  if (parsed.settings && typeof parsed.settings !== 'object') return { ok: false, error: 'The settings in this backup are damaged.' }
  const data = { ...base, ...parsed, settings: { ...base.settings, ...parsed.settings } }
  const count = (k) => (data[k] || []).length
  return { ok: true, data, summary: { journal: count('journalEntries'), moods: count('moodEntries'), gratitude: count('gratitudeEntries'), prayers: count('prayers'), futureLetters: count('futureLetters'), memories: count('memories') } }
}
