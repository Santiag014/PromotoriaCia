/**
 * LoadingManager - Gestión centralizada de elementos de carga
 * Este archivo maneja todos los popups de carga para evitar que se queden colgados
 */

class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
        this.maxLoadingTime = 15000; // 15 segundos máximo
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // Listener para ESC que fuerza el cierre de todos los loaders
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.forceHideAll();
            }
        });

        // Timer de emergencia que ejecuta cada 5 segundos
        setInterval(() => {
            this.checkAndCleanupLoaders();
        }, 5000);

        // Timer de emergencia global después de 20 segundos de la carga de página
        setTimeout(() => {
            this.forceHideAll();
        }, 20000);

        this.initialized = true;
        console.log('LoadingManager inicializado');
    }

    show(loaderId = 'loadingSpinner', message = 'Cargando...') {
        const loader = document.getElementById(loaderId);
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (loader) {
            loader.style.display = 'flex';
            loader.style.visibility = 'visible';
            loader.dataset.showTime = Date.now();
            this.activeLoaders.add(loaderId);
            
            // Actualizar mensaje si se proporciona
            if (loadingMessage && message) {
                loadingMessage.textContent = message;
            }
            
            // Auto-hide después del tiempo máximo
            setTimeout(() => {
                this.hide(loaderId);
            }, this.maxLoadingTime);
        }
    }

    hide(loaderId = 'loadingSpinner') {
        const loader = document.getElementById(loaderId);
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (loader) {
            loader.style.display = 'none';
            loader.style.visibility = 'hidden';
            this.activeLoaders.delete(loaderId);
            
            // Restaurar mensaje por defecto
            if (loadingMessage) {
                loadingMessage.textContent = 'Cargando...';
            }
        }
    }

    forceHideAll() {
        const selectors = [
            '#loadingSpinner',
            '.loading-spinner',
            '#popupLoader',
            '.spinner'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
            });
        });

        // Restaurar mensaje por defecto
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.textContent = 'Cargando...';
        }

        this.activeLoaders.clear();
        console.log('Todos los loaders han sido forzados a ocultarse');
    }

    checkAndCleanupLoaders() {
        this.activeLoaders.forEach(loaderId => {
            const loader = document.getElementById(loaderId);
            if (loader && loader.style.display !== 'none') {
                const timeSinceVisible = Date.now() - (loader.dataset.showTime || 0);
                if (timeSinceVisible > this.maxLoadingTime) {
                    console.warn(`Loader ${loaderId} ha estado visible por más de ${this.maxLoadingTime}ms. Forzando cierre.`);
                    this.hide(loaderId);
                }
            }
        });
    }

    // Método para que otros scripts puedan usar fácilmente
    static getInstance() {
        if (!window.loadingManagerInstance) {
            window.loadingManagerInstance = new LoadingManager();
        }
        return window.loadingManagerInstance;
    }
}

// Inicializar automáticamente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const manager = LoadingManager.getInstance();
    manager.init();
});

// Exponer funciones globales para compatibilidad
window.mostrarCargando = function(message = 'Cargando...') {
    LoadingManager.getInstance().show('loadingSpinner', message);
};

window.ocultarCargando = function() {
    LoadingManager.getInstance().hide();
};

window.forceHideAllLoaders = function() {
    LoadingManager.getInstance().forceHideAll();
};

// Crear atajos de teclado para debugging
document.addEventListener('keydown', (e) => {
    // Ctrl + Shift + H = Force hide all
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        LoadingManager.getInstance().forceHideAll();
        console.log('Manual force hide ejecutado');
    }
});
