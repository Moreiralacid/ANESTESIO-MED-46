
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);

function openTab(id){
  $$('.tab').forEach(t=>t.classList.remove('active'));
  $$('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
  const el = document.getElementById(id); if(el) el.classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}
$$('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>openTab(btn.dataset.tab)));
document.querySelector('.tab-btn[data-tab="inicio"]').classList.add('active');

const themeToggle = $('#themeToggle');
const savedTheme = localStorage.getItem('theme');
if(savedTheme==='dark'){document.body.classList.add('dark'); themeToggle.textContent='☀️ Modo claro';}
themeToggle.addEventListener('click',()=>{
  document.body.classList.toggle('dark');
  const dark=document.body.classList.contains('dark');
  localStorage.setItem('theme', dark?'dark':'light');
  themeToggle.textContent = dark ? '☀️ Modo claro' : '🌙 Modo escuro';
});

let stats = JSON.parse(localStorage.getItem('stats')||'{}');
function saveStats(){localStorage.setItem('stats', JSON.stringify(stats));}
function updateStats(){
  const vals=Object.values(stats);
  const answered=vals.length, hits=vals.filter(Boolean).length, misses=answered-hits;
  $('#answered').textContent=answered; $('#hits').textContent=hits; $('#misses').textContent=misses;
  $('#percent').textContent=answered?Math.round(hits/answered*100)+'%':'0%';
}
function resetStats(){stats={}; saveStats(); renderQuestions(); updateStats();}

function populateFilters(){
  const sel=$('#filterSubject'); if(!sel) return;
  const subjects=[...new Set(QUESTIONS.map(q=>q.assunto))];
  subjects.forEach(s=>{const o=document.createElement('option'); o.value=s; o.textContent=s; sel.appendChild(o);});
  sel.addEventListener('change',renderQuestions);
  $('#filterType').addEventListener('change',renderQuestions);
}

function renderQuestions(){
  const box=$('#questions'); if(!box) return;
  const fs=$('#filterSubject').value, ft=$('#filterType').value;
  box.innerHTML='';
  QUESTIONS.filter(q=>(fs==='Todos'||q.assunto===fs)&&(ft==='Todos'||q.tipo===ft)).forEach(q=>{
    const div=document.createElement('div'); div.className='question';
    div.innerHTML=`<div class="q-meta"><span>${q.id}</span><span>${q.assunto}</span><span>${q.tipo}</span><span>${q.dificuldade}</span><span>${q.temperatura}</span></div>
      <h3>${q.questao}</h3>
      <div class="alts"></div>
      <button class="show-answer">Mostrar/ocultar resposta</button>
      <div class="answer"><b>Gabarito:</b> ${q.gabarito}<br><b>Comentário:</b> ${q.comentario}</div>`;
    const alts=div.querySelector('.alts');
    q.alternativas.forEach((a,idx)=>{
      const b=document.createElement('button'); b.className='alt'; b.textContent=String.fromCharCode(65+idx)+') '+a;
      b.addEventListener('click',()=>{
        const ok=a===q.gabarito; stats[q.id]=ok; saveStats(); updateStats();
        div.querySelectorAll('.alt').forEach(x=>x.disabled=true);
        b.classList.add(ok?'correct':'wrong');
        div.querySelectorAll('.alt').forEach(x=>{if(x.textContent.includes(q.gabarito)) x.classList.add('correct')});
        div.querySelector('.answer').classList.add('show');
      });
      alts.appendChild(b);
    });
    div.querySelector('.show-answer').addEventListener('click',()=>div.querySelector('.answer').classList.toggle('show'));
    box.appendChild(div);
  });
}

function buildSchedule(){
  const target = $('#schedule'); if(!target) return;
  const hours = Number($('#hoursDay').value||3);
  const topics = ['Anestésicos locais: mecanismo + toxicidade','Bloqueios periféricos: plexo + Bier + USG','Neuroeixo: raqui x peridural + contraindicações','Ventilação: PEEP + capnografia + I:E','BNM: TOF + succinilcolina + reversão','Hipnóticos: propofol + etomidato + TCI','Dor: aguda x crônica + OMS','Simulado final + revisão dos erros'];
  target.innerHTML='';
  topics.forEach((t,i)=>{
    const d=document.createElement('div'); d.className='day';
    d.innerHTML=`<h3>Dia ${i+1} — ${t}</h3><p><b>${hours}h:</b> ${Math.round(hours*.3*10)/10}h teoria • ${Math.round(hours*.5*10)/10}h questões • ${Math.round(hours*.2*10)/10}h revisão ativa.</p><p>Revisões: D+1, D+3, D+7 e D+15.</p>`;
    target.appendChild(d);
  });
}
populateFilters(); renderQuestions(); updateStats(); buildSchedule();
