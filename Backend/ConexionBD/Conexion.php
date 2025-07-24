<?php
// Cargar variables de entorno
require_once __DIR__ . '/EnvLoader.php';

// SIEMPRE cargar el archivo .env - OBLIGATORIO para seguridad
$envPath = __DIR__ . '/../../.env';
if (!file_exists($envPath)) {
    die("
    <div style='color: red; font-family: Arial; padding: 20px; border: 2px solid red; margin: 20px;'>
        <h2>❌ Error de Configuración</h2>
        <p><strong>El archivo .env es obligatorio para la seguridad.</strong></p>
        <p>Por favor:</p>
        <ol>
            <li>Copia el archivo <code>.env.example</code> a <code>.env</code></li>
            <li>Configura tus credenciales de base de datos en el archivo <code>.env</code></li>
            <li>Nunca subas el archivo <code>.env</code> al repositorio</li>
        </ol>
        <p><strong>Comando:</strong> <code>copy .env.example .env</code></p>
    </div>
    ");
}

loadEnv($envPath);

// Datos de conexión SOLO desde variables de entorno
$host = env('DB_HOST');
$usuario = env('DB_USER');
$password = env('DB_PASSWORD');
$base_datos = env('DB_NAME');

// Validar que todas las credenciales estén configuradas
if (!$host || !$usuario || !$password || !$base_datos) {
    die("
    <div style='color: red; font-family: Arial; padding: 20px; border: 2px solid red; margin: 20px;'>
        <h2>❌ Error de Configuración</h2>
        <p><strong>Faltan credenciales en el archivo .env</strong></p>
        <p>Asegúrate de que tu archivo .env tenga:</p>
        <pre>
DB_HOST=tu_servidor
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_datos
        </pre>
    </div>
    ");
}

// Crear la conexión
$conexion = new mysqli($host, $usuario, $password, $base_datos);

// Comprobar la conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// ✅ Establecer zona horaria de PHP desde variable de entorno o por defecto
$timezone = isset($_ENV['TIMEZONE']) ? $_ENV['TIMEZONE'] : 'America/Bogota';
date_default_timezone_set($timezone);

// ✅ Establecer zona horaria solo para esta sesión de MySQL desde variable de entorno o por defecto
$mysql_timezone = isset($_ENV['MYSQL_TIMEZONE']) ? $_ENV['MYSQL_TIMEZONE'] : '-05:00';
$conexion->query("SET time_zone = '$mysql_timezone'");

// ✅ Obtener la hora actual en Bogotá desde PHP (para usarla en tus INSERT, UPDATE, etc.)
$fecha_actual = date('Y-m-d H:i:s');

// Ejemplo opcional para depuración (puedes quitarlo después):
// echo "Hora actual Bogotá desde PHP: " . $fecha_actual;
?>
