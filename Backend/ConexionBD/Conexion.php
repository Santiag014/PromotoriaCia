<?php
// Datos de conexión
$host = '82.197.82.139'; // Servidor
$usuario = 'u716541625_promotoria_cia'; // Usuario
$password = '&6lLy53;ooS'; // Contraseña
$base_datos = 'u716541625_promotoria_cia'; // Base de datos

// Crear la conexión
$conexion = new mysqli($host, $usuario, $password, $base_datos);

// Comprobar la conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// ✅ Establecer zona horaria de PHP a Bogotá
date_default_timezone_set('America/Bogota');

// ✅ Establecer zona horaria solo para esta sesión de MySQL a Bogotá
$conexion->query("SET time_zone = '-05:00'");

// ✅ Obtener la hora actual en Bogotá desde PHP (para usarla en tus INSERT, UPDATE, etc.)
$fecha_actual = date('Y-m-d H:i:s');

// Ejemplo opcional para depuración (puedes quitarlo después):
// echo "Hora actual Bogotá desde PHP: " . $fecha_actual;
?>
