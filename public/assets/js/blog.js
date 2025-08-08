document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('posts');
  const filterInput = document.getElementById('filter-input');
  const tagSelect = document.getElementById('tag-select');

  let allPosts = [];

  async function load(tag = '') {
    // Datos locales mínimos por ahora (sin fetch)
    allPosts = [
      {
        slug: '/blog/casos/e-wear/',
        title: 'E‑WEAR: cómo convertimos e‑waste en lujo circular',
        excerpt: 'Caso real de diseño, trazabilidad y relato sin greenwashing.',
        date: '2025-08-08',
        readingMinutes: 8,
        cover: '/assets/images/cases/e-wear/hero-packaging-movil-concha.jpg',
        tags: ['casos','estrategia','circularidad']
      }
    ];
    render();
  }

  function render() {
    const query = (filterInput.value || '').toLowerCase();
    const selectedTag = (tagSelect.value || '').toLowerCase();
    const list = allPosts.filter(p => {
      const matchesQuery = p.title.toLowerCase().includes(query);
      const matchesTag = !selectedTag || (p.tags || []).includes(selectedTag);
      return matchesQuery && matchesTag;
    });
    if (!list.length) {
      container.innerHTML = '<p>No hay publicaciones.</p>';
      return;
    }
    container.innerHTML = list.map(p => `
      <a href="${p.slug.startsWith('/blog/') ? p.slug : 'post.html?slug='+encodeURIComponent(p.slug)}" class="service-card-link">
        <div class="service-card">
          ${p.cover ? `<img src="${p.cover}" data-fallback="/assets/images/cases/e-wear/placeholder-16x9.jpg" alt="${p.title}" style="width:100%;border-radius:12px;margin-bottom:12px;" onerror="this.onerror=null;this.src=this.dataset.fallback;"/>` : ''}
          <h3>${p.title}</h3>
          <p class="profile-example">${p.date ? new Date(p.date).toLocaleDateString('es-ES') + ' · ' : ''}${p.readingMinutes} min</p>
          <p>${p.excerpt || ''}</p>
          ${p.tags?.length ? `<div style=\"margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;\">${p.tags.map(t=>`<span style='background:#E8D5B7;color:#1F4B3F;padding:4px 8px;border-radius:8px;font-size:.85rem;'>#${t.charAt(0).toUpperCase()+t.slice(1)}</span>`).join('')}</div>` : ''}
        </div>
      </a>
    `).join('');
  }

  filterInput.addEventListener('input', render);
  tagSelect.addEventListener('change', () => load(tagSelect.value));

  try {
    await load('');
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p>No se pudieron cargar las publicaciones.</p>';
  }
});

