# 🛠️ Configuración de Mailchimp para Oficios Circulares

## Problema actual
Los emails que se capturan en la web **NO se están guardando** en la audiencia de Mailchimp porque faltan las variables de entorno necesarias.

## ✅ Solución paso a paso

### Paso 1: Obtener credenciales de Mailchimp

1. **Accede a tu cuenta de Mailchimp**: https://admin.mailchimp.com/
2. **Obtén tu API Key**:
   - Ve a **Account > Extras > API Keys**: https://admin.mailchimp.com/account/api/
   - Clic en **"Create A Key"**
   - Copia la API Key generada (algo como: `abc123def456-us2`)

3. **Encuentra tu Audience ID**:
   - Ve a **Audience > All contacts**
   - Clic en **Settings > Audience name and defaults**
   - Busca el **Audience ID** (algo como: `947779abcd`)

4. **Identifica tu Server Prefix**:
   - En tu API Key, el final indica el servidor (ej: `abc123-us2` = servidor `us2`)
   - O revisa la URL de tu cuenta: `https://us2.admin.mailchimp.com/` = servidor `us2`

### Paso 2: Configurar variables en Railway

1. **Accede a tu proyecto en Railway**: https://railway.app/
2. **Ve a tu proyecto > Variables tab**
3. **Añade estas 3 variables**:

```
MAILCHIMP_API_KEY=tu_api_key_aquí
MAILCHIMP_AUDIENCE_ID=tu_audience_id_aquí  
MAILCHIMP_SERVER_PREFIX=us2
```

### Paso 3: Verificar configuración

1. **Redeploy la aplicación** en Railway
2. **Revisa los logs** para confirmar que las variables se cargaron:
   ```
   🔍 Estado de variables de entorno:
      - MAILCHIMP_API_KEY: ✅ Configurada
      - MAILCHIMP_AUDIENCE_ID: 947779abcd
      - MAILCHIMP_SERVER_PREFIX: us2
   ```

3. **Prueba el formulario** descargando la guía con un email de prueba

## 🔍 Cómo encontrar tu Audience ID específica para "Oficios Circulares"

1. Ve a **Audience > All contacts**
2. Si tienes múltiples audiencias, selecciona la de **"Oficios Circulares"**
3. Ve a **Settings > Audience name and defaults**
4. Copia el **Audience ID**

## ⚠️ Importante

- **Nunca subas** las API Keys al código (están en `.gitignore`)
- **Usa variables de entorno** solo en Railway
- **Prueba siempre** con un email personal antes de anunciarlo

## 🆘 Si algo no funciona

1. **Revisa los logs** en Railway para ver errores específicos
2. **Verifica** que la API Key tenga permisos de escritura
3. **Confirma** que el Audience ID sea correcto
4. **Contacta** si necesitas ayuda técnica

## 📊 Después de configurar

Los emails se guardarán automáticamente en Mailchimp con:
- **Tag**: "Diagnóstico Circular Express"
- **Nombre**: Campo FNAME
- **Email**: Campo principal
- **Estado**: Subscribed (automático) 