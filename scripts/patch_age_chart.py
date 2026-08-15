from pathlib import Path
import re

p = Path('analytics.js')
s = p.read_text(encoding='utf-8')

new_age = r'''function ageChart(obj,selected=''){const id='ec-faixa';destroy(id);const el=document.getElementById(id);const wrap=el?.parentElement;if(!el||!wrap)return;if(window.ChartDataLabels){try{Chart.register(window.ChartDataLabels)}catch(e){}}const ageStart=label=>{const m=String(label).match(/\d+/);return m?Number(m[0]):999};const entries=Object.entries(obj).sort((a,b)=>ageStart(a[0])-ageStart(b[0]));const mobile=window.matchMedia('(max-width:700px)').matches;wrap.style.height=Math.max(mobile?650:620,entries.length*(mobile?34:32)+70)+'px';const labels=entries.map(x=>x[0]),values=entries.map(x=>x[1]);const normal='#38bdf8',muted='#cbd5e1',active='#0f172a';charts[id]=new Chart(el,{type:'bar',data:{labels,datasets:[{data:values,backgroundColor:labels.map(l=>selected?(l===selected?active:muted):normal),borderWidth:0,borderRadius:5,barThickness:mobile?16:18,maxBarThickness:20}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',interaction:{mode:'nearest',intersect:true},onHover:(event,elements)=>{if(event?.native?.target)event.native.target.style.cursor=elements.length?'pointer':'default'},onClick:(event,elements)=>{if(!elements.length)return;const faixa=labels[elements[0].index];const sel=document.getElementById('ef-faixa');if(!sel)return;sel.value=sel.value===faixa?'':faixa;updateE()},layout:{padding:{right:mobile?54:72}},plugins:{legend:{display:false},datalabels:{display:true,anchor:'end',align:'right',offset:5,clip:false,clamp:true,color:'#475569',font:{size:mobile?10:11,weight:'700'},formatter:v=>fmt(v)},tooltip:{callbacks:{title:items=>items[0]?.label||'',label:c=>` ${fmt(c.raw)} eleitores`}}},scales:{x:{beginAtZero:true,grace:'20%',grid:{color:'#f1f5f9'},ticks:{font:{size:mobile?9:10},callback:v=>fmt(v)}},y:{grid:{display:false},ticks:{autoSkip:false,font:{size:mobile?10:11},color:'#475569',padding:6}}}}})}
function donut'''

s, n = re.subn(r"function ageChart\(obj\)\{.*?\}\nfunction donut", lambda _: new_age, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('ageChart patch failed')

new_update = r'''function updateE(){const g=document.getElementById('ef-genero')?.value||'',f=document.getElementById('ef-faixa')?.value||'',i=document.getElementById('ef-instrucao')?.value||'';let ageBase=eleitorado;if(g)ageBase=ageBase.filter(r=>r.genero===g);if(i)ageBase=ageBase.filter(r=>r.grau_instrucao===i);let a=ageBase;if(f)a=a.filter(r=>r.faixa_etaria===f);const t=sum(a,'qtd_eleitores'),b=sum(a,'qtd_biometria');document.getElementById('ek-total').textContent=fmt(t);document.getElementById('ek-bio').textContent=fmt(b);document.getElementById('ek-biop').textContent=t?`${(100*b/t).toFixed(1).replace('.',',')}% do eleitorado`:'—';document.getElementById('ek-obr').textContent=fmt(sum(a,'qtd_voto_obrigatorio'));document.getElementById('ek-def').textContent=fmt(sum(a,'qtd_deficiencia'));ageChart(group(ageBase,'faixa_etaria','qtd_eleitores'),f);donut('ec-genero',group(a,'genero','qtd_eleitores'));chart('ec-inst',group(a,'grau_instrucao','qtd_eleitores'),'bar',true);donut('ec-raca',group(a,'cor_raca','qtd_eleitores'));chart('ec-civil',group(a,'estado_civil','qtd_eleitores'),'bar',true)}
async function loadFiliados'''

s, n = re.subn(r"function updateE\(\)\{.*?\}\nasync function loadFiliados", lambda _: new_update, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('updateE patch failed')

p.write_text(s, encoding='utf-8')
