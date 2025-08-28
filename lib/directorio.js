const { google } = require('googleapis');
require('dotenv').config();

class DirectorioManager {
    constructor() {
        this.sheets = null;
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
                console.warn('⚠️ GOOGLE_SERVICE_ACCOUNT_JSON no configurado - Directorio funcionará en modo mock');
                return;
            }

            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
            });

            this.sheets = google.sheets({ version: 'v4', auth });
            this.initialized = true;
            console.log('✅ DirectorioManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando DirectorioManager:', error.message);
        }
    }

    async getProveedores() {
        if (!this.initialized || !this.sheets) {
            return this.getMockData();
        }

        try {
            const spreadsheetId = process.env.DIRECTORIO_SPREADSHEET_ID || process.env.SPREADSHEET_ID;
            const sheetName = process.env.DIRECTORIO_SHEET_NAME || 'Directorio';
            
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A:N`, // Columnas A a N (14 columnas)
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                console.log('📄 Hoja vacía - usando datos mock');
                return this.getMockData();
            }

            // Primera fila son los headers
            const headers = rows[0];
            const proveedores = [];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                
                // Solo procesar filas que tengan al menos nombre
                if (!row[0] || row[0].trim() === '') continue;
                
                const proveedor = {
                    id: i.toString(),
                    nombre: row[0] || '',
                    categoria: row[1] || 'General',
                    ubicacion: row[2] || '',
                    materiales: this.parseArray(row[3]),
                    certificaciones: this.parseArray(row[4]),
                    email: row[5] || '',
                    web: row[6] || '',
                    telefono: row[7] || '',
                    descripcion: row[8] || '',
                    logoUrl: row[9] || '',
                    estado: row[10] || 'activo',
                    fechaVerificacion: row[11] || '',
                    tags: this.parseArray(row[12]),
                    notas: row[13] || ''
                };

                // Solo incluir proveedores activos
                if (proveedor.estado.toLowerCase() === 'activo') {
                    proveedores.push(proveedor);
                }
            }

            console.log(`✅ Cargados ${proveedores.length} proveedores desde Google Sheets`);
            return proveedores;

        } catch (error) {
            console.error('❌ Error obteniendo datos de Google Sheets:', error.message);
            return this.getMockData();
        }
    }

    parseArray(str) {
        if (!str || typeof str !== 'string') return [];
        return str.split(',').map(item => item.trim()).filter(item => item);
    }

    getMockData() {
        return [
            {
                id: '1',
                nombre: 'EcoMateriales Barcelona',
                categoria: 'Materiales Reciclados',
                ubicacion: 'Barcelona, España',
                materiales: ['Plástico reciclado', 'Metal recuperado', 'Vidrio reutilizado'],
                certificaciones: ['ISO 14001', 'Cradle to Cradle'],
                email: 'info@ecomateriales.com',
                web: 'https://ecomateriales.com',
                telefono: '+34 93 123 4567',
                descripcion: 'Especialistas en materiales reciclados para diseño sostenible. Más de 10 años transformando residuos en recursos valiosos para artesanos y diseñadores conscientes.',
                logoUrl: '/assets/images/placeholder-logo.png',
                estado: 'activo',
                fechaVerificacion: '2024-01-15',
                tags: ['verificado', 'local', 'certificado'],
                notas: 'Proveedor verificado por Oficios Circulares'
            },
            {
                id: '2',
                nombre: 'Fibras Naturales del Sur',
                categoria: 'Textiles Sostenibles',
                ubicacion: 'Sevilla, España',
                materiales: ['Algodón orgánico', 'Lino europeo', 'Cáñamo'],
                certificaciones: ['GOTS', 'OEKO-TEX'],
                email: 'contacto@fibrasnaturales.es',
                web: 'https://fibrasnaturales.es',
                telefono: '+34 95 456 7890',
                descripcion: 'Producción artesanal de fibras naturales cultivadas sin pesticidas. Trabajamos directamente con agricultores locales para garantizar la trazabilidad completa.',
                logoUrl: '/assets/images/placeholder-logo.png',
                estado: 'activo',
                fechaVerificacion: '2024-02-01',
                tags: ['orgánico', 'local', 'artesanal'],
                notas: 'Excelente comunicación y tiempos de entrega'
            },
            {
                id: '3',
                nombre: 'Madera Responsable',
                categoria: 'Maderas Certificadas',
                ubicacion: 'Galicia, España',
                materiales: ['Roble certificado', 'Pino sostenible', 'Castaño local'],
                certificaciones: ['FSC', 'PEFC'],
                email: 'info@maderaresponsable.com',
                web: 'https://maderaresponsable.com',
                telefono: '+34 98 234 5678',
                descripcion: 'Gestión forestal sostenible y venta de maderas certificadas. Cada pieza viene con certificado de origen y plan de reforestación asociado.',
                logoUrl: '/assets/images/placeholder-logo.png',
                estado: 'activo',
                fechaVerificacion: '2024-01-20',
                tags: ['FSC', 'reforestación', 'gallego'],
                notas: 'Compromiso real con la sostenibilidad'
            }
        ];
    }

    async getProveedorById(id) {
        const proveedores = await this.getProveedores();
        return proveedores.find(p => p.id === id);
    }

    async getProveedoresByCategoria(categoria) {
        const proveedores = await this.getProveedores();
        return proveedores.filter(p => 
            p.categoria.toLowerCase().includes(categoria.toLowerCase())
        );
    }

    async searchProveedores(query) {
        const proveedores = await this.getProveedores();
        const searchTerm = query.toLowerCase();
        
        return proveedores.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm) ||
            p.categoria.toLowerCase().includes(searchTerm) ||
            p.ubicacion.toLowerCase().includes(searchTerm) ||
            p.materiales.some(m => m.toLowerCase().includes(searchTerm)) ||
            p.descripcion.toLowerCase().includes(searchTerm) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm))
        );
    }

    async getCategorias() {
        const proveedores = await this.getProveedores();
        const categorias = [...new Set(proveedores.map(p => p.categoria))];
        return categorias.sort();
    }

    async getUbicaciones() {
        const proveedores = await this.getProveedores();
        const ubicaciones = [...new Set(proveedores.map(p => p.ubicacion))];
        return ubicaciones.sort();
    }

    async getMateriales() {
        const proveedores = await this.getProveedores();
        const materiales = new Set();
        
        proveedores.forEach(p => {
            p.materiales.forEach(m => materiales.add(m));
        });
        
        return [...materiales].sort();
    }

    formatearProveedor(proveedor) {
        return {
            ...proveedor,
            web: proveedor.web && !proveedor.web.startsWith('http') ? 
                `https://${proveedor.web}` : proveedor.web,
            materialesDisplay: proveedor.materiales.join(', '),
            certificacionesDisplay: proveedor.certificaciones.join(', '),
            ubicacionCorta: proveedor.ubicacion.split(',')[0] // Solo ciudad
        };
    }
}

module.exports = new DirectorioManager();