// Módulos futuros desativados temporariamente.
// O Atlas mantém os módulos analíticos ativos e o cálculo do buffer populacional.
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
        for (const [x, y] of pts) if (Math.hypot(x, y) <= raioM) return true;
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1];
            const [bx, by] = pts[i];
            if (distanciaPontoSegmento(0, 0, ax, ay, bx, by) <= raioM) return true;
        }
        const [ax, ay] = pts[pts.length - 1];
        const [bx, by] = pts[0];
        return distanciaPontoSegmento(0, 0, ax, ay, bx, by) <= raioM;
    }

    function poligonoInterseccionaCirculo(polygonCoords, lng0, lat0, raioM) {
        if (!Array.isArray(polygonCoords) || !polygonCoords.length) return false;
        if (centroDentroPoligono(lng0, lat0, polygonCoords)) return true;
        for (const ring of polygonCoords) if (anelTocaCirculo(ring, lng0, lat0, raioM)) return true;
        return false;
    }

    function setorInterseccionaCirculo(sec, lng0, lat0, raioM) {
        const g = sec?.geometry;
        if (!g?.coordinates) return false;
        if (g.type === 'Polygon') return poligonoInterseccionaCirculo(g.coordinates, lng0, lat0, raioM);
        if (g.type === 'MultiPolygon') return g.coordinates.some(poly => poligonoInterseccionaCirculo(poly, lng0, lat0, raioM));
        return false;
    }

    function removerDiagnostico() { document.getElementById('buffer-diagnostico')?.remove(); }

    function calcular(force = false) {
        const painel = document.getElementById('buffer-tool');
        const out = document.getElementById('buffer-resultado');
        const slider = document.getElementById('buffer-slider');
        if (!painel || !out || !slider) return;
        if (getComputedStyle(painel).display === 'none') return;
        removerDiagnostico();
        try {
            if (typeof geoSetores === 'undefined' || !geoSetores || !Array.isArray(geoSetores.features)) return;
            if (typeof bufferLatLng === 'undefined' || !bufferLatLng) return;
            const raioM = Number(slider.value || 500);
            const lng0 = Number(bufferLatLng.lng);
            const lat0 = Number(bufferLatLng.lat);
            const chaveCentro = `${lng0.toFixed(7)},${lat0.toFixed(7)}`;
            if (!force && chaveCentro === ultimoCentro && raioM === ultimoRaio) return;
            ultimoCentro = chaveCentro;
            ultimoRaio = raioM;
            let total = 0;
            for (const sec of geoSetores.features) {
                if (!setorInterseccionaCirculo(sec, lng0, lat0, raioM)) continue;
                const pop = Math.round(calcularPopulacaoApta2026(sec.properties || {}));
                if (pop > 0) total += pop;
            }
            out.innerText = format(total);
        } catch (e) { console.error(`${VERSAO} erro`, e); }
    }

    function iniciar() {
        removerDiagnostico();
        const slider = document.getElementById('buffer-slider');
        const painel = document.getElementById('buffer-tool');
        const escola = document.getElementById('buffer-escola');
        slider?.addEventListener('input', () => setTimeout(() => calcular(true), 20));
        slider?.addEventListener('change', () => setTimeout(() => calcular(true), 20));
        if (painel) new MutationObserver(() => setTimeout(() => calcular(true), 30)).observe(painel, { attributes: true, attributeFilter: ['style', 'class'] });
        if (escola) new MutationObserver(() => setTimeout(() => calcular(true), 30)).observe(escola, { childList: true, characterData: true, subtree: true });
        setInterval(() => calcular(false), 700);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();

// Tema executivo e módulos analíticos.
(() => {
    if (!document.getElementById('atlas-dashboard-theme')) {
        const link = document.createElement('link'); link.id = 'atlas-dashboard-theme'; link.rel = 'stylesheet'; link.href = 'dashboard-theme.css?v=2'; document.head.appendChild(link);
    }

    const loaders = [
        ['atlas-evolution-loader','evolution.js?v=2','head'],
        ['atlas-chart-recovery-loader','chart-recovery.js?v=1','body'],
        ['atlas-landing-polish-loader','landing-polish.js?v=1','body'],
        ['atlas-ui-fixes-loader','ui-fixes.js?v=1','body'],
        ['atlas-recursos-loader','recursos-federais.js?v=1','body'],
        ['atlas-notas-metodologicas-loader','notas-metodologicas.js?v=1','body'],
        ['atlas-admin-usuarios-loader','admin-usuarios.js?v=3','body']
    ];
    loaders.forEach(([id,src,dest])=>{
        if(document.getElementById(id)) return;
        const script=document.createElement('script'); script.id=id; script.src=src; script.defer=true;
        (dest==='head'?document.head:document.body).appendChild(script);
    });
})();
