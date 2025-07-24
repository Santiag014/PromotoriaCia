<?php
include __DIR__ . "/../../auth.php";
// Incluir el gestor de sesiones universal
include __DIR__ . "/../../Backend/FuncionalidadPHP/session-include.php";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotoria Compañia</title>
    <link rel="icon" href="../../Media/Imagenes/ciaLogo.png" type="image/x-icon">
    <link rel="stylesheet" href="../../Visuales/Promotor/Estilos/EstilosPromotorNuevo.css">
    <script src="../../Backend/FuncionalidadJS/Promotor/FuncionalidadPromotorNuevo.js" defer></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="GridContanier" id="GridContanier">
        <div class="GridHeaderApp">
            <div class="LogoDashboard">
                <img src="../../Media/Imagenes/Cia_Logo.png" alt="Logo">
            </div>
            <div class="HeaderActions">
                <div class="ModulosDashUser" onclick="window.location.href='../../Visuales/Administrador/Dashboard.php';" title="Abrir Dashboard de PowerBI">
                    <span>📊</span>
                    <h5>DASHBOARD</h5>
                </div>
                <div class="ModulosDashUser" onclick="RedirigirLogin(<?php echo $_SESSION['datos_usuario']['id']; ?>)" title="Cerrar sesión">
                    <img src="../../Media/Iconos/Salir.png" alt="Logo">
                    <h5>SALIR</h5>
                </div>
            </div>
        </div>  

        <div class="GridContentApp">
            <!-- Información del usuario -->
            <div class="user-info">
                <div class="user-details">
                    <h3><?php echo $_SESSION['nombre_usuario']; ?></h3>
                    <p><?php echo $_SESSION['nombre_rol']; ?></p>
                </div>
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="Buscar por punto de venta..." class="search-input">
                    <div class="filter-container">
                        <input type="date" id="filterDate" class="filter-date" title="Filtrar por fecha">
                        <select id="filterStatus" class="filter-select">
                            <option value="">Todos los estados</option>
                            <option value="1">ACTIVO</option>
                            <option value="2">PROGRAMADO</option>
                            <option value="0">AUSENTE</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tabla de datos -->
            <div class="table-container">
                <div class="table-wrapper">
                    <table class="data-table" id="dataTable">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Punto de Venta</th>
                                <th>Dirección</th>
                                <th>Ubicación</th>
                                <th>Marca</th>
                                <th>Actividad</th>
                                <th>PVL</th>
                                <th>CVL</th>
                                <th>MCO</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <!-- Los datos se cargarán aquí mediante JavaScript -->
                        </tbody>
                    </table>
                </div>
                
                <!-- Footer fijo de la tabla -->
                <div class="table-footer">
                    <div class="table-footer-left">
                        <div class="records-info">
                            Mostrando <span class="highlight" id="recordsStart">0</span> - <span class="highlight" id="recordsEnd">0</span> de <span class="highlight" id="recordsTotal">0</span> registros
                        </div>
                    </div>
                    
                    <div class="table-footer-right">
                        <div class="pagination-controls" id="paginationControls">
                            <button class="page-btn" id="firstPage" title="Primera página">❮❮</button>
                            <button class="page-btn" id="prevPage" title="Página anterior">❮</button>
                            <span id="pageNumbers"></span>
                            <button class="page-btn" id="nextPage" title="Página siguiente">❯</button>
                            <button class="page-btn" id="lastPage" title="Última página">❯❯</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido anterior oculto para mantener compatibilidad -->
            <div style="display: none;">
                <div class="ContenedorSolicitudes">
                    <div class="NombreUser">
                        <p class="Nombre"><strong><?php echo $_SESSION['nombre_usuario']; ?></strong></p>
                        <p class="Rol"><?php echo $_SESSION['nombre_rol']; ?></p>
                    </div>
                    <div class="MostrarListaDesplegable">
                        <div class="InputFiltrar">
                            <input type="text" placeholder="Buscar Puntos de Venta...">
                        </div>
                        <div class="Lista">
                            <ul>
                                <!-- Datos Del PDV -->
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para detalles -->
    <div id="detailsModal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Detalles del Punto de Venta</h3>
                <button class="modal-close" onclick="closeDetailsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-item">
                    <strong>Punto de Venta:</strong>
                    <span id="modalPDV">-</span>
                </div>
                <div class="detail-item">
                    <strong>Dirección:</strong>
                    <span id="modalDireccion">-</span>
                </div>
                <div class="detail-item">
                    <strong>Marca:</strong>
                    <span id="modalMarca">-</span>
                </div>
                <div class="detail-item">
                    <strong>Fecha:</strong>
                    <span id="modalFecha">-</span>
                </div>
                <div class="detail-item location-item">
                    <strong>Ubicación:</strong>
                    <button id="modalUbicacionBtn" class="location-btn-modal" onclick="abrirUbicacion()" title="Ver ubicación en Google Maps">
                        �️ Ver en Google Maps
                    </button>
                </div>
            </div>
            <!-- Mensaje de error de cierre -->
            <div id="modalCierreErrorMsg"></div>
            <div class="modal-actions">
                <button id="modalVentasBtn" class="action-btn ventas-btn" onclick="openVentasForm()">
                    VENTAS
                </button>
                <button id="modalCierreBtn" class="action-btn cierres-btn" onclick="openCierresForm()">
                    CIERRE
                </button>
                <!-- Botón temporal para probar -->
                <!-- <button class="action-btn" onclick="testCierresModal()" style="background: #17a2b8;">
                    TEST CIERRE
                </button> -->
            </div>
        </div>
    </div>

    <!-- Modal para VENTAS -->
    <div id="ventasModal" class="modal-overlay" style="display: none;">
        <div class="modal-content ventas-content">
            <div class="modal-header">
                <h3>Registro de Ventas</h3>
                <button class="modal-close" onclick="closeVentasModal()">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Información del PDV seleccionado -->
                <div class="pdv-info-section">
                    <h4 style="color: #1e3c72; margin-bottom: 15px;">Información del Punto de Venta</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Punto de Venta:</strong>
                            <span id="ventasInfoPDV">-</span>
                        </div>
                        <div class="info-item">
                            <strong>Dirección:</strong>
                            <span id="ventasInfoDireccion">-</span>
                        </div>
                        <div class="info-item">
                            <strong>Marca:</strong>
                            <span id="ventasInfoMarca">-</span>
                        </div>
                        <div class="info-item">
                            <strong>Fecha:</strong>
                            <span id="ventasInfoFecha">-</span>
                        </div>
                    </div>
                </div>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e9ecef;">

                <!-- Formulario de ventas -->
                <!-- Primera fila: Motivo Visita - Llevo Lubricante -->
                <div class="form-grid ventas-row-1" style="display: flex; gap: 24px;">
                    <div class="form-group motivo-visita" style="flex:1;">
                        <label for="motivoVisita">Motivo de Visita:</label>
                        <select id="motivoVisita" class="form-select" onchange="onMotivoVisitaChange()">
                            <option value="">Seleccionar</option>
                            <option value="repuestos">Repuestos</option>
                            <option value="accesorios">Accesorios</option>
                            <option value="lubricantes">Lubricantes</option>
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    <div class="form-group llevo-lubricante" id="llevoLubricanteGroup" style="flex:1;display:none;">
                        <label for="llevoLubricante">¿Llevó adicionalmente algún tipo de lubricante?</label>
                        <select id="llevoLubricante" class="form-select" onchange="onLlevoLubricanteChange()">
                            <option value="">Seleccionar</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>
                <!-- Segunda fila: Marca Inicial - Marca Final -->
                <div class="form-grid ventas-row-1b" style="display: flex; gap: 24px;">
                    <div class="form-group marca-inicial" id="marcaInicialGroup" style="flex:1;">
                        <label for="marcaInicial">Marca Inicial:</label>
                        <select id="marcaInicial" class="form-select">
                            <option value="">Seleccionar</option>
                        </select>
                    </div>
                    <div class="form-group marca-final" id="marcaFinalGroup" style="flex:1;">
                        <label for="marcaFinal">Marca Final:</label>
                        <select id="marcaFinal" class="form-select" onchange="filterProductsByBrand()">
                            <option value="">Seleccionar</option>
                        </select>
                    </div>
                </div>

                <!-- Tercera fila: Producto de Venta - Presentación -->
                <div class="form-grid ventas-row-2" id="productosVentaRow">
                    <div class="form-group producto-venta">
                        <label for="productosVenta">Productos de Venta:</label>
                        <select id="productosVenta" class="form-select" onchange="toggleOtroProducto()">
                            <option value="">Seleccionar marca final primero</option>
                        </select>
                        <input type="text" id="otroProductoVenta" class="form-input" placeholder="Especifique el producto" style="display: none; margin-top: 8px;">
                    </div>
                    <div class="form-group presentacion">
                        <label for="presentacionVenta">Presentación:</label>
                        <select id="presentacionVenta" class="form-select">
                            <option value="">Seleccionar</option>
                        </select>
                    </div>
                </div>

                <!-- Cuarta fila: Segmento - Marca del Vehículo -->
                <div class="form-grid ventas-row-3" id="segmentoVehiculoRow">
                    <div class="form-group segmento">
                        <label for="segmentoVenta">Segmento:</label>
                        <select id="segmentoVenta" class="form-select">
                            <option value="">Seleccionar</option>
                            <option value="PVL">PVL</option>
                            <option value="CVL">CVL</option>
                            <option value="MCO">MCO</option>
                        </select>
                    </div>
                    <div class="form-group marca-vehiculo">
                        <label for="marcaVehiculo">Marca del Vehículo:</label>
                        <select id="marcaVehiculo" class="form-select">
                            <option value="">Seleccionar</option>
                        </select>
                    </div>
                </div>

                <!-- Quinta fila: Cantidad - Precio Unitario -->
                <div class="form-grid ventas-row-4" id="cantidadPrecioRow">
                    <div class="form-group cantidad">
                        <label for="cantidadVenta">Cantidad:</label>
                        <input type="number" id="cantidadVenta" class="form-input" placeholder="Cantidad" min="1">
                    </div>
                    <div class="form-group precio">
                        <label for="precioVenta">Precio Unitario:</label>
                        <input type="text" id="precioVenta" class="form-input" placeholder="$ 0" oninput="formatCurrency(this)">
                    </div>
                </div>

                <!-- Sexta fila: Observaciones -->
                <div class="form-grid ventas-row-5">
                    <div class="form-group full-width">
                        <label for="observacionesVenta">Observaciones:</label>
                        <select id="observacionesVenta" class="form-select">
                            <option value="">Seleccionar observación</option>
                            <option value="Cliente satisfecho">Cliente satisfecho</option>
                            <option value="No interesado">No interesado</option>
                            <option value="No estaba el encargado">No estaba el encargado</option>
                            <option value="No se realizó venta">No se realizó venta</option>
                            <option value="Cliente solicita información adicional">Cliente solicita información adicional</option>
                            <option value="Cliente ya tenía producto">Cliente ya tenía producto</option>
                            <option value="Punto cerrado">Punto cerrado</option>
                            <option value="Otro motivo">Otro motivo</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="action-btn cancel-btn" onclick="closeVentasModal()">Cancelar</button>
                <button class="action-btn save-btn" onclick="saveVentas()">💾 Guardar</button>
            </div>
        </div>
    </div>

    <!-- Modal para CIERRES -->
    <div id="cierresModal" class="modal-overlay" style="display: none;">
        <div class="modal-content cierres-content">
            <div class="modal-header">
                <h3>Formato de Cierre</h3>
                <button class="modal-close" onclick="closeCierresModal()">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Información del PDV seleccionado -->
                <div class="pdv-info-section">
                    <h4 style="color: #1e3c72; margin-bottom: 15px;">Información del Punto de Venta</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Punto de Venta:</strong>
                            <span id="cierresInfoPDV">-</span>
                        </div>
                        <div class="info-item">
                            <strong>Dirección:</strong>
                            <span id="cierresInfoDireccion">-</span>
                        </div>
                        <div class="info-item">
                            <strong>Marca:</strong>
                            <span id="cierresInfoMarca">-</span>
                        </div>
                        <div class="info-item">
                            <strong>Fecha:</strong>
                            <span id="cierresInfoFecha">-</span>
                        </div>
                    </div>
                </div>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e9ecef;">

                <div class="drag-drop-area" id="dragDropArea">
                    <div class="drag-drop-content">
                        <div class="drag-icon">📁</div>
                        <p>Arrastra y suelta archivos aquí</p>
                        <p class="drag-sub">o <span class="drag-link" onclick="selectFiles()">haz clic para seleccionar</span></p>
                        <input type="file" id="fileInput" multiple accept=".pdf,.jpg,.png,.xlsx,.doc,.docx" style="display: none;">
                    </div>
                </div>
                <div class="files-list" id="filesList"></div>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="cierresPersonasImpactadas">Personas Impactadas:</label>
                        <input type="number" id="cierresPersonasImpactadas" class="form-input" placeholder="Cantidad de personas impactadas" min="0">   
                    </div>
                    <div class="form-group">
                        <label for="cierresHallazgos">Hallazgos del PDV:</label>
                        <select id="cierresHallazgos" class="form-select">
                            <option value="">Seleccionar hallazgo</option>
                            <option value="Activación exitosa, con ventas.">Activación exitosa, con ventas.</option>
                            <option value="Activación sin ventas.">Activación sin ventas.</option>
                            <option value="Bajo flujo, poca interacción.">Bajo flujo, poca interacción.</option>
                            <option value="Cliente interesado, sin cierre.">Cliente interesado, sin cierre.</option>
                            <option value="Punto sin asesor.">Punto sin asesor.</option>
                            <option value="No se realizó por clima.">No se realizó por clima.</option>
                            <option value="Zona insegura, breve presencia.">Zona insegura, breve presencia.</option>
                            <option value="Buena atención del punto.">Buena atención del punto.</option>
                            <option value="Sin novedades.">Sin novedades.</option>
                            <option value="Cancelada por seguridad.">Cancelada por seguridad.</option>
                        </select>
                    </div>
                    <!-- <div class="form-group full-width">
                        <label for="cierresNotas">Notas del Cierre:</label>
                        <textarea id="cierresNotas" class="form-textarea" placeholder="Notas y observaciones del cierre..."></textarea>
                    </div> -->
                </div>
            </div>
            <div class="modal-actions">
                <button class="action-btn cancel-btn" onclick="closeCierresModal()">Cancelar</button>
                <button class="action-btn save-btn" onclick="saveCierres()">💾 Guardar</button>
            </div>
        </div>
    </div>
</body>
</html>
