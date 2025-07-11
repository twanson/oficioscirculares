const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para suscripción a MailChimp
app.post('/subscribe', async (req, res) => {
    const { firstName, email } = req.body;
    
    console.log(`📧 Intento de suscripción: ${firstName} - ${email}`);
    
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
        
        const data = {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: firstName,
            },
            tags: [process.env.NODE_ENV === 'production' ? 'Diagnóstico Circular Express' : 'Diagnóstico Circular Express - STAGING']
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
        isProduction: process.env.NODE_ENV === 'production',
        tagToUse: process.env.NODE_ENV === 'production' ? 'Diagnóstico Circular Express' : 'Diagnóstico Circular Express - STAGING'
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