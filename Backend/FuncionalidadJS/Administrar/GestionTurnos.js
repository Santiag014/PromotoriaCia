// Variables globales
const modal = document.getElementById("modalTurnos");
const btnTurnos = document.getElementById("btnTurnos");
const span = document.getElementsByClassName("close")[0];
const formTurnos = document.getElementById("formTurnos");

// Control de carga para evitar cargas duplicadas
let datosYaCargados = false;

// Evento para abrir el modal
if (btnTurnos) {
    btnTurnos.addEventListener("click", () => {
        modal.style.display = "block";
        // Resetear el control de carga cada vez que se abre el modal
        datosYaCargados = false;
        cargarDatos();
        
        // Inicializar Select2 después de que aparezca el modal
        setTimeout(() => {
            try {
                $('.select2-search').select2({
                    placeholder: "Buscar...",
                    allowClear: true,
                    width: '100%'
                });
            } catch (error) {
                console.error('Error al inicializar Select2:', error);
            }
        }, 300); // Un poco más de tiempo para asegurar que todo esté cargado
    });
}

// Evento para cerrar el modal con la X
span.onclick = function() {
    cerrarModal();
}

// Cerrar el modal si se hace click fuera de él
window.onclick = function(event) {
    if (event.target == modal) {
        cerrarModal();
    }
}

// Función para cerrar el modal
function cerrarModal() {
    modal.style.display = "none";
    formTurnos.reset();
    
    // Limpiar contenedores de información adicional
    document.getElementById('ubicacion_container').innerHTML = '';
    document.getElementById('ciudad_input').value = '';
    document.getElementById('canal_input').value = '';
    document.getElementById('nombre_asesor_input').value = '';
    
    // Destruir instancias de Select2
    $('.select2-search').select2('destroy');
}

// Función para cargar todos los datos necesarios para el formulario
async function cargarDatos() {
    // Evitar cargas duplicadas si ya se cargaron los datos en esta sesión del modal
    if (datosYaCargados) {
        console.log("Los datos ya fueron cargados, omitiendo carga duplicada");
        return;
    }
    
    mostrarCargandoTabla();
    try {
        // Verificar si estamos en la página de administrador
        if (!document.getElementById('formTurnos')) {
            console.warn("No se encontró el formulario de turnos. Omitiendo carga de datos.");
            return;
        }
        
        // Ejecutar cada carga por separado para que si una falla, las otras continúen
        const cargas = [];
        
        // Actualizar progreso manualmente para cada paso
        actualizarProgreso(25, 'Cargando promotoras...');
        if (typeof cargarPromotoras === 'function') {
            cargas.push(cargarPromotoras().catch(e => console.error("Error al cargar promotoras:", e)));
        }
        
        actualizarProgreso(50, 'Cargando puntos de venta...');
        if (typeof cargarPuntosVenta === 'function') {
            cargas.push(cargarPuntosVenta().catch(e => console.error("Error al cargar puntos de venta:", e)));
        }
        
        actualizarProgreso(75, 'Cargando asesores comerciales...');
        if (typeof cargarAsesores === 'function') {
            cargas.push(cargarAsesores().catch(e => console.error("Error al cargar asesores:", e)));
        }
        
        if (cargas.length > 0) {
            await Promise.all(cargas);
        }
        
        actualizarProgreso(95, 'Configurando interfaz...');
        
        // Marcar los datos como cargados para evitar cargas duplicadas
        datosYaCargados = true;

        // Inicializar todos los Select2 después de cargar los datos
        setTimeout(() => {
            $('.select2-search').each(function() {
                // Destruir si ya existe
                if ($(this).hasClass('select2-hidden-accessible')) {
                    $(this).select2('destroy');
                }
                
                // Inicializar con opciones mejoradas
                $(this).select2({
                    placeholder: "Buscar...",
                    allowClear: true,
                    width: '100%',
                    language: {
                        noResults: function() {
                            return "No se encontraron resultados";
                        },
                        searching: function() {
                            return "Buscando...";
                        }
                    }
                });
            });
            
            actualizarProgreso(100, 'Datos cargados exitosamente');
        }, 100);
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        // alert("Hubo un error al cargar los datos. Por favor, intente de nuevo.");
    } finally {
        setTimeout(() => {
            ocultarCargando();
        }, 800);
    }
}

// Función para cargar las promotoras
async function cargarPromotoras() {
    try {
        const response = await fetch('../../Backend/FuncionalidadPHP/Administrador/get_promotoras.php');
        const data = await response.json();
        
        // Destruir Select2 si ya existe
        if ($('#promotora').hasClass('select2-hidden-accessible')) {
            $('#promotora').select2('destroy');
        }
        
        const selectPromotora = document.getElementById('promotora');
        selectPromotora.innerHTML = '<option value="">Seleccionar Promotora</option>';
        
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nombre;
            selectPromotora.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar promotoras:', error);
        throw error;
    }
}

// Evento para cargar puntos de venta y manejar selecciones
document.addEventListener('DOMContentLoaded', function() {
    // NO cargar puntos de venta al cargar la página, esperar al modal
    // cargarPuntosVenta(); <- Eliminado
    
    // Evento para cuando se selecciona un punto de venta
    $('#punto_venta').on('change', function() {
        if (this.value) {
            // Usar el endpoint para cargar la información detallada del PDV
            cargarInfoPuntoVenta(this.value);
        } else {
            document.getElementById('direccion_input').value = '';
            document.getElementById('ubicacion_container').innerHTML = '';
            document.getElementById('ciudad_input').value = '';
            document.getElementById('canal_input').value = '';
        }
    });
    
    // Evento para el asesor comercial
    $('#asesor_comercial').on('change', function() {
        if (this.value) {
            cargarInfoAsesor(this.value);
        } else {
            document.getElementById('nombre_asesor_input').value = '';
        }
    });
    
    // Campo oculto para nombre de la actividad (rellenado según el select)
    let inputNombreActividad = document.getElementById('nombre_actividad');
    if (!inputNombreActividad) {
        inputNombreActividad = document.createElement('input');
        inputNombreActividad.type = 'hidden';
        inputNombreActividad.id = 'nombre_actividad';
        inputNombreActividad.name = 'nombre_actividad';
        document.getElementById('formTurnos').appendChild(inputNombreActividad);
    }
    const selectActividad = document.getElementById('tipo_actividad');
    if (selectActividad) {
        // Inicializar el valor oculto al cargar la página
        if (selectActividad.selectedIndex > 0) {
            inputNombreActividad.value = selectActividad.options[selectActividad.selectedIndex].text;
        } else {
            inputNombreActividad.value = '';
        }
        selectActividad.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex]?.text || '';
            document.getElementById('nombre_actividad').value = selectedText;
        });
    }

    // Campo oculto para nombre de la marca
    let inputNombreMarca = document.getElementById('nombre_marca');
    if (!inputNombreMarca) {
        inputNombreMarca = document.createElement('input');
        inputNombreMarca.type = 'hidden';
        inputNombreMarca.id = 'nombre_marca';
        inputNombreMarca.name = 'nombre_marca';
        document.getElementById('formTurnos').appendChild(inputNombreMarca);
    }
    const selectMarca = document.getElementById('marca');
    if (selectMarca) {
        selectMarca.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex]?.text || '';
            document.getElementById('nombre_marca').value = selectedText;
        });
    }
});

// Función para cargar todos los puntos de venta
async function cargarPuntosVenta() {
    try {
        mostrarCargandoConProgreso('Cargando puntos de venta...', 'processing', [
            { message: 'Conectando con el servidor...', percent: 20 },
            { message: 'Obteniendo puntos de venta...', percent: 60 },
            { message: 'Configurando lista...', percent: 90 },
            { message: 'Puntos de venta cargados', percent: 100 }
        ]);
        
        const response = await fetch(`../../Backend/FuncionalidadPHP/Administrador/get_puntos_venta.php`);
        const data = await response.json();
        
        // Destruir y recrear el Select2
        if ($('#punto_venta').hasClass('select2-hidden-accessible')) {
            $('#punto_venta').select2('destroy');
        }
        
        const selectPdv = document.getElementById('punto_venta');
        selectPdv.innerHTML = '<option value="">Seleccionar Punto de Venta</option>';
        
        // Mostrar todos los puntos de venta disponibles
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nombre;
            selectPdv.appendChild(option);
        });
        
        // Reinicializar Select2
        $('#punto_venta').select2({
            placeholder: "Buscar punto de venta...",
            allowClear: true,
            width: '100%'
        });
        
    } catch (error) {
        console.error('Error al cargar puntos de venta:', error);
        alert('Error al cargar los puntos de venta');
    } finally {
        setTimeout(() => {
            ocultarCargando();
        }, 500);
    }
}

// Función para cargar información del asesor comercial
async function cargarInfoAsesor(id_asesor) {
    if (!id_asesor) return;
    
    try {
        // Los datos del asesor ya están cargados en el select, buscamos el que coincide con el ID
        const selectAsesor = document.getElementById('asesor_comercial');
        const selectedOption = selectAsesor.options[selectAsesor.selectedIndex];
        const telefonoInput = document.getElementById('nombre_asesor_input');
        
        // Encontrar el asesor en los datos originales
        const asesores = await fetch('../../Backend/FuncionalidadPHP/Administrador/get_asesores.php').then(r => r.json());
        const asesor = asesores.find(a => a.id == id_asesor);
        
        if (asesor && asesor.telefono) {
            telefonoInput.value = asesor.telefono;
        } else {
            telefonoInput.value = 'Teléfono no disponible';
        }
    } catch (error) {
        console.error('Error al obtener información del asesor:', error);
        document.getElementById('nombre_asesor_input').value = 'Error al cargar la información';
    }
}

// Función para cargar los asesores comerciales
async function cargarAsesores() {
    try {
        const response = await fetch('../../Backend/FuncionalidadPHP/Administrador/get_asesores.php');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verificar que los datos sean un array
        if (!Array.isArray(data)) {
            console.error('Los datos recibidos no son un array:', data);
            throw new Error('Formato de datos incorrecto');
        }
        
        // Destruir Select2 si ya existe
        if ($('#asesor_comercial').hasClass('select2-hidden-accessible')) {
            $('#asesor_comercial').select2('destroy');
        }
        
        const selectAsesor = document.getElementById('asesor_comercial');
        selectAsesor.innerHTML = '<option value="">Seleccionar Asesor</option>';
        
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nombre;
            selectAsesor.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar asesores:', error);
        
        // Añadir una opción por defecto para evitar errores
        const selectAsesor = document.getElementById('asesor_comercial');
        if (selectAsesor) {
            selectAsesor.innerHTML = '<option value="">Error al cargar asesores</option>';
        }
        
        throw error;
    }
}

function cargarTiposActividad(selectElementId) {
    // Si no se proporciona ID, usar 'tipo_actividad' por defecto
    if (!selectElementId) {
        selectElementId = 'tipo_actividad';
    }
    
    const selectElement = document.getElementById(selectElementId);
    
    // Si el elemento no existe, salir sin error
    if (!selectElement) {
        console.warn(`No se encontró el elemento con ID: ${selectElementId}, continuando sin error`);
        return Promise.resolve(); // Devolver una promesa resuelta para no romper cadenas de promesas
    }
    
    // Mostrar indicador de carga si existe
    if (typeof mostrarCargando === 'function') mostrarCargando();
    
    // Realizar petición AJAX para obtener los tipos de actividad
    fetch('../../Backend/FuncionalidadPHP/Administrador/get_tipos_actividad.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener tipos de actividad');
            }
            return response.json();
        })
        .then(data => {
            console.log("Tipos de actividad recibidos:", data);
            
            // Limpiar opciones existentes
            selectElement.innerHTML = '<option value="">Seleccione un tipo de actividad</option>';
            
            // Agregar nuevas opciones
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo.id;
                    option.textContent = tipo.descripcion;
                    selectElement.appendChild(option);
                });
                
                // Aplicar destaque visual para mostrar que se ha actualizado
                selectElement.classList.add('campo-actualizado');
                setTimeout(() => selectElement.classList.remove('campo-actualizado'), 1000);
                
                // Si el elemento tiene la clase select2, inicializar o actualizar select2
                if (selectElement.classList.contains('select2-hidden-accessible')) {
                    $(selectElement).select2('destroy').select2();
                } else if (typeof $(selectElement).select2 === 'function') {
                    $(selectElement).select2();
                }
            } else {
                // Si no hay datos, mostrar mensaje
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No hay tipos de actividad disponibles";
                selectElement.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error al cargar tipos de actividad:', error);
            
            // Mostrar mensaje de error
            selectElement.innerHTML = '<option value="">Error al cargar tipos de actividad</option>';
        })
        .finally(() => {
            // Ocultar indicador de carga
            if (typeof ocultarCargando === 'function') ocultarCargando();
        });
}

// Manejar el envío del formulario
formTurnos.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formTurnos.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
    }

    const formData = new FormData(formTurnos);

    // ACTUALIZAR el campo oculto con el texto seleccionado antes de enviar
    const selectActividad = document.getElementById('tipo_actividad');
    const inputNombreActividad = document.getElementById('nombre_actividad');
    if (selectActividad && inputNombreActividad) {
        inputNombreActividad.value = selectActividad.options[selectActividad.selectedIndex]?.text || '';
    }

    try {
        mostrarCargandoGuardarTurno();
        
        const response = await fetch('../../Backend/FuncionalidadPHP/Administrador/guardar_turno.php', {
            method: 'POST',
            body: formData
        });

        // Actualizar progreso mientras se procesa
        setTimeout(() => actualizarProgreso(60, 'Enviando datos al servidor...'), 300);
        setTimeout(() => actualizarProgreso(85, 'Procesando en base de datos...'), 600);

        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            // Si la respuesta no es JSON válida, mostrar error
            alert('Error inesperado del servidor. No se pudo procesar la respuesta.');
            console.error('Respuesta no es JSON:', jsonError);
            return;
        }

        if (response.ok && result && result.success) {
            actualizarProgreso(100, 'Turno guardado exitosamente');
            setTimeout(() => {
                alert('Turno guardado con éxito.');
                cerrarModal();
                // Recargar la tabla automáticamente
                if (typeof cargarDatosTabla === 'function') {
                    cargarDatosTabla();
                }
            }, 800);
        } else {
            // Construir un mensaje de error más detallado
            let mensajeError = `Error al guardar el turno: ${result && result.error ? result.error : 'Error desconocido'}`;

            if (result && result.campos_faltantes && result.campos_faltantes.length) {
                mensajeError += `\n\nCampos faltantes: ${result.campos_faltantes.join(', ')}`;
            }

            if (result && result.valores_recibidos) {
                console.log('Valores recibidos:', result.valores_recibidos);
                const camposInvalidos = Object.entries(result.valores_recibidos)
                    .filter(([key, value]) => !value || value <= 0)
                    .map(([key]) => key);
                if (camposInvalidos.length) {
                    console.warn('Campos con valores inválidos:', camposInvalidos);
                }
            }

            alert(mensajeError);
        }
    } catch (error) {
        console.error('Error al guardar el turno:', error);
        alert('Hubo un error al procesar su solicitud. Por favor, revise la consola para más detalles e intente de nuevo.');
    } finally {
        setTimeout(() => {
            ocultarCargando();
        }, 1000);
    }
});

// Funciones para mostrar y ocultar el indicador de carga
function mostrarCargando() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function ocultarCargando() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Establecer fecha mínima para el campo de fecha de actividad (hoy en adelante)
const fechaActividad = document.getElementById('fecha_actividad');
const hoy = new Date();
const fechaFormateada = hoy.toISOString().split('T')[0];
fechaActividad.min = fechaFormateada;

// Inicializar el formulario
document.addEventListener('DOMContentLoaded', () => {
    // Reiniciar el formulario al cargar la página
    formTurnos.reset();
});