// Toggle "Sin perder tu esencia" reveal
function toggleEssence() {
    const reveal = document.getElementById('essenceReveal');
    const trigger = document.querySelector('.essence-trigger');
    reveal.classList.toggle('show');
    trigger.classList.toggle('open');
    trigger.setAttribute('aria-expanded', reveal.classList.contains('show'));
}

// FAQ toggle
function toggleFaq(el) {
    const item = el.parentElement;
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
}

// Scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});
