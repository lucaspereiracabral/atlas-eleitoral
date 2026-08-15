from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')

marker = '''    async function verificarSessaoAtlas() {\n        const { data: { session }, error } = await supabaseClient.auth.getSession();'''

replacement = '''    async function verificarSessaoAtlas() {\n        try {\n            const params = new URLSearchParams(window.location.search);\n            const code = params.get("code");\n\n            if (code) {\n                const { error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);\n\n                if (exchangeError) {\n                    console.error("Erro ao trocar code OAuth por sessão:", exchangeError);\n                    setAuthMessage("Falha ao concluir o login com Google.");\n                } else {\n                    const cleanUrl = window.location.origin + window.location.pathname;\n                    window.history.replaceState({}, document.title, cleanUrl);\n                }\n            }\n        } catch (e) {\n            console.error("Erro ao processar retorno OAuth:", e);\n        }\n\n        const { data: { session }, error } = await supabaseClient.auth.getSession();'''

if marker not in html:
    raise RuntimeError('verificarSessaoAtlas marker not found')

html = html.replace(marker, replacement, 1)
path.write_text(html, encoding='utf-8')
print('OAuth callback session exchange added.')
