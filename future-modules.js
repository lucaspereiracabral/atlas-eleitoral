// Módulos futuros desativados temporariamente.
// O Atlas mantém apenas os quatro módulos principais.
//
// Correção isolada do buffer da População Eleitoral.
// A função original do index.html continua desenhando o círculo.
// Este script observa o resultado e recalcula a soma APÓS o handler original.

(() => {
    let recalculando = false;

    function setorInterseccionaCirculo(sec, circulo, centro, raioM) {
        if (!sec || !sec.geometry) return false;

        const setor = turf.feature(sec.geometry, sec.properties || {});

        // 1) Interseção geométrica direta.
        try {
            if (turf.intersect(setor, circulo)) return true;
        } catch (e) {}

        // 2) Centro do círculo dentro do setor.
        try {
            if (turf.booleanPointInPolygon(turf.point(centro), setor)) return true;
        } catch (e) {}

        // 3) Algum vértice do setor dentro do raio.
        try {
            const coords = [];
            const coletar = arr => {
                if (!Array.isArray(arr)) return;
                if (arr.length >= 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
                    coords.push(arr);
                    return;
                }
                arr.forEach(coletar);
            };
            coletar(sec.geometry.coordinates);

            for (const c of coords) {
                const d = turf.distance(turf.point(centro), turf.point(c), { units: 'kilometers' }) * 1000;
                if (Number.isFinite(d) && d <= raioM) return true;
            }
        } catch (e) {}

        // 4) Algum ponto da borda do círculo dentro do setor.
        // Cobre o caso em que o círculo corta o setor sem conter seus vértices.
        try {
            const ring = circulo.geometry?.coordinates?.[0] || [];
            for (let i = 0; i < ring.length; i += 4) {
                if (turf.booleanPointInPolygon(turf.point(ring[i]), setor)) return true;
            }
        } catch (e) {}

        return false;
    }

    function recalcularBufferPopulacao() {
        if (recalculando) return;

        const painel = document.getElementById('buffer-tool');
        const out = document.getElementById('buffer-resultado');
        const slider = document.getElementById('buffer-slider');

        if (!painel || !out || !slider) return;
        if (getComputedStyle(painel).display === 'none') return;

        try {
            if (!geoSetores || !Array.isArray(geoSetores.features) || !bufferLatLng) return;

            recalculando = true;

            const raioM = Number(slider.value || 500);
            const centro = [Number(bufferLatLng.lng), Number(bufferLatLng.lat)];
            const circulo = turf.circle(centro, raioM / 1000, {
                steps: 128,
                units: 'kilometers'
            });

            let total = 0;
            let setoresIntersectados = 0;
            const codigos = [];

            for (const sec of geoSetores.features) {
                if (!setorInterseccionaCirculo(sec, circulo, centro, raioM)) continue;

                const pop = Math.round(calcularPopulacaoApta2026(sec.properties || {}));
                if (!(pop > 0)) continue;

                total += pop;
                setoresIntersectados++;

                try {
                    const codigo = getProp(sec.properties || {}, ['cd_setor', 'CD_SETOR']);
                    if (codigo) codigos.push(String(codigo));
                } catch (e) {}
            }

            out.innerText = format(total);

            console.info('BUFFER RECALCULADO APÓS HANDLER ORIGINAL', {
                raioM,
                totalSetores: geoSetores.features.length,
                setoresIntersectados,
                total,
                codigos
            });
        } catch (e) {
            console.error('Erro no recálculo independente do buffer:', e);
        } finally {
            recalculando = false;
        }
    }

    function agendarRecalculo() {
        // O handler original escreve o valor primeiro. Recalculamos logo depois.
        setTimeout(recalcularBufferPopulacao, 40);
    }

    function iniciar() {
        const slider = document.getElementById('buffer-slider');
        const out = document.getElementById('buffer-resultado');
        const painel = document.getElementById('buffer-tool');

        if (slider) {
            slider.addEventListener('input', agendarRecalculo);
            slider.addEventListener('change', agendarRecalculo);
        }

        if (out) {
            const obsResultado = new MutationObserver(() => {
                if (!recalculando) agendarRecalculo();
            });
            obsResultado.observe(out, { childList: true, characterData: true, subtree: true });
        }

        if (painel) {
            const obsPainel = new MutationObserver(agendarRecalculo);
            obsPainel.observe(painel, { attributes: true, attributeFilter: ['style', 'class'] });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
