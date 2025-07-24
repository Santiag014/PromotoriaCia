<?php
include './Backend/ConexionBD/Conexion.php'; 
// Al principio del script
error_reporting(0); // Esto deshabilitará la salida de errores

ini_set('log_errors', 1);

$response = ['success' => false, 'error' => '', 'redirect' => ''];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $correoUser = isset($_POST['emailUser']) ? $_POST['emailUser'] : null;
    $passwordUser = isset($_POST['ContraseñaUser']) ? $_POST['ContraseñaUser'] : null;

    if ($correoUser !== null && $passwordUser !== null) {
        $consultaLogin = "SELECT usuarios.id, usuarios.nombre_usuario, usuarios.id_rol, usuarios.correo_usuario, usuarios.contrasena_usuario, 
        roles.descripcion FROM usuarios 
        JOIN roles ON usuarios.id_rol = roles.id 
        WHERE usuarios.correo_usuario = ?";        
        
        $stmt = $conexion->prepare($consultaLogin);
        $stmt->bind_param("s", $correoUser);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows == 1) {
            $row = $resultado->fetch_assoc();
            if (password_verify($passwordUser, $row['contrasena_usuario'])) {
                session_start();
                $_SESSION['id'] = $row['id'];
                $_SESSION['nombre_usuario'] = $row['nombre_usuario'];
                $_SESSION['correo_usuario'] = $row['correo_usuario'];
                $_SESSION['id_rol'] = $row['id_rol'];
                $_SESSION['descripcion'] = $row['descripcion'];
                $_SESSION['login_time'] = time(); // Añadir tiempo de inicio de sesión

                $response['success'] = true;
                switch ($row['id_rol']) {
                    case "1":
                        $response['redirect'] = "./Visuales/Promotor/Promotor.php";
                        break;
                    case "2":
                        $response['redirect'] = "./Visuales/Asesor/AsesorComercial.php";
                        break;
                    case "3":
                        $response['redirect'] = "./Visuales/Administrador/Administrador.php";
                        break;
                    case "4":
                        $response['redirect'] = "./Visuales/Administrador/Dashboard.php";
                        break;
                    default:
                        $response['error'] = "Rol de usuario no reconocido";
                        $response['success'] = false;
                }
            } else {
                $response['error'] = "Credenciales Incorrectas";
            }
        } else {
            $response['error'] = "Credenciales Incorrectas";
        }
    } else {
        $response['error'] = "Por favor, completa todos los campos";
    }
} else {
    $response['error'] = "Método de solicitud no válido";
}

echo json_encode($response);
?>