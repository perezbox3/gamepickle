/* gamepickle — app shell + simple router */
function App(){
  const [route,setRoute] = useState('landing'); // landing | library | pick | settings
  const [linked,setLinked] = useState(true);

  function go(r){ setRoute(r); if(r!=='pick') window.scrollTo({top:0}); }

  const authed = route!=='landing';

  return (
    <React.Fragment>
      <PickleField/>
      <div className="gp-app">
        {authed && <Navbar route={route} go={go}/>}
        <div className="gp-main">
          {route==='landing' && <Landing go={go}/>}
          {route==='library' && <Library go={go} linked={linked}/>}
          {route==='pick' && <Pick go={go}/>}
          {route==='settings' && <Settings linked={linked} setLinked={setLinked}/>}
        </div>
      </div>
    </React.Fragment>
  );
}

function mount(){
  ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
}
if(document.fonts && document.fonts.ready){
  // mount after webfonts load so first paint uses Press Start 2P / VT323 (no fallback reflow)
  Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,1200))]).then(mount);
} else {
  mount();
}
