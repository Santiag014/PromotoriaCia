<?php
// Configurar encabezados
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

// Consulta SQL para obtener todos los puntos de venta con sus datos completos
$query = "SELECT id, descripcion as nombre, direccion, ubicacion, ciudad, canal 
          FROM puntos_venta 
          ORDER BY descripcion ASC";

try {
    // Ejecutar la consulta directamente
    $resultado = $conexion->query($query);
    
    if (!$resultado) {
        throw new Exception('Error al ejecutar la consulta: ' . $conexion->error);
    }
    
    // Array para almacenar los datos
    $puntos_venta = [];
    
    // Recorrer los resultados
    while ($fila = $resultado->fetch_assoc()) {
        $puntos_venta[] = $fila;
    }
    
    // Devolver los datos en formato JSON
    echo json_encode($puntos_venta);
    
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(['error' => $e->getMessage()]));
}

// Cerrar la conexión
$stmt->close();
$conexion->close();
?>
