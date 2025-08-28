# Sistema de Validación de Tokens para Directorio de Proveedores

## Resumen
Sistema implementado que valida tokens de acceso almacenados en Google Sheets y permite acceso protegido al directorio de proveedores con renovación automática de 60 días.

## Configuración requerida para producción

### 1. Google Service Account
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear/seleccionar proyecto
3. Activar Google Sheets API
4. Crear Service Account:
   - IAM & Admin > Service Accounts > Create Service Account
   - Asignar rol: Editor
   - Generar clave JSON y guardar como `google-service-account.json`
5. Compartir Google Sheet con el email del service account

### 2. Variables de entorno
Actualizar `.env` en producción:
```env
# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_PATH=./google-service-account.json
SPREADSHEET_ID=1fpthuPw9CCaidrOxDIRTx8EkQEwpLx0Hx-QV6WBqpZg
SHEET_NAME=Members_Tokens

# Server Configuration
PORT=3000
NODE_ENV=production

# Existing Mailchimp variables...
```

### 3. Estructura Google Sheet "Members_Tokens"
La hoja debe tener estas columnas (fila 1):
- **A**: token
- **B**: email  
- **C**: created_at
- **D**: expires_at
- **E**: used
- **F**: source
- **G**: utm_source
- **H**: utm_medium
- **I**: utm_campaign
- **J**: utm_content
- **K**: resource_id
- **L**: last_access_at
- **M**: revoked

## Endpoints implementados

### Rutas principales
- `GET /dir` - Directorio protegido
  - Sin token: muestra gate de registro
  - Con token válido: muestra directorio + renueva acceso por 60 días
  - Con token inválido: redirige a `/renovar-acceso`

- `GET /renovar-acceso` - Página de renovación cuando token es inválido

### API
- `GET /api/validate-token?token=ABC123` - Validación AJAX (opcional)

## Funcionalidades de seguridad

### Validación de tokens
- ✅ Verifica existencia en Google Sheets
- ✅ Verifica que no esté revocado (`revoked != TRUE`)  
- ✅ Verifica que no haya expirado (`expires_at > now`)
- ✅ Renovación automática por 60 días en cada acceso válido
- ✅ Actualiza `last_access_at` en cada validación exitosa

### Manejo de errores
- ✅ Logs detallados de validaciones
- ✅ Manejo graceful cuando Google Sheets no está disponible
- ✅ Páginas de error user-friendly
- ✅ Rate limiting implícito por requests a Google Sheets

## Testing

### Desarrollo
```bash
NODE_ENV=development npm start
```
- Funciona sin Google Sheets configurado
- Todos los tokens fallan con mensaje "Token not found"
- Permite testing de UX sin configuración compleja

### URLs de prueba
- http://localhost:3001/dir - Gate normal
- http://localhost:3001/dir?token=invalid - Redirige a renovar-acceso
- http://localhost:3001/renovar-acceso - Página de renovación
- http://localhost:3001/api/validate-token?token=test - API endpoint

## Monitoreo

### Logs importantes
- `🔍 Validating token: ABC123` - Intento de validación
- `✅ Token ABC123 validated and renewed until YYYY-MM-DD` - Validación exitosa
- `❌ Token invalid: [reason]` - Validación fallida

### Analytics events
- `directorio_access` - Acceso exitoso al directorio
- `directorio_access_denied` - Acceso denegado

## Integración con Make.com

El sistema espera que Make.com:
1. Genere tokens únicos
2. Los almacene en Google Sheets con fecha de expiración
3. Envíe magic links del formato: `https://tu-dominio.com/dir?token=ABC123`

## Archivos creados/modificados

### Nuevos archivos:
- `lib/tokenValidator.js` - Lógica de validación con Google Sheets
- `views/directorio.ejs` - Página protegida del directorio
- `views/renovar-acceso.ejs` - Página de renovación de acceso
- `google-service-account.json.example` - Plantilla de service account
- `CONFIGURACION_DIRECTORIO.md` - Esta documentación

### Archivos modificados:
- `server.js` - Nuevos endpoints y lógica de validación
- `package.json` - Dependencias: googleapis, dotenv
- `.gitignore` - Excluir archivos sensibles
- `.env` - Variables de configuración

## Próximos pasos

1. **Configurar Google Service Account en producción**
2. **Probar con tokens reales desde Make.com**
3. **Añadir contenido real al directorio (views/directorio.ejs)**
4. **Configurar monitoreo de errores**
5. **Optimizar performance para alta concurrencia**