const fs = require('fs');
const path = require('path');

const GTM_HEAD = `    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-W7CH52J6');</script>
    <!-- End Google Tag Manager -->`;

const GTM_BODY = `    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W7CH52J6"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`;

// Archivos HTML que necesitan GTM (excluyendo index.html que ya está hecho)
const htmlFiles = [
    'public/sobre-nosotros/index.html',
    'public/plantillas/index.html',
    'public/faqs/index.html',
    'public/casos/e-wear/index.html',
    'public/blog/index.html',
    'public/gracias/index.html',
    'public/privacidad/index.html'
];

function addGTMToFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Verificar si ya tiene GTM
        if (content.includes('GTM-W7CH52J6')) {
            console.log(`✅ ${filePath} ya tiene GTM`);
            return;
        }
        
        // Añadir GTM en el head (antes del </head>)
        content = content.replace('</head>', `
${GTM_HEAD}
</head>`);
        
        // Añadir GTM noscript después del <body>
        content = content.replace('<body>', `<body>
${GTM_BODY}
`);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ GTM añadido a ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error procesando ${filePath}:`, error.message);
    }
}

console.log('🚀 Añadiendo Google Tag Manager a archivos HTML...\n');

htmlFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        addGTMToFile(fullPath);
    } else {
        console.log(`⚠️ Archivo no encontrado: ${file}`);
    }
});

console.log('\n✅ Proceso completado');
