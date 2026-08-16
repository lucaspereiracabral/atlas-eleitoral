(() => {
  const DASHBOARD_ID = 'atlas-home-dashboard';
  const STYLE_ID = 'atlas-home-dashboard-style';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${DASHBOARD_ID} { margin: 22px 0 30px; }
      .atlas-home-shell { background:#f7f9fc; border:1px solid #e7ebf2; border-radius:24px; padding:22px; box-shadow:0 12px 36px rgba(15,23,42,.07); }
      .atlas-home-top { display:flex; gap:18px; align-items:flex-start; justify-content:space-between; margin-bottom:18px; }
      .atlas-home-kicker { font-size:12px; font-weight:800; letter-spacing:.14em; color:#64748b; text-transform:uppercase; margin-bottom:6px; }
      .atlas-home-title { margin:0; font-size:28px; line-height:1.12; color:#0f172a; letter-spacing:-.03em; }
      .atlas-home-subtitle { margin:8px 0 0; max-width:760px; color:#64748b; font-size:15px; line-height:1.55; }
      .atlas-home-badge { flex:0 0 auto; border:1px solid #dbe4f0; background:#fff; color:#334155; padding:9px 12px; border-radius:999px; font-size:12px; font-weight:700; box-shadow:0 5px 18px rgba(15,23,42,.05); }
      .atlas-muni-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-top:18px; }
      .atlas-muni-card { background:#fff; border:1px solid #e5eaf1; border-radius:18px; padding:18px; min-height:126px; position:relative; overflow:hidden; box-shadow:0 7px 20px rgba(15,23,42,.045); }
      .atlas-muni-card::after { content:''; position:absolute; right:-22px; top:-22px; width:76px; height:76px; border-radius:50%; background:linear-gradient(135deg,rgba(37,99,235,.12),rgba(14,165,233,.03)); }
      .atlas-muni-label { font-size:11px; font-weight:800; letter-spacing:.09em; color:#718096; text-transform:uppercase; margin-bottom:13px; }
      .atlas-muni-value { color:#0f172a; font-size:26px; line-height:1.08; font-weight:800; letter-spacing:-.035em; position:relative; z-index:1; }
      .atlas-muni-value.name { font-size:20px; line-height:1.22; max-width:240px; }
      .atlas-muni-note { margin-top:8px; color:#94a3b8; font-size:12px; font-weight:600; }
      .atlas-home-lower { display:grid; grid-template-columns:1.28fr .72fr; gap:14px; margin-top:14px; }
      .atlas-panel { background:#fff; border:1px solid #e5eaf1; border-radius:18px; padding:18px; box-shadow:0 7px 20px rgba(15,23,42,.04); }
      .atlas-panel-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:16px; }
      .atlas-panel-title { margin:0; color:#0f172a; font-size:16px; font-weight:800; }
      .atlas-panel-sub { margin:4px 0 0; color:#94a3b8; font-size:12px; line-height:1.4; }
      .atlas-pop-bars { display:grid; gap:15px; }
      .atlas-pop-row { display:grid; grid-template-columns:132px 1fr 96px; align-items:center; gap:12px; }
      .atlas-pop-name { color:#475569; font-size:12px; font-weight:700; }
      .atlas-pop-track { height:18px; border-radius:999px; background:#edf2f7; overflow:hidden; position:relative; }
      .atlas-pop-fill { height:100%; border-radius:999px; background:linear-gradient(90deg,#2563eb,#38bdf8); box-shadow:inset 0 0 0 1px rgba(255,255,255,.35); }
      .atlas-pop-fill.est { background:linear-gradient(90deg,#0f766e,#2dd4bf); }
      .atlas-pop-number { text-align:right; color:#0f172a; font-size:13px; font-weight:800; }
      .atlas-growth { margin-top:15px; padding:12px 14px; border-radius:14px; background:#f0fdf4; border:1px solid #dcfce7; color:#166534; font-size:13px; font-weight:700; }
      .atlas-shortcuts { display:grid; gap:9px; }
      .atlas-shortcut { border:1px solid #e5eaf1; background:#f8fafc; color:#334155; border-radius:13px; padding:12px 14px; font-size:13px; font-weight:750; cursor:pointer; transition:.18s ease; text-align:left; }
      .atlas-shortcut:hover { transform:translateY(-1px); background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
      @media (max-width: 980px) {
        .atlas-muni-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .atlas-home-lower { grid-template-columns:1fr; }
      }
      @media (max-width: 640px) {
        #${DASHBOARD_ID} { margin:14px 0 22px; }
        .atlas-home-shell { padding:14px; border-radius:18px; }
        .atlas-home-top { display:block; }
        .atlas-home-badge { display:inline-flex; margin-top:12px; }
        .atlas-home-title { font-size:24px; }
        .atlas-muni-grid { grid-template-columns:1fr 1fr; gap:10px; }
        .atlas-muni-card { padding:15px; min-height:112px; border-radius:15px; }
        .atlas-muni-value { font-size:22px; }
        .atlas-muni-value.name { font-size:16px; }
        .atlas-pop-row { grid-template-columns:95px 1fr; gap:8px; }
        .atlas-pop-number { grid-column:2; text-align:left; margin-top:-5px; font-size:12px; }
      }
      @media (max-width: 430px) {
        .atlas-muni-grid { grid-template-columns:1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function findByText(text) {
    const nodes = document.querySelectorAll('h1,h2,h3,h4,p,div,span');
    for (const el of nodes) {
      const t = (el.textContent || '').trim();
      if (t === text || t.includes(text)) return el;
    }
    return null;
  }

  function goToTab(labels) {
    const els = [...document.querySelectorAll('button,a,[role="tab"],.nav-item,.tab-btn,.menu-item')];
    const target = els.find(el => labels.some(label => (el.textContent || '').trim().toLowerCase().includes(label)));
    if (target) target.click();
  }

  function buildDashboard() {
    if (document.getElementById(DASHBOARD_ID)) return;
    injectStyles();

    const welcome = findByText('Bem-vindo ao Atlas Eleitoral');
    if (!welcome) return;

    let anchor = welcome.closest('section,article,.hero,.card,.home-hero,.welcome-card');
    if (!anchor) anchor = welcome.parentElement;
    if (!anchor || !anchor.parentElement) return;

    const wrap = document.createElement('section');
    wrap.id = DASHBOARD_ID;
    wrap.innerHTML = `
      <div class="atlas-home-shell">
        <div class="atlas-home-top">
          <div>
            <div class="atlas-home-kicker">Panorama municipal</div>
            <h2 class="atlas-home-title">Itajaí em números</h2>
            <p class="atlas-home-subtitle">Indicadores territoriais e demográficos para contextualizar a leitura eleitoral do município e apoiar análises comparativas dentro do Atlas.</p>
          </div>
          <div class="atlas-home-badge">Atualização de referência • 2025</div>
        </div>

        <div class="atlas-muni-grid">
          <article class="atlas-muni-card">
            <div class="atlas-muni-label">Prefeito</div>
            <div class="atlas-muni-value name">ROBISON JOSÉ COELHO</div>
            <div class="atlas-muni-note">Município de Itajaí</div>
          </article>
          <article class="atlas-muni-card">
            <div class="atlas-muni-label">Área territorial</div>
            <div class="atlas-muni-value">289,215 km²</div>
            <div class="atlas-muni-note">Território municipal</div>
          </article>
          <article class="atlas-muni-card">
            <div class="atlas-muni-label">População • Censo 2022</div>
            <div class="atlas-muni-value">264.054</div>
            <div class="atlas-muni-note">pessoas</div>
          </article>
          <article class="atlas-muni-card">
            <div class="atlas-muni-label">População estimada • 2025</div>
            <div class="atlas-muni-value">294.850</div>
            <div class="atlas-muni-note">pessoas</div>
          </article>
        </div>

        <div class="atlas-home-lower">
          <div class="atlas-panel">
            <div class="atlas-panel-head">
              <div>
                <h3 class="atlas-panel-title">Evolução populacional</h3>
                <p class="atlas-panel-sub">Comparação entre o Censo 2022 e a estimativa populacional de 2025.</p>
              </div>
            </div>
            <div class="atlas-pop-bars">
              <div class="atlas-pop-row">
                <div class="atlas-pop-name">Censo 2022</div>
                <div class="atlas-pop-track"><div class="atlas-pop-fill" style="width:89.55%"></div></div>
                <div class="atlas-pop-number">264.054</div>
              </div>
              <div class="atlas-pop-row">
                <div class="atlas-pop-name">Estimativa 2025</div>
                <div class="atlas-pop-track"><div class="atlas-pop-fill est" style="width:100%"></div></div>
                <div class="atlas-pop-number">294.850</div>
              </div>
            </div>
            <div class="atlas-growth">+30.796 pessoas em relação ao Censo 2022 • crescimento aproximado de 11,7%</div>
          </div>

          <div class="atlas-panel">
            <div class="atlas-panel-head">
              <div>
                <h3 class="atlas-panel-title">Acessos rápidos</h3>
                <p class="atlas-panel-sub">Navegue diretamente para os principais módulos do Atlas.</p>
              </div>
            </div>
            <div class="atlas-shortcuts">
              <button class="atlas-shortcut" data-go="locais">Locais de Votação →</button>
              <button class="atlas-shortcut" data-go="populacao">População Eleitoral →</button>
              <button class="atlas-shortcut" data-go="perfil">Perfil do Eleitorado →</button>
              <button class="atlas-shortcut" data-go="filiacao">Filiação Partidária →</button>
            </div>
          </div>
        </div>
      </div>
    `;

    anchor.insertAdjacentElement('afterend', wrap);

    wrap.querySelector('[data-go="locais"]')?.addEventListener('click', () => goToTab(['locais de votação','locais de votacao']));
    wrap.querySelector('[data-go="populacao"]')?.addEventListener('click', () => goToTab(['população eleitoral','populacao eleitoral']));
    wrap.querySelector('[data-go="perfil"]')?.addEventListener('click', () => goToTab(['perfil do eleitorado']));
    wrap.querySelector('[data-go="filiacao"]')?.addEventListener('click', () => goToTab(['filiação partidária','filiacao partidaria']));
  }

  function init() {
    buildDashboard();
    const observer = new MutationObserver(() => buildDashboard());
    observer.observe(document.body, { childList:true, subtree:true });
    setTimeout(buildDashboard, 500);
    setTimeout(buildDashboard, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
