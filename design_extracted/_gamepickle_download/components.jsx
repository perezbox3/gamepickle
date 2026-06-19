/* gamepickle — shared components */
const { useState, useEffect, useRef } = React;

/* ---------- lucide-style icons ---------- */
const Icon = {
  library:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h4v14H3zM10 5h4v14h-4z"/><path d="m17 5 4 13-3.7 1.3L13.5 6z"/></svg>,
  dice:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/></svg>,
  settings:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>,
  search:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  shuffle:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>,
  zap:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>,
  star:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z"/></svg>,
  clock:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  chevron:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 6 6 6-6 6"/></svg>,
  check:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>,
  steam:(p)=> <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M11.98 2C6.65 2 2.28 6.13 2 11.4l5.37 2.22a2.86 2.86 0 0 1 1.62-.5l2.39-3.46v-.05a3.8 3.8 0 1 1 3.8 3.8h-.09l-3.41 2.43a2.86 2.86 0 0 1-5.7.2l-3.84-1.6A10 10 0 1 0 11.98 2zM8.5 17.6l-1.23-.5a2.15 2.15 0 0 0 3.97-1.66 2.15 2.15 0 0 0-2.85-1.13l1.27.53a1.58 1.58 0 1 1-1.16 2.93zm8.8-7.8a2.53 2.53 0 1 0-5.06 0 2.53 2.53 0 0 0 5.06 0zm-4.43 0a1.9 1.9 0 1 1 3.8 0 1.9 1.9 0 0 1-3.8 0z"/></svg>,
  google:(p)=> <svg viewBox="0 0 24 24" {...p}><path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.3-4.9 3.3-7.8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .67-2.3 1.05-3.7 1.05-2.85 0-5.27-1.92-6.13-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.87 14.15a6.6 6.6 0 0 1 0-4.3V7.05H2.2a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .55 4.13 1.62l3.1-3.1A11 11 0 0 0 2.2 7.05l3.67 2.8C6.73 7.32 9.15 5.4 12 5.4z"/></svg>,
  logout:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  menu:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  arrowLeft:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
};

/* ---------- Cover art ---------- */
function CoverArt({ game, className }){
  return (
    <div className={"cover "+(className||"")} style={{ background: game.coverBg }}>
      <span className="cover-mark">{game.mark}</span>
      <span className="cover-title">{game.name}</span>
    </div>
  );
}

/* ---------- Hours formatter ---------- */
const fmtHours = h => h>=100 ? Math.round(h)+'h' : h.toFixed(1)+'h';

/* ---------- Badge ---------- */
function Badge({ kind='muted', children, icon:I }){
  return <span className={"badge badge-"+kind}>{I && <I/>}{children}</span>;
}

/* ---------- GameCard ---------- */
function GameCard({ game, rank }){
  return (
    <div className="game-card">
      <div className="game-card-art">
        <CoverArt game={game}/>
        {rank && <span className={"rank-chip rank-"+rank}>#{rank}</span>}
        {game.installed && <span className="installed-dot" title="Installed"/>}
      </div>
      <div className="game-card-body">
        <div className="game-card-name" title={game.name}>{game.name}</div>
        <div className="game-card-meta">
          <span className="gc-genre">{game.genre}</span>
          <span className="gc-hours"><Icon.clock/> {fmtHours(game.hours)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Navbar ---------- */
function Navbar({ route, go }){
  const [open,setOpen] = useState(false);
  const items = [
    { id:'library', label:'Library', icon:Icon.library },
    { id:'pick', label:'Pick a Game', icon:Icon.dice },
    { id:'settings', label:'Settings', icon:Icon.settings },
  ];
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a className="nav-brand" onClick={()=>go('landing')} style={{cursor:'pointer'}}>
          <span className="em">🥒</span> gamepickle
        </a>
        <div className={"nav-links"+(open?' open':'')}>
          {items.map(it=>{
            const I=it.icon;
            return <a key={it.id} className={"nav-link"+(route===it.id?' active':'')}
              onClick={()=>{go(it.id);setOpen(false);}}><I/>{it.label}</a>;
          })}
        </div>
        <button className="nav-mobile-toggle" onClick={()=>setOpen(o=>!o)}><Icon.menu/></button>
        <div className="nav-right">
          <button className="btn btn-outline btn-sm" onClick={()=>go('landing')}><Icon.logout/> Sign out</button>
          <div className="nav-avatar">A</div>
        </div>
      </div>
    </nav>
  );
}

/* ---------- shared exports ---------- */
Object.assign(window, { Icon, CoverArt, Badge, GameCard, Navbar, fmtHours });
