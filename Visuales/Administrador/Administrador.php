<?php
include __DIR__ . "/../../auth.php";

$adminUserIds = [6, 43, 44]; // Cambia esto a los IDs correspondientes
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotoria Compañia</title>
    <link rel="icon" href="../../Media/Imagenes/ciaLogo.png" type="image/x-icon">
    <link rel="stylesheet" href="../../Visuales/Administrador/Estilos/EstilosAdministrador.css">
    <link rel="stylesheet" href="../../Visuales/Administrador/Estilos/NuevoEstiloModalTurnos.css">
    <link rel="stylesheet" href="../../Visuales/Administrador/Estilos/NuevoEstiloPopup.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="../../Visuales/Administrador/Estilos/EstiloPopupAdminDetalle.css">
    <link rel="stylesheet" href="../../Visuales/Administrador/Estilos/LoadingProgressBar.css">
    <!-- Añadiendo Select2 para mejorar los selects con buscador -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="../../Backend/FuncionalidadJS/Administrar/TablaAdmin.js" defer></script>
    <script src="../../Backend/FuncionalidadJS/Administrar/LoadingProgressManager.js" defer></script>
    <script src="../../Backend/FuncionalidadJS/Administrar/GestionTurnos.js" defer></script>
    <script src="../../Backend/FuncionalidadJS/Administrar/auto_completar_pdv.js" defer></script>
    <script src="../../Backend/FuncionalidadJS/Administrar/PopupEnhancements.js" defer></script>
    <script src="../../Backend/FuncionalidadJS/Administrar/AdminDetailEnhancements.js" defer></script>
</head>
<body>
    <div id="loadingSpinner" class="loading-spinner" style="display:none;">
        <div class="loading-container">
            <div class="loading-logo">
                <div class="modern-spinner">
                    <div class="spinner-ring ring-1"></div>
                    <div class="spinner-ring ring-2"></div>
                    <div class="spinner-ring ring-3"></div>
                    <div class="spinner-center"></div>
                </div>
            </div>
            <div class="loading-content">
                <div class="loading-text">
                    <span id="loadingMessage">Procesando, por favor espere...</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                        <div class="progress-text">
                            <span id="progressPercent">0%</span>
                        </div>
                    </div>
                </div>
                <div class="loading-details">
                    <span id="loadingDetails">Iniciando proceso...</span>
                </div>
            </div>
        </div>
        <div class="loading-backdrop"></div>
    </div>
    <div class="GridContanier" id="GridContanier">
        <div class="GridHeaderApp">
            <div class="LogoDashboard">
                <img src="../../Media/Imagenes/Cia_Logo.png" alt="Logo">
            </div>
            <div class="HeaderActions">
                <div class="ModulosDashUser" id="btnDescargarInfo" title="Descargar Información">
                    <img src="../../Media/Iconos/descargar_informacion.png" alt="turnos-icon" width="20" height="20">
                    <h5>DECARGAR INFORMACIÓN</h5>
                </div>
                <div class="ModulosDashUser" onclick="window.location.href='../../Visuales/Administrador/Dashboard.php';" title="Abrir Dashboard de PowerBI">
                    <span>📊</span>
                    <h5>DASHBOARD</h5>
                </div>
                <div class="ModulosDashUser" id="btnTurnos" title="Gestionar Turnos">
                    <img src="../../Media/Iconos/calendario.png" alt="turnos-icon" width="20" height="20">
                    <h5>TURNOS</h5>
                </div>
                <div class="ModulosDashUser" onclick="window.location.href='../../logout.php'" title="Salir">
                    <img src="../../Media/Iconos/puerta.png" alt="turnos-icon" width="20" height="20">
                    <h5>SALIR</h5>
                </div>
            </div>
        </div>

        <div class="GridContentApp">
            <div class="promotor-title">
                <div class="promotor-info">
                    <h1><?php echo $_SESSION['nombre_usuario']; ?></h1>
                    <p class="promotor-role"><?php echo $_SESSION['descripcion']; ?></p>
                </div>
                <div class="search-controls">
                    <input type="text" id="filtroNombrePDV" placeholder="Buscar por punto de venta..." aria-label="Buscar punto de venta">
                    <input type="date" id="filtroFecha" class="date-picker" aria-label="Seleccionar fecha">
                    <select class="dropdown" id="filtroEstado" aria-label="Filtrar por estado">
                        <option value="">Todos los estados</option>
                        <option value="1">Aceptado</option>
                        <option value="2">Denegedo</option>
                        <option value="3">Pendiente</option>
                    </select>
                    <button class="btn-limpiar" id="btnLimpiarFiltros">
                        <img src="../../Media/Iconos/Aceptar.png" alt="Limpiar">
                        Limpiar
                    </button>
                </div>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>FECHA</th>
                            <th>PUNTO DE VENTA</th>
                            <th>DIRECCIÓN</th>
                            <th>UBICACIÓN</th>
                            <th>MARCA</th>
                            <th>ACTIVIDAD</th>
                            <th>PROMOTOR</th>
                            <th>ESTADO</th>
                            <th>VENTAS</th>
                        </tr>
                    </thead>
                    <tbody id="datosTabla">
                        <tr>
                            <td colspan="5" class="error-message">
                                <div>Error al cargar los datos</div>
                                <div>error: Internal Server Error</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- Footer fijo de la tabla con info y paginación igual a promotor -->
                <div class="table-footer" style="display:flex;justify-content:space-between;align-items:center;padding:12px 18px 8px 18px;background:#f5f7fa;border-radius:0 0 16px 16px;box-shadow:0 2px 8px rgba(42,82,152,0.04);margin-top:-4px;">
                    <div class="table-footer-left">
                        <div class="records-info" style="font-size:15px;color:#2a5298;font-weight:500;">
                            Mostrando <span class="highlight" id="recordsStart">0</span> - <span class="highlight" id="recordsEnd">0</span> de <span class="highlight" id="recordsTotal">0</span> registros
                        </div>
                    </div>
                    <div class="table-footer-right">
                        <div class="pagination-controls" id="paginationControls" style="display:flex;gap:4px;">
                            <span id="pageNumbers"></span>
                            <!-- Botón de actualizar -->
                            <button id="btnActualizarTabla" title="Actualizar tabla" style="margin-left:12px;display:flex;align-items:center;gap:4px;padding:4px 12px;background:#1976d2;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">
                                <img src="../../Media/Iconos/actualizar.png" alt="Actualizar" style="width:18px;height:18px;"> Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

    </div>

    <!-- Se han eliminado los modales de detalles y ventas, dejando solo el modal de cierre -->

    <!-- Modal para crear turnos -->
    <div id="modalTurnos" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Crear Nuevo Turno</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <form id="formTurnos" class="turno-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="promotora">Promotora:</label>
                            <select id="promotora" name="promotora" class="select2-search" required>
                                <option value="">Seleccionar Promotora</option>
                                <!-- Se cargará dinámicamente -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="fecha_actividad">Día de Actividad:</label>
                            <input type="date" id="fecha_actividad" name="fecha_actividad" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group full-width">
                            <label for="punto_venta">Punto de Venta:</label>
                            <select id="punto_venta" name="punto_venta" class="select2-search" required>
                                <option value="">Seleccionar Punto de Venta</option>
                                <!-- Se cargará dinámicamente -->
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="direccion">Dirección:</label>
                            <input type="text" id="direccion_input" name="direccion" readonly>
                        </div>
                        <div class="form-group">
                            <label for="ubicacion">Ubicación:</label>
                            <div id="ubicacion_container" class="ubicacion-container">
                                <!-- Aquí se mostrará el enlace a Google Maps -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="ciudad_info">Ciudad:</label>
                            <input type="text" id="ciudad_input" name="ciudad_info" readonly>
                            <!-- Campo oculto para el ID de ciudad -->
                            <input type="hidden" id="ciudad" name="ciudad">
                        </div>
                        <div class="form-group">
                            <label for="canal_info">Canal:</label>
                            <input type="text" id="canal_input" name="canal_info" readonly>
                            <!-- Campo oculto para el ID de canal -->
                            <input type="hidden" id="canal" name="canal">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="asesor_comercial">Asesor Comercial:</label>
                            <select id="asesor_comercial" name="asesor_comercial" class="select2-search" required>
                                <option value="">Seleccionar Asesor</option>
                                <!-- Se cargará dinámicamente -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="nombre_asesor">Tel del Asesor:</label>
                            <input type="text" id="nombre_asesor_input" name="nombre_asesor" readonly>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="tipo_actividad">Tipo de Actividad:</label>
                            <select id="tipo_actividad" name="tipo_actividad" required>
                                <option value="">Seleccionar Actividad</option>         
                                <option value="Activación">Activacion</option>
                                <option value="Eventos">Evento</option>
                                <option value="Epecial">Especial</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="marca">Marca:</label>
                            <select id="marca" name="marca" required>
                                <option value="">Seleccionar Marca</option>
                                <option value="Mobil">Mobil</option>
                                <option value="Terpel">Terpel</option>
                                <option value="Ambas">Ambas</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group full-width">
                            <label for="observaciones">Observaciones:</label>
                            <textarea id="observaciones" name="observaciones" rows="4"></textarea>
                        </div>
                    </div>

                    <!-- Campo oculto para el estado (por defecto es "programado") -->
                    <input type="hidden" id="estado" name="estado" value="programado">

                    <div class="form-actions">
                        <button type="submit" class="btn-guardar">
                            <img src="../../Media/Iconos/guardar.png" alt="Guardar">
                            Guardar
                        </button>
                        <button type="button" class="btn-cancelar" onclick="cerrarModal()">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Popup de detalles estilo Promotor para Administrador -->
    <div id="adminDetallePopup" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="adminModalTitle">Detalles de la Solicitud</h3>
                <button class="modal-close" onclick="closeAdminDetallePopup()">✕</button>
            </div>
            <div class="modal-body">
                <!-- Botones de aceptar/denegar PRIMERO -->
                <div style="display:flex;gap:20px;justify-content:center;margin:0 0 24px 0;">
                    <button id="btnAceptarSolicitud" class="action-btn accept-btn">
                        ✅ Aceptar
                    </button>
                    <button id="btnDenegarSolicitud" class="action-btn reject-btn">
                        ❌ Denegar
                    </button>
                </div>
                <!-- Información de la solicitud DESPUÉS -->
                <div class="detail-item promotora-item">
                    <strong>Promotora:</strong> 
                    <span id="adminModalPromotora">-</span>
                </div>
                <div class="detail-item punto-item">
                    <strong>Punto de Venta:</strong> 
                    <span id="adminModalPDV">-</span>
                </div>
                <div class="detail-item direccion-item">
                    <strong>Dirección:</strong> 
                    <span id="adminModalDireccion">-</span>
                </div>
                <div class="detail-item marca-item">
                    <strong>Marca:</strong> 
                    <span id="adminModalMarca">-</span>
                </div>
                <div class="detail-item actividad-item">
                    <strong>Actividad:</strong> 
                    <span id="adminModalActividad">-</span>
                </div>
                <div class="detail-item fecha-item">
                    <strong>Fecha:</strong> 
                    <span id="adminModalFecha">-</span>
                </div>
                <div class="detail-item asesor-item">
                    <strong>Asesor Comercial:</strong> 
                    <span id="adminModalAsesor">-</span>
                </div>
                <div class="detail-item location-item">
                    <strong>Ubicación:</strong>
                    <button id="adminModalUbicacionBtn" class="location-btn-modal" onclick="abrirUbicacionAdminDetalle()" title="Ver ubicación en Google Maps">
                        📍 Ver en Google Maps
                    </button>
                </div>
                
                <!-- Botones de ventas/cierre DENTRO del modal-body -->
                <div class="modal-actions">
                    <button class="action-btn ventas-btn" id="btnVerVentasAdmin" onclick="verVentasAdmin()">
                        📊 VENTAS
                    </button>
                    <button class="action-btn cierres-btn" id="btnVerCierreAdmin" onclick="verCierreAdmin()">
                        📸 CIERRE
                    </button>
                </div>
            </div>
        </div>
    </div>
</body>
</html>