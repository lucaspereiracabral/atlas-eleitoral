from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Remove duplicidade que gera SyntaxError no bloco de autenticação.
dup = '''    let authLiberacaoEmCurso = false;\n\n    let authLiberacaoEmCurso = false;'''
if dup in s:
    s = s.replace(dup, '    let authLiberacaoEmCurso = false;', 1)

# Remove indicadores estáticos do HTML público. Eles serão preenchidos somente
# depois que o usuário for autenticado e autorizado no Supabase.
s = s.replace(
    '<div class="kpi-title">Total de Eleitores (TRE)</div>\n                <div class="kpi-value">182.124</div>\n                <div class="kpi-sub">aptos a votar</div>',
    '<div class="kpi-title">Total de Eleitores (TRE)</div>\n                <div class="kpi-value" id="kpi-eleitores-home">...</div>\n                <div class="kpi-sub">aptos a votar</div>'
)
s = s.replace(
    '<div class="kpi-title">Locais de Votação</div>\n                <div class="kpi-value">83</div>\n                <div class="kpi-sub">escolas e instituições</div>',
    '<div class="kpi-title">Locais de Votação</div>\n                <div class="kpi-value" id="kpi-locais-home">...</div>\n                <div class="kpi-sub">escolas e instituições</div>'
)
s = s.replace(
    '<div class="kpi-title">Biometria Cadastrada</div>\n                <div class="kpi-value">94,6%</div>\n                <div class="kpi-sub">172.242 eleitores</div>',
    '<div class="kpi-title">Biometria Cadastrada</div>\n                <div class="kpi-value" id="kpi-biometria-home">...</div>\n                <div class="kpi-sub" id="kpi-biometria-sub-home">dados protegidos</div>'
)

# Remove dados demográficos legados hardcoded do JS público. As abas analíticas
# atuais usam as tabelas protegidas pelo RLS do Supabase.
legacy_demo = '''        new Chart(document.getElementById("chartGenero"), { type: "doughnut", data: { labels: ["Feminino", "Masculino"], datasets: [{ data: [96639, 85485], backgroundColor: ["#0ea5e9", "#1e293b"], borderWidth:0 }] }, options: { responsive:true, maintainAspectRatio:false, cutout:"65%", plugins:{ legend:{display:true, position:'bottom'}, datalabels:{color:'#fff', font:{size:12, weight:'bold'}, formatter:v=>format(v)} } } });\n        new Chart(document.getElementById("chartIdade"), { type: "bar", data: { labels: ["16-20", "21-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"], datasets: [{ data: [8722, 30778, 40169, 40011, 28136, 21443, 10716, 2103], backgroundColor: "#2563eb", borderRadius:4 }] }, options: cfg });\n        new Chart(document.getElementById("chartInstrucao"), { type: "bar", data: { labels: ["Ens. Médio Comp.", "Superior Comp.", "Ens. Médio Incomp.", "Ens. Fund. Incomp.", "Superior Incomp.", "Ens. Fund. Comp.", "Lê e Escreve", "Analfabeto"], datasets: [{ data: [57135, 33157, 26285, 25565, 21082, 14651, 2915, 1334], backgroundColor: "#0ea5e9", borderRadius:4 }] }, options: { ...cfg, indexAxis: 'y', plugins: { legend:{display:false}, datalabels:{anchor:'end', align:'right'} }, scales:{x:{display:false}, y:{grid:{display:false}}} } });'''
if legacy_demo in s:
    s = s.replace(legacy_demo, '        // Gráficos demográficos legados removidos: dados carregados apenas após autenticação pelas abas analíticas protegidas.', 1)

# Função de resumo protegido: a tabela não concede SELECT ao papel anon e possui
# RLS exigindo usuário autenticado + allowlist ativa.
summary_fn = '''\n    async function carregarResumoProtegido() {\n        const { data, error } = await supabaseClient\n            .from("atlas_resumo_privado")\n            .select("total_eleitores,locais_votacao,biometria_total,biometria_percentual")\n            .eq("id", 1)\n            .single();\n\n        if (error || !data) {\n            console.error("Falha ao carregar resumo protegido:", error);\n            throw new Error("Não foi possível carregar o resumo protegido do Atlas.");\n        }\n\n        const elEleitores = document.getElementById("kpi-eleitores-home");\n        const elLocais = document.getElementById("kpi-locais-home");\n        const elBio = document.getElementById("kpi-biometria-home");\n        const elBioSub = document.getElementById("kpi-biometria-sub-home");\n\n        if (elEleitores) elEleitores.textContent = format(data.total_eleitores);\n        if (elLocais) elLocais.textContent = format(data.locais_votacao);\n        if (elBio) elBio.textContent = Number(data.biometria_percentual || 0).toLocaleString("pt-BR", {minimumFractionDigits:1, maximumFractionDigits:1}) + "%";\n        if (elBioSub) elBioSub.textContent = format(data.biometria_total) + " eleitores";\n    }\n'''
anchor_fn = '''    async function liberarAtlas(user) {'''
if 'async function carregarResumoProtegido()' not in s and anchor_fn in s:
    s = s.replace(anchor_fn, summary_fn + '\n' + anchor_fn, 1)

# Só carrega os indicadores após a autorização explícita do usuário.
anchor_auth = '''            userEmail.title = acesso.email || user?.email || "";\n        }\n\n        if (!atlasInicializado) {'''
replacement_auth = '''            userEmail.title = acesso.email || user?.email || "";\n        }\n\n        await carregarResumoProtegido();\n\n        if (!atlasInicializado) {'''
if anchor_auth in s and 'await carregarResumoProtegido();' not in s:
    s = s.replace(anchor_auth, replacement_auth, 1)

# Mantém diagnóstico para usuários já autenticados sem mascarar erros de init.
old_init = '''            } catch (e) {\n                atlasInicializado = false;\n                console.error("Erro ao inicializar o Atlas:", e);\n                document.body.classList.add("auth-locked");\n                setAuthMessage("Não foi possível carregar os dados protegidos do Atlas.");\n                return;\n            }'''
new_init = '''            } catch (e) {\n                atlasInicializado = false;\n                console.error("Erro ao inicializar o Atlas:", e);\n                document.body.classList.remove("auth-locked");\n                setAuthMessage(`Erro ao inicializar o Atlas: ${e?.message || e}`);\n                const loader = document.getElementById("loader");\n                if (loader) loader.style.display = "none";\n                return;\n            }'''
if old_init in s:
    s = s.replace(old_init, new_init, 1)

# ==============================================================
# POPULAÇÃO APTA 2026 POR BAIRRO
# ==============================================================
# O problema dos bairros zerados vinha da prioridade dada ao NM_BAIRRO do IBGE.
# Alguns setores têm denominação diferente da malha municipal e acabavam sendo
# somados em outro bairro. A regra passa a ser espacial-first: cada setor é
# distribuído pela geometria oficial dos bairros; NM_BAIRRO é apenas fallback.
start_marker = '    function agregarPopulacaoAptaPorBairro() {'
end_marker = '    function prepararIndiceBairros() {'
start = s.find(start_marker)
end = s.find(end_marker, start) if start != -1 else -1

new_aggregation = r'''    function agregarPopulacaoAptaPorBairro() {

        popPorBairro = {};

        // Inicializa todos os bairros oficiais para que a lista sempre
        // use exatamente os mesmos nomes da camada municipal.
        if(geoBairros && Array.isArray(geoBairros.features)) {
            geoBairros.features.forEach(b => {
                const nome = getProp(
                    b.properties || {},
                    ["nome_1", "nome", "bairro", "NOME_1", "NOME", "BAIRRO", "nome_bairro"]
                );
                if(nome) popPorBairro[nome] = 0;
            });
        }

        if(!geoSetores || !Array.isArray(geoSetores.features)) {
            reconstruirIndicePopulacaoBairros();
            return;
        }

        let usadosEspacialmente = 0;
        let usadosPorNomeIBGE = 0;
        let enviadosOutros = 0;

        geoSetores.features.forEach(setor => {
            const props = setor.properties || {};
            const popApta = calcularPopulacaoApta2026(props);
            if(popApta <= 0) return;

            // REGRA PRINCIPAL: distribuição espacial na malha oficial.
            // A função usa amostras internas ao setor e preserva 100% da
            // população do setor entre os bairros que realmente o interceptam.
            let distribuicao = distribuirSetorEntreBairros(setor, popApta);

            // Se a análise espacial não conseguiu encontrar bairro algum,
            // tenta o NM_BAIRRO do Censo apenas como fallback.
            const partesValidas = (distribuicao || []).filter(parte =>
                parte && parte.bairro && parte.bairro !== "Outros" && Number(parte.populacao || 0) > 0
            );

            if(partesValidas.length) {
                partesValidas.forEach(parte => {
                    popPorBairro[parte.bairro] =
                        (popPorBairro[parte.bairro] || 0) + Number(parte.populacao || 0);
                });
                usadosEspacialmente++;
                return;
            }

            const nomeIBGE = getProp(props, ["nm_bairro", "NM_BAIRRO"]);
            const bairroMunicipal = resolverNomeBairroIBGE(nomeIBGE);

            if(bairroMunicipal) {
                popPorBairro[bairroMunicipal] =
                    (popPorBairro[bairroMunicipal] || 0) + popApta;
                usadosPorNomeIBGE++;
                return;
            }

            popPorBairro["Outros"] =
                (popPorBairro["Outros"] || 0) + popApta;
            enviadosOutros++;
        });

        reconstruirIndicePopulacaoBairros();

        console.group("POPULAÇÃO APTA 2026 POR BAIRRO — ASSOCIAÇÃO ESPACIAL");
        console.log("Setores associados espacialmente:", usadosEspacialmente);
        console.log("Setores associados por NM_BAIRRO (fallback):", usadosPorNomeIBGE);
        console.log("Setores enviados para Outros:", enviadosOutros);
        console.table(
            Object.entries(popPorBairro)
                .filter(([bairro]) => bairro !== "Outros")
                .map(([bairro, populacao]) => ({
                    bairro,
                    populacaoApta2026: Math.round(populacao || 0)
                }))
                .sort((a,b) => b.populacaoApta2026 - a.populacaoApta2026)
        );
        console.groupEnd();
    }

'''

if start != -1 and end != -1:
    s = s[:start] + new_aggregation + s[end:]

# Diagnóstico automático: bairros que têm eleitorado TRE, mas continuam com
# população censitária zerada após a associação espacial.
diagnostic_fn = r'''
    function diagnosticarBairrosSemPopulacao() {
        const inconsistencias = Object.entries(elPorBairro)
            .filter(([bairro, eleitores]) =>
                bairro && bairro !== "Outros" &&
                Number(eleitores || 0) > 0 &&
                obterPopulacaoBairro(bairro) <= 0
            )
            .map(([bairro, eleitores]) => ({
                bairro,
                eleitoresTRE: Math.round(Number(eleitores || 0)),
                populacaoApta2026: 0
            }))
            .sort((a,b) => b.eleitoresTRE - a.eleitoresTRE);

        if(inconsistencias.length) {
            console.warn(
                "Bairros com eleitores TRE e população apta 2026 ainda zerada:",
                inconsistencias.length
            );
            console.table(inconsistencias);
        } else {
            console.info("Validação bairro × população: nenhum bairro com eleitorado TRE ficou zerado.");
        }
    }

'''

if 'function diagnosticarBairrosSemPopulacao()' not in s:
    anchor = '    function resetarTRE() {'
    if anchor in s:
        s = s.replace(anchor, diagnostic_fn + anchor, 1)

# Executa a validação depois que os locais TRE já foram agregados por bairro,
# pois somente nesse ponto elPorBairro contém os totais eleitorais.
call_anchor = '''        // Camada base de Bairros no Mapa TRE\n        if(geoBairros) {'''
call_replacement = '''        diagnosticarBairrosSemPopulacao();\n\n        // Camada base de Bairros no Mapa TRE\n        if(geoBairros) {'''
if call_anchor in s and '        diagnosticarBairrosSemPopulacao();\n\n        // Camada base de Bairros no Mapa TRE' not in s:
    s = s.replace(call_anchor, call_replacement, 1)

# Atualiza comentário do processamento para refletir a regra espacial-first.
s = s.replace(
    '// Agrega a população apta 2026 por bairro usando\n            // prioritariamente NM_BAIRRO do próprio GeoJSON censitário.',
    '// Agrega a população apta 2026 por bairro pela geometria oficial municipal.\n            // NM_BAIRRO do Censo é utilizado apenas como fallback.'
)

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
