<?php
/**
 * Verificador de Estado de Sesión
 * API endpoint para verificar si la sesión del usuario sigue siendo válida
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de sesión
// Importar configuración de sesiones
require_once __DIR__ . '/../ConexionBD/SessionConfig.php';

session_start();
$tiempo_limite = getSessionTimeout(); // Usar configuración centralizada

$response = [
    'valid' => false,
    'timeRemaining' => 0,
    'message' => '',
    'timestamp' => time()
];

try {
    // Verificar si existe una sesión activa
    if (!isset($_SESSION['login_time']) || !isset($_SESSION['id'])) {
        $response['message'] = 'No hay sesión activa';
        echo json_encode($response);
        exit();
    }

    // Calcular tiempo transcurrido
    $duracion_sesion = time() - $_SESSION['login_time'];
    $tiempo_restante = ($tiempo_limite - $duracion_sesion) * 1000; // Convertir a milisegundos

    // Verificar si la sesión ha expirado
    if ($duracion_sesion > $tiempo_limite) {
        // Limpiar la sesión expirada
        session_unset();
        session_destroy();
        
        $response['message'] = 'Sesión expirada';
        echo json_encode($response);
        exit();
    }

    // La sesión es válida
    $response['valid'] = true;
    $response['timeRemaining'] = $tiempo_restante;
    $response['message'] = 'Sesión válida';
    
    // Actualizar el tiempo de última actividad
    $_SESSION['login_time'] = time();
    
    // Información adicional del usuario (opcional)
    $response['user'] = [
        'id' => $_SESSION['id'] ?? null,
        'nombre' => $_SESSION['nombre_usuario'] ?? null,
        'rol' => $_SESSION['id_rol'] ?? null
    ];

} catch (Exception $e) {
    $response['message'] = 'Error interno del servidor';
    $response['error'] = $e->getMessage();
    
    // Log del error (opcional)
    error_log("Error en check_session.php: " . $e->getMessage());
}

echo json_encode($response);
?>
