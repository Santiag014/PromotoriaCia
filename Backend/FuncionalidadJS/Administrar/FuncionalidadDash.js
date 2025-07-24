function RedirigirLogin() { window.location.href = '../../logout.php'; }
function Calendario() { window.location.href = '../../../Visuales/Administrador/Dashboard.php'; }

function cambiarIframe(opcion) {
    const iframes = document.querySelectorAll('.iframePowerBI');
    const options = document.querySelectorAll('#toggleSwitch_2 .option');

    // Oculta todos los iframes y quita la clase activa
    iframes.forEach(iframe => {
        iframe.classList.remove('active');
        iframe.style.display = 'none';
    });
    options.forEach(optionEl => optionEl.classList.remove('active'));

    // Muestra el iframe correspondiente y marca la opción activa
    const iframe = document.getElementById(`iframe${capitalizeFirstLetter(opcion)}`);
    const selectedOption = document.querySelector(`#toggleSwitch_2 .option[data-opcion="${opcion}"]`);

    if (iframe && selectedOption) {
        iframe.classList.add('active');
        iframe.style.display = 'block';
        selectedOption.classList.add('active');
    } else {
        console.error(`No se encontró el iframe u opción para: ${opcion}`);
    }
}

// Función para capitalizar la primera letra de una palabra
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Asignar eventos a las opciones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('toggleSwitch_2');
    if (toggle) {
        const options = toggle.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const opcion = option.getAttribute('data-opcion');
                cambiarIframe(opcion);
            });
        });
        // Cargar iframe por defecto
        cambiarIframe('comercial');
    } else {
        // Si no hay toggle, muestra solo el primer iframe
        const iframeComercial = document.getElementById('iframeComercial');
        const iframeProduccion = document.getElementById('iframeProduccion');
        if (iframeComercial) iframeComercial.style.display = 'block';
        if (iframeProduccion) iframeProduccion.style.display = 'none';
    }
});
