(()=>{
'use strict';
if(!document.getElementById('atlas-recursos-emendas-v2')){
 const s=document.createElement('script');
 s.id='atlas-recursos-emendas-v2';
 s.src='recursos-emendas-v2.js?v=7';
 s.defer=true;
 document.body.appendChild(s);
}
if(!document.getElementById('atlas-admin-usuarios-loader')){
 const a=document.createElement('script');
 a.id='atlas-admin-usuarios-loader';
 a.src='admin-usuarios.js?v=1';
 a.defer=true;
 document.body.appendChild(a);
}
})();
