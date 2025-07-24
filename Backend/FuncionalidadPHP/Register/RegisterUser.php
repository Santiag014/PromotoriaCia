<?php

include __DIR__ . '/../../ConexionBD/Conexion.php';

header('Content-Type: application/json');

$response = ['success' => false, 'error' => 'Error desconocido.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $_POST['nombre'];
    $email = $_POST['email'];
    $password = base64_decode($_POST['password']); // Decode the hashed password
    $tel = $_POST['number'];
    $role = $_POST['role'];

    // Hash the password using a stronger hash function
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert the user data into the database
    $sql = "INSERT INTO usuarios (nombre_usuario, correo_usuario, contrasena_usuario, numero_usuario, id_rol) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("ssssi", $nombre, $email, $hashedPassword, $tel, $role);

        if ($stmt->execute()) {
            $response['success'] = true;
            unset($response['error']);
        } else {
            $response['error'] = 'Error al ejecutar la consulta.';
        }

        $stmt->close();
    } else {
        $response['error'] = 'Error al preparar la consulta.';
    }

    $conexion->close();
} else {
    $response['error'] = 'Método de solicitud no permitido.';
}

echo json_encode($response);
?>
