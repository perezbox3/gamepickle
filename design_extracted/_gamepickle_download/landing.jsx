/* gamepickle — Landing page */
function Landing({ go }){
  const features = [
    { ic:Icon.library, green:false, h:'Your full jar',
      p:'Link Steam and we pull every game you own — installed or not — into one shelf.' },
    { ic:Icon.dice, green:false, h:'Smart picker',
      p:'Answer 5 quick questions about your mood and time. We surface your top 3.' },
    { ic:Icon.shuffle, green:true, h:'F*** around & find out',
      p:"Not in the mood to think? Smash the button. Random game. Go play it." },
    { ic:Icon.zap, green:false, h:'Make it yours',
      p:"Ban genres you're not feeling, set session defaults, shelve the duds." },
  ];

  return (
    <div className="landing">
      <div className="container">
        <div className="landing-hero">
          <div className="landing-pill">🥒 a very silly weekend build</div>
          <h1 className="landing-h1">STOP SCROLLING.<br/><span className="gold">START PLAYING.</span></h1>
          <p className="landing-lede">You own 500 games and play the same 3. gamepickle picks
            your next session in 60 seconds — so you can quit the library and actually play.</p>
          <div className="landing-cta">
            <span className="landing-start">▶ PRESS START</span>
            <button className="gbtn" onClick={()=>go('library')}>
              <Icon.google/> Continue with Google
            </button>
            <span className="landing-note">free · no spam · unlink anytime</span>
          </div>
        </div>

        <div className="feature-grid">
          {features.map((f,i)=>{
            const I=f.ic;
            return (
              <div key={i} className="card feature">
                <div className={"feature-ic"+(f.green?' green':'')}><I/></div>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="landing-foot">
        <span>🥒 <span className="b">gamepickle</span> — a tool by perezbox3</span>
      </div>
    </div>
  );
}
window.Landing = Landing;
