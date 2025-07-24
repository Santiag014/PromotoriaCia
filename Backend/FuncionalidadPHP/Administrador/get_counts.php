<?php
include __DIR__ . '/../../ConexionBD/Conexion.php';

// Consultas COUNT
$countSinEstado = mysqli_query($conexion, "SELECT COUNT(*) as count FROM formulario_asesor WHERE id_estado = 3");
$countAceptada = mysqli_query($conexion, "SELECT COUNT(*) as count FROM formulario_asesor WHERE id_estado = 1");
$countDenegada = mysqli_query($conexion, "SELECT COUNT(*) as count FROM formulario_asesor WHERE id_estado = 2");
$countTotal = mysqli_query($conexion, "SELECT COUNT(*) as count FROM formulario_asesor");

if (!$countSinEstado || !$countAceptada || !$countDenegada || !$countTotal) {
    echo json_encode(['error' => 'Error en las consultas']);
    exit;
}

$countSinEstadoResult = mysqli_fetch_assoc($countSinEstado)['count'];
$countAceptadaResult = mysqli_fetch_assoc($countAceptada)['count'];
$countDenegadaResult = mysqli_fetch_assoc($countDenegada)['count'];
$countTotalResult = mysqli_fetch_assoc($countTotal)['count'];

$response = [
    'data' => [],
    'counts' => [
        'sinEstado' => $countSinEstadoResult,
        'aceptada' => $countAceptadaResult,
        'denegada' => $countDenegadaResult,
        'total' => $countTotalResult
    ]
];

header('Content-Type: application/json');
echo json_encode($response);
?>
