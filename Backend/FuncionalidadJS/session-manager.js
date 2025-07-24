/**
 * Gestor de Sesión Universal
 * Sistema para manejar la expiración de sesión en todas las páginas del sistema
 */

class SessionManager {
    constructor() {
        this.checkInterval = 60000; // Verificar cada minuto
        this.warningTime = 300000; // Advertir 5 minutos antes
        this.sessionTimeout = 1800000; // 30 minutos (debe coincidir con PHP)
        this.intervalId = null;
        this.warningShown = false;
        this.init();
    }

    init() {
        this.createSessionExpiredPopup();
        this.startSessionCheck();
        this.setupActivityListeners();
    }

    /**
     * Crear el HTML del popup de sesión expirada
     */
    createSessionExpiredPopup() {
        if (document.getElementById('sessionExpiredPopup')) {
            return; // Ya existe
        }

        const popupHTML = `
            <div id="sessionExpiredPopup">
                <div class="session-modal">
                    <div class="session-header">
                        <span class="warning-icon">⚠️</span>
                        <h2 class="session-title">Sesión Expirada</h2>
                    </div>
                    <div class="session-content">
                        <p class="session-message">
                            Su sesión ha expirado por inactividad.<br>
                            Por favor, inicie sesión de nuevo para continuar.
                        </p>
                        <p class="session-submessage">
                            <span class="clock-icon">🕒</span>
                            Será redirigido al login automáticamente.
                        </p>
                        <button class="session-button" onclick="sessionManager.redirectToLogin()">
                            Ir al Login
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    /**
     * Iniciar la verificación periódica de sesión
     */
    startSessionCheck() {
        this.intervalId = setInterval(() => {
            this.checkSessionStatus();
        }, this.checkInterval);
    }

    /**
     * Verificar el estado de la sesión
     */
    async checkSessionStatus() {
        try {
            const response = await fetch('/Backend/FuncionalidadPHP/check_session.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            });

            const data = await response.json();
            
            if (!data.valid) {
                this.showSessionExpiredPopup();
            } else if (data.timeRemaining <= this.warningTime && !this.warningShown) {
                this.showSessionWarning(data.timeRemaining);
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
            // En caso de error, también mostrar el popup por seguridad
            this.showSessionExpiredPopup();
        }
    }

    /**
     * Mostrar advertencia de sesión próxima a expirar
     */
    showSessionWarning(timeRemaining) {
        this.warningShown = true;
        const minutes = Math.ceil(timeRemaining / 60000);
        
        // Crear notificación temporal
        const warningHTML = `
            <div id="sessionWarning" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
                color: #212529;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                z-index: 8888;
                font-weight: 600;
                max-width: 300px;
                animation: slideInRight 0.5s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">⏰</span>
                    <div>
                        <div style="font-size: 14px; margin-bottom: 5px;">Sesión por expirar</div>
                        <div style="font-size: 12px; opacity: 0.8;">Su sesión expirará en ${minutes} minuto${minutes > 1 ? 's' : ''}</div>
                    </div>
                    <button onclick="document.getElementById('sessionWarning').remove()" style="
                        background: rgba(0,0,0,0.2);
                        border: none;
                        color: #212529;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 12px;
                    ">×</button>
                </div>
            </div>
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', warningHTML);
        
        // Remover la advertencia después de 10 segundos
        setTimeout(() => {
            const warning = document.getElementById('sessionWarning');
            if (warning) {
                warning.style.animation = 'slideOutRight 0.5s ease-in forwards';
                setTimeout(() => warning.remove(), 500);
            }
        }, 10000);
    }

    /**
     * Mostrar popup de sesión expirada
     */
    showSessionExpiredPopup() {
        const popup = document.getElementById('sessionExpiredPopup');
        if (popup) {
            popup.style.display = 'block';
            // Detener cualquier verificación adicional
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            
            // Redirigir automáticamente después de 8 segundos
            setTimeout(() => {
                this.redirectToLogin();
            }, 8000);
        }
    }

    /**
     * Redirigir al login
     */
    redirectToLogin() {
        const popup = document.getElementById('sessionExpiredPopup');
        if (popup) {
            popup.classList.add('hiding');
            setTimeout(() => {
                // Determinar la ruta correcta según la ubicación actual
                const currentPath = window.location.pathname;
                let loginPath = '/index.php';
                
                // Calcular la ruta relativa al login desde diferentes ubicaciones
                if (currentPath.includes('/Visuales/')) {
                    if (currentPath.includes('/Administrador/')) {
                        loginPath = '../../index.php';
                    } else if (currentPath.includes('/Promotor/') || currentPath.includes('/Asesor/')) {
                        loginPath = '../../index.php';
                    }
                }
                
                window.location.href = loginPath;
            }, 300);
        }
    }

    /**
     * Configurar listeners para detectar actividad del usuario
     */
    setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.resetWarning();
            }, { passive: true });
        });
    }

    /**
     * Resetear la advertencia de sesión
     */
    resetWarning() {
        this.warningShown = false;
        const warning = document.getElementById('sessionWarning');
        if (warning) {
            warning.remove();
        }
    }

    /**
     * Destruir el gestor de sesión
     */
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// Inicializar automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar si no existe ya una instancia
    if (typeof window.sessionManager === 'undefined') {
        window.sessionManager = new SessionManager();
    }
});

// Limpiar al salir de la página
window.addEventListener('beforeunload', function() {
    if (window.sessionManager) {
        window.sessionManager.destroy();
    }
});
