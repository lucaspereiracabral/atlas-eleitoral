(()=>{
'use strict';
const STYLE_ID='atlas-landing-polish-style';
const INFO_ID='atlas-institutional-info';

const icons={
  govt:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
  area:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3M8 8h8v8H8z"/></svg>',
  people:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  trend:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>',
  ballot:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14v12H5zM8 4h8l2 4H6l2-4ZM9 13h6"/></svg>',
  fingerprint:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11a3 3 0 0 1 3 3c0 3-1 5-2 7M8.5 21c1-2 1.5-4 1.5-7a2 2 0 1 1 4 0c0 2.5-.5 5-1.5 7M5 17c.5-1.5.5-3 .5-4.5a6.5 6.5 0 1 1 13 0c0 2.5-.3 5-1.3 8M4 9a9 9 0 0 1 16 0"/></svg>',
  vote:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14v8H5zM8 12V5h8v7M9 8h6M8 16h8"/></svg>',
  accessibility:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M5 8h14M12 6v6m0 0-4 8m4-8 4 8"/></svg>',
  party:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20v-8h12v8M4 12h16L12 4 4 12ZM9 15h.01M15 15h.01"/></svg>',
  clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  delta:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18 10 12l4 4 6-8M16 8h4v4"/></svg>',
  renew:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6.5 8A7 7 0 0 1 18 7l2 5M17.5 16A7 7 0 0 1 6 17l-2-5"/></svg>'
};

function injectStyles(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 .brand-logo{display:none!important}.brand{gap:0!important}.atlas-admin-label{display:none!important}
 #${INFO_ID}{margin:22px 0 8px}.inst-shell{background:linear-gradient(135deg,#0f172a 0%,#172554 100%);border-radius:22px;padding:26px;box-shadow:0 18px 42px -28px rgba(15,23,42,.65);overflow:hidden;position:relative}.inst-shell:after{content:'';position:absolute;width:310px;height:310px;border-radius:50%;right:-100px;top:-165px;background:rgba(59,130,246,.15)}.inst-head{position:relative;z-index:1;margin-bottom:18px}.inst-kicker{font-size:10px;font-weight:800;letter-spacing:1.35px;color:#93c5fd;text-transform:uppercase}.inst-title{font-size:23px;font-weight:800;color:#fff;margin-top:5px;letter-spacing:-.5px}.inst-sub{font-size:11px;color:#cbd5e1;margin-top:5px;max-width:760px;line-height:1.55}.inst-grid{position:relative;z-index:1;display:grid;grid-template-columns:1.25fr repeat(3,1fr);gap:12px}.inst-card{background:rgba(255,255,255,.96);border:1px solid rgba(255,255,255,.5);border-radius:15px;padding:17px 18px;min-height:126px;position:relative;box-shadow:0 9px 24px rgba(15,23,42,.12)}.inst-icon{width:36px;height:36px;border-radius:10px;background:#eff6ff;color:#2563eb;display:grid;place-items:center;margin-bottom:13px}.inst-icon svg,.atlas-card-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.inst-label{font-size:9px;font-weight:800;letter-spacing:.75px;color:#7c8799;text-transform:uppercase}.inst-value{font-size:23px;font-weight:800;color:#0f172a;letter-spacing:-.65px;margin-top:7px;line-height:1.15}.inst-value.name{font-size:18px;max-width:250px}.inst-note{font-size:10px;color:#94a3b8;margin-top:7px}
 .analytics-kpi,.evo-kpi{position:relative!important;padding-right:66px!important}.atlas-card-icon{position:absolute;right:17px;top:17px;width:38px;height:38px;border-radius:11px;background:#eff6ff;color:#2563eb;display:grid;place-items:center;z-index:3}.analytics-kpi:nth-child(2) .atlas-card-icon,.evo-kpi:nth-child(2) .atlas-card-icon{background:#ecfdf5;color:#059669}.analytics-kpi:nth-child(3) .atlas-card-icon,.evo-kpi:nth-child(3) .atlas-card-icon{background:#fffbeb;color:#d97706}.analytics-kpi:nth-child(4) .atlas-card-icon,.evo-kpi:nth-child(4) .atlas-card-icon{background:#fff1f2;color:#e11d48}
 @media(max-width:900px){.inst-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.inst-shell{padding:17px;border-radius:17px}.inst-grid{grid-template-columns:1fr}.inst-title{font-size:20px}.inst-card{min-height:112px}}
 `;document.head.appendChild(s);
}

function removeHeaderExtras(){
 document.querySelectorAll('.brand-logo').forEach(el=>{el.style.display='none'});
 const header=document.querySelector('header'); if(!header)return;
 [...header.querySelectorAll('*')].forEach(el=>{
   const t=(el.textContent||'').trim();
   if(/ADMIN/i.test(t) && !/Sair/i.test(t) && el.children.length===0){el.classList.add('atlas-admin-label');el.style.display='none'}
 });
}

function removeZoneFilter(){
 document.querySelectorAll('select').forEach(sel=>{
   const text=[...sel.options].map(o=>(o.textContent||'').trim()).join(' | ');
   if(/Todas as Zonas Eleitorais/i.test(text)){
      sel.style.display='none';
      const wrap=sel.closest('.select-wrap,.filter-row,.form-group');
      if(wrap && wrap.children.length===1)wrap.style.display='none';
   }
 });
}

function removePopulationIntro(){
 const tab=document.getElementById('tab-ibge')||document.querySelector('[id*="ibge"]');
 if(!tab)return;
 [...tab.querySelectorAll('p')].forEach(p=>{
   const t=(p.textContent||'').trim();
   if(/Clique nos pontos laranjas/i.test(t))p.style.display='none';
 });
}

function removeHomeAptaCard(){
 const home=document.getElementById('inicio'); if(!home)return;
 [...home.querySelectorAll('.kpi-card')].forEach(card=>{
   const t=(card.textContent||'').toLowerCase();
   if(t.includes('população apta a votar em 2026')||t.includes('populacao apta a votar em 2026'))card.remove();
 });
}

function buildInstitutional(){
 const home=document.getElementById('inicio'); if(!home||document.getElementById(INFO_ID))return;
 const container=home.querySelector('.container')||home;
 const grid=container.querySelector('.kpi-grid');
 const section=document.createElement('section');section.id=INFO_ID;section.innerHTML=`
 <div class="inst-shell">
   <div class="inst-head"><div class="inst-kicker">Panorama municipal</div><div class="inst-title">Itajaí em números</div><div class="inst-sub">Informações institucionais, territoriais e demográficas que contextualizam as análises apresentadas no Atlas Eleitoral.</div></div>
   <div class="inst-grid">
    <article class="inst-card"><div class="inst-icon">${icons.govt}</div><div class="inst-label">Prefeito</div><div class="inst-value name">ROBISON JOSÉ COELHO</div><div class="inst-note">Município de Itajaí</div></article>
    <article class="inst-card"><div class="inst-icon">${icons.area}</div><div class="inst-label">Área Territorial</div><div class="inst-value">289,22 km²</div><div class="inst-note">Território municipal</div></article>
    <article class="inst-card"><div class="inst-icon">${icons.people}</div><div class="inst-label">População no último censo</div><div class="inst-value">264.054</div><div class="inst-note">pessoas • 2022</div></article>
    <article class="inst-card"><div class="inst-icon">${icons.trend}</div><div class="inst-label">População estimada</div><div class="inst-value">294.850</div><div class="inst-note">pessoas • 2025</div></article>
   </div>
 </div>`;
 if(grid)grid.insertAdjacentElement('afterend',section);else container.appendChild(section);
 // Remove painel institucional antigo se existir, evitando duplicidade.
 const old=document.getElementById('atlas-home-dashboard'); if(old)old.remove();
}

function addIcons(){
 document.querySelectorAll('.analytics-kpi,.evo-kpi').forEach((card,i)=>{
   if(card.querySelector('.atlas-card-icon'))return;
   const t=(card.textContent||'').toLowerCase(); let icon=icons.people;
   if(t.includes('biometr'))icon=icons.fingerprint;
   else if(t.includes('voto obrig'))icon=icons.vote;
   else if(t.includes('defici'))icon=icons.accessibility;
   else if(t.includes('partidos'))icon=icons.party;
   else if(t.includes('mais de 10')||t.includes('tempo'))icon=icons.clock;
   else if(t.includes('variação')||t.includes('variacao'))icon=icons.delta;
   else if(t.includes('renovação')||t.includes('renovacao'))icon=icons.renew;
   else if(t.includes('2020')||t.includes('2024'))icon=icons.ballot;
   const box=document.createElement('span');box.className='atlas-card-icon';box.innerHTML=icon;card.appendChild(box);
 });
}

function applyAll(){injectStyles();removeHeaderExtras();removeZoneFilter();removePopulationIntro();removeHomeAptaCard();buildInstitutional();addIcons()}
function init(){applyAll();let timer;const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(applyAll,50)});obs.observe(document.body,{childList:true,subtree:true});setTimeout(applyAll,300);setTimeout(applyAll,1200);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
