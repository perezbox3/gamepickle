import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CoverArt, Badge, fmtHours } from '../components/GameCard'
import { QUIZ, scoreGame } from '../lib/games'
import { getAnonSteamId } from '../lib/auth'
import './Picker.css'

function IconChevron(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 6 6 6-6 6"/></svg>
}
function IconArrowLeft(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
}
function IconShuffle(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
}
function IconStar(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z"/></svg>
}
function IconZap(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>
}
function IconCheck(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>
}
function IconLibrary(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h4v14H3zM10 5h4v14h-4z"/><path d="m17 5 4 13-3.7 1.3L13.5 6z"/></svg>
}

const FAFO_REASONS = [
  "the dice have spoken. no take-backs.",
  "you asked the universe. this is the answer.",
  "stop overthinking it and go play this.",
  "random number generator says: yes, this one.",
  "the pickle has chosen. respect the pickle.",
]

function coverStyle(game) {
  if (game.cover_url) return { backgroundImage: `url(${game.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return { background: game.coverBg }
}

export default function Picker({ user }) {
  const navigate = useNavigate()
  const [games, setGames]   = useState([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase]   = useState('quiz')
  const [step, setStep]     = useState(0)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [randomMode, setRandomMode] = useState(false)
  const [reelGame, setReelGame] = useState(null)

  useEffect(() => {
    const anonId = !user?.steam_id ? getAnonSteamId() : null
    const url = user?.steam_id
      ? '/api/games.php'
      : anonId
        ? `/api/games.php?steam_id=${encodeURIComponent(anonId)}`
        : null

    if (!url) { setLoading(false); return }

    fetch(url)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGames(data) })
      .finally(() => setLoading(false))
  }, [user])

  function choose(qid, val) {
    const next = { ...answers, [qid]: val }
    setAnswers(next)
    if (step < QUIZ.length - 1) setStep(step + 1)
    else computeResults(next)
  }

  function computeResults(ans) {
    const scored = games
      .map(g => ({ game: g, ...scoreGame(g, ans) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
    setResults(scored); setRandomMode(false); setPhase('results')
    window.scrollTo({ top: 0 })
  }

  function fafo() {
    if (!games.length) return
    setRandomMode(true); setPhase('reel')
    const first = games[Math.floor(Math.random() * games.length)]
    setReelGame(first)
    let ticks = 0
    const total = 22 + Math.floor(Math.random() * 8)
    const iv = setInterval(() => {
      ticks++
      setReelGame(games[Math.floor(Math.random() * games.length)])
      if (ticks >= total) {
        clearInterval(iv)
        const pick   = games[Math.floor(Math.random() * games.length)]
        const reason = FAFO_REASONS[Math.floor(Math.random() * FAFO_REASONS.length)]
        setResults([{ game: pick, reason, score: 0 }])
        setReelGame(pick)
        setTimeout(() => { setPhase('results'); window.scrollTo({ top: 0 }) }, 420)
      }
    }, 90)
  }

  function restart() {
    setPhase('quiz'); setStep(0); setAnswers({}); setResults(null); setRandomMode(false)
    window.scrollTo({ top: 0 })
  }

  if (loading) {
    return (
      <div className="container">
        <div className="pick-wrap" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div className="mono-label">loading your library…</div>
        </div>
      </div>
    )
  }

  if (!games.length) {
    return (
      <div className="container">
        <div className="pick-wrap" style={{ textAlign: 'center', paddingTop: 60 }}>
          <h2>No games yet</h2>
          <p style={{ fontFamily: 'var(--font-ui)', marginBottom: 20 }}>Link your Steam account in Settings to use the picker.</p>
          <button className="btn btn-primary" onClick={() => navigate('/settings')}>Go to Settings</button>
        </div>
      </div>
    )
  }

  /* REEL */
  if (phase === 'reel' && reelGame) {
    return (
      <div className="container">
        <div className="pick-wrap">
          <div className="results-head">
            <div className="mono-label">rolling the dice…</div>
            <h2>Finding you <span className="gold">something</span></h2>
          </div>
          <div className="reel spinning">
            <div className="reel-card">
              <CoverArt game={reelGame} />
              <div className="reel-name">{reelGame.name}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* RESULTS */
  if (phase === 'results' && results) {
    const hero    = results[0]
    const runners = results.slice(1)
    return (
      <div className="container">
        <div className="results">
          <div className="results-head fade-up">
            <div className="mono-label">{randomMode ? 'f*** around → found out' : 'your top picks'}</div>
            <h2>{randomMode ? <>Go play <span className="gold">this</span>.</> : <>Tonight, play <span className="gold">these</span>.</>}</h2>
          </div>

          <div className="hero-pick fade-up">
            <div className="hp-art"><CoverArt game={hero.game} /></div>
            <div className="hp-body">
              <span className="hp-rank">
                {randomMode ? <><IconShuffle style={{ width: 15, height: 15 }} /> random pick</> : <><IconStar style={{ width: 15, height: 15 }} /> #1 pick</>}
              </span>
              <div className="hp-name">{hero.game.name}</div>
              <div className="hp-meta">
                {hero.game.genre && <Badge kind="muted">{hero.game.genre}</Badge>}
                <Badge kind="accent" icon={({ style }) => <span style={style}>⏱</span>}>{fmtHours(hero.game.hours)} played</Badge>
                {hero.game.recent && <Badge kind="pickle" icon={IconCheck}>Played recently</Badge>}
              </div>
              <div className="hp-reason">
                {randomMode
                  ? <em>{hero.reason}</em>
                  : <span className="hl">{hero.reason.charAt(0).toUpperCase() + hero.reason.slice(1)}.</span>}
              </div>
              <div className="hp-actions">
                <button className="btn btn-primary btn-lg">
                  <IconZap style={{ width: 17, height: 17 }} /> Launch game
                </button>
                {randomMode
                  ? <button className="btn btn-pickle btn-lg" onClick={fafo}><IconShuffle style={{ width: 17, height: 17 }} /> Roll again</button>
                  : <button className="btn btn-outline btn-lg" onClick={restart}>Retake quiz</button>}
              </div>
            </div>
          </div>

          {!randomMode && runners.length > 0 && (
            <div className="runners fade-up">
              {runners.map((r, i) => (
                <div key={r.game.id} className="runner">
                  <div className="r-art" style={coverStyle(r.game)}>
                    {!r.game.cover_url && <span style={{ position: 'absolute', bottom: -8, right: -2, fontSize: 42, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.1)' }}>{r.game.mark}</span>}
                  </div>
                  <div className="r-body">
                    <div className="r-rank">#{i + 2} pick</div>
                    <div className="r-name">{r.game.name}</div>
                    <div className="r-reason">{r.reason.charAt(0).toUpperCase() + r.reason.slice(1)}.</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="results-foot fade-up">
            <button className="btn btn-ghost" onClick={() => navigate('/library')}>
              <IconLibrary style={{ width: 17, height: 17 }} /> Back to library
            </button>
            {!randomMode && (
              <button className="btn btn-outline" onClick={fafo}>
                <IconShuffle style={{ width: 17, height: 17 }} /> Or just pick randomly
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* QUIZ */
  const cur = QUIZ[step]
  const pct = (step / QUIZ.length) * 100

  return (
    <div className="container">
      <div className="pick-wrap">
        <div className="pick-progress"><div className="fill" style={{ width: pct + '%' }} /></div>
        <div className="pick-step-meta">
          {step > 0
            ? <a className="back" onClick={() => setStep(step - 1)} style={{ cursor: 'pointer' }}><IconArrowLeft style={{ width: 15, height: 15 }} /> Back</a>
            : <a className="back" onClick={() => navigate('/library')} style={{ cursor: 'pointer' }}><IconArrowLeft style={{ width: 15, height: 15 }} /> Library</a>}
          <span>Question {step + 1} / {QUIZ.length}</span>
        </div>

        <div className="fade-up" key={step}>
          <h2 className="pick-q">{cur.q}</h2>
          <p className="pick-q-sub">{cur.sub}</p>
          <div className="pick-options">
            {cur.options.map(o => (
              <button key={o.v} className={`pick-opt${answers[cur.id] === o.v ? ' sel' : ''}`} onClick={() => choose(cur.id, o.v)}>
                <div className="o-main">
                  <div className="o-label">{o.label}</div>
                  <div className="o-sub">{o.sub}</div>
                </div>
                <span className="o-arrow"><IconChevron style={{ width: 20, height: 20 }} /></span>
              </button>
            ))}
          </div>
        </div>

        {step === 0 && (
          <>
            <div className="fafo-or"><div className="rule" /> can't be bothered? <div className="rule" /></div>
            <div className="fafo">
              <div className="fafo-panel">
                <h3>F*** around &amp; find out</h3>
                <p>Skip the questions. We'll grab a random game from your library and you go play it. No thinking required.</p>
                <button className="fafo-btn" onClick={fafo}><IconShuffle style={{ width: 22, height: 22 }} /> Surprise me</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
