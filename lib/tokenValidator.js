const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

class TokenValidator {
  constructor() {
    this.spreadsheetId = process.env.SPREADSHEET_ID;
    this.sheetName = process.env.SHEET_NAME;
    this.sheets = null;
    
    // Mapeo fijo de columnas A-O para la hoja Members_Tokens
    this.COLUMN_MAP = {
      token: 'A',           // A: token
      email: 'B',           // B: email
      created_at: 'C',      // C: created_at
      expires_at: 'D',      // D: expires_at
      used: 'E',            // E: used
      source: 'F',          // F: source
      utm_source: 'G',      // G: utm_source
      utm_medium: 'H',      // H: utm_medium
      utm_campaign: 'I',    // I: utm_campaign
      utm_content: 'J',     // J: utm_content
      resource_id: 'K',     // K: resource_id
      last_access_at: 'L',  // L: last_access_at
      revoked: 'M',         // M: revoked
      welcome_sent: 'N',    // N: welcome_sent
      welcome_sent_at: 'O'  // O: welcome_sent_at
    };
    
    // Validar variables de entorno requeridas
    this.validateEnvironmentVariables();
    this.init();
  }

  validateEnvironmentVariables() {
    const requiredVars = [
      'SPREADSHEET_ID',
      'SHEET_NAME', 
      'GOOGLE_SERVICE_ACCOUNT_JSON'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
      console.warn('   Google Sheets integration will be disabled');
    } else {
      console.log('✅ All required Google Sheets environment variables are present');
    }
  }

  // Formatear fecha en zona Madrid (YYYY-MM-DD HH:mm:ss)
  formatMadridDateTime(date = new Date()) {
    return date.toLocaleString('sv-SE', { 
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace('T', ' ');
  }

  // Actualizar múltiples columnas en una fila específica usando mapeo fijo
  async updateRowColumns(rowNumber, updates) {
    if (!this.sheets) {
      throw new Error('Google Sheets not initialized');
    }

    const batchRequests = [];
    
    for (const [columnName, value] of Object.entries(updates)) {
      const columnLetter = this.COLUMN_MAP[columnName];
      if (!columnLetter) {
        console.warn(`⚠️  Unknown column name: ${columnName}`);
        continue;
      }

      const range = `${this.sheetName}!${columnLetter}${rowNumber}`;
      batchRequests.push({
        range: range,
        values: [[value]]
      });
    }

    if (batchRequests.length === 0) {
      return;
    }

    await this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: batchRequests
      }
    });
  }

  async init() {
    try {
      // Configuración para Railway: usar JSON desde variable de entorno
      const serviceAccountJSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      
      if (!serviceAccountJSON) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
      }

      // Parsear el JSON del service account
      let credentials;
      try {
        credentials = JSON.parse(serviceAccountJSON);
      } catch (parseError) {
        throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: ' + parseError.message);
      }

      // Verificar que el JSON tiene los campos necesarios
      if (!credentials.type || !credentials.client_email || !credentials.private_key) {
        throw new Error('Invalid service account JSON: missing required fields (type, client_email, private_key)');
      }

      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets API initialized successfully with Railway configuration');
    } catch (error) {
      console.error('❌ Error initializing Google Sheets API:', error.message);
      // En desarrollo, continuar sin bloquear el servidor
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️  Running in development mode without Google Sheets integration');
      }
    }
  }

  async validateAndRenewToken(token) {
    if (!this.sheets) {
      console.log('⚠️  Google Sheets not initialized, skipping validation');
      return { valid: false, error: 'Google Sheets not available' };
    }

    try {
      // Obtener todos los datos de la hoja (hasta columna O)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:O`,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return { valid: false, error: 'No data found' };
      }

      // Usar mapeo fijo de columnas (índices 0-based para el array)
      const COLUMN_INDEX = {
        token: 0,       // A
        email: 1,       // B
        expires_at: 3,  // D
        used: 4,        // E
        revoked: 12     // M
      };

      let tokenRowIndex = -1;
      let tokenData = null;

      // Buscar el token en la columna A
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][COLUMN_INDEX.token] === token) {
          tokenRowIndex = i + 1; // +1 porque Google Sheets usa índice basado en 1
          tokenData = rows[i];
          break;
        }
      }

      if (!tokenData) {
        return { valid: false, error: 'Token not found' };
      }

      // Verificar si está revocado (columna M)
      const revokedValue = tokenData[COLUMN_INDEX.revoked];
      const isRevoked = revokedValue === 'TRUE' || revokedValue === true || revokedValue === 'true';
      if (isRevoked) {
        return { valid: false, error: 'Token revoked' };
      }

      // Verificar si ha expirado (columna D)
      const expiresAtString = tokenData[COLUMN_INDEX.expires_at];
      if (!expiresAtString) {
        return { valid: false, error: 'Token has no expiration date' };
      }

      const expiresAt = new Date(expiresAtString);
      const now = new Date();
      
      if (expiresAt < now) {
        return { valid: false, error: 'Token expired' };
      }

      // Token válido - preparar actualizaciones
      const nowMadrid = this.formatMadridDateTime(now);
      
      // Calcular nueva fecha de expiración: ahora + 60 días
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 60);
      const newExpiresAtMadrid = this.formatMadridDateTime(newExpiresAt);

      // Actualizar usando mapeo fijo de columnas
      const updates = {
        last_access_at: nowMadrid,        // L: última vez que se accedió
        expires_at: newExpiresAtMadrid,   // D: renovar por 60 días más
        used: 'TRUE'                      // E: marcar como usado (idempotente)
      };

      await this.updateRowColumns(tokenRowIndex, updates);

      console.log(`✅ Token ${token} validated and renewed until ${newExpiresAtMadrid} (Madrid time)`);

      return {
        valid: true,
        email: tokenData[COLUMN_INDEX.email],
        expiresAt: newExpiresAt,
        renewedUntil: newExpiresAtMadrid,
        lastAccess: nowMadrid
      };

    } catch (error) {
      console.error('❌ Error validating token:', error);
      return { valid: false, error: 'Validation failed: ' + error.message };
    }
  }

  async revokeToken(token) {
    if (!this.sheets) {
      return { success: false, error: 'Google Sheets not available' };
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:O`,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return { success: false, error: 'No data found' };
      }

      // Usar índices fijos (0-based para el array)
      const TOKEN_INDEX = 0; // Columna A
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][TOKEN_INDEX] === token) {
          const rowNumber = i + 1;
          
          // Usar mapeo fijo para actualizar columna M (revoked)
          const updates = {
            revoked: 'TRUE'
          };
          
          await this.updateRowColumns(rowNumber, updates);

          console.log(`✅ Token ${token} revoked successfully`);
          return { success: true };
        }
      }

      return { success: false, error: 'Token not found' };
    } catch (error) {
      console.error('❌ Error revoking token:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TokenValidator();