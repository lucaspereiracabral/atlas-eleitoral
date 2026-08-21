(()=>{
'use strict';
const KEY='atlas_access_request_v2';
const MSG='Solicitação enviada com sucesso. Seu acesso está sendo analisado pelo administrador. Assim que a solicitação for aprovada, você poderá entrar no Atlas.';

function css(){
  if(document.getElementById('atlas-request-css')) return;
  const s=document.createElement('style');
  s.id='atlas-request-css';
  s.textContent=`
    .auth-request-button{width:100%;height:42px;margin-top:10px;border:1px solid #cbd5e1;border-radius:9px;background:#f8fafc;color:#334155;font-size:11px;font-weight:800;cursor:pointer;transition:.18s ease}
    .auth-request-button:hover{background:#eff6ff;border-color:#93c5fd;color:#1d4ed8}
    .auth-request-button:disabled{opacity:.65;cursor:wait}
    .auth-request-help{margin-top:10px;font-size:9.5px;line-height:1.5;color:#94a3b8;text-align:center}
    .auth-request-ok{color:#166534!important;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px!important;min-height:auto!important;line-height:1.45}
    .auth-request-error{color:#991b1b!important;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px!important;min-height:auto!important;line-height:1.45}
  `;
  document.head.appendChild(s);
}

function setPendingFlag(){
  try{localStorage.setItem(KEY,'1')}catch(e){}
  try{sessionStorage.setItem(KEY,'1')}catch(e){}
}
function hasPendingFlag(){
  try{if(localStorage.getItem(KEY)==='1') return true}catch(e){}
  try{if(sessionStorage.getItem(KEY)==='1') return true}catch(e){}
  return false;
}
function clearPendingFlag(){
  try{localStorage.removeItem(KEY)}catch(e){}
  try{sessionStorage.removeItem(KEY)}catch(e){}
}
function message(text,type='ok'){
  if(typeof setAuthMessage==='function') setAuthMessage(text);
  const el=document.getElementById('auth-message');
  if(el){el.classList.remove('auth-request-ok','auth-request-error');el.classList.add(type==='error'?'auth-request-error':'auth-request-ok')}
}
function resetButton(){
  const b=document.getElementById('request-access-button');
  if(b){b.disabled=false;b.textContent='Solicitar acesso'}
}

function montar(){
  css();
  const login=document.getElementById('google-login-button');
  if(!login||document.getElementById('request-access-button')) return;
  const b=document.createElement('button');
  b.id='request-access-button';
  b.className='auth-request-button';
  b.type='button';
  b.textContent='Solicitar acesso';
  b.onclick=solicitar;
  login.insertAdjacentElement('afterend',b);
  const help=document.createElement('div');
  help.className='auth-request-help';
  help.textContent='Ainda não possui autorização? Identifique-se com sua conta Google. A solicitação ficará pendente até a aprovação do administrador.';
  b.insertAdjacentElement('afterend',help);
  const footer=document.querySelector('.auth-footer');
  if(footer) footer.textContent='O acesso à plataforma depende de aprovação administrativa.';
}

async function solicitar(){
  const b=document.getElementById('request-access-button');
  if(b){b.disabled=true;b.textContent='Abrindo Google…'}
  clearPendingFlag();
  setPendingFlag();
  try{
    // Evita que uma sessão antiga do navegador seja reutilizada ao solicitar acesso.
    try{await supabaseClient.auth.signOut({scope:'local'})}catch(e){console.warn('Não foi possível limpar sessão anterior:',e)}

    const redirectTo=`${window.location.origin}${window.location.pathname}`;
    const {error}=await supabaseClient.auth.signInWithOAuth({
      provider:'google',
      options:{
        redirectTo,
        queryParams:{access_type:'offline',prompt:'select_account'}
      }
    });
    if(error) throw error;
  }catch(e){
    console.error('Erro ao iniciar solicitação:',e);
    clearPendingFlag();
    resetButton();
    message('Não foi possível abrir a autenticação do Google para registrar sua solicitação. Tente novamente.','error');
  }
}

async function registrar(session){
  if(!hasPendingFlag()||!session?.user) return false;
  try{
    const {data,error}=await supabaseClient.rpc('solicitar_acesso_atlas');
    if(error) throw error;
    clearPendingFlag();
    if(typeof bloquearAtlas==='function') bloquearAtlas();
    message(MSG,'ok');
    resetButton();
    console.info('Solicitação de acesso registrada:',data,session.user.email);
    return true;
  }catch(e){
    console.error('Erro ao registrar solicitação no Supabase:',e);
    resetButton();
    message('Sua conta Google foi autenticada, mas não foi possível registrar a solicitação. Tente novamente em alguns instantes.','error');
    return false;
  }
}

async function mostrarEstadoAtual(){
  try{
    const {data:{session}}=await supabaseClient.auth.getSession();
    if(!session?.user) return;
    if(hasPendingFlag()){
      await registrar(session);
      return;
    }
    const {data}=await supabaseClient.from('usuarios_autorizados')
      .select('ativo,solicitacao_status')
      .eq('user_id',session.user.id)
      .maybeSingle();
    if(data && !data.ativo && data.solicitacao_status==='pendente'){
      if(typeof bloquearAtlas==='function') bloquearAtlas();
      message('Sua solicitação de acesso está sendo analisada pelo administrador. Você poderá entrar assim que ela for aprovada.','ok');
    }
  }catch(e){console.warn('Falha ao verificar solicitação:',e)}
}

function boot(){
  montar();
  mostrarEstadoAtual();
  supabaseClient.auth.onAuthStateChange((event,session)=>{
    if((event==='SIGNED_IN'||event==='INITIAL_SESSION')&&session?.user){
      setTimeout(()=>registrar(session),150);
    }
  });
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();
})();