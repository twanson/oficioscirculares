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
      slug: '../casos/e-wear/',
      title: 'E-WEAR: De basura electrónica a joya premium con historia verificable',
      excerpt: 'Los consumidores pagan hasta un 30% más por productos genuinamente sostenibles. Pero solo si tienen evidencia de que lo son.',
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