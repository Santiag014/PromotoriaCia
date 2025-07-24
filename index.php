<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotoria Compañia</title>
    <link rel="icon" href="./Media/Imagenes/ciaLogo.png" type="image/x-icon">
    <link rel="stylesheet" href="./Visuales/Login/Estilos/EstilosFormulario.css">
</head>
<body>
    <div class="login-container" id="mainContent">
        <div class="form-section">
            <div id="error-alert" class="alert"></div>
            <form id="login-form" method="post">
                <div class="logo-container">
                    <img src="./Media/Imagenes/Cia_Logo.png" alt="" class="LogoLogin">
                </div>
                <!-- <h2 class="inicio-seccion">Inicia Sesión</h2> -->
                <div class="input-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" name="emailUser" required>
                    <div id="email-error" class="error-message"></div>
                </div>
                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="ContraseñaUser" required>
                    <div id="password-error" class="error-message"></div>
                </div>
                <div class="button-group">
                    <button type="submit" class="signin-btn">Sign In</button>
                </div>
                <div id="reset-message" class="success-message"></div>
            </form>
        </div>
    </div>

    <div id="overlay" class="overlay"></div>

    <div id="customAlert" class="custom-alert">
        <h3>¿Olvidaste tu contraseña?</h3>
        <p>Por favor, Contactate con Data para Restablecer tu contraseña.</p>
        <button onclick="cerrarAlerta()">Cerrar</button>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var form = document.getElementById('login-form');
        var alertDiv = document.getElementById('error-alert');

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            var formData = new FormData(form);

            fetch('./Login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    alertDiv.style.display = 'block';
                    alertDiv.textContent = data.error;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alertDiv.style.display = 'block';
                alertDiv.textContent = 'Ocurrió un error. Por favor, intenta de nuevo.';
            });
        });
    });
    </script>
</body>
</html>