<?php
include __DIR__ . '/../../ConexionBD/Conexion.php';

// Iniciar la sesión si no está iniciada
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Verificar si la sesión está iniciada y si el ID del promotor está definido
if (!isset($_SESSION['id'])) {
    echo json_encode(['error' => 'No se ha iniciado sesión o falta el ID del promotor']);
    exit();
}

// Consulta para obtener contactos de CRM
// Consulta para obtener contactos de CRM adaptada
$sql = "
SELECT 
    s.id,
    DATE_FORMAT(s.fecha_solicitud, '%d/%m/%Y') AS fecha_formateada,
    pv.descripcion AS nombre_pdv,
    pv.direccion AS direccion_pdv,
    pv.ubicacion AS ubicacion_pdv,
    s.marca,
    s.actividad,
    pv.segmento_pvl,
    pv.segmento_cvl,
    pv.segmento_mco,
    u_ase.nombre_usuario AS asesor_comercial,
    s.observaciones,
    s.id_estado AS id_estado,
    -- ✅ Validar si foto_activacion está vacía
    CASE 
        WHEN (solicitudes_cierre.foto_activacion IS NULL OR solicitudes_cierre.foto_activacion = '') THEN 1
        ELSE 0
    END AS sin_cierre
FROM solicitudes s
INNER JOIN puntos_venta pv ON pv.id = s.id_punto_venta
INNER JOIN usuarios u_ase ON u_ase.id = s.id_asesor_comercial
LEFT JOIN solicitudes_cierre ON solicitudes_cierre.id_solicitud = s.id
WHERE s.id_promotor = " . intval($_SESSION['id']) . " AND s.id_estado = 1
GROUP BY s.id
ORDER BY s.fecha_solicitud DESC;

";


$resultado = $conexion->query($sql);
$info_completa = []; // Asegúrate de inicializar el array

while ($fila = mysqli_fetch_assoc($resultado)) {
    $info_completa[] = $fila; // Agregar cada fila al array
}

header('Content-Type: application/json'); // Especificar el tipo de contenido
echo json_encode($info_completa); // Devolver el resultado como JSON
?>
