/**
 * Mejoras adicionales para los popups de ventas y cierres
 * Incluye animaciones suaves, efectos de hover mejorados y mejor UX
 */

document.addEventListener('DOMContentLoaded', function() {
    // Interceptar la función de cierre de popups para añadir animaciones
    enhancePopupAnimations();
    
    // Mejorar las interacciones de hover
    enhanceHoverEffects();
    
    // Añadir efectos de carga
    addLoadingEffects();
});

/**
 * Mejora las animaciones de apertura y cierre de popups
 */
function enhancePopupAnimations() {
    // Override de la función original de mostrar popup de ventas
    const originalMostrarVentas = window.mostrarPopupVentasAdmin;
    if (originalMostrarVentas) {
        window.mostrarPopupVentasAdmin = function(ventas) {
            originalMostrarVentas.call(this, ventas);
            const popup = document.getElementById('popupVentasAdmin');
            if (popup) {
                popup.classList.add('show');
                // Añadir efecto de backdrop-filter progresivo
                popup.style.backdropFilter = 'blur(0px)';
                setTimeout(() => {
                    popup.style.backdropFilter = 'blur(4px)';
                }, 50);
            }
        };
    }

    // Override de la función original de mostrar popup de cierre
    const originalMostrarCierre = window.mostrarPopupCierreAdmin;
    if (originalMostrarCierre) {
        window.mostrarPopupCierreAdmin = function(cierre) {
            originalMostrarCierre.call(this, cierre);
            const popup = document.getElementById('popupCierreAdmin');
            if (popup) {
                popup.classList.add('show');
                // Añadir efecto de backdrop-filter progresivo
                popup.style.backdropFilter = 'blur(0px)';
                setTimeout(() => {
                    popup.style.backdropFilter = 'blur(4px)';
                }, 50);
            }
        };
    }
}

/**
 * Mejora los efectos de hover dinámicamente
 */
function enhanceHoverEffects() {
    // Observador para detectar cuando se añaden nuevos popups al DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.id === 'popupVentasAdmin' || node.id === 'popupCierreAdmin') {
                        enhancePopupElements(node);
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Mejora los elementos específicos del popup
 */
function enhancePopupElements(popup) {
    // Mejorar el botón de cerrar
    const closeBtn = popup.querySelector('button[onclick*="style.display=\'none\'"]');
    if (closeBtn) {
        // Añadir animación de cierre suave
        const originalOnclick = closeBtn.onclick;
        closeBtn.onclick = function(e) {
            e.preventDefault();
            popup.classList.add('hiding');
            setTimeout(() => {
                if (originalOnclick) {
                    originalOnclick.call(this);
                }
                popup.classList.remove('hiding', 'show');
            }, 200);
        };

        // Mejorar hover del botón cerrar
        closeBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'rotate(90deg) scale(1.1)';
            this.style.background = 'rgba(255, 255, 255, 0.3)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });
        
        closeBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'rotate(0deg) scale(1)';
            this.style.background = 'rgba(255, 255, 255, 0.2)';
            this.style.boxShadow = 'none';
        });
    }

    // Mejorar botones de volver
    const volverBtn = popup.querySelector('button[id*="btnVolver"]');
    if (volverBtn) {
        volverBtn.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #2a5298 0%, #3b82d6 100%)';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(30, 60, 114, 0.4)';
        });
        
        volverBtn.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(30, 60, 114, 0.3)';
        });
        
        volverBtn.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(30, 60, 114, 0.3)';
        });
    }

    // Mejorar filas de tabla si existen
    const tableRows = popup.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        if (!row.onmouseover) { // Solo si no tiene eventos ya
            const originalBg = row.style.background || getComputedStyle(row).backgroundColor;
            
            row.addEventListener('mouseenter', function() {
                this.style.background = 'linear-gradient(90deg, #f0f7ff 0%, #e3f2fd 100%)';
                this.style.transform = 'translateY(-1px)';
                this.style.boxShadow = '0 4px 12px rgba(30, 60, 114, 0.15)';
                this.style.transition = 'all 0.3s ease';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.background = originalBg;
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        }
    });

    // Añadir efecto de parallax sutil al header
    const header = popup.querySelector('.modal-header, div[style*="background:linear-gradient"]');
    if (header) {
        popup.addEventListener('scroll', function() {
            const scrolled = this.scrollTop;
            const rate = scrolled * -0.5;
            header.style.transform = `translateY(${rate}px)`;
        });
    }
}

/**
 * Añade efectos de carga para mejorar la percepción de velocidad
 */
function addLoadingEffects() {
    // Interceptar las llamadas AJAX para mostrar indicadores de carga
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        
        // Solo mostrar loading para las llamadas de ventas y cierres
        if (url && (url.includes('get_ventas_turno.php') || url.includes('get_cierre_turno.php'))) {
            showLoadingIndicator();
        }
        
        return originalFetch.apply(this, args).finally(() => {
            hideLoadingIndicator();
        });
    };
}

/**
 * Muestra un indicador de carga
 */
function showLoadingIndicator() {
    const existingLoader = document.getElementById('popupLoader');
    if (existingLoader) return;

    const loader = document.createElement('div');
    loader.id = 'popupLoader';
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: rgba(255, 255, 255, 0.95);
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 15px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1e3c72;
        font-weight: 600;
        backdrop-filter: blur(4px);
    `;
    
    loader.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Cargando información...</span>
    `;
    
    document.body.appendChild(loader);
}

/**
 * Oculta el indicador de carga
 */
function hideLoadingIndicator() {
    const loader = document.getElementById('popupLoader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 200);
    }
}

/**
 * Añade efectos de sonido opcionales (comentado por defecto)
 */
function addSoundEffects() {
    // Descomentado si se desean efectos de sonido
    /*
    const playSound = (frequency, duration) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };
    
    // Sonido de apertura de popup
    document.addEventListener('DOMNodeInserted', function(e) {
        if (e.target.id === 'popupVentasAdmin' || e.target.id === 'popupCierreAdmin') {
            playSound(800, 0.1);
        }
    });
    */
}

/**
 * Mejora la accesibilidad de los popups
 */
function enhanceAccessibility() {
    document.addEventListener('keydown', function(e) {
        const popupVentas = document.getElementById('popupVentasAdmin');
        const popupCierre = document.getElementById('popupCierreAdmin');
        const activePopup = (popupVentas && popupVentas.style.display === 'flex') ? popupVentas :
                           (popupCierre && popupCierre.style.display === 'flex') ? popupCierre : null;

        if (activePopup && e.key === 'Escape') {
            const closeBtn = activePopup.querySelector('button[onclick*="style.display=\'none\'"]');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    });
}

// Inicializar mejoras de accesibilidad
enhanceAccessibility();

// Exportar funciones para uso externo si es necesario
window.PopupEnhancements = {
    enhancePopupElements,
    showLoadingIndicator,
    hideLoadingIndicator
};
