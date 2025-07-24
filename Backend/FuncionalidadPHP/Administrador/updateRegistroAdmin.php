<?php

include __DIR__ . '/../../ConexionBD/Conexion.php';

// Leer datos JSON del cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['id']) && isset($input['estado'])) {
    $idProyecto = $input['id'];
    $estado = $input['estado'];

    $sql = "UPDATE solicitudes SET id_estado = ? WHERE id = ?";
    $stmt = mysqli_prepare($conexion, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, 'si', $estado, $idProyecto);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => mysqli_stmt_error($stmt)]);
        }
        mysqli_stmt_close($stmt);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta: ' . mysqli_error($conexion)]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Faltan datos en la solicitud.']);
}

// Cerrar la conexión
mysqli_close($conexion);
?>