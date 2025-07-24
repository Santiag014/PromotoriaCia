<?php
// Cargar variables de entorno
require_once __DIR__ . '/EnvLoader.php';

// Cargar el archivo .env desde la raíz del proyecto
loadEnv(__DIR__ . '/../../.env');

// Datos de conexión desde variables de entorno
$host = env('DB_HOST', 'localhost'); // Servidor
$usuario = env('DB_USER', 'root'); // Usuario
$password = env('DB_PASSWORD', ''); // Contraseña
$base_datos = env('DB_NAME', 'test'); // Base de datos

// Crear la conexión
$conexion = new mysqli($host, $usuario, $password, $base_datos);

// Comprobar la conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// ✅ Establecer zona horaria de PHP desde variable de entorno
date_default_timezone_set(env('TIMEZONE', 'America/Bogota'));

// ✅ Establecer zona horaria solo para esta sesión de MySQL desde variable de entorno
$mysql_timezone = env('MYSQL_TIMEZONE', '-05:00');
$conexion->query("SET time_zone = '$mysql_timezone'");

// ✅ Obtener la hora actual en Bogotá desde PHP (para usarla en tus INSERT, UPDATE, etc.)
$fecha_actual = date('Y-m-d H:i:s');

// Ejemplo opcional para depuración (puedes quitarlo después):
// echo "Hora actual Bogotá desde PHP: " . $fecha_actual;
?>
