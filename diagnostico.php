<?php
// Archivo de diagnóstico - diagnostico.php
echo "<h1>🔍 Diagnóstico del Sistema</h1>";

// 1. Verificar si el archivo .env existe
echo "<h2>1. Verificación del archivo .env:</h2>";
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    echo "✅ Archivo .env EXISTE<br>";
    echo "📍 Ubicación: " . $envPath . "<br>";
} else {
    echo "❌ Archivo .env NO EXISTE<br>";
    echo "📍 Buscado en: " . $envPath . "<br>";
}

// 2. Intentar cargar variables de entorno
echo "<h2>2. Carga de variables de entorno:</h2>";
try {
    require_once __DIR__ . '/Backend/ConexionBD/EnvLoader.php';
    if (file_exists($envPath)) {
        loadEnv($envPath);
        echo "✅ Variables cargadas correctamente<br>";
    } else {
        echo "❌ No se pueden cargar variables - archivo .env no existe<br>";
    }
} catch (Exception $e) {
    echo "❌ Error al cargar EnvLoader: " . $e->getMessage() . "<br>";
}

// 3. Verificar variables individuales
echo "<h2>3. Variables de entorno:</h2>";
$variables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
foreach ($variables as $var) {
    $value = getenv($var) ?: ($_ENV[$var] ?? 'NO DEFINIDA');
    if ($var === 'DB_PASSWORD') {
        $value = $value === 'NO DEFINIDA' ? 'NO DEFINIDA' : '***OCULTA***';
    }
    echo "$var: $value<br>";
}

// 4. Intentar conexión a la base de datos
echo "<h2>4. Prueba de conexión a BD:</h2>";
try {
    $host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? '82.197.82.139');
    $usuario = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'u716541625_promotoria_cia');
    $password = getenv('DB_PASSWORD') ?: ($_ENV['DB_PASSWORD'] ?? '&6lLy53;ooS');
    $base_datos = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'u716541625_promotoria_cia');
    
    echo "Intentando conectar con:<br>";
    echo "Host: $host<br>";
    echo "Usuario: $usuario<br>";
    echo "BD: $base_datos<br>";
    
    $conexion = new mysqli($host, $usuario, $password, $base_datos);
    
    if ($conexion->connect_error) {
        echo "❌ Error de conexión: " . $conexion->connect_error . "<br>";
    } else {
        echo "✅ Conexión exitosa a la base de datos<br>";
        $conexion->close();
    }
} catch (Exception $e) {
    echo "❌ Excepción en conexión: " . $e->getMessage() . "<br>";
}

// 5. Información del servidor
echo "<h2>5. Información del servidor:</h2>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'No disponible') . "<br>";
echo "Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'No disponible') . "<br>";
echo "Current Directory: " . __DIR__ . "<br>";

// 6. Listar archivos en el directorio
echo "<h2>6. Archivos en el directorio actual:</h2>";
$files = scandir(__DIR__);
foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        echo "$file<br>";
    }
}

echo "<h2>✅ Diagnóstico Completo</h2>";
echo "<p><strong>Sube este archivo como 'diagnostico.php' a tu servidor y accede desde el navegador.</strong></p>";
?>
