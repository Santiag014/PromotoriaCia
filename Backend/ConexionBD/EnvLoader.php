<?php
/**
 * Función para cargar variables de entorno desde archivo .env
 */
function loadEnv($path = '.env') {
    // Verificar si el archivo .env existe
    if (!file_exists($path)) {
        die("Error: No se encontró el archivo .env en la ruta: " . $path);
    }
    
    // Leer el archivo línea por línea
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        // Ignorar comentarios
        if (strpos($line, '#') === 0) {
            continue;
        }
        
        // Dividir por el signo igual
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            
            // Limpiar espacios
            $key = trim($key);
            $value = trim($value);
            
            // Remover comillas si las tiene
            if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                $value = substr($value, 1, -1);
            }
            
            // Establecer la variable de entorno
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

/**
 * Función para obtener variable de entorno con valor por defecto
 */
function env($key, $default = null) {
    $value = getenv($key);
    if ($value === false) {
        $value = $_ENV[$key] ?? $default;
    }
    return $value;
}
?>
