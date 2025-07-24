<?php
/**
 * Configuración de Sesiones
 * Archivo centralizado para manejar los tiempos de sesión
 */

// Tiempo límite de sesión en segundos
// 1800 = 30 minutos
// 3600 = 1 hora
// 900 = 15 minutos (para pruebas)
define('SESSION_TIMEOUT', 60);

// Otras configuraciones de sesión (si necesitas en el futuro)
define('SESSION_WARNING_TIME', 300); // Mostrar aviso 5 minutos antes
define('SESSION_EXTEND_TIME', 600);  // Tiempo adicional al extender sesión

/**
 * Función para obtener el tiempo límite de sesión
 * @return int Tiempo en segundos
 */
function getSessionTimeout() {
    return SESSION_TIMEOUT;
}

/**
 * Función para obtener el tiempo de aviso de sesión
 * @return int Tiempo en segundos
 */
function getSessionWarningTime() {
    return SESSION_WARNING_TIME;
}

/**
 * Función para obtener el tiempo de extensión de sesión
 * @return int Tiempo en segundos
 */
function getSessionExtendTime() {
    return SESSION_EXTEND_TIME;
}
?>
