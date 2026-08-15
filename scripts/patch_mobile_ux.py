from pathlib import Path
import re

js = Path('analytics.js').read_text(encoding='utf-8')

new_chart = """function chart(id,obj,type='bar',horizontal=false){
    destroy(id);
    const el=document.getElementById(id);if(!el)return;
    if(window.ChartDataLabels){try{Chart.register(window.ChartDataLabels)}catch(e){}}
    const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]);
    const mobile=window.matchMedia('(max-width:700px)').matches;
    const dl=horizontal
      ? {display:true,anchor:'end',align:'right',offset:5,clip:false,clamp:true,color:'#475569',font:{size:mobile?9:10,weight:'700'},formatter:v=>fmt(v)}
      : {display:true,anchor:'end',align:'top',offset:4,clip:false,clamp:true,color:'#475569',font:{size:mobile?9:10,weight:'700'},formatter:v=>fmt(v)};
    charts[id]=new Chart(el,{type,data:{labels:entries.map(x=>x[0]),datasets:[{data:entries.map(x=>x[1]),borderWidth:0,borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:horizontal?'y':'x',layout:{padding:horizontal?{right:mobile?44:64}:{top:24}},plugins:{legend:{display:false},datalabels:dl,tooltip:{callbacks:{label:c=>fmt(c.raw)}}},scales:{x:{grid:{display:false},ticks:{font:{size:10}},grace:horizontal?'18%':'8%'},y:{grid:{color:'#f1f5f9'},ticks:{font:{size:10}}}}}})
}
function donut"""
js, n = re.subn(r"function chart\(id,obj,type='bar',horizontal=false\)\{.*?\}\nfunction donut", new_chart, js, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not patch generic chart function')

new_party = """function partyChart(obj,selected){
    destroy('fc-partido');
    const el=document.getElementById('fc-partido');
    const wrap=document.getElementById('fc-partido-wrap');
    if(!el||!wrap)return;
    if(window.ChartDataLabels){try{Chart.register(window.ChartDataLabels)}catch(e){}}
    const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]);
    const mobile=window.matchMedia('(max-width:700px)').matches;
    wrap.style.height=Math.max(mobile?700:820,entries.length*(mobile?38:40)+110)+'px';
    const labels=entries.map(x=>x[0]);
    const values=entries.map(x=>x[1]);
    const normal='#2563eb',muted='#cbd5e1',active='#0f172a';
    charts['fc-partido']=new Chart(el,{type:'bar',data:{labels,datasets:[{data:values,backgroundColor:labels.map(l=>selected?(l===selected?active:muted):normal),borderWidth:0,borderRadius:6,borderSkipped:false,barThickness:mobile?18:22,maxBarThickness:24}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',interaction:{mode:'nearest',intersect:true},onHover:(event,elements)=>{event.native.target.style.cursor=elements.length?'pointer':'default'},onClick:(event,elements)=>{if(!elements.length)return;const partido=labels[elements[0].index];const sel=document.getElementById('ff-partido');if(!sel)return;sel.value=sel.value===partido?'':partido;updateF()},layout:{padding:{right:mobile?54:76}},plugins:{legend:{display:false},datalabels:{display:true,anchor:'end',align:'right',offset:6,clip:false,clamp:true,color:'#475569',font:{size:mobile?10:11,weight:'700'},formatter:v=>fmt(v)},tooltip:{callbacks:{title:items=>items[0]?.label||'',label:c=>` ${fmt(c.raw)} filiados`}}},scales:{x:{beginAtZero:true,grace:'22%',grid:{color:'#f1f5f9'},ticks:{font:{size:mobile?9:10},callback:v=>fmt(v)}},y:{grid:{display:false},ticks:{autoSkip:false,font:{size:mobile?10:11,weight:'600'},color:'#334155',padding:8}}}}})
}
function updateF"""
js, n = re.subn(r"function partyChart\(obj,selected\)\{.*?\}\nfunction updateF", new_party, js, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not patch party chart')
Path('analytics.js').write_text(js, encoding='utf-8')

html = Path('index.html').read_text(encoding='utf-8')
marker = "        atualizarBuffer();\n    }\n\n    function fecharBuffer() {"
replacement = """        atualizarBuffer();

        const sidebarBuffer = document.querySelector('#mapas-ibge .sidebar');
        if(sidebarBuffer) sidebarBuffer.classList.add('buffer-active');
        if(window.matchMedia('(max-width:700px)').matches) {
            setTimeout(() => {
                document.getElementById('buffer-tool')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }
    }

    function fecharBuffer() {"""
if marker in html:
    html = html.replace(marker, replacement, 1)
elif "sidebarBuffer.classList.add('buffer-active')" not in html:
    raise SystemExit('Could not locate abrirBuffer insertion point')

marker2 = "        if(bufferCircle) mapIBGE.removeLayer(bufferCircle);\n        mapIBGE.setView([-26.91, -48.66], 13);"
replacement2 = """        if(bufferCircle) mapIBGE.removeLayer(bufferCircle);
        document.querySelector('#mapas-ibge .sidebar')?.classList.remove('buffer-active');
        mapIBGE.setView([-26.91, -48.66], 13);"""
if marker2 in html:
    html = html.replace(marker2, replacement2, 1)
elif "classList.remove('buffer-active')" not in html:
    raise SystemExit('Could not locate fecharBuffer insertion point')
Path('index.html').write_text(html, encoding='utf-8')

css = Path('analytics.css').read_text(encoding='utf-8')
patch = """

/* Mobile UX refinements: prioritize data over map */
@media(max-width:700px){
  #mapas-tre .sidebar{max-height:54dvh!important;min-height:0!important}
  #mapas-tre .sidebar-header{padding:11px 12px!important}
  #mapas-tre .sidebar-header p{margin-top:3px!important}
  #mapas-tre .list-container{max-height:34dvh!important;min-height:150px!important}
  #mapas-tre .map-container{height:40dvh!important;min-height:40dvh!important}
  #tre-resumo{font-size:11px!important;font-weight:800!important;color:#475569!important}

  #mapas-ibge .sidebar{max-height:none!important;min-height:0!important;overflow:visible!important}
  #mapas-ibge .sidebar-header{padding:12px!important}
  #mapas-ibge .map-container{height:41dvh!important;min-height:41dvh!important}
  #mapas-ibge .legend{padding:12px!important;grid-template-columns:1fr 1fr!important;row-gap:3px!important}
  #mapas-ibge .legend-title{margin-bottom:7px!important;font-size:10px!important}
  #mapas-ibge .legend-item{font-size:10px!important;line-height:1.25!important;margin-bottom:4px!important}
  #mapas-ibge .sidebar.buffer-active .legend{display:none!important}
  #mapas-ibge .sidebar.buffer-active .sidebar-header{display:none!important}
  #mapas-ibge .buffer-tool{margin:8px!important;padding:16px!important;border:1px solid #fbbf24!important;border-radius:12px!important;background:#fffdf5!important;box-shadow:0 10px 28px -22px rgba(146,64,14,.65)!important}
  #mapas-ibge .buffer-tool h4{font-size:13px!important;line-height:1.35!important;margin-bottom:13px!important}
  #mapas-ibge .slider-container{font-size:11px!important;margin-bottom:5px!important}
  #mapas-ibge #buffer-raio{font-size:15px!important}
  #mapas-ibge #buffer-slider{height:30px!important}
  #mapas-ibge .buffer-result{margin-top:9px!important;padding:13px!important;background:#fffbeb!important}
  #mapas-ibge .buffer-result span{font-size:9px!important;letter-spacing:.25px!important}
  #mapas-ibge .buffer-result strong{font-size:27px!important;margin-top:4px!important}
  .party-chart-wrap{min-width:0!important;overflow:visible!important}
}
@media(max-width:390px){
  #mapas-tre .map-container{height:37dvh!important;min-height:37dvh!important}
  #mapas-ibge .map-container{height:38dvh!important;min-height:38dvh!important}
  #mapas-tre .sidebar{max-height:57dvh!important}
}
"""
if 'Mobile UX refinements: prioritize data over map' not in css:
    css += patch
Path('analytics.css').write_text(css, encoding='utf-8')
