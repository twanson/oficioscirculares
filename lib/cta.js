/**
 * Helper para construir URLs de contacto con parámetros internos oc_*
 * (equivalentes a los UTM, pero sin romper la atribución de sesión de GA4)
 * @param {Object} opts - Opciones para construir la URL
 * @param {string} opts.service - Servicio: 'diagnostico-3d' | 'roadmap-3d' | 'sprint-3d'
 * @param {string} opts.utmCampaign - Campaña UTM específica del servicio
 * @param {string} opts.utmContent - Contenido UTM: 'hero' | 'flow' | 'footer' | 'sticky' | 'menu'
 * @param {string} opts.pagePath - Ruta de la página actual
 * @param {string} [opts.utmSource='site'] - Fuente UTM
 * @param {string} [opts.utmMedium='organic'] - Medio UTM
 * @returns {string} URL completa para /contacto con parámetros
 */
function buildContactUrl(opts) {
    const {
        service,
        utmCampaign,
        utmContent,
        pagePath,
        utmSource = 'site',
        utmMedium = 'organic',
    } = opts;

    const params = new URLSearchParams({
        service,
        oc_source: utmSource,
        oc_medium: utmMedium,
        oc_campaign: utmCampaign,
        oc_content: utmContent,
        page_path: pagePath,
    });

    return `/contacto?${params.toString()}`;
}

/**
 * Helper para construir URLs de PDFs con UTM
 * @param {Object} opts - Opciones para construir la URL del PDF
 * @param {string} opts.baseUrl - URL base del PDF
 * @param {string} opts.service - Servicio
 * @param {string} opts.utmContent - Contenido UTM
 * @param {string} [opts.utmSource='site'] - Fuente UTM
 * @param {string} [opts.utmMedium='organic'] - Medio UTM
 * @returns {string} URL del PDF con parámetros UTM
 */
function buildPdfUrl(opts) {
    const {
        baseUrl,
        service,
        utmContent,
        utmSource = 'site',
        utmMedium = 'organic',
    } = opts;

    const utmCampaign = `oc-${service}`;
    const params = new URLSearchParams({
        oc_source: utmSource,
        oc_medium: utmMedium,
        oc_campaign: utmCampaign,
        oc_content: utmContent,
    });

    return `${baseUrl}?${params.toString()}`;
}

module.exports = {
    buildContactUrl,
    buildPdfUrl
};
