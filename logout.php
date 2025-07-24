<?php
// Iniciar la sesión
session_start();

// Limpiar todas las variables de la sesión
session_unset();

// Destruir la sesión
session_destroy();

// Redirigir al usuario a la página de login o inicio
header("Location: index.php");  // Cambia a la página que desees
exit();
?>
