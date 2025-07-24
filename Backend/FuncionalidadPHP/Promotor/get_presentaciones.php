<?php
include __DIR__ . '/../../ConexionBD/Conexion.php';
$result = $conexion->query("SELECT * FROM presentaciones ORDER BY descripcion");
$presentaciones = [];
while ($row = $result->fetch_assoc()) {
    $presentaciones[] = $row;
}
header('Content-Type: application/json');
echo json_encode($presentaciones);
?>
