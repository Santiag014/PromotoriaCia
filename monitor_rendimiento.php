<?php
// Archivo de monitoreo de rendimiento para PromotoriaCia
header('Content-Type: application/json; charset=utf-8');

include __DIR__ . '/Backend/ConexionBD/Conexion.php';

$resultados = [];

try {
    if (!$conexion) {
        throw new Exception('No se pudo conectar a la base de datos');
    }
    
    $resultados['conexion'] = '✅ Conectado';
    $resultados['timestamp'] = date('Y-m-d H:i:s');
    
    // Test 1: Verificar índices importantes
    $indices_importantes = [
        'solicitudes' => ['idx_solicitudes_promotor_estado', 'idx_solicitudes_fecha'],
        'solicitudes_cierre' => ['idx_cierre_solicitud'],
        'puntos_venta' => ['idx_puntos_venta_descripcion'],
        'usuarios' => ['idx_usuarios_rol']
    ];
    
    $resultados['indices'] = [];
    foreach ($indices_importantes as $tabla => $indices) {
        $query = "SHOW INDEX FROM $tabla";
        $resultado = $conexion->query($query);
        $indices_existentes = [];
        
        if ($resultado) {
            while ($fila = $resultado->fetch_assoc()) {
                $indices_existentes[] = $fila['Key_name'];
            }
        }
        
        $resultados['indices'][$tabla] = [
            'requeridos' => $indices,
            'existentes' => $indices_existentes,
            'faltantes' => array_diff($indices, $indices_existentes)
        ];
    }
    
    // Test 2: Tiempo de consultas críticas
    $consultas_criticas = [
        'admin_data' => "SELECT COUNT(*) as total FROM solicitudes s 
                       INNER JOIN puntos_venta pv ON pv.id = s.id_punto_venta 
                       INNER JOIN usuarios u_prom ON u_prom.id = s.id_promotor 
                       INNER JOIN usuarios u_ase ON u_ase.id = s.id_asesor_comercial",
        
        'puntos_venta' => "SELECT COUNT(*) as total FROM puntos_venta WHERE descripcion IS NOT NULL",
        
        'asesores' => "SELECT COUNT(*) as total FROM usuarios WHERE id_rol IN (2,4)",
        
        'promotor_data' => "SELECT COUNT(*) as total FROM solicitudes WHERE id_estado = 1"
    ];
    
    $resultados['consultas'] = [];
    foreach ($consultas_criticas as $nombre => $query) {
        $inicio = microtime(true);
        $resultado = $conexion->query($query);
        $fin = microtime(true);
        
        $tiempo = round(($fin - $inicio) * 1000, 2); // en milisegundos
        $registros = 0;
        
        if ($resultado && $fila = $resultado->fetch_assoc()) {
            $registros = $fila['total'];
        }
        
        $resultados['consultas'][$nombre] = [
            'tiempo_ms' => $tiempo,
            'registros' => $registros,
            'rendimiento' => $tiempo < 100 ? 'excelente' : ($tiempo < 500 ? 'bueno' : 'lento')
        ];
    }
    
    // Test 3: Configuración de MySQL
    $config_queries = [
        'query_cache_type' => "SHOW VARIABLES LIKE 'query_cache_type'",
        'query_cache_size' => "SHOW VARIABLES LIKE 'query_cache_size'",
        'tmp_table_size' => "SHOW VARIABLES LIKE 'tmp_table_size'",
        'max_heap_table_size' => "SHOW VARIABLES LIKE 'max_heap_table_size'"
    ];
    
    $resultados['configuracion_mysql'] = [];
    foreach ($config_queries as $nombre => $query) {
        $resultado = $conexion->query($query);
        if ($resultado && $fila = $resultado->fetch_assoc()) {
            $resultados['configuracion_mysql'][$nombre] = $fila['Value'];
        }
    }
    
    // Test 4: Estadísticas de tablas
    $tablas = ['solicitudes', 'puntos_venta', 'usuarios', 'solicitudes_cierre', 'solicitudes_productos'];
    $resultados['estadisticas_tablas'] = [];
    
    foreach ($tablas as $tabla) {
        $query = "SELECT 
                    COUNT(*) as registros,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) as tamaño_mb
                  FROM information_schema.tables 
                  WHERE table_schema = DATABASE() AND table_name = '$tabla'";
        
        $resultado = $conexion->query($query);
        if ($resultado && $fila = $resultado->fetch_assoc()) {
            $resultados['estadisticas_tablas'][$tabla] = [
                'registros' => intval($fila['registros']),
                'tamaño_mb' => floatval($fila['tamaño_mb'])
            ];
        }
    }
    
    // Test 5: Evaluación general
    $tiempo_promedio = array_sum(array_column($resultados['consultas'], 'tiempo_ms')) / count($resultados['consultas']);
    $resultados['evaluacion_general'] = [
        'tiempo_promedio_ms' => round($tiempo_promedio, 2),
        'estado' => $tiempo_promedio < 200 ? 'EXCELENTE' : ($tiempo_promedio < 1000 ? 'BUENO' : 'NECESITA_OPTIMIZACION'),
        'recomendaciones' => []
    ];
    
    // Generar recomendaciones
    if ($tiempo_promedio > 1000) {
        $resultados['evaluacion_general']['recomendaciones'][] = 'Ejecutar el archivo optimizacion_indices.sql';
    }
    
    $indices_faltantes = 0;
    foreach ($resultados['indices'] as $tabla => $info) {
        $indices_faltantes += count($info['faltantes']);
    }
    
    if ($indices_faltantes > 0) {
        $resultados['evaluacion_general']['recomendaciones'][] = "Faltan $indices_faltantes índices importantes";
    }
    
    $resultados['status'] = 'success';
    
} catch (Exception $e) {
    $resultados = [
        'status' => 'error',
        'mensaje' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
} finally {
    if (isset($conexion)) {
        $conexion->close();
    }
}

echo json_encode($resultados, JSON_PRETTY_PRINT);
?>
