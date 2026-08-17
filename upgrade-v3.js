(()=>{
'use strict';
function css(href,id){if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
function js(src,id,delay=0){if(document.getElementById(id))return;setTimeout(()=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.body.appendChild(s)},delay)}

// CSS estrutural dos painéis analíticos precisa ser carregado antes do tema visual.
css('analytics.css?v=4','atlas-analytics-base');
css('visual-v3.css?v=3','atlas-visual-v3');
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

function repararGraficos(){
  const tentativas=[80,220,500,900];
  tentativas.forEach(ms=>setTimeout(()=>{
    try{
      if(typeof Chart==='undefined') return;
      Object.values(Chart.instances||{}).forEach(chart=>{
        try{
          chart.resize();
          chart.update('none');
        }catch(e){}
      });
    }catch(e){}
  },ms));
}

// Charts criados em abas ocultas podem nascer com dimensões incorretas.
// Sempre que uma aba analítica for aberta, recalculamos o tamanho do canvas.
document.addEventListener('click',event=>{
  const btn=event.target.closest('header nav .nav-btn');
  if(!btn)return;
  const txt=(btn.textContent||'').toLowerCase();
  if(txt.includes('perfil')||txt.includes('filiação')||txt.includes('filiacao')||txt.includes('evolução')||txt.includes('evolucao')){
    repararGraficos();
  }
});

// Também repara quando a classe active é trocada programaticamente.
const chartObserver=new MutationObserver(muts=>{
  if(muts.some(m=>m.type==='attributes'&&m.attributeName==='class'&&m.target.classList?.contains('active'))){
    repararGraficos();
  }
});
setTimeout(()=>{
  document.querySelectorAll('.tab-content').forEach(el=>chartObserver.observe(el,{attributes:true,attributeFilter:['class']}));
},100);

removerComparecimento();
const obs=new MutationObserver(()=>removerComparecimento());
obs.observe(document.body,{childList:true,subtree:true});
setTimeout(()=>{removerComparecimento();obs.disconnect();repararGraficos();},8000);
})();