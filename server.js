const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de MailChimp
const MAILCHIMP_API_KEY = 'c8070e12fca98a38ab7600fd6193eb0a-us2';
const MAILCHIMP_AUDIENCE_ID = '947779';
const MAILCHIMP_SERVER_PREFIX = 'us2';

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para suscripción a MailChimp
app.post('/subscribe', async (req, res) => {
    const { firstName, email } = req.body;
    
    if (!firstName || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    try {
        const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;
        
        const data = {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: firstName,
            },
            tags: ['Diagnóstico Circular Express']
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
        
        if (response.ok) {
            res.json({ success: true, message: 'Suscripción exitosa' });
        } else {
            console.error('Error de MailChimp:', result);
            
            // Si el email ya existe, considerarlo como éxito
            if (result.title === 'Member Exists') {
                res.json({ success: true, message: 'Ya estás suscrito' });
            } else {
                res.status(400).json({ 
                    error: 'Error al suscribir', 
                    details: result.detail || result.title 
                });
            }
        }
        
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
}); 