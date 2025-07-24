/**
 * SISTEMA DE CARGA AVANZADO CON PROGRESO
 * Incluye animaciones, porcentajes y diferentes tipos de carga
 */

// Variables globales para el control de progreso
let currentProgress = 0;
let progressInterval = null;
let loadingType = 'default';
let progressSteps = [];
let currentStepIndex = 0;

/**
 * Mostrar el sistema de carga con progreso
 * @param {string} message - Mensaje inicial a mostrar
 * @param {string} type - Tipo de carga: 'default', 'downloading', 'processing', 'uploading'
 * @param {Array} steps - Array de pasos con mensajes y porcentajes
 */
function mostrarCargandoConProgreso(message = 'Procesando, por favor espere...', type = 'default', steps = []) {
    loadingType = type;
    currentProgress = 0;
    currentStepIndex = 0;
    progressSteps = steps.length > 0 ? steps : [
        { message: 'Iniciando proceso...', percent: 10 },
        { message: 'Cargando datos...', percent: 30 },
        { message: 'Procesando información...', percent: 60 },
        { message: 'Finalizando...', percent: 90 },
        { message: 'Completado', percent: 100 }
    ];

    const spinner = document.getElementById('loadingSpinner');
    const container = spinner.querySelector('.loading-container');
    const messageElement = document.getElementById('loadingMessage');
    const detailsElement = document.getElementById('loadingDetails');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');

    // Configurar el tipo de carga
    container.className = `loading-container ${type}`;
    
    // Mostrar el spinner
    spinner.style.display = 'flex';
    
    // Configurar mensaje inicial
    messageElement.textContent = message;
    detailsElement.textContent = progressSteps[0].message;
    
    // Resetear progreso
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    
    // Iniciar animación de progreso
    iniciarProgreso();
}

/**
 * Función mejorada para mostrar carga (compatible con código existente)
 */
function mostrarCargando() {
    mostrarCargandoConProgreso('Cargando información...', 'processing', [
        { message: 'Conectando con el servidor...', percent: 15 },
        { message: 'Obteniendo datos...', percent: 40 },
        { message: 'Procesando información...', percent: 70 },
        { message: 'Preparando resultados...', percent: 90 },
        { message: 'Listo', percent: 100 }
    ]);
}

/**
 * Función para mostrar carga de descarga de archivos
 */
function mostrarCargandoDescarga(fileName = 'archivo') {
    mostrarCargandoConProgreso(`Descargando ${fileName}...`, 'downloading', [
        { message: 'Preparando descarga...', percent: 10 },
        { message: 'Generando archivo...', percent: 30 },
        { message: 'Comprimiendo datos...', percent: 60 },
        { message: 'Iniciando descarga...', percent: 85 },
        { message: 'Descarga completada', percent: 100 }
    ]);
}

/**
 * Función para mostrar carga de subida de archivos
 */
function mostrarCargandoSubida(fileName = 'archivo') {
    mostrarCargandoConProgreso(`Subiendo ${fileName}...`, 'uploading', [
        { message: 'Preparando archivo...', percent: 10 },
        { message: 'Validando datos...', percent: 25 },
        { message: 'Subiendo al servidor...', percent: 70 },
        { message: 'Procesando en servidor...', percent: 90 },
        { message: 'Subida completada', percent: 100 }
    ]);
}

/**
 * Iniciar la animación de progreso automática
 */
function iniciarProgreso() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    const totalSteps = progressSteps.length;
    const stepDuration = 800; // 800ms por paso
    
    progressInterval = setInterval(() => {
        if (currentStepIndex < totalSteps) {
            const step = progressSteps[currentStepIndex];
            actualizarProgreso(step.percent, step.message);
            currentStepIndex++;
        } else {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }, stepDuration);
}

/**
 * Actualizar el progreso manualmente
 * @param {number} percent - Porcentaje de 0 a 100
 * @param {string} message - Mensaje opcional a mostrar
 */
function actualizarProgreso(percent, message = '') {
    currentProgress = Math.min(Math.max(percent, 0), 100);
    
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const detailsElement = document.getElementById('loadingDetails');
    
    if (progressFill) {
        progressFill.style.width = currentProgress + '%';
    }
    
    if (progressPercent) {
        progressPercent.textContent = Math.round(currentProgress) + '%';
    }
    
    if (message && detailsElement) {
        detailsElement.textContent = message;
    }
    
    // Efecto de completado
    if (currentProgress >= 100) {
        setTimeout(() => {
            const container = document.querySelector('.loading-container');
            if (container) {
                container.classList.add('completed');
            }
        }, 300);
    }
}

/**
 * Ocultar el sistema de carga
 */
function ocultarCargando() {
    const spinner = document.getElementById('loadingSpinner');
    const container = spinner.querySelector('.loading-container');
    
    // Si no está al 100%, completar rápidamente
    if (currentProgress < 100) {
        actualizarProgreso(100, 'Completado');
        setTimeout(() => {
            finalizarCarga();
        }, 500);
    } else {
        finalizarCarga();
    }
}

/**
 * Finalizar y ocultar la carga
 */
function finalizarCarga() {
    const spinner = document.getElementById('loadingSpinner');
    
    // Limpiar intervalo si existe
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    // Animación de salida
    spinner.style.animation = 'fadeInLoading 0.3s ease-out reverse';
    
    setTimeout(() => {
        spinner.style.display = 'none';
        spinner.style.animation = '';
        
        // Resetear estado
        const container = spinner.querySelector('.loading-container');
        if (container) {
            container.className = 'loading-container';
        }
        
        currentProgress = 0;
        currentStepIndex = 0;
        loadingType = 'default';
    }, 300);
}

/**
 * Función para simular progreso con pasos específicos
 * @param {Array} steps - Array de objetos {duration: ms, percent: number, message: string}
 */
async function progresoPersonalizado(steps) {
    for (const step of steps) {
        await new Promise(resolve => {
            setTimeout(() => {
                actualizarProgreso(step.percent, step.message);
                resolve();
            }, step.duration);
        });
    }
}

/**
 * Función específica para carga de datos de la tabla
 */
function mostrarCargandoTabla() {
    mostrarCargandoConProgreso('Cargando datos de la tabla...', 'processing', [
        { message: 'Conectando con la base de datos...', percent: 20 },
        { message: 'Ejecutando consulta...', percent: 50 },
        { message: 'Procesando resultados...', percent: 80 },
        { message: 'Renderizando tabla...', percent: 95 },
        { message: 'Datos cargados exitosamente', percent: 100 }
    ]);
}

/**
 * Función específica para guardar turnos
 */
function mostrarCargandoGuardarTurno() {
    mostrarCargandoConProgreso('Guardando turno...', 'uploading', [
        { message: 'Validando información...', percent: 25 },
        { message: 'Enviando datos al servidor...', percent: 60 },
        { message: 'Procesando en base de datos...', percent: 85 },
        { message: 'Turno guardado exitosamente', percent: 100 }
    ]);
}

// Exportar funciones para uso global
window.ProgressLoader = {
    mostrarCargandoConProgreso,
    mostrarCargando,
    mostrarCargandoDescarga,
    mostrarCargandoSubida,
    mostrarCargandoTabla,
    mostrarCargandoGuardarTurno,
    actualizarProgreso,
    ocultarCargando,
    progresoPersonalizado
};
