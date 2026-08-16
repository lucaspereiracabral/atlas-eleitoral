(()=>{
'use strict';
if(typeof Chart==='undefined'||window.__atlasReadableChartsV2)return;
window.__atlasReadableChartsV2=true;

const br=(v,two=false)=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:two?2:0,maximumFractionDigits:two?2:0}).format(Number(v)||0);

const plugin={
  id:'atlasReadableLabelsV2',
  beforeInit(chart){
    if(chart.config.type!=='bar')return;
    chart.options.layout=chart.options.layout||{};
    const p=chart.options.layout.padding||{};
    chart.options.layout.padding={
      top:Math.max(Number(p.top)||0,30),
      right:Math.max(Number(p.right)||0,82),
      bottom:Math.max(Number(p.bottom)||0,10),
      left:Math.max(Number(p.left)||0,8)
    };
  },
  afterDatasetsDraw(chart){
    if(chart.config.type!=='bar')return;
    const ctx=chart.ctx;
    const horizontal=chart.options?.indexAxis==='y';
    const two=String(chart.canvas?.id||'').startsWith('evo-');
    ctx.save();
    ctx.font='700 11px Inter,Arial,sans-serif';
    ctx.textBaseline='middle';

    chart.data.datasets.forEach((ds,di)=>{
      const meta=chart.getDatasetMeta(di);
      if(meta.hidden)return;
      meta.data.forEach((el,i)=>{
        const raw=Number(ds.data?.[i]);
        if(!Number.isFinite(raw)||raw===0)return;
        const p=el.getProps(['x','y','base'],true);
        const text=br(raw,two);
        const padX=5,padY=3;
        const tw=ctx.measureText(text).width;
        let x,y,align;

        if(horizontal){
          x=Math.max(p.x,p.base)+10;
          y=p.y;
          align='left';
        }else{
          x=p.x;
          y=Math.min(p.y,p.base)-12;
          align='center';
        }

        ctx.textAlign=align;
        const boxX=align==='left'?x-padX:x-(tw/2)-padX;
        const boxY=y-8-padY;
        ctx.fillStyle='rgba(255,255,255,.96)';
        ctx.strokeStyle='rgba(203,213,225,.9)';
        ctx.lineWidth=1;
        const w=tw+padX*2,h=16+padY*2;
        ctx.beginPath();
        if(ctx.roundRect)ctx.roundRect(boxX,boxY,w,h,5);else ctx.rect(boxX,boxY,w,h);
        ctx.fill();ctx.stroke();
        ctx.fillStyle='#0f172a';
        ctx.fillText(text,x,y);
      });
    });
    ctx.restore();
  }
};

Chart.register(plugin);

function melhorar(c){
  if(!c||c.config.type!=='bar')return;
  c.options.layout=c.options.layout||{};
  c.options.layout.padding={...(c.options.layout.padding||{}),top:32,right:86,bottom:12};
  c.data.datasets.forEach(ds=>{
    if(ds.categoryPercentage==null)ds.categoryPercentage=.68;
    if(ds.barPercentage==null)ds.barPercentage=.68;
    if(ds.borderRadius==null)ds.borderRadius=7;
  });
  if(c.options.scales?.x?.grid)c.options.scales.x.grid.color='rgba(226,232,240,.75)';
  if(c.options.scales?.y?.grid)c.options.scales.y.grid.color='rgba(226,232,240,.55)';
  c.update('none');
}

setTimeout(()=>{try{Object.values(Chart.instances||{}).forEach(melhorar);}catch(e){}},900);
setInterval(()=>{try{Object.values(Chart.instances||{}).forEach(melhorar);}catch(e){}},2500);
})();