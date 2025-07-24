// Fix para el popup de cierre - Manejo correcto de imágenes
// Este archivo debe ser incluido después de TablaAdmin.js

// Sobrescribir la función mostrarPopupCierreAdmin con una versión corregida
window.mostrarPopupCierreAdmin = function(cierre) {
    console.log('🔧 Datos de cierre recibidos:', cierre);
    
    let popup = document.getElementById('popupCierreAdmin');
    let fotoUrl = cierre.foto_activacion || '';
    
    console.log('📸 URL original de la foto:', fotoUrl);
    
    // Función para construir URLs posibles
    function buildPossibleUrls(originalUrl) {
        if (!originalUrl) return [];
        
        const urls = [];
        
        // URL original
        urls.push(originalUrl);
        
        // Si contiene Storage/, extraer esa parte
        if (originalUrl.includes('Storage/')) {
            const storagePart = originalUrl.substring(originalUrl.indexOf('Storage/'));
            
            // Diferentes variaciones de ruta
            urls.push('../../' + storagePart);
            urls.push(window.location.origin + '/' + storagePart);
            urls.push(window.location.origin + '/PromotoriaCia/' + storagePart);
            
            // También probar sin el Storage/
            const afterStorage = storagePart.replace('Storage/', '');
            urls.push('../../Storage/' + afterStorage);
        }
        
        // Limpiar URLs duplicadas
        return [...new Set(urls)];
    }
    
    // Función para probar URLs de imagen
    function testImageUrl(urls, callback) {
        if (urls.length === 0) {
            callback(null);
            return;
        }
        
        function tryNext(index) {
            if (index >= urls.length) {
                console.error('❌ No se pudo cargar la imagen desde ninguna URL:', urls);
                callback(null);
                return;
            }
            
            const url = urls[index];
            const img = new Image();
            
            img.onload = function() {
                console.log('✅ Imagen cargada exitosamente desde:', url);
                callback(url);
            };
            
            img.onerror = function() {
                console.log('⚠️ Fallo al cargar desde:', url);
                tryNext(index + 1);
            };
            
            console.log('🔄 Probando URL:', url);
            img.src = url;
        }
        
        tryNext(0);
    }
    
    // Probar las URLs posibles
    const possibleUrls = buildPossibleUrls(fotoUrl);
    console.log('🔍 URLs a probar:', possibleUrls);
    
    testImageUrl(possibleUrls, function(workingUrl) {
        renderCierrePopup(popup, workingUrl, cierre);
    });
};

// Función para renderizar el popup
function renderCierrePopup(popup, fotoUrl, cierre) {
    console.log('🎨 Renderizando popup con URL:', fotoUrl);
    
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'popupCierreAdmin';
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        popup.innerHTML = `
            <div style="background:#fff;border-radius:16px;min-width:420px;max-width:95vw;max-height:90vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div class="modal-header" style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82d6 100%);color:#fff;padding:24px 28px 18px 28px;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;text-shadow:0 2px 4px rgba(0,0,0,0.3);letter-spacing:0.5px;">
                        📸 Cierre del Registro
                    </span>
                    <button onclick="cerrarPopupCierre()" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:50%;width:36px;height:36px;color:#fff;font-size:18px;cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
                        ✕
                    </button>
                </div>
                <div style="padding:28px;background:linear-gradient(135deg, #f8fafe 0%, #ffffff 100%);overflow-y:auto;max-height:calc(90vh - 120px);">
                    <div id="imageContainer" style="text-align:center;margin-bottom:24px;padding:20px;background:linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);border-radius:12px;border:1px solid rgba(30,60,114,0.1);">
                        <!-- La imagen se insertará aquí -->
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
                        <button onclick="volverAlDetalle()" style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);color:#fff;padding:12px 28px;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(30,60,114,0.3);text-transform:uppercase;letter-spacing:0.5px;">
                            ← Volver al Detalle
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
    }
    
    // Insertar la imagen o mensaje de error
    const imageContainer = popup.querySelector('#imageContainer');
    if (fotoUrl) {
        imageContainer.innerHTML = `
            <img src="${fotoUrl}" alt="Foto Activación" 
                 style="max-width:350px;max-height:350px;border-radius:12px;border:3px solid #e3f2fd;box-shadow:0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(30,60,114,0.15);transition:all 0.3s ease;" 
                 onmouseover="this.style.transform='scale(1.02)'" 
                 onmouseout="this.style.transform='scale(1)'"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div style="display:none;padding:40px;background:linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);border-radius:8px;border:1px solid rgba(220,38,38,0.2);">
                <span style="color:#dc2626;font-size:16px;font-weight:600;">❌ Error al cargar la imagen</span>
                <br><small style="color:#7f1d1d;">URL: ${fotoUrl}</small>
            </div>
        `;
    } else {
        imageContainer.innerHTML = `
            <div style="padding:40px;background:linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);border-radius:8px;border:1px solid rgba(220,38,38,0.2);">
                <span style="color:#dc2626;font-size:16px;font-weight:600;">📷 No hay foto de activación disponible</span>
            </div>
        `;
    }
    
    popup.style.display = 'flex';
}

// Funciones auxiliares
window.cerrarPopupCierre = function() {
    const popup = document.getElementById('popupCierreAdmin');
    if (popup) {
        popup.style.display = 'none';
    }
    
    const adminPopup = document.getElementById('adminDetallePopup');
    if (adminPopup) {
        adminPopup.style.display = 'flex';
    }
};

window.volverAlDetalle = function() {
    window.cerrarPopupCierre();
};

console.log('✅ Fix para popup de cierre cargado correctamente');
