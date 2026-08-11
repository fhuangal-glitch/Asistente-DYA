import { OPCIONES_DESPLEGABLES, CATALOGO_MATRIZ_CONSUMOS, obtenerOpcionesFiltradas, obtenerConsumoAmperios } from './catalogos-nac.js';
import { generarExcelVoltaje } from './excel-generator.js';

const RESISTENCIA_CABLE_OHM_M = {
    "18": 0.021,
    "16": 0.013,
    "14": 0.008,
    "12": 0.005 
};

export const moduloVoltaje = {
    estado: {
        paso: "METODO",
        metodo: "peor_caso", 
        clase: "B",  
        calibreAWG: "14",
        voltajeFuente: 20.4,
        distanciaTotal: 0,
        corrienteTotal: 0,
        numDispositivos: 0,
        fuentes: []
    },

    step: 1,

    iniciar: function() {
        this.estado = {
            paso: "METODO",
            metodo: "peor_caso", 
            clase: "B",  
            calibreAWG: "14",
            voltajeFuente: 20.4,
            distanciaTotal: 0,
            corrienteTotal: 0,
            numDispositivos: 0,
            fuentes: []
        };

        return {
            texto: "Módulo de Caída de Voltaje. ¿Qué método de cálculo deseas utilizar?",
            opciones: [
                { texto: "Método Peor Caso", subtexto: "Suma la corriente al final del cable (más conservador)", valor: "Método Peor Caso" },
                { texto: "Método Segmentado", subtexto: "Calcula la caída punto a punto en cada dispositivo (más exacto)", valor: "Método Segmentado" }
            ]
        };
    },

    cargarEstadoCompleto: function(estadoProyecto) {
        if (estadoProyecto) {
            this.estado = { ...this.estado, ...estadoProyecto };
        }
    },

    abrirModalVoltaje: function(estadoActual, onCalcularCallback) {
        const self = this;

        if (estadoActual) {
            self.estado = { ...self.estado, ...estadoActual };
        }

        const esPeorCaso = self.estado.metodo === "peor_caso";

        let menuContextual = document.getElementById('contextMenuTablaNAC');
        if (!menuContextual) {
            menuContextual = document.createElement('div');
            menuContextual.id = 'contextMenuTablaNAC';
            menuContextual.style.cssText = `
                position: fixed; display: none; background: #18181b; border: 1px solid #3f3f46;
                border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
                z-index: 100000; padding: 4px 0; min-width: 170px; font-size: 12px; color: #f4f4f5;
            `;
            document.body.appendChild(menuContextual);

            window.addEventListener('click', () => {
                menuContextual.style.display = 'none';
            });
        }

        const modalOverlay = document.createElement('div');
        modalOverlay.id = "voltajeModalOverlay";
        modalOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(9, 9, 11, 0.95); backdrop-filter: blur(8px);
            z-index: 99999; display: flex; justify-content: center; align-items: center;
            padding: 0; box-sizing: border-box;
        `;

        const modalContainer = document.createElement('div');
        modalContainer.style.cssText = `
            background: #09090b; border: none; width: 100vw; height: 100vh;
            display: flex; flex-direction: column; overflow: hidden;
            color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif;
        `;

        modalContainer.innerHTML = `
            <div style="padding: 14px 24px; border-bottom: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center; background: #121215;">
                <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #f4f4f5; letter-spacing: 0.5px;">Panel de Cálculo de Caída de Voltaje NAC</h3>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #a1a1aa;">Diseño Multicircuito / Multifuente según norma NFPA 72 - Método: ${esPeorCaso ? 'Peor Caso' : 'Segmentado (Punto a Punto)'}</p>
                </div>
                <button id="closeModalBtn" style="background: transparent; border: none; color: #a1a1aa; font-size: 22px; cursor: pointer;">✕</button>
            </div>

            <div id="contenedorFuentesGlobal" style="padding: 24px; overflow-y: auto; flex: 1;"></div>

            <div style="padding: 12px 24px; background: #121215; border-top: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center;">
                <button id="btnAgregarFuenteNAC" style="background: #10b981; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    Agregar Nueva Fuente NAC
                </button>
                <div style="display: flex; gap: 10px;">
                    <button id="cancelModalBtn" style="background: #27272a; color: #f4f4f5; border: 1px solid #3f3f46; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">Cancelar</button>
                    <button id="btnGuardarSupabase" style="background: #16a34a; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">Guardar Proyecto</button>
                    <button id="btnDescargarExcel" style="background: #0d9488; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">Descargar Excel</button>
                    <button id="ejecutarCalculoBtn" style="background: #2563eb; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">Recalcular Todo</button>
                </div>
            </div>
        `;

        modalOverlay.appendChild(modalContainer);
        document.body.appendChild(modalOverlay);

        const contFuentesGlobal = modalContainer.querySelector('#contenedorFuentesGlobal');

        function recalcularMeticasCircuito(circuitoDiv) {
            const fuenteCard = circuitoDiv.closest('.fuente-nac-card');
            if (!fuenteCard) return;

            const vFuente = parseFloat(fuenteCard.querySelector('.inp-vfuente-nominal')?.value) || 20.4;
            const claseFuente = fuenteCard.querySelector('.sel-clase-fuente')?.value || "B";
            const awgCircuito = circuitoDiv.querySelector('.sel-awg-circuito')?.value || "14";
            const resOhmMetro = RESISTENCIA_CABLE_OHM_M[awgCircuito] || 0.008;
            const factorClase = (claseFuente === "B") ? 2 : 1;

            let totalAmperios = 0;
            let totalDistanciaM = 0;
            let numDispositivos = 0;
            let vDrop = 0;

            const filas = Array.from(circuitoDiv.querySelectorAll('.tabla-dispositivos-body tr'));
            numDispositivos = filas.length;

            const dispositivosDatos = filas.map(tr => {
                const amp = parseFloat(tr.querySelector('.inp-amp')?.value) || 0;
                const dist = parseFloat(tr.querySelector('.inp-dist')?.value) || 0;
                totalAmperios += amp;
                return { amp, dist };
            });

            if (esPeorCaso) {
                totalDistanciaM = parseFloat(circuitoDiv.querySelector('.inp-distancia-total-circuito')?.value) || 0;
                vDrop = totalAmperios * (totalDistanciaM * resOhmMetro * factorClase);
            } else {
                let corrienteAcumuladaRestante = totalAmperios;
                dispositivosDatos.forEach(dev => {
                    totalDistanciaM += dev.dist;
                    const vDropTramo = corrienteAcumuladaRestante * (dev.dist * resOhmMetro * factorClase);
                    vDrop += vDropTramo;
                    corrienteAcumuladaRestante -= dev.amp;
                });
            }

            const elDevs = circuitoDiv.querySelector('.metric-num-devs');
            const elAmps = circuitoDiv.querySelector('.metric-amps-used');
            const elDrop = circuitoDiv.querySelector('.metric-vdrop');
            const elVFinal = circuitoDiv.querySelector('.metric-vfinal');
            const elStatus = circuitoDiv.querySelector('.metric-status');

            const vRemanente = vFuente - vDrop;
            const esOptimo = vRemanente >= 16.0;

            if (elDevs) elDevs.innerText = `${numDispositivos} Dispositivos`;
            if (elAmps) elAmps.innerText = `${totalAmperios.toFixed(3)} A Corriente consumida`;

            if (elDrop) {
                elDrop.innerText = `${vDrop.toFixed(2)} V Caída de voltaje`;
            }

            if (elVFinal) {
                elVFinal.innerText = `${vRemanente.toFixed(2)} V Llegada (Último Dev)`;
                elVFinal.style.color = esOptimo ? "#38bdf8" : "#ef4444";
            }

            if (elStatus) {
                if (esOptimo) {
                    elStatus.innerText = "✓ ÓPTIMO";
                    elStatus.style.background = "#064e3b";
                    elStatus.style.color = "#34d399";
                    elStatus.style.border = "1px solid #059669";
                } else {
                    elStatus.innerText = "✕ CRÍTICO (<16V)";
                    elStatus.style.background = "#7f1d1d";
                    elStatus.style.color = "#fca5a5";
                    elStatus.style.border = "1px solid #dc2626";
                }
            }
        }

        function crearFuenteNAC(datosFuente = null, idxFuente = 1) {
            const fuenteDiv = document.createElement('div');
            fuenteDiv.className = 'fuente-nac-card';
            fuenteDiv.style.cssText = "background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 18px; margin-bottom: 24px;";

            const nombreFuente = datosFuente?.nombreFuente || `NAC #${idxFuente < 10 ? '0' + idxFuente : idxFuente}`;
            const marca = datosFuente?.marca || "XXXXXX";
            const modelo = datosFuente?.modelo || "xxxxxx";
            const vNominal = datosFuente?.voltajeNominal || self.estado.voltajeFuente || 24;
            const claseFuenteVal = datosFuente?.clase || self.estado.clase || "B";

            fuenteDiv.innerHTML = `
                <div style="font-size: 11px; font-weight: bold; color: #a1a1aa; margin-bottom: 6px;">Fuente de Energía</div>
                <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 10px 16px; margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 11px; font-weight: bold; color: #a1a1aa;">Fuente de Energía:</span>
                        <input type="text" class="inp-nombre-fuente" value="${nombreFuente}" style="background: #18181b; border: 1px solid #3f3f46; color: #38bdf8; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px; font-size: 12px; color: #e4e4e7;">
                        <div>Marca: <input type="text" class="inp-marca-fuente" value="${marca}" style="background: #18181b; border: 1px solid #3f3f46; color: #fff; padding: 4px 6px; border-radius: 4px; width: 90px; font-size: 12px;"></div>
                        <div>Modelo: <input type="text" class="inp-modelo-fuente" value="${modelo}" style="background: #18181b; border: 1px solid #3f3f46; color: #fff; padding: 4px 6px; border-radius: 4px; width: 130px; font-size: 12px;"></div>
                        <div>
                            Clase: 
                            <select class="sel-clase-fuente" style="background: #18181b; color: #38bdf8; border: 1px solid #3f3f46; font-weight: bold; padding: 4px 6px; border-radius: 4px; font-size: 12px;">
                                <option value="B" ${claseFuenteVal === "B" ? "selected" : ""}>B</option>
                                <option value="A" ${claseFuenteVal === "A" ? "selected" : ""}>A</option>
                            </select>
                        </div>
                        <div>Voltaje: <input type="number" step="0.1" class="inp-vfuente-nominal" value="${vNominal}" style="background: #18181b; border: 1px solid #3f3f46; color: #38bdf8; font-weight: bold; padding: 4px 6px; border-radius: 4px; width: 60px; font-size: 12px;"> V</div>
                        <button class="btn-del-fuente" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Eliminar Fuente</button>
                    </div>
                </div>

                <div class="contenedor-circuitos-fuente" style="display: flex; flex-direction: column; gap: 16px;"></div>

                <button class="btn-add-circuito" style="margin-top: 14px; background: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    + Agregar Circuito NAC (Lazo)
                </button>
            `;

            const contCircuitos = fuenteDiv.querySelector('.contenedor-circuitos-fuente');

            function crearCircuitoNAC(datosCircuito = null, idxCircuito = 1) {
                const circuitoDiv = document.createElement('div');
                circuitoDiv.className = 'circuito-nac-card';
                circuitoDiv.style.cssText = "background: #09090b; border: 1px solid #27272a; border-radius: 6px; padding: 12px;";

                const nombreCircuito = datosCircuito?.nombreCircuito || `Circuito NAC ${idxCircuito}`;
                const awgVal = datosCircuito?.calibreAWG || self.estado.calibreAWG || "14";
                const distTotalInicial = datosCircuito?.distanciaTotal || self.estado.distanciaTotal || 100;

                const campoDistanciaPeorCasoHTML = esPeorCaso ? `
                    | <div>
                        Distancia Total: 
                        <input type="number" class="inp-distancia-total-circuito" value="${distTotalInicial}" style="background: #27272a; color: #fff; border: 1px solid #3f3f46; width: 60px; padding: 2px 4px; border-radius: 4px; text-align: center; font-weight: bold;"> m
                    </div>
                ` : '';

                circuitoDiv.innerHTML = `
                    <div style="font-size: 11px; font-weight: bold; color: #a1a1aa; margin-bottom: 4px;">CIRCUITO ${idxCircuito}</div>
                    <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 4px; padding: 8px 14px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #f4f4f5; margin-bottom: 10px;">
                        <input type="text" class="inp-nombre-circuito" value="${nombreCircuito}" style="background: transparent; border: none; color: #fff; font-weight: bold; width: 110px;"> |

                        <div>
                            AWG: 
                            <select class="sel-awg-circuito" style="background: #27272a; color: #fff; border: 1px solid #3f3f46; border-radius: 4px; padding: 2px 4px; font-weight: bold;">
                                <option value="18" ${awgVal === "18" ? "selected" : ""}>18 AWG</option>
                                <option value="16" ${awgVal === "16" ? "selected" : ""}>16 AWG</option>
                                <option value="14" ${awgVal === "14" ? "selected" : ""}>14 AWG</option>
                                <option value="12" ${awgVal === "12" ? "selected" : ""}>12 AWG</option>
                            </select>
                        </div> 
                        ${campoDistanciaPeorCasoHTML} |

                        <span class="metric-num-devs" style="color: #a1a1aa;">0 Dispositivos</span> |
                        <span class="metric-amps-used" style="color: #38bdf8;">0.00 Corriente consumida</span> |
                        <span class="metric-vdrop" style="color: #10b981;">0.00 Caída de voltaje</span> |
                        <span class="metric-vfinal" style="color: #38bdf8;">0.00 V Restante</span> |
                        <span class="metric-status" style="padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">--</span> |
                        <span style="color: #a1a1aa;">0 Corriente de Irrupción(%)</span> |
                        
                        <button class="btn-del-circuito" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 13px;">✕</button>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #e4e4e7; margin-bottom: 8px;">
                        <thead>
                            <tr style="border-bottom: 1px solid #3f3f46; background: #121215; text-align: center;">
                                <th style="padding: 6px; width: 30px;">#</th>
                                <th style="width: 120px;">Marca</th>
                                <th style="width: 130px;">Tipo</th>
                                <th style="width: 80px;">Montaje</th>
                                <th style="width: 70px;">Candela</th>
                                <th style="width: 110px;">Patrón</th>
                                <th style="width: 80px;">Volumen</th>
                                <th style="width: 90px;">Corriente (AMPS)</th>
                                ${esPeorCaso ? '' : '<th style="width: 80px;">Distancia (m)</th>'}
                                <th style="width: 50px;">Acción</th>
                            </tr>
                        </thead>
                        <tbody class="tabla-dispositivos-body"></tbody>
                    </table>

                    <button class="btn-add-dispositivo" style="background: transparent; color: #38bdf8; border: 1px dashed #38bdf8; padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer;">
                        + Agregar Dispositivo
                    </button>
                `;

                const tbody = circuitoDiv.querySelector('.tabla-dispositivos-body');

                function reindexarFilas() {
                    tbody.querySelectorAll('tr').forEach((tr, idx) => {
                        const colIndex = tr.querySelector('.col-index');
                        if (colIndex) {
                            colIndex.innerText = idx + 1;
                        }
                    });
                }

                // FIRMA CORREGIDA (incluye filaReferencia)
                function crearFilaDispositivo(datosDev = null, filaReferencia = null) {
                    const row = document.createElement('tr');
                    row.style.cssText = "border-bottom: 1px solid #27272a; text-align: center;";

                    const valMarca = datosDev?.marca || "HONEYWELL";
                    const valTipo = datosDev?.tipo || "SIRENA CON ESTROBO";
                    const valMontaje = datosDev?.montaje || "PARED";
                    const valCandela = datosDev?.candela !== undefined ? String(datosDev.candela) : "15";
                    const valPatron = datosDev?.patron || "Temporal";
                    const valVolumen = datosDev?.volumen || "Alto";
                    const valDistancia = datosDev?.distancia || 1;

                    const columnaDistanciaHTML = esPeorCaso ? '' : `
                        <td><input type="number" step="1" class="inp-dist" value="${valDistancia}" style="background: #18181b; color: #fff; border: 1px solid #3f3f46; width: 60px; font-size: 11px; text-align: center;"></td>
                    `;

                    row.innerHTML = `
                        <td class="col-index" style="padding: 6px; font-weight: bold; color: #a1a1aa;">-</td>
                        <td><select class="sel-marca" style="background:#18181b; color:#fff; border:1px solid #3f3f46; font-size:11px; border-radius:4px; padding:2px;"></select></td>
                        <td><select class="sel-tipo" style="background:#18181b; color:#fff; border:1px solid #3f3f46; font-size:11px; border-radius:4px; padding:2px;"></select></td>
                        <td><select class="sel-montaje" style="background:#18181b; color:#fff; border:1px solid #3f3f46; font-size:11px; border-radius:4px; padding:2px;"></select></td>
                        <td><select class="sel-candela" style="background:#18181b; color:#fff; border:1px solid #3f3f46; font-size:11px; border-radius:4px; padding:2px;"></select></td>
                        <td><select class="sel-patron" style="background:#18181b; color:#fff; border:1px solid #3f3f46; font-size:11px; border-radius:4px; padding:2px;"></select></td>
                        <td><select class="sel-volumen" style="background:#18181b; color:#fff; border:1px solid #3f3f46; font-size:11px; border-radius:4px; padding:2px;"></select></td>
                        <td><input type="number" step="0.001" class="inp-amp" readonly style="background: #27272a; color: #38bdf8; border: 1px solid #3f3f46; width: 65px; font-size: 11px; text-align: center; font-weight: bold;"></td>
                        ${columnaDistanciaHTML}
                        <td><button class="btn-del-dev" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 12px;">✕</button></td>
                    `;

                    const selMarca = row.querySelector('.sel-marca');
                    const selTipo = row.querySelector('.sel-tipo');
                    const selMontaje = row.querySelector('.sel-montaje');
                    const selCandela = row.querySelector('.sel-candela');
                    const selPatron = row.querySelector('.sel-patron');
                    const selVolumen = row.querySelector('.sel-volumen');
                    const inpAmp = row.querySelector('.inp-amp');

                    OPCIONES_DESPLEGABLES.marcas.forEach(m => selMarca.add(new Option(m, m)));
                    OPCIONES_DESPLEGABLES.tipos.forEach(t => selTipo.add(new Option(t, t)));
                    OPCIONES_DESPLEGABLES.montajes.forEach(mo => selMontaje.add(new Option(mo, mo)));

                    selMarca.value = valMarca;
                    selTipo.value = valTipo;
                    selMontaje.value = valMontaje;

                    function actualizarDesplegablesYConsumo(forzarValores = null) {
                        const m = selMarca.value;
                        const t = selTipo.value;

                        const opcionesMontaje = obtenerOpcionesFiltradas(m, t, null, null, null);
                        const currMontaje = forzarValores?.montaje || selMontaje.value;
                        
                        selMontaje.innerHTML = '';
                        opcionesMontaje.montajes.forEach(mItem => selMontaje.add(new Option(mItem, mItem)));
                        if (opcionesMontaje.montajes.includes(currMontaje)) {
                            selMontaje.value = currMontaje;
                        }
                        const montajeActual = selMontaje.value;

                        const opcionesCandelaYPatron = obtenerOpcionesFiltradas(m, t, montajeActual, null, null);
                        
                        const currCd = forzarValores?.candela || selCandela.value;
                        selCandela.innerHTML = '';
                        opcionesCandelaYPatron.candelas.forEach(c => selCandela.add(new Option(String(c), String(c))));
                        if (opcionesCandelaYPatron.candelas.map(String).includes(String(currCd))) {
                            selCandela.value = String(currCd);
                        }

                        const currPt = forzarValores?.patron || selPatron.value;
                        selPatron.innerHTML = '';
                        opcionesCandelaYPatron.patrones.forEach(p => selPatron.add(new Option(p, p)));
                        if (opcionesCandelaYPatron.patrones.includes(currPt)) {
                            selPatron.value = currPt;
                        }
                        const patronActual = selPatron.value;

                        const opcionesVolumen = obtenerOpcionesFiltradas(m, t, montajeActual, selCandela.value, patronActual);
                        const currVl = forzarValores?.volumen || selVolumen.value;
                        selVolumen.innerHTML = '';
                        opcionesVolumen.volumenes.forEach(v => selVolumen.add(new Option(v, v)));
                        if (opcionesVolumen.volumenes.includes(currVl)) {
                            selVolumen.value = currVl;
                        }

                        const ampCalculado = obtenerConsumoAmperios(
                            selMarca.value, 
                            selTipo.value, 
                            selMontaje.value, 
                            selCandela.value, 
                            selPatron.value, 
                            selVolumen.value
                        );
                        inpAmp.value = ampCalculado.toFixed(3);

                        recalcularMeticasCircuito(circuitoDiv);
                    }
                    
                    row.addEventListener('contextmenu', (e) => {
                        e.preventDefault();

                        menuContextual.style.left = `${e.clientX}px`;
                        menuContextual.style.top = `${e.clientY}px`;
                        menuContextual.style.display = 'block';

                        menuContextual.innerHTML = `
                            <div id="btnMultiplicarFila" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                <span style="color: #38bdf8; font-weight: bold;">✕</span> Multiplicar Dispositivo
                            </div>
                        `;

                        const btnMult = menuContextual.querySelector('#btnMultiplicarFila');
                        btnMult.onmouseenter = () => btnMult.style.background = '#27272a';
                        btnMult.onmouseleave = () => btnMult.style.background = 'transparent';

                        btnMult.onclick = (event) => {
                            event.stopPropagation();
                            menuContextual.style.display = 'none';

                            const inputCant = prompt("¿Cuántas copias idénticas de este dispositivo deseas agregar debajo?", "1");
                            const cantidad = parseInt(inputCant, 10);

                            if (!isNaN(cantidad) && cantidad > 0) {
                                const configCopiar = {
                                    marca: selMarca.value,
                                    tipo: selTipo.value,
                                    montaje: selMontaje.value,
                                    candela: selCandela.value,
                                    patron: selPatron.value,
                                    volumen: selVolumen.value,
                                    distancia: esPeorCaso ? 0 : (parseFloat(row.querySelector('.inp-dist')?.value) || 1)
                                };

                                let ultimoPuntoInsercion = row;
                                for (let i = 0; i < cantidad; i++) {
                                    const nuevaFila = crearFilaDispositivo(configCopiar, ultimoPuntoInsercion);
                                    ultimoPuntoInsercion = nuevaFila;
                                }
                            }
                        };
                    });

                    [selMarca, selTipo, selMontaje, selCandela, selPatron, selVolumen].forEach(el => {
                        el.addEventListener('change', () => actualizarDesplegablesYConsumo());
                    });

                    if (!esPeorCaso) {
                        row.querySelector('.inp-dist').addEventListener('input', () => recalcularMeticasCircuito(circuitoDiv));
                    }

                    actualizarDesplegablesYConsumo({
                        montaje: valMontaje,
                        candela: valCandela,
                        patron: valPatron,
                        volumen: valVolumen
                    });

                    if (filaReferencia) {
                        filaReferencia.insertAdjacentElement('afterend', row);
                    } else {
                        tbody.appendChild(row);
                    }

                    reindexarFilas();
                    recalcularMeticasCircuito(circuitoDiv);

                    row.querySelector('.btn-del-dev').addEventListener('click', () => {
                        row.remove();
                        reindexarFilas();
                        recalcularMeticasCircuito(circuitoDiv);
                    });

                    return row;
                }

                if (datosCircuito?.dispositivos && datosCircuito.dispositivos.length > 0) {
                    datosCircuito.dispositivos.forEach(dev => crearFilaDispositivo(dev));
                } else {
                    crearFilaDispositivo();
                }

                if (esPeorCaso) {
                    const inpDist = circuitoDiv.querySelector('.inp-distancia-total-circuito');
                    if (inpDist) {
                        inpDist.addEventListener('input', () => recalcularMeticasCircuito(circuitoDiv));
                    }
                }

                circuitoDiv.querySelector('.btn-add-dispositivo').addEventListener('click', () => crearFilaDispositivo());
                circuitoDiv.querySelector('.btn-del-circuito').addEventListener('click', () => circuitoDiv.remove());
                circuitoDiv.querySelector('.sel-awg-circuito').addEventListener('change', () => recalcularMeticasCircuito(circuitoDiv));

                contCircuitos.appendChild(circuitoDiv);
                recalcularMeticasCircuito(circuitoDiv);
            }

            if (datosFuente?.circuitos && datosFuente.circuitos.length > 0) {
                datosFuente.circuitos.forEach((circ, i) => crearCircuitoNAC(circ, i + 1));
            } else {
                crearCircuitoNAC(null, 1);
            }

            fuenteDiv.querySelector('.sel-clase-fuente').addEventListener('change', () => {
                contCircuitos.querySelectorAll('.circuito-nac-card').forEach(c => recalcularMeticasCircuito(c));
            });

            fuenteDiv.querySelector('.btn-add-circuito').addEventListener('click', () => {
                const totalC = contCircuitos.querySelectorAll('.circuito-nac-card').length;
                crearCircuitoNAC(null, totalC + 1);
            });

            fuenteDiv.querySelector('.btn-del-fuente').addEventListener('click', () => fuenteDiv.remove());

            contFuentesGlobal.appendChild(fuenteDiv);
        }

        const fuentesGuardadas = estadoActual.fuentes || (estadoActual.lazos ? [{ nombreFuente: "NAC #01", circuitos: estadoActual.lazos }] : null);

        if (fuentesGuardadas && fuentesGuardadas.length > 0) {
            fuentesGuardadas.forEach((fuente, i) => crearFuenteNAC(fuente, i + 1));
        } else {
            crearFuenteNAC(null, 1);
        }

        modalContainer.querySelector('#btnAgregarFuenteNAC').addEventListener('click', () => {
            const totalF = contFuentesGlobal.querySelectorAll('.fuente-nac-card').length;
            crearFuenteNAC(null, totalF + 1);
        });

        function obtenerEstructuraCompletaProyecto() {
            const fuentes = [];
            contFuentesGlobal.querySelectorAll('.fuente-nac-card').forEach(fCard => {
                const nombreFuente = fCard.querySelector('.inp-nombre-fuente').value;
                const marca = fCard.querySelector('.inp-marca-fuente').value;
                const modelo = fCard.querySelector('.inp-modelo-fuente').value;
                const clase = fCard.querySelector('.sel-clase-fuente').value;
                const voltajeNominal = parseFloat(fCard.querySelector('.inp-vfuente-nominal').value) || 20.4;

                const circuitos = [];
                fCard.querySelectorAll('.circuito-nac-card').forEach(cCard => {
                    const nombreCircuito = cCard.querySelector('.inp-nombre-circuito').value;
                    const calibreAWG = cCard.querySelector('.sel-awg-circuito').value;
                    const distanciaTotal = esPeorCaso ? (parseFloat(cCard.querySelector('.inp-distancia-total-circuito')?.value) || 0) : 0;

                    const dispositivos = [];
                    cCard.querySelectorAll('.tabla-dispositivos-body tr').forEach(tr => {
                        dispositivos.push({
                            marca: tr.querySelector('.sel-marca').value,
                            tipo: tr.querySelector('.sel-tipo').value,
                            montaje: tr.querySelector('.sel-montaje').value,
                            candela: tr.querySelector('.sel-candela').value,
                            patron: tr.querySelector('.sel-patron').value,
                            volumen: tr.querySelector('.sel-volumen').value,
                            modelo: `${tr.querySelector('.sel-marca').value} - ${tr.querySelector('.sel-tipo').value}`,
                            corriente: parseFloat(tr.querySelector('.inp-amp').value) || 0,
                            distancia: esPeorCaso ? 0 : (parseFloat(tr.querySelector('.inp-dist')?.value) || 0)
                        });
                    });

                    circuitos.push({ nombreCircuito, calibreAWG, distanciaTotal, dispositivos });
                });

                fuentes.push({ nombreFuente, marca, modelo, clase, voltajeNominal, circuitos });
            });
            return fuentes;
        }

        const cerrar = () => modalOverlay.remove();
        modalContainer.querySelector('#closeModalBtn').addEventListener('click', cerrar);
        modalContainer.querySelector('#cancelModalBtn').addEventListener('click', cerrar);

        modalContainer.querySelector('#btnGuardarSupabase').addEventListener('click', () => {
            const fuentes = obtenerEstructuraCompletaProyecto();
            window.dispatchEvent(new CustomEvent('guardarProyectoSupabaseEvent', {
                detail: {
                    tipo: 'voltaje',
                    datos: {
                        fuentes: fuentes,
                        estadoActual: { ...self.estado, fuentes: fuentes }
                    },
                    nombreProyecto: (window.nombreProyectoActual || "Proyecto_NAC") + " (Caída Voltaje)"
                }
            }));
        });

        modalContainer.querySelector('#btnDescargarExcel').addEventListener('click', async () => {
            try {
                const fuentes = obtenerEstructuraCompletaProyecto(); 
                const metodoCalculo = self.estado?.metodo || "peor_caso"; 
                await generarExcelVoltaje(fuentes, metodoCalculo);
            } catch (error) {
                console.error("Error al generar el Excel:", error);
                alert("Hubo un error al generar el archivo Excel. Revisa la consola para más detalles.");
            }
        });

        modalContainer.querySelector('#ejecutarCalculoBtn').addEventListener('click', () => {
            contFuentesGlobal.querySelectorAll('.circuito-nac-card').forEach(c => recalcularMeticasCircuito(c));
        });
    }
};