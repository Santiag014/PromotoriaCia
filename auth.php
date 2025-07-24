<?php
session_start();

$tiempo_limite = 1800; // 30 minutos para finalizar sesión

if (isset($_SESSION['login_time'])) {
    $duracion_sesion = time() - $_SESSION['login_time'];
    if ($duracion_sesion > $tiempo_limite) {
        session_unset();
        session_destroy();
        header("Location: /index.php");
        exit();
    } else {
        $_SESSION['login_time'] = time(); // Reiniciar el tiempo de sesión
    }
} else {
    header("Location: /index.php");
    exit();
}
?>