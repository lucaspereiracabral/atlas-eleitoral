from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old_access = '''        if (acessoError || !acesso) {
            console.warn("Acesso recusado para usuário autenticado:", user?.email);
            await supabaseClient.auth.signOut();
            bloquearAtlas();
            setAuthMessage("Sua conta Google foi autenticada, mas não possui autorização para acessar o Atlas.");
            return;
        }'''
new_access = '''        if (acessoError || !acesso) {
            console.warn("Falha na validação de acesso:", acessoError || "usuário não autorizado", user?.email);
            bloquearAtlas();
            setAuthMessage("Sua conta Google foi autenticada, mas não foi possível validar o acesso ao Atlas.");
            return;
        }'''
if old_access in s:
    s = s.replace(old_access, new_access, 1)

start_marker = '    async function verificarSessaoAtlas() {'
end_marker = '    verificarSessaoAtlas();'
start = s.find(start_marker)
if start == -1:
    raise SystemExit('verificarSessaoAtlas não encontrada')
end = s.find(end_marker, start)
if end == -1:
    raise SystemExit('chamada verificarSessaoAtlas não encontrada')
end += len(end_marker)

replacement = '''    let authLiberacaoEmCurso = false;

    async function verificarSessaoAtlas() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error("Erro ao verificar sessão:", error);
            bloquearAtlas();
            setAuthMessage("Não foi possível recuperar a sessão do Google.");
            return;
        }

        if (session?.user) {
            if (authLiberacaoEmCurso) return;
            authLiberacaoEmCurso = true;
            try {
                await liberarAtlas(session.user);
            } finally {
                authLiberacaoEmCurso = false;
            }
        } else {
            bloquearAtlas();
        }
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
            bloquearAtlas();
            return;
        }
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") && session?.user) {
            setTimeout(() => verificarSessaoAtlas(), 0);
        }
    });

    verificarSessaoAtlas();'''

s = s[:start] + replacement + s[end:]
p.write_text(s, encoding='utf-8')
