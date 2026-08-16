(()=>{
'use strict';
const icons=[
'<path d="M4 21h16M6 21V9l6-5 6 5v12M9 21v-6h6v6"/>',
'<path d="M4 19 9 5l3 8 3-8 5 14M6 15h12"/>',
'<path d="M4 20v-8m5 8V8m5 12V5m5 15V3"/>',
'<path d="M4 17l5-5 4 3 7-8M16 7h4v4"/>'
];
function apply(){const root=document.getElementById('atlas-home-dashboard');if(!root)return false;root.querySelectorAll('.atlas-muni-card').forEach((c,i)=>{if(c.querySelector('.atlas-muni-icon'))return;const d=document.createElement('div');d.className='atlas-muni-icon';d.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[i%icons.length]}</svg>`;c.insertBefore(d,c.firstChild)});return true}
function init(){if(apply())return;const o=new MutationObserver(()=>{if(apply())o.disconnect()});o.observe(document.body,{childList:true,subtree:true});setTimeout(apply,700);setTimeout(apply,1800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();