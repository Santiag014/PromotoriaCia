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

// Verificar que se recibió un ID de punto de venta
if (!isset($_GET['id_punto_venta']) || empty($_GET['id_punto_venta'])) {
    http_response_code(400);
    die(json_encode(['error' => 'ID de punto de venta no proporcionado']));
}

$id_punto_venta = $conexion->real_escape_string($_GET['id_punto_venta']);

// Consulta para obtener información completa del punto de venta
$query = "SELECT 
            id, 
            descripcion as nombre, 
            ciudad,
            direccion, 
            ubicacion, 
            canal
          FROM puntos_venta
          WHERE 
            id = '$id_punto_venta'";

try {
    $resultado = $conexion->query($query);
    
    if (!$resultado) {
        throw new Exception('Error al ejecutar la consulta: ' . $conexion->error);
    }
    
    if ($resultado->num_rows > 0) {
        $datos = $resultado->fetch_assoc();
        
        // Agregar la información de geolocalización en formato más amigable
        if (!empty($datos['ubicacion'])) {
            // Verificar si ya es un enlace
            if (strpos($datos['ubicacion'], 'http') !== 0) {
                // Si no es un enlace, verificamos si es una coordenada
                if (preg_match('/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/', $datos['ubicacion'])) {
                    $datos['ubicacion_url'] = "https://www.google.com/maps/search/?api=1&query=" . urlencode($datos['ubicacion']);
                } else {
                    // Si no es una coordenada ni un enlace, usamos la dirección + ciudad
                    $direccion_completa = $datos['direccion'] . ', ' . $datos['ciudad'];
                    $datos['ubicacion_url'] = "https://www.google.com/maps/search/?api=1&query=" . urlencode($direccion_completa);
                }
            } else {
                $datos['ubicacion_url'] = $datos['ubicacion'];
            }
        }
        
        // Liberar resultado
        $resultado->free();
        
        // Cerrar la conexión
        $conexion->close();
        
        // Devolver los datos en formato JSON
        echo json_encode($datos);
    } else {
        http_response_code(404);
        die(json_encode(['error' => 'Punto de venta no encontrado']));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(['error' => $e->getMessage()]));
}
?>
