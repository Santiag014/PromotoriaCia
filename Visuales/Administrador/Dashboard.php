<?php
include __DIR__ . "/../../auth.php";
session_start();
// var_dump($_SESSION);
$rol_usuario = isset($_SESSION['id_rol']) ? $_SESSION['id_rol'] : null;
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotoria Compañia</title>
    <link rel="icon" href="../../Media/Imagenes/ciaLogo.png" type="image/x-icon">
    <link rel="stylesheet" href="../../Visuales/Administrador/Estilos/EstilosAdministrador.css">
    <script src="../../Backend/FuncionalidadJS/Administrar/FuncionalidadDash.js" defer></script>
</head>
<body>
    <div class="GridContanier" id="GridContanier">
        <div class="GridHeaderApp">
            <div class="LogoDashboard">
                <img src="../../Media/Imagenes/Cia_Logo.png" alt="Logo">
            </div>
            <div class="HeaderActions">
                <?php if ($rol_usuario == 3): ?>
                <div class="ModulosDashUser" id="btnTurnos" title="Gestionar Turnos" onclick="window.location.href='../../Visuales/Administrador/Administrador.php';">
                    <img src="../../Media/Iconos/informacion.png" alt="turnos-icon" width="20" height="20">
                    <h5>INFORMACIÓN</h5>
                </div>
                <?php endif; ?>
                <?php if ($rol_usuario == 1): ?>
                <div class="ModulosDashUser" id="btnTurnos" title="Gestionar Turnos" onclick="window.location.href='../../Visuales/Promotor/Promotor.php';">
                    <img src="../../Media/Iconos/informacion.png" alt="turnos-icon" width="20" height="20">
                    <h5>INFORMACIÓN</h5>
                </div>
                <?php endif; ?>
                <div class="ModulosDashUser" onclick="window.location.href='../../logout.php'" title="Salir">
                    <img src="../../Media/Iconos/puerta.png" alt="turnos-icon" width="20" height="20">
                    <h5>SALIR</h5>
                </div>
            </div>
        </div>

        <div class="GridContentApp">
            <div class="Dash" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <!-- Iframes -->
                <iframe 
                    id="iframeComercial"
                    class="iframePowerBI active"
                    title="PowerBI Comercial" 
                    src="https://app.powerbi.com/view?r=eyJrIjoiMDJjMTRlNGQtYWE2Ni00MTQyLTgzZDUtZTgyYTJjNzFmN2E3IiwidCI6Ijk2OWUxYWZhLTM2YWItNGQ5ZS1iYmM2LWU5Y2U3ZWE0N2U5OSIsImMiOjR9"
                    frameborder="0" 
                    allowFullScreen="true"
                    style="width: 97vw; height: 90vh; display: block; margin: auto;">
                </iframe>
                <iframe 
                    id="iframeProduccion"
                    class="iframePowerBI"
                    title="PowerBI Producción" 
                    src="https://app.powerbi.com/view?r=eyJrIjoiZjUyNTc5NDQtNjg0NS00MDE0LWE2ZmQtN2RiMTdhODQwMjQyIiwidCI6Ijk2OWUxYWZhLTM2YWItNGQ5ZS1iYmM2LWU5Y2U3ZWE0N2U5OSIsImMiOjR9"
                    frameborder="0" 
                    allowFullScreen="true"
                    style="width: 97vw; height: 90vh; display: none; margin: auto;">
                </iframe>

                <?php if ($rol_usuario == 3): ?>
                <!-- Toggle Switch -->
                <div id="toggleSwitch_2" class="toggle-switch_2" style="margin-top: 30px;">
                    <span class="option comercial active" data-opcion="comercial">Ejecucción</span>
                    <span class="option produccion" data-opcion="produccion">Ventas</span>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>
