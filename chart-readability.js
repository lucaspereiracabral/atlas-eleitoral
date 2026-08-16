(()=>{
'use strict';
if(typeof Chart==='undefined'||window.__atlasReadableCharts)return;
window.__atlasReadableCharts=true;
const br=(v,two=false)=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:two?2:0,maximumFractionDigits:two?2:0}).format(Number(v)||0);
const plugin={id:'atlasReadableLabels',afterDatasetsDraw(chart){
  if(chart.config.type!=='bar')return;
  const ctx=chart.ctx, horizontal=chart.options?.indexAxis==='y', two=String(chart.canvas?.id||'').startsWith('evo-');
  ctx.save();ctx.font='600 11px Inter,Arial,sans-serif';ctx.fillStyle='#334155';ctx.textBaseline='middle';
  chart.data.datasets.forEach((ds,di)=>{
    const meta=chart.getDatasetMeta(di);if(meta.hidden)return;
    meta.data.forEach((el,i)=>{
      const raw=Number(ds.data?.[i]);if(!Number.isFinite(raw)||raw===0)return;
      const p=el.getProps(['x','y','base','width','height'],true);let x,y,align='left';
      if(horizontal){x=Math.max(p.x,p.base)+8;y=p.y;align='left';}
      else{x=p.x;y=Math.min(p.y,p.base)-10;align='center';}
      ctx.textAlign=align;ctx.fillText(br(raw,two),x,y);
    });
  });ctx.restore();
}};
Chart.register(plugin);
Chart.defaults.layout=Chart.defaults.layout||{};
setTimeout(()=>{try{Object.values(Chart.instances||{}).forEach(c=>c.update('none'));}catch(e){}},900);
})();