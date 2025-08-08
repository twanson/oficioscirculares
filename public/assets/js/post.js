document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  if (!slug) {
    location.href = '/blog/index.html';
    return;
  }
  try {
    const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('No encontrado');
    const data = await res.json();
    document.getElementById('post-title').textContent = data.meta.title || slug;
    const meta = [];
    if (data.meta.date) meta.push(new Date(data.meta.date).toLocaleDateString('es-ES'));
    if (data.meta.author) meta.push(data.meta.author);
    document.getElementById('post-meta').textContent = meta.join(' · ');
    if (data.meta.cover) {
      const img = document.getElementById('post-cover');
      img.src = data.meta.cover;
      img.style.display = 'block';
    }
    document.getElementById('post-content').innerHTML = data.html;
  } catch (e) {
    document.body.innerHTML = '<section class="container" style="padding:80px 0"><p>No se pudo cargar el post.</p></section>';
  }
});

