<?php
include __DIR__ . '/../../ConexionBD/Conexion.php';
$result = $conexion->query("SELECT r.*, m.descripcion AS marca FROM referencias r INNER JOIN marca m ON m.id = r.id_marca ORDER BY m.descripcion, r.descripcion");
$referencias = [];
while ($row = $result->fetch_assoc()) {
    $referencias[] = $row;
}
header('Content-Type: application/json');
echo json_encode($referencias);
?>
