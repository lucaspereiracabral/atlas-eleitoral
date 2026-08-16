// Módulos futuros desativados temporariamente.
// O Atlas mantém apenas os quatro módulos principais.
//
// BUFFER V5 — cálculo independente de Turf para interseção.
// Regra: qualquer setor que tocar/intersectar o círculo entra integralmente na soma.

(() => {
    const VERSAO = 'BUFFER V5';
    let ultimoCentro = '';
    let ultimoRaio = null;

    function projetar(lng, lat, lng0, lat0) {
        const rad = Math.PI / 180;
        const x = (lng - lng0) * 111320 * Math.cos(lat0 * rad);
        const y = (lat - lat0) * 110540;
        return [x, y];
    }

    function distanciaPontoSegmento(px, py, ax, ay, bx, by) {
        const abx = bx - ax;
        const aby = by - ay;
        const apx = px - ax;
        const apy = py - ay;
        const ab2 = abx * abx + aby * aby;
        if (ab2 === 0) return Math.hypot(px - ax, py - ay);
        let t = (apx * abx + apy * aby) / ab2;
        t = Math.max(0, Math.min(1, t));
        const qx = ax + t * abx;
        const qy = ay + t * aby;
        return Math.hypot(px - qx, py - qy);
    }

    function pontoDentroAnel(lng, lat, ring) {
        let dentro = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = Number(ring[i][0]);
            const yi = Number(ring[i][1]);
            const xj = Number(ring[j][0]);
            const yj = Number(ring[j][1]);
            const cruza = ((yi > lat) !== (yj > lat)) &&
                (lng < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-15) + xi);
            if (cruza) dentro = !dentro;
        }
        return dentro;
    }

    function centroDentroPoligono(lng, lat, polygonCoords) {
        if (!polygonCoords?.length) return false;
        if (!pontoDentroAnel(lng, lat, polygonCoords[0])) return false;
        for (let h = 1; h < polygonCoords.length; h++) {
            if (pontoDentroAnel(lng, lat, polygonCoords[h])) return false;
        }
        return true;
    }

    function anelTocaCirculo(ring, lng0, lat0, raioM) {
        if (!Array.isArray(ring) || ring.length < 2) return false;

        const pts = ring.map(c => projetar(Number(c[0]), Number(c[1]), lng0, lat0));

        for (const [x, y] of pts) {
            if (Math.hypot(x, y) <= raioM) return true;
        }

        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1];
            const [bx, by] = pts[i];
            if (distanciaPontoSegmento(0, 0, ax, ay, bx, by) <= raioM) return true;
        }

        // Fecha o anel caso o GeoJSON não repita o primeiro ponto no final.
        const [ax, ay] = pts[pts.length - 1];
        const [bx, by] = pts[0];
        return distanciaPontoSegmento(0, 0, ax, ay, bx, by) <= raioM;
    }

    function poligonoInterseccionaCirculo(polygonCoords, lng0, lat0, raioM) {
        if (!Array.isArray(polygonCoords) || !polygonCoords.length) return false;

        // O centro do buffer está dentro do setor.
        if (centroDentroPoligono(lng0, lat0, polygonCoords)) return true;

        // Qualquer borda externa ou interna toca o círculo.
        for (const ring of polygonCoords) {
            if (anelTocaCirculo(ring, lng0, lat0, raioM)) return true;
        }

        return false;
    }

    function setorInterseccionaCirculo(sec, lng0, lat0, raioM) {
        const g = sec?.geometry;
        if (!g?.coordinates) return false;

        if (g.type === 'Polygon') {
            return poligonoInterseccionaCirculo(g.coordinates, lng0, lat0, raioM);
        }

        if (g.type === 'MultiPolygon') {
            return g.coordinates.some(poly =>
                poligonoInterseccionaCirculo(poly, lng0, lat0, raioM)
            );
        }

        return false;
    }

    function garantirDiagnostico() {
        const out = document.getElementById('buffer-resultado');
        if (!out) return null;
        let diag = document.getElementById('buffer-diagnostico');
        if (!diag) {
            diag = document.createElement('div');
            diag.id = 'buffer-diagnostico';
            diag.style.cssText = 'margin-top:7px;font-size:10px;color:#92400e;font-weight:600;line-height:1.35;';
            out.insertAdjacentElement('afterend', diag);
        }
        return diag;
    }

    function calcular(force = false) {
        const painel = document.getElementById('buffer-tool');
        const out = document.getElementById('buffer-resultado');
        const slider = document.getElementById('buffer-slider');
        if (!painel || !out || !slider) return;
        if (getComputedStyle(painel).display === 'none') return;

        const diag = garantirDiagnostico();

        try {
            if (typeof geoSetores === 'undefined' || !geoSetores || !Array.isArray(geoSetores.features)) {
                if (diag) diag.textContent = `${VERSAO} • GeoJSON de setores indisponível`;
                return;
            }
            if (typeof bufferLatLng === 'undefined' || !bufferLatLng) {
                if (diag) diag.textContent = `${VERSAO} • centro do buffer indisponível`;
                return;
            }

            const raioM = Number(slider.value || 500);
            const lng0 = Number(bufferLatLng.lng);
            const lat0 = Number(bufferLatLng.lat);
            const chaveCentro = `${lng0.toFixed(7)},${lat0.toFixed(7)}`;

            if (!force && chaveCentro === ultimoCentro && raioM === ultimoRaio) return;
            ultimoCentro = chaveCentro;
            ultimoRaio = raioM;

            let total = 0;
            let intersectados = 0;
            let comPop = 0;
            const codigos = [];

            for (const sec of geoSetores.features) {
                if (!setorInterseccionaCirculo(sec, lng0, lat0, raioM)) continue;
                intersectados++;

                const pop = Math.round(calcularPopulacaoApta2026(sec.properties || {}));
                if (!(pop > 0)) continue;

                total += pop;
                comPop++;
                const codigo = getProp(sec.properties || {}, ['cd_setor', 'CD_SETOR']);
                if (codigo) codigos.push(String(codigo));
            }

            out.innerText = format(total);
            if (diag) {
                diag.textContent = `${VERSAO} • ${intersectados} setores intersectados • ${comPop} com população • ${geoSetores.features.length} analisados`;
            }

            console.info(VERSAO, {
                centro: [lng0, lat0],
                raioM,
                totalSetores: geoSetores.features.length,
                intersectados,
                comPop,
                total,
                codigos
            });
        } catch (e) {
            console.error(`${VERSAO} erro`, e);
            if (diag) diag.textContent = `${VERSAO} • ERRO: ${String(e?.message || e)}`;
        }
    }

    function iniciar() {
        const slider = document.getElementById('buffer-slider');
        const painel = document.getElementById('buffer-tool');
        const escola = document.getElementById('buffer-escola');

        slider?.addEventListener('input', () => setTimeout(() => calcular(true), 20));
        slider?.addEventListener('change', () => setTimeout(() => calcular(true), 20));

        if (painel) {
            new MutationObserver(() => setTimeout(() => calcular(true), 30))
                .observe(painel, { attributes: true, attributeFilter: ['style', 'class'] });
        }

        if (escola) {
            new MutationObserver(() => setTimeout(() => calcular(true), 30))
                .observe(escola, { childList: true, characterData: true, subtree: true });
        }

        // Garantia: enquanto o painel estiver aberto, confere periodicamente.
        setInterval(() => calcular(false), 700);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
