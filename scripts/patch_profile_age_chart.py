from pathlib import Path

p = Path('analytics.js')
s = p.read_text(encoding='utf-8')
start = s.find("function ageChart(obj,selected=''){")
end = s.find("\nfunction donut", start)
if start < 0 or end < 0:
    raise SystemExit('ageChart function not found')

new = """function ageChart(obj,selected=''){const id='ec-faixa';destroy(id);const el=document.getElementById(id);const wrap=el?.parentElement;if(!el||!wrap)return;if(window.ChartDataLabels){try{Chart.register(window.ChartDataLabels)}catch(e){}}const ageStart=label=>{const m=String(label).match(/\\d+/);return m?Number(m[0]):999};const entries=Object.entries(obj).sort((a,b)=>ageStart(a[0])-ageStart(b[0]));const mobile=window.matchMedia('(max-width:700px)').matches;wrap.style.height=Math.max(mobile?760:820,entries.length*(mobile?38:40)+110)+'px';const labels=entries.map(x=>x[0]),values=entries.map(x=>x[1]);const normal='#2563eb',muted='#cbd5e1',active='#0f172a';charts[id]=new Chart(el,{type:'bar',data:{labels,datasets:[{data:values,backgroundColor:labels.map(l=>selected?(l===selected?active:muted):normal),borderWidth:0,borderRadius:7,barThickness:mobile?22:24,maxBarThickness:26}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',interaction:{mode:'nearest',intersect:true},onHover:(event,elements)=>{if(event?.native?.target)event.native.target.style.cursor=elements.length?'pointer':'default'},onClick:(event,elements)=>{if(!elements.length)return;const faixa=labels[elements[0].index];const sel=document.getElementById('ef-faixa');if(!sel)return;sel.value=sel.value===faixa?'':faixa;updateE()},layout:{padding:{left:4,right:mobile?74:92,top:8,bottom:6}},plugins:{legend:{display:false},datalabels:{display:true,anchor:'end',align:'right',offset:8,clip:false,clamp:true,color:'#475569',font:{size:mobile?11:12,weight:'700'},formatter:v=>fmt(v)},tooltip:{callbacks:{title:items=>items[0]?.label||'',label:c=>` ${fmt(c.raw)} eleitores`}}},scales:{x:{beginAtZero:true,grace:'24%',grid:{color:'#eef2f7'},ticks:{font:{size:mobile?10:11},callback:v=>fmt(v)}},y:{grid:{display:false},ticks:{autoSkip:false,font:{size:mobile?12:12,weight:'600'},color:'#475569',padding:10}}}}})}"""

s = s[:start] + new + s[end:]
p.write_text(s, encoding='utf-8')
