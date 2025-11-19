const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const recursos = require('./lib/recursos');
const tokenValidator = require('./lib/tokenValidator');
const directorio = require('./lib/directorio');
require('dotenv').config();

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

// Configuración de Renovación de Tokens (usando variables de entorno)
const REISSUE_WEBHOOK_URL = process.env.REISSUE_WEBHOOK_URL;
const REISSUE_API_KEY = process.env.REISSUE_API_KEY;

// Rate limiting simple en memoria
const rateLimitStore = new Map();
const emailCooldownStore = new Map();

// Función para limpiar stores periódicamente (evitar memory leaks)
setInterval(() => {
    const now = Date.now();
    // Limpiar rate limit store (15 min = 900000ms)
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.firstRequest > 900000) {
            rateLimitStore.delete(key);
        }
    }
    // Limpiar email cooldown store (10 min = 600000ms)
    for (const [email, timestamp] of emailCooldownStore.entries()) {
        if (now - timestamp > 600000) {
            emailCooldownStore.delete(email);
        }
    }
}, 60000); // Limpiar cada minuto

// Rate limiting middleware
function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutos
    const maxRequests = 60;

    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, { count: 1, firstRequest: now });
        return next();
    }

    const data = rateLimitStore.get(ip);
    
    // Reset window si ha pasado el tiempo
    if (now - data.firstRequest > windowMs) {
        rateLimitStore.set(ip, { count: 1, firstRequest: now });
        return next();
    }

    // Incrementar contador
    data.count++;
    
    if (data.count > maxRequests) {
        return res.status(429).json({
            ok: false,
            message: 'Demasiadas solicitudes. Inténtalo más tarde.'
        });
    }

    next();
}

// Email cooldown check
function checkEmailCooldown(email) {
    const now = Date.now();
    const cooldownMs = 10 * 60 * 1000; // 10 minutos
    
    if (emailCooldownStore.has(email)) {
        const lastRequest = emailCooldownStore.get(email);
        if (now - lastRequest < cooldownMs) {
            return false; // Aún en cooldown
        }
    }
    
    emailCooldownStore.set(email, now);
    return true; // OK para proceder
}

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

// Ruta específica para página de gracias de recursos (debe ir ANTES de /recursos/:slug)
app.get('/recursos/gracias', (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'public', 'recursos', 'gracias', 'index.html'));
});

// Ruta específica para modelos-sostenibles (coming soon)
app.get('/recursos/modelos-sostenibles', (req, res) => {
  res.render('coming-soon', {
    title: 'Guía de Modelos de Negocios Sostenibles - Próximamente',
    description: 'Próximamente disponible: Guía completa de modelos de negocios sostenibles para artesanos y pequeñas marcas.',
    canonical: '/recursos/modelos-sostenibles'
  });
});

// Rutas de servicios
app.get('/servicios/diagnostico-3d', (req, res) => {
  res.render('diagnostico-3d');
});

app.get('/servicios/roadmap-3d', (req, res) => {
  res.render('roadmap-3d');
});

app.get('/servicios/sprint-3d', (req, res) => {
    res.render('sprint-3d');
});

// Página de contacto con formulario Tally
app.get('/contacto', (req, res) => {
    res.render('contacto');
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

// Ruta específica para E-WEAR gracias
app.get('/gracias/e-wear', (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.render('gracias-ewear');
});

app.get('/gracias', (req, res) => {
  const isDir = req.query.resource === 'dir';
  const isEwear = req.query.resource === 'e-wear-docs';
  const rawEmail = (req.query.email || '').trim();
  
  // Si es E-WEAR, redirigir a la página específica
  if (isEwear) {
    return res.redirect('/gracias/e-wear');
  }
  
  // Función mejorada para enmascarar email
  function maskEmail(email) {
    if (!email) return '';
    const [u, d] = email.split('@');
    if (!d) return email;
    const dom = d.split('.');
    const base = dom[0] ? dom[0].slice(0, 3) + '•••' : d;
    const tail = dom.slice(1).join('.');
    return `${u}@${base}${tail ? '.' + tail : ''}`;
  }
  
  const viewModel = {
    isDir,
    maskedEmail: isDir ? maskEmail(rawEmail) : null,
    q: req.query,
    noindex: isDir,
    title: isDir ? 'Ya formas parte de la comunidad' : '¡Gracias!',
    description: isDir ? 'Te hemos enviado tu enlace de acceso al Directorio y recibirás un email de bienvenida en 24-48h.' : 'Tu solicitud se ha enviado correctamente.',
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

// --- DIRECTORIO DE PROVEEDORES ---
app.get('/dir', async (req, res) => {
  const token = req.query.token;
  
  // Si hay token, intentar validación y mostrar directorio
  if (token) {
    try {
      console.log(`🔍 Validating token: ${token}`);
      const validation = await tokenValidator.validateAndRenewToken(token);
      
      if (validation.valid) {
        console.log(`✅ Token valid, rendering directorio for ${validation.email}`);
        
        // Obtener datos del directorio
        const proveedores = await directorio.getProveedores();
        const categorias = await directorio.getCategorias();
        const ubicaciones = await directorio.getUbicaciones();
        
        return res.render('directorio', { 
          email: validation.email,
          expiresAt: validation.expiresAt,
          proveedores: proveedores.map(p => directorio.formatearProveedor(p)),
          categorias,
          ubicaciones,
          filtros: {
            categoria: req.query.categoria || '',
            ubicacion: req.query.ubicacion || '',
            busqueda: req.query.q || ''
          },
          q: req.query,
          title: 'Directorio de Proveedores Sostenibles',
          description: 'Directorio curado de proveedores verificados con criterios de sostenibilidad y circularidad.',
          canonical: '/dir'
        });
      } else {
        console.log(`❌ Token invalid: ${validation.error}`);
        return res.redirect('/renovar-acceso?error=' + encodeURIComponent(validation.error));
      }
    } catch (error) {
      console.error('💥 Error during token validation:', error);
      return res.redirect('/renovar-acceso?error=validation_failed');
    }
  }
  
  // Si no hay token, mostrar gate normal
  res.render('dir-gate', { q: req.query, noindex: false });
});

// --- MAPA CIRCULAR ARTESANO ---
app.get('/mapa', async (req, res) => {
  const token = req.query.token;
  
  // Si hay token, intentar validación y mostrar mapa
  if (token) {
    try {
      console.log(`🔍 Validating token for mapa: ${token}`);
      const validation = await tokenValidator.validateAndRenewToken(token);
      
      if (validation.valid) {
        console.log(`✅ Token valid, rendering mapa for ${validation.email}`);
        
        return res.render('mapa', { 
          email: validation.email,
          expiresAt: validation.expiresAt,
          q: req.query,
          title: 'Mapa Circular Artesano',
          description: 'Mapa interactivo con recursos circulares verificados.',
          canonical: '/mapa'
        });
      } else {
        console.log(`❌ Token invalid: ${validation.error}`);
        return res.redirect('/renovar-acceso?error=' + encodeURIComponent(validation.error));
      }
    } catch (error) {
      console.error('💥 Error during token validation for mapa:', error);
      return res.redirect('/renovar-acceso?error=validation_failed');
    }
  }
  
  // Si no hay token, mostrar gate normal
  res.render('mapa-gate', { q: req.query, noindex: false });
});

// Detalle de proveedor individual
app.get('/dir/proveedor/:id', async (req, res) => {
  const token = req.query.token;
  
  if (!token) {
    return res.redirect('/dir');
  }
  
  try {
    const validation = await tokenValidator.validateAndRenewToken(token);
    
    if (!validation.valid) {
      return res.redirect('/renovar-acceso?error=' + encodeURIComponent(validation.error));
    }
    
    const proveedor = await directorio.getProveedorById(req.params.id);
    
    if (!proveedor) {
      return res.status(404).render('error', { 
        title: 'Proveedor no encontrado',
        message: 'El proveedor solicitado no existe o no está disponible.'
      });
    }
    
    res.render('proveedor-detalle', {
      email: validation.email,
      proveedor: directorio.formatearProveedor(proveedor),
      title: `${proveedor.nombre} - Directorio Oficios Circulares`,
      description: proveedor.descripcion,
      canonical: `/dir/proveedor/${proveedor.id}`,
      noindex: true,
      q: req.query
    });
    
  } catch (error) {
    console.error('💥 Error accessing proveedor detail:', error);
    res.redirect('/renovar-acceso?error=validation_failed');
  }
});

// API endpoint para búsqueda AJAX
app.get('/api/dir/search', async (req, res) => {
  try {
    const { q, categoria, ubicacion } = req.query;
    let proveedores = await directorio.getProveedores();
    
    // Aplicar filtros
    if (q) {
      proveedores = await directorio.searchProveedores(q);
    }
    
    if (categoria) {
      proveedores = proveedores.filter(p => 
        p.categoria.toLowerCase().includes(categoria.toLowerCase())
      );
    }
    
    if (ubicacion) {
      proveedores = proveedores.filter(p => 
        p.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      total: proveedores.length,
      proveedores: proveedores.map(p => directorio.formatearProveedor(p))
    });
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

app.get('/dir/confirmacion', (req, res) => {
  // Página simple de "revisa tu email" con noindex
  res.render('dir-confirmacion', { q: req.query, noindex: true });
});

// --- Validación de tokens y renovación de acceso
app.get('/renovar-acceso', (req, res) => {
  const error = req.query.error;
  res.render('renovar-acceso', { 
    error,
    q: req.query,
    noindex: true,
    title: 'Renovar acceso al Directorio',
    description: 'Renueva tu acceso al directorio de proveedores.',
    canonical: '/renovar-acceso'
  });
});

// API endpoint para validación AJAX (opcional)
app.get('/api/validate-token', async (req, res) => {
  const token = req.query.token;
  
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token required' });
  }

  try {
    const validation = await tokenValidator.validateAndRenewToken(token);
    res.json(validation);
  } catch (error) {
    console.error('API validation error:', error);
    res.status(500).json({ valid: false, error: 'Internal server error' });
  }
});

// Endpoint POST /api/renew-access - Renovación simple de acceso al directorio
app.post('/api/renew-access', rateLimitMiddleware, async (req, res) => {
    try {
        // 1. Validar y normalizar email
        const { email } = req.body;
        
        if (!email || typeof email !== 'string') {
            return res.json({
                ok: true,
                message: "Si tu email está en la comunidad, te hemos enviado un nuevo enlace."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        
        // 2. Validar formato básico de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.json({
                ok: true,
                message: "Si tu email está en la comunidad, te hemos enviado un nuevo enlace."
            });
        }

        // 3. Verificar cooldown de email (10 minutos)
        if (!checkEmailCooldown(normalizedEmail)) {
            console.log(`⚠️  Email ${normalizedEmail} en cooldown (10 min)`);
            return res.json({
                ok: true,
                message: "Si tu email está en la comunidad, te hemos enviado un nuevo enlace."
            });
        }

        // 4. Verificar que tenemos las variables de entorno necesarias
        if (!REISSUE_WEBHOOK_URL || !REISSUE_API_KEY) {
            console.error('❌ Missing REISSUE_WEBHOOK_URL or REISSUE_API_KEY');
            return res.json({
                ok: true,
                message: "Si tu email está en la comunidad, te hemos enviado un nuevo enlace."
            });
        }

        // 5. Llamar a webhook de Make (server-to-server)
        const makeResponse = await fetch(REISSUE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-make-apikey': REISSUE_API_KEY
            },
            body: `email=${encodeURIComponent(normalizedEmail)}`,
            timeout: 10000 // 10 segundos timeout
        });

        if (makeResponse.ok) {
            try {
                const result = await makeResponse.json();
                console.log(`✅ Renovación procesada para ${normalizedEmail}: ${result.code || 'SENT'}`);
            } catch (jsonError) {
                // Make puede devolver "Accepted" como texto plano durante testing
                const textResult = await makeResponse.text();
                console.log(`✅ Renovación procesada para ${normalizedEmail}: ${textResult}`);
            }
        } else {
            console.error(`❌ Error en Make webhook (${makeResponse.status}): ${makeResponse.statusText}`);
        }

    } catch (error) {
        console.error('❌ Error en /api/renew-access:', error.message);
    }

    // 6. SIEMPRE responder éxito (anti-enumeración)
    res.json({
        ok: true,
        message: "Si tu email está en la comunidad, te hemos enviado un nuevo enlace."
    });
});

app.use(express.static('public'));

// Servir página principal como EJS template
app.get('/', (req, res) => {
    res.render('index');
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

// Endpoint de verificación de configuración Google Sheets
app.get('/test-google-sheets', async (req, res) => {
    const config = {
        hasServiceAccountJSON: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        hasSpreadsheetId: !!process.env.SPREADSHEET_ID,
        hasSheetName: !!process.env.SHEET_NAME,
        spreadsheetId: process.env.SPREADSHEET_ID || 'Not configured',
        sheetName: process.env.SHEET_NAME || 'Not configured',
        nodeEnv: process.env.NODE_ENV || 'undefined'
    };
    
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.SPREADSHEET_ID || !process.env.SHEET_NAME) {
        return res.json({
            status: 'error',
            message: 'Configuración incompleta de Google Sheets',
            config,
            instructions: 'Configura las variables de entorno: GOOGLE_SERVICE_ACCOUNT_JSON, SPREADSHEET_ID, SHEET_NAME'
        });
    }
    
    try {
        // Probar conexión con Google Sheets
        const tokenValidator = require('./lib/tokenValidator');
        
        // Intentar hacer una consulta simple
        const response = await tokenValidator.sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: `${process.env.SHEET_NAME}!A1:Z1`, // Solo la primera fila
        });
        
        res.json({
            status: 'success',
            message: 'Configuración correcta de Google Sheets ✅',
            config,
            sheetData: {
                hasData: !!response.data.values,
                rowCount: response.data.values ? response.data.values.length : 0,
                headers: response.data.values ? response.data.values[0] : []
            }
        });
    } catch (error) {
        res.json({
            status: 'error',
            message: 'Error de conexión con Google Sheets',
            config,
            error: error.message
        });
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