<?php
header('Content-Type: application/json');
include __DIR__ . '/../../ConexionBD/Conexion.php';

// 1️⃣ Establecer zona horaria de PHP a Bogotá
date_default_timezone_set('America/Bogota');

// Obtener la fecha/hora actual y restar 5 horas si lo necesitas
// Si quieres restar 5 horas a la hora actual:
$fecha_actual = date('Y-m-d H:i:s', strtotime('-5 hours'));

// Obtener datos del POST (JSON)
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

$id_solicitud = intval($input['id_solicitud']);
$motivo_visita = $conexion->real_escape_string($input['motivo_visita']);
$marca_inicial = isset($input['marca_inicial']) ? $conexion->real_escape_string($input['marca_inicial']) : '';
$marca_final = isset($input['marca_final']) ? $conexion->real_escape_string($input['marca_final']) : '';
$productos_venta = isset($input['productos_venta']) ? $conexion->real_escape_string($input['productos_venta']) : '';
$presentacion = isset($input['presentacion']) ? $conexion->real_escape_string($input['presentacion']) : '';
$segmento = isset($input['segmento']) ? $conexion->real_escape_string($input['segmento']) : '';
$marca_vehiculo = isset($input['marca_vehiculo']) ? $conexion->real_escape_string($input['marca_vehiculo']) : '';
$cantidad = isset($input['cantidad']) ? intval($input['cantidad']) : 0;
$precio = isset($input['precio']) ? intval($input['precio']) : 0;
$observaciones = isset($input['observaciones']) ? $conexion->real_escape_string($input['observaciones']) : '';
$llevo_lubricante = isset($input['llevo_lubricante']) ? $conexion->real_escape_string($input['llevo_lubricante']) : null;

// Validación dinámica según reglas de negocio
if ($motivo_visita !== 'lubricantes' && $llevo_lubricante === 'no') {
    // Solo motivo, llevo_lubricante y observaciones son obligatorios
    if (!$motivo_visita || $llevo_lubricante === null || $observaciones === '') {
        echo json_encode(['success' => false, 'message' => 'Por favor, complete motivo de visita, si llevó lubricante y observaciones.']);
        exit;
    }
} else {
    // Venta normal: todos los campos obligatorios
    if (
        !$motivo_visita || !$marca_final || !$productos_venta ||
        !$cantidad || !$precio
    ) {
        echo json_encode(['success' => false, 'message' => 'Por favor, complete todos los campos obligatorios de la venta.']);
        exit;
    }
}

// 1️⃣ Buscar si ya existe un turno en solicitudes_cierre para la solicitud
$turno_id = null;
$sql_buscar = "SELECT id FROM solicitudes_cierre WHERE id_solicitud = $id_solicitud LIMIT 1";
$res_buscar = $conexion->query($sql_buscar);

if ($row = $res_buscar->fetch_assoc()) {
    $turno_id = intval($row['id']);
} else {
    // 2️⃣ Si no existe, crear el turno en solicitudes_cierre
    $sql_insert_turno = "INSERT INTO solicitudes_cierre (id_solicitud, created_at, updated_at) 
                         VALUES ($id_solicitud, '$fecha_actual', '$fecha_actual')";
    if ($conexion->query($sql_insert_turno)) {
        $turno_id = $conexion->insert_id;
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo crear el turno']);
        exit;
    }
}

// 3️⃣ Insertar la venta asociada al turno
$sql_insert_venta = "INSERT INTO solicitudes_productos (
    id_cierre, motivo_visita, lubricante_adicional, marca_inicial, marca_final, productos_venta, 
    presentacion, segmento, marca_vehiculo, cantidad, precio, observacion, created_at
) VALUES (
    $turno_id, 
    '$motivo_visita', 
    " . ($llevo_lubricante === null ? "NULL" : "'$llevo_lubricante'") . ", 
    '$marca_inicial', 
    '$marca_final', 
    '$productos_venta', 
    '$presentacion', 
    '$segmento', 
    '$marca_vehiculo', 
    $cantidad, 
    $precio, 
    '$observaciones', 
    '$fecha_actual'
)";
if ($conexion->query($sql_insert_venta)) {
    echo json_encode([
        'success' => true,
        'turno_id' => $turno_id,
        'venta_id' => $conexion->insert_id
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'No se pudo registrar la venta']);
}

$conexion->close();
?>
