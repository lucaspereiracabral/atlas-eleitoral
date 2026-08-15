from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')

if 'ATLAS_PRIVATE_DATA_V1' in html:
    print('Private data hardening already applied.')
    raise SystemExit(0)

old_loader = '''    // LOAD DADOS (Async Await robusto)\n    async function loadJson(url) {\n        try {\n            let res = await fetch(url);\n            if (res.ok) return await res.json();\n            let fb = url.replace(".geojson", "");\n            if(fb !== url) {\n                res = await fetch(fb);\n                if (res.ok) return await res.json();\n            }\n        } catch(e) {}\n        return null;\n    }\n\n    async function init() {\n        const [bairros, locais, setores] = await Promise.all([\n            loadJson("bairros_itajai.geojson"),\n            loadJson("locais_de_votacao_e_secoes.geojson"),\n            loadJson("setores_itajai_2022_demografico.geojson")\n        ]);'''

new_loader = '''    // ATLAS_PRIVATE_DATA_V1\n    // Dados geográficos protegidos por Supabase + RLS.\n    async function loadGeoJsonPrivado(nome) {\n        const { data, error } = await supabaseClient\n            .from("atlas_geojson_privado")\n            .select("conteudo")\n            .eq("nome", nome)\n            .single();\n\n        if (error || !data?.conteudo) {\n            console.error(`Falha ao carregar ${nome}:`, error);\n            throw new Error(`Não foi possível carregar ${nome}.`);\n        }\n\n        return data.conteudo;\n    }\n\n    async function init() {\n        const [bairros, locais, setores] = await Promise.all([\n            loadGeoJsonPrivado("bairros_itajai.geojson"),\n            loadGeoJsonPrivado("locais_de_votacao_e_secoes.geojson"),\n            loadGeoJsonPrivado("setores_itajai_2022_demografico.geojson")\n        ]);'''

if old_loader not in html:
    raise RuntimeError('Data loader block not found; aborting safe patch.')
html = html.replace(old_loader, new_loader, 1)

old_liberar = '''    async function liberarAtlas(user) {\n        document.body.classList.remove("auth-locked");\n        const userEmail = document.getElementById("auth-user-email");\n        if (userEmail) userEmail.textContent = user?.email || "";\n\n        if (!atlasInicializado) {\n            atlasInicializado = true;\n            try { await init(); }\n            catch (e) { console.error("Erro ao inicializar o Atlas:", e); }\n        }\n\n        setTimeout(() => {\n            try { mapTRE.invalidateSize(); } catch (e) {}\n            try { mapIBGE.invalidateSize(); } catch (e) {}\n        }, 250);\n    }'''

new_liberar = '''    async function liberarAtlas(user) {\n        const { data: acesso, error: acessoError } = await supabaseClient\n            .from("usuarios_autorizados")\n            .select("nome,email,perfil,ativo")\n            .eq("user_id", user.id)\n            .eq("ativo", true)\n            .maybeSingle();\n\n        if (acessoError || !acesso) {\n            console.warn("Acesso recusado para usuário autenticado:", user?.email);\n            await supabaseClient.auth.signOut();\n            bloquearAtlas();\n            setAuthMessage("Sua conta Google foi autenticada, mas não possui autorização para acessar o Atlas.");\n            return;\n        }\n\n        document.body.classList.remove("auth-locked");\n        const userEmail = document.getElementById("auth-user-email");\n        if (userEmail) {\n            const nome = acesso.nome || user?.user_metadata?.full_name || user?.email || "Usuário";\n            const perfil = (acesso.perfil || "visualizacao").toUpperCase();\n            userEmail.textContent = `${nome} • ${perfil}`;\n            userEmail.title = acesso.email || user?.email || "";\n        }\n\n        if (!atlasInicializado) {\n            atlasInicializado = true;\n            try {\n                await init();\n            } catch (e) {\n                atlasInicializado = false;\n                console.error("Erro ao inicializar o Atlas:", e);\n                document.body.classList.add("auth-locked");\n                setAuthMessage("Não foi possível carregar os dados protegidos do Atlas.");\n                return;\n            }\n        }\n\n        setTimeout(() => {\n            try { mapTRE.invalidateSize(); } catch (e) {}\n            try { mapIBGE.invalidateSize(); } catch (e) {}\n        }, 250);\n    }'''

if old_liberar not in html:
    raise RuntimeError('Auth release block not found; aborting safe patch.')
html = html.replace(old_liberar, new_liberar, 1)

# Remove função antiga de login por senha, já que a UI usa apenas Google OAuth.
start = html.find('    async function entrarAtlas(email, password) {')
if start != -1:
    end = html.find('\n    async function entrarComGoogle()', start)
    if end != -1:
        html = html[:start] + html[end:]

path.write_text(html, encoding='utf-8')
print('Private data hardening applied successfully.')
