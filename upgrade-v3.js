(()=>{
'use strict';
function css(href,id){if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
function js(src,id,delay=0){if(document.getElementById(id))return;setTimeout(()=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.body.appendChild(s)},delay)}

css('visual-v3.css?v=2','atlas-visual-v3');
js('chart-readability.js?v=2','atlas-chart-readability',250);
js('home-v3.js?v=2','atlas-home-v3',450);

// Mantém a análise eleitoral apenas em 2020 x 2024.
// O evolution.js original, carregado pelo future-modules.js, permanece como fonte da aba.

function removerComparecimento(){
  const ids=['nav-turnout','tab-turnout','atlas-turnout-v3','atlas-turnout-loader'];
  ids.forEach(id=>document.getElementById(id)?.remove());

  document.querySelectorAll('header nav button, header nav a, .nav-btn').forEach(el=>{
    const t=(el.textContent||'').trim().toLowerCase();
    if(t.includes('comparecimento')||t.includes('abstenção')||t.includes('abstencao')) el.remove();
  });

  document.querySelectorAll('.tab-content, section').forEach(el=>{
    const id=(el.id||'').toLowerCase();
    if(id.includes('turnout')||id.includes('comparecimento')) el.remove();
  });
}

removerComparecimento();
const obs=new MutationObserver(()=>removerComparecimento());
obs.observe(document.body,{childList:true,subtree:true});
setTimeout(()=>{removerComparecimento();obs.disconnect();},8000);
})();