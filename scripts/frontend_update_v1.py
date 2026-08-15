from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('Inteligência Geográfica • TRE & IBGE','Inteligência Geográfica')
s=s.replace('<div class="brand">','<div class="brand" role="button" tabindex="0" title="Voltar à página inicial" onclick="mudarAba(\'inicio\', null)">',1)
old='''<nav>
        <button class="nav-btn active" onclick="mudarAba('inicio', this)">Visão Geral</button>
        <button class="nav-btn" onclick="mudarAba('mapas-tre', this)">Mapa TRE</button>
        <button class="nav-btn" onclick="mudarAba('mapas-ibge', this)">Mapa Censo IBGE</button>
        <button class="nav-btn" onclick="mudarAba('estatisticas', this)">Gráficos e Estatísticas</button>
    </nav>'''
new='''<nav>
        <button class="nav-btn" onclick="mudarAba('mapas-tre', this)">Mapa locais de votação</button>
        <button class="nav-btn" onclick="mudarAba('mapas-ibge', this)">Mapa aptos a votar</button>
    </nav>'''
assert old in s
s=s.replace(old,new,1)
old='''<div class="hero">
            <h2>Bem-vindo ao Atlas Eleitoral</h2>
            <p>Uma plataforma avançada que cruza a base oficial de Locais de Votação (TRE-SC 2026) com a dados dos Setores Censitários do IBGE Censo 2022, com estimativa da população apta a votar em 2026. Ferramenta desenhada para análise de precisão do território de Itajaí.</p>
        </div>'''
new='''<div class="hero">
            <div class="hero-eyebrow">ATLAS ELEITORAL • ITAJAÍ</div>
            <h2>Bem-vindo ao Atlas Eleitoral</h2>
            <p>Plataforma de inteligência geográfica para análise territorial do eleitorado de Itajaí. Integra dados do TRE-SC e do Censo Demográfico 2022 do IBGE, permitindo visualizar a distribuição dos eleitores, os locais de votação e a população em idade eleitoral no município.</p>
            <div class="hero-actions">
                <button type="button" onclick="mudarAba('mapas-tre', document.querySelectorAll('.nav-btn')[0])">Explorar locais de votação</button>
                <button type="button" class="secondary" onclick="mudarAba('mapas-ibge', document.querySelectorAll('.nav-btn')[1])">Analisar população apta a votar</button>
            </div>
        </div>'''
assert old in s
s=s.replace(old,new,1)
pattern=r'''\n\s*<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px 15px;margin:-12px 0 24px;font-size:11px;color:#9a3412;line-height:1\.5;">\s*<strong>Nota metodológica:</strong>.*?</div>'''
s,n=re.subn(pattern,'',s,count=1,flags=re.S)
assert n==1
marker='        /* LAYOUT DOS MAPAS */'
css='''        /* LANDING PAGE - ACABAMENTO PROFISSIONAL */
        .brand { cursor: pointer; user-select: none; }
        .brand:focus-visible { outline: 3px solid rgba(37,99,235,.18); outline-offset: 6px; border-radius: 10px; }
        .container { max-width: 1240px; padding-top: 48px; }
        .hero { position: relative; overflow: hidden; min-height: 300px; display: flex; flex-direction: column; justify-content: center; padding: 54px 58px; border-radius: 20px; background: linear-gradient(135deg,#0b1220 0%,#0f172a 52%,#172554 100%); box-shadow: 0 20px 45px -28px rgba(15,23,42,.65); border: 1px solid rgba(255,255,255,.08); }
        .hero::after { content: ''; position: absolute; width: 360px; height: 360px; border-radius: 50%; right: -110px; top: -180px; background: rgba(37,99,235,.16); }
        .hero-eyebrow { position: relative; z-index: 1; font-size: 11px; font-weight: 800; letter-spacing: 1.8px; color: #93c5fd; margin-bottom: 14px; }
        .hero h2 { position: relative; z-index: 1; font-size: clamp(30px,4vw,44px); max-width: 760px; margin-bottom: 16px; letter-spacing: -1.5px; }
        .hero p { position: relative; z-index: 1; max-width: 820px; color: #cbd5e1; font-size: 15px; line-height: 1.75; }
        .hero-actions { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
        .hero-actions button { border: 0; border-radius: 9px; padding: 11px 16px; background: #2563eb; color: white; font-size: 12px; font-weight: 700; cursor: pointer; transition: .18s ease; }
        .hero-actions button:hover { transform: translateY(-1px); background: #1d4ed8; }
        .hero-actions button.secondary { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16); }
        .hero-actions button.secondary:hover { background: rgba(255,255,255,.14); }
        .kpi-grid { gap: 16px; margin-top: 4px; }
        .kpi-card { position: relative; overflow: hidden; padding: 24px 24px 22px; border-left: 0; border-top: 3px solid var(--blue); border-radius: 14px; box-shadow: 0 8px 24px -20px rgba(15,23,42,.45); transition: .18s ease; }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -22px rgba(15,23,42,.55); }
        .kpi-card.purple { border-left: 0; border-top-color: var(--purple); }
        .kpi-card.orange { border-left: 0; border-top-color: var(--orange); }
        .kpi-title { letter-spacing: .65px; }
        .kpi-value { font-size: 30px; letter-spacing: -.8px; }
        .kpi-sub { line-height: 1.45; }

'''
assert marker in s
s=s.replace(marker,css+marker,1)
s=s.replace('.hero { padding: 28px 22px; }','.hero { padding: 32px 24px; min-height: 0; }')
p.write_text(s,encoding='utf-8')