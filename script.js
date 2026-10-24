/* === Emerald Forest фокусировки: общий скрипт === */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY='emerald_forest';
const def=()=>({sessions:[],theme:'night',checks:{}});
const load=()=>{try{return Object.assign(def(),JSON.parse(localStorage.getItem(KEY)))}catch(e){return def()}};
const save=d=>localStorage.setItem(KEY,JSON.stringify(d));
let D=load();
const page=document.body.dataset.page;

/* --- Растения (инлайн-SVG) --- */
const NAMES=['Glowing Lily of the Valley','Emerald Fern','Phosphorescent Mushroom','Lantern Tree','Mint Starflower','Sparkling Moss','Dewdrop Bellflower','Firefly Vine'];
const P=[
'<path d="M30 54C30 36 34 24 42 14" stroke="#3fa86b" stroke-width="3" fill="none"/><path d="M30 54C14 50 10 36 16 28 28 30 30 42 30 54" fill="#1a6b4a"/><g fill="#c8f2d9" class="gl"><circle cx="40" cy="20" r="4"/><circle cx="43" cy="28" r="4"/><circle cx="38" cy="35" r="3.5"/></g>',
'<g stroke="#7fd1a4" stroke-width="3" fill="none"><path d="M30 56V10M30 46L14 38M30 36L16 26M30 26L20 16M30 46L46 38M30 36L44 26M30 26L40 16"/></g>',
'<rect x="26" y="34" width="8" height="20" rx="3" fill="#a8c9b0"/><path d="M10 36C10 16 50 16 50 36Z" fill="#b8ff9e" class="gl"/><circle cx="22" cy="28" r="3" fill="#c8f2d9"/><circle cx="36" cy="26" r="2.5" fill="#c8f2d9"/>',
'<rect x="27" y="30" width="6" height="26" fill="#1a6b4a"/><circle cx="30" cy="22" r="16" fill="#3fa86b"/><g fill="#b8ff9e" class="gl"><circle cx="22" cy="20" r="3"/><circle cx="36" cy="16" r="3"/><circle cx="32" cy="28" r="3"/></g>',
'<path d="M30 56V34" stroke="#3fa86b" stroke-width="3"/><polygon class="gl" fill="#c8f2d9" points="30,6 35,17 48,18 38,27 41,40 30,33 19,40 22,27 12,18 25,17"/>',
'<path d="M6 54C6 34 54 34 54 54Z" fill="#3fa86b"/><g fill="#e8d48a" class="gl"><circle cx="18" cy="42" r="1.8"/><circle cx="32" cy="38" r="1.8"/><circle cx="44" cy="44" r="1.8"/></g>',
'<path d="M30 56V14" stroke="#3fa86b" stroke-width="2.5"/><path d="M30 14C18 14 18 38 12 40H48C42 38 42 14 30 14Z" fill="#7fd1a4"/><circle cx="14" cy="48" r="2" fill="#c8f2d9"/><circle cx="46" cy="50" r="2" fill="#c8f2d9"/>',
'<path d="M14 6C40 14 8 30 40 40S20 52 30 56" stroke="#3fa86b" stroke-width="3" fill="none"/><g fill="#e8d48a" class="gl"><circle cx="30" cy="16" r="2.5"/><circle cx="22" cy="30" r="2.5"/><circle cx="38" cy="42" r="2.5"/></g>'];
const plantSVG=i=>`<svg viewBox="0 0 60 60">${P[i%8]}</svg>`;

/* --- Звук (Web Audio) --- */
let AC;const ac=()=>AC||(AC=new(window.AudioContext||webkitAudioContext)());
function tone(f,d=.15,v=.1,t=0){const a=ac(),o=a.createOscillator(),g=a.createGain(),s=a.currentTime+t;o.frequency.value=f;g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.001,s+d);o.connect(g).connect(a.destination);o.start(s);o.stop(s+d)}
const bell=()=>[880,1320,1760].forEach((f,i)=>tone(f,1.2,.06,i*.25));


/* --- Общее: тема, меню, приветствие, эффекты --- */
document.body.classList.add(D.theme==='day'?'day':'night');
const links=[['index','Home'],['timer','Timer'],['forest','Forest'],['advice','Advice'],['stats','Chronicles']];
const nav=document.createElement('nav');
nav.innerHTML='<span class="logo">🌿 Emerald Forest</span>'+links.map(([p,t])=>`<a href="${p}.html" class="${p===page?'act':''}">${t}</a>`).join('')+'<button id="theme" title="Day/Night">☀/🌙</button>';
document.body.prepend(nav);
$('#theme').onclick=()=>{D.theme=D.theme==='day'?'night':'day';document.body.classList.toggle('day');save(D)};
const hr=new Date().getHours();
const g=$('#greet');if(g)g.textContent=hr<6?'Peaceful night, traveler':hr<12?'Good morning, traveler':hr<18?'Good afternoon, traveler':'Good evening, traveler';
// плавные переходы
$$('a[href$=".html"]').forEach(a=>a.onclick=e=>{e.preventDefault();document.body.classList.add('out');setTimeout(()=>location.href=a.href,250)});
// светлячки за курсором
let lastFly=0;
addEventListener('pointermove',e=>{if(Date.now()-lastFly<70)return;lastFly=Date.now();
  const f=document.createElement('div');f.className='fly'+(Math.random()<.15?' g':'');
  f.style.left=e.clientX+Math.random()*14-7+'px';f.style.top=e.clientY+Math.random()*14-7+'px';document.body.append(f);setTimeout(()=>f.remove(),900)});
// листик при клике
addEventListener('click',e=>{const l=document.createElement('div');l.className='leaf c';
  l.style.left=e.clientX+'px';l.style.top=e.clientY+'px';l.style.setProperty('--dx',Math.random()*60-30+'px');document.body.append(l);setTimeout(()=>l.remove(),800)});
// easter egg: type «forest»
let buf='';
addEventListener('keydown',e=>{buf=(buf+e.key.toLowerCase()).slice(-6);
  if(buf==='forest'){const d=document.createElement('div');d.className='deer';d.textContent='🦌';document.body.append(d);setTimeout(()=>d.remove(),1400)}});

/* --- Главная --- */
if(page==='index'){
  $('#count').textContent=D.sessions.length;
  const pv=$('#preview'),cols=['#0b3d2e','#1a6b4a','#3fa86b','#7fd1a4'];
  for(let i=0;i<16;i++){const t=document.createElement('div');t.className='tree';
    t.style.cssText=`left:${i*6.3}%;width:${60+Math.random()*60}px;height:${80+Math.random()*180}px;background:${cols[i%4]};animation-delay:${i*.2}s`;pv.append(t)}
  setInterval(()=>{const l=document.createElement('div');l.className='leaf';
    l.style.cssText=`left:${Math.random()*100}vw;animation-duration:${6+Math.random()*6}s;background:${cols[1+Math.floor(Math.random()*3)]}`;
    document.body.append(l);setTimeout(()=>l.remove(),12000)},700);
}

/* --- Таймер --- */
if(page==='timer'){
  let total=1500,left=total,run=false,end=0,raf;
  const C=2*Math.PI*90,ring=$('#ring'),txt=$('#time');ring.style.strokeDasharray=C;
  const draw=()=>{const s=Math.ceil(left);txt.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');ring.style.strokeDashoffset=C*left/total};
  const setMin=m=>{if(run||!(m>0))return;total=left=m*60;draw()};
  $$('[data-m]').forEach(b=>b.onclick=()=>{$$('[data-m]').forEach(x=>x.classList.remove('on'));b.classList.add('on');setMin(+b.dataset.m)});
  $('#setc').onclick=()=>setMin(Math.min(240,+$('#custom').value));
  const tick=()=>{left=(end-Date.now())/1000;if(left<=0)return finish();draw();raf=requestAnimationFrame(tick)};
  $('#start').onclick=()=>{if(run)return;tone(520,.15);run=true;end=Date.now()+left*1000;localStorage.setItem('ef_running','1');document.body.classList.add('focus');tick()};
  $('#pause').onclick=()=>{if(!run)return;tone(380,.15);run=false;cancelAnimationFrame(raf);localStorage.removeItem('ef_running');document.body.classList.remove('focus')};
  $('#reset').onclick=()=>{tone(300,.2);run=false;cancelAnimationFrame(raf);localStorage.removeItem('ef_running');document.body.classList.remove('focus');left=total;draw()};
  function finish(){run=false;left=0;draw();document.body.classList.remove('focus');localStorage.removeItem('ef_running');bell();
    D.sessions.push({ts:Date.now(),min:total/60});save(D);const i=D.sessions.length-1;
    $('#newplant').innerHTML=`<div class="plant new" style="width:120px;margin:auto">${plantSVG(i)}</div><p>${NAMES[i%8]}</p>`;
    $('#modal').classList.add('show')}
  $('#close').onclick=()=>{$('#modal').classList.remove('show');left=total;draw()};
  // если вкладку закрывали во время фокуса — сессия прервана
  if(localStorage.getItem('ef_running')){localStorage.removeItem('ef_running');$('#note').textContent='🍂 Your last session was interrupted, so no plant grew. Start again!'}
  draw();
  for(let i=0;i<14;i++){const f=document.createElement('div');f.className='fly';f.style.cssText=`left:${Math.random()*100}vw;top:${40+Math.random()*50}vh;animation:none;opacity:.7`;f.dataset.f=1;$('#flies').append(f)}
  setInterval(()=>{if(!run)return;$$('#flies .fly').forEach(f=>{f.style.transition='all 4s';f.style.left=Math.random()*100+'vw';f.style.top=40+Math.random()*50+'vh'})},4000);
}

/* --- Лес --- */
if(page==='forest'){
  const m=$('#meadow');
  D.sessions.forEach((s,i)=>{const p=document.createElement('div');p.className='plant'+(i===D.sessions.length-1&&Date.now()-s.ts<6e4?' new':'');
    p.dataset.tip=`${NAMES[i%8]} · ${new Date(s.ts).toLocaleDateString('en-US')} · ${s.min} min`;p.innerHTML=plantSVG(i);p.style.animationDelay=(i%5)*.4+'s';m.append(p)});
  if(!D.sessions.length)m.innerHTML='<p class="sub">The meadow is empty. Finish a focus session and your first plant will grow here 🌱</p>';
  $('#export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D.sessions,null,2)],{type:'application/json'}));a.download='forest.json';a.click()};
  $('#wipe').onclick=()=>{if(confirm('Reset the whole forest? This cannot be undone.')){D.sessions=[];save(D);location.reload()}};
}

/* --- Статистика --- */
if(page==='stats'){
  const S=D.sessions,tot=S.reduce((a,s)=>a+s.min,0),day=s=>new Date(s.ts).toDateString(),byDay={};
  S.forEach(s=>byDay[day(s)]=(byDay[day(s)]||0)+s.min);
  let streak=0;for(let d=new Date();byDay[d.toDateString()];d.setDate(d.getDate()-1))streak++;
  $('#n').textContent=S.length;$('#tot').textContent=Math.round(tot)+' min';$('#rec').textContent=Math.max(0,...Object.values(byDay))+' min';
  // диаграмма по дням недели
  const w=[0,0,0,0,0,0,0];S.forEach(s=>w[(new Date(s.ts).getDay()+6)%7]+=s.min);
  const c=$('#chart'),x=c.getContext('2d'),mx=Math.max(1,...w);
  w.forEach((v,i)=>{const h=v/mx*170,gr=x.createLinearGradient(0,210-h,0,210);gr.addColorStop(0,'#b8ff9e');gr.addColorStop(1,'#1a6b4a');
    x.fillStyle=gr;x.shadowColor='#7fd1a4';x.shadowBlur=10;x.fillRect(30+i*80,210-h,50,h);x.shadowBlur=0;
    x.fillStyle='#7fd1a4';x.font='16px sans-serif';x.fillText(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],42+i*80,232);if(v)x.fillText(Math.round(v),42+i*80,200-h)});
  const night=S.filter(s=>new Date(s.ts).getHours()>=22).length;
  const A=[['🌱','First Sprout','One session',S.length,1],['🔥','7-Day Streak','A week without gaps',streak,7],['⏳','10 Hours of Focus','600 minutes',tot,600],['🌲','Whole Forest','20 plants',S.length,20],['🦉','Night Guardian','A session after 10 PM',night,1]];
  $('#ach').innerHTML=A.map(([i,n,d,c,g])=>`<div class="card ${c>=g?'got':''}"><div style="font-size:2rem">${i}</div><b>${n}</b><br><small>${d}</small></div>`).join('');
  const nx=A.filter(a=>a[3]<a[4]).sort((a,b)=>b[3]/b[4]-a[3]/a[4])[0];
  $('#next').innerHTML=nx?`Next: “${nx[1]}” — ${Math.round(nx[3]/nx[4]*100)}%<div class="bar"><i style="width:${nx[3]/nx[4]*100}%"></i></div>`:'🌟 All achievements unlocked!';
}

/* --- Советы --- */
if(page==='advice'){
  const T=[
['new','The Two-Minute Rule','Can\'t get started? Promise yourself just two minutes. Set a timer and open the file you need. Most of the time the resistance fades once you begin; if it doesn\'t, stop without guilt.'],
['new','Pomodoro, Step by Step','1) Pick a task. 2) Set a 25-minute timer. 3) Work without distractions. 4) Take a 5-minute break. 5) After four rounds, rest for 20–30 minutes.'],
['new','One Task per Session','Before you start, write one sentence: "In 25 minutes I will have…". The result must be concrete, like a finished paragraph or three solved problems. A vague goal invites distractions.'],
['proc','Digital Silence','Move your phone to another room and mute computer notifications. Even a phone lying nearby drains attention. If you must be reachable, allow calls from close people only.'],
['proc','Thought Parking','Keep a sheet of paper nearby. When "I should check my email" pops up, jot it down in a word and return to work. Review the list on your break; nothing is lost.'],
['proc','Eat the Frog','Do the most unpleasant task first, while your energy is high. A morning session on the hardest task frees the rest of your day from nagging dread.'],
['deep','One-Tab Method','Keep only the tab you need for the task. Close the rest or bookmark them for later. This removes the temptation to "just quickly check" something.'],
['deep','Longer Sessions: 45–60 Minutes','Once you are warmed up, extend to 45–60 minutes. Flow usually arrives after 15–20 minutes, so a break in the middle of ramp-up is costly. Start short, then go long.'],
['deep','Time Blocking','Schedule focus blocks in your calendar in advance and protect them like meetings. Place the best block when your energy peaks. No email or chats inside a block.'],
['rest','A Real Break','Stand up, drink water, look into the distance and stretch. Social media is not rest: your brain gets a new load of stimuli. Five minutes without screens restores far more.'],
['rest','4-7-8 Breathing','Inhale for 4 counts, hold for 7, exhale for 8; repeat four times. It calms your pulse and helps you shift from hustle to focus, or from effort to rest.'],
['rest','Signs of Burnout','If work feels repulsive and sleep does not help, lower the load: shorten sessions to 15 minutes and add a screen-free day off. If it lasts for weeks, talk to a professional.'],
['habit','Entry Ritual','Repeat the same actions before every start: pour tea, put on headphones, start the timer. Over time the ritual becomes a signal to your brain: it is time to work.'],
['habit','Evening Review','Spend five minutes each evening: what worked, what got in the way, what is tomorrow\'s main task. A written plan removes morning decisions and shortens the warm-up.'],
['habit','Coming Back After a Slip','Missed a day or a week? Don\'t punish yourself. Do one short 15-minute session today. The goal is not to never slip, but to return quickly.']];
  const cats={all:'All',new:'🌱 Beginners',proc:'🌿 Procrastination',deep:'🌳 Deep Work',rest:'🍃 Rest',habit:'🌲 Habits'};
  $('#filters').innerHTML=Object.entries(cats).map(([k,v])=>`<button data-c="${k}" class="${k==='all'?'on':''}">${v}</button>`).join('');
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('vis')),{threshold:.1});
  const render=c=>{$('#tips').innerHTML=T.filter(t=>c==='all'||t[0]===c).map(t=>`<div class="card tip"><h3>${t[1]}</h3><p>${t[2]}</p></div>`).join('');$$('.tip').forEach(t=>io.observe(t))};
  render('all');
  $$('#filters button').forEach(b=>b.onclick=()=>{$$('#filters button').forEach(x=>x.classList.remove('on'));b.classList.add('on');render(b.dataset.c)});
  $('#rbtn').onclick=()=>{const t=T[Math.floor(Math.random()*T.length)];const r=$('#rnd');r.innerHTML=`<div class="card"><h3>📖 ${t[1]}</h3><p>${t[2]}</p></div>`;tone(660,.2,.05)};
  const R=['Morning ritual done','Phone put away','One task chosen','Water or tea ready','Timer started'];
  $('#check').innerHTML=R.map((r,i)=>`<label class="chk"><input type="checkbox" style="width:auto" ${D.checks[i]?'checked':''} data-i="${i}"> ${r}</label>`).join('');
  $$('#check input').forEach(c=>c.onchange=()=>{D.checks[c.dataset.i]=c.checked;save(D)});
}
