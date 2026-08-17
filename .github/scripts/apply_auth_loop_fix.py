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

p.write_text(s, encoding='utf-8')
