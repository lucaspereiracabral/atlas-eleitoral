// Módulos futuros desativados temporariamente.
// O Atlas mantém apenas os quatro módulos principais.

// Correção do buffer da População Eleitoral.
// Regra: qualquer setor censitário que intersectar o círculo entra integralmente na soma.
window.atualizarBuffer = function atualizarBuffer() {
    if (!geoSetores || !Array.isArray(geoSetores.features) || !bufferLatLng) {
        const out = document.getElementById('buffer-resultado');
        if (out) out.innerText = '0';
        return;
    }

    const slider = document.getElementById('buffer-slider');
    const raioM = Number(slider?.value || 500);
    const raioLabel = document.getElementById('buffer-raio');
    if (raioLabel) raioLabel.innerText = raioM + 'm';

    if (bufferCircle) {
        try { mapIBGE.removeLayer(bufferCircle); } catch (e) {}
    }

    bufferCircle = L.circle(bufferLatLng, {
        radius: raioM,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.22,
        weight: 2,
        interactive: false
    }).addTo(mapIBGE);

    const centro = [Number(bufferLatLng.lng), Number(bufferLatLng.lat)];
    const circulo = turf.circle(centro, raioM / 1000, {
        steps: 128,
        units: 'kilometers'
    });

    let total = 0;
    let setoresIntersectados = 0;
    const codigos = [];
    const erros = [];

    geoSetores.features.forEach(sec => {
        if (!sec || !sec.geometry) return;

        try {
            const setor = turf.feature(sec.geometry, sec.properties || {});
            const intersecao = turf.intersect(setor, circulo);
            if (!intersecao) return;

            const pop = Math.round(calcularPopulacaoApta2026(sec.properties || {}));
            if (pop <= 0) return;

            total += pop;
            setoresIntersectados++;

            const codigo = getProp(sec.properties || {}, ['cd_setor', 'CD_SETOR']);
            if (codigo) codigos.push(String(codigo));
        } catch (e) {
            erros.push(String(e?.message || e));
        }
    });

    const out = document.getElementById('buffer-resultado');
    if (out) out.innerText = format(total);

    console.info('BUFFER - SOMA DE SETORES INTERSECTADOS', {
        centro,
        raioM,
        totalSetores: geoSetores.features.length,
        setoresIntersectados,
        total,
        codigos,
        erros: erros.slice(0, 10)
    });
};
