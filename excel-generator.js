export async function generarExcelVoltaje(fuentes, metodo = "peor_caso") {
    if (typeof ExcelJS === 'undefined') {
        alert("Error: La librería ExcelJS no está disponible.");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Cálculo Caída Voltaje");
    const esPeorCaso = metodo === "peor_caso";

    const borderGris = {
        top: { style: 'thin', color: { argb: 'D4D4D8' } },
        left: { style: 'thin', color: { argb: 'D4D4D8' } },
        bottom: { style: 'thin', color: { argb: 'D4D4D8' } },
        right: { style: 'thin', color: { argb: 'D4D4D8' } }
    };

    const borderTablaHeader = {
        top: { style: 'medium', color: { argb: '52525B' } },
        left: { style: 'thin', color: { argb: 'D4D4D8' } },
        bottom: { style: 'medium', color: { argb: '52525B' } },
        right: { style: 'thin', color: { argb: 'D4D4D8' } }
    };

    let filaActual = 1;

    fuentes.forEach((fuente) => {
        // --- 1. CABECERA DE FUENTE DE ALIMENTACIÓN ---
        const rHeaderPS = worksheet.getRow(filaActual);
        rHeaderPS.getCell(1).value = "FUENTE DE ALIMENTACIÓN";
        rHeaderPS.getCell(1).font = { name: 'Arial', size: 9, bold: true, color: { argb: '52525B' } };
        filaActual++;

        const rPS = worksheet.getRow(filaActual);
        rPS.values = [
            "Fuente Alimentación", fuente.nombreFuente,
            "Marca", fuente.marca,
            "Modelo", fuente.modelo,
            "Voltaje Nominal Sistema", `${fuente.voltajeNominal} VOLTIOS`
        ];

        rPS.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.border = borderGris;
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Arial', size: 9 };
            
            if ([1, 3, 5, 7].includes(colNumber)) {
                cell.font = { name: 'Arial', size: 9, color: { argb: '71717A' } };
            } else {
                cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '09090B' } };
            }
        });
        rPS.height = 25;
        filaActual += 2;

        // --- 2. CIRCUITOS DE LA FUENTE ---
        fuente.circuitos.forEach((circuito, cIdx) => {
            let totalAmps = 0;
            let totalDist = 0;

            // Recorrido de dispositivos
            circuito.dispositivos.forEach(dev => {
                totalAmps += parseFloat(dev.corriente) || 0;
                if (!esPeorCaso) totalDist += parseFloat(dev.distancia) || 0;
            });

            if (esPeorCaso) {
                totalDist = parseFloat(circuito.distanciaTotal) || 0;
            }

            const factorClase = fuente.clase === "B" ? 2 : 1;
            const resOhmMetro = 0.008; // Referencia AWG 14

            // Cálculo dinámico para Segmentado vs Peor Caso
            let vDrop = 0;
            if (esPeorCaso) {
                vDrop = totalAmps * (totalDist * resOhmMetro * factorClase);
            } else {
                let corrienteRemanente = totalAmps;
                circuito.dispositivos.forEach(dev => {
                    const distTramo = parseFloat(dev.distancia) || 0;
                    vDrop += corrienteRemanente * (distTramo * resOhmMetro * factorClase);
                    corrienteRemanente -= (parseFloat(dev.corriente) || 0);
                });
            }

            // Título del Circuito
            const rCirculoTitle = worksheet.getRow(filaActual);
            rCirculoTitle.getCell(1).value = `CIRCUITO ${cIdx + 1} - ${esPeorCaso ? 'CARGA EN EL EXTREMO (PEOR CASO)' : 'PUNTO A PUNTO (SEGMENTADO)'}`;
            rCirculoTitle.getCell(1).font = { name: 'Arial', size: 9, bold: true, color: { argb: '52525B' } };
            filaActual++;

            // Métrica resumen del circuito
            const rCircMetricas = worksheet.getRow(filaActual);
            rCircMetricas.values = [
                circuito.nombreCircuito,
                `CLASE ${fuente.clase}`,
                `CALIBRE ${circuito.calibreAWG} AWG`,
                `${circuito.dispositivos.length} Dispositivos`,s
                `${totalAmps.toFixed(2)} A CONSUMIDOS`,
                `${vDrop.toFixed(2)} V CAÍDA VOLTAJE`,
                "0% CORRIENTE de irrupción"
            ];

            rCircMetricas.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = borderGris;
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '27272A' } };
            });
            rCircMetricas.height = 25;
            filaActual++;

            // Cabecera de la tabla de dispositivos
            const rTablaHead = worksheet.getRow(filaActual);
            const headers = [
                "#", "Modelo Dispositivo", "Candela", "Patrón", "Volumen", "Tono", "CORRIENTE (AMPERIOS)"
            ];
            headers.push(esPeorCaso ? "Distancia Total (metros)" : "Distancia desde dev previo (metros)");

            rTablaHead.values = headers;
            rTablaHead.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = borderTablaHeader;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F4F4F5' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '18181B' } };
            });
            rTablaHead.height = 22;
            filaActual++;

            // Filas de los dispositivos
            circuito.dispositivos.forEach((dev, dIdx) => {
                const rDev = worksheet.getRow(filaActual);
                const filaValores = [
                    dIdx + 1,
                    dev.modelo,
                    dev.candela,
                    dev.patron,
                    dev.volumen,
                    dev.tono,
                    parseFloat(dev.corriente) || 0
                ];
                filaValores.push(esPeorCaso ? (dIdx === 0 ? totalDist : 0) : (parseFloat(dev.distancia) || 0));

                rDev.values = filaValores;
                rDev.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = borderGris;
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.font = { name: 'Arial', size: 9, color: { argb: '27272A' } };

                    if (colNumber === 2) {
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    }
                });
                rDev.height = 20;
                filaActual++;
            });
            filaActual += 2;
        });
        filaActual += 1;
    });

    // Ajuste de Anchos de Columnas para los textos traducidos
    worksheet.columns = [
        { width: 14 }, // #
        { width: 25 }, // Modelo Dispositivo
        { width: 14 }, // Candela
        { width: 16 }, // Patrón
        { width: 14 }, // Volumen
        { width: 22 }, // Tono
        { width: 24 }, // CORRIENTE (AMPERIOS)
        { width: 32 }  // Distancia
    ];

    // Generar archivo y forzar descarga
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (window.nombreProyectoActual || "Calculo_Caida_Voltaje") + ".xlsx";
    link.click();
    URL.revokeObjectURL(link.href);
}