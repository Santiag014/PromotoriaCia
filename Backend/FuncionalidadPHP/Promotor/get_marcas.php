<?php
include __DIR__ . '/../../ConexionBD/Conexion.php';
$result = $conexion->query("SELECT * FROM marca ORDER BY descripcion");
$marcas = [];
while ($row = $result->fetch_assoc()) {
    $marcas[] = $row;
}
header('Content-Type: application/json');
echo json_encode($marcas);
?>
