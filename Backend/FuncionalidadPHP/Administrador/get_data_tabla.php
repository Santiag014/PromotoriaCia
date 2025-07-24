<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

include __DIR__ . '/../../ConexionBD/Conexion.php';

if (!$conexion) {
    http_response_code(500);
    die(json_encode(['error' => 'Error de conexión a la base de datos']));
}

$query = "SELECT 
    s.id,
    DATE_FORMAT(s.fecha_solicitud, '%d/%m/%Y') AS fecha_formateada,
    pv.descripcion AS nombre_pdv,
    pv.direccion AS direccion_pdv,
    pv.ubicacion AS ubicacion_pdv,
    s.marca,
    s.actividad,
    u_prom.nombre_usuario AS promotor,
    u_ase.nombre_usuario AS asesor_comercial,
    s.observaciones,
    s.id_estado AS id_estado,
    CASE 
        WHEN s.id_estado = 1 THEN 'Aceptado'
        WHEN s.id_estado = 2 THEN 'Denegado'
        ELSE 'Pendiente'
    END AS estado_texto,
    CASE
        WHEN ven.id IS NOT NULL THEN 'Con Ventas'
        ELSE 'Sin Ventas'
    END AS estado_ventas,
    CASE
        WHEN cie.id IS NOT NULL THEN 'Con Cierre'
        ELSE 'Sin Cierre'
    END AS estado_cierre,
    pv.ciudad,
    pv.canal
FROM solicitudes s
INNER JOIN puntos_venta pv ON pv.id = s.id_punto_venta
INNER JOIN usuarios u_prom ON u_prom.id = s.id_promotor
INNER JOIN usuarios u_ase ON u_ase.id = s.id_asesor_comercial
LEFT JOIN solicitudes_cierre cie ON cie.id_solicitud = s.id
LEFT JOIN solicitudes_productos ven ON ven.id_cierre = cie.id
GROUP by s.id
ORDER BY s.fecha_solicitud DESC;";

try {
    // Verificar solo tablas que realmente usas
    $tablas = ["solicitudes", "puntos_venta", "usuarios", "solicitudes_cierre", "solicitudes_productos"];
    foreach ($tablas as $tabla) {
        $checkTable = $conexion->query("SHOW TABLES LIKE '{$tabla}'");
        if ($checkTable->num_rows == 0) {
            throw new Exception("La tabla {$tabla} no existe en la base de datos.");
        }
    }

    $resultado = $conexion->query($query);
    if (!$resultado) {
        throw new Exception('Error al ejecutar la consulta: ' . $conexion->error);
    }

    $datos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }

    $resultado->free();
} catch (Exception $e) {
    error_log('Error en get_data_tabla.php: ' . $e->getMessage());
    http_response_code(500);
    die(json_encode([
        'error' => 'Error interno del servidor',
        'mensaje' => 'Se produjo un error al obtener los datos. Por favor, contacte al administrador.'
        // 'debug' => $e->getMessage() // solo en desarrollo
    ]));
}

$conexion->close();
echo json_encode($datos);
?>
