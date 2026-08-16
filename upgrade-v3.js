(()=>{
'use strict';
function css(href,id){if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
function js(src,id,delay=0){if(document.getElementById(id))return;setTimeout(()=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.body.appendChild(s)},delay)}
css('visual-v3.css?v=1','atlas-visual-v3');
js('chart-readability.js?v=1','atlas-chart-readability',250);
js('home-v3.js?v=1','atlas-home-v3',450);
// Aguarda os módulos antigos terminarem e então assume as abas analíticas.
js('turnout-v3.js?v=1','atlas-turnout-v3',900);
js('evolution-v2.js?v=1','atlas-evolution-v2',1100);
})();