<?php
// Incluir archivo de conexión a la base de datos
include '../../ConexionBD/Conexion.php';

header('Content-Type: application/json');

// Verificar si se ha enviado un ID de asesor
if (!isset($_GET['id_asesor']) || empty($_GET['id_asesor'])) {
    echo json_encode(['error' => 'ID de asesor no proporcionado']);
    exit;
}

$id_asesor = $_GET['id_asesor'];

try {
    $conn = new Conexion();
    $conexion = $conn->Conectar();

    // Consulta para obtener la información del asesor
    $sql = "SELECT id, usuarios.nombre_usuario as nombre, usuarios.numero_usuario as telefono FROM usuarios WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_asesor);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $asesor = $resultado->fetch_assoc();
        echo json_encode($asesor);
    } else {
        echo json_encode(['error' => 'Asesor no encontrado']);
    }

    $stmt->close();
    $conexion->close();
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al consultar la base de datos: ' . $e->getMessage()]);
}
