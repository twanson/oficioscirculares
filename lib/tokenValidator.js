const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

class TokenValidator {
  constructor() {
    this.spreadsheetId = process.env.SPREADSHEET_ID;
    this.sheetName = process.env.SHEET_NAME;
    this.sheets = null;
    this.init();
  }

  async init() {
    try {
      const serviceAccountPath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
      const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets API initialized successfully');
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
      // Obtener todos los datos de la hoja
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:M`,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return { valid: false, error: 'No data found' };
      }

      // Encontrar el token en la hoja
      const headers = rows[0];
      const tokenIndex = headers.findIndex(h => h.toLowerCase() === 'token');
      const emailIndex = headers.findIndex(h => h.toLowerCase() === 'email');
      const expiresIndex = headers.findIndex(h => h.toLowerCase() === 'expires_at');
      const revokedIndex = headers.findIndex(h => h.toLowerCase() === 'revoked');
      const lastAccessIndex = headers.findIndex(h => h.toLowerCase() === 'last_access_at');

      let tokenRowIndex = -1;
      let tokenData = null;

      for (let i = 1; i < rows.length; i++) {
        if (rows[i][tokenIndex] === token) {
          tokenRowIndex = i + 1; // +1 porque Google Sheets usa índice basado en 1
          tokenData = rows[i];
          break;
        }
      }

      if (!tokenData) {
        return { valid: false, error: 'Token not found' };
      }

      // Verificar si está revocado
      const isRevoked = tokenData[revokedIndex] === 'TRUE' || tokenData[revokedIndex] === true;
      if (isRevoked) {
        return { valid: false, error: 'Token revoked' };
      }

      // Verificar si ha expirado
      const expiresAt = new Date(tokenData[expiresIndex]);
      const now = new Date();
      
      if (expiresAt < now) {
        return { valid: false, error: 'Token expired' };
      }

      // Token válido - renovar por 60 días más y actualizar last_access_at
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 60);

      const updateValues = [
        [
          newExpiresAt.toISOString(),  // expires_at
          now.toISOString()            // last_access_at
        ]
      ];

      // Actualizar la fila en Google Sheets
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!D${tokenRowIndex}:L${tokenRowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: updateValues
        }
      });

      console.log(`✅ Token ${token} validated and renewed until ${newExpiresAt.toISOString()}`);

      return {
        valid: true,
        email: tokenData[emailIndex],
        expiresAt: newExpiresAt,
        renewedUntil: newExpiresAt.toISOString()
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
        range: `${this.sheetName}!A:M`,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return { success: false, error: 'No data found' };
      }

      const headers = rows[0];
      const tokenIndex = headers.findIndex(h => h.toLowerCase() === 'token');
      const revokedIndex = headers.findIndex(h => h.toLowerCase() === 'revoked');

      for (let i = 1; i < rows.length; i++) {
        if (rows[i][tokenIndex] === token) {
          const rowNumber = i + 1;
          
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetName}!${String.fromCharCode(65 + revokedIndex)}${rowNumber}`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [['TRUE']]
            }
          });

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