// Menú de la cabecera común (views/partials/header.ejs): desplegable «Servicios» y menú móvil.
// Vive aparte de script.js para que funcione en TODAS las vistas que usan la cabecera,
// también en las que no cargan script.js (/club, /mapa, /directorio, gracias…).
// script.js no vuelve a enlazarlo si este archivo ya lo ha hecho (window.__ocNav).
(function () {
    if (window.__ocNav) return;
    window.__ocNav = true;

    function setupMenuMovil() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        if (!hamburger || !navMenu) return;
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('tabindex', hamburger.getAttribute('tabindex') || '0');
        hamburger.setAttribute('aria-controls', 'nav-menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir el menú');
        function abrir(estado) {
            const abierto = estado !== undefined ? estado : !navMenu.classList.contains('active');
            navMenu.classList.toggle('active', abierto);
            hamburger.classList.toggle('active', abierto);
            hamburger.setAttribute('aria-expanded', String(abierto));
            hamburger.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú');
        }
        hamburger.addEventListener('click', function () { abrir(); });
        hamburger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) { abrir(false); hamburger.focus(); }
        });
        navMenu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { abrir(false); });
        });
    }

// ===== SERVICIOS DROPDOWN FUNCTIONALITY =====
    function setupServiciosDropdown() {
        const dropdownBtn = document.getElementById('servicios-dropdown-btn');
        const dropdownMenu = document.getElementById('servicios-dropdown-menu');
        
        if (!dropdownBtn || !dropdownMenu) return; // Exit if dropdown doesn't exist on this page
        
        const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
        let currentFocusedIndex = -1;
        
        // Setup UTM links for dropdown items
        dropdownItems.forEach(function(item) {
            const service = item.getAttribute('data-service');
            const originalHref = item.getAttribute('href');
            
            // Parámetros internos oc_* (no utm_*, que romperían la atribución de GA4)
            const utm = {
                oc_source: 'site',
                oc_medium: 'internal',
                oc_campaign: `oc-${service}`,
                oc_content: 'header-dropdown'
            };
            
            const url = new URL(originalHref, window.location.origin);
            Object.entries(utm).forEach(([key, value]) => {
                url.searchParams.set(key, value);
            });
            item.href = url.toString();
            
            // Add GA4 tracking
            item.addEventListener('click', function(e) {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'click_cta',
                    cta_offer: service,
                    cta_location: 'header-dropdown'
                });
            });
        });
        
        // Toggle dropdown
        function toggleDropdown(open) {
            const isOpen = open !== undefined ? open : dropdownBtn.getAttribute('aria-expanded') === 'false';
            dropdownBtn.setAttribute('aria-expanded', isOpen);
            dropdownMenu.classList.toggle('show', isOpen);
            currentFocusedIndex = -1;
            
            if (isOpen) {
                // Focus first item when opening with keyboard
                setTimeout(() => {
                    if (document.activeElement === dropdownBtn) {
                        focusItem(0);
                    }
                }, 10);
            }
        }
        
        // Focus management
        function focusItem(index) {
            if (index >= 0 && index < dropdownItems.length) {
                currentFocusedIndex = index;
                dropdownItems[index].focus();
            }
        }
        
        // Button click handler
        dropdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDropdown();
        });
        
        // Button keyboard handler
        dropdownBtn.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    toggleDropdown();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    toggleDropdown(true);
                    break;
                case 'Escape':
                    toggleDropdown(false);
                    break;
            }
        });
        
        // Menu items keyboard navigation
        dropdownItems.forEach(function(item, index) {
            item.addEventListener('keydown', function(e) {
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        focusItem((index + 1) % dropdownItems.length);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        focusItem(index === 0 ? dropdownItems.length - 1 : index - 1);
                        break;
                    case 'Home':
                        e.preventDefault();
                        focusItem(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        focusItem(dropdownItems.length - 1);
                        break;
                    case 'Escape':
                        e.preventDefault();
                        toggleDropdown(false);
                        dropdownBtn.focus();
                        break;
                    case 'Tab':
                        // Allow default tab behavior
                        toggleDropdown(false);
                        break;
                }
            });
            
            // Close on item click
            item.addEventListener('click', function() {
                toggleDropdown(false);
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                toggleDropdown(false);
            }
        });
        
        // Close on focus outside
        document.addEventListener('focusin', function(e) {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                toggleDropdown(false);
            }
        });
    }

    function iniciar() { setupMenuMovil(); setupServiciosDropdown(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();
