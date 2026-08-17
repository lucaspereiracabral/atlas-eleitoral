// UI FIXES V1 — ordenação etária + deduplicação segura dos locais TRE
(()=>{
'use strict';

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');

function idadeOrdem(label){
  const s=String(label||'');
  if(/100\s*anos\s*ou\s*mais/i.test(s)) return 100;
  const m=s.match(/\d+/);
  return m ? Number(m[0]) : 9999;
}

function ordenarSelectEtario(sel){
  if(!sel || sel.dataset.atlasAgeSorted==='1') return;
  const opts=[...sel.options];
  if(opts.length<2) return;
  const primeira=opts.shift();
  opts.sort((a,b)=>{
    const na=idadeOrdem(a.textContent), nb=idadeOrdem(b.textContent);
    if(na!==nb) return na-nb;
    return String(a.textContent).localeCompare(String(b.textContent),'pt-BR');
  });
  sel.innerHTML='';
  sel.appendChild(primeira);
  opts.forEach(o=>sel.appendChild(o));
  sel.dataset.atlasAgeSorted='1';
}

function ordenarFiltrosEtarios(){
  ordenarSelectEtario(document.getElementById('ef-faixa'));
  ordenarSelectEtario(document.getElementById('ff-faixa'));
}

function deduplicarLocaisTRE(){
  try{
    if(window.__atlasTreDeduplicado) return true;
    if(typeof dadosLocais==='undefined' || !Array.isArray(dadosLocais) || !dadosLocais.length) return false;

    const mapa=new Map();
    for(const d of dadosLocais){
      const chave=`${norm(d.nome)}|${norm(d.bairro)}`;
      const anterior=mapa.get(chave);
      if(!anterior){
        mapa.set(chave,{...d});
      }else{
        // Duplicatas observadas na base repetem o mesmo total do local.
        // Mantemos uma única ocorrência e o maior valor, evitando soma artificial.
        if(Number(d.eleitores||0)>Number(anterior.eleitores||0)) anterior.eleitores=Number(d.eleitores||0);
        if((!anterior.end || anterior.end==='N/A') && d.end) anterior.end=d.end;
        if(!anterior.latlng && d.latlng) anterior.latlng=d.latlng;
      }
    }

    const antes=dadosLocais.length;
    dadosLocais=[...mapa.values()];

    // Reconstrói o eleitorado por bairro usando somente os locais únicos.
    if(typeof elPorBairro!=='undefined'){
      const novo={};
      dadosLocais.forEach(d=>{novo[d.bairro]=(novo[d.bairro]||0)+Number(d.eleitores||0)});
      elPorBairro=novo;
    }

    window.__atlasTreDeduplicado=true;
    console.info(`[ATLAS] Locais TRE deduplicados: ${antes} → ${dadosLocais.length}`);
    if(typeof filtrarTRE==='function') filtrarTRE();
    return true;
  }catch(e){
    console.error('[ATLAS] Falha ao deduplicar locais TRE:',e);
    return false;
  }
}

function expandirRotuloEleitores(root=document){
  const lista=root.querySelector?.('#listaTRE');
  if(!lista) return;
  lista.querySelectorAll('.badge.blue').forEach(el=>{
    el.textContent=String(el.textContent||'').replace(/\s*el\.\s*$/i,' eleitores');
  });
}

function aplicar(){
  ordenarFiltrosEtarios();
  expandirRotuloEleitores();
}

function iniciar(){
  aplicar();

  let estavel=0, ultimo=-1, tentativas=0;
  const timer=setInterval(()=>{
    tentativas++;
    try{
      if(typeof dadosLocais!=='undefined' && Array.isArray(dadosLocais) && dadosLocais.length){
        if(dadosLocais.length===ultimo) estavel++; else {ultimo=dadosLocais.length;estavel=0;}
        if(estavel>=2 && deduplicarLocaisTRE()) clearInterval(timer);
      }
    }catch(_){ }
    if(tentativas>=40) clearInterval(timer);
  },500);

  let debounce;
  const obs=new MutationObserver(()=>{
    clearTimeout(debounce);
    debounce=setTimeout(aplicar,40);
  });
  obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(aplicar,300);
  setTimeout(aplicar,1200);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar);
else iniciar();
})();
