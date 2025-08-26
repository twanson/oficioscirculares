const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const recursos = require('./lib/recursos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para redirigir dominio naked a www
app.use((req, res, next) => {
    const host = req.get('host');
    
    // Si es localhost, permitir sin redirecciones
    if (host && host.startsWith('localhost')) {
        return next();
    }
    
    // Si es el dominio naked (sin www), redirigir a www
    if (host === 'oficioscirculares.com') {
        return res.redirect(301, `https://www.oficioscirculares.com${req.originalUrl}`);
    }
    
    // Si no es HTTPS en producción, forzar HTTPS
    if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
    }
    
    next();
});

// Configuración de MailChimp (usando variables de entorno)
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || '947779';
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us2';

// Validar que las variables de entorno estén configuradas
console.log('🔍 Estado de variables de entorno:');
console.log('   - MAILCHIMP_API_KEY:', MAILCHIMP_API_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('   - MAILCHIMP_AUDIENCE_ID:', MAILCHIMP_AUDIENCE_ID);
console.log('   - MAILCHIMP_SERVER_PREFIX:', MAILCHIMP_SERVER_PREFIX);

if (!MAILCHIMP_API_KEY) {
    console.error('\n❌ PROBLEMA: MAILCHIMP_API_KEY no está configurada');
    console.log('\n📝 Para solucionarlo:');
    console.log('1. Ve a https://admin.mailchimp.com/account/api/');
    console.log('2. Crea una nueva API Key');
    console.log('3. En Railway, ve a tu proyecto > Variables');
    console.log('4. Añade estas variables:');
    console.log('   - MAILCHIMP_API_KEY: [tu_api_key]');
    console.log('   - MAILCHIMP_AUDIENCE_ID: [tu_audience_id]');
    console.log('   - MAILCHIMP_SERVER_PREFIX: [us1, us2, etc.]');
    console.log('\n⚠️  Mientras tanto, los emails no se guardarán en Mailchimp\n');
}

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());

// Middleware para redirecciones PDF (maneja varias codificaciones)
app.use('/', (req, res, next) => {
  const url = req.path;
  
  // Lista de variantes del nombre del PDF original
  const pdfVariants = [
    '/Diagnostico_Circular_Express_Oficios_Circulares.pdf',
    '/Diagnóstico_Circular_Express_Oficios_Circulares.pdf',
    '/Diagn%C3%B3stico_Circular_Express_Oficios_Circulares.pdf',
    '/Diagn%C2%B3stico_Circular_Express_Oficios_Circulares.pdf'
  ];
  
  // Si la URL coincide con alguna variante, redirigir
  if (pdfVariants.includes(url) || url.includes('Diagn') && url.includes('stico_Circular_Express') && url.endsWith('.pdf')) {
    return res.redirect(301, '/downloads/Circular_Express_Oficios_Circulares_2025.pdf');
  }
  
  next();
});

// Función para preservar query parameters en redirecciones
function redirectWithQuery(target, req, res) {
  const q = req.originalUrl.split('?')[1];
  res.redirect(301, q ? `${target}?${q}` : target);
}

// Redirecciones vanity
app.get('/guia', (req, res) => {
  redirectWithQuery('/recursos/guia-materiales', req, res);
});

app.get('/circular-express', (req, res) => {
  redirectWithQuery('/recursos/circular-express', req, res);
});

// Rutas de recursos
app.get('/recursos', (req, res) => {
  const visibles = recursos.getAllRecursos().filter(r => r.listed !== false);
  res.render('recursos-list', {
    title: 'Recursos descargables',
    description: 'Guías, tests y herramientas para aplicar circularidad con criterio.',
    canonical: '/recursos',
    recursos: visibles
  });
});

app.get('/recursos/:slug', (req, res) => {
  const r = recursos.getRecursoBySlug(req.params.slug);
  if (!r) return res.status(404).send('Recurso no encontrado');
  res.render('recurso-detail', {
    title: r.title,
    description: r.summary,
    canonical: `/recursos/${r.slug}`,
    recurso: r
  });
});

app.get('/gracias', (req, res) => {
  const isDir = req.query.resource === 'dir';
  const rawEmail = (req.query.email || '').trim();
  function maskEmail(e) {
    const [u, d] = (e || '').split('@');
    if (!u || !d) return e || '';
    const u2 = u.length <= 3 ? u : (u.slice(0, 3) + '•••');
    const dot = d.lastIndexOf('.');
    const dom = dot > 0 ? d.slice(0, 3) + '•••' + d.slice(dot) : d;
    return `${u2}@${dom}`;
  }
  const viewModel = {
    isDir,
    emailShown: maskEmail(rawEmail),
    q: req.query,
    noindex: isDir,
    title: isDir ? 'Revisa tu email para acceder al Directorio' : '¡Gracias!',
    description: isDir ? 'Te hemos enviado un email con tu enlace de acceso al Directorio.' : 'Tu solicitud se ha enviado correctamente.',
    canonical: req.originalUrl
  };
  res.render('gracias', viewModel);
});

app.get('/gracias/:slug', (req, res) => {
  const r = recursos.getRecursoBySlug(req.params.slug);
  if (!r) return res.status(404).send('Recurso no encontrado');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.render('gracias', {
    title: `Gracias – ${r.title}`,
    description: 'Tu descarga está lista.',
    canonical: `/gracias/${r.slug}`,
    recurso: r,
    noindex: true
  });
});

app.get('/guia-corta', (req, res) => {
  const q = req.originalUrl.split('?')[1];
  res.redirect(301, q ? `/recursos/guia-materiales-corta?${q}` : '/recursos/guia-materiales-corta');
});

// --- /dir (gate) y /dir/confirmacion
app.get('/dir', (req, res) => {
  // Pasamos q=req.query para preservar UTM y cualquier param (utm_source, utm_medium, utm_campaign, utm_content, page_url)
  res.render('dir-gate', { q: req.query, noindex: false });
});

app.get('/dir/confirmacion', (req, res) => {
  // Página simple de "revisa tu email" con noindex
  res.render('dir-confirmacion', { q: req.query, noindex: true });
});

app.use(express.static('public'));

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para suscripción a MailChimp
app.post('/subscribe', async (req, res) => {
    const { firstName, email, tags } = req.body;
    
    console.log(`📧 Intento de suscripción: ${firstName} - ${email}`);
    console.log(`🏷️ Etiquetas recibidas: ${tags ? JSON.stringify(tags) : 'ninguna'}`);
    console.log(`🔍 Tipo de tags:`, typeof tags);
    console.log(`🔍 Es array?:`, Array.isArray(tags));
    console.log(`🔍 Length:`, tags ? tags.length : 'N/A');
    
    if (!firstName || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    // Verificar si las variables de entorno están configuradas
    if (!MAILCHIMP_API_KEY) {
        console.error('❌ Error: No se puede suscribir - MAILCHIMP_API_KEY no configurada');
        return res.status(500).json({ 
            error: 'Configuración de Mailchimp incompleta',
            details: 'Las variables de entorno no están configuradas correctamente'
        });
    }
    
    try {
        const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;
        
        console.log(`🔗 URL de Mailchimp: ${url}`);
        
        // SOLO usar etiquetas que vienen desde Make/frontend - SIN etiquetas automáticas
        let finalTags = [];
        
        if (tags && Array.isArray(tags) && tags.length > 0) {
            // Usar ÚNICAMENTE las etiquetas que vienen desde Make/frontend
            finalTags = tags;
            console.log(`🏷️ Usando etiquetas desde Make/frontend: ${JSON.stringify(tags)}`);
        } else if (tags && typeof tags === 'string' && tags.trim() !== '') {
            // Si viene como string, convertir a array
            finalTags = [tags.trim()];
            console.log(`🏷️ Usando etiqueta string desde Make/frontend: ${tags}`);
        } else {
            // NO añadir ninguna etiqueta automática - dejar vacío
            finalTags = [];
            console.log(`🏷️ Sin etiquetas - NO se añaden etiquetas automáticas`);
        }
        
        const data = {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: firstName,
            },
            tags: finalTags
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        console.log(`📊 Respuesta de Mailchimp [${response.status}]:`, result);
        console.log(`🏷️ Etiquetas finales enviadas a Mailchimp: ${JSON.stringify(finalTags)}`);
        
        if (response.ok) {
            console.log('✅ Suscripción exitosa a Mailchimp');
            res.json({ success: true, message: 'Suscripción exitosa' });
        } else {
            console.error('❌ Error de MailChimp:', result);
            
            // Si el email ya existe, considerarlo como éxito
            if (result.title === 'Member Exists') {
                console.log('ℹ️ Email ya existía en la lista');
                res.json({ success: true, message: 'Ya estás suscrito' });
            } else {
                res.status(400).json({ 
                    error: 'Error al suscribir', 
                    details: result.detail || result.title 
                });
            }
        }
        
    } catch (error) {
        console.error('💥 Error del servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Endpoint de verificación de configuración
app.get('/test-mailchimp', async (req, res) => {
    const config = {
        hasApiKey: !!MAILCHIMP_API_KEY,
        audienceId: MAILCHIMP_AUDIENCE_ID,
        serverPrefix: MAILCHIMP_SERVER_PREFIX,
        apiKeyLength: MAILCHIMP_API_KEY ? MAILCHIMP_API_KEY.length : 0,
        nodeEnv: process.env.NODE_ENV || 'undefined',
        nodeEnvLength: (process.env.NODE_ENV || '').length,
        nodeEnvType: typeof process.env.NODE_ENV,
        isProduction: (process.env.NODE_ENV || '').trim() === 'production',
        tagLogic: 'Etiquetas gestionadas completamente desde Make - sin etiquetas automáticas'
    };
    
    if (!MAILCHIMP_API_KEY) {
        return res.json({
            status: 'error',
            message: 'Configuración incompleta',
            config,
            instructions: 'Revisa CONFIGURACION_MAILCHIMP.md para configurar las variables'
        });
    }
    
    try {
        // Probar conexión con Mailchimp
        const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            res.json({
                status: 'success',
                message: 'Configuración correcta ✅',
                config,
                audienceName: data.name,
                memberCount: data.stats.member_count
            });
        } else {
            const error = await response.json();
            res.json({
                status: 'error',
                message: 'Error de conexión con Mailchimp',
                config,
                error: error.detail
            });
        }
    } catch (error) {
        res.json({
            status: 'error',
            message: 'Error al conectar',
            config,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🔧 Test de configuración: http://localhost:${PORT}/test-mailchimp`);
}); 