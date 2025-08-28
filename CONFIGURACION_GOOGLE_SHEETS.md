# Configuración Google Sheets para Railway

## Variables de Entorno Requeridas

Para que la integración con Google Sheets funcione en Railway, necesitas configurar las siguientes variables de entorno:

### 1. GOOGLE_SERVICE_ACCOUNT_JSON
- **Descripción**: JSON completo del service account de Google
- **Formato**: String JSON (no archivo)
- **Ejemplo**:
```json
{
  "type": "service_account",
  "project_id": "tu-proyecto",
  "private_key_id": "key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40tu-proyecto.iam.gserviceaccount.com"
}
```

### 2. SPREADSHEET_ID
- **Descripción**: ID del Google Spreadsheet
- **Formato**: String
- **Ejemplo**: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 3. SHEET_NAME
- **Descripción**: Nombre de la hoja dentro del spreadsheet
- **Formato**: String
- **Ejemplo**: `Tokens` o `Hoja1`

## Cómo Configurar en Railway

1. Ve a tu proyecto en Railway
2. Ve a la pestaña "Variables"
3. Añade las tres variables de entorno:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: Pega el JSON completo del service account
   - `SPREADSHEET_ID`: ID de tu spreadsheet
   - `SHEET_NAME`: Nombre de la hoja

## Cómo Obtener el Service Account JSON

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a "IAM & Admin" > "Service Accounts"
4. Crea un nuevo service account o usa uno existente
5. Genera una nueva clave JSON
6. Descarga el archivo JSON
7. Copia todo el contenido del archivo JSON
8. Pégalo como valor de la variable `GOOGLE_SERVICE_ACCOUNT_JSON`

## Permisos del Service Account

El service account necesita permisos para:
- Leer el Google Spreadsheet
- Escribir en el Google Spreadsheet

Para dar permisos:
1. Abre tu Google Spreadsheet
2. Haz clic en "Compartir"
3. Añade el email del service account (client_email del JSON)
4. Dale permisos de "Editor"

## Testing

Una vez configurado, puedes probar la configuración visitando:
- `https://tu-dominio.com/test-google-sheets`

Este endpoint te dirá si la configuración es correcta y si puede conectarse a Google Sheets.

## Diferencias con Desarrollo Local

- **Desarrollo local**: Usa archivo físico (`GOOGLE_SERVICE_ACCOUNT_PATH`)
- **Railway**: Usa variable de entorno (`GOOGLE_SERVICE_ACCOUNT_JSON`)

El código detecta automáticamente qué método usar basándose en las variables de entorno disponibles.
