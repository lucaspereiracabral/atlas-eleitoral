from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Remove duplicidade que gera SyntaxError no bloco de autenticação.
dup = '''    let authLiberacaoEmCurso = false;\n\n    let authLiberacaoEmCurso = false;'''
if dup in s:
    s = s.replace(dup, '    let authLiberacaoEmCurso = false;', 1)

# Mantém diagnóstico sem bloquear novamente a interface caso init() falhe.
old_init = '''            } catch (e) {\n                atlasInicializado = false;\n                console.error("Erro ao inicializar o Atlas:", e);\n                document.body.classList.add("auth-locked");\n                setAuthMessage("Não foi possível carregar os dados protegidos do Atlas.");\n                return;\n            }'''
new_init = '''            } catch (e) {\n                atlasInicializado = false;\n                console.error("Erro ao inicializar o Atlas:", e);\n                document.body.classList.remove("auth-locked");\n                setAuthMessage(`Erro ao inicializar o Atlas: ${e?.message || e}`);\n                const loader = document.getElementById("loader");\n                if (loader) loader.style.display = "none";\n                return;\n            }'''
if old_init in s:
    s = s.replace(old_init, new_init, 1)

# Força o navegador a buscar as versões novas dos módulos analíticos/visuais.
s = s.replace('analytics.js?v=1', 'analytics.js?v=2')
s = s.replace('future-modules.js?v=8', 'future-modules.js?v=9')
s = s.replace('future-modules.js?v=9', 'future-modules.js?v=10')
s = s.replace('future-modules.js?v=20', 'future-modules.js?v=21')
s = s.replace('future-modules.js?v=21', 'future-modules.js?v=22')
s = s.replace('upgrade-v3.js?v=2', 'upgrade-v3.js?v=3')

# Carrega a camada visual diretamente no index para não depender do future-modules.
landing_tag = '    <script src="landing-polish.js?v=2"></script>\n'
if 'landing-polish.js' not in s:
    anchor = '    <script src="upgrade-v3.js?v=3"></script>\n'
    if anchor in s:
        s = s.replace(anchor, anchor + landing_tag, 1)
    else:
        s = s.replace('</body>', landing_tag + '</body>', 1)

p.write_text(s, encoding='utf-8')
