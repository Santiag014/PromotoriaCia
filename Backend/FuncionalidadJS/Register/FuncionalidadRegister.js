document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('register-form');
    var alertDiv = document.getElementById('error-alert');
    var successMessage = document.getElementById('success-message');
    var togglePassword = document.getElementById('toggle-password');
    var passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.src = '../../../Media/Iconos/MostrarPassword.png'; // Cambiar ícono
        } else {
            passwordInput.type = 'password';
            togglePassword.src = '../../../Media/Iconos/OcultarPassword.png'; // Cambiar ícono
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(form);
        var password = formData.get('password');

        // Validar la contraseña
        var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordPattern.test(password)) {
            alertDiv.style.display = 'block';
            alertDiv.textContent = 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra minúscula, una letra mayúscula, un número y un carácter especial.';
            return;
        }

        var hashedPassword = btoa(password); // Simple hash, replace with a stronger hash function

        formData.set('password', hashedPassword);

        fetch('./Backend/FuncionalidadPHP/Register/RegisterUser.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                successMessage.style.display = 'block';
                successMessage.textContent = 'Usuario registrado exitosamente.';
                form.reset();
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