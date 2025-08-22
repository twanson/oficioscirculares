const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  quality: 85,                    // Calidad WebP (80-90 es óptimo)
  sourceFormats: ['.jpg', '.jpeg', '.png'],  // Formatos a convertir
  inputFolder: './temp-images',   // Carpeta temporal para subir imágenes
  outputFolder: './public/img',   // Carpeta de destino
  deleteOriginal: true           // Borrar originales después de convertir
};

// Función principal de conversión
async function convertImage(inputPath, outputPath, options = {}) {
  try {
    const { quality = CONFIG.quality, width, height } = options;
    
    let pipeline = sharp(inputPath);
    
    // Redimensionar si se especifica
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center'
      });
    }
    
    // Convertir a WebP
    await pipeline
      .webp({ quality })
      .toFile(outputPath);
    
    console.log(`✅ Convertido: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${inputPath}:`, error.message);
    return false;
  }
}

// Función para procesar una carpeta
async function processFolder(folderPath, outputSubfolder = '') {
  if (!fs.existsSync(folderPath)) {
    console.log(`📁 Carpeta ${folderPath} no existe. Creándola...`);
    fs.mkdirSync(folderPath, { recursive: true });
    return;
  }

  const files = fs.readdirSync(folderPath);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return CONFIG.sourceFormats.includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log(`📂 No hay imágenes para convertir en ${folderPath}`);
    return;
  }

  console.log(`\n🔄 Procesando ${imageFiles.length} imágenes en ${folderPath}:`);

  for (const file of imageFiles) {
    const inputPath = path.join(folderPath, file);
    const nameWithoutExt = path.parse(file).name;
    const outputPath = path.join(CONFIG.outputFolder, outputSubfolder, `${nameWithoutExt}.webp`);
    
    // Crear carpeta de destino si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const success = await convertImage(inputPath, outputPath);
    
    // Borrar original si la conversión fue exitosa
    if (success && CONFIG.deleteOriginal) {
      fs.unlinkSync(inputPath);
      console.log(`🗑️  Original eliminado: ${file}`);
    }
  }
}

// Función para conversión rápida de recursos
async function convertRecurso(imagePath, tipo) {
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Imagen no encontrada: ${imagePath}`);
    return false;
  }

  const validTypes = ['recursos', 'blog', 'casos', 'general'];
  if (!validTypes.includes(tipo)) {
    console.error(`❌ Tipo debe ser uno de: ${validTypes.join(', ')}`);
    return false;
  }

  const fileName = path.parse(imagePath).name;
  const outputPath = path.join(CONFIG.outputFolder, tipo, `${fileName}.webp`);
  
  // Crear carpeta si no existe
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Configuración específica por tipo
  const typeConfig = {
    recursos: { quality: 90, width: 800, height: 600 },  // Covers de recursos
    blog: { quality: 85, width: 1200, height: 630 },     // Imágenes de blog
    casos: { quality: 85, width: 1000, height: 750 },    // Casos de estudio
    general: { quality: 80 }                             // Uso general
  };

  const success = await convertImage(imagePath, outputPath, typeConfig[tipo]);
  
  if (success && CONFIG.deleteOriginal) {
    fs.unlinkSync(imagePath);
  }
  
  return success;
}

// CLI - Uso desde terminal
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Modo automático: procesar carpeta temp-images
    console.log('🚀 Modo automático: procesando temp-images/');
    processFolder('./temp-images');
  } else if (args.length === 2) {
    // Modo manual: convertir imagen específica
    const [imagePath, tipo] = args;
    console.log(`🎯 Convirtiendo: ${imagePath} como tipo "${tipo}"`);
    convertRecurso(imagePath, tipo);
  } else {
    console.log(`
📖 USO DEL SCRIPT:

🔸 Modo automático (procesa toda la carpeta):
   node scripts/convert-images.js

🔸 Modo manual (imagen específica):
   node scripts/convert-images.js ruta/imagen.jpg recursos
   node scripts/convert-images.js ruta/imagen.png blog

🔸 Tipos disponibles: recursos, blog, casos, general

💡 TIP: Pon las imágenes en ./temp-images/ y ejecuta sin parámetros
    `);
  }
}

module.exports = {
  convertImage,
  processFolder,
  convertRecurso,
  CONFIG
};
