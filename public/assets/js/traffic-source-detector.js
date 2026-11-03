/**
 * Oficios Circulares - Traffic Source Detector
 * Detecta automáticamente la fuente de tráfico y envía a GTM/GA4
 */

class TrafficSourceDetector {
    constructor() {
        this.init();
    }

    init() {
        // Una sola vez por sesión: antes se enviaba en cada página vista
        // (~5 eventos por usuario) y solo la primera aporta el origen real.
        let already = null;
        try { already = sessionStorage.getItem('oc_traffic_source'); } catch (e) {}
        if (already) return;

        const trafficData = this.detectTrafficSource();
        this.sendToAnalytics(trafficData);
        try { sessionStorage.setItem('oc_traffic_source', JSON.stringify(trafficData)); } catch (e) {}
    }

    detectTrafficSource() {
        const referrer = document.referrer || '';
        const currentUrl = new URL(window.location.href);
        const urlParams = currentUrl.searchParams;
        
        // Extraer UTMs si existen
        const utmData = {
            source: urlParams.get('utm_source'),
            medium: urlParams.get('utm_medium'), 
            campaign: urlParams.get('utm_campaign'),
            content: urlParams.get('utm_content'),
            term: urlParams.get('utm_term')
        };

        // Determinar fuente principal
        const trafficSource = this.categorizeTraffic(referrer, utmData);
        
        return {
            ...trafficSource,
            referrer: referrer,
            landing_page: window.location.pathname,
            utm: utmData,
            timestamp: new Date().toISOString()
        };
    }

    categorizeTraffic(referrer, utmData) {
        // PRIORIDAD 1: UTM Medium (más preciso)
        if (utmData.medium) {
            const medium = utmData.medium.toLowerCase();
            
            if (medium === 'email' || medium === 'newsletter') {
                return {
                    source_category: 'email',
                    source_detail: utmData.source || 'email',
                    confidence: 'high'
                };
            }
            
            if (medium === 'social' || medium === 'social_organic') {
                return {
                    source_category: 'social',
                    source_detail: utmData.source || 'social',
                    confidence: 'high'
                };
            }
            
            if (medium === 'cpc' || medium === 'paid' || medium === 'ppc') {
                return {
                    source_category: 'paid',
                    source_detail: utmData.source || 'paid_search',
                    confidence: 'high'
                };
            }
            
            if (medium === 'referral') {
                return {
                    source_category: 'referral',
                    source_detail: utmData.source || 'referral',
                    confidence: 'high'
                };
            }
        }

        // PRIORIDAD 2: Análisis del Referrer
        if (referrer) {
            const referrerLower = referrer.toLowerCase();
            
            // Buscadores (tráfico orgánico)
            const searchEngines = ['google.', 'bing.', 'yahoo.', 'duckduckgo.', 'ecosia.'];
            if (searchEngines.some(engine => referrerLower.includes(engine))) {
                return {
                    source_category: 'organic',
                    source_detail: this.extractDomain(referrer),
                    confidence: 'medium'
                };
            }
            
            // Redes sociales
            const socialPlatforms = {
                'instagram.com': 'instagram',
                'linkedin.com': 'linkedin', 
                'facebook.com': 'facebook',
                'twitter.com': 'twitter',
                'x.com': 'twitter',
                'youtube.com': 'youtube',
                'tiktok.com': 'tiktok',
                'pinterest.': 'pinterest'
            };
            
            for (const [domain, platform] of Object.entries(socialPlatforms)) {
                if (referrerLower.includes(domain)) {
                    return {
                        source_category: 'social',
                        source_detail: platform,
                        confidence: 'medium'
                    };
                }
            }
            
            // Otros referrers
            return {
                source_category: 'referral',
                source_detail: this.extractDomain(referrer),
                confidence: 'low'
            };
        }

        // PRIORIDAD 3: Sin referrer = tráfico directo
        return {
            source_category: 'direct',
            source_detail: 'direct',
            confidence: 'medium'
        };
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }

    sendToAnalytics(trafficData) {
        // Enviar a Google Tag Manager / GA4
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'traffic_source_detected',
            traffic_source_category: trafficData.source_category,
            traffic_source_detail: trafficData.source_detail,
            traffic_confidence: trafficData.confidence,
            traffic_referrer: trafficData.referrer,
            traffic_landing_page: trafficData.landing_page,
            traffic_utm_source: trafficData.utm.source,
            traffic_utm_medium: trafficData.utm.medium,
            traffic_utm_campaign: trafficData.utm.campaign,
            page_location: window.location.href
        });

        // Log para debugging
        console.log('🔍 Traffic source detected:', trafficData);
    }

    // Método público para obtener datos en otras páginas
    static getTrafficData() {
        const stored = sessionStorage.getItem('oc_traffic_source');
        return stored ? JSON.parse(stored) : null;
    }
}

// Auto-inicializar cuando el DOM esté listo
// ── Tráfico interno (Jose) ──
// Visitar cualquier página con ?oc_interno=1 marca este navegador como interno
// durante 2 años (cookie oc_internal=internal); ?oc_interno=0 lo desmarca.
// GTM envía el valor de la cookie como traffic_type a GA4, que lo filtra.
(function () {
    try {
        var v = new URLSearchParams(window.location.search).get('oc_interno');
        if (v === '1') document.cookie = 'oc_internal=internal; path=/; max-age=63072000; SameSite=Lax; Secure';
        if (v === '0') document.cookie = 'oc_internal=; path=/; max-age=0; SameSite=Lax; Secure';
    } catch (e) {}
})();

// ── Clics en enlaces internos con parámetros oc_* (sustituyen a los UTM internos) ──
// Envía a GTM el evento cta_click con destino, ubicación y campaña del enlace.
document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var u;
    try { u = new URL(a.getAttribute('href'), window.location.href); } catch (err) { return; }
    if (u.origin !== window.location.origin) return;
    var p = u.searchParams;
    if (!p.get('oc_source') && !p.get('oc_medium')) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'cta_click',
        link_url: u.pathname,
        link_location: [p.get('oc_source'), p.get('oc_medium')].filter(Boolean).join(' / '),
        link_campaign: p.get('oc_campaign') || '',
        link_content: p.get('oc_content') || '',
        link_text: (a.textContent || '').trim().slice(0, 80)
    });
}, true);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TrafficSourceDetector();
    });
} else {
    new TrafficSourceDetector();
}
