<?php
/**
 * Inclusión universal del gestor de sesiones
 * Este archivo debe ser incluido en todas las páginas que requieren autenticación
 */

// Función para determinar la ruta base según la ubicación del archivo actual
function getBasePath() {
    $currentPath = $_SERVER['PHP_SELF'];
    $depth = substr_count($currentPath, '/') - 1;
    
    if ($depth <= 1) {
        // Estamos en la raíz o un nivel abajo
        return './Backend/FuncionalidadJS/';
    } elseif (strpos($currentPath, '/Visuales/') !== false) {
        // Estamos en alguna carpeta de Visuales
        return '../../Backend/FuncionalidadJS/';
    } else {
        // Por defecto, asumir que necesitamos subir dos niveles
        return '../../Backend/FuncionalidadJS/';
    }
}

$basePath = getBasePath();
?>

<!-- Estilos del gestor de sesiones -->
<link rel="stylesheet" href="<?php echo $basePath; ?>session-styles.css">

<!-- Script del gestor de sesiones -->
<script src="<?php echo $basePath; ?>session-manager.js"></script>

<script>
// Configuración adicional para diferentes roles y rutas
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en una página que requiere autenticación
    const currentPath = window.location.pathname;
    const protectedPaths = ['/Visuales/', '/Dashboard', '/Administrador', '/Promotor', '/Asesor'];
    
    const isProtectedPage = protectedPaths.some(path => currentPath.includes(path));
    
    if (isProtectedPage && typeof sessionManager !== 'undefined') {
        console.log('Gestor de sesiones iniciado para página protegida');
        
        // Configurar rutas específicas según el rol o ubicación
        if (currentPath.includes('/Administrador/')) {
            sessionManager.loginPath = '../../index.php';
        } else if (currentPath.includes('/Promotor/')) {
            sessionManager.loginPath = '../../index.php';
        } else if (currentPath.includes('/Asesor/')) {
            sessionManager.loginPath = '../../index.php';
        }
    }
});

// Función global para cerrar sesión manualmente
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar la sesión?')) {
        fetch('/logout.php', {
            method: 'POST',
            credentials: 'same-origin'
        }).then(() => {
            window.location.href = '/index.php';
        }).catch(() => {
            // En caso de error, redirigir de todas formas
            window.location.href = '/index.php';
        });
    }
}
</script>

<?php
// También incluir una verificación básica del lado del servidor
// (esto es adicional al JavaScript, para mayor seguridad)

// Importar configuración de sesiones
require_once __DIR__ . '/../ConexionBD/SessionConfig.php';

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

$tiempo_limite = getSessionTimeout(); // Usar configuración centralizada

if (isset($_SESSION['login_time'])) {
    $duracion_sesion = time() - $_SESSION['login_time'];
    if ($duracion_sesion > $tiempo_limite) {
        // Si detectamos expiración del lado del servidor, limpiar y redirigir
        session_unset();
        session_destroy();
        
        // JavaScript para mostrar el popup antes de redirigir
        echo '<script>
            document.addEventListener("DOMContentLoaded", function() {
                if (typeof sessionManager !== "undefined") {
                    sessionManager.showSessionExpiredPopup();
                } else {
                    // Fallback si el sessionManager no está disponible
                    alert("Su sesión ha expirado. Será redirigido al login.");
                    window.location.href = "/index.php";
                }
            });
        </script>';
        exit();
    } else {
        // Actualizar tiempo de sesión
        $_SESSION['login_time'] = time();
    }
}
?>
