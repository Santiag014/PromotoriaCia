// Función para cargar la información del punto de venta seleccionado
function cargarInfoPuntoVenta(id_punto_venta) {
    if (!id_punto_venta) return;

    // Mostrar indicador de carga simple
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        const messageElement = document.getElementById('loadingMessage');
        if (messageElement) {
            messageElement.textContent = 'Cargando punto de venta...';
        }
        spinner.style.display = 'flex';
    }

    // Realizar una petición AJAX para obtener los datos del punto de venta
    fetch(`../../Backend/FuncionalidadPHP/Administrador/get_info_punto_venta.php?id_punto_venta=${id_punto_venta}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener información del punto de venta');
            }
            return response.json();
        })
        .then(data => {
            // Verificar que tenemos un elemento donde escribir los datos
            const direccionInput = document.getElementById('direccion_input');
            const ubicacionContainer = document.getElementById('ubicacion_container');
            const ciudadInput = document.getElementById('ciudad_input');
            const canalInput = document.getElementById('canal_input');
            
            console.log("Datos del punto de venta recibidos:", data);
            
            // Rellenar los campos con la información obtenida si existen
            if (direccionInput) {
                direccionInput.value = data.direccion || '';
                // Aplicar destaque visual para mostrar que se ha actualizado
                direccionInput.classList.add('campo-actualizado');
                setTimeout(() => direccionInput.classList.remove('campo-actualizado'), 1000);
            }
            
            // Para la ubicación (Google Maps)
            if (ubicacionContainer) {
                if (data.ubicacion && data.ubicacion.trim() !== '') {
                    // Usar la URL optimizada que viene del backend o crear una si no existe
                    let ubicacionUrl = data.ubicacion_url || data.ubicacion;
                    if (!ubicacionUrl.startsWith('http')) {
                        // Si no es un enlace, crear uno de Google Maps basado en la dirección
                        const direccion = encodeURIComponent(data.direccion + ", " + data.ciudad_nombre);
                        ubicacionUrl = `https://www.google.com/maps/search/?api=1&query=${direccion}`;
                    }
                    
                    ubicacionContainer.innerHTML = `
                        <a href="${ubicacionUrl}" target="_blank" class="map-link">
                            <i class="fas fa-map-marker-alt"></i> Ver ubicación en Google Maps
                        </a>
                    `;
                    // Agregar clase para animación de actualización
                    ubicacionContainer.classList.add('campo-actualizado');
                    setTimeout(() => ubicacionContainer.classList.remove('campo-actualizado'), 1000);
                } else {
                    ubicacionContainer.innerHTML = '<span class="no-disponible">No disponible</span>';
                }
            }
            
            // Mostrar información de ciudad y canal
            if (ciudadInput) {
                // Usar directamente el valor de ciudad para mostrar
                ciudadInput.value = data.ciudad || '';
                // Aplicar destaque visual
                ciudadInput.classList.add('campo-actualizado');
                setTimeout(() => ciudadInput.classList.remove('campo-actualizado'), 1000);
                
                // También actualizar el campo oculto con el ID
                const ciudadHidden = document.getElementById('ciudad');
                if (ciudadHidden) {
                    ciudadHidden.value = data.ciudad || '';
                }
            }
            
            if (canalInput) {
                // Usar directamente el valor de canal para mostrar
                canalInput.value = data.canal || '';
                // Aplicar destaque visual
                canalInput.classList.add('campo-actualizado');
                setTimeout(() => canalInput.classList.remove('campo-actualizado'), 1000);
                
                // También actualizar el campo oculto con el ID
                const canalHidden = document.getElementById('canal');
                if (canalHidden) {
                    canalHidden.value = data.canal || '';
                }
            }
            
            console.log("PDV cargado exitosamente:", data.nombre);
        })
        .catch(error => {
            console.error('Error al cargar punto de venta:', error);
            
            // Mostrar mensaje en los campos
            const direccionInput = document.getElementById('direccion_input');
            const ubicacionContainer = document.getElementById('ubicacion_container');
            const ciudadInput = document.getElementById('ciudad_input');
            const canalInput = document.getElementById('canal_input');
            
            if (direccionInput) direccionInput.value = 'Error al cargar información';
            if (ubicacionContainer) ubicacionContainer.innerHTML = '<span class="error-texto">Error al cargar ubicación</span>';
            if (ciudadInput) ciudadInput.value = 'Error al cargar información';
            if (canalInput) canalInput.value = 'Error al cargar información';
        })
        .finally(() => {
            // Ocultar indicador de carga
            if (typeof ocultarCargando === 'function') ocultarCargando();
            // También ocultar cualquier spinner que pueda estar activo
            const spinner = document.getElementById('loadingSpinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
        });
}
