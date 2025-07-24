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
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    die(json_encode(['error' => 'ID de turno no proporcionado']));
}

$id = $conexion->real_escape_string($_GET['id']);

// Consulta para obtener información de ventas + marca_inicial, marca_final y motivo_visita
$query = "
SELECT 
    sp.productos_venta AS producto,
    sp.presentacion,
    sp.segmento,
    sp.marca_vehiculo,
    sp.cantidad,
    sp.precio AS precio_unitario,
    sp.marca_inicial,
    sp.marca_final,
    sp.motivo_visita,
    DATE_FORMAT(sp.created_at, '%Y-%m-%d %H:%i:%s') AS fecha
FROM solicitudes s
INNER JOIN solicitudes_cierre sc ON s.id = sc.id_solicitud
INNER JOIN solicitudes_productos sp ON sp.id_cierre = sc.id
WHERE s.id = $id
";

try {
    $resultado = $conexion->query($query);

    if (!$resultado) {
        throw new Exception('Error al ejecutar la consulta: ' . $conexion->error);
    }

    $ventas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $ventas[] = [
            'producto' => $fila['producto'],
            'presentacion' => $fila['presentacion'],
            'segmento' => $fila['segmento'],
            'marca_vehiculo' => $fila['marca_vehiculo'],
            'cantidad' => $fila['cantidad'],
            'precio_unitario' => $fila['precio_unitario'],
            'marca_inicial' => $fila['marca_inicial'],
            'marca_final' => $fila['marca_final'],
            'motivo_visita' => $fila['motivo_visita'],
            'fecha' => $fila['fecha']
        ];
    }

    $resultado->free();
    $conexion->close();

    echo json_encode($ventas);

} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(['error' => $e->getMessage()]));
}
