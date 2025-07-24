// Variables globales
let allData = [];
let filteredData = [];
let currentPage = 1;
let recordsPerPage = calculateOptimalRecordsPerPage(); // Cálculo automático
let totalPages = 1;

// Variables globales para catálogos
let marcasCatalogo = [];
let productosCatalogo = [];
let presentacionesCatalogo = [];
let vehiculosCatalogo = [];

// Variables para manejo de archivos
let selectedFiles = []; // Solo se permitirá una imagen
let selectedPreviewUrl = null;

// Función para calcular registros óptimos según el tamaño de pantalla
function calculateOptimalRecordsPerPage() {
    const screenHeight = window.innerHeight;
    const headerHeight = 70; // Header fijo
    const userInfoHeight = 80; // Info del usuario más compacta
    const footerHeight = 60; // Footer de paginación
    const rowHeight = window.innerWidth <= 768 ? 30 : 38; // Altura de fila reducida
    
    // Calcular espacio disponible para la tabla
    const availableHeight = screenHeight - headerHeight - userInfoHeight - footerHeight - 100; // 100px margen
    
    // Calcular número de filas que caben
    const maxRows = Math.floor(availableHeight / rowHeight);
    
    // Establecer mínimo y máximo
    const minRecords = window.innerWidth <= 480 ? 3 : 5;
    const maxRecords = window.innerWidth <= 768 ? 10 : 18; // Aumentar máximo por filas más compactas
    
    return Math.max(minRecords, Math.min(maxRows, maxRecords));
}

// Función para redirigir al login
function RedirigirLogin() { 
    window.location.href = '../../logout.php'; 
}

// Función para abrir PowerBI en nueva pestaña
function abrirPowerBI() {
    // Aquí puedes colocar la URL de tu dashboard de PowerBI
    const powerBIUrl = 'https://app.powerbi.com/view?r=eyJrIjoiMDJjMTRlNGQtYWE2Ni00MTQyLTgzZDUtZTgyYTJjNzFmN2E3IiwidCI6Ijk2OWUxYWZhLTM2YWItNGQ5ZS1iYmM2LWU5Y2U3ZWE0N2U5OSIsImMiOjR9';
    window.open(powerBIUrl, '_blank');
}

// Función principal para cargar datos
function cargarDatos() {
    // No mostrar spinner, carga silenciosa
    return $.ajax({
        url: '../../Backend/FuncionalidadPHP/Promotor/get_data_promotor.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log('Datos recibidos:', data);
            allData = data || [];
            filteredData = [...allData];
            currentPage = 1; // Resetear a primera página
            updatePagination();
            renderTable();
            
            // No actualizar tiempo, ya que quitamos esa columna
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error al cargar los datos:', textStatus, errorThrown);
            
            // Mostrar mensaje de error en la tabla
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px; color: #dc3545;">
                        <strong>Error al cargar los datos</strong><br>
                        <small>${textStatus}: ${errorThrown}</small>
                    </td>
                </tr>
            `;
        }
    });
}

// Función para cargar catálogos al inicio
function cargarCatalogos() {
    // Marcas
    $.getJSON('../../Backend/FuncionalidadPHP/Promotor/get_marcas.php', function(data) {
        marcasCatalogo = data;
        llenarSelect('marcaInicial', marcasCatalogo, 'descripcion');
        llenarSelect('marcaFinal', marcasCatalogo, 'descripcion');
    });
    // Productos/referencias de todas las marcas
    $.getJSON('../../Backend/FuncionalidadPHP/Promotor/get_referencias.php', function(data) {
        productosCatalogo = data;
    });
    // Presentaciones
    $.getJSON('../../Backend/FuncionalidadPHP/Promotor/get_presentaciones.php', function(data) {
        presentacionesCatalogo = data;
        llenarSelect('presentacionVenta', presentacionesCatalogo, 'descripcion');
    });
    // Vehículos (puedes ajustar la fuente si tienes tabla)
    vehiculosCatalogo = [
        'Toyota','Chevrolet','Renault','Nissan','Hyundai','Mazda','Kia','Ford','Volkswagen','Suzuki','Honda','Mitsubishi','Jeep','Peugeot','Isuzu'
    ];
    llenarSelect('marcaVehiculo', vehiculosCatalogo);
}

// Función para llenar un select
function llenarSelect(id, data, key) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar</option>';
    if (Array.isArray(data)) {
        data.forEach(item => {
            let value = key ? item[key] : item;
            select.innerHTML += `<option value="${value}">${value}</option>`;
        });
    }
}

// Función para renderizar la tabla
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    
    // Calcular datos de la página actual
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    if (!pageData || pageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #6c757d;">
                    <strong>No se encontraron registros</strong><br>
                    <small>No hay datos disponibles para mostrar</small>
                </td>
            </tr>
        `;
        updateTableFooter();
        return;
    }
    
    let html = '';
    
    pageData.forEach(function(row) {
        // Determinar el estado con colores específicos
        let estadoClass = '';
        let estadoText = '';
        
        if (row.id_estado == 1) {
            estadoClass = 'status-active';
            estadoText = 'Aceptado';
        } else if (row.id_estado == 2) {
            estadoClass = 'status-programmed';
            estadoText = 'Denegado';
        } else if (row.id_estado == 3) {
            estadoClass = 'status-absent';
            estadoText = 'Pendiente';
        } else {
            estadoClass = 'status-inactive';
            estadoText = 'INACTIVO';
        }
        
        // Formatear fecha
        const fecha = row.fecha_actividad ? formatDate(row.fecha_actividad) : 'No disponible';
        
        // Crear botón para ubicación animado (solo en escritorio)
        let ubicacionHtml = 'No disponible';
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile && row.ubicacion_pdv && (row.ubicacion_pdv.includes('http') || row.ubicacion_pdv.includes('maps'))) {
            ubicacionHtml = `<button class="location-btn-table" onclick="abrirUbicacionDirecta(event, '${row.ubicacion_pdv}')" title="Ver ubicación en Google Maps">
                �️
            </button>`;
        } else if (!isMobile && row.ubicacion_pdv && row.ubicacion_pdv.trim() !== '') {
            // Si hay coordenadas o dirección, crear enlace a Google Maps
            const ubicacionEncoded = encodeURIComponent(row.ubicacion_pdv);
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ubicacionEncoded}`;
            ubicacionHtml = `<button class="location-btn-table" onclick="abrirUbicacionDirecta(event, '${googleMapsUrl}')" title="Buscar '${row.ubicacion_pdv}' en Google Maps">
                �️
            </button>`;
        }
        
        html += `
            <tr data-id="${row.id || ''}" onclick="showDetailsByRow(${row.id || 0})">
                <td data-label="Fecha">${row.fecha_formateada}</td>
                <td data-label="Punto de Venta">${row.nombre_pdv || 'No disponible'}</td>
                <td data-label="Dirección">${row.direccion_pdv || 'No disponible'}</td>
                <td data-label="Ubicación">${ubicacionHtml}</td>
                <td data-label="Marca">${row.marca || 'No disponible'}</td>
                <td data-label="Nombre del PDV">${row.actividad || 'No disponible'}</td>
                <td data-label="PVL">${row.segmento_pvl || '0'}</td>
                <td data-label="CVL">${row.segmento_cvl || '0'}</td>
                <td data-label="MCO">${row.segmento_mco || '0'}</td>
                <td data-label="Estado">
                    <div class="status-actions">
                        <span class="status-badge ${estadoClass}">${estadoText}</span>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    updateTableFooter();
}

// Función para seleccionar una fila
function selectRow(row, id) {
    // Remover selección anterior
    document.querySelectorAll('.data-table tbody tr').forEach(tr => {
        tr.classList.remove('selected');
    });
    
    // Agregar selección a la fila actual
    row.classList.add('selected');
    
    // Aquí puedes agregar lógica adicional para manejar la selección
    console.log('Fila seleccionada:', id);
}

// Nuevo método para mostrar detalles al hacer click en la fila
function showDetailsByRow(id) {
    // Buscar el registro en los datos
    const registro = allData.find(row => row.id == id);
    if (!registro) {
        alert('No se encontraron detalles para este registro');
        return;
    }
    // Llenar el modal con los datos reales
    document.getElementById('modalPDV').textContent = registro.nombre_pdv || 'No disponible';
    document.getElementById('modalDireccion').textContent = registro.direccion_pdv || 'No disponible';
    document.getElementById('modalMarca').textContent = registro.marca || 'No disponible';
    document.getElementById('modalFecha').textContent = registro.fecha_actividad ? formatDate(registro.fecha_actividad) : (registro.fecha_formateada || 'No disponible');
    // Ubicación
    const ubicacionBtn = document.getElementById('modalUbicacionBtn');
    if (registro.ubicacion_pdv && registro.ubicacion_pdv.trim() !== '') {
        ubicacionBtn.style.display = 'inline-flex';
        window.currentUbicacion = registro.ubicacion_pdv;
    } else {
        ubicacionBtn.style.display = 'none';
    }
    window.currentRegistroId = id;

    // Habilitar/deshabilitar botones de ventas y cierre según sin_cierre
    const ventasBtn = document.getElementById('modalVentasBtn');
    const cierreBtn = document.getElementById('modalCierreBtn');
    const errorMsg = document.getElementById('modalCierreErrorMsg');
    if (registro.sin_cierre == 0) {
        if (ventasBtn) {
            ventasBtn.disabled = true;
            ventasBtn.classList.add('disabled-btn');
        }
        if (cierreBtn) {
            cierreBtn.disabled = true;
            cierreBtn.classList.add('disabled-btn');
        }
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Ya se encuentra cargado un cierre, no es posible cargar información.';
        }
    } else {
        if (ventasBtn) {
            ventasBtn.disabled = false;
            ventasBtn.classList.remove('disabled-btn');
        }
        if (cierreBtn) {
            cierreBtn.disabled = false;
            cierreBtn.classList.remove('disabled-btn');
        }
        if (errorMsg) {
            errorMsg.style.display = 'none';
            errorMsg.textContent = '';
        }
    }

    // Mostrar el modal
    document.getElementById('detailsModal').style.display = 'flex';
}

// Función para formatear fechas
function formatDate(dateString) {
    if (!dateString) return 'No disponible';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

// Función para filtrar datos con múltiples criterios
function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const filterDate = document.getElementById('filterDate').value;
    const filterStatus = document.getElementById('filterStatus').value;
    
    if (!searchTerm && !filterDate && !filterStatus) {
        filteredData = [...allData];
    } else {
        filteredData = allData.filter(row => {
            let matches = true;
            
            // Filtro por texto (punto de venta)
            if (searchTerm) {
                matches = matches && (
                    (row.nombre_pdv && row.nombre_pdv.toLowerCase().includes(searchTerm))
                );
            }
            
            // Filtro por fecha
            if (filterDate) {
                const rowDate = row.fecha_formateada ? row.fecha_formateada.split(' ')[0] : '';
                matches = matches && (rowDate === filterDate);
            }
            
            // Filtro por estado
            if (filterStatus !== '') {
                matches = matches && (row.id_estado == filterStatus);
            }
            
            return matches;
        });
    }
    
    currentPage = 1; // Resetear a primera página al filtrar
    updatePagination();
    renderTable();
    updateFilterInfo();
}

// Función para mostrar información de filtros
function updateFilterInfo() {
    const totalRecords = allData.length;
    const filteredRecords = filteredData.length;
    
    // Mostrar contador de resultados si hay filtros activos
    const searchTerm = document.getElementById('searchInput').value;
    const filterDate = document.getElementById('filterDate').value;
    const filterStatus = document.getElementById('filterStatus').value;
    
    if (searchTerm || filterDate || filterStatus !== '') {
        console.log(`Mostrando ${filteredRecords} de ${totalRecords} registros`);
        
        // Agregar mensaje en la tabla si no hay resultados
        if (filteredRecords === 0) {
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px; color: #6c757d;">
                        <strong>No se encontraron resultados</strong><br>
                        <small>Intenta ajustar los filtros de búsqueda</small>
                    </td>
                </tr>
            `;
        }
    }
}

// Función para limpiar todos los filtros
function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterDate').value = '';
    document.getElementById('filterStatus').value = '';
    filterData();
}

// Función para recalcular registros por página al cambiar tamaño de ventana
function handleResize() {
    const newRecordsPerPage = calculateOptimalRecordsPerPage();
    if (newRecordsPerPage !== recordsPerPage) {
        recordsPerPage = newRecordsPerPage;
        currentPage = 1; // Resetear a primera página
        updatePagination();
        renderTable(); // Re-renderizar para aplicar cambios de responsive
        console.log(`Ajustado a ${recordsPerPage} registros por página`);
    } else {
        // Incluso si no cambia el número de registros, re-renderizar para aplicar responsive
        renderTable();
    }
}

// Función debounce para optimizar el resize
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar información inicial de registros calculados
    console.log(`📊 Registros por página calculados automáticamente: ${recordsPerPage}`);
    console.log(`📱 Pantalla: ${window.innerWidth}x${window.innerHeight}`);
    
    // Cargar datos al iniciar
    cargarDatos();
    cargarCatalogos();
    
    // Configurar resize listener para ajuste automático de registros
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Configurar filtros
    const searchInput = document.getElementById('searchInput');
    const filterDate = document.getElementById('filterDate');
    const filterStatus = document.getElementById('filterStatus');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterData);
        
        // Limpiar búsqueda con Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                clearAllFilters();
            }
        });
    }
    
    if (filterDate) {
        filterDate.addEventListener('change', filterData);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', filterData);
    }
    
    // Agregar botón para limpiar filtros
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        const clearButton = document.createElement('button');
        clearButton.innerHTML = '🗑️ Limpiar';
        clearButton.className = 'filter-select';
        clearButton.style.background = '#f8d7da';
        clearButton.style.color = '#721c24';
        clearButton.style.border = '2px solid #f5c6cb';
        clearButton.style.cursor = 'pointer';
        clearButton.onclick = clearAllFilters;
        
        const filterContainer = searchContainer.querySelector('.filter-container');
        if (filterContainer) {
            filterContainer.appendChild(clearButton);
        }
    }
    
    // Configurar drag & drop para archivos
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('fileInput');
    
    if (dragDropArea && fileInput) {
        // Eventos de drag & drop
        dragDropArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            dragDropArea.classList.add('drag-over');
        });
        
        dragDropArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            dragDropArea.classList.remove('drag-over');
        });
        
        dragDropArea.addEventListener('drop', function(e) {
            e.preventDefault();
            dragDropArea.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 1) {
                alert('Solo puedes cargar una foto.');
                return;
            }
            addFilesToList(files);
        });
        
        dragDropArea.addEventListener('click', function() {
            if (selectedFiles.length >= 1) {
                alert('Solo puedes cargar una foto para el cierre. Elimina la actual para subir otra.');
                return;
            }
            selectFiles();
        });
        
        fileInput.setAttribute('accept', 'image/*');
        fileInput.removeAttribute('multiple');
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 1) {
                alert('Solo puedes cargar una foto.');
                fileInput.value = '';
                return;
            }
            addFilesToList(Array.from(e.target.files));
        });
    }
    
    // Event listeners para cerrar modales con Escape o click fuera
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Cerrar cualquier modal abierto
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
        }
    });
    
    // Event listeners para cerrar modales con click fuera
    const modals = ['detailsModal', 'ventasModal', 'cierresModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    });
    
    // Actualizar datos cada 30 segundos
    setInterval(function() {
        cargarDatos();
    }, 30000);
    
    // Eliminar cualquier footer automático que pueda aparecer
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Buscar y eliminar elementos de copyright o footer automático
                    const footerElements = node.querySelectorAll('[data-copyright], .copyright, .footer-auto');
                    footerElements.forEach(el => el.remove());
                    
                    // Si el elemento agregado es un footer automático, eliminarlo
                    if (node.matches && node.matches('[data-copyright], .copyright, .footer-auto')) {
                        node.remove();
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Manejar cambio de tamaño de ventana
    window.addEventListener('resize', handleResize);
});

// Funciones adicionales para mantener compatibilidad

// Función de formato de moneda (si se necesita)
function formatCurrency(input) {
    let value = input.value.replace(/[^\d]/g, '');
    if (value) {
        value = parseInt(value).toLocaleString('es-CO');
        input.value = '$ ' + value;
    }
}

// Agregar CSS para fila seleccionada y efectos mejorados
const style = document.createElement('style');
style.textContent = `
    .data-table tbody tr.selected {
        background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%) !important;
        border-left: 4px solid #2a5298 !important;
        box-shadow: 0 4px 20px rgba(42, 82, 152, 0.25) !important;
        transform: translateY(-2px) !important;
    }
    
    .data-table tbody tr {
        cursor: pointer;
        position: relative;
    }
    
    .data-table tbody tr:hover {
        animation: rowHoverEffect 0.3s ease forwards;
    }
    
    @keyframes rowHoverEffect {
        to {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(42, 82, 152, 0.15);
        }
    }
    
    /* Eliminar cualquier footer automático */
    body::after,
    html::after,
    *::after {
        content: none !important;
    }
    
    /* Ocultar elementos de copyright automáticos */
    [data-copyright],
    .copyright,
    .footer-auto,
    body > div:last-child:not(.GridContanier) {
        display: none !important;
    }
`;
document.head.appendChild(style);

// Agrega este CSS para el botón deshabilitado si no lo tienes ya:
const style2 = document.createElement('style');
style2.textContent = `
    .disabled-btn, .disabled-btn:disabled {
        background: #e0e0e0 !important;
        color: #888 !important;
        border: 1px solid #ccc !important;
        cursor: not-allowed !important;
        opacity: 0.7 !important;
    }
    #modalCierreErrorMsg {
        display: none;
        color: #b94a48;
        background: #f2dede;
        border: 1px solid #eed3d7;
        padding: 8px 12px;
        border-radius: 4px;
        margin: 10px 0 0 0;
        font-size: 15px;
        text-align: center;
    }
`;
document.head.appendChild(style2);

// Exportar funciones para uso global
window.cargarDatos = cargarDatos;
window.filterData = filterData;
window.clearAllFilters = clearAllFilters;
window.RedirigirLogin = RedirigirLogin;
window.abrirPowerBI = abrirPowerBI;
window.goToPage = goToPage;
window.goToFirstPage = goToFirstPage;
window.goToPrevPage = goToPrevPage;
window.goToNextPage = goToNextPage;
window.goToLastPage = goToLastPage;
window.changePageSize = changePageSize;
window.showDetails = showDetails;
window.calculateOptimalRecordsPerPage = calculateOptimalRecordsPerPage;
window.handleResize = handleResize;

// Funciones de modales
window.closeDetailsModal = closeDetailsModal;
window.openVentasForm = openVentasForm;
window.closeVentasModal = closeVentasModal;
window.openCierresForm = openCierresForm;
window.closeCierresModal = closeCierresModal;
window.selectFiles = selectFiles;
window.removeFile = removeFile;
window.saveVentas = saveVentas;
window.saveCierres = saveCierres;

// Funciones de ubicación
window.abrirUbicacion = abrirUbicacion;
window.abrirUbicacionDirecta = abrirUbicacionDirecta;

// Funciones específicas del modal de ventas
window.filterProductsByBrand = filterProductsByBrand;
window.toggleOtroProducto = toggleOtroProducto;
window.formatCurrency = formatCurrency;
window.testCierresModal = testCierresModal;

// Función para actualizar la paginación
function updatePagination() {
    totalPages = Math.ceil(filteredData.length / recordsPerPage);
    if (totalPages === 0) totalPages = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    updatePaginationControls();
}

// Función para actualizar los controles de paginación
function updatePaginationControls() {
    const firstBtn = document.getElementById('firstPage');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const lastBtn = document.getElementById('lastPage');
    const pageNumbers = document.getElementById('pageNumbers');
    
    if (!firstBtn || !prevBtn || !nextBtn || !lastBtn || !pageNumbers) return;
    
    // Habilitar/deshabilitar botones
    firstBtn.classList.toggle('disabled', currentPage === 1);
    prevBtn.classList.toggle('disabled', currentPage === 1);
    nextBtn.classList.toggle('disabled', currentPage === totalPages);
    lastBtn.classList.toggle('disabled', currentPage === totalPages);
    
    // Generar números de página
    let pageHtml = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        pageHtml += `<button class="page-btn ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    pageNumbers.innerHTML = pageHtml;
}

// Función para actualizar el footer de la tabla
function updateTableFooter() {
    const recordsStart = document.getElementById('recordsStart');
    const recordsEnd = document.getElementById('recordsEnd');
    const recordsTotal = document.getElementById('recordsTotal');
    
    if (!recordsStart || !recordsEnd || !recordsTotal) return;
    
    const startIndex = (currentPage - 1) * recordsPerPage + 1;
    const endIndex = Math.min(currentPage * recordsPerPage, filteredData.length);
    
    if (filteredData.length === 0) {
        recordsStart.textContent = '0';
        recordsEnd.textContent = '0';
    } else {
        recordsStart.textContent = startIndex;
        recordsEnd.textContent = endIndex;
    }
    recordsTotal.textContent = filteredData.length;
}

// Funciones de navegación de páginas
function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        updatePaginationControls();
    }
}

function goToFirstPage() {
    goToPage(1);
}

function goToPrevPage() {
    goToPage(currentPage - 1);
}

function goToNextPage() {
    goToPage(currentPage + 1);
}

function goToLastPage() {
    goToPage(totalPages);
}

// Función para cambiar el tamaño de página
function changePageSize(newSize) {
    recordsPerPage = parseInt(newSize);
    currentPage = 1;
    updatePagination();
    renderTable();
}

// Función para actualizar la hora de última actualización
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdateElement.textContent = timeString;
    }
}

// Función para mostrar detalles de un registro
function showDetails(event, id) {
    // Prevenir que se seleccione la fila
    event.stopPropagation();
    
    // Buscar el registro en los datos
    const registro = allData.find(row => row.id == id);
    
    if (!registro) {
        alert('No se encontraron detalles para este registro');
        return;
    }
    
    // Llenar el modal con los datos
    document.getElementById('modalPDV').textContent = registro.punto_venta || 'No disponible';
    document.getElementById('modalDireccion').textContent = registro.direccion_pdv || 'No disponible';
    document.getElementById('modalMarca').textContent = registro.nombre_marca || 'No disponible';
    document.getElementById('modalFecha').textContent = registro.fecha_actividad ? formatDate(registro.fecha_actividad) : 'No disponible';
    
    // Configurar el botón de ubicación
    const ubicacionBtn = document.getElementById('modalUbicacionBtn');
    if (registro.ubicacion_pdv && registro.ubicacion_pdv.trim() !== '') {
        ubicacionBtn.style.display = 'inline-flex';
        // Guardar la ubicación para uso posterior
        window.currentUbicacion = registro.ubicacion_pdv;
    } else {
        ubicacionBtn.style.display = 'none';
    }
    
    // Guardar el ID del registro actual para uso en otros modales
    window.currentRegistroId = id;
    
    // Mostrar el modal
    document.getElementById('detailsModal').style.display = 'flex';
}

// Función para abrir ubicación desde el modal de detalles
function abrirUbicacion() {
    if (window.currentUbicacion) {
        if (window.currentUbicacion.includes('http') || window.currentUbicacion.includes('maps')) {
            // Es un enlace directo
            window.open(window.currentUbicacion, '_blank');
        } else {
            // Es una dirección o coordenadas, buscar en Google Maps
            const ubicacionEncoded = encodeURIComponent(window.currentUbicacion);
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ubicacionEncoded}`;
            window.open(googleMapsUrl, '_blank');
        }
    }
}

// Función para abrir ubicación directamente desde la tabla
function abrirUbicacionDirecta(event, ubicacion) {
    event.stopPropagation(); // Prevenir que se seleccione la fila
    window.open(ubicacion, '_blank');
}

// Función para cerrar el modal de detalles
function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Función para abrir el formulario de ventas
function openVentasForm() {
    const registro = allData.find(row => row.id == window.currentRegistroId);
    if (registro) {
        document.getElementById('ventasInfoPDV').textContent = registro.nombre_pdv || 'No disponible';
        document.getElementById('ventasInfoDireccion').textContent = registro.direccion_pdv || 'No disponible';
        document.getElementById('ventasInfoMarca').textContent = registro.marca || 'No disponible';
        document.getElementById('ventasInfoFecha').textContent = registro.fecha_actividad ? formatDate(registro.fecha_actividad) : (registro.fecha_formateada || 'No disponible');
        resetVentasForm();
    }
    closeDetailsModal();
    document.getElementById('ventasModal').style.display = 'flex';
}

// Mostrar/ocultar campos según motivo de visita y si llevó lubricante adicional
function onMotivoVisitaChange() {
    const motivo = document.getElementById('motivoVisita').value;
    const llevoLubricanteGroup = document.getElementById('llevoLubricanteGroup');
    const marcaInicialGroup = document.getElementById('marcaInicialGroup');
    const marcaFinalGroup = document.getElementById('marcaFinalGroup');
    const productosVentaRow = document.getElementById('productosVentaRow');
    const segmentoVehiculoRow = document.getElementById('segmentoVehiculoRow');
    const cantidadPrecioRow = document.getElementById('cantidadPrecioRow');

    // Siempre ocultar el select de lubricante adicional al cambiar motivo
    llevoLubricanteGroup.style.display = 'none';
    document.getElementById('llevoLubricante').value = '';

    if (motivo === 'lubricantes') {
        // Mostrar todos los campos
        marcaInicialGroup.style.display = '';
        marcaFinalGroup.style.display = '';
        productosVentaRow.style.display = '';
        segmentoVehiculoRow.style.display = '';
        cantidadPrecioRow.style.display = '';
    } else if (motivo) {
        // Mostrar solo motivo, observaciones y el select de "¿Llevó lubricante?"
        marcaInicialGroup.style.display = 'none';
        marcaFinalGroup.style.display = 'none';
        productosVentaRow.style.display = 'none';
        segmentoVehiculoRow.style.display = 'none';
        cantidadPrecioRow.style.display = 'none';
        llevoLubricanteGroup.style.display = '';
    } else {
        // Si no hay motivo seleccionado, ocultar todo menos motivo y observaciones
        marcaInicialGroup.style.display = 'none';
        marcaFinalGroup.style.display = 'none';
        productosVentaRow.style.display = 'none';
        segmentoVehiculoRow.style.display = 'none';
        cantidadPrecioRow.style.display = 'none';
        llevoLubricanteGroup.style.display = 'none';
    }
}

function onLlevoLubricanteChange() {
    const value = document.getElementById('llevoLubricante').value;
    const marcaInicialGroup = document.getElementById('marcaInicialGroup');
    const marcaFinalGroup = document.getElementById('marcaFinalGroup');
    const productosVentaRow = document.getElementById('productosVentaRow');
    const segmentoVehiculoRow = document.getElementById('segmentoVehiculoRow');
    const cantidadPrecioRow = document.getElementById('cantidadPrecioRow');
    if (value === 'si') {
        marcaInicialGroup.style.display = '';
        marcaFinalGroup.style.display = '';
        productosVentaRow.style.display = '';
        segmentoVehiculoRow.style.display = '';
        cantidadPrecioRow.style.display = '';
    } else {
        marcaInicialGroup.style.display = 'none';
        marcaFinalGroup.style.display = 'none';
        productosVentaRow.style.display = 'none';
        segmentoVehiculoRow.style.display = 'none';
        cantidadPrecioRow.style.display = 'none';
    }
}

// Inicializar el formulario de ventas ocultando campos al abrir el modal
function resetVentasForm() {
    document.getElementById('motivoVisita').value = '';
    document.getElementById('marcaInicial').value = '';
    document.getElementById('marcaFinal').value = '';
    document.getElementById('productosVenta').value = '';
    document.getElementById('otroProductoVenta').value = '';
    document.getElementById('presentacionVenta').value = '';
    document.getElementById('segmentoVenta').value = '';
    document.getElementById('marcaVehiculo').value = '';
    document.getElementById('cantidadVenta').value = '';
    document.getElementById('precioVenta').value = '';
    document.getElementById('observacionesVenta').value = '';

    // Ocultar campo de otro producto
    document.getElementById('otroProductoVenta').style.display = 'none';

    // Resetear productos
    document.getElementById('productosVenta').innerHTML = '<option value="">Seleccionar marca final primero</option>';

    // Ocultar todos los campos menos motivo y observaciones
    document.getElementById('marcaInicialGroup').style.display = 'none';
    document.getElementById('marcaFinalGroup').style.display = 'none';
    document.getElementById('productosVentaRow').style.display = 'none';
    document.getElementById('segmentoVehiculoRow').style.display = 'none';
    document.getElementById('cantidadPrecioRow').style.display = 'none';
    document.getElementById('llevoLubricanteGroup').style.display = 'none';
}

// Base de datos de productos por marca
const productosPorMarca = {
    'Mobil': [
        'Mobil 1 0W-20', 'Mobil 1 0W-40', 'Mobil 1 5W-30', 'Mobil 1 ESP 5W-30',
        'Mobil Super 3000 5W-30', 'Mobil Super 3000 5W-40', 'Mobil Super 2000 5W-30',
        'Mobil Super 2000 10W-30', 'Mobil Super 2000 10W-40', 'Mobil Super 1000 20W-50',
        'Mobil Special Alto kilometraje 25W-50', 'Mobil Special HD 50',
        'Mobil 1 Racing 4T 10W-40', 'Mobil 1 Racing 4T 15W-50', 'Mobil 1 V-Twin 20W-50',
        'Mobil Super 4T MX 10W-30', 'Mobil Super 4T MX 10W-40', 'Mobil Super Moto Scooter MX 10W-40',
        'Mobil Super 4T MX 15W-50', 'Mobil Super 4T 20W-50', 'Mobil Super Moto 2T',
        'Mobil Outboard Plus 2T', 'Mobil Outboard Plus 4T',
        'Mobil Delvac Modern 10W-40 Advance Protection', 'Mobil Delvac Modern 15W-40 Full Protection',
        'Mobil Delvac Modern 15W-40 Super Defense V3', 'Mobil Delvac Legend 1340', 'Mobil Delvac Legend 1350'
    ],
    'Terpel': [
        'Terpel Oiltec 10W-30 Titanio', 'Terpel Oiltec 10W-40 Titanio', 'Terpel Oiltec 20W-50 Titanio',
        'Terpel Oiltec 20W-50 Multigrado', 'Terpel Oiltec Tergas 20W-50', 'Terpel Oiltec 50 Monogrado',
        'Terpel Oiltec Tergas 50 Monogrado'
    ],
    'Shell': [
        'Shell Helix HX7 10W-40', 'Shell Helix Ultra 5W-40', 'Shell Helix HX5 20W-50',
        'Shell Advance AX7 10W-40', 'Shell Rimula R4 X 15W-40'
    ],
    'Castrol': [
        'Castrol GTX 20W-50', 'Castrol EDGE 5W-30', 'Castrol Magnatec 10W-40',
        'Castrol Power1 4T 10W-40', 'Castrol CRB Multi 15W-40'
    ],
    'Chevron': [
        'Chevron Havoline 10W-30', 'Chevron Havoline 20W-50', 'Chevron Delo 400 15W-40'
    ],
    'Motul': [
        'Motul 3000 4T 20W-50', 'Motul 7100 10W-40', 'Motul 5100 10W-30',
        'Motul H-Tech 100 Plus 5W-30'
    ],
    'Repsol': [
        'Repsol Moto Sintetico 4T 10W-40', 'Repsol Elite Multiválvulas 20W-50',
        'Repsol Elite Long Life 5W-30'
    ]
};

// Función para filtrar productos por marca
function filterProductsByBrand() {
    const marcaFinal = document.getElementById('marcaFinal').value;
    const productosSelect = document.getElementById('productosVenta');
    const otroInput = document.getElementById('otroProductoVenta');
    productosSelect.innerHTML = '<option value="">Seleccionar producto</option>';
    otroInput.style.display = 'none';

    if (marcaFinal) {
        // Filtrar productos de la marca seleccionada
        const productosFiltrados = productosCatalogo.filter(prod => prod.marca === marcaFinal);
        productosFiltrados.forEach(prod => {
            productosSelect.innerHTML += `<option value="${prod.descripcion}">${prod.descripcion}</option>`;
        });

        // Solo para marcas distintas de Mobil y Terpel, agregar opción "Otro producto..."
        if (marcaFinal !== 'Mobil' && marcaFinal !== 'Terpel') {
            productosSelect.innerHTML += `<option value="otro">Otro producto...</option>`;
        }
    }
    if (marcaFinal === '') {
        productosSelect.innerHTML = '<option value="">Seleccionar marca final primero</option>';
        otroInput.style.display = 'none';
    }
}

// Mostrar input "Otros" si selecciona la opción
function toggleOtroProducto() {
    const productosSelect = document.getElementById('productosVenta');
    const otroInput = document.getElementById('otroProductoVenta');
    if (productosSelect.value === 'otro') {
        otroInput.style.display = 'block';
        otroInput.focus();
    } else {
        otroInput.style.display = 'none';
        otroInput.value = '';
    }
}

// Función para cerrar el modal de ventas
function closeVentasModal() {
    document.getElementById('ventasModal').style.display = 'none';
    resetVentasForm();
}

// Función para abrir el formulario de cierres
function openCierresForm() {
    const registro = allData.find(row => row.id == window.currentRegistroId);
    if (registro) {
        document.getElementById('cierresInfoPDV').textContent = registro.nombre_pdv || 'No disponible';
        document.getElementById('cierresInfoDireccion').textContent = registro.direccion_pdv || 'No disponible';
        document.getElementById('cierresInfoMarca').textContent = registro.marca || 'No disponible';
        document.getElementById('cierresInfoFecha').textContent = registro.fecha_actividad ? formatDate(registro.fecha_actividad) : (registro.fecha_formateada || 'No disponible');
    }
    closeDetailsModal();
    document.getElementById('cierresModal').style.display = 'flex';
}

// Función temporal para probar el modal de cierres
function testCierresModal() {
    console.log('🧪 Función de prueba para modal de cierres');
    console.log('📄 Estado del DOM:', document.readyState);
    
    // Verificar que todos los elementos existen
    const elements = {
        cierresModal: document.getElementById('cierresModal'),
        cierresInfoPDV: document.getElementById('cierresInfoPDV'),
        cierresInfoDireccion: document.getElementById('cierresInfoDireccion'),
        cierresInfoMarca: document.getElementById('cierresInfoMarca'),
        cierresInfoFecha: document.getElementById('cierresInfoFecha')
    };
    
    console.log('🔍 Elementos encontrados:', elements);
    
    // Verificar si algún elemento falta
    const missingElements = Object.keys(elements).filter(key => !elements[key]);
    if (missingElements.length > 0) {
        console.error('❌ Elementos faltantes:', missingElements);
        alert(`Error: Elementos faltantes en el DOM: ${missingElements.join(', ')}`);
        return;
    }
    
    // Llenar información de prueba
    elements.cierresInfoPDV.textContent = 'PDV de Prueba';
    elements.cierresInfoDireccion.textContent = 'Dirección de Prueba';
    elements.cierresInfoMarca.textContent = 'Marca de Prueba';
    elements.cierresInfoFecha.textContent = '2025-06-25';
    
    console.log('✅ Información de prueba llenada');
    
    // Cerrar otros modales primero
    const detailsModal = document.getElementById('detailsModal');
    const ventasModal = document.getElementById('ventasModal');
    
    if (detailsModal) detailsModal.style.display = 'none';
    if (ventasModal) ventasModal.style.display = 'none';
    
    // Mostrar el modal con múltiples intentos
    elements.cierresModal.style.display = 'flex';
    elements.cierresModal.style.visibility = 'visible';
    elements.cierresModal.style.opacity = '1';
    
    console.log('🎉 Modal de cierres configurado para mostrarse');
    console.log('🎨 Estilos aplicados:', {
        display: elements.cierresModal.style.display,
        visibility: elements.cierresModal.style.visibility,
        opacity: elements.cierresModal.style.opacity
    });
    
    // Verificar después de un pequeño delay
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(elements.cierresModal);
        console.log('🔍 Estilos computados:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            zIndex: computedStyle.zIndex
        });
    }, 100);
}

// Función para cerrar el modal de cierres
function closeCierresModal() {
    document.getElementById('cierresModal').style.display = 'none';
    // Limpiar formulario y archivos
    clearFilesList();
    document.getElementById('cierresHallazgos').value = '';
    document.getElementById('cierresNotas').value = '';
    window.reload(); // Recargar la página para limpiar el estado
}

// Función para seleccionar archivos
function selectFiles() {
    document.getElementById('fileInput').click();
}

// Función para agregar archivos a la lista (solo una imagen)
function addFilesToList(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        alert('Solo se permite subir una imagen.');
        return;
    }
    selectedFiles = [file];
    // Crear previsualización
    if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
    }
    selectedPreviewUrl = URL.createObjectURL(file);
    renderFilesList();
}

// Muestra el nombre del archivo en el área de drag & drop
function renderFilesList() {
    const filesList = document.getElementById('filesList');
    const dragDropArea = document.getElementById('dragDropArea');
    if (!selectedFiles.length) {
        filesList.innerHTML = '';
        if (dragDropArea) dragDropArea.querySelector('.drag-drop-content').innerHTML = `
            <div class="drag-icon">🖼️</div>
            <p>Arrastra y suelta una foto aquí</p>
            <p class="drag-sub">o <span class="drag-link" onclick="selectFiles()">haz clic para seleccionar</span></p>
            <input type="file" id="fileInput" accept="image/*" style="display: none;">
        `;
        return;
    }
    const file = selectedFiles[0];
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    filesList.innerHTML = `
        <div class="file-item">
            <div class="file-info">
                <span class="file-icon">🖼️</span>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
            </div>
            <button class="file-remove" onclick="removeFile(0)" title="Eliminar archivo">×</button>
        </div>
    `;
    if (dragDropArea) {
        dragDropArea.querySelector('.drag-drop-content').innerHTML = `
            <div class="drag-preview-img" style="text-align:center;">
                <img src="${selectedPreviewUrl}" alt="preview" style="max-width:120px;max-height:120px;border-radius:8px;box-shadow:0 2px 8px #0002;margin-bottom:8px;">
            </div>
            <p><strong>Archivo seleccionado:</strong> ${file.name}</p>
            <p class="drag-sub">Elimina para cambiar la imagen</p>
            <input type="file" id="fileInput" accept="image/*" style="display: none;">
        `;
    }
}

// Elimina el archivo seleccionado y restaura el área drag & drop
function removeFile(index) {
    if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
        selectedPreviewUrl = null;
    }
    selectedFiles = [];
    renderFilesList();
    document.getElementById('fileInput').value = '';
}
function clearFilesList() {
    if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
        selectedPreviewUrl = null;
    }
    selectedFiles = [];
    renderFilesList();
    document.getElementById('fileInput').value = '';
}

// Modifica saveCierres y guardarCierreFinal para enviar el nombre del archivo seleccionado
function saveCierres() {
    // Hallazgos: select de hallazgos del PDV
    const hallazgos = document.getElementById('cierresHallazgos') ? document.getElementById('cierresHallazgos').value : '';
    // Observaciones: textarea o input de notas del cierre
    const observaciones = document.getElementById('cierresNotas') ? document.getElementById('cierresNotas').value : '';
    const personasAbordadas = document.getElementById('cierresPersonasImpactadas') ? document.getElementById('cierresPersonasImpactadas').value : '';
    const idSolicitud = window.currentRegistroId;

    if (!hallazgos || !personasAbordadas) {
        alert('Por favor, complete todos los campos obligatorios');
        return;
    }

    // Subir la foto primero si hay archivo
    if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('foto', selectedFiles[0]);
        formData.append('fecha', new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

        $.ajax({
            url: '../../Backend/FuncionalidadPHP/Promotor/save_cierre.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(resp) {
                if (resp.success && resp.foto_url) {
                    guardarCierreFinal(idSolicitud, hallazgos, observaciones, personasAbordadas, resp.foto_url);
                } else {
                    alert('Error al subir la foto: ' + (resp.message || 'Error desconocido'));
                }
            },
            error: function() {
                alert('Error al subir la foto');
            }
        });
    } else {
        guardarCierreFinal(idSolicitud, hallazgos, observaciones, personasAbordadas, null);
    }
}

function guardarCierreFinal(idSolicitud, hallazgos, observaciones, personasAbordadas, fotoUrl) {
    const cierreData = {
        id_solicitud: idSolicitud,
        hallazgos: hallazgos, // select de hallazgos
        observaciones: observaciones, // notas del cierre
        personas_impactadas: personasAbordadas,
        foto_activacion: fotoUrl
    };

    $.ajax({
        url: '../../Backend/FuncionalidadPHP/Promotor/save_cierre.php',
        method: 'POST',
        data: JSON.stringify(cierreData),
        contentType: 'application/json',
        success: function(response) {
            if (response && response.success) {
                alert('Cierre guardado correctamente');
                window.location.reload();
            } else {
                alert('Error al guardar el cierre: ' + (response.message || 'Error desconocido'));
            }
        },
        error: function() {
            alert('Error al guardar el cierre');
        }
    });
}

// Función para guardar ventas
function saveVentas() {
    // Obtener valores del formulario
    const motivo_visita = document.getElementById('motivoVisita').value;
    const marca_inicial = document.getElementById('marcaInicial').value;
    const marca_final = document.getElementById('marcaFinal').value;
    const productos_venta = document.getElementById('productosVenta').value === 'otro'
        ? document.getElementById('otroProductoVenta').value
        : document.getElementById('productosVenta').value;
    const presentacion = document.getElementById('presentacionVenta').value;
    const segmento = document.getElementById('segmentoVenta').value;
    const marca_vehiculo = document.getElementById('marcaVehiculo').value;
    const cantidad = document.getElementById('cantidadVenta').value;
    const precio = document.getElementById('precioVenta').value.replace(/[^\d]/g, '');
    const observaciones = document.getElementById('observacionesVenta').value;
    const llevo_lubricante = document.getElementById('llevoLubricante') ? document.getElementById('llevoLubricante').value : null;
    const id_solicitud = window.currentRegistroId;

    // Validación básica
    if (!motivo_visita) {
        alert('Por favor, seleccione el motivo de visita.');
        return;
    }
    if (motivo_visita !== 'lubricantes' && llevo_lubricante === '') {
        alert('Por favor, indique si llevó lubricante.');
        return;
    }
    if (motivo_visita === 'lubricantes') {
        if (!marca_final || !productos_venta || !cantidad || !precio) {
            alert('Por favor, complete todos los campos obligatorios de la venta.');
            return;
        }
    }

    // Construir objeto de datos
    const ventaData = {
        id_solicitud,
        motivo_visita,
        marca_inicial,
        marca_final,
        productos_venta,
        presentacion,
        segmento,
        marca_vehiculo,
        cantidad,
        precio,
        observaciones,
        llevo_lubricante
    };

    // Enviar por AJAX
    $.ajax({
        url: '../../Backend/FuncionalidadPHP/Promotor/save_venta.php',
        method: 'POST',
        data: JSON.stringify(ventaData),
        contentType: 'application/json',
        success: function(response) {
            if (response && response.success) {
                alert('Venta guardada correctamente');
                closeVentasModal();
                // Recargar la página completa
                window.location.reload();
            } else {
                alert('Error al guardar la venta: ' + (response.message || 'Error desconocido'));
            }
        },
        error: function() {
            alert('Error al guardar la venta');
        }
    });
}