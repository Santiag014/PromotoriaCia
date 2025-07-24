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

// Consulta SQL para obtener los asesores comerciales (usuarios con rol de asesor)
$query = "SELECT 
    usuarios.id as id, 
    usuarios.nombre_usuario as nombre, 
    usuarios.numero_usuario as telefono
FROM `usuarios`
WHERE usuarios.id_rol IN (2,4);";

try {
    // Ejecutar la consulta
    $resultado = $conexion->query($query);
    
    if (!$resultado) {
        throw new Exception('Error al ejecutar la consulta: ' . $conexion->error);
    }
    
    // Array para almacenar los datos
    $asesores = [];
    
    // Recorrer los resultados
    while ($fila = $resultado->fetch_assoc()) {
        $asesores[] = $fila;
    }
    
    // Devolver los datos en formato JSON
    echo json_encode($asesores);
    
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(['error' => $e->getMessage()]));
}

// Cerrar la conexión
$conexion->close();
?>
