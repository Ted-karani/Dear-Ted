import { useEffect, useRef, useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'

const sounds = [{ id: 'rain', label: 'Rain' }, { id: 'ocean', label: 'Ocean waves' }]

// Turns a normal Spotify link into the address Spotify uses for embedded players. Only open.spotify.com links are accepted.
const parseSpotify = (url) => {
  const m = url.trim().match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album|episode|show)\/([A-Za-z0-9]+)/)
  return m ? { src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, tall: m[1] === 'playlist' || m[1] === 'album' || m[1] === 'show' } : null
}

export default function QuietMoments() {
  const { data, update } = useAppData()
  const volume = data.settings.volume ?? 0.5
  const [playing, setPlaying] = useState(null)      // which generated sound is really playing
  const [error, setError] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [breathing, setBreathing] = useState(false)
  const [phase, setPhase] = useState('out')
  const engine = useRef({ ctx: null, master: null, stop: null })
  const audioRef = useRef(null)
  const [spotifyInput, setSpotifyInput] = useState(data.settings.spotifyUrl || '')
  const [spotifyError, setSpotifyError] = useState('')
  const spotify = parseSpotify(data.settings.spotifyUrl || '')
  const saveSpotify = (value) => {
    if (value && !parseSpotify(value)) { setSpotifyError('Paste a link from Spotify, like https://open.spotify.com/playlist/...'); return }
    setSpotifyError('')
    update((prev) => ({ ...prev, settings: { ...prev.settings, spotifyUrl: value.trim() } }))
    if (!value) setSpotifyInput('')
  }

  // Sounds are made by the browser itself, so no internet is needed. Nothing ever starts on its own.
  const stopSound = () => { engine.current.stop?.(); engine.current.stop = null; setPlaying(null) }
  const startSound = async (id) => {
    stopSound(); setError('')
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      const e = engine.current
      e.ctx = e.ctx || new Ctx()
      await e.ctx.resume()
      const ctx = e.ctx
      const master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination)
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const samples = buffer.getChannelData(0)
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
      const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = id === 'rain' ? 7000 : 450
      const level = ctx.createGain(); level.gain.value = id === 'rain' ? 0.5 : 0.55
      source.connect(filter); filter.connect(level); level.connect(master)
      let wave = null
      if (id === 'ocean') {                                  // a slow swell makes it sound like waves
        wave = ctx.createOscillator(); wave.frequency.value = 0.12
        const depth = ctx.createGain(); depth.gain.value = 0.35
        wave.connect(depth); depth.connect(level.gain); wave.start()
      }
      source.start()
      e.master = master
      e.stop = () => { try { source.stop(); wave?.stop() } catch { /* already stopped */ } master.disconnect() }
      setPlaying(id)
    } catch {
      setError('Your browser could not start this sound. Quiet mode is always available.')
    }
  }

  const changeVolume = (v) => {
    update((prev) => ({ ...prev, settings: { ...prev.settings, volume: v } }))
    if (engine.current.master) engine.current.master.gain.value = v
    if (audioRef.current) audioRef.current.volume = v
  }
  const chooseFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    stopSound(); setFileUrl(URL.createObjectURL(file))
  }
  const quiet = () => { stopSound(); audioRef.current?.pause() }

  // Stop everything when leaving the page
  useEffect(() => () => engine.current.stop?.(), [])
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [fileUrl, volume])

  // Breathing: in for 4 seconds, out for 6. No holding your breath.
  useEffect(() => {
    if (!breathing) return
    let inhale = true, timer
    const tick = () => { setPhase(inhale ? 'in' : 'out'); timer = setTimeout(tick, inhale ? 4000 : 6000); inhale = !inhale }
    tick()
    return () => clearTimeout(timer)
  }, [breathing])

  return (
    <div className="page">
      <PageHeader title="Music & Quiet Moments" subtitle="You don't need to think your way through everything right now. You can simply give yourself a quiet moment." />

      <Card title="Sounds">
        <p className="muted small">These sounds are made by your browser, so no internet is needed. Nothing plays until you press play.</p>
        <div className="row">
          {sounds.map((s) => (
            <Button key={s.id} variant={playing === s.id ? 'primary' : 'quiet'} aria-pressed={playing === s.id} onClick={() => (playing === s.id ? stopSound() : startSound(s.id))}>
              {playing === s.id ? `Pause ${s.label.toLowerCase()}` : `Play ${s.label.toLowerCase()}`}
            </Button>
          ))}
          <Button variant="quiet" onClick={quiet}>Quiet mode (no sound)</Button>
        </div>
        <label className="field">Volume
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => changeVolume(Number(e.target.value))} />
        </label>
        {error && <p className="alert" role="alert">{error}</p>}
        {playing && <p role="status" className="muted">Playing: {sounds.find((s) => s.id === playing).label}</p>}
      </Card>

      <Card title="My Spotify">
        <p className="muted small">In Spotify, choose Share, then Copy link, and paste it here. Spotify loads from its own servers, so this needs internet. It never plays until you press play.</p>
        <label className="field">Spotify link<input type="text" value={spotifyInput} onChange={(e) => setSpotifyInput(e.target.value)} placeholder="https://open.spotify.com/playlist/..." /></label>
        {spotifyError && <p className="alert" role="alert">{spotifyError}</p>}
        <div className="row"><Button variant="quiet" onClick={() => saveSpotify(spotifyInput)}>Save link</Button>{spotify && <Button variant="quiet" onClick={() => saveSpotify('')}>Remove</Button>}</div>
        {spotify && <iframe className="spotify" title="Spotify player" src={spotify.src} height={spotify.tall ? 352 : 152} loading="lazy" allow="encrypted-media" />}
        {spotify && <p className="small"><a href={data.settings.spotifyUrl} target="_blank" rel="noreferrer">Open in Spotify</a></p>}
      </Card>

      <Card title="Your own music">
        <p className="muted small">Choose a song or calm track from your device. It stays on your device and is not uploaded.</p>
        <label className="field">Audio file<input type="file" accept="audio/*" onChange={chooseFile} /></label>
        {fileUrl
          ? <audio ref={audioRef} src={fileUrl} controls onError={() => setError('That audio file could not be played.')} />
          : <p className="muted">No file chosen yet.</p>}
      </Card>

      <Card title="A slow breath">
        <p className="muted small">Breathe in gently, then out a little longer. Stop whenever you like.</p>
        <div className={`breath ${breathing ? phase : ''}`} aria-hidden="true" />
        <p className="reminder center" role="status">{breathing ? (phase === 'in' ? 'Breathe in' : 'Breathe out') : 'Ready when you are'}</p>
        <Button variant="quiet" onClick={() => setBreathing(!breathing)}>{breathing ? 'Stop' : 'Start'}</Button>
      </Card>
    </div>
  )
}
