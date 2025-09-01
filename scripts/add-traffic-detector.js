const fs = require('fs');
const path = require('path');

const TRAFFIC_DETECTOR_SCRIPT = `    <!-- Traffic Source Detector -->
    <script src="assets/js/traffic-source-detector.js" async></script>`;

const TRAFFIC_DETECTOR_SCRIPT_SUBDIR = `    <!-- Traffic Source Detector -->
    <script src="../assets/js/traffic-source-detector.js" async></script>`;

const TRAFFIC_DETECTOR_SCRIPT_SUBDIR2 = `    <!-- Traffic Source Detector -->
    <script src="../../assets/js/traffic-source-detector.js" async></script>`;

// Archivos HTML que necesitan el detector de tráfico
const htmlFiles = [
    { file: 'public/index.html', script: TRAFFIC_DETECTOR_SCRIPT },
    { file: 'public/sobre-nosotros/index.html', script: TRAFFIC_DETECTOR_SCRIPT_SUBDIR },
    { file: 'public/plantillas/index.html', script: TRAFFIC_DETECTOR_SCRIPT_SUBDIR },
    { file: 'public/faqs/index.html', script: TRAFFIC_DETECTOR_SCRIPT_SUBDIR },
    { file: 'public/casos/e-wear/index.html', script: TRAFFIC_DETECTOR_SCRIPT_SUBDIR2 },
    { file: 'public/blog/index.html', script: TRAFFIC_DETECTOR_SCRIPT_SUBDIR },
    { file: 'public/gracias/index.html', script: TRAFFIC_DETECTOR_SCRIPT_SUBDIR },
    { file: 'public/privacidad/index.html', script: TRAFFIC_DETECTOR_SCRIPT_SUBDIR }
];

function addTrafficDetectorToFile(filePath, script) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Verificar si ya tiene el traffic detector
        if (content.includes('traffic-source-detector.js')) {
            console.log(`✅ ${filePath} ya tiene Traffic Source Detector`);
            return;
        }
        
        // Añadir antes del cierre del head
        content = content.replace('</head>', `
${script}
</head>`);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Traffic Source Detector añadido a ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error procesando ${filePath}:`, error.message);
    }
}

console.log('🚀 Añadiendo Traffic Source Detector a archivos HTML...\n');

htmlFiles.forEach(({ file, script }) => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        addTrafficDetectorToFile(fullPath, script);
    } else {
        console.log(`⚠️ Archivo no encontrado: ${file}`);
    }
});

console.log('\n✅ Proceso completado');
