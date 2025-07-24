/**
 * SISTEMA DE CARGA SIMPLE SIN PORCENTAJES
 */

/**
 * Función simple para mostrar carga
 */
function mostrarCargando() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        // Ocultar la barra de progreso y porcentajes
        const progressContainer = spinner.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
        
        const messageElement = document.getElementById('loadingMessage');
        if (messageElement) {
            messageElement.textContent = 'Cargando...';
        }
        
        spinner.style.display = 'flex';
    }
}

/**
 * Función simple para ocultar la carga
 */
function ocultarCargando() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Exportar funciones simples para uso global
window.ProgressLoader = {
    mostrarCargando,
    ocultarCargando
};
