document.addEventListener('DOMContentLoaded', function() {
    cargarTablaAdmin();

    // Listeners para flechas de paginación
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');

    if (firstPageBtn) firstPageBtn.addEventListener('click', () => goToPageAdmin(1));
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPageAdmin(currentPage - 1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPageAdmin(currentPage + 1));
    if (lastPageBtn) lastPageBtn.addEventListener('click', () => goToPageAdmin(totalPages));

    // Botón de actualizar tabla: muestra spinner y recarga la página
    var btnActualizar = document.getElementById('btnActualizarTabla');
    if (btnActualizar) {
        btnActualizar.addEventListener('click', function() {
            var spinner = document.getElementById('loadingSpinner');
            if (spinner) spinner.style.display = 'flex';
            setTimeout(function() {
                location.reload();
            }, 500);
        });
    }

    // Popup de detalles para Administrador
    const tablaBody = document.getElementById('datosTabla');
    if (tablaBody) {
        tablaBody.addEventListener('click', async function(e) {
            // Evita abrir el popup si se hace click en el botón de ubicación
            if (e.target.classList.contains('location-btn')) return;
            let tr = e.target.closest('tr');
            if (!tr || tr.querySelector('td[colspan]')) return;
            // Solo cuenta los TR visibles y válidos (sin colspan)
            const trs = Array.from(tablaBody.children).filter(row => row.nodeName === 'TR' && !row.querySelector('td[colspan]'));
            const idx = trs.indexOf(tr);
            if (typeof filteredData === 'undefined' || idx === -1) return;
            // Ajusta el índice para la página actual
            const item = filteredData[(currentPage - 1) * recordsPerPage + idx];
            if (!item) return;
            adminDetalleData = item;
            // Llena los datos
            if (document.getElementById('adminModalPromotora')) document.getElementById('adminModalPromotora').textContent = item.promotora || '-';
            if (document.getElementById('adminModalPDV')) document.getElementById('adminModalPDV').textContent = item.nombre_pdv || '-';
            if (document.getElementById('adminModalDireccion')) document.getElementById('adminModalDireccion').textContent = item.direccion_pdv || '-';
            if (document.getElementById('adminModalMarca')) document.getElementById('adminModalMarca').textContent = item.marca || '-';
            if (document.getElementById('adminModalActividad')) document.getElementById('adminModalActividad').textContent = item.actividad || '-';
            if (document.getElementById('adminModalFecha')) document.getElementById('adminModalFecha').textContent = item.fecha_formateada || '-';
            if (document.getElementById('adminModalAsesor')) document.getElementById('adminModalAsesor').textContent = item.asesor_comercial || '-';
            // Habilita/deshabilita botón de ventas y cierre según estado_ventas
            const btnVentas = document.getElementById('btnVerVentasAdmin');
            const btnCierre = document.getElementById('btnVerCierreAdmin');
            const logDiv = document.getElementById('adminDetalleLog');
            if (btnVentas && btnCierre) {
                // if (item.estado_ventas === 'Sin Ventas') {
                //     btnVentas.disabled = true;
                //     btnVentas.style.opacity = 0.5;
                //     btnVentas.title = "No hay ventas registradas";
                //     btnCierre.disabled = true;
                //     btnCierre.style.opacity = 0.5;
                //     btnCierre.title = "No hay cierre registrado";
                //     if (logDiv) {
                //         logDiv.innerHTML = '<p style="color:#c0392b;font-weight:bold;margin:10px 0 0 0;">No hay ventas ni cierre registrados aún.</p>';
                //     }
                // } else {
                //     btnVentas.disabled = false;
                //     btnVentas.style.opacity = 1;
                //     btnVentas.title = "";
                //     btnCierre.disabled = false;
                //     btnCierre.style.opacity = 1;
                //     btnCierre.title = "";
                //     if (logDiv) logDiv.innerHTML = '';
                // }
            }
            // Muestra el popup
            if (document.getElementById('adminDetallePopup')) document.getElementById('adminDetallePopup').style.display = 'flex';
        });
    }
    // Botón aceptar
    if (document.getElementById('btnAceptarSolicitud')) {
        document.getElementById('btnAceptarSolicitud').onclick = async function() {
            if (!adminDetalleData) return;
            await actualizarEstadoSolicitudAdmin(adminDetalleData.id, 1);
        };
    }
    // Botón denegar
    if (document.getElementById('btnDenegarSolicitud')) {
        document.getElementById('btnDenegarSolicitud').onclick = async function() {
            if (!adminDetalleData) return;
            await actualizarEstadoSolicitudAdmin(adminDetalleData.id, 2);
        };
    }
});

let allData = [];
let filteredData = [];
let currentPage = 1;
let recordsPerPage = calcularRegistrosPorPantalla();
let totalPages = 1;

// Calcula registros por página según altura de pantalla (máx 10, min 3, sin overflow)
function calcularRegistrosPorPantalla() {
    const screenHeight = window.innerHeight;
    const header = 70, footer = 60, margen = 100;
    const rowHeight = 48; // Altura estimada de fila (ajusta según tu CSS)
    const disponible = screenHeight - header - footer - margen;
    const max = 10, min = 3;
    return Math.max(min, Math.min(Math.floor(disponible / rowHeight), max));
}

// Recalcula registros por página al cambiar tamaño de pantalla
window.addEventListener('resize', () => {
    recordsPerPage = calcularRegistrosPorPantalla();
    currentPage = 1;
    renderTableAdmin();
    updatePaginationAdmin();
    mostrarInfoRegistros();
});

function cargarTablaAdmin() {
    const tablaBody = document.getElementById('datosTabla');
    if (!tablaBody) return;

    if (document.getElementById('loadingSpinner')) {
        document.getElementById('loadingSpinner').style.display = 'flex';
    }

    fetch('../../../Backend/FuncionalidadPHP/Administrador/get_data_tabla.php')
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener datos');
            return response.json();
        })
        .then(data => {
            allData = Array.isArray(data) ? data : [];
            filteredData = [...allData];
            currentPage = 1;
            renderTableAdmin();
            updatePaginationAdmin();
            mostrarInfoRegistros();
        })
        .catch(error => {
            tablaBody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red;">Error al cargar datos</td></tr>`;
            console.error(error);
        })
        .finally(() => {
            if (document.getElementById('loadingSpinner')) {
                document.getElementById('loadingSpinner').style.display = 'none';
            }
        });
}

function renderTableAdmin() {
    const tablaBody = document.getElementById('datosTabla');
    tablaBody.innerHTML = '';

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredData.length);

    if (filteredData.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="9" class="error-message" style="text-align:center;padding:40px;color:#6c757d;">
            <strong>No se encontraron registros</strong><br>
            <small>No hay datos disponibles para mostrar</small>
        </td></tr>`;
        mostrarInfoRegistros();
        return;
    }

    for (let i = startIndex; i < endIndex; i++) {
        const item = filteredData[i];
        let estadoBadge = '';
        switch (item.id_estado) {
            case '1':
                estadoBadge = '<span class="badge badge-success">ACEPTADO</span>';
                break;
            case '2':
                estadoBadge = '<span class="badge badge-danger">DENEGADO</span>';
                break;
            default:
                estadoBadge = '<span class="badge badge-warning">PENDIENTE</span>';
        }
        let ventasBadge = '';
        if (item.estado_ventas === 'Con Ventas') {
            ventasBadge = '<span style="background:#e6f7e6;color:#219150;padding:2px 8px;border-radius:8px;font-size:12px;display:inline-block;">✔ Con Ventas</span>';
        } else {
            ventasBadge = '<span style="background:#fbeaea;color:#c0392b;padding:2px 8px;border-radius:8px;font-size:12px;display:inline-block;">✖ Sin Ventas</span>';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.fecha_formateada || '-'}</td>
            <td>${item.nombre_pdv || '-'}</td>
            <td>${item.direccion_pdv || '-'}</td>
            <td>
                <button class="location-btn" onclick="abrirUbicacionAdmin('${item.ubicacion_pdv || ''}')">Ver</button>
            </td>
            <td>${item.marca || '-'}</td>
            <td>${item.actividad || '-'}</td>
            <td>${item.promotor || '-'}</td>
            <td>${estadoBadge}</td>
            <td>${ventasBadge}</td>
        `;
        tablaBody.appendChild(row);
    }
    mostrarInfoRegistros();
    tablaBody.parentElement.style.overflowY = "hidden";
}

function updatePaginationAdmin() {
    const paginationContainer = document.getElementById('pageNumbers');
    if (!paginationContainer) return;
    totalPages = Math.ceil(filteredData.length / recordsPerPage);

    paginationContainer.innerHTML = '';

    // Botón doble anterior
    const firstBtn = document.createElement('button');
    firstBtn.innerHTML = '&laquo;&laquo;';
    firstBtn.disabled = currentPage === 1;
    firstBtn.onclick = () => goToPageAdmin(1);
    paginationContainer.appendChild(firstBtn);

    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&laquo;';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => goToPageAdmin(currentPage - 1);
    paginationContainer.appendChild(prevBtn);

    // Números de página (máx 5)
    let maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = (i === currentPage ? 'active' : '');
        btn.onclick = () => goToPageAdmin(i);
        paginationContainer.appendChild(btn);
    }

    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&raquo;';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.onclick = () => goToPageAdmin(currentPage + 1);
    paginationContainer.appendChild(nextBtn);

    // Botón doble siguiente
    const lastBtn = document.createElement('button');
    lastBtn.innerHTML = '&raquo;&raquo;';
    lastBtn.disabled = currentPage === totalPages || totalPages === 0;
    lastBtn.onclick = () => goToPageAdmin(totalPages);
    paginationContainer.appendChild(lastBtn);
}

function goToPageAdmin(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTableAdmin();
    updatePaginationAdmin();
    mostrarInfoRegistros();
}

// Muestra el total de registros y el rango actual
function mostrarInfoRegistros() {
    // Actualiza los spans del footer
    const total = filteredData.length;
    const start = total === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
    const end = Math.min(currentPage * recordsPerPage, total);

    const spanStart = document.getElementById('recordsStart');
    const spanEnd = document.getElementById('recordsEnd');
    const spanTotal = document.getElementById('recordsTotal');
    if (spanStart) spanStart.textContent = start;
    if (spanEnd) spanEnd.textContent = end;
    if (spanTotal) spanTotal.textContent = total;

    // Si tienes el div infoRegistros adicional, puedes actualizarlo también si lo deseas:
    // let info = document.getElementById('infoRegistros');
    // if (!info) {
    //     info = document.createElement('div');
    //     info.id = 'infoRegistros';
    //     info.style.margin = '10px 0 0 10px';
    //     info.style.fontSize = '14px';
    //     info.style.color = '#333';
    //     const tablaBody = document.getElementById('datosTabla');
    //     if (tablaBody && tablaBody.parentElement) {
    //         tablaBody.parentElement.parentElement.insertBefore(info, tablaBody.parentElement.nextSibling);
    //     }
    // }
    // info.innerHTML = `Mostrando <b>${start}</b> - <b>${end}</b> de <b>${total}</b> registros`;
}

// Función global para abrir ubicación en Google Maps
function abrirUbicacionAdmin(ubicacion) {
    if (!ubicacion || ubicacion === '-') {
        alert('No hay información de ubicación disponible');
        return;
    }
    let url = ubicacion;
    if (!ubicacion.startsWith('http')) {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`;
    }
    window.open(url, '_blank');
}

// Al final del archivo, expón la función globalmente
window.cargarTablaAdmin = cargarTablaAdmin;

// Agrega estilos similares a los de Promotor para la tabla de Administrador
(function agregarEstilosTablaAdmin() {
    const style = document.createElement('style');
    style.textContent = `
        #datosTabla tr {
            transition: background 0.2s, box-shadow 0.2s;
            cursor: pointer;
        }
        #datosTabla tr:hover {
            background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%) !important;
            box-shadow: 0 4px 15px rgba(42, 82, 152, 0.10);
        }
        #datosTabla td, #datosTabla th {
            font-size: 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        #datosTabla th {
            background: #f5f7fa;
            color: #2a5298;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .badge-success {
            background: #e6f7e6;
            color: #219150;
            border-radius: 8px;
            padding: 2px 10px;
            font-size: 13px;
            font-weight: 600;
            display: inline-block;
        }
        .badge-danger {
            background: #fbeaea;
            color: #c0392b;
            border-radius: 8px;
            padding: 2px 10px;
            font-size: 13px;
            font-weight: 600;
            display: inline-block;
        }
        .badge-warning {
            background: #fffbe6;
            color: #b8860b;
            border-radius: 8px;
            padding: 2px 10px;
            font-size: 13px;
            font-weight: 600;
            display: inline-block;
        }
        .location-btn {
            background: #1976d2;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 4px 14px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .location-btn:hover {
            background: #1565c0;
        }
        /* Badge ventas igual que promotor */
        .ventas-si {
            background: #e6f7e6 !important;
            color: #219150 !important;
            border-radius: 8px;
            padding: 2px 10px;
            font-size: 13px;
            font-weight: 600;
            display: inline-block;
        }
        .ventas-no {
            background: #fbeaea !important;
            color: #c0392b !important;
            border-radius: 8px;
            padding: 2px 10px;
            font-size: 13px;
            font-weight: 600;
            display: inline-block;
        }
        #infoRegistros {
            margin: 10px 0 0 10px;
            font-size: 15px;
            color: #333;
            font-weight: 500;
        }
        #pageNumbers, .pagination-container {
            display: flex;
            gap: 4px;
            justify-content: flex-end;
            align-items: center;
            margin: 10px 0 0 0;
        }
        #pageNumbers button, .pagination-container button {
            background: #fff;
            border: 1px solid #d1d5db;
            color: #1976d2;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 15px;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
        }
        #pageNumbers button.active, .pagination-container button.active {
            background: #1976d2;
            color: #fff;
            font-weight: bold;
        }
        #pageNumbers button:disabled, .pagination-container button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
})();


       // Botón de actualizar tabla: muestra spinner y recarga la página
        document.addEventListener('DOMContentLoaded', function() {
            var btnActualizar = document.getElementById('btnActualizarTabla');
            if (btnActualizar) {
                btnActualizar.addEventListener('click', function() {
                    var spinner = document.getElementById('loadingSpinner');
                    if (spinner) spinner.style.display = 'flex';
                    setTimeout(function() {
                        location.reload();
                    }, 500); // Pequeño delay para mostrar el spinner
                });
            }
        });
        // Popup de detalles para Administrador
        let adminDetalleData = null;
        function closeAdminDetallePopup() {
            if (document.getElementById('adminDetallePopup')) document.getElementById('adminDetallePopup').style.display = 'none';
            adminDetalleData = null;
            if (document.getElementById('adminDetalleLog')) document.getElementById('adminDetalleLog').innerHTML = '';
        }
        // Abrir ubicación en Google Maps desde el popup
        function abrirUbicacionAdminDetalle() {
            if (adminDetalleData && adminDetalleData.ubicacion_pdv) {
                let url = adminDetalleData.ubicacion_pdv;
                if (!url.startsWith('http')) {
                    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(url)}`;
                }
                window.open(url, '_blank');
            }
        }
        // Mostrar popup al hacer click en una fila
        document.addEventListener('DOMContentLoaded', function() {
            const tablaBody = document.getElementById('datosTabla');
            if (tablaBody) {
                tablaBody.addEventListener('click', async function(e) {
                    // Evita abrir el popup si se hace click en el botón de ubicación
                    if (e.target.classList.contains('location-btn')) return;
                    let tr = e.target.closest('tr');
                    if (!tr || tr.querySelector('td').colSpan) return;
                    // Solo cuenta los TR visibles y válidos (sin colspan)
                    const trs = Array.from(tablaBody.children).filter(row => row.nodeName === 'TR' && !row.querySelector('td[colspan]'));
                    const idx = trs.indexOf(tr);
                    if (typeof filteredData === 'undefined' || idx === -1) return;
                    // Ajusta el índice para la página actual
                    const item = filteredData[(currentPage - 1) * recordsPerPage + idx];
                    if (!item) return;
                    adminDetalleData = item;
                    // Llena los datos
                    if (document.getElementById('adminModalPromotora')) document.getElementById('adminModalPromotora').textContent = item.promotora || '-';
                    if (document.getElementById('adminModalPDV')) document.getElementById('adminModalPDV').textContent = item.nombre_pdv || '-';
                    if (document.getElementById('adminModalDireccion')) document.getElementById('adminModalDireccion').textContent = item.direccion_pdv || '-';
                    if (document.getElementById('adminModalMarca')) document.getElementById('adminModalMarca').textContent = item.marca || '-';
                    if (document.getElementById('adminModalActividad')) document.getElementById('adminModalActividad').textContent = item.actividad || '-';
                    if (document.getElementById('adminModalFecha')) document.getElementById('adminModalFecha').textContent = item.fecha_formateada || '-';
                    if (document.getElementById('adminModalAsesor')) document.getElementById('adminModalAsesor').textContent = item.asesor_comercial || '-';
                    // Habilita/deshabilita botón de ventas y cierre según estado_ventas
                    const btnVentas = document.getElementById('btnVerVentasAdmin');
                    const btnCierre = document.getElementById('btnVerCierreAdmin');
                    const logDiv = document.getElementById('adminDetalleLog');
                    if (btnVentas && btnCierre) {
                        if (item.estado_ventas === 'Sin Ventas') {
                            btnVentas.disabled = true;
                            btnVentas.style.opacity = 0.5;
                            btnVentas.title = "No hay ventas registradas";
                            btnCierre.disabled = true;
                            btnCierre.style.opacity = 0.5;
                            btnCierre.title = "No hay cierre registrado";
                            if (logDiv) {
                                logDiv.innerHTML = '<p style="color:#c0392b;font-weight:bold;margin:10px 0 0 0;">No hay ventas ni cierre registrados aún.</p>';
                            }
                        } else {
                            btnVentas.disabled = false;
                            btnVentas.style.opacity = 1;
                            btnVentas.title = "";
                            btnCierre.disabled = false;
                            btnCierre.style.opacity = 1;
                            btnCierre.title = "";
                            if (logDiv) logDiv.innerHTML = '';
                        }
                    }
                    // Limpia log
                    if (document.getElementById('adminDetalleLog')) document.getElementById('adminDetalleLog').innerHTML = '';
                    // Muestra el popup
                    if (document.getElementById('adminDetallePopup')) document.getElementById('adminDetallePopup').style.display = 'flex';
                });
            }
            // Botón aceptar
            if (document.getElementById('btnAceptarSolicitud')) {
                document.getElementById('btnAceptarSolicitud').onclick = async function() {
                    if (!adminDetalleData) return;
                    await actualizarEstadoSolicitudAdmin(adminDetalleData.id, 1);
                };
            }
            // Botón denegar
            if (document.getElementById('btnDenegarSolicitud')) {
                document.getElementById('btnDenegarSolicitud').onclick = async function() {
                    if (!adminDetalleData) return;
                    await actualizarEstadoSolicitudAdmin(adminDetalleData.id, 2);
                };
            }
        });
        // Actualizar estado de la solicitud
        async function actualizarEstadoSolicitudAdmin(id, estado) {
            try {
                if (document.getElementById('loadingSpinner')) document.getElementById('loadingSpinner').style.display = 'flex';
                const resp = await fetch('../../../Backend/FuncionalidadPHP/Administrador/updateRegistroAdmin.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id, estado })
                });
                const result = await resp.json();
                if (document.getElementById('loadingSpinner')) document.getElementById('loadingSpinner').style.display = 'none';
                if (result && result.success) {
                    alert('Solicitud actualizada exitosamente');
                    closeAdminDetallePopup();
                    // Recarga la página para reflejar el cambio
                    location.reload();
                } else {
                    alert('Error al actualizar el estado: ' + (result && result.error ? result.error : 'Error desconocido'));
                }
            } catch (e) {
                if (document.getElementById('loadingSpinner')) document.getElementById('loadingSpinner').style.display = 'none';
                alert('Error al actualizar el estado: ' + (e && e.message ? e.message : e));
            }
        }
        // Ver ventas
        async function verVentasAdmin() {
            if (!adminDetalleData) return;
            try {
                const resp = await fetch(`/Backend/FuncionalidadPHP/Administrador/get_ventas_turno.php?id=${adminDetalleData.id}`);
                const data = await resp.json();
                // Oculta el popup de detalles y muestra el de ventas
                if (document.getElementById('adminDetallePopup')) document.getElementById('adminDetallePopup').style.display = 'none';
                mostrarPopupVentasAdmin(Array.isArray(data) ? data : []);
            } catch (e) {
                alert('Error al cargar ventas.');
            }
        }
        // Mostrar popup de ventas en tabla
        function mostrarPopupVentasAdmin(ventas) {
            let popup = document.getElementById('popupVentasAdmin');
            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'popupVentasAdmin';
                popup.style.position = 'fixed';
                popup.style.top = '0';
                popup.style.left = '0';
                popup.style.width = '100vw';
                popup.style.height = '100vh';
                popup.style.background = 'rgba(0,0,0,0.85)';
                popup.style.display = 'flex';
                popup.style.alignItems = 'center';
                popup.style.justifyContent = 'center';
                popup.style.zIndex = '9999';
                popup.innerHTML = `
                    <div style="background:#fff;border-radius:16px;min-width:420px;max-width:95vw;max-height:90vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                        <div class="modal-header" style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82d6 100%);color:#fff;padding:24px 28px 18px 28px;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:space-between;">
                            <span style="font-size:22px;font-weight:700;color:#ffffff;text-shadow:0 2px 4px rgba(0,0,0,0.3);letter-spacing:0.5px;">
                                📊 Ventas del Registro
                            </span>
                            <button onclick="document.getElementById('popupVentasAdmin').style.display='none';if(document.getElementById('adminDetallePopup'))document.getElementById('adminDetallePopup').style.display='flex';" 
                                    style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:50%;width:36px;height:36px;color:#fff;font-size:18px;cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
                                ✕
                            </button>
                        </div>
                        <div style="padding:28px;background:linear-gradient(135deg, #f8fafe 0%, #ffffff 100%);overflow-y:auto;max-height:calc(90vh - 120px);">
                            <div id="tablaVentasAdminContainer"></div>
                            <div style="text-align:center;margin-top:24px;">
                                <button id="btnVolverDetalleAdmin" 
                                        style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);color:#fff;padding:12px 28px;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(30,60,114,0.3);text-transform:uppercase;letter-spacing:0.5px;">
                                    ← Volver al Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(popup);
            }

            // Llena la tabla con encabezado azul y botón Ver
            let totalCantidad = 0;
            let totalPrecio = 0;
            let tablaHtml = `
                <div class="tabla-ventas-container" style="border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);background:#fff;overflow:hidden;">
                    <table class="tabla-ventas" style="width:100%;border-collapse:separate;border-spacing:0;margin-bottom:0;">
                        <thead>
                            <tr style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);color:#fff;">
                                <th style="padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Producto</th>
                                <th style="padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Presentación</th>
                                <th style="padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Segmento</th>
                                <th style="padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Marca Vehículo</th>
                                <th style="padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Cantidad</th>
                                <th style="padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Precio Unit.</th>
                                <th style="padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Fecha</th>
                                <th style="padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Motivo Visita</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            if (ventas.length === 0) {
                tablaHtml += `
                    <tr>
                        <td colspan="8" style="text-align:center;color:#dc2626;padding:32px 20px;font-weight:600;font-size:16px;background:linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);border-radius:8px;border:1px solid rgba(220,38,38,0.2);">
                            No hay ventas registradas para este turno
                        </td>
                    </tr>
                `;
            } else {
                ventas.forEach((v, idx) => {
                    // Suma totales
                    let cantidad = parseFloat(v.cantidad) || 0;
                    let precio = parseFloat(v.precio_unitario) || 0;
                    totalCantidad += cantidad;
                    totalPrecio += precio;
                    
                    let rowStyle = idx % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafe;';
                    
                    tablaHtml += `
                        <tr style="${rowStyle}transition:all 0.3s ease;" onmouseover="this.style.background='linear-gradient(90deg, #f0f7ff 0%, #e3f2fd 100%)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(30,60,114,0.15)'" onmouseout="this.style.background='${rowStyle}';this.style.transform='translateY(0)';this.style.boxShadow='none'">
                            <td style="padding:14px 16px;font-size:14px;color:#2c3e50;font-weight:400;border-bottom:1px solid rgba(220,225,232,0.6);">${v.producto || '-'}</td>
                            <td style="padding:14px 16px;font-size:14px;color:#2c3e50;font-weight:400;border-bottom:1px solid rgba(220,225,232,0.6);">${v.presentacion || '-'}</td>
                            <td style="padding:14px 16px;font-size:14px;color:#2c3e50;font-weight:400;border-bottom:1px solid rgba(220,225,232,0.6);">${v.segmento || '-'}</td>
                            <td style="padding:14px 16px;font-size:14px;color:#2c3e50;font-weight:400;border-bottom:1px solid rgba(220,225,232,0.6);">${v.marca_vehiculo || '-'}</td>
                            <td style="padding:14px 16px;font-size:14px;color:#1e3c72;font-weight:600;text-align:center;border-bottom:1px solid rgba(220,225,232,0.6);">${cantidad || '-'}</td>
                            <td style="padding:14px 16px;font-size:14px;color:#1e3c72;font-weight:600;text-align:center;border-bottom:1px solid rgba(220,225,232,0.6);">${precio ? '$' + precio.toLocaleString('es-CO') : '-'}</td>
                            <td style="padding:14px 16px;font-size:14px;color:#2c3e50;font-weight:400;border-bottom:1px solid rgba(220,225,232,0.6);">${v.fecha || '-'}</td>
                            <td style="padding:14px 16px;font-size:14px;color:#2c3e50;font-weight:400;border-bottom:1px solid rgba(220,225,232,0.6);">${v.motivo_visita || '-'}</td>
                        </tr>
                    `;
                });
                // Fila de totales
                tablaHtml += `
                    <tr style="background:linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);font-weight:700;font-size:15px;border-top:3px solid #1e3c72;">
                        <td colspan="4" style="text-align:right;padding:16px;color:#1e3c72;font-size:16px;border-bottom:none;">
                            <strong>TOTALES:</strong>
                        </td>
                        <td style="text-align:center;padding:16px;color:#1e3c72;font-size:16px;font-weight:800;border-bottom:none;">${totalCantidad}</td>
                        <td style="text-align:center;padding:16px;color:#28a745;font-size:16px;font-weight:800;border-bottom:none;">$${totalPrecio.toLocaleString('es-CO')}</td>
                        <td colspan="2" style="border-bottom:none;"></td>
                    </tr>
                `;
            }
            tablaHtml += `
                        </tbody>
                    </table>
                </div>
            `;
            
            document.getElementById('tablaVentasAdminContainer').innerHTML = tablaHtml;
            popup.style.display = 'flex';

            document.getElementById('btnVolverDetalleAdmin').onclick = function() {
                popup.style.display = 'none';
                if (document.getElementById('adminDetallePopup')) document.getElementById('adminDetallePopup').style.display = 'flex';
            };
        }
        // Popup de Cierre con estilo
        function mostrarPopupCierreAdmin(cierre) {
            let popup = document.getElementById('popupCierreAdmin');
            // Corrige la ruta de la foto si es necesario
            let fotoUrl = cierre.foto_activacion || '';
            if (fotoUrl.includes('/Visuales/Administrador/')) {
                fotoUrl = fotoUrl.replace('/Visuales/Administrador', '');
            }
            // Si la ruta no es absoluta, prepéndale el dominio actual
            if (fotoUrl && !/^https?:\/\//i.test(fotoUrl)) {
                // Si la ruta ya empieza por /, solo concatena
                if (fotoUrl.startsWith('/')) {
                    fotoUrl = window.location.origin + fotoUrl;
                } else {
                    fotoUrl = window.location.origin + '/' + fotoUrl;
                }
            }
            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'popupCierreAdmin';
                popup.style.position = 'fixed';
                popup.style.top = '0';
                popup.style.left = '0';
                popup.style.width = '100vw';
                popup.style.height = '100vh';
                popup.style.background = 'rgba(0,0,0,0.85)';
                popup.style.display = 'flex';
                popup.style.alignItems = 'center';
                popup.style.justifyContent = 'center';
                popup.style.zIndex = '9999';
                popup.innerHTML = `
                    <div style="background:#fff;border-radius:16px;min-width:420px;max-width:95vw;max-height:90vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                        <div class="modal-header" style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82d6 100%);color:#fff;padding:24px 28px 18px 28px;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:space-between;">
                            <span style="font-size:22px;font-weight:700;color:#ffffff;text-shadow:0 2px 4px rgba(0,0,0,0.3);letter-spacing:0.5px;">
                                📸 Cierre del Registro
                            </span>
                            <button onclick="document.getElementById('popupCierreAdmin').style.display='none';if(document.getElementById('adminDetallePopup'))document.getElementById('adminDetallePopup').style.display='flex';" 
                                    style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:50%;width:36px;height:36px;color:#fff;font-size:18px;cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
                                ✕
                            </button>
                        </div>
                        <div style="padding:28px;background:linear-gradient(135deg, #f8fafe 0%, #ffffff 100%);overflow-y:auto;max-height:calc(90vh - 120px);">
                            <div style="text-align:center;margin-bottom:24px;padding:20px;background:linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);border-radius:12px;border:1px solid rgba(30,60,114,0.1);">
                                ${
                                    fotoUrl
                                        ? `<img src="${fotoUrl}" alt="Foto Activación" style="max-width:350px;max-height:350px;border-radius:12px;border:3px solid #e3f2fd;box-shadow:0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(30,60,114,0.15);transition:all 0.3s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" />`
                                        : '<div style="padding:40px;background:linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);border-radius:8px;border:1px solid rgba(220,38,38,0.2);"><span style="color:#dc2626;font-size:16px;font-weight:600;">📷 No hay foto de activación disponible</span></div>'
                                }
                            </div>
                            <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);background:#fff;margin-bottom:24px;">
                                <table style="width:100%;border-collapse:separate;border-spacing:0;">
                                    <thead>
                                        <tr style="background:linear-gradient(135deg, #305fbf 0%, #4dabf7 100%);color:#fff;">
                                            <th style="padding:16px 12px;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Personas Impactadas</th>
                                            <th style="padding:16px 12px;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style="background:#ffffff;">
                                            <td style="padding:16px 12px;background:#ffffff;color:#2c3e50;font-size:14px;border-bottom:1px solid rgba(220,225,232,0.3);text-align:center;font-weight:600;color:#1e3c72;">${cierre.personas_impactadas || '0'}</td>
                                            <td style="padding:16px 12px;background:#ffffff;color:#2c3e50;font-size:14px;border-bottom:1px solid rgba(220,225,232,0.3);">${cierre.observaciones_cierre || 'Sin observaciones'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div style="text-align:center;">
                                <button id="btnVolverDetalleCierreAdmin" 
                                        style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);color:#fff;padding:12px 28px;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(30,60,114,0.3);text-transform:uppercase;letter-spacing:0.5px;">
                                    ← Volver al Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(popup);
            } else {
                // Corrige la ruta si el popup ya existe
                let fotoHtml = fotoUrl
                    ? `<img src="${fotoUrl}" alt="Foto Activación" style="max-width:350px;max-height:350px;border-radius:12px;border:3px solid #e3f2fd;box-shadow:0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(30,60,114,0.15);transition:all 0.3s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" />`
                    : '<div style="padding:40px;background:linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);border-radius:8px;border:1px solid rgba(220,38,38,0.2);"><span style="color:#dc2626;font-size:16px;font-weight:600;">📷 No hay foto de activación disponible</span></div>';
                popup.querySelector('div[style*="text-align:center"]').innerHTML = fotoHtml;
                popup.querySelector('tbody').innerHTML = `
                    <tr style="background:#ffffff;">
                        <td style="padding:16px 12px;background:#ffffff;color:#2c3e50;font-size:14px;border-bottom:1px solid rgba(220,225,232,0.3);text-align:center;font-weight:600;color:#1e3c72;">${cierre.personas_impactadas || '0'}</td>
                        <td style="padding:16px 12px;background:#ffffff;color:#2c3e50;font-size:14px;border-bottom:1px solid rgba(220,225,232,0.3);">${cierre.observaciones_cierre || 'Sin observaciones'}</td>
                    </tr>
                `;
            }
            popup.style.display = 'flex';
            document.getElementById('btnVolverDetalleCierreAdmin').onclick = function() {
                popup.style.display = 'none';
                if (document.getElementById('adminDetallePopup')) document.getElementById('adminDetallePopup').style.display = 'flex';
            };
        }

        // Nueva función para ver cierre
        async function verCierreAdmin() {
            if (!adminDetalleData) return;
            try {
                const resp = await fetch(`/Backend/FuncionalidadPHP/Administrador/get_cierre_turno.php?id_turno=${adminDetalleData.id}`);
                const data = await resp.json();
                if (document.getElementById('adminDetallePopup')) document.getElementById('adminDetallePopup').style.display = 'none';
                mostrarPopupCierreAdmin(data);
            } catch (e) {
                alert('Error al cargar cierre.');
            }
        }

        // Asigna los botones de ventas y cierre a las funciones nuevas
        document.addEventListener('DOMContentLoaded', function() {
            const btnVentas = document.getElementById('btnVerVentasAdmin');
            if (btnVentas) btnVentas.onclick = verVentasAdmin;
            const btnCierre = document.getElementById('btnVerCierreAdmin');
            if (btnCierre) btnCierre.onclick = verCierreAdmin;
        });
// Filtros
function aplicarFiltrosTablaAdmin() {
    const nombrePDV = (document.getElementById('filtroNombrePDV')?.value || '').toLowerCase();
    const fechaFiltro = document.getElementById('filtroFecha')?.value || '';
    const estado = document.getElementById('filtroEstado')?.value || '';

    filteredData = allData.filter(item => {
        let coincide = true;
        if (nombrePDV && item.nombre_pdv) {
            coincide = coincide && item.nombre_pdv.toLowerCase().includes(nombrePDV);
        }
        // Filtro de fecha robusto: compara formato ISO (yyyy-mm-dd)
        if (fechaFiltro) {
            let fechaData = item.fecha || item.fecha_formateada || '';
            // Si la fecha viene en formato dd/mm/yyyy, conviértela a yyyy-mm-dd
            if (fechaData && fechaData.includes('/')) {
                const [d, m, y] = fechaData.split('/');
                fechaData = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            coincide = coincide && (fechaData === fechaFiltro);
        }
        if (estado) {
            coincide = coincide && item.id_estado === estado;
        }
        return coincide;
    });
    currentPage = 1;
    renderTableAdmin();
    updatePaginationAdmin();
    mostrarInfoRegistros();
}

// Listeners para filtros
document.addEventListener('DOMContentLoaded', function() {
    const inputPDV = document.getElementById('filtroNombrePDV');
    const inputFecha = document.getElementById('filtroFecha');
    const inputEstado = document.getElementById('filtroEstado');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');

    if (inputPDV) inputPDV.addEventListener('input', aplicarFiltrosTablaAdmin);
    if (inputFecha) inputFecha.addEventListener('change', aplicarFiltrosTablaAdmin);
    if (inputEstado) inputEstado.addEventListener('change', aplicarFiltrosTablaAdmin);

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function() {
            if (inputPDV) inputPDV.value = '';
            if (inputFecha) inputFecha.value = '';
            if (inputEstado) inputEstado.value = '';
            filteredData = [...allData];
            currentPage = 1;
            renderTableAdmin();
            updatePaginationAdmin();
            mostrarInfoRegistros();
        });
    }
});

// Descargar información con spinner y progreso
document.addEventListener('DOMContentLoaded', function() {
    const btnDescargar = document.getElementById('btnDescargarInfo');
    if (btnDescargar) {
        btnDescargar.addEventListener('click', function() {
            // Usar el nuevo sistema de progreso para descarga
            mostrarCargandoDescarga('InformePromotoriaCompañia.xlsx');

            // Usar fetch para obtener el archivo y descargarlo como blob
            fetch('../../Backend/FuncionalidadPHP/Administrador/descargar_info.php', {
                method: 'GET',
                credentials: 'same-origin'
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al descargar el archivo');
                
                // Actualizar progreso manualmente
                actualizarProgreso(40, 'Obteniendo archivo del servidor...');
                
                return response.blob();
            })
            .then(blob => {
                actualizarProgreso(70, 'Preparando descarga...');
                
                // Obtener nombre sugerido del header si existe
                let filename = 'InformePromotoriaCompañia.xlsx';
                try {
                    const disposition = this.headers && this.headers.get
                        ? this.headers.get('Content-Disposition')
                        : null;
                    if (disposition) {
                        const match = disposition.match(/filename="?([^"]+)"?/);
                        if (match) filename = match[1];
                    }
                } catch {}
                
                actualizarProgreso(90, 'Iniciando descarga...');
                
                // Descargar el archivo
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                
                actualizarProgreso(100, 'Descarga completada exitosamente');
                
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }, 100);
            })
            .catch((error) => {
                console.error('Error en descarga:', error);
                alert('No se pudo descargar el archivo.');
            })
            .finally(() => {
                setTimeout(() => {
                    ocultarCargando();
                }, 1000);
            });
        });
    }
});