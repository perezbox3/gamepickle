import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CoverArt, Badge, fmtHours } from '../components/GameCard'
import { QUIZ, scoreGame, pickGames, recordPick, isLikelyGame } from '../lib/games'
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
function IconExternalLink(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
}
function IconGlobe(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
}

const FAFO_REASONS = [
  "the dice have spoken. no take-backs.",
  "you asked the universe. this is the answer.",
  "stop overthinking it and go play this.",
  "random number generator says: yes, this one.",
  "the pickle has chosen. respect the pickle.",
  "fate has a sense of humour. roll with it.",
  "your cursor hesitated. the universe did not.",
]

const FAFO_GLOBAL_REASONS = [
  "you don't own this. that's just a sale away from being fixed.",
  "50 million people have opinions about this game. now you will too.",
  "steamspy's top 1000. the pickle reached further than usual.",
  "the internet collectively agrees this is worth playing.",
  "you haven't tried this. that ends today.",
  "chosen from the most-played games on earth. no pressure.",
  "steam has spoken. your wallet will understand.",
]

function coverStyle(game) {
  if (game.cover_url) return { backgroundImage: `url(${game.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return { background: game.coverBg }
}

function trimDesc(text, max = 220) {
  if (!text || text.length <= max) return text
  return text.slice(0, max).replace(/\s\S*$/, '') + '…'
}

function PickDetail({ detail, loading, onViewDetail }) {
  if (loading) {
    return (
      <div className="pick-detail-loading">
        <div className="skeleton" style={{ height: 88, borderRadius: 10 }} />
      </div>
    )
  }
  if (!detail) return null
  return (
    <div className="pick-detail fade-up">
      {detail.screenshots?.[0] && (
        <img src={detail.screenshots[0]} alt="" className="pd-screenshot" />
      )}
      <div className="pd-body">
        {detail.description && (
          <p className="pd-desc">{trimDesc(detail.description)}</p>
        )}
        <div className="pd-meta">
          {detail.metacritic && (
            <span className="pd-mc">MC {detail.metacritic}</span>
          )}
          {detail.genres?.slice(0, 4).map(g => (
            <span key={g} className="pd-tag">{g}</span>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" onClick={onViewDetail}>
          <IconExternalLink style={{ width: 14, height: 14 }} /> Full details
        </button>
      </div>
    </div>
  )
}

export default function Picker({ user }) {
  const navigate = useNavigate()
  const [games, setGames]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [phase, setPhase]           = useState('quiz')
  const [step, setStep]             = useState(0)
  const [answers, setAnswers]       = useState({})
  const [results, setResults]       = useState(null)
  const [randomMode, setRandomMode] = useState(false)
  const [globalMode, setGlobalMode] = useState(false)
  const [reelGame, setReelGame]     = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [globalError, setGlobalError]     = useState('')

  // Persisted settings: genre bans + default session
  const [bannedGenres, setBannedGenres]     = useState([])
  const [defaultSession, setDefaultSession] = useState(null)

  // Load settings once on mount for authenticated users
  useEffect(() => {
    if (!user) return
    fetch('/api/settings.php')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.genre_bans)) setBannedGenres(data.genre_bans)
        if (data.default_session)           setDefaultSession(data.default_session)
      })
      .catch(() => {})
  }, [user])

  // Pre-fill the time quiz answer with the saved default once settings load
  useEffect(() => {
    if (defaultSession && phase === 'quiz' && !answers.time) {
      setAnswers(prev => ({ ...prev, time: defaultSession }))
    }
  }, [defaultSession])

  // Eligible pool: non-games and banned genres removed
  const eligible = useMemo(() => {
    const bannedSet = new Set(bannedGenres.map(g => g.toLowerCase()))
    return games.filter(g =>
      isLikelyGame(g) && !(g.genre && bannedSet.has(g.genre.toLowerCase()))
    )
  }, [games, bannedGenres])

  useEffect(() => {
    const url = user?.steam_id ? '/api/games.php' : null
    if (!url) { setLoading(false); return }

    fetch(url)
      .then(r => r.json())
      .then(data => { setGames(Array.isArray(data) ? data : (data.games || [])) })
      .finally(() => setLoading(false))
  }, [user])

  function fetchDetail(appId) {
    if (!appId) return
    setDetailData(null)
    setDetailLoading(true)
    fetch(`/api/game.php?app_id=${appId}`)
      .then(r => r.json())
      .then(d => setDetailData(d.error ? null : d))
      .catch(() => setDetailData(null))
      .finally(() => setDetailLoading(false))
  }

  function choose(qid, val) {
    const next = { ...answers, [qid]: val }
    setAnswers(next)
    if (step < QUIZ.length - 1) setStep(step + 1)
    else computeResults(next)
  }

  function computeResults(ans) {
    const picks = pickGames(games, ans, 3, bannedGenres)
    if (picks.length === 0) {
      // All eligible games were filtered out (too few games, heavy genre bans, etc.)
      setResults([])
      setRandomMode(false)
      setGlobalMode(false)
      setPhase('results')
      window.scrollTo({ top: 0 })
      return
    }
    setResults(picks)
    setRandomMode(false)
    setGlobalMode(false)
    setPhase('results')
    window.scrollTo({ top: 0 })
    if (picks[0]?.game?.app_id) {
      recordPick(picks[0].game.app_id)
      fetchDetail(picks[0].game.app_id)
    }
  }

  function fafo() {
    if (!eligible.length) return
    setRandomMode(true)
    setGlobalMode(false)
    setPhase('reel')
    setDetailData(null)
    setDetailLoading(false)

    const first = eligible[Math.floor(Math.random() * eligible.length)]
    setReelGame(first)
    let ticks = 0
    const total = 22 + Math.floor(Math.random() * 8)
    const iv = setInterval(() => {
      ticks++
      setReelGame(eligible[Math.floor(Math.random() * eligible.length)])
      if (ticks >= total) {
        clearInterval(iv)
        const pick   = eligible[Math.floor(Math.random() * eligible.length)]
        const reason = FAFO_REASONS[Math.floor(Math.random() * FAFO_REASONS.length)]
        setResults([{ game: pick, reason, score: 0 }])
        setReelGame(pick)
        setTimeout(() => {
          setPhase('results')
          window.scrollTo({ top: 0 })
          if (pick.app_id) {
            recordPick(pick.app_id)
            fetchDetail(pick.app_id)
          }
        }, 420)
      }
    }, 90)
  }

  async function globalFafo() {
    setGlobalError('')
    setPhase('global-loading')
    setDetailData(null)
    setDetailLoading(false)
    try {
      const banned  = bannedGenres.length ? `?banned=${encodeURIComponent(bannedGenres.join(','))}` : ''
      const res  = await fetch(`/api/steam/fafo-global.php${banned}`)
      const data = await res.json()
      if (data.error) {
        setGlobalError(data.error)
        setPhase('quiz')
        return
      }
      const game = {
        id:             String(data.app_id),
        app_id:         data.app_id,
        name:           data.name,
        cover_url:      data.cover_url,
        genre:          data.genres?.[0] || null,
        hours:          0,
        recent:         false,
        installed:      false,
      }
      const reason = FAFO_GLOBAL_REASONS[Math.floor(Math.random() * FAFO_GLOBAL_REASONS.length)]
      setResults([{ game, score: 0, reason, owners: data.owners, ccu: data.ccu }])
      setDetailData({
        description: data.description,
        genres:      data.genres,
        screenshots: data.screenshots,
        metacritic:  data.metacritic,
        steam_url:   data.steam_url,
      })
      setRandomMode(true)
      setGlobalMode(true)
      setPhase('results')
      window.scrollTo({ top: 0 })
      recordPick(data.app_id)
    } catch {
      setGlobalError('Something went wrong. Roll again.')
      setPhase('quiz')
    }
  }

  function restart() {
    setPhase('quiz'); setStep(0); setResults(null)
    setRandomMode(false); setGlobalMode(false)
    setDetailData(null); setDetailLoading(false); setGlobalError('')
    // Re-apply default session when restarting quiz
    setAnswers(defaultSession ? { time: defaultSession } : {})
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

  /* GLOBAL FAFO LOADING */
  if (phase === 'global-loading') {
    return (
      <div className="container">
        <div className="pick-wrap">
          <div className="results-head">
            <div className="mono-label">reaching into all of steam…</div>
            <h2>Finding you <span className="gold">something</span></h2>
          </div>
          <div className="global-loading-card">
            <div className="gl-spinner" />
            <div className="gl-steps">
              <div className="gl-step">Fetching SteamSpy top 1000…</div>
              <div className="gl-step gl-step-dim">Filtering your library…</div>
              <div className="gl-step gl-step-dim">Picking your game…</div>
            </div>
          </div>
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

  /* RESULTS — empty pool */
  if (phase === 'results' && results && results.length === 0) {
    return (
      <div className="container">
        <div className="pick-wrap">
          <div className="results-head fade-up">
            <div className="mono-label">no matches</div>
            <h2>Nothing left in the <span className="gold">jar</span></h2>
          </div>
          <div className="card" style={{ padding: 24, maxWidth: 480 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, marginBottom: 16 }}>
              Your genre bans and quiz answers filtered out everything. Try removing some genre bans in Settings, or hit FAFO to pick anything.
            </p>
            <button className="btn btn-outline" onClick={() => { setPhase('quiz'); setStep(0); setResults(null) }}>
              Try again
            </button>
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
            <div className="mono-label">
              {globalMode ? '🌍 from all of steam' : randomMode ? 'f*** around → found out' : 'your top picks'}
            </div>
            <h2>
              {globalMode
                ? <>Steam says: play <span className="gold">this</span>.</>
                : randomMode
                  ? <>Go play <span className="gold">this</span>.</>
                  : <>Tonight, play <span className="gold">these</span>.</>}
            </h2>
          </div>

          <div className="hero-pick fade-up">
            <div className="hp-art"><CoverArt game={hero.game} /></div>
            <div className="hp-body">
              <span className="hp-rank">
                {globalMode
                  ? <><IconGlobe style={{ width: 15, height: 15 }} /> all of steam</>
                  : randomMode
                    ? <><IconShuffle style={{ width: 15, height: 15 }} /> random pick</>
                    : <><IconStar style={{ width: 15, height: 15 }} /> #1 pick</>}
              </span>
              <div className="hp-name">{hero.game.name}</div>
              <div className="hp-meta">
                {hero.game.genre && <Badge kind="muted">{hero.game.genre}</Badge>}
                {globalMode
                  ? <Badge kind="muted"><IconGlobe style={{ width: 11, height: 11 }} /> you don't own this</Badge>
                  : <Badge kind="accent" icon={({ style }) => <span style={style}>⏱</span>}>{fmtHours(hero.game.hours)} played</Badge>}
                {hero.game.recent && <Badge kind="pickle" icon={IconCheck}>Played recently</Badge>}
              </div>
              {globalMode && hero.owners && (
                <div className="hp-owners">{hero.owners} owners on Steam</div>
              )}
              <div className="hp-reason">
                <em>{hero.reason}</em>
              </div>
              <div className="hp-actions">
                <button className="btn btn-primary btn-lg" onClick={() => navigate(`/game/${hero.game.app_id}`, { state: { game: hero.game, from: '/pick' } })}>
                  <IconZap style={{ width: 17, height: 17 }} /> {globalMode ? 'Check it out' : 'Go play it'}
                </button>
                {globalMode
                  ? <button className="btn btn-outline btn-lg" onClick={globalFafo}><IconGlobe style={{ width: 17, height: 17 }} /> Roll again</button>
                  : randomMode
                    ? <button className="btn btn-pickle btn-lg" onClick={fafo}><IconShuffle style={{ width: 17, height: 17 }} /> Roll again</button>
                    : <button className="btn btn-outline btn-lg" onClick={restart}>Retake quiz</button>}
              </div>
            </div>
          </div>

          {/* Rich store detail */}
          <PickDetail
            detail={detailData}
            loading={detailLoading}
            onViewDetail={() => navigate(`/game/${hero.game.app_id}`, { state: { game: hero.game, from: '/pick' } })}
          />

          {!randomMode && !globalMode && runners.length > 0 && (
            <div className="runners fade-up">
              {runners.map((r, i) => (
                <div
                  key={r.game.id}
                  className="runner"
                  onClick={() => r.game.app_id && navigate(`/game/${r.game.app_id}`, { state: { game: r.game, from: '/pick' } })}
                  style={r.game.app_id ? { cursor: 'pointer' } : {}}
                >
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
            {!randomMode && !globalMode && (
              <button className="btn btn-outline" onClick={fafo}>
                <IconShuffle style={{ width: 17, height: 17 }} /> Or just pick randomly
              </button>
            )}
            {!globalMode && (
              <button className="btn btn-outline" onClick={globalFafo}>
                <IconGlobe style={{ width: 17, height: 17 }} /> From all of Steam
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
                <div className="fafo-btns">
                  <button className="fafo-btn" onClick={fafo}>
                    <IconShuffle style={{ width: 20, height: 20 }} /> My library
                  </button>
                  <button className="fafo-btn fafo-btn-global" onClick={globalFafo}>
                    <IconGlobe style={{ width: 20, height: 20 }} /> All of Steam
                  </button>
                </div>
                {globalError && <div className="fafo-error">{globalError}</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
