# 📸 Sistema de Conversión Automática a WebP

## 🚀 Cómo usar

### **Método 1: Carpeta automática (Recomendado)**
1. Pon tus imágenes JPG/PNG en `temp-images/`
2. Ejecuta: `npm run convert-images`
3. ¡Las imágenes WebP aparecen en `public/img/general/`!

### **Método 2: Conversión específica**
```bash
# Para recursos (covers)
npm run convert-recurso imagen.jpg recursos

# Para blog  
npm run convert-recurso imagen.png blog

# Para casos de estudio
npm run convert-recurso imagen.jpg casos

# Para uso general
npm run convert-recurso imagen.png general
```

## 📁 Estructura de carpetas

```
temp-images/          ← Pon aquí tus imágenes originales
public/img/
├── recursos/         ← Covers de recursos (800x600, quality 90)
├── blog/            ← Imágenes de blog (1200x630, quality 85)  
├── casos/           ← Casos de estudio (1000x750, quality 85)
├── general/         ← Uso general (quality 80)
└── qrs/            ← Códigos QR
```

## ⚙️ Configuración automática

- **Recursos:** 800x600px, calidad 90% (máxima calidad)
- **Blog:** 1200x630px, calidad 85% (optimizado redes sociales)
- **Casos:** 1000x750px, calidad 85% (portfolio)
- **General:** Tamaño original, calidad 80% (uso común)

## 💡 Tips

- Las imágenes originales se borran automáticamente después de la conversión
- Los nombres se mantienen, solo cambia la extensión a `.webp`
- Si la carpeta de destino no existe, se crea automáticamente
- WebP reduce el tamaño 30-50% manteniendo la calidad

## 🛠️ Archivos del sistema

- `scripts/convert-images.js` - Script principal
- `temp-images/` - Carpeta temporal para originales
- `package.json` - Scripts npm configurados
