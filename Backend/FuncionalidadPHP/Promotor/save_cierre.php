<?php
header('Content-Type: application/json');
include __DIR__ . '/../../ConexionBD/Conexion.php';

// Establecer zona horaria de PHP
date_default_timezone_set('America/Bogota');

// Establecer zona horaria de MySQL
$conexion->query("SET time_zone = '-05:00'");

// Obtener la fecha/hora actual y restar 5 horas si lo necesitas
$fecha_actual = date('Y-m-d H:i:s', strtotime('-5 hours'));

// Si es subida de archivo (FormData)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['foto']) && isset($_POST['fecha'])) {
    $fecha = preg_replace('/[^0-9\-]/', '', $_POST['fecha']); // Solo permite números y guiones
    $dir = __DIR__ . "/../../../Storage/$fecha";
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    $nombreArchivo = uniqid('cierre_') . '_' . basename($_FILES['foto']['name']);
    $rutaDestino = "$dir/$nombreArchivo";
    $urlRelativa = "Storage/$fecha/$nombreArchivo";
    if (move_uploaded_file($_FILES['foto']['tmp_name'], $rutaDestino)) {
        echo json_encode(['success' => true, 'foto_url' => $urlRelativa]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar la foto']);
    }
    exit;
}

// Si es JSON (guardar datos del cierre)
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

// Validación y saneado de datos
$id_solicitud = isset($input['id_solicitud']) ? intval($input['id_solicitud']) : 0;
if ($id_solicitud <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de solicitud inválido']);
    exit;
}

$hallazgos = isset($input['hallazgos']) ? $conexion->real_escape_string($input['hallazgos']) : null;
$personas_impactadas = isset($input['personas_impactadas']) ? intval($input['personas_impactadas']) : 0;
$foto_activacion = isset($input['foto_activacion']) ? $conexion->real_escape_string($input['foto_activacion']) : null;

// Buscar si ya existe un registro en solicitudes_cierre
$sql_buscar = "SELECT id FROM solicitudes_cierre WHERE id_solicitud = $id_solicitud LIMIT 1";
$res_buscar = $conexion->query($sql_buscar);

if ($res_buscar && $row = $res_buscar->fetch_assoc()) {
    // Actualizar
    $id_cierre = intval($row['id']);
    $sql_update = "UPDATE solicitudes_cierre SET 
        foto_activacion = " . ($foto_activacion ? "'$foto_activacion'" : "NULL") . ",
        personas_impactadas = $personas_impactadas,
        observaciones_cierre = " . ($hallazgos ? "'$hallazgos'" : "NULL") . ",
        updated_at = '$fecha_actual'
        WHERE id = $id_cierre";

    if ($conexion->query($sql_update)) {
        echo json_encode(['success' => true, 'id_cierre' => $id_cierre]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo actualizar el cierre']);
    }
} else {
    // Insertar
    $sql_insert = "INSERT INTO solicitudes_cierre 
        (id_solicitud, foto_activacion, personas_impactadas, observaciones_cierre, created_at, updated_at)
        VALUES (
            $id_solicitud, 
            " . ($foto_activacion ? "'$foto_activacion'" : "NULL") . ", 
            $personas_impactadas, 
            " . ($hallazgos ? "'$hallazgos'" : "NULL") . ", 
            '$fecha_actual', '$fecha_actual'
        )";

    if ($conexion->query($sql_insert)) {
        echo json_encode(['success' => true, 'id_cierre' => $conexion->insert_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo crear el cierre']);
    }
}

$conexion->close();
?>
