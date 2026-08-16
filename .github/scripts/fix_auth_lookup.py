from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old = '''        const { data: acesso, error: acessoError } = await supabaseClient
            .from("usuarios_autorizados")
            .select("nome,email,perfil,ativo")
            .eq("user_id", user.id)
            .eq("ativo", true)
            .maybeSingle();'''

new = '''        const emailAutenticado = String(user?.email || "").trim();
        const filtros = [`user_id.eq.${user.id}`];
        if (emailAutenticado) filtros.push(`email.eq.${emailAutenticado}`);

        const { data: acesso, error: acessoError } = await supabaseClient
            .from("usuarios_autorizados")
            .select("nome,email,perfil,ativo,user_id")
            .or(filtros.join(","))
            .eq("ativo", true)
            .limit(1)
            .maybeSingle();'''

if old not in s:
    raise SystemExit('Bloco de autorização não encontrado')

s = s.replace(old, new, 1)
s = s.replace(
    'setAuthMessage("Sua conta Google foi autenticada, mas não possui autorização para acessar o Atlas.");',
    'setAuthMessage(`Conta autenticada sem autorização no Atlas: ${emailAutenticado || "e-mail não identificado"}.`);',
    1,
)

p.write_text(s, encoding='utf-8')
