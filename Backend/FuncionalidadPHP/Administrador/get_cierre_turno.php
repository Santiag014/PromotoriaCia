<?php
// Configurar encabezados para evitar problemas de caché y CORS
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Incluir el archivo de conexión a la base de datos
include __DIR__ . '/../../ConexionBD/Conexion.php';

// Verificar si hay una conexión a la base de datos
if (!$conexion) {
    http_response_code(500);
    die(json_encode(['error' => 'Error de conexión a la base de datos']));
}

// Verificar que se recibió un ID de turno
if (!isset($_GET['id_turno']) || empty($_GET['id_turno'])) {
    http_response_code(400);
    die(json_encode(['error' => 'ID de turno no proporcionado']));
}

$id_turno = $conexion->real_escape_string($_GET['id_turno']);

// Consulta para obtener información de cierre
$query = "SELECT 
    sc.foto_activacion, sc.personas_impactadas, sc.observaciones_cierre
FROM solicitudes s
INNER JOIN solicitudes_cierre sc ON s.id = sc.id_solicitud
WHERE s.id = $id_turno;";

try {
    $resultado = $conexion->query($query);
    
    if (!$resultado) {
        throw new Exception('Error al ejecutar la consulta: ' . $conexion->error);
    }
    
    if ($resultado->num_rows > 0) {
        $cierre = $resultado->fetch_assoc();
        
        // Liberar resultado
        $resultado->free();
        
        // Cerrar la conexión
        $conexion->close();
        
        // Devolver los datos en formato JSON
        echo json_encode($cierre);
    } else {
        // No hay cierre para este turno
        http_response_code(404);
        die(json_encode(['error' => 'No hay cierre registrado para este turno']));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(['error' => $e->getMessage()]));
}
?>
