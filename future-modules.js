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
        const abx = bx - ax, aby = by - ay, apx = px - ax, apy = py - ay;
        const ab2 = abx * abx + aby * aby;
        if (ab2 === 0) return Math.hypot(px - ax, py - ay);
        let t = (apx * abx + apy * aby) / ab2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
    }

    function pontoDentroAnel(lng, lat, ring) {
        let dentro = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = Number(ring[i][0]), yi = Number(ring[i][1]);
            const xj = Number(ring[j][0]), yj = Number(ring[j][1]);
            const cruza = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-15) + xi);
            if (cruza) dentro = !dentro;
        }
        return dentro;
    }

    function centroDentroPoligono(lng, lat, polygonCoords) {
        if (!polygonCoords?.length || !pontoDentroAnel(lng, lat, polygonCoords[0])) return false;
        for (let h = 1; h < polygonCoords.length; h++) if (pontoDentroAnel(lng, lat, polygonCoords[h])) return false;
        return true;
    }

    function anelTocaCirculo(ring, lng0, lat0, raioM) {
        if (!Array.isArray(ring) || ring.length < 2) return false;
        const pts = ring.map(c => projetar(Number(c[0]), Number(c[1]), lng0, lat0));
        for (const [x, y] of pts) if (Math.hypot(x, y) <= raioM) return true;
        for (let i = 1; i < pts.length; i++) if (distanciaPontoSegmento(0, 0, ...pts[i - 1], ...pts[i]) <= raioM) return true;
        return distanciaPontoSegmento(0, 0, ...pts[pts.length - 1], ...pts[0]) <= raioM;
    }

    function poligonoInterseccionaCirculo(polygonCoords, lng0, lat0, raioM) {
        if (!Array.isArray(polygonCoords) || !polygonCoords.length) return false;
        if (centroDentroPoligono(lng0, lat0, polygonCoords)) return true;
        return polygonCoords.some(ring => anelTocaCirculo(ring, lng0, lat0, raioM));
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
        const painel = document.getElementById('buffer-tool'), out = document.getElementById('buffer-resultado'), slider = document.getElementById('buffer-slider');
        if (!painel || !out || !slider || getComputedStyle(painel).display === 'none') return;
        removerDiagnostico();
        try {
            if (typeof geoSetores === 'undefined' || !geoSetores || !Array.isArray(geoSetores.features) || typeof bufferLatLng === 'undefined' || !bufferLatLng) return;
            const raioM = Number(slider.value || 500), lng0 = Number(bufferLatLng.lng), lat0 = Number(bufferLatLng.lat);
            const chaveCentro = `${lng0.toFixed(7)},${lat0.toFixed(7)}`;
            if (!force && chaveCentro === ultimoCentro && raioM === ultimoRaio) return;
            ultimoCentro = chaveCentro; ultimoRaio = raioM;
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
        const slider = document.getElementById('buffer-slider'), painel = document.getElementById('buffer-tool'), escola = document.getElementById('buffer-escola');
        slider?.addEventListener('input', () => setTimeout(() => calcular(true), 20));
        slider?.addEventListener('change', () => setTimeout(() => calcular(true), 20));
        if (painel) new MutationObserver(() => setTimeout(() => calcular(true), 30)).observe(painel, { attributes: true, attributeFilter: ['style', 'class'] });
        if (escola) new MutationObserver(() => setTimeout(() => calcular(true), 30)).observe(escola, { childList: true, characterData: true, subtree: true });
        setInterval(() => calcular(false), 700);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

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
        ['atlas-admin-usuarios-loader','admin-usuarios.js?v=5','body'],
        ['atlas-request-access-loader','solicitar-acesso.js?v=3','body']
    ];
    loaders.forEach(([id,src,dest])=>{
        if(document.getElementById(id)) return;
        const script=document.createElement('script'); script.id=id; script.src=src; script.defer=true;
        (dest==='head'?document.head:document.body).appendChild(script);
    });
})();
