/**
 * Banner de Cookies - Oficios Circulares
 * Cumplimiento RGPD/LSSI para cookies no esenciales
 */

(function() {
    'use strict';
    
    // Configuración
    const COOKIE_NAME = 'oc_cookies_consent';
    const COOKIE_DURATION = 365; // días
    
    // Elementos del DOM
    let cookieBanner = null;
    let acceptBtn = null;
    let rejectBtn = null;
    
    // Estado de consentimiento
    let consentGiven = false;
    
    /**
     * Obtener valor de cookie
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }
    
    /**
     * Establecer cookie
     */
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
    
    /**
     * Verificar si ya existe consentimiento
     */
    function hasConsent() {
        const consent = getCookie(COOKIE_NAME);
        return consent === 'accepted' || consent === 'essential';
    }
    
    /**
     * Cargar scripts de tracking (GTM, etc.)
     */
    function loadTrackingScripts() {
        // Solo cargar si el usuario aceptó cookies
        if (getCookie(COOKIE_NAME) === 'accepted') {
            // GTM ya está cargado, pero podemos activar eventos
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            }
            
            // Marcar que el tracking está activo
            window.cookieTrackingEnabled = true;
            
            console.log('📊 Tracking activado: cookies aceptadas');
        } else {
            // Solo cookies esenciales
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
            
            window.cookieTrackingEnabled = false;
            console.log('🍪 Solo cookies esenciales');
        }
    }
    
    /**
     * Ocultar banner con animación
     */
    function hideBanner() {
        if (cookieBanner) {
            cookieBanner.style.animation = 'slideDownCookies 0.3s ease-in forwards';
            setTimeout(() => {
                cookieBanner.style.display = 'none';
            }, 300);
        }
    }
    
    /**
     * Aceptar cookies
     */
    function acceptCookies() {
        setCookie(COOKIE_NAME, 'accepted', COOKIE_DURATION);
        consentGiven = true;
        loadTrackingScripts();
        hideBanner();
        
        // Evento personalizado para tracking
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'cookie_consent',
                'cookie_consent_type': 'accepted'
            });
        }
    }
    
    /**
     * Rechazar cookies no esenciales
     */
    function rejectCookies() {
        setCookie(COOKIE_NAME, 'essential', COOKIE_DURATION);
        consentGiven = false;
        loadTrackingScripts();
        hideBanner();
        
        // Evento personalizado para tracking
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'cookie_consent',
                'cookie_consent_type': 'essential_only'
            });
        }
    }
    
    /**
     * Mostrar banner
     */
    function showBanner() {
        if (cookieBanner) {
            cookieBanner.style.display = 'block';
            // Forzar reflow para que la animación funcione
            cookieBanner.offsetHeight;
        }
    }
    
    /**
     * Inicializar banner de cookies
     */
    function initCookieBanner() {
        // Buscar elementos del DOM
        cookieBanner = document.getElementById('cookie-banner');
        acceptBtn = document.getElementById('cookie-accept');
        rejectBtn = document.getElementById('cookie-reject');
        
        if (!cookieBanner || !acceptBtn || !rejectBtn) {
            console.warn('⚠️ Elementos del banner de cookies no encontrados');
            return;
        }
        
        // Verificar si ya hay consentimiento
        if (hasConsent()) {
            loadTrackingScripts();
            return;
        }
        
        // Mostrar banner después de un pequeño delay
        setTimeout(() => {
            showBanner();
        }, 1000);
        
        // Event listeners
        acceptBtn.addEventListener('click', acceptCookies);
        rejectBtn.addEventListener('click', rejectCookies);
        
        // Cerrar banner con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cookieBanner.style.display !== 'none') {
                rejectCookies();
            }
        });
    }
    
    /**
     * Añadir animación de salida al CSS
     */
    function addExitAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDownCookies {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addExitAnimation();
            initCookieBanner();
        });
    } else {
        addExitAnimation();
        initCookieBanner();
    }
    
    // Exponer funciones globales para debugging
    window.cookieBanner = {
        accept: acceptCookies,
        reject: rejectCookies,
        hasConsent: hasConsent,
        show: showBanner,
        hide: hideBanner
    };
    
})();
