/* gamepickle — Pick page (quiz + FAFO + results) */
function Pick({ go }){
  const QUIZ = window.GP_QUIZ;
  const games = window.GP_GAMES;
  const [phase,setPhase] = useState('quiz'); // quiz | reel | results
  const [step,setStep] = useState(0);
  const [answers,setAnswers] = useState({});
  const [results,setResults] = useState(null);
  const [randomMode,setRandomMode] = useState(false);
  const [reelGame,setReelGame] = useState(games[0]);
  const reelRef = useRef(null);

  function choose(qid, val){
    const next = { ...answers, [qid]:val };
    setAnswers(next);
    if(step < QUIZ.length-1){ setStep(step+1); }
    else { computeResults(next); }
  }

  function computeResults(ans){
    const scored = games.map(g=>({ game:g, ...window.GP_scoreGame(g, ans) }))
      .sort((a,b)=>b.score-a.score).slice(0,3);
    setResults(scored); setRandomMode(false); setPhase('results');
    window.scrollTo({top:0});
  }

  function fafo(){
    setRandomMode(true); setPhase('reel');
    let ticks = 0;
    const total = 22 + Math.floor(Math.random()*8);
    const iv = setInterval(()=>{
      ticks++;
      setReelGame(games[Math.floor(Math.random()*games.length)]);
      if(ticks>=total){
        clearInterval(iv);
        const pick = games[Math.floor(Math.random()*games.length)];
        const reasons = [
          "the dice have spoken. no take-backs.",
          "you asked the universe. this is the answer.",
          "stop overthinking it and go play this.",
          "random number generator says: yes, this one.",
          "the pickle has chosen. respect the pickle.",
        ];
        setResults([{ game:pick, reason:reasons[Math.floor(Math.random()*reasons.length)], score:0 }]);
        setReelGame(pick);
        setTimeout(()=>{ setPhase('results'); window.scrollTo({top:0}); }, 420);
      }
    }, 90);
  }

  function restart(){ setPhase('quiz'); setStep(0); setAnswers({}); setResults(null); setRandomMode(false); window.scrollTo({top:0}); }

  /* ---------- REEL ---------- */
  if(phase==='reel'){
    return (
      <div className="container">
        <div className="pick-wrap">
          <div className="results-head"><div className="mono-label">rolling the dice…</div>
            <h2>Finding you <span className="gold">something</span></h2></div>
          <div className="reel spinning" ref={reelRef}>
            <div className="reel-card">
              <CoverArt game={reelGame}/>
              <div className="reel-name">{reelGame.name}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- RESULTS ---------- */
  if(phase==='results' && results){
    const hero = results[0];
    const runners = results.slice(1);
    return (
      <div className="container">
        <div className="results">
          <div className="results-head fade-up">
            <div className="mono-label">{randomMode?'f*** around → found out':'your top picks'}</div>
            <h2>{randomMode? <>Go play <span className="gold">this</span>.</> : <>Tonight, play <span className="gold">these</span>.</>}</h2>
          </div>

          <div className="hero-pick fade-up">
            <div className="hp-art"><CoverArt game={hero.game}/></div>
            <div className="hp-body">
              <span className="hp-rank">{randomMode? <><Icon.shuffle/> random pick</> : <><Icon.star/> #1 pick</>}</span>
              <div className="hp-name">{hero.game.name}</div>
              <div className="hp-meta">
                <Badge kind="muted">{hero.game.genre}</Badge>
                <Badge kind="accent" icon={Icon.clock}>{fmtHours(hero.game.hours)} played</Badge>
                {hero.game.installed
                  ? <Badge kind="pickle" icon={Icon.check}>Installed</Badge>
                  : <Badge kind="muted">Not installed</Badge>}
              </div>
              <div className="hp-reason">{randomMode? <em>{hero.reason}</em> : <span className="hl">{hero.reason.charAt(0).toUpperCase()+hero.reason.slice(1)}.</span>}</div>
              <div className="hp-actions">
                <button className="btn btn-primary btn-lg"><Icon.zap/> {hero.game.installed?'Launch game':'Install & play'}</button>
                {randomMode
                  ? <button className="btn btn-pickle btn-lg" onClick={fafo}><Icon.shuffle/> Roll again</button>
                  : <button className="btn btn-outline btn-lg" onClick={restart}>Retake quiz</button>}
              </div>
            </div>
          </div>

          {!randomMode && runners.length>0 && (
            <div className="runners fade-up">
              {runners.map((r,i)=>(
                <div key={r.game.id} className="runner">
                  <div className="r-art" style={{background:r.game.coverBg}}>
                    <span className="cover-mark" style={{position:'absolute',bottom:-8,right:-2,fontSize:42,fontWeight:800,fontFamily:'var(--font-mono)',color:'rgba(255,255,255,0.1)'}}>{r.game.mark}</span>
                  </div>
                  <div className="r-body">
                    <div className="r-rank">#{i+2} pick</div>
                    <div className="r-name">{r.game.name}</div>
                    <div className="r-reason">{r.reason.charAt(0).toUpperCase()+r.reason.slice(1)}.</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="results-foot fade-up">
            <button className="btn btn-ghost" onClick={()=>go('library')}><Icon.library/> Back to library</button>
            {!randomMode && <button className="btn btn-outline" onClick={fafo}><Icon.shuffle/> Or just pick randomly</button>}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- QUIZ ---------- */
  const cur = QUIZ[step];
  const pct = (step/(QUIZ.length)) * 100;
  return (
    <div className="container">
      <div className="pick-wrap">
        <div className="pick-progress"><div className="fill" style={{width:pct+'%'}}/></div>
        <div className="pick-step-meta">
          {step>0
            ? <a className="back" onClick={()=>setStep(step-1)}><Icon.arrowLeft/> Back</a>
            : <a className="back" onClick={()=>go('library')}><Icon.arrowLeft/> Library</a>}
          <span>Question {step+1} / {QUIZ.length}</span>
        </div>

        <div className="fade-up" key={step}>
          <h2 className="pick-q">{cur.q}</h2>
          <p className="pick-q-sub">{cur.sub}</p>
          <div className="pick-options">
            {cur.options.map(o=>(
              <button key={o.v} className={"pick-opt"+(answers[cur.id]===o.v?' sel':'')}
                onClick={()=>choose(cur.id,o.v)}>
                <div className="o-main">
                  <div className="o-label">{o.label}</div>
                  <div className="o-sub">{o.sub}</div>
                </div>
                <span className="o-arrow"><Icon.chevron/></span>
              </button>
            ))}
          </div>
        </div>

        {step===0 && (
          <>
            <div className="fafo-or"><div className="rule"/>can't be bothered?<div className="rule"/></div>
            <div className="fafo">
              <div className="fafo-panel">
                <h3>F*** around &amp; find out</h3>
                <p>Skip the questions. We'll grab a random game from your library and you go play it. No thinking required.</p>
                <button className="fafo-btn" onClick={fafo}><Icon.shuffle/> Surprise me</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
window.Pick = Pick;
