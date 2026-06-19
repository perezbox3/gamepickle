/* gamepickle — Settings page */
function Settings({ linked, setLinked }){
  const genres = window.GP_GENRES;
  const [banned,setBanned] = useState(()=>new Set());
  const [session,setSession] = useState('mid');
  const [hideShelved,setHideShelved] = useState(true);
  const [includeUninstalled,setIncludeUninstalled] = useState(true);
  const [saved,setSaved] = useState(false);

  function toggleBan(g){
    setBanned(prev=>{ const n=new Set(prev); n.has(g)?n.delete(g):n.add(g); return n; });
  }
  function save(){ setSaved(true); setTimeout(()=>setSaved(false),1600); }

  const sessions = [
    {v:'fast',label:'< 30 min'},{v:'mid',label:'1–2 hours'},
    {v:'long',label:'All evening'},{v:'chill',label:'No clock'},
  ];

  return (
    <div className="container">
      <div className="page-head">
        <div className="mono-label">~/settings</div>
        <h1 className="page-title">Settings</h1>
        <div className="page-sub">Connect Steam, tune your picks, set defaults.</div>
      </div>

      <div className="settings">
        {/* Steam */}
        <div className="card set-card">
          <div className="sc-head"><h3>Steam account</h3></div>
          <p className="sc-desc">We read your owned games and playtime. We never post or modify anything.</p>
          <div className={"steam-link"+(linked?' linked':'')}>
            <div className="steam-ic"><Icon.steam/></div>
            <div className="sl-body">
              <div className="sl-title">{linked? 'Connected' : 'Not connected'}</div>
              <div className="sl-sub">{linked? 'steam: anthony_p · 24 games synced' : 'Link to pull your library'}</div>
            </div>
            {linked
              ? <button className="btn btn-outline btn-sm" onClick={()=>setLinked(false)}>Unlink</button>
              : <button className="btn btn-primary btn-sm" onClick={()=>setLinked(true)}><Icon.steam/> Link Steam</button>}
          </div>
          {linked && <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8,color:'var(--pickle-light)',fontFamily:'var(--font-mono)',fontSize:12}}>
            <Icon.check style={{width:14,height:14}}/> Last synced just now</div>}
        </div>

        {/* Genre bans */}
        <div className="card set-card">
          <div className="sc-head"><h3>Excluded genres</h3></div>
          <p className="sc-desc">Tap a genre to ban it. Banned genres never show up in picks or the FAFO button.</p>
          <div className="genre-chips">
            {genres.map(g=>(
              <button key={g} className={"gchip"+(banned.has(g)?' banned':'')} onClick={()=>toggleBan(g)}>
                {g}{banned.has(g) && <span className="x">✕</span>}
              </button>
            ))}
          </div>
          {banned.size>0 && <div style={{marginTop:14,fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-muted)'}}>
            {banned.size} genre{banned.size>1?'s':''} hidden from picks</div>}
        </div>

        {/* Defaults */}
        <div className="card set-card">
          <div className="sc-head"><h3>Picker defaults</h3></div>
          <p className="sc-desc">Pre-fill the picker so you can get to a recommendation faster.</p>

          <div className="set-row">
            <div>
              <div className="sr-label">Default session length</div>
              <div className="sr-hint">Used as the starting answer in the picker quiz.</div>
            </div>
            <div className="sessions">
              {sessions.map(s=>(
                <button key={s.v} className={session===s.v?'on':''} onClick={()=>setSession(s.v)}>{s.label}</button>
              ))}
            </div>
          </div>

          <div className="set-row">
            <div>
              <div className="sr-label">Include uninstalled games</div>
              <div className="sr-hint">Let picks suggest games you own but haven't downloaded.</div>
            </div>
            <button className={"toggle"+(includeUninstalled?' on':'')} onClick={()=>setIncludeUninstalled(v=>!v)} aria-label="toggle"/>
          </div>

          <div className="set-row">
            <div>
              <div className="sr-label">Hide shelved games</div>
              <div className="sr-hint">Games you've marked "done" stay out of recommendations.</div>
            </div>
            <button className={"toggle"+(hideShelved?' on':'')} onClick={()=>setHideShelved(v=>!v)} aria-label="toggle"/>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <button className="btn btn-primary" onClick={save}><Icon.check/> Save changes</button>
          {saved && <span className="fade-up" style={{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--pickle-light)'}}>✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}
window.Settings = Settings;
