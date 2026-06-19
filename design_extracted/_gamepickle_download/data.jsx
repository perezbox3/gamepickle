/* gamepickle — mock data: library + quiz */
(function(){
  // genre palettes drive cover-art gradients (cohesive, warm-leaning on dark)
  const GENRE_HUES = {
    'RPG':            ['#3a2c5e','#6d4aa8'],
    'Shooter':        ['#5e2a2a','#a8584a'],
    'Strategy':       ['#1f3a4d','#2f6d8a'],
    'Roguelike':      ['#4d2f1f','#a8703a'],
    'Co-op':          ['#2a4d2f','#4a8a58'],
    'Sandbox':        ['#4d4420','#a89a3a'],
    'Horror':         ['#2a1f2f','#5a3a6d'],
    'Racing':         ['#1f2f4d','#3a6da8'],
    'Platformer':     ['#4d2f3a','#a84a6d'],
    'Simulation':     ['#2f3a2a','#6d8a4a'],
    'Fighting':       ['#4d2520','#c25540'],
    'Puzzle':         ['#203a3a','#3a8a8a'],
  };

  function cover(name, genre){
    const [a,b] = GENRE_HUES[genre] || ['#2a2a30','#44444c'];
    // deterministic angle from name
    let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))>>>0;
    const ang = 110 + (h % 60);
    return { bg:`linear-gradient(${ang}deg, ${a} 0%, ${b} 100%)`, mark:name.slice(0,2).toUpperCase() };
  }

  const raw = [
    ['Hollow Depths','RPG',147.4,true,'mid','solo'],
    ['Voidrunner 2','Shooter',92.1,true,'fast','multi'],
    ['Iron Dominion','Strategy',211.8,false,'long','solo'],
    ['Spire of Ash','Roguelike',58.6,true,'fast','solo'],
    ['Cabin Crew','Co-op',41.2,true,'chill','multi'],
    ['Blockfall','Sandbox',389.0,true,'chill','both'],
    ['The Hollow Hour','Horror',12.4,false,'mid','solo'],
    ['Apex Circuit','Racing',73.9,true,'fast','multi'],
    ['Lumen','Platformer',9.8,false,'chill','solo'],
    ['Harvest Hollow','Simulation',164.5,true,'chill','solo'],
    ['Knuckle Up','Fighting',31.7,true,'fast','multi'],
    ['Gridlock','Puzzle',6.2,false,'chill','solo'],
    ['Starbound Exiles','RPG',88.3,false,'long','solo'],
    ['Frontline 88','Shooter',204.6,true,'fast','multi'],
    ['Empires & Ether','Strategy',119.0,false,'long','solo'],
    ['Dungeon Cycle','Roguelike',77.5,true,'mid','solo'],
    ['Two Pines','Co-op',22.9,false,'chill','multi'],
    ['Craftwork','Sandbox',151.2,true,'chill','both'],
    ['Nightfilm','Horror',4.1,false,'mid','solo'],
    ['Drift Theory','Racing',45.8,false,'fast','multi'],
    ['Jumpline','Platformer',18.3,true,'chill','solo'],
    ['Port Authority','Simulation',96.7,true,'long','solo'],
    ['Final Stance','Fighting',54.0,false,'fast','multi'],
    ['Tessellate','Puzzle',11.6,true,'chill','solo'],
  ];

  const GAMES = raw.map((r,i)=>{
    const [name,genre,hours,installed,session,play] = r;
    const c = cover(name,genre);
    return { id:i+1, name, genre, hours, installed, session, play, coverBg:c.bg, mark:c.mark };
  });

  const QUIZ = [
    { id:'mood', q:"What's the vibe right now?", sub:'Set the tone for tonight.',
      options:[
        {v:'chill',label:'Chill / unwind',sub:'Low stakes, easy to put down'},
        {v:'fast',label:'Fast & competitive',sub:'Reflexes, adrenaline, winning'},
        {v:'mid',label:'Story & immersion',sub:'Get lost in a world'},
        {v:'long',label:'Deep & strategic',sub:'Big brain, long game'},
      ]},
    { id:'time', q:'How long have you got?', sub:'Be honest.',
      options:[
        {v:'fast',label:'Under 30 min',sub:'A quick hit'},
        {v:'mid',label:'1–2 hours',sub:'A proper session'},
        {v:'long',label:'All evening',sub:'Clear the schedule'},
        {v:'chill',label:'No clock',sub:'Whatever happens, happens'},
      ]},
    { id:'play', q:'Solo or with people?', sub:'Who are you playing with?',
      options:[
        {v:'solo',label:'Just me',sub:'Single-player only'},
        {v:'multi',label:'With friends',sub:'Co-op or competitive'},
        {v:'both',label:"Doesn't matter",sub:'Open to either'},
      ]},
    { id:'genre', q:'Feeling any genre?', sub:'Pick a lane — or skip it.',
      options:[
        {v:'RPG',label:'RPG / adventure',sub:'Quests, loot, leveling'},
        {v:'Shooter',label:'Shooter / action',sub:'Point, click, frag'},
        {v:'Strategy',label:'Strategy / sim',sub:'Plan and build'},
        {v:'any',label:'Surprise me',sub:'No preference'},
      ]},
    { id:'effort', q:'How much brain do you have?', sub:'Last one.',
      options:[
        {v:'low',label:'Running on empty',sub:'Keep it simple'},
        {v:'mid',label:'Average',sub:'A little challenge is fine'},
        {v:'high',label:'Fully caffeinated',sub:'Bring the difficulty'},
      ]},
  ];

  // tiny scoring: match game.session/play/genre against answers
  function scoreGame(g, ans){
    let s = 0;
    const reasons = [];
    if(ans.mood && g.session===ans.mood){ s+=3; }
    if(ans.time && g.session===ans.time){ s+=2; reasons.push(`fits your ${ans.time==='fast'?'quick':ans.time==='long'?'all-evening':'session'} window`); }
    if(ans.play){ if(g.play===ans.play){ s+=3; reasons.push(ans.play==='multi'?'great with friends':ans.play==='solo'?'a solid solo sink':'plays solo or co-op'); }
      else if(g.play==='both'||ans.play==='both'){ s+=1; } }
    if(ans.genre && ans.genre!=='any'){ if(g.genre===ans.genre){ s+=4; reasons.push(`it's the ${g.genre} you asked for`); } }
    if(ans.effort==='high'&&['Strategy','RPG','Fighting'].includes(g.genre)){ s+=2; }
    if(ans.effort==='low'&&['Sandbox','Simulation','Puzzle','Platformer'].includes(g.genre)){ s+=2; }
    // weight by how much you already love it (hours), lightly
    s += Math.min(g.hours/120, 2.2);
    if(g.installed){ s+=1.2; reasons.push('already installed'); }
    if(g.hours>120){ reasons.push(`you've sunk ${Math.round(g.hours)}h into it`); }
    else if(g.hours<15){ reasons.push('barely touched — time to give it a shot'); }
    return { score:s, reason: reasons.slice(0,2).join(' · ') || `a ${g.genre.toLowerCase()} pick from your shelf` };
  }

  window.GP_GAMES = GAMES;
  window.GP_QUIZ = QUIZ;
  window.GP_scoreGame = scoreGame;
  window.GP_GENRES = [...new Set(GAMES.map(g=>g.genre))];
})();
