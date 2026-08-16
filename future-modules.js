// Módulos futuros desativados temporariamente.
// O Atlas mantém apenas os quatro módulos principais.

// Correção do buffer da População Eleitoral.
// Regra: qualquer setor censitário que intersectar o círculo entra integralmente na soma.
window.atualizarBuffer = function atualizarBuffer() {
    if (!window.geoSetores || !Array.isArray(window.geoSetores.features) || !window.bufferLatLng) {
        const out = document.getElementById('buffer-resultado');
        if (out) out.innerText = '0';
        return;
    }

    const slider = document.getElementById('buffer-slider');
    const raioM = Number(slider?.value || 500);
    const raioLabel = document.getElementById('buffer-raio');
    if (raioLabel) raioLabel.innerText = raioM + 'm';

    if (window.bufferCircle) {
        try { window.mapIBGE.removeLayer(window.bufferCircle); } catch (e) {}
    }

    window.bufferCircle = L.circle(window.bufferLatLng, {
        radius: raioM,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.22,
        weight: 2,
        interactive: false
    }).addTo(window.mapIBGE);

    const centro = [Number(window.bufferLatLng.lng), Number(window.bufferLatLng.lat)];
    const circulo = turf.circle(centro, raioM / 1000, {
        steps: 128,
        units: 'kilometers'
    });

    let total = 0;
    let setoresIntersectados = 0;
    const codigos = [];

    window.geoSetores.features.forEach(sec => {
        if (!sec?.geometry) return;

        try {
            const setor = turf.feature(sec.geometry, sec.properties || {});
            if (!turf.booleanIntersects(setor, circulo)) return;

            const pop = Math.round(window.calcularPopulacaoApta2026(sec.properties || {}));
            if (pop <= 0) return;

            total += pop;
            setoresIntersectados++;

            try {
                const codigo = window.getProp(sec.properties || {}, ['cd_setor', 'CD_SETOR']);
                if (codigo) codigos.push(String(codigo));
            } catch (e) {}
        } catch (e) {
            console.warn('Falha ao testar setor no buffer:', e);
        }
    });

    const out = document.getElementById('buffer-resultado');
    if (out) out.innerText = window.format ? window.format(total) : Number(total).toLocaleString('pt-BR');

    console.info('BUFFER - SETORES INTERSECTADOS', {
        centro,
        raioM,
        setoresIntersectados,
        total,
        codigos
    });
};
