// exportar-excel-matriz.js

function obtenerTextoCausa(item) {
    if (!item) return "";
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
        return item.causa || item.nombre || item.texto || item.descripcion || "";
    }
    return String(item);
}

function limpiarTextoEntrada(texto) {
    if (!texto) return "";
    return texto
        .replace(/<[^>]*>/g, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\s*\((?:zona\s+de\s+alarma\vert{}zona)\s*#?\s*\d+\)/gi, '')
        .replace(/\s*-\s*zona\s*#?\d+/gi, '')
        .trim();
}

function obtenerNumeroZona(item) {
    if (!item) return 9999;
    
    if (typeof item === 'object') {
        if (item.zona !== undefined && item.zona !== null && !isNaN(item.zona)) {
            return parseInt(item.zona, 10);
        }
        if (item.numZona !== undefined && item.numZona !== null && !isNaN(item.numZona)) {
            return parseInt(item.numZona, 10);
        }
    }
    
    const texto = typeof item === 'string' ? item : (item.causa || item.nombre || item.texto || '');
    const match = texto.match(/zona(?:\s+de\s+alarma)?\s*#?\s*0*(\d+)/i) || 
                  texto.match(/\(zona(?:\s+de\s+alarma)?\s*#?\s*0*(\d+)\)/i) ||
                  texto.match(/\(#?0*(\d+)\)/);
                  
    return match ? parseInt(match[1], 10) : 9999;
}

function calcularInterseccionAutomaticaAux(textoEntrada, objetoSalida, zonaEntrada = null) {
    const txt = obtenerTextoCausa(textoEntrada).toLowerCase();
    
    const col = (typeof objetoSalida === 'object' && objetoSalida !== null) ? objetoSalida : {};
    const nombreCol = (col.nombre || String(objetoSalida || "")).toLowerCase();
    const grupoCol = (col.grupo || "").toLowerCase();
    const tipoCol = (col.tipo || "").toLowerCase();
    const espejoCol = (col.espejo || "").toLowerCase();
    const zonasSalida = col.zonas || [];

    let esAlarma = false;
    let esSupervision = false;
    let esFalla = false;

    if (txt.includes("falla") || txt.includes("potencia") || txt.includes("cortocircuito") || txt.includes("abierto") || txt.includes("tierra")) {
        esFalla = true;
    } else if (txt.includes("tamper") || txt.includes("supervisión") || txt.includes("supervision") || txt.includes("baja presión") || txt.includes("válvula")) {
        esSupervision = true;
    } else {
        esAlarma = true;
    }

    if (grupoCol === "anunciacion") {
        if (esAlarma && tipoCol === "alarma") return "X";
        if (esSupervision && tipoCol === "supervision") return "X";
        if (esFalla && tipoCol === "falla") return "X";
    }

    if (grupoCol === "notificacion" && esAlarma) {
        if (zonasSalida.length > 0) {
            if (zonaEntrada !== null && zonasSalida.includes(zonaEntrada)) return "X";
        } else {
            if (zonaEntrada !== null) {
                const matchZonaSalida = nombreCol.match(/zona de alarma\s*#?0*(\d+)/i) || nombreCol.match(/zona\s*#?0*(\d+)/i);
                if (matchZonaSalida && matchZonaSalida[1]) {
                    const zonaSalida = parseInt(matchZonaSalida[1], 10);
                    if (zonaEntrada === zonaSalida) return "X";
                }
            }
        }
    }

    if (espejoCol) {
        if (esAlarma && espejoCol === "alarma") return "X";
        if (esSupervision && espejoCol === "supervision") return "X";
        if (esFalla && espejoCol === "falla") return "X";
    }

    if (nombreCol.includes("desplegar") || nombreCol.includes("imprimir") || nombreCol.includes("cambio de estado")) {
        return "X";
    }

    if (grupoCol === "enclavamiento" && esAlarma) {
        return "X";
    }

    return "-";
}

/**
 * Genera y descarga la Matriz Causa-Efecto en Excel (.xlsx) respetando los colores y bordes DYA.
 * 
 * @param {Object} datosMatriz Objeto con la estructura cargada o extraída de pantalla
 * @param {String} nombreProyecto Nombre del archivo a guardar
 */
export async function descargarExcelConPlantillaDYA(datosMatriz, nombreProyecto = "Matriz_Causa_Efecto") {
    if (typeof ExcelJS === 'undefined') {
        alert("Falta la librería ExcelJS. Agrega <script src='https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js'></script> en tu HTML.");
        return;
    }

    const workbook = new ExcelJS.Workbook();

    const mapaFacus = datosMatriz.facus || datosMatriz;
    const facuKeys = Object.keys(mapaFacus).filter(k => k !== 'totalZonas');

    if (facuKeys.length === 0) {
        alert("No hay datos de matrices para exportar.");
        return;
    }

    const PALETA_COLORES = {
        NOTIFICACION: 'FF92D050',
        ALARMA: 'FFFF9696',
        SUPERVISION: 'FFFFC000',
        FALLA: 'FFFFFF00',
        DESPLEGAR: 'FF00B0F0',
        ENCLAVAMIENTO: 'FFFFCCFF'
    };

    const BORDES_TODOS = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    facuKeys.forEach((fKey) => {
        const datosFacu = mapaFacus[fKey] || {};
        const salidas = datosFacu.salidas || [];
        
        // 1. Extraer entradas aplicando la herencia de zona en cascada (para respetar celdas combinadas)
        let zonaActual = null;
        const entradas = (datosFacu.entradas || []).map(entrada => {
            let numZ = obtenerNumeroZona(entrada);
            
            if (numZ !== 9999) {
                zonaActual = numZ;
            } else if (zonaActual !== null) {
                numZ = zonaActual;
            }
            
            return {
                ...entrada,
                zona: numZ !== 9999 ? numZ : null
            };
        });

        const totalSalidas = salidas.length;
        const nombreHoja = `FACU #0${fKey}`;
        const worksheet = workbook.addWorksheet(nombreHoja);

        // Anchos de columna
        worksheet.getColumn(1).width = 5;  // Numeral #
        worksheet.getColumn(2).width = 18; // ZONA DE ALARMA
        worksheet.getColumn(3).width = 75; // ENTRADAS / SALIDAS

        for (let c = 0; c < totalSalidas; c++) {
            worksheet.getColumn(4 + c).width = 5.5; 
        }

        // Fila 1: Header Título SALIDAS FACU
        if (totalSalidas > 0) {
            worksheet.mergeCells(1, 4, 1, 3 + totalSalidas);
            for (let c = 4; c <= 3 + totalSalidas; c++) {
                worksheet.getCell(1, c).border = BORDES_TODOS;
            }

            const cellSalidas = worksheet.getCell(1, 4);
            cellSalidas.value = `SALIDAS FACU #0${fKey}`;
            cellSalidas.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6DCE4' } };
            cellSalidas.font = { name: 'Arial', size: 11, bold: true };
            cellSalidas.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Fila 2: Subgrupos
        let colCursor = 4;
        const conteoGrupos = { anunciacion: 0, notificacion: 0, enclavamiento: 0 };

        salidas.forEach(s => {
            const g = (s.grupo || 'notificacion').toLowerCase();
            if (conteoGrupos[g] !== undefined) conteoGrupos[g]++;
            else conteoGrupos.notificacion++;
        });

        const configGrupos = [
            { id: 'anunciacion', nombre: 'Anunciación', count: conteoGrupos.anunciacion },
            { id: 'notificacion', nombre: 'Notificación', count: conteoGrupos.notificacion },
            { id: 'enclavamiento', nombre: 'Enclavamiento', count: conteoGrupos.enclavamiento }
        ];

        configGrupos.forEach(grp => {
            if (grp.count > 0) {
                const startCol = colCursor;
                const endCol = colCursor + grp.count - 1;

                if (startCol < endCol) {
                    worksheet.mergeCells(2, startCol, 2, endCol);
                }

                for (let c = startCol; c <= endCol; c++) {
                    worksheet.getCell(2, c).border = BORDES_TODOS;
                }

                const cellGrp = worksheet.getCell(2, startCol);
                cellGrp.value = grp.nombre;
                cellGrp.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                cellGrp.font = { name: 'Arial', size: 10, bold: true };
                cellGrp.alignment = { vertical: 'middle', horizontal: 'center' };

                colCursor += grp.count;
            }
        });

        // Fila 3: Salidas Verticales
        const maxCaracteres = salidas.reduce((max, s) => {
            const txt = typeof s === 'object' ? (s.nombre || "") : String(s);
            return Math.max(max, txt.length);
        }, 0);

        worksheet.getRow(3).height = Math.max(120, maxCaracteres * 5.5);

        salidas.forEach((salida, index) => {
            const colIdx = 4 + index;
            const cell = worksheet.getCell(3, colIdx);

            const textoSalida = typeof salida === 'object' ? (salida.nombre || "") : String(salida);
            const grupo = (salida.grupo || "").toLowerCase();
            const tipo = (salida.tipo || "").toLowerCase();
            const textoLower = textoSalida.toLowerCase();

            cell.value = textoSalida;

            let colorAsignado = PALETA_COLORES.ALARMA;
            if (grupo === 'enclavamiento') colorAsignado = PALETA_COLORES.ENCLAVAMIENTO;
            else if (grupo === 'notificacion') colorAsignado = PALETA_COLORES.NOTIFICACION;
            else if (textoLower.includes('desplegar') || textoLower.includes('imprimir')) colorAsignado = PALETA_COLORES.DESPLEGAR;
            else if (tipo === 'supervision' || textoLower.includes('supervisión')) colorAsignado = PALETA_COLORES.SUPERVISION;
            else if (tipo === 'falla' || textoLower.includes('falla')) colorAsignado = PALETA_COLORES.FALLA;

            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorAsignado } };
            cell.font = { name: 'Arial', size: 9 };
            cell.alignment = { textRotation: 90, vertical: 'bottom', horizontal: 'center', wrapText: false };
            cell.border = BORDES_TODOS;
        });

        // Fila 4: Encabezados de Columna y Letras
        const cellZonaHeader = worksheet.getCell(4, 2);
        cellZonaHeader.value = "ZONA DE ALARMA";
        cellZonaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
        cellZonaHeader.font = { name: 'Arial', size: 10, bold: true };
        cellZonaHeader.alignment = { vertical: 'middle', horizontal: 'center' };
        cellZonaHeader.border = BORDES_TODOS;

        const cellEntradasHeader = worksheet.getCell(4, 3);
        cellEntradasHeader.value = `ENTRADAS FACU #0${fKey}`;
        cellEntradasHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
        cellEntradasHeader.font = { name: 'Arial', size: 10, bold: true };
        cellEntradasHeader.alignment = { vertical: 'middle', horizontal: 'center' };
        cellEntradasHeader.border = BORDES_TODOS;

        salidas.forEach((_, index) => {
            const colIdx = 4 + index;
            const cell = worksheet.getCell(4, colIdx);

            let label = "";
            let idxTemp = index;
            while (idxTemp >= 0) {
                label = String.fromCharCode((idxTemp % 26) + 65) + label;
                idxTemp = Math.floor(idxTemp / 26) - 1;
            }

            cell.value = label;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6DCE4' } };
            cell.font = { name: 'Arial', size: 10, bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = BORDES_TODOS;
        });

        // Precalcular agrupamientos consecutivos por número de Zona
        const bloquesZona = [];
        let i = 0;
        while (i < entradas.length) {
            const numZ = entradas[i].zona || 9999;
            let j = i;
            while (j < entradas.length && (entradas[j].zona || 9999) === numZ) {
                j++;
            }
            bloquesZona.push({
                numZona: numZ,
                startRow: 5 + i,
                endRow: 5 + j - 1
            });
            i = j;
        }

        // Fila 5+: Renderizar datos de Entradas
        entradas.forEach((entrada, rIdx) => {
            const rowNum = 5 + rIdx;
            const row = worksheet.getRow(rowNum);
            row.height = 24;

            const cellNum = worksheet.getCell(rowNum, 1);
            cellNum.value = rIdx + 1;
            cellNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
            cellNum.font = { name: 'Arial', size: 9, bold: true };
            cellNum.alignment = { vertical: 'middle', horizontal: 'center' };
            cellNum.border = BORDES_TODOS;

            const cellZonaVal = worksheet.getCell(rowNum, 2);
            const numZ = entrada.zona || 9999;
            cellZonaVal.value = numZ !== 9999 ? `Zona #${String(numZ).padStart(2, '0')}` : 'N/A';
            cellZonaVal.font = { name: 'Arial', size: 9, bold: true };
            cellZonaVal.alignment = { vertical: 'middle', horizontal: 'center' };
            cellZonaVal.border = BORDES_TODOS;

            const cellDesc = worksheet.getCell(rowNum, 3);
            let textoCausa = obtenerTextoCausa(entrada);
            textoCausa = textoCausa.replace(/^FACU\s*#?\d+\s*-\s*/i, '');
            const textoLimpio = limpiarTextoEntrada(textoCausa);

            cellDesc.value = {
                richText: [
                    { font: { name: 'Arial', size: 9, bold: true }, text: `${rIdx + 1}. ` },
                    { font: { name: 'Arial', size: 9, bold: false }, text: textoLimpio }
                ]
            };
            cellDesc.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            cellDesc.border = BORDES_TODOS;

            const arrayIntersecciones = entrada.intersecciones || [];

            salidas.forEach((salidaItem, cIdx) => {
                const colIdx = 4 + cIdx;
                const cellVal = worksheet.getCell(rowNum, colIdx);

                let valorCruz = arrayIntersecciones[cIdx];
                if (valorCruz === undefined || valorCruz === null) {
                    valorCruz = calcularInterseccionAutomaticaAux(obtenerTextoCausa(entrada), salidaItem, numZ !== 9999 ? numZ : null);
                }

                cellVal.value = valorCruz;
                cellVal.font = { name: 'Arial', size: 10, bold: valorCruz === "X" };
                cellVal.alignment = { vertical: 'middle', horizontal: 'center' };
                cellVal.border = BORDES_TODOS;
            });
        });

        bloquesZona.forEach(b => {
            const labelZona = b.numZona !== 9999 ? `Zona #${String(b.numZona).padStart(2, '0')}` : 'N/A';
            if (b.startRow < b.endRow) {
                worksheet.mergeCells(b.startRow, 2, b.endRow, 2);
            }
            const mainCell = worksheet.getCell(b.startRow, 2);
            mainCell.value = labelZona;
            mainCell.font = { name: 'Arial', size: 9, bold: true };
            mainCell.alignment = { vertical: 'middle', horizontal: 'center' };
            
            for (let r = b.startRow; r <= b.endRow; r++) {
                worksheet.getCell(r, 2).border = BORDES_TODOS;
            }
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreProyecto.replace(/\s+/g, '_')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}