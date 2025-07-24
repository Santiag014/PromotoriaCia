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
    die(json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']));
}

// Verificar si es una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Método no permitido']));
}

// Obtener y validar los datos del formulario
$promotora_id = isset($_POST['promotora']) ? intval($_POST['promotora']) : 0;
$fecha_actividad = isset($_POST['fecha_actividad']) ? $_POST['fecha_actividad'] : '';
$ciudad_id = isset($_POST['ciudad']) ? intval($_POST['ciudad']) : 0;
$canal_id = isset($_POST['canal']) ? intval($_POST['canal']) : 0;
$punto_venta_id = isset($_POST['punto_venta']) ? intval($_POST['punto_venta']) : 0;
$asesor_id = isset($_POST['asesor_comercial']) ? intval($_POST['asesor_comercial']) : 0;
$tipo_actividad_id = isset($_POST['tipo_actividad']) ? $_POST['tipo_actividad'] : '';
$nombre_actividad = isset($_POST['nombre_actividad']) ? trim($_POST['nombre_actividad']) : '';
$nombre_marca = isset($_POST['nombre_marca']) ? trim($_POST['nombre_marca']) : '';
$observaciones = isset($_POST['observaciones']) ? trim($_POST['observaciones']) : '';

// Validar solo los campos realmente obligatorios según la estructura de la base de datos
$camposFaltantes = [];
if ($punto_venta_id <= 0) $camposFaltantes[] = 'Punto de Venta';
if (empty($fecha_actividad)) $camposFaltantes[] = 'Fecha de Actividad';
if ($asesor_id <= 0) $camposFaltantes[] = 'Asesor Comercial';
if ($promotora_id <= 0) $camposFaltantes[] = 'Promotora';
if (empty($nombre_actividad)) $camposFaltantes[] = 'Tipo de Actividad';
if (empty($nombre_marca)) $camposFaltantes[] = 'Marca';
if (empty($observaciones)) $camposFaltantes[] = 'Observaciones';

// Si faltan campos, mostrar error detallado
if (!empty($camposFaltantes)) {
    $mensajeError = 'Los siguientes campos son obligatorios: ' . implode(', ', $camposFaltantes);
    
    // Para depuración, añadir valores recibidos
    $valoresRecibidos = [
        'promotora' => $promotora_id,
        'fecha_actividad' => $fecha_actividad,
        'punto_venta' => $punto_venta_id,
        'asesor_comercial' => $asesor_id,
        'tipo_actividad' => $tipo_actividad_id,
        'observaciones' => $observaciones ? 'Sí tiene contenido' : 'Vacío'
    ];
    
    http_response_code(400);
    die(json_encode([
        'success' => false, 
        'error' => $mensajeError,
        'campos_faltantes' => $camposFaltantes,
        'valores_recibidos' => $valoresRecibidos
    ]));
}

// Formatear la fecha para la base de datos
$fecha_formateada = date('Y-m-d', strtotime($fecha_actividad));

// Comenzar una transacción
$conexion->begin_transaction();

try {
    // Verificar si ya existe un turno para esta promotora en la misma fecha
    $query_verificar = "SELECT COUNT(*) as total FROM solicitudes WHERE id_promotor = ? AND fecha_solicitud = ? AND id_estado != 1";
    $stmt_verificar = $conexion->prepare($query_verificar);
    
    if (!$stmt_verificar) {
        throw new Exception('Error al preparar la consulta de verificación: ' . $conexion->error);
    }
    
    // Vincular parámetros para la verificación
    $stmt_verificar->bind_param('is', $promotora_id, $fecha_formateada);
    
    // Ejecutar la verificación
    if (!$stmt_verificar->execute()) {
        throw new Exception('Error al ejecutar la consulta de verificación: ' . $stmt_verificar->error);
    }
    
    // Obtener resultado
    $resultado = $stmt_verificar->get_result();
    $fila = $resultado->fetch_assoc();
    
    // Cerrar la consulta de verificación
    $stmt_verificar->close();
    
    // Verificar si ya existe un turno
    if ($fila['total'] > 0) {
        throw new Exception('Ya existe un turno programado para esta promotora en la fecha seleccionada');
    }
    
    // Establecer el estado como "programado" por defecto, pero permitir cambios si se proporciona
    $estado = 3;
    
    // Consulta SQL para insertar un nuevo turno (solo texto en actividad y marca)
    $query = "INSERT INTO solicitudes (
                id_promotor,
                id_asesor_comercial,
                id_punto_venta,
                actividad,
                marca,
                fecha_solicitud,
                observaciones,
                created_at,
                id_estado
              ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)";
              
    // Preparar la consulta
    $stmt = $conexion->prepare($query);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }
    
    // Vincular los parámetros (solo texto para actividad y marca)
    $stmt->bind_param(
        'iiissssi',
        $promotora_id,
        $asesor_id,
        $punto_venta_id,
        $nombre_actividad,
        $nombre_marca,
        $fecha_formateada,
        $observaciones,
        $estado
    );
    
    // Ejecutar la consulta
    if (!$stmt->execute()) {
        throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
    }
    
    // Confirmar la transacción
    $conexion->commit();
    
    // Devolver respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Turno guardado con éxito',
    ]);
    
} catch (Exception $e) {
    // Revertir la transacción en caso de error
    $conexion->rollback();
    
    // Devolver respuesta de error
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => $e->getMessage()]));
}

// Cerrar la conexión
$stmt->close();
$conexion->close();
?>
