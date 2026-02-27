document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('posts');
  const filterInput = document.getElementById('filter-input');
  const tagSelect = document.getElementById('tag-select');

  if (!container) {
    return;
  }

  // Usamos ruta relativa para máxima compatibilidad (Live Server / Express / hosting estático)
  const ASSETS_BASE = '../assets';

  const posts = [
    {
      slug: './5-filtros-residuo-material/',
      title: '¿Tu residuo local puede convertirse en material? Método práctico en 5 filtros',
      excerpt: 'Guía práctica con 5 filtros para evaluar si un residuo local puede ser materia prima. Con casos reales en España, semáforos de decisión y hoja de ruta de 30 días.',
      date: '2026-02-01',
      readingMinutes: 12,
      cover: ASSETS_BASE + '/images/blog/5-filtros-residuo-material/imagen-hero-artesanal.svg',
      tags: ['materiales circulares', 'residuos', 'artesanía', 'economía circular', 'guía práctica']
    },
    {
      slug: './perte-economia-circular/',
      title: 'PERTE Economía Circular para PYMEs Artesanales: Guía de los 5 Pasos',
      excerpt: 'Guía práctica paso a paso para que PYMEs artesanales accedan a las ayudas del PERTE Economía Circular (492M€). Con datos reales de convocatorias resueltas, ejemplos aprobados y checklist.',
      date: '2026-02-08',
      readingMinutes: 15,
      cover: ASSETS_BASE + '/images/blog/perte-economia-circular/imagen-hero-artesanal.jpg',
      tags: ['estrategia', 'financiacion', 'circularidad']
    },
    {
      slug: './logistica-inversa/',
      title: 'Logistica inversa para marcas artesanales: cuando tiene sentido y cuando no',
      excerpt: 'Guia practica para marcas medianas que se plantean recuperar sus envases. Con ejemplos reales de cosmetica natural, alimentacion artesanal y cerveceria craft.',
      date: '2026-01-23',
      readingMinutes: 12,
      cover: ASSETS_BASE + '/images/blog/logistica-inversa/imagen-hero-artesanal.jpg',
      tags: ['estrategia', 'circularidad', 'logistica']
    },
    {
      slug: '../casos/e-wear/',
      title: 'E-WEAR: De residuo electrónico a joya con historia',
      excerpt: 'Cómo Laura transformó su taller de joyería tradicional en un modelo circular que recupera plata de residuos electrónicos. Un caso real de economía circular artesanal.',
      date: '2025-08-08',
      readingMinutes: 8,
      cover: ASSETS_BASE + '/images/cases/e-wear/hero-packaging-movil-concha.webp',
      tags: ['casos', 'estrategia', 'circularidad']
    }
  ];

  function renderPosts(filteredPosts = posts) {
    if (filteredPosts.length === 0) {
      container.innerHTML = '<div class="no-posts">No se encontraron posts que coincidan con los criterios de búsqueda.</div>';
      return;
    }

    let html = '';
    
    filteredPosts.forEach(function(post, index) {
      const date = new Date(post.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      html += '<a href="' + post.slug + '" class="post-card-link" style="text-decoration: none; color: inherit;">';
      html += '<article class="post-card" style="animation-delay: ' + (index * 0.1) + 's;">';
      
      if (post.cover) {
        const fb = ASSETS_BASE + '/images/cases/e-wear/placeholder-16x9.jpg?v=1';
        html += '<img src="' + post.cover + '?v=1" alt="' + post.title + '" class="post-card-image" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src=\'' + fb + '\'" />';
      }
      
      html += '<div class="post-card-content">';
      html += '<h2 class="post-card-title">' + post.title + '</h2>';
      html += '<div class="post-card-meta">' + date + ' · ' + post.readingMinutes + ' min de lectura</div>';
      html += '<p class="post-card-excerpt">' + post.excerpt + '</p>';
      
      if (post.tags && post.tags.length > 0) {
        html += '<div class="post-card-tags">';
        post.tags.forEach(function(tag) {
          html += '<span class="post-tag">' + tag + '</span>';
        });
        html += '</div>';
      }
      
      html += '</div>';
      html += '</article>';
      html += '</a>';
    });

    container.innerHTML = html;
    
    // Apply scroll animations to new cards
    setTimeout(() => {
      document.querySelectorAll('.post-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Trigger animation
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 100);
      });
    }, 10);
  }

  // Initial render
  renderPosts();

  // Filter functionality
  function filterPosts() {
    const searchTerm = filterInput ? filterInput.value.toLowerCase().trim() : '';
    const selectedTag = tagSelect ? tagSelect.value : '';
    
    const filteredPosts = posts.filter(function(post) {
      const matchesSearch = !searchTerm || 
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm);
        
      const matchesTag = !selectedTag || 
        (post.tags && post.tags.includes(selectedTag));
        
      return matchesSearch && matchesTag;
    });
    
    renderPosts(filteredPosts);
  }
  
  // Event listeners
  if (filterInput) {
    filterInput.addEventListener('input', filterPosts);
    filterInput.addEventListener('keyup', function(e) {
      if (e.key === 'Escape') {
        filterInput.value = '';
        filterPosts();
      }
    });
  }
  
  if (tagSelect) {
    tagSelect.addEventListener('change', filterPosts);
  }
});