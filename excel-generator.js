// Tabla de resistencia por metro exacta sincronizada con tu módulo
const RESISTENCIA_CABLE_OHM_M = {
    "18 Stranded": 0.027723,
    "18 Solid":    0.026509,
    "16 Stranded": 0.017355,
    "16 Solid":    0.016666,
    "14 Stranded": 0.010695,
    "14 Solid":    0.010465,
    "12 Stranded": 0.006725,
    "12 Solid":    0.006594
};

export async function generarExcelVoltaje(fuentes, metodo = "peor_caso") {
    if (typeof ExcelJS === 'undefined') {
        alert("Error: La librería ExcelJS no está disponible.");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Cálculo Voltaje");

    // Estilos de la plantilla
    const colorBannerOscuro = '333333'; 
    const colorHeaderGris  = '7F7F7F'; 
    const colorAmarillo    = 'FFFFCC'; 
    const colorTextoBlanco = 'FFFFFF';
    const colorTextoNegro  = '000000';

    const borderPunteado = {
        top:    { style: 'dotted', color: { argb: 'B0B0B0' } },
        left:   { style: 'dotted', color: { argb: 'B0B0B0' } },
        bottom: { style: 'dotted', color: { argb: 'B0B0B0' } },
        right:  { style: 'dotted', color: { argb: 'B0B0B0' } }
    };

    const borderSolidoFino = {
        top:    { style: 'thin', color: { argb: '000000' } },
        left:   { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right:  { style: 'thin', color: { argb: '000000' } }
    };

    let filaActual = 2;

    // --- 1. TÍTULO PRINCIPAL ---
    worksheet.mergeCells(`B${filaActual}:H${filaActual + 5}`);
    const cellTitulo = worksheet.getCell(`B${filaActual}`);
    cellTitulo.value = "Cálculo de caída de voltaje y Baterías";
    cellTitulo.font = { name: 'Calibri', size: 18, bold: true, italic: true, color: { argb: colorTextoNegro } };
    cellTitulo.alignment = { vertical: 'middle', horizontal: 'center' };
    filaActual += 7;

    // --- 2. INFORMACIÓN GENERAL ---
    const vNominalGlobal = fuentes[0]?.voltajeNominal || 24;
    const metadata = [
        { r: 9,  cLabel1: 3, label1: "Número de Proyecto: ", cVal1: 4, val1: window.numProyecto || 123456, cLabel2: 6, label2: "Nombre de Cliente: ", cVal2: 7, val2: window.nombreCliente || "PROYECTO NAC" },
        { r: 11, cLabel1: 3, label1: "Calculado por: ",      cVal1: 4, val1: window.calculadoPor || "SINCRO",  cLabel2: 6, label2: "Voltaje de Fuente: ", cVal2: 7, val2: `${vNominalGlobal} V` },
        { r: 13, cLabel1: 3, label1: "Modelo: ",            cVal1: 4, val1: fuentes[0]?.modelo || "PFC-4410RC", cLabel2: 6, label2: "Método: ", cVal2: 7, val2: metodo === "peor_caso" ? "End Point" : "Point to Point" }
    ];

    metadata.forEach(m => {
        const row = worksheet.getRow(m.r);
        row.getCell(m.cLabel1).value = m.label1;
        row.getCell(m.cLabel1).font = { name: 'Calibri', size: 11, bold: true };
        row.getCell(m.cLabel1).alignment = { horizontal: 'right', vertical: 'middle' };

        const cellV1 = row.getCell(m.cVal1);
        cellV1.value = m.val1;
        cellV1.font = { name: 'Calibri', size: 10 };
        cellV1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorAmarillo } };
        cellV1.border = borderPunteado;
        cellV1.alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(m.cLabel2).value = m.label2;
        row.getCell(m.cLabel2).font = { name: 'Calibri', size: 11, bold: true };
        row.getCell(m.cLabel2).alignment = { horizontal: 'right', vertical: 'middle' };

        const cellV2 = row.getCell(m.cVal2);
        cellV2.value = m.val2;
        cellV2.font = { name: 'Calibri', size: 10 };
        cellV2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorAmarillo } };
        cellV2.border = borderPunteado;
        cellV2.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    filaActual = 16;

    // --- 3. PROCESAMIENTO DINÁMICO DE FUENTES Y CIRCUITOS ---
    fuentes.forEach((fuente, fIdx) => {
        const vFuente = parseFloat(fuente.voltajeNominal) || 24;
        const claseFuente = fuente.clase || "B";
        const factorClase = (claseFuente === "B") ? 2 : 1;

        // Banner Fuente NAC
        const rFuente = worksheet.getRow(filaActual);
        for (let col = 2; col <= 8; col++) {
            const cell = rFuente.getCell(col);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBannerOscuro } };
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: colorTextoBlanco } };
            cell.alignment = { vertical: 'middle' };
        }

        rFuente.getCell(2).value = "Fuente NAC:";
        rFuente.getCell(3).value = fuente.nombreFuente || `NAC #${fIdx + 1}`;
        rFuente.getCell(4).value = "Clase:";
        rFuente.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
        rFuente.getCell(5).value = claseFuente;
        rFuente.getCell(7).value = "Voltaje Fuente";
        rFuente.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
        rFuente.getCell(8).value = `${vFuente} V`;
        rFuente.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
        rFuente.height = 20;

        filaActual += 2;

        fuente.circuitos.forEach((circuito, cIdx) => {
            // Banner Circuito
            const rCirc = worksheet.getRow(filaActual);
            for (let col = 2; col <= 8; col++) {
                const cell = rCirc.getCell(col);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBannerOscuro } };
                cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: colorTextoBlanco } };
                cell.alignment = { vertical: 'middle' };
            }
            rCirc.getCell(2).value = "Circuito:";
            rCirc.getCell(3).value = circuito.nombreCircuito || `Circuito ${cIdx + 1}`;
            rCirc.height = 18;

            filaActual += 2;

            // Fila resumen de Cable / Resistencia / Distancia
            const calibreAWG = circuito.calibreAWG || "14 Solid";
            const resOhmMetro = RESISTENCIA_CABLE_OHM_M[calibreAWG] || 0.010465;
            const distTotal = parseFloat(circuito.distanciaTotal) || 0;

            const rCableHead = worksheet.getRow(filaActual);
            rCableHead.getCell(2).value = "Calibre Cable";
            rCableHead.getCell(3).value = "Resistencia (Ohm/m)";
            rCableHead.getCell(4).value = "Distancia Total";

            [2, 3, 4].forEach(col => {
                const cell = rCableHead.getCell(col);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHeaderGris } };
                cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: colorTextoBlanco } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });
            filaActual++;

            const rCableVal = worksheet.getRow(filaActual);
            rCableVal.getCell(2).value = calibreAWG;
            rCableVal.getCell(3).value = `${resOhmMetro} Ω/m`;
            rCableVal.getCell(4).value = `${distTotal} m`;

            [2, 3, 4].forEach(col => {
                const cell = rCableVal.getCell(col);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorAmarillo } };
                cell.font = { name: 'Calibri', size: 10 };
                cell.border = borderPunteado;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });
            filaActual++;

            // Encabezados Tabla Dispositivos
            const rDevHead = worksheet.getRow(filaActual);
            const headersDev = ["Cant.", "Marca", "Tipo", "Candela", "Volumen", "Amp. Unitario", "Amp. Total"];
            
            headersDev.forEach((hText, idx) => {
                const col = idx + 2;
                const cell = rDevHead.getCell(col);
                cell.value = hText;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHeaderGris } };
                cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: colorTextoBlanco } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = borderSolidoFino;
            });
            rDevHead.height = 20;
            filaActual++;

            // Procesar filas de Dispositivos reales
            let totalAmpsCircuito = 0;
            let vDrop = 0;
            const dispositivos = circuito.dispositivos || [];

            dispositivos.forEach(dev => {
                const rDev = worksheet.getRow(filaActual);
                const cant = parseInt(dev.cantidad, 10) || 1;
                
                // Leemos las propiedades exactas extraídas en el módulo JS
                const ampUnit = parseFloat(dev.corrienteUnitario) || 0;
                const ampTotalFila = dev.corrienteTotal !== undefined ? parseFloat(dev.corrienteTotal) : (cant * ampUnit);

                totalAmpsCircuito += ampTotalFila;

                const vals = [
                    cant,
                    dev.marca || "HONEYWELL",
                    dev.tipo || "SIRENA CON ESTROBO",
                    dev.candela ? String(dev.candela) : "15",
                    dev.volumen || "Alto",
                    `${ampUnit.toFixed(3)} A`,
                    `${ampTotalFila.toFixed(3)} A`
                ];

                vals.forEach((v, idx) => {
                    const col = idx + 2;
                    const cell = rDev.getCell(col);
                    cell.value = v;
                    cell.font = { name: 'Calibri', size: 10 };
                    if (col <= 7) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorAmarillo } };
                    }
                    cell.border = borderPunteado;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
                filaActual++;
            });

            // Replicar el algoritmo exacto de cálculo del módulo JS
            if (metodo === "peor_caso") {
                vDrop = totalAmpsCircuito * (distTotal * resOhmMetro * factorClase);
            } else {
                let corrienteAcumuladaRestante = totalAmpsCircuito;
                dispositivos.forEach(dev => {
                    const cant = parseInt(dev.cantidad, 10) || 1;
                    const distTramo = parseFloat(dev.distancia) || 0;
                    const ampUnit = parseFloat(dev.corrienteUnitario) || 0;

                    for (let i = 0; i < cant; i++) {
                        const vDropTramo = corrienteAcumuladaRestante * (distTramo * resOhmMetro * factorClase);
                        vDrop += vDropTramo;
                        corrienteAcumuladaRestante -= ampUnit;
                    }
                });
            }

            const vLlegada = vFuente - vDrop;
            const esOptimo = vLlegada >= 16.0;

            const rBlank = worksheet.getRow(filaActual);
            for (let col = 2; col <= 8; col++) {
                const cell = rBlank.getCell(col);
                cell.value = null; // Celda vacía
                cell.fill = null;  // Sin color de fondo
                cell.border = {};  // Sin bordes
            }
            filaActual++;

            // --- TABLA DE RESULTADOS Y MÉTRICAS CALCULADAS ---
            const rResHead = worksheet.getRow(filaActual);
            const headersRes = ["Corriente Consumida", "Caída Voltaje", "Voltaje Llegada", "Estado"];
            
            headersRes.forEach((hText, idx) => {
                const col = idx + 5;
                const cell = rResHead.getCell(col);
                cell.value = hText;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHeaderGris } };
                cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: colorTextoBlanco } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });
            filaActual++;

            const rResVal = worksheet.getRow(filaActual);
            const valsRes = [
                `${totalAmpsCircuito.toFixed(3)} A`,
                `${vDrop.toFixed(2)} V`,
                `${vLlegada.toFixed(2)} V`,
                esOptimo ? "ÓPTIMO" : "CRÍTICO"
            ];

            valsRes.forEach((vText, idx) => {
                const col = idx + 5;
                const cell = rResVal.getCell(col);
                cell.value = vText;
                cell.font = { name: 'Calibri', size: 10, bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorAmarillo } };
                cell.border = borderPunteado;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                
                if (col === 8) { // Formato visual de la celda de estado
                    cell.font = { 
                        name: 'Calibri', 
                        size: 10, 
                        bold: true, 
                        color: { argb: esOptimo ? '006100' : '9C0006' } 
                    };
                }
            });

            filaActual += 3;
        });
    });

    // Ancho de columnas del documento
    worksheet.columns = [
        { width: 3.5 },  // A
        { width: 12.0 }, // B
        { width: 22.0 }, // C
        { width: 25.0 }, // D
        { width: 16.0 }, // E
        { width: 20.0 }, // F
        { width: 18.0 }, // G
        { width: 16.0 }, // H
        { width: 5.0 }   // I
    ];

    // Descarga del archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (window.nombreProyectoActual || "Calculo_Caida_Voltaje") + ".xlsx";
    link.click();
    URL.revokeObjectURL(link.href);
}