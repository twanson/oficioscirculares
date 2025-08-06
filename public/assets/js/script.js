// ===== SMOOTH SCROLLING & NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Ensure content is visible by default
    document.documentElement.classList.add('js-enabled');
    
    // Show all fade-in elements immediately as fallback
    const fadeElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    fadeElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
    
    // Símbolo de circularidad - animación por CSS + respaldo JavaScript
    const simbolo = document.querySelector('.circularity-symbol');
    if (simbolo) {
        console.log('Símbolo encontrado, iniciando animación');
        
        // Forzar animación con JavaScript como respaldo
        let scale = 1;
        let opacity = 1;
        let increasing = false;
        
        function animateSymbol() {
            if (increasing) {
                scale += 0.003;
                opacity += 0.007;
                if (scale >= 1) {
                    increasing = false;
                }
            } else {
                scale -= 0.003;
                opacity -= 0.007;
                if (scale <= 0.85) {
                    increasing = true;
                }
            }
            
            // Mantener opacidad entre 0.3 y 1
            opacity = Math.max(0.3, Math.min(1, opacity));
            
            simbolo.style.transform = `scale(${scale})`;
            simbolo.style.opacity = opacity;
            
            requestAnimationFrame(animateSymbol);
        }
        
        // Iniciar animación JavaScript solo como respaldo
        setTimeout(() => {
            console.log('Iniciando animación JavaScript como respaldo');
            animateSymbol();
        }, 1000);
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
});

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
        navbar.style.background = 'rgba(250, 249, 247, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(31, 75, 63, 0.1)';
    } else {
        navbar.style.background = 'rgba(250, 249, 247, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add animation classes to elements
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach((section, index) => {
        const elements = section.querySelectorAll('h2, h3, p, .feature-item, .profile-card, .service-card, .testimonial-card, .benefit-item');
        
        elements.forEach((el, elIndex) => {
            el.classList.add('fade-in');
            el.style.transitionDelay = `${elIndex * 0.1}s`;
        });
    });
});

// ===== PARALLAX EFFECT =====
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-image, .cta-image');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===== BUTTON HOVER EFFECTS =====
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// ===== CARD HOVER EFFECTS =====
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.feature-item, .profile-card, .service-card, .testimonial-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// ===== TYPING ANIMATION FOR HERO TITLE =====
document.addEventListener('DOMContentLoaded', function() {
    const titleLines = document.querySelectorAll('.title-line');
    
    titleLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// ===== SCROLL PROGRESS INDICATOR =====
window.addEventListener('scroll', function() {
    const scrollProgress = document.createElement('div');
    scrollProgress.style.position = 'fixed';
    scrollProgress.style.top = '0';
    scrollProgress.style.left = '0';
    scrollProgress.style.width = '100%';
    scrollProgress.style.height = '3px';
    scrollProgress.style.background = 'linear-gradient(90deg, #1F4B3F, #D17B49)';
    scrollProgress.style.zIndex = '9999';
    scrollProgress.style.transformOrigin = 'left';
    scrollProgress.id = 'scroll-progress';
    
    if (!document.getElementById('scroll-progress')) {
        document.body.appendChild(scrollProgress);
    }
    
    const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('scroll-progress').style.transform = `scaleX(${scrolled / 100})`;
});

// ===== FORM VALIDATION (if forms are added later) =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== LAZY LOADING FOR IMAGES =====
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// ===== SMOOTH REVEAL ANIMATIONS =====
document.addEventListener('DOMContentLoaded', function() {
    const revealElements = document.querySelectorAll('.about-content, .profiles-grid, .services-grid, .testimonials-grid');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        revealObserver.observe(el);
    });
});

// ===== COUNTER ANIMATION (for future stats) =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// ===== MOBILE OPTIMIZATIONS =====
document.addEventListener('DOMContentLoaded', function() {
    // Prevent zoom on input focus for iOS
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth < 768) {
                document.querySelector('meta[name=viewport]').setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
            }
        });
        
        input.addEventListener('blur', function() {
            if (window.innerWidth < 768) {
                document.querySelector('meta[name=viewport]').setAttribute('content', 'width=device-width, initial-scale=1');
            }
        });
    });
    
    // Touch-friendly hover effects for mobile
    if ('ontouchstart' in window) {
        const hoverElements = document.querySelectorAll('.btn, .feature-item, .profile-card, .service-card');
        
        hoverElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
        });
    }
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll-based animations here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// ===== ACCESSIBILITY IMPROVEMENTS =====
document.addEventListener('DOMContentLoaded', function() {
    // Add focus indicators for keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #D17B49';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
});

// ===== EASTER EGG - KONAMI CODE =====
document.addEventListener('DOMContentLoaded', function() {
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let userInput = [];
    
    document.addEventListener('keydown', function(e) {
        userInput.push(e.keyCode);
        
        if (userInput.length > konamiCode.length) {
            userInput.shift();
        }
        
        if (userInput.join(',') === konamiCode.join(',')) {
            // Easter egg: Add some fun animation
            document.body.style.animation = 'rainbow 2s infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
        }
    });
});

// Add rainbow animation for easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Hero Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    const totalSlides = slides.length;
    let currentSlide = 0;

    function showSlide(index) {
        // Remove active class from all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to current slide
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Auto advance slides every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);

    // Slider continues even on hover - no pause functionality
    // const heroSection = document.querySelector('.hero');
    // if (heroSection) {
    //     heroSection.addEventListener('mouseenter', () => {
    //         clearInterval(slideInterval);
    //     });

    //     heroSection.addEventListener('mouseleave', () => {
    //         slideInterval = setInterval(nextSlide, 5000);
    //     });
    // }
});

