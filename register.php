<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario</title>
    <link rel="icon" href="./Media/Imagenes/ciaLogo.png" type="image/x-icon">
    <link rel="stylesheet" href="./Visuales/Register/EstilosFormularioRegistro.css">
    <script src="./Backend/FuncionalidadJS/Register/FuncionalidadRegister.js" defer></script>
</head>
<body>
    <div class="register-container" id="mainContent">
        <div class="form-section">
            <div id="error-alert" class="alert"></div>
            <form id="register-form" method="post">
                <div class="input-group">
                    <label for="nombre">Nombre</label>
                    <input type="text" id="nombre" name="nombre" required>
                    <div id="nombre-error" class="error-message"></div>
                </div>
                <div class="input-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" name="email" required>
                    <div id="email-error" class="error-message"></div>
                </div>
                <div class="input-group">
                    <label for="number">Teléfono</label>
                    <input type="number" id="number" name="number" required>
                    <div id="number-error" class="error-message"></div>
                </div>
                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <div class="password-container">
                        <input type="password" id="password" name="password" required>
                        <img src="../../../Media/Iconos/OcultarPassword.png" id="toggle-password" alt="Mostrar Contraseña">
                    </div>
                    <div id="password-error" class="error-message"></div>
                </div>
                <div class="input-group">
                    <label for="role">Rol</label>
                    <select id="role" name="role" required>
                        <option value="1">Promotor</option>
                        <option value="2">Asesor Comercial</option>
                        <option value="3">Administrativo</option>
                    </select>
                    <div id="role-error" class="error-message"></div>
                </div>
                <div class="button-group">
                    <button type="submit" class="register-btn">Registrar</button>
                </div>
                <div id="success-message" class="success-message"></div>
            </form>
        </div>
    </div>
</body>
</html>