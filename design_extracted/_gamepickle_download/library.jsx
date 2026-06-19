/* gamepickle — Library page */
function SkeletonCard(){
  return (
    <div className="game-card">
      <div className="skeleton" style={{aspectRatio:'1/1',borderRadius:'8px'}}/>
      <div className="game-card-body">
        <div className="skeleton" style={{height:13,width:'80%',margin:'4px 0'}}/>
        <div className="skeleton" style={{height:11,width:'55%'}}/>
      </div>
    </div>
  );
}

function Library({ go, linked }){
  const games = window.GP_GAMES;
  const [q,setQ] = useState('');
  const [filter,setFilter] = useState('all'); // all | installed
  const [syncing,setSyncing] = useState(true);

  useEffect(()=>{
    if(!linked){ setSyncing(false); return; }
    setSyncing(true);
    const t = setTimeout(()=>setSyncing(false), 1500);
    return ()=>clearTimeout(t);
  },[linked]);

  if(!linked){
    return (
      <div className="container">
        <div className="empty fade-up">
          <div className="empty-emoji">🎮</div>
          <h3>Your library's empty in here</h3>
          <p>Link your Steam account and gamepickle will pull every game you own — installed or not — into one view.</p>
          <button className="btn btn-primary btn-lg" onClick={()=>go('settings')}>
            <Icon.steam/> Link Steam account
          </button>
        </div>
      </div>
    );
  }

  const sorted = [...games].sort((a,b)=>b.hours-a.hours);
  const [top1,top2,top3] = sorted;

  const ql = q.trim().toLowerCase();
  const match = g => !ql || g.name.toLowerCase().includes(ql) || g.genre.toLowerCase().includes(ql);
  const pool = games.filter(g => match(g) && (filter==='all' || g.installed));
  const installed = pool.filter(g=>g.installed);
  const notInstalled = pool.filter(g=>!g.installed);

  const showHero = !ql && filter==='all';

  return (
    <div className="container">
      <div className="page-head">
        <div className="mono-label">~/steam/library</div>
        <h1 className="page-title">Your library</h1>
        <div className="page-sub">{games.length} games · {games.filter(g=>g.installed).length} installed · {Math.round(games.reduce((s,g)=>s+g.hours,0))}h logged</div>
      </div>

      <div className="lib-toolbar">
        <div className="lib-search">
          <Icon.search/>
          <input placeholder="Search games or genres…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div className="seg">
          <button className={filter==='all'?'on':''} onClick={()=>setFilter('all')}>All</button>
          <button className={filter==='installed'?'on':''} onClick={()=>setFilter('installed')}>Installed</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>go('pick')}><Icon.dice/> Pick for me</button>
      </div>

      {syncing ? (
        <>
          <div className="section-bar"><Icon.clock style={{width:15,height:15,color:'var(--accent)'}} className="spin"/>
            <h2>Syncing with Steam…</h2><div className="rule"/></div>
          <div className="game-grid">
            {Array.from({length:12}).map((_,i)=><SkeletonCard key={i}/>)}
          </div>
        </>
      ) : pool.length===0 ? (
        <div className="empty fade-up">
          <div className="empty-emoji">🥒</div>
          <h3>Nothing matches "{q}"</h3>
          <p>No games in your library fit that search. Try a different name or genre.</p>
          <button className="btn btn-outline" onClick={()=>{setQ('');setFilter('all');}}>Clear filters</button>
        </div>
      ) : (
        <div className="fade-up">
          {showHero && (
            <>
              <div className="section-bar"><Icon.star style={{width:15,height:15,color:'var(--accent)'}}/>
                <h2>Most played</h2><div className="rule"/></div>
              <div className="lib-hero">
                <div className="lib-hero-main" onClick={()=>go('pick')}>
                  <div className="bg" style={{background:top1.coverBg}}/>
                  <div className="scrim"/>
                  <span className="mk">{top1.mark}</span>
                  <div className="lib-hero-content">
                    <div className="tag">#1 · most hours</div>
                    <h3>{top1.name}</h3>
                    <div className="row">
                      <Badge kind="accent" icon={Icon.clock}>{fmtHours(top1.hours)}</Badge>
                      <Badge kind="muted">{top1.genre}</Badge>
                      {top1.installed && <Badge kind="pickle" icon={Icon.check}>Installed</Badge>}
                    </div>
                  </div>
                </div>
                <div className="lib-hero-side">
                  {[top2,top3].map((g,i)=>(
                    <div key={g.id} className="lib-hero-mini" onClick={()=>go('pick')}>
                      <div className="thumb" style={{background:g.coverBg}}>
                        <span className="cover-mark" style={{position:'absolute',bottom:-8,right:-2,fontSize:34,fontWeight:800,fontFamily:'var(--font-mono)',color:'rgba(255,255,255,0.1)'}}>{g.mark}</span>
                      </div>
                      <div className="info">
                        <div className="nm">{g.name}</div>
                        <div className="mt">{g.genre} · {fmtHours(g.hours)}</div>
                      </div>
                      <div className="pos">#{i+2}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {filter==='all' && installed.length>0 && (
            <>
              <div className="section-bar"><span className="installed-dot" style={{position:'static',boxShadow:'0 0 10px var(--pickle-glow)'}}/>
                <h2>Installed</h2><span className="count">{installed.length}</span><div className="rule"/></div>
              <div className="game-grid">
                {installed.map(g=><GameCard key={g.id} game={g}/>)}
              </div>
            </>
          )}

          {filter==='all' && notInstalled.length>0 && (
            <>
              <div className="section-bar"><h2>Not installed</h2><span className="count">{notInstalled.length}</span><div className="rule"/></div>
              <div className="game-grid">
                {notInstalled.map(g=><GameCard key={g.id} game={g}/>)}
              </div>
            </>
          )}

          {filter==='installed' && (
            <>
              <div className="section-bar"><h2>Installed games</h2><span className="count">{installed.length}</span><div className="rule"/></div>
              <div className="game-grid">
                {installed.map(g=><GameCard key={g.id} game={g}/>)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
window.Library = Library;
