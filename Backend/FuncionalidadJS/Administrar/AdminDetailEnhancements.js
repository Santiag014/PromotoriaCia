/**
 * Mejoras adicionales para el popup de detalles del administrador
 * Incluye animaciones suaves, efectos de hover y mejor UX
 */

document.addEventListener('DOMContentLoaded', function() {
    enhanceAdminDetailPopup();
    addSmoothAnimations();
    improveButtonInteractions();
});

/**
 * Mejora el popup de detalles del administrador
 */
function enhanceAdminDetailPopup() {
    const popup = document.getElementById('adminDetallePopup');
    if (!popup) return;

    // Interceptar la función de cerrar para añadir animación
    const originalClose = window.closeAdminDetallePopup;
    if (originalClose) {
        window.closeAdminDetallePopup = function() {
            popup.classList.add('hiding');
            setTimeout(() => {
                originalClose.call(this);
                popup.classList.remove('hiding');
            }, 300);
        };
    }

    // Mejorar la función de apertura del popup
    enhancePopupOpening();
}

/**
 * Mejora la apertura del popup con animaciones
 */
function enhancePopupOpening() {
    // Observador para detectar cuando se muestra el popup
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const popup = mutation.target;
                if (popup.id === 'adminDetallePopup' && popup.style.display === 'flex') {
                    // NO manipular la opacidad para evitar que desaparezca
                    // Solo añadir la clase de animación sin afectar la visibilidad
                    popup.classList.add('show');
                    animateDetailItems();
                }
            }
        });
    });

    const popup = document.getElementById('adminDetallePopup');
    if (popup) {
        observer.observe(popup, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
}

/**
 * Anima los elementos de detalle uno por uno
 */
function animateDetailItems() {
    const detailItems = document.querySelectorAll('#adminDetallePopup .detail-item');
    detailItems.forEach((item, index) => {
        // Animación muy sutil, casi imperceptible
        item.style.transition = 'all 0.2s ease';
        item.style.transform = 'translateX(-2px)';
        item.style.opacity = '0.7';
        
        setTimeout(() => {
            item.style.transform = 'translateX(0)';
            item.style.opacity = '1';
        }, index * 20 + 30);
    });
}

/**
 * Añade animaciones suaves a los elementos
 */
function addSmoothAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        /* Animaciones adicionales para elementos específicos */
        #adminDetallePopup.show .modal-content {
            animation: modalBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes modalBounce {
            0% {
                opacity: 0;
                transform: scale(0.3) translateY(100px);
            }
            50% {
                opacity: 1;
                transform: scale(1.05) translateY(-10px);
            }
            70% {
                transform: scale(0.98) translateY(5px);
            }
            100% {
                transform: scale(1) translateY(0);
            }
        }

        /* Efecto de escritura para el título */
        #adminDetallePopup .modal-header h3 {
            overflow: hidden;
            border-right: 0.15em solid rgba(255, 255, 255, 0.75);
            white-space: nowrap;
            animation: typing 1.5s steps(20, end), blink-caret 0.75s step-end infinite;
        }

        @keyframes typing {
            from { width: 0; }
            to { width: 100%; }
        }

        @keyframes blink-caret {
            from, to { border-color: transparent; }
            50% { border-color: rgba(255, 255, 255, 0.75); }
        }

        /* Efecto de pulso para botones importantes */
        #adminDetallePopup .accept-btn,
        #adminDetallePopup .reject-btn {
            animation: subtlePulse 2s infinite;
        }

        @keyframes subtlePulse {
            0%, 100% { box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4); }
            50% { box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6); }
        }

        #adminDetallePopup .reject-btn {
            animation-name: subtlePulseRed;
        }

        @keyframes subtlePulseRed {
            0%, 100% { box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4); }
            50% { box-shadow: 0 6px 20px rgba(220, 53, 69, 0.6); }
        }

        /* Efecto de brillo en el header */
        #adminDetallePopup .modal-header {
            position: relative;
            overflow: hidden;
        }

        #adminDetallePopup .modal-header::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.3),
                transparent
            );
            animation: headerShine 3s infinite;
        }

        @keyframes headerShine {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Mejora las interacciones de los botones
 */
function improveButtonInteractions() {
    // Mejorar botones de aceptar/denegar
    const acceptBtn = document.getElementById('btnAceptarSolicitud');
    const rejectBtn = document.getElementById('btnDenegarSolicitud');

    if (acceptBtn) {
        enhanceButton(acceptBtn, {
            hoverColor: 'linear-gradient(135deg, #20c997 0%, #17a2b8 100%)',
            clickEffect: true,
            soundEffect: 'success'
        });
    }

    if (rejectBtn) {
        enhanceButton(rejectBtn, {
            hoverColor: 'linear-gradient(135deg, #c82333 0%, #dc3545 100%)',
            clickEffect: true,
            soundEffect: 'error'
        });
    }

    // Mejorar botón de ubicación
    const locationBtn = document.getElementById('adminModalUbicacionBtn');
    if (locationBtn) {
        enhanceButton(locationBtn, {
            hoverColor: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
            clickEffect: true,
            soundEffect: 'click'
        });
    }

    // Mejorar botones de ventas y cierre
    const ventasBtn = document.getElementById('btnVerVentasAdmin');
    const cierreBtn = document.getElementById('btnVerCierreAdmin');

    if (ventasBtn) {
        enhanceButton(ventasBtn, {
            hoverColor: 'linear-gradient(135deg, #ff8f00 0%, #ff6f00 100%)',
            clickEffect: true
        });
    }

    if (cierreBtn) {
        enhanceButton(cierreBtn, {
            hoverColor: 'linear-gradient(135deg, #00acc1 0%, #00bcd4 100%)',
            clickEffect: true
        });
    }
}

/**
 * Mejora un botón específico con efectos
 */
function enhanceButton(button, options = {}) {
    if (!button) return;

    const originalBg = window.getComputedStyle(button).background;
    
    // Efecto hover
    button.addEventListener('mouseenter', function() {
        if (!button.disabled) {
            this.style.background = options.hoverColor || originalBg;
            this.style.transform = 'translateY(-3px) scale(1.02)';
            
            // Efecto de sonido (opcional)
            if (options.soundEffect) {
                playUISound(options.soundEffect);
            }
        }
    });

    button.addEventListener('mouseleave', function() {
        if (!button.disabled) {
            this.style.background = originalBg;
            this.style.transform = 'translateY(0) scale(1)';
        }
    });

    // Efecto click
    if (options.clickEffect) {
        button.addEventListener('mousedown', function() {
            if (!button.disabled) {
                this.style.transform = 'translateY(-1px) scale(0.98)';
                
                // Crear efecto ripple
                createRippleEffect(this);
            }
        });

        button.addEventListener('mouseup', function() {
            if (!button.disabled) {
                setTimeout(() => {
                    this.style.transform = 'translateY(-3px) scale(1.02)';
                }, 100);
            }
        });
    }

    // Efecto de focus para accesibilidad
    button.addEventListener('focus', function() {
        this.style.outline = '3px solid rgba(30, 60, 114, 0.5)';
        this.style.outlineOffset = '2px';
    });

    button.addEventListener('blur', function() {
        this.style.outline = 'none';
    });
}

/**
 * Crea un efecto ripple en un elemento
 */
function createRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.4)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Añadir animación CSS si no existe
    if (!document.getElementById('ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Reproduce sonidos de UI (opcional, comentado por defecto)
 */
function playUISound(type) {
    // Descomenta si quieres efectos de sonido
    /*
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const sounds = {
        success: { frequency: 800, duration: 0.2 },
        error: { frequency: 300, duration: 0.3 },
        click: { frequency: 600, duration: 0.1 }
    };
    
    const sound = sounds[type];
    if (!sound) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = sound.frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
    */
}

/**
 * Añade efectos de partículas al hacer clic en botones importantes
 */
function addParticleEffects() {
    const acceptBtn = document.getElementById('btnAceptarSolicitud');
    const rejectBtn = document.getElementById('btnDenegarSolicitud');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => createParticles(acceptBtn, '#28a745'));
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => createParticles(rejectBtn, '#dc3545'));
    }
}

/**
 * Crea partículas animadas
 */
function createParticles(element, color) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '10000';
        
        document.body.appendChild(particle);
        
        const angle = (i / 12) * Math.PI * 2;
        const distance = 100;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
    }
}

// Inicializar efectos de partículas
addParticleEffects();

// Exportar funciones para uso externo
window.AdminDetailEnhancements = {
    enhanceAdminDetailPopup,
    improveButtonInteractions,
    createRippleEffect,
    createParticles
};
