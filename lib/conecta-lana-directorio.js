// Directorio público de Conecta Lana — lee la hoja "Conecta Lana — Registro"
// (mismo patrón que lib/directorio.js, pero público y agrupado en 3 roles).
const { google } = require('googleapis');
require('dotenv').config();

const SPREADSHEET_ID = process.env.CONECTA_LANA_SPREADSHEET_ID || '1kcgnWV0uR8BSE70u-G8Z2jjb2f_2H1iCM2Fx0JiZIII';
const SHEET_NAME = process.env.CONECTA_LANA_SHEET_NAME || 'Registro';
const CACHE_TTL_MS = 60 * 1000; // cache corto: registros nuevos aparecen sin redeploy
// En entornos desplegados (Railway) NUNCA mostramos datos de ejemplo: o reales, o vacío.
const IS_DEPLOYED = process.env.NODE_ENV === 'production'
    || !!process.env.RAILWAY_ENVIRONMENT_NAME
    || !!process.env.RAILWAY_PROJECT_ID
    || !!process.env.RAILWAY_SERVICE_ID;

const norm = (s) => String(s || '').trim();
const deaccent = (s) => norm(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const isYes = (s) => ['si', 'yes', 'true', '1', 'x', 'verdadero'].includes(deaccent(s));
// Red de seguridad: nunca mostrar email ni teléfono aunque la gente los meta en cualquier campo.
const stripContact = (s) => norm(s)
    .replace(/@[^\s@]+\.[^\s@]{2,}/g, '')                                              // dominio de email (@gmail.com)
    .replace(/\+?\d[\d\s().\-]{7,}\d/g, (m) => (m.replace(/\D/g, '').length >= 9 ? '' : m)) // teléfonos (9+ dígitos)
    .replace(/\s{2,}/g, ' ')
    .trim();

class ConectaLanaDirectorio {
    constructor() {
        this.sheets = null;
        this.initialized = false;
        this._cache = null;
        this._cacheAt = 0;
        this._lastGood = null;
        this.init();
    }

    init() {
        try {
            if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
                if (IS_DEPLOYED) {
                    console.error('❌ [conecta-lana] GOOGLE_SERVICE_ACCOUNT_JSON NO configurado EN PRODUCCIÓN — el directorio quedará vacío hasta restaurar el env var');
                } else {
                    console.warn('⚠️ [conecta-lana] GOOGLE_SERVICE_ACCOUNT_JSON no configurado - datos de ejemplo (local)');
                }
                return;
            }
            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
            });
            this.sheets = google.sheets({ version: 'v4', auth });
            this.initialized = true;
            console.log('✅ [conecta-lana] Directorio inicializado');
        } catch (error) {
            console.error('❌ [conecta-lana] Error inicializando:', error.message);
        }
    }

    async getGrouped() {
        if (this._cache && (Date.now() - this._cacheAt) < CACHE_TTL_MS) return this._cache;

        // Sin credenciales: en local mostramos datos de ejemplo; en producción NUNCA (no publicar datos falsos).
        if (!this.initialized || !this.sheets) {
            if (IS_DEPLOYED) return this._lastGood || this._empty();
            const m = this._mock();
            this._cache = m;
            this._cacheAt = Date.now();
            return m;
        }

        try {
            const rows = await this._fetchRows();
            if (rows && rows.length) {
                const grouped = this._group(rows);
                this._cache = grouped;
                this._cacheAt = Date.now();
                this._lastGood = grouped; // último resultado real bueno
                return grouped;
            }
        } catch (error) {
            console.error('❌ [conecta-lana] Error leyendo la hoja:', error.message);
        }

        // Lectura fallida o vacía: NO cacheamos el fallo (el siguiente request reintenta) y
        // NUNCA mostramos datos de ejemplo en producción: servimos lo último bueno o vacío.
        if (this._lastGood) return this._lastGood;
        return IS_DEPLOYED ? this._empty() : this._mock();
    }

    _empty() {
        return { _source: 'empty', tengo: [], transformo: [], busco: [] };
    }

    async _fetchRows() {
        if (!this.initialized || !this.sheets) return null;

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:Z`,
        });
        const values = response.data.values;
        if (!values || values.length < 2) return null;

        const headers = values[0].map((h) => deaccent(h));
        const col = (name) => headers.indexOf(name);

        const out = [];
        for (let i = 1; i < values.length; i++) {
            const r = values[i];
            const get = (name) => {
                const j = col(name);
                return j >= 0 ? norm(r[j]) : '';
            };

            // Solo filas marcadas como publicables
            if (!isYes(get('publicable'))) continue;

            const tipoRaw = deaccent(get('tipo'));
            let tipo = '';
            if (tipoRaw.includes('tengo')) tipo = 'tengo';
            else if (tipoRaw.includes('transform')) tipo = 'transformo';
            else if (tipoRaw.includes('busco') || tipoRaw.includes('busca')) tipo = 'busco';
            else continue;

            const nombre = get('nombre');
            if (!nombre) continue;

            const entry = {
                tipo,
                nombre: stripContact(nombre),
                zona: stripContact(get('provincia_zona') || get('zona') || get('provincia')),
                cantidad: stripContact(get('cantidad')),
                raza_o_busca: stripContact(get('raza_o_busca') || get('raza') || get('busca')),
                estado_lana: stripContact(get('estado_lana') || get('estado')),
                para_que: stripContact(get('para_que')),
            };
            if (!entry.nombre) continue; // si el nombre era solo un email/teléfono, no lo publiques

            if (tipo === 'transformo') {
                const pairs = this._parseRaw(get('raw'));
                entry.servicios = stripContact(get('servicios')
                    || this._find(pairs, 'servicios de transformacion')
                    || this._find(pairs, 'servicios'));
                const terceros = get('lana_terceros')
                    || this._find(pairs, 'lana de terceros')
                    || this._find(pairs, 'terceros');
                entry.trabajaTerceros = terceros && !['no', 'false', '0'].includes(deaccent(terceros));
                // si el valor no es un sí/no escueto, úsalo como matiz ("28 razas", etc.)
                entry.tercerosExtra = (terceros && !isYes(terceros) && deaccent(terceros) !== 'no') ? stripContact(terceros) : '';
                // razas (raza_o_busca) y capacidad (cantidad) ya están en el entry; añadimos la descripción libre.
                entry.descripcion = stripContact(get('notas') || get('descripcion')
                    || this._find(pairs, 'cuentanos') || this._find(pairs, 'algo mas'));
            }

            out.push(entry);
        }
        return out;
    }

    _group(rows) {
        return {
            _source: 'sheet',
            tengo: rows.filter((r) => r.tipo === 'tengo'),
            transformo: rows.filter((r) => r.tipo === 'transformo'),
            busco: rows.filter((r) => r.tipo === 'busco'),
        };
    }

    // Tally guarda las respuestas en JSON; recogemos pares etiqueta→valor a cualquier profundidad.
    _parseRaw(rawStr) {
        if (!rawStr) return [];
        let obj;
        try { obj = JSON.parse(rawStr); } catch (e) { return []; }
        const pairs = [];
        // Resuelve el valor de un field de Tally. Las preguntas de opción múltiple guardan
        // value = [ids] y traen options:[{id,text}] → traducimos los ids a su texto
        // (mismo criterio que la función val(f) del workflow n8n).
        const resolve = (o) => {
            let v = o.value !== undefined ? o.value : (o.answer !== undefined ? o.answer : o.text);
            if (v == null) return '';
            if (Array.isArray(v)) {
                if (Array.isArray(o.options) && o.options.length) {
                    const byId = {};
                    o.options.forEach((op) => { if (op && op.id != null) byId[op.id] = (op.text != null ? op.text : op.label); });
                    v = v.map((x) => (byId[x] != null ? byId[x] : x));
                }
                return v.filter((s) => s != null && String(s).trim() !== '').join(' · ');
            }
            if (typeof v === 'boolean') return v ? 'Sí' : 'No';
            if (typeof v === 'object') return '';
            return String(v);
        };
        (function walk(o) {
            if (Array.isArray(o)) { o.forEach(walk); return; }
            if (o && typeof o === 'object') {
                const label = o.label || o.question || o.title || o.key || o.name;
                const hasVal = o.value !== undefined || o.answer !== undefined || o.text !== undefined;
                if (label != null && hasVal) {
                    const value = resolve(o);
                    if (value !== '') pairs.push([String(label), value]);
                }
                Object.values(o).forEach(walk);
            }
        })(obj);
        return pairs;
    }

    _find(pairs, keyword) {
        if (!pairs || !pairs.length) return '';
        const kw = deaccent(keyword);
        for (const [label, value] of pairs) {
            if (deaccent(label).includes(kw)) {
                return Array.isArray(value) ? value.join(' · ') : String(value);
            }
        }
        return '';
    }

    _mock() {
        return {
            _source: 'mock',
            tengo: [
                { nombre: 'David Sancho', zona: 'Matabuena/Segovia', cantidad: '8000', raza_o_busca: 'Merina', estado_lana: 'Vellón sucio (sin lavar)' },
                { nombre: 'Ganados Tortajada', zona: 'Teruel', cantidad: '3000', raza_o_busca: 'Sara aragonesa', estado_lana: 'Vellón sucio (sin lavar)' },
                { nombre: 'Vicente', zona: 'Bermillo de sayago', cantidad: '300', raza_o_busca: 'Castellana y churra', estado_lana: 'Vellón sucio (sin lavar)' },
            ],
            transformo: [
                { nombre: 'Wooldreamers', zona: 'Mota del Cuervo, Cuenca', servicios: 'Lavado · Cardado · Hilado · Tejido · Producto/prenda final', trabajaTerceros: true, tercerosExtra: '', raza_o_busca: 'Merino, talaverana, manchega, churra lebrijana', cantidad: 'Min. 30 kg', descripcion: 'Hilatura de lanas autóctonas españolas, artesanal y semi-industrial.' },
                { nombre: 'Ana Cruz Mateo Cebrián', zona: 'Valencia', servicios: 'Fieltrado · Lavado · Cardado · Hilado · Tejido · Teñido', trabajaTerceros: true, tercerosExtra: '', raza_o_busca: '', cantidad: 'Desde 2 kg a 10 kg', descripcion: 'Pequeños lotes y trabajo a medida.' },
            ],
            busco: [
                { nombre: 'Lara Aldaz', zona: 'Toda España', raza_o_busca: 'Merina vellón lavado', para_que: 'Producto textil' },
                { nombre: 'Hort el Relleu de Ca Saforaui', zona: 'Valencia comarca de la Safor', raza_o_busca: 'Para acolchado', para_que: 'Acolchado agrícola' },
                { nombre: 'Telarista Urbana', zona: 'Toda España. Vivo país vasco', raza_o_busca: 'Merina. Para fieltro y para tejer telar', para_que: 'Producto textil' },
            ],
        };
    }
}

module.exports = new ConectaLanaDirectorio();
