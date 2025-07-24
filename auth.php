<?php
// Importar configuración de sesiones
require_once __DIR__ . '/Backend/ConexionBD/SessionConfig.php';

session_start();

$tiempo_limite = getSessionTimeout(); // Usar configuración centralizada

if (isset($_SESSION['login_time'])) {
    $duracion_sesion = time() - $_SESSION['login_time'];
    if ($duracion_sesion > $tiempo_limite) {
        session_unset();
        session_destroy();
        
        // Si es una petición AJAX, enviar respuesta JSON
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['sessionExpired' => true, 'redirect' => '/index.php']);
            exit();
        }
        
        // Para peticiones normales, redirigir
        header("Location: /index.php");
        exit();
    } else {
        $_SESSION['login_time'] = time(); // Reiniciar el tiempo de sesión
    }
} else {
    // Si es una petición AJAX, enviar respuesta JSON
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        header('Content-Type: application/json');
        echo json_encode(['sessionExpired' => true, 'redirect' => '/index.php']);
        exit();
    }
    
    header("Location: /index.php");
    exit();
}
?>