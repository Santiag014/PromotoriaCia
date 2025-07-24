<?php
include __DIR__ . '/../../../vendor/autoload.php';
include __DIR__ . '/../../ConexionBD/Conexion.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

// Aumentar el tiempo máximo de ejecución a 300 segundos (5 minutos)
set_time_limit(300);

// Verificar conexión a la BD
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Consultas SQL
$sql_1 = "SELECT 
    DATE_FORMAT(s.fecha_solicitud, '%d/%m/%Y') AS fecha_formateada,
    u_prom.nombre_usuario AS Promotora,
    pv.descripcion AS punto_venta,
    pv.canal AS canal_actividad,
    pv.direccion AS direccion_pdv,
    pv.ubicacion AS ubicacion_pdv,
    u_ase.nombre_usuario AS AsesorComercial,
    u_ase.numero_usuario AS NumeroAsesorComercial,
    s.actividad AS nombre_actividad,
    s.marca AS nombre_marca,
    CASE 
        WHEN s.id_estado = 1 THEN 'Aceptado'
        WHEN s.id_estado = 2 THEN 'Denegado'
        ELSE 'Pendiente'
    END AS nombre_estado,
    pv.segmento_pvl,
    pv.segmento_cvl,
    pv.segmento_mco,
    s.observaciones,
    s.created_at
FROM solicitudes s
INNER JOIN puntos_venta pv ON pv.id = s.id_punto_venta
INNER JOIN usuarios u_prom ON u_prom.id = s.id_promotor
INNER JOIN usuarios u_ase ON u_ase.id = s.id_asesor_comercial
GROUP BY s.id
ORDER BY s.fecha_solicitud DESC;";

$sql_2 = "SELECT 
    DATE_FORMAT(s.fecha_solicitud, '%d/%m/%Y') AS FechaActividad,
    u_prom.nombre_usuario AS Promotor,
    pv.descripcion AS punto_venta,
    s.actividad AS nombre_actividad,
    s.marca AS nombre_marca,
    cie.observaciones_cierre,
    ven.motivo_visita,
    ven.marca_inicial,
    ven.marca_final,
    ven.productos_venta,
    ven.presentacion, 
    ven.segmento,
    ven.marca_vehiculo, 
    ven.cantidad,
    ven.precio, 
    ven.observacion,
    ven.created_at
FROM solicitudes s
INNER JOIN puntos_venta pv ON pv.id = s.id_punto_venta
INNER JOIN usuarios u_prom ON u_prom.id = s.id_promotor
INNER JOIN usuarios u_ase ON u_ase.id = s.id_asesor_comercial
LEFT JOIN solicitudes_cierre cie ON cie.id_solicitud = s.id
LEFT JOIN solicitudes_productos ven ON ven.id_cierre = cie.id
ORDER BY s.fecha_solicitud DESC;";

$resultado_1 = $conexion->query($sql_1);
$resultado_2 = $conexion->query($sql_2);

// Ruta del archivo Excel
$rutaArchivo = __DIR__ . "/../../Archivos/Plantilla/PromotoriaCompañia.xlsx";

// Verificar si el archivo existe
if (!file_exists($rutaArchivo)) {
    die("No se encontró la plantilla.");
}

$spreadsheet = IOFactory::load($rutaArchivo);

// Obtener o crear las hojas necesarias
$hoja1 = $spreadsheet->getSheetByName("Info. Solicitud") ?: $spreadsheet->createSheet()->setTitle("Info. Solicitud");
$hoja2 = $spreadsheet->getSheetByName("Info. Visita") ?: $spreadsheet->createSheet()->setTitle("Info. Visita");

// Columnas y fila inicial
$columnas_1 = ['B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q']; // 16 columnas
$columnas_2 = ['B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R']; // 17 columnas
$filaInicio = 4;

// Escribir resultados de $sql_1 en hoja1
$filaExcel = $filaInicio;
if ($resultado_1 && $resultado_1->num_rows > 0) {
    while ($fila = $resultado_1->fetch_assoc()) {
        $valores = [
            $fila['fecha_formateada'],
            $fila['Promotora'],
            $fila['canal_actividad'],
            $fila['punto_venta'],
            $fila['direccion_pdv'],
            $fila['ubicacion_pdv'],
            $fila['AsesorComercial'],
            $fila['NumeroAsesorComercial'],
            $fila['nombre_actividad'],
            $fila['nombre_marca'],
            $fila['nombre_estado'],
            $fila['segmento_pvl'],
            $fila['segmento_cvl'],
            $fila['segmento_mco'],
            $fila['observaciones'],
            $fila['created_at'],
        ];

        foreach ($columnas_1 as $index => $columna) {
            $hoja1->setCellValue($columna . $filaExcel, $valores[$index]);
            $hoja1->getStyle($columna . $filaExcel)->getFont()->setName('Calibri')->setSize(11);
            $hoja1->getStyle($columna . $filaExcel)->getAlignment()->setWrapText(true);
        }
        $filaExcel++;
    }
    // Autoajustar el ancho de las columnas SOLO si hay pocos registros (opcional)
    if ($resultado_1->num_rows < 1000) { // Ajusta el umbral según tu necesidad
        foreach ($columnas_1 as $columna) {
            $hoja1->getColumnDimension($columna)->setAutoSize(true);
        }
    }
} else {
    $hoja1->setCellValue('A4', "No encontrado");
}

// Escribir resultados de $sql_2 en hoja2
$filaExcel = $filaInicio;
if ($resultado_2 && $resultado_2->num_rows > 0) {
    while ($fila = $resultado_2->fetch_assoc()) {
        $valores = [
            $fila['FechaActividad'],
            $fila['Promotor'],
            $fila['punto_venta'],
            $fila['nombre_actividad'],
            $fila['nombre_marca'],
            $fila['observaciones_cierre'],
            $fila['motivo_visita'],
            $fila['marca_inicial'],
            $fila['marca_final'],
            $fila['productos_venta'],
            $fila['presentacion'],
            $fila['segmento'],
            $fila['marca_vehiculo'],
            $fila['cantidad'],
            $fila['precio'],
            $fila['observacion'],
            $fila['created_at'],
        ];

        foreach ($columnas_2 as $index => $columna) {
            $hoja2->setCellValue($columna . $filaExcel, $valores[$index]);
            $hoja2->getStyle($columna . $filaExcel)->getFont()->setName('Calibri')->setSize(11);
            $hoja2->getStyle($columna . $filaExcel)->getAlignment()->setWrapText(true);
        }
        $filaExcel++;
    }
    // Autoajustar el ancho de las columnas SOLO si hay pocos registros (opcional)
    if ($resultado_2->num_rows < 1000) { // Ajusta el umbral según tu necesidad
        foreach ($columnas_2 as $columna) {
            $hoja2->getColumnDimension($columna)->setAutoSize(true);
        }
    }
} else {
    $hoja2->setCellValue('A4', "No encontrado");
}

// Guardar archivo
$fechaHora = date('Ymd_His');
$nuevoArchivo = "InformePromotoriaCompañia_$fechaHora.xlsx";
$rutaGuardado = __DIR__ . "/../../Archivos/ArchivosGenerados/$nuevoArchivo";

if (!file_exists(dirname($rutaGuardado))) {
    mkdir(dirname($rutaGuardado), 0777, true);
}

$writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
$writer->save($rutaGuardado);

// Enviar descarga
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header("Content-Disposition: attachment; filename=\"$nuevoArchivo\"");
header('Cache-Control: max-age=0');
$writer->save('php://output');

$conexion->close();
?>
