import { ARBOL_DISPOSITIVOS, LISTA_SALIDAS_EXCEL } from './config.js';

let entradasPorFacu = {}; 
let salidasPorFacu = {};
let facusConfigurados = 1;
let facuActualIndex = 1; 
let chatBoxGlobal = null;
let pestañaActualFiltro = "entradas";
let subFaseActual = "entradas";

function obtenerTextoCausa(item) {
    if (!item) return "";
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
        return item.causa || item.nombre || item.texto || "";
    }
    return String(item);
}

function generarNombreCopia(nombreOriginal) {
    if (!nombreOriginal) return "Nuevo Proyecto (Copia 1)";
    const patronCopia = /\(Copia (\d+)\)$/;
    const coincidencia = nombreOriginal.trim().match(patronCopia);

    if (coincidencia) {
        const numeroActual = parseInt(coincidencia[1], 10);
        return nombreOriginal.trim().replace(patronCopia, `(Copia ${numeroActual + 1})`);
    } else {
        return `${nombreOriginal.trim()} (Copia 1)`;
    }
}

export function iniciarModuloMatriz(msgDiv, miniAvatar, chatBox, zonasTotalesSistema, facus, onFinishedCallback) {
    entradasPorFacu = {}; 
    salidasPorFacu = {};
    facusConfigurados = facus; 
    facuActualIndex = 1;
    chatBoxGlobal = chatBox;
    subFaseActual = "entradas";

    window.totalZonasGlobalesSistema = zonasTotalesSistema;

    for (let f = 1; f <= facusConfigurados; f++) {
        entradasPorFacu[f] = [];
        salidasPorFacu[f] = generarSalidasPorDefecto(f, zonasTotalesSistema, facus);
    }

    const antiguoPanel = document.getElementById('panel-matriz-absolute-custom');
    if (antiguoPanel) antiguoPanel.remove();

    const superContenedor = document.createElement('div');
    superContenedor.id = 'panel-matriz-absolute-custom';
    superContenedor.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(10, 10, 12, 0.98);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        padding: 30px;
        box-sizing: border-box;
        color: #e4e4e7;
        font-family: sans-serif;
        overflow-y: auto;
    `;

    document.body.appendChild(superContenedor);
    renderizarFlujoSecuencial();
}

function generarSalidasPorDefecto(f, zonasTotalesSistema, totalFacus) {
    const columnasSalida = [];

    columnasSalida.push({ nombre: "Activar indicador común de la señal de alarma", grupo: "anunciacion", tipo: "alarma" });
    columnasSalida.push({ nombre: "Activar señal de alarma audible", grupo: "anunciacion", tipo: "alarma" });
    columnasSalida.push({ nombre: "Activar indicador común de la señal de supervisión", grupo: "anunciacion", tipo: "supervision" });
    columnasSalida.push({ nombre: "Activar señal de supervisión audible", grupo: "anunciacion", tipo: "supervision" });
    columnasSalida.push({ nombre: "Activar indicador común de la señal de falla", grupo: "anunciacion", tipo: "falla" });
    columnasSalida.push({ nombre: "Activar señal de falla audible", grupo: "anunciacion", tipo: "falla" });

    for (let z = 1; z <= zonasTotalesSistema; z++) {
        const padZ = String(z).padStart(2, '0');
        columnasSalida.push({ 
            nombre: `Activación de cornetas con luces estroboscópicas (zona de alarma #${padZ})`, 
            grupo: "notificacion" 
        });
    }

    columnasSalida.push({ 
        nombre: "Desplegar/imprimir cambio de estado", 
        grupo: "notificacion", 
        fixedX: true 
    });

    if (totalFacus > 1) {
        const facuDestino = f === 1 ? 2 : 1; 
        const padDest = String(facuDestino).padStart(2, '0');
        
        columnasSalida.push({ 
            nombre: `Transmitir señal de alarma a anunciadores remotos, estación de trabajo y FACU #${padDest}`, 
            grupo: "notificacion", 
            espejo: "alarma" 
        });
        columnasSalida.push({ 
            nombre: `Transmitir señal de supervisión a anunciadores remotos, estación de trabajo y FACU #${padDest}`, 
            grupo: "notificacion", 
            espejo: "supervision" 
        });
        columnasSalida.push({ 
            nombre: `Transmitir señal de falla a anunciadores remotos, estación de trabajo y FACU #${padDest}`, 
            grupo: "notificacion", 
            espejo: "falla" 
        });
    }

    columnasSalida.push({ nombre: "Apagado equipos de HVAC e inyección de aire", grupo: "enclavamiento" });
    columnasSalida.push({ nombre: "Desactivación de puertas de control de accesos de rutas de evacuación", grupo: "enclavamiento" });

    return columnasSalida;
}

export function cargarDatosGuardados(datosRecuperados) {
    const superContenedor = document.getElementById('panel-matriz-absolute-custom');
    if (!superContenedor) return;

    try {
        if (typeof datosRecuperados === 'string') {
            datosRecuperados = JSON.parse(datosRecuperados);
        }

        const esVacio = !datosRecuperados || Object.keys(datosRecuperados).length === 0;
        
        if (esVacio) {
            console.warn("El proyecto está vacío ({}) en Supabase. Inicializando matriz por defecto...");
            const totalZonas = window.totalZonasGlobalesSistema || 3; 
            datosRecuperados = {
                "1": {
                    entradas: [{ causa: "", intersecciones: Array(totalZonas).fill("-") }],
                    salidas: []
                }
            };
        }

        entradasPorFacu = {};
        
        if (datosRecuperados.salidasPorFacu) {
            salidasPorFacu = datosRecuperados.salidasPorFacu;
            datosRecuperados = datosRecuperados.entradasPorFacu || datosRecuperados;
        }

        const keys = Object.keys(datosRecuperados).filter(k => k !== "salidasPorFacu");
        facusConfigurados = keys.length || 1;

        keys.forEach(fId => {
            const facuData = datosRecuperados[fId];
            let filas = [];
            
            if (Array.isArray(facuData)) {
                filas = facuData;
            } else if (facuData && facuData.entradas) {
                filas = facuData.entradas;
                if (facuData.salidas && facuData.salidas.length > 0) {
                    salidasPorFacu[fId] = facuData.salidas;
                }
            }

            if (!salidasPorFacu[fId] || salidasPorFacu[fId].length === 0) {
                let maxZonaHallada = 1;
                filas.forEach(f => {
                    const txt = obtenerTextoCausa(f);
                    const match = txt.match(/zona de alarma\s*#?0*(\d+)/i) || txt.match(/zona\s*#?0*(\d+)/i);
                    if (match && match[1]) {
                        const num = parseInt(match[1], 10);
                        if (num > maxZonaHallada) maxZonaHallada = num;
                    }
                });
                salidasPorFacu[fId] = generarSalidasPorDefecto(parseInt(fId, 10), maxZonaHallada, facusConfigurados);
            }

            entradasPorFacu[fId] = filas.map(row => {
                if (!row) return { causa: "", intersecciones: [] };
                return typeof row === 'object' ? row : { causa: row, intersecciones: [] };
            });
        });

        desplegarMatrizExcelFinal(superContenedor);

        keys.forEach(fId => {
            const tabla = document.getElementById(`tabla-facu-${fId}`);
            if (!tabla) return;

            const filasTablas = tabla.querySelectorAll('.tbody-matriz-causas tr');
            const filasData = entradasPorFacu[fId];

            if (Array.isArray(filasData)) {
                filasData.forEach((rowData, rIdx) => {
                    if (rowData && typeof rowData === 'object' && rowData.intersecciones && filasTablas[rIdx]) {
                        const celdasInterseccion = filasTablas[rIdx].querySelectorAll('.excel-interseccion-cell');
                        rowData.intersecciones.forEach((val, cIdx) => {
                            if (celdasInterseccion[cIdx]) {
                                celdasInterseccion[cIdx].innerText = val;
                                if (val === "X") {
                                    celdasInterseccion[cIdx].style.backgroundColor = "#2563eb";
                                    celdasInterseccion[cIdx].style.color = "white";
                                    celdasInterseccion[cIdx].style.fontWeight = "bold";
                                } else {
                                    celdasInterseccion[cIdx].style.backgroundColor = "transparent";
                                    celdasInterseccion[cIdx].style.color = "#52525b";
                                    celdasInterseccion[cIdx].style.fontWeight = "normal";
                                }
                            }
                        });
                    }
                });
            }
        });

    } catch (error) {
        console.error("Error crítico procesando la carga del proyecto:", error);
        alert("Ocurrió un error leyendo los datos del proyecto. Revisa la consola del navegador.");
    }
}

export function renderizarFlujoSecuencial() {
    const superContenedor = document.getElementById('panel-matriz-absolute-custom');
    if (!superContenedor) return;

    let totalZonasActual = window.totalZonasGlobalesSistema || 1;
    let htmlBotonesMacro = "";

    if (subFaseActual === "entradas") {
        htmlBotonesMacro = `
            <button class="menu-flow-btn btn-macro-select" data-macro="alarma">Detección / Alarma</button>
            <button class="menu-flow-btn btn-macro-select" data-macro="supervision">Módulos / Supervisión</button>
            <button class="menu-flow-btn btn-macro-select" data-macro="falla_sistema">Fallas de Sistema</button>
        `;
    } else {
        htmlBotonesMacro = `
            <button class="menu-flow-btn btn-macro-select" data-macro="notificacion">Dispositivos de Notificación</button>
            <button class="menu-flow-btn btn-macro-select" data-macro="enclavamiento">Dispositivos de Enclavamiento</button>
        `;
    }

    superContenedor.innerHTML = `
        <div style="width: 100%; max-width: 1700px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
                <h2 style="margin: 0; font-size: 20px; color: #fff;">Estructuración de Matriz Causa y Efecto</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #a1a1aa;">
                    Infraestructura: <strong>${facusConfigurados} FACU(s)</strong> independientes. 
                    Configurando actualmente: <span style="background-color: #2563eb; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 13px;">FACU #0${facuActualIndex}</span>
                </p>
            </div>
            <button id="btn-abortar-matriz" style="background: #ef4444; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">✕ Cerrar</button>
        </div>

        <div style="width: 100%; max-width: 1700px; margin: 0 auto; display: flex; gap: 25px; flex: 1; align-items: stretch;">
            <div style="flex: 3.8; display: flex; gap: 15px; background: #141417; padding: 20px; border-radius: 8px; border: 1px solid #27272a; box-sizing: border-box; overflow-x: auto;">
                <div class="col-paso" id="sec-macro" style="flex: 1; min-width: 180px;">
                    <span style="display:block; margin-bottom:12px; font-weight:bold; font-size:12px; color:#a1a1aa; height: 14px;">Categoría</span>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${htmlBotonesMacro}
                    </div>
                </div>
                
                <div class="col-paso hidden" id="sec-dispositivo" style="flex: 1; min-width: 180px;">
                    <span style="display:block; margin-bottom:12px; font-weight:bold; font-size:12px; color:#a1a1aa; height: 14px;">Dispositivo</span>
                    <div id="box-dispositivos" style="display: flex; flex-direction: column; gap: 8px;"></div>
                </div>
                
                <div class="col-paso hidden" id="sec-tecnologia" style="flex: 1; min-width: 180px;">
                    <span style="display:block; margin-bottom:12px; font-weight:bold; font-size:12px; color:#a1a1aa; height: 14px;">Tecnología / Tipo</span>
                    <div id="box-tecnologia" style="display: flex; flex-direction: column; gap: 8px;"></div>
                </div>
                
                <div class="col-paso hidden" id="sec-proteccion" style="flex: 1; min-width: 180px;">
                    <span style="display:block; margin-bottom:12px; font-weight:bold; font-size:12px; color:#a1a1aa; height: 14px;">Protección</span>
                    <div id="box-proteccion" style="display: flex; flex-direction: column; gap: 8px;"></div>
                </div>

                <div class="col-paso hidden" id="sec-ultimo-nivel" style="flex: 1; min-width: 180px;">
                    <span style="display:block; margin-bottom:12px; font-weight:bold; font-size:12px; color:#a1a1aa; height: 14px;">Detalle Final</span>
                    <div id="box-ultimo-nivel" style="display: flex; flex-direction: column; gap: 8px;"></div>
                </div>

                <div class="col-paso" id="sec-zonas-chk" style="flex: 0.8; border-left: 1px solid #2d2d30; padding-left: 20px; min-width: 130px;">
                    <span style="display:block; margin-bottom:12px; font-weight:bold; font-size:12px; color:#a1a1aa; text-transform: uppercase;"><i class="fas fa-list"></i> Zonas</span>
                    <div id="box-checkboxes-zonas" style="display: flex; flex-direction: column; gap: 10px; max-height: 350px; overflow-y: auto;"></div>
                </div>
            </div>

            <div style="flex: 1.4; background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; box-sizing: border-box; min-width: 250px;">
                <span id="titulo-preview-lateral" style="display:block; font-weight:bold; font-size:12px; color:#3b82f6; margin-bottom:12px; text-transform:uppercase;"><i class="fas fa-database"></i> Entradas FACU #0${facuActualIndex}</span>
                <div id="live-entries-preview" style="flex: 1; font-size: 13px; color: #d4d4d8; max-height: 400px; overflow-y: auto; line-height: 1.5; display: flex; flex-direction: column; gap: 6px;"></div>
            </div>
        </div>
        
        <div style="width: 100%; max-width: 1700px; margin: 20px auto 0 auto; display: flex; gap: 15px;">
            <button class="action-submit-btn" id="btn-add-causa-masiva" style="background-color: #2563eb; color: white; display: none; padding: 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; flex: 1; font-size: 14px;"><i class="fas fa-plus-circle"></i> Añadir Combinación a este FACU</button>
            <button class="action-submit-btn" id="btn-build-excel" style="background-color: #16a34a; color: white; padding: 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; flex: 1; font-size: 14px;"></button>
        </div>
    `;

    const boxZonas = superContenedor.querySelector('#box-checkboxes-zonas');
    boxZonas.innerHTML = ""; 
    for (let i = 1; i <= totalZonasActual; i++) {
        boxZonas.innerHTML += `
            <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer; color: #e4e4e7; padding: 4px 0;">
                <input type="checkbox" class="chk-zona-item" value="${i}" style="transform: scale(1.15);"> Zona ${i}
            </label>
        `;
    }

    const btnInsertar = superContenedor.querySelector('#btn-add-causa-masiva');
    const btnBuild = superContenedor.querySelector('#btn-build-excel');
    const labelPreview = superContenedor.querySelector('#titulo-preview-lateral');

    if (subFaseActual === "entradas") {
        btnInsertar.innerHTML = `<i class="fas fa-plus-circle"></i> Añadir Combinación de Entrada`;
        btnBuild.innerHTML = `<i class="fas fa-arrow-right"></i> Siguiente: Configurar Salidas de FACU #0${facuActualIndex}`;
        labelPreview.innerHTML = `<i class="fas fa-database"></i> Entradas FACU #0${facuActualIndex}`;
    } else {
        btnInsertar.innerHTML = `<i class="fas fa-plus-circle"></i> Añadir Dispositivo de Salida`;
        labelPreview.innerHTML = `<i class="fas fa-bullhorn"></i> Salidas Personalizadas FACU #0${facuActualIndex}`;
        
        if (facuActualIndex < facusConfigurados) {
            btnBuild.innerHTML = `<i class="fas fa-arrow-right"></i> Terminar FACU #0${facuActualIndex} e ir a Entradas de FACU #0${facuActualIndex + 1}`;
        } else {
            btnBuild.innerHTML = `<i class="fas fa-file-excel"></i> Finalizar y Estructurar Matrices`;
        }
    }

    if (!document.getElementById('flow-styles-custom')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'flow-styles-custom';
        styleTag.innerHTML = `
            .menu-flow-btn { background-color: #222227; color: #d4d4d8; border: 1px solid #3f3f46; padding: 10px 14px; font-size: 13px; border-radius: 6px; text-align: left; cursor: pointer; transition: all 0.15s ease; width: 100%; }
            .menu-flow-btn:hover { background-color: #2d2d34; border-color: #71717a; }
            .menu-flow-btn.active-selected { background-color: #2563eb !important; color: white !important; border-color: #3b82f6 !important; font-weight: bold; }
            .col-paso.hidden { display: none !important; }
            .item-preview-drag { transition: background 0.2s ease; }
            .item-preview-drag:hover { background-color: #1e293b !important; }
        `;
        document.head.appendChild(styleTag);
    }

    vincularLogicaColumnas(superContenedor, totalZonasActual);

    btnInsertar.onclick = function() {
        ejecutarAgregarItemConZonas(superContenedor);
    };

    renderizarListaLateralPreview();
}

export function ejecutarAgregarItemConZonas(superContenedor) {
    let chks = Array.from(document.querySelectorAll('.chk-zona-item:checked'));
    if (chks.length === 0) {
        chks = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
    }

    const zonasSeleccionadas = chks.map(c => c.value);

    if (zonasSeleccionadas.length === 0) return;

    const btnDispositivo = (superContenedor || document).querySelector('#box-dispositivos .active-selected');
    const btnTecnologia = (superContenedor || document).querySelector('#box-tecnologia .active-selected');
    const btnMacro = (superContenedor || document).querySelector('#sec-macro .active-selected');

    if (!btnDispositivo) return;

    const nombreBaseDispositivo = btnDispositivo.innerText.trim();
    const grupoCategoria = btnMacro ? btnMacro.getAttribute('data-macro') : "notificacion";
    const tecTexto = btnTecnologia ? btnTecnologia.innerText.trim() : "";

    if (subFaseActual === "entradas") {
        if (!entradasPorFacu[facuActualIndex]) entradasPorFacu[facuActualIndex] = [];
        
        let textoEntrada = nombreBaseDispositivo;
        if (tecTexto && tecTexto.toLowerCase() !== "estándar" && tecTexto.toLowerCase() !== "estandar") {
            textoEntrada += ` (${tecTexto})`;
        }

        zonasSeleccionadas.forEach(z => {
            entradasPorFacu[facuActualIndex].push({
                causa: `FACU #0${facuActualIndex} - ${textoEntrada} (zona de alarma #${String(z).padStart(2, '0')})`,
                zona: z
            });
        });
    } else {
        if (!salidasPorFacu[facuActualIndex]) salidasPorFacu[facuActualIndex] = [];

        let sufijoProteccion = "";
        if (tecTexto && tecTexto.toLowerCase() !== "estándar" && tecTexto.toLowerCase() !== "estandar") {
            sufijoProteccion = ` ${tecTexto.toLowerCase()}`;
        }

        zonasSeleccionadas.forEach(z => {
            const zonaFormateada = String(z).padStart(2, '0');
            let textoSalida = "";

            if (grupoCategoria === "notificacion") {
                textoSalida = `Activación de ${nombreBaseDispositivo.toLowerCase()}s${sufijoProteccion} (zona de alarma #${zonaFormateada})`;
            } else {
                textoSalida = `${nombreBaseDispositivo}${sufijoProteccion} (zona #${zonaFormateada})`;
            }

            salidasPorFacu[facuActualIndex].push({
                nombre: textoSalida,
                grupo: grupoCategoria,
                zona: z
            });
        });
    }

    chks.forEach(c => c.checked = false);
    renderizarListaLateralPreview();
}

export function renderizarListaLateralPreview() {
    const contenedor = document.getElementById("live-entries-preview"); 
    if (!contenedor) return;

    const listaActual = subFaseActual === "entradas" 
        ? (entradasPorFacu[facuActualIndex] || []) 
        : (salidasPorFacu[facuActualIndex] || []);

    contenedor.innerHTML = "";

    if (listaActual.length === 0) {
        contenedor.innerHTML = `<em style="color:#71717a; font-size:12px;">Ningún elemento agregado aún a este panel.</em>`;
        return;
    }

    listaActual.forEach((item, index) => {
        const textoMostrar = obtenerTextoCausa(item);
        const div = document.createElement("div");
        div.className = "item-preview-drag";
        div.setAttribute("draggable", "true");
        div.setAttribute("data-index", index);
        div.style.cssText = `
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 10px 12px;
            background-color: #12181b;
            border: 1px solid #27272a;
            border-radius: 6px;
            color: #e4e4e7;
            cursor: grab;
            user-select: none;
            gap: 10px;
        `;

        div.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px; flex-grow: 1; min-width: 0;">
                <span style="color: #64748b; font-size: 14px; cursor: grab; margin-top: 1px;">⋮⋮</span>
                <span style="font-size: 12px; line-height: 1.4; white-space: normal; word-break: break-word; color: #e4e4e7;">${textoMostrar}</span>
            </div>
            <button class="btn-eliminar-item" title="Eliminar" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold; padding: 0 4px; font-size: 14px; margin-top: -1px; flex-shrink: 0;">✕</button>
        `;

        const btnEliminar = div.querySelector('.btn-eliminar-item');
        btnEliminar.addEventListener('click', (e) => {
            e.stopPropagation();
            eliminarItemPreview(index);
        });

        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", index);
            div.style.opacity = "0.4";
        });

        div.addEventListener("dragend", () => {
            div.style.opacity = "1";
        });

        div.addEventListener("dragover", (e) => {
            e.preventDefault();
            div.style.borderTop = "2px solid #3b82f6";
        });

        div.addEventListener("dragleave", () => {
            div.style.borderTop = "1px solid #27272a";
        });

        div.addEventListener("drop", (e) => {
            e.preventDefault();
            div.style.borderTop = "1px solid #27272a";
            const originIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
            const targetIndex = index;

            if (!isNaN(originIndex) && originIndex !== targetIndex) {
                reordenarListaPreview(originIndex, targetIndex);
            }
        });

        contenedor.appendChild(div);
    });
}

export function eliminarItemPreview(index) {
    const lista = subFaseActual === "entradas" 
        ? entradasPorFacu[facuActualIndex] 
        : salidasPorFacu[facuActualIndex];

    if (lista && lista[index] !== undefined) {
        lista.splice(index, 1);
        renderizarListaLateralPreview();
    }
}

export function reordenarListaPreview(fromIndex, toIndex) {
    const lista = subFaseActual === "entradas" 
        ? entradasPorFacu[facuActualIndex] 
        : salidasPorFacu[facuActualIndex];

    if (lista) {
        const [movedItem] = lista.splice(fromIndex, 1);
        lista.splice(toIndex, 0, movedItem);
        renderizarListaLateralPreview();
    }
}

export function vincularLogicaColumnas(superContenedor, totalZonasActual) {
    let macroSeleccionada = "";
    let dispositivosSeleccionados = [];
    let nivel3Seleccionados = [];
    let nivel4Seleccionados = [];
    let nivel5Seleccionados = [];

    const sMacro = superContenedor.querySelector('#sec-macro');
    const sDisp = superContenedor.querySelector('#sec-dispositivo');
    const sTec = superContenedor.querySelector('#sec-tecnologia'); 
    const sProt = superContenedor.querySelector('#sec-proteccion'); 
    const sUltimo = superContenedor.querySelector('#sec-ultimo-nivel'); 
    const btnInsertar = superContenedor.querySelector('#btn-add-causa-masiva');

    superContenedor.querySelector('#btn-abortar-matriz').addEventListener('click', () => { superContenedor.remove(); });

    function evaluarVisibilidadBotonInsertar() {
        if (dispositivosSeleccionados.length > 0) {
            btnInsertar.style.display = 'block';
        } else {
            btnInsertar.style.display = 'none';
        }
    }

    sMacro.querySelectorAll('[data-macro]').forEach(btn => {
        btn.addEventListener('click', () => {
            sMacro.querySelectorAll('[data-macro]').forEach(b => b.classList.remove('active-selected'));
            btn.classList.add('active-selected');
            
            macroSeleccionada = btn.getAttribute('data-macro');
            dispositivosSeleccionados = []; nivel3Seleccionados = []; nivel4Seleccionados = []; nivel5Seleccionados = [];
            
            sTec.classList.add('hidden'); sProt.classList.add('hidden'); sUltimo.classList.add('hidden');
            evaluarVisibilidadBotonInsertar();
            sDisp.classList.remove('hidden');
            
            const boxDisp = superContenedor.querySelector('#box-dispositivos');
            boxDisp.innerHTML = "";
            
            if (ARBOL_DISPOSITIVOS[macroSeleccionada]) {
                Object.keys(ARBOL_DISPOSITIVOS[macroSeleccionada]).forEach(d => {
                    boxDisp.innerHTML += `<button class="menu-flow-btn btn-nivel-disp" data-val="${d}">${d}</button>`;
                });
            }

            superContenedor.querySelectorAll('.btn-nivel-disp').forEach(bDisp => {
                bDisp.addEventListener('click', () => {
                    const val = bDisp.getAttribute('data-val');
                    if (dispositivosSeleccionados.includes(val)) {
                        dispositivosSeleccionados = dispositivosSeleccionados.filter(item => item !== val);
                        bDisp.classList.remove('active-selected');
                    } else {
                        dispositivosSeleccionados.push(val);
                        bDisp.classList.add('active-selected');
                    }
                    
                    nivel3Seleccionados = []; nivel4Seleccionados = []; nivel5Seleccionados = [];
                    sTec.classList.add('hidden'); sProt.classList.add('hidden'); sUltimo.classList.add('hidden');
                    evaluarVisibilidadBotonInsertar();

                    if (dispositivosSeleccionados.length === 0) return;

                    const boxTec = superContenedor.querySelector('#box-tecnologia');
                    boxTec.innerHTML = "";
                    let mostrarNivel3 = false;

                    dispositivosSeleccionados.forEach(disp => {
                        const nodoDisp = ARBOL_DISPOSITIVOS[macroSeleccionada][disp];
                        if (typeof nodoDisp === 'object' && nodoDisp !== null) {
                            mostrarNivel3 = true;
                            Object.keys(nodoDisp).forEach(t => {
                                if (!boxTec.querySelector(`[data-val="${t}"]`)) {
                                    boxTec.innerHTML += `<button class="menu-flow-btn btn-nivel-3" data-val="${t}">${t}</button>`;
                                }
                            });
                        }
                    });

                    if (mostrarNivel3) {
                        sTec.classList.remove('hidden');
                        vincularEventosNivel3();
                    }
                });
            });
        });
    });

    function vincularEventosNivel3() {
        superContenedor.querySelectorAll('.btn-nivel-3').forEach(b3 => {
            b3.addEventListener('click', () => {
                const val = b3.getAttribute('data-val');
                if (nivel3Seleccionados.includes(val)) {
                    nivel3Seleccionados = nivel3Seleccionados.filter(item => item !== val);
                    b3.classList.remove('active-selected');
                } else {
                    nivel3Seleccionados.push(val);
                    b3.classList.add('active-selected');
                }
                
                nivel4Seleccionados = []; nivel5Seleccionados = [];
                sProt.classList.add('hidden'); sUltimo.classList.add('hidden');

                if (nivel3Seleccionados.length === 0) return;

                const boxProt = superContenedor.querySelector('#box-proteccion');
                boxProt.innerHTML = "";
                let tieneSiguientesNivelesComplejos = false;
                let tieneSiguientesNivelesSimples = false;

                dispositivosSeleccionados.forEach(disp => {
                    nivel3Seleccionados.forEach(n3 => {
                        const nodoNivel3 = ARBOL_DISPOSITIVOS[macroSeleccionada][disp]?.[n3];
                        if (!nodoNivel3) return;

                        if (typeof nodoNivel3 === 'object' && nodoNivel3 !== null) {
                            const llaves = Object.keys(nodoNivel3);
                            if (llaves.length > 0 && typeof nodoNivel3[llaves[0]] === 'object' && nodoNivel3[llaves[0]] !== null) {
                                tieneSiguientesNivelesComplejos = true;
                                llaves.forEach(p => {
                                    if (!boxProt.querySelector(`[data-val="${p}"]`)) {
                                        boxProt.innerHTML += `<button class="menu-flow-btn btn-nivel-4" data-val="${p}">${p}</button>`;
                                    }
                                });
                            } else {
                                tieneSiguientesNivelesSimples = true;
                                llaves.forEach(p => {
                                    if (!boxProt.querySelector(`[data-val="${p}"]`)) {
                                        boxProt.innerHTML += `<button class="menu-flow-btn btn-nivel-ex" data-val="${p}">${p}</button>`;
                                    }
                                });
                            }
                        }
                    });
                });

                if (tieneSiguientesNivelesComplejos) {
                    sProt.classList.remove('hidden');
                    vincularEventosNivel4Complejo();
                } else if (tieneSiguientesNivelesSimples) {
                    sProt.classList.remove('hidden');
                    vincularEventosNivel4Simple();
                }
            });
        });
    }

    function vincularEventosNivel4Complejo() {
        superContenedor.querySelectorAll('.btn-nivel-4').forEach(b4 => {
            b4.addEventListener('click', () => {
                const val = b4.getAttribute('data-val');
                if (nivel4Seleccionados.includes(val)) {
                    nivel4Seleccionados = nivel4Seleccionados.filter(item => item !== val);
                    b4.classList.remove('active-selected');
                } else {
                    nivel4Seleccionados.push(val);
                    b4.classList.add('active-selected');
                }
                
                nivel5Seleccionados = [];
                sUltimo.classList.add('hidden');

                if (nivel4Seleccionados.length === 0) return;

                sUltimo.classList.remove('hidden');
                const boxUltimo = superContenedor.querySelector('#box-ultimo-nivel');
                boxUltimo.innerHTML = "";

                dispositivosSeleccionados.forEach(disp => {
                    nivel3Seleccionados.forEach(n3 => {
                        nivel4Seleccionados.forEach(n4 => {
                            const objTecnologias = ARBOL_DISPOSITIVOS[macroSeleccionada][disp]?.[n3]?.[n4];
                            if (objTecnologias && typeof objTecnologias === 'object') {
                                Object.keys(objTecnologias).forEach(tec => {
                                    if (!boxUltimo.querySelector(`[data-val="${tec}"]`)) {
                                        boxUltimo.innerHTML += `<button class="menu-flow-btn btn-nivel-5" data-val="${tec}">${tec}</button>`;
                                    }
                                });
                            }
                        });
                    });
                });

                vincularEventosNivel5();
            });
        });
    }

    function vincularEventosNivel4Simple() {
        superContenedor.querySelectorAll('.btn-nivel-ex').forEach(bEx => {
            bEx.addEventListener('click', () => {
                const val = bEx.getAttribute('data-val');
                if (nivel4Seleccionados.includes(val)) {
                    nivel4Seleccionados = nivel4Seleccionados.filter(item => item !== val);
                    bEx.classList.remove('active-selected');
                } else {
                    nivel4Seleccionados.push(val);
                    bEx.classList.add('active-selected');
                }
            });
        });
    }

    function vincularEventosNivel5() {
        superContenedor.querySelectorAll('.btn-nivel-5').forEach(b5 => {
            b5.addEventListener('click', () => {
                const val = b5.getAttribute('data-val');
                if (nivel5Seleccionados.includes(val)) {
                    nivel5Seleccionados = nivel5Seleccionados.filter(item => item !== val);
                    b5.classList.remove('active-selected');
                } else {
                    nivel5Seleccionados.push(val);
                    b5.classList.add('active-selected');
                }
            });
        });
    }

    btnInsertar.addEventListener('click', () => {
        if (subFaseActual === "salidas") {
            const checkedZones = Array.from(superContenedor.querySelectorAll('.chk-zona-item:checked')).map(c => c.value);
            let l3 = nivel3Seleccionados.length > 0 ? nivel3Seleccionados : [""];

            dispositivosSeleccionados.forEach(disp => {
                l3.forEach(n3 => {
                    let sufijoProteccion = "";
                    if (n3 && n3.toLowerCase() !== "estándar" && n3.toLowerCase() !== "estandar") {
                        sufijoProteccion = ` ${n3.toLowerCase()}`;
                    }

                    if (checkedZones.length > 0) {
                        checkedZones.forEach(z => {
                            const zonaFormateada = String(z).padStart(2, '0');
                            let stringSalida = `Activación de ${disp.toLowerCase()}s${sufijoProteccion} (zona de alarma #${zonaFormateada})`;

                            if (!salidasPorFacu[facuActualIndex].some(s => (typeof s === 'object' ? s.nombre : s) === stringSalida)) {
                                salidasPorFacu[facuActualIndex].push({
                                    nombre: stringSalida,
                                    grupo: macroSeleccionada || "notificacion",
                                    zona: z
                                });
                            }
                        });
                    } else {
                        let stringSalida = `Activación de ${disp.toLowerCase()}s${sufijoProteccion}`;
                        if (!salidasPorFacu[facuActualIndex].some(s => (typeof s === 'object' ? s.nombre : s) === stringSalida)) {
                            salidasPorFacu[facuActualIndex].push({
                                nombre: stringSalida,
                                grupo: macroSeleccionada || "notificacion"
                            });
                        }
                    }
                });
            });

            superContenedor.querySelectorAll('.chk-zona-item').forEach(c => c.checked = false);
            renderizarListaLateralPreview();
            return; 
        }

        const checkedZones = Array.from(superContenedor.querySelectorAll('.chk-zona-item:checked')).map(c => c.value);
        if (checkedZones.length === 0) {
            alert(`Elige al menos una zona para el FACU #0${facuActualIndex}`);
            return;
        }

        let l3 = nivel3Seleccionados.length > 0 ? nivel3Seleccionados : ["N/A"];
        let l4 = nivel4Seleccionados.length > 0 ? nivel4Seleccionados : ["N/A"];
        let l5 = nivel5Seleccionados.length > 0 ? nivel5Seleccionados : ["N/A"];

        dispositivosSeleccionados.forEach(disp => {
            l3.forEach(n3 => {
                l4.forEach(n4 => {
                    l5.forEach(n5 => {
                        checkedZones.forEach(z => {
                            let stringFila = "";
                            const zonaFormateada = String(z).padStart(2, '0');
                            const dNom = disp.toLowerCase();

                            if (macroSeleccionada === "falla_sistema" || dNom.includes("falla")) {
                                if (dNom.includes("fuentes nac")) {
                                    const tipoSuministro = n3.toLowerCase();
                                    stringFila = `FACU #0${facuActualIndex} - Falla de potencia de ${tipoSuministro} de cualquier fuente de alimentación NAC (zona de alarma #${zonaFormateada})`;
                                } else if (dNom.includes("facu")) {
                                    const tipoSuministro = n3.toLowerCase();
                                    stringFila = `FACU #0${facuActualIndex} - Falla de potencia de ${tipoSuministro} de FACU (zona de alarma #${zonaFormateada})`;
                                } else if (dNom.includes("línea") || dNom.includes("linea") || dNom.includes("circuito")) {
                                    let condicion = n4.toLowerCase();
                                    let sufijoCircuito = "";
                                    const tipoCircuito = n3.toLowerCase();
                                    
                                    if (tipoCircuito.includes("notificación") || tipoCircuito.includes("notizacion")) {
                                        sufijoCircuito = " en dispositivos de notificación";
                                    } else if (tipoCircuito.includes("lazos") || tipoCircuito.includes("lazo")) {
                                        if (condicion.includes("cortocircuito")) {
                                            sufijoCircuito = " en dispositivos de iniciación (lazos)";
                                        }
                                    }
                                    const fraseBase = `${condicion}${sufijoCircuito}`;
                                    const textoFormateado = fraseBase.charAt(0).toUpperCase() + fraseBase.slice(1);
                                    stringFila = `FACU #0${facuActualIndex} - ${textoFormateado} (zona de alarma #${zonaFormateada})`;
                                } else {
                                    const textoN3 = n3 !== "N/A" ? n3.toLowerCase() : "";
                                    stringFila = `FACU #0${facuActualIndex} - Falla de ${dNom} ${textoN3} (zona de alarma #${zonaFormateada})`;
                                }
                            }
                            else if (disp === "Estaciones Manuales") {
                                let tipoTexto = (n3 !== "N/A" && n3) ? ` ${n3.toLowerCase()}` : " de alarma";
                                const funcionNormalizada = n4 ? n4.toLowerCase() : "";
                                let funcionTexto = "";
                                if (funcionNormalizada.includes("explosion proof")) {
                                    funcionTexto = " explosion proof";
                                } else if (funcionNormalizada.includes("weather proof") || funcionNormalizada.includes("intemperie")) {
                                    funcionTexto = " weather proof";
                                }
                                const tecnologiaTexto = (n5 !== "N/A" && n5) ? ` ${n5.toLowerCase()}` : "";
                                stringFila = `FACU #0${facuActualIndex} - Activación de cualquier estación manual${tipoTexto}${funcionTexto}${tecnologiaTexto} (zona de alarma #${zonaFormateada})`;
                            } 
                            else if (dNom.includes("detector") || dNom.includes("humo") || dNom.includes("temperatura") || dNom.includes("flama") || dNom.includes("multicriterio") || dNom.includes("gas")) {
                                let dispSingular = "detector";
                                if (dNom.includes("humo")) dispSingular = "detector de humo";
                                else if (dNom.includes("temperatura") || dNom.includes("calor") || dNom.includes("termico")) dispSingular = "detector de temperatura";
                                else if (dNom.includes("flama")) dispSingular = "detector de flama";
                                else if (dNom.includes("multicriterio")) dispSingular = "detector multicriterio";
                                else if (dNom.includes("gas")) dispSingular = "detector de gas";

                                const tipoNivel3 = (n3 !== "N/A") ? ` ${n3.toLowerCase()}` : "";
                                const tecnologiaTexto = (n5 !== "N/A") ? ` ${n5.toLowerCase()}` : "";
                                stringFila = `FACU #0${facuActualIndex} - Activación de cualquier ${dispSingular}${tipoNivel3}${tecnologiaTexto} (zona de alarma #${zonaFormateada})`;
                            } 
                            else if (dNom.includes("sistema de extin") || dNom.includes("agente limpio") || dNom.includes("monitoreo de equipos")) {
                                let txtNivel3 = n3.toLowerCase();
                                if (txtNivel3.includes("tamper switch")) {
                                    txtNivel3 = txtNivel3.replace("interruptor de ", "");
                                }
                                const conector = dNom.startsWith("sistema") ? "del" : "de";
                                stringFila = `FACU #0${facuActualIndex} - Activación de ${txtNivel3} ${conector} ${dNom} (zona de alarma #${zonaFormateada})`;
                            }
                            else if (dNom.includes("notificación") || dNom.includes("notificacion") || dNom.includes("sirena") || dNom.includes("estrobo") || dNom.includes("parlante")) {
                                const tipoNivel3 = (n3 !== "N/A") ? ` ${n3.toLowerCase()}` : "";
                                const tecnologiaTexto = (n5 !== "N/A") ? ` ${n5.toLowerCase()}` : "";
                                stringFila = `FACU #0${facuActualIndex} - Activación manual o simulada de dispositivo de notificación tipo ${dNom}${tipoNivel3}${tecnologiaTexto} (zona de alarma #${zonaFormateada})`;
                            }
                            else if (dNom.includes("enclavamiento") || dNom.includes("relé") || dNom.includes("rele") || dNom.includes("presuriza") || dNom.includes("ascensor")) {
                                const tipoNivel3 = (n3 !== "N/A") ? ` de ${n3.toLowerCase()}` : "";
                                stringFila = `FACU #0${facuActualIndex} - Control / Disparo de enclavamiento crítico${tipoNivel3} por señal de ${dNom} (zona de alarma #${zonaFormateada})`;
                            }
                            else {
                                const prefijo = (dNom.includes("switch") || dNom.includes("tablero") || dNom.includes("interruptor")) ? "Activación de" : "Activación de cualquier";
                                const txtNivel3 = (n3 !== "N/A" && n3 !== disp) ? ` ${n3.toLowerCase()}` : "";
                                const txtNivel4 = (n4 !== "N/A") ? ` ${n4.toLowerCase()}` : "";
                                stringFila = `FACU #0${facuActualIndex} - ${prefijo} ${dNom}${txtNivel3}${txtNivel4} (zona de alarma #${zonaFormateada})`;
                            }

                            stringFila = stringFila.replace(/\s+/g, ' ');
                            
                            const yaExiste = entradasPorFacu[facuActualIndex].some(e => obtenerTextoCausa(e) === stringFila);
                            if (!yaExiste) {
                                entradasPorFacu[facuActualIndex].push({
                                    causa: stringFila,
                                    intersecciones: []
                                });
                            }
                        });
                    });
                });
            });
        });

        superContenedor.querySelectorAll('.chk-zona-item').forEach(c => c.checked = false);
        renderizarListaLateralPreview();
    });

    superContenedor.querySelector('#btn-build-excel').addEventListener('click', () => {
        if (subFaseActual === "entradas") {
            subFaseActual = "salidas";
            renderizarFlujoSecuencial();
        } else {
            if (facuActualIndex < facusConfigurados) {
                facuActualIndex++;
                subFaseActual = "entradas"; 
                renderizarFlujoSecuencial();
            } else {
                desplegarMatrizExcelFinal(superContenedor);
            }
        }
    });
}

export function calcularInterseccionAutomatica(textoEntrada, objetoSalida) {
    const txt = obtenerTextoCausa(textoEntrada).toLowerCase();
    
    const col = (typeof objetoSalida === 'object' && objetoSalida !== null) ? objetoSalida : {};
    const nombreCol = (col.nombre || String(objetoSalida || "")).toLowerCase();
    const grupoCol = (col.grupo || "").toLowerCase();
    const tipoCol = (col.tipo || "").toLowerCase();
    const espejoCol = (col.espejo || "").toLowerCase();

    let esAlarma = false;
    let esSupervision = false;
    let esFalla = false;

    if (txt.includes("falla") || txt.includes("potencia") || txt.includes("cortocircuito") || txt.includes("abierto") || txt.includes("tierra")) {
        esFalla = true;
    } else if (txt.includes("flujo") || txt.includes("descarga")) {
        esAlarma = true;
    } else if (txt.includes("tamper") || txt.includes("supervisión") || txt.includes("supervision") || txt.includes("baja presión") || txt.includes("baja presion") || txt.includes("aborto") || txt.includes("válvula") || txt.includes("valvula") || txt.includes("interruptor")) {
        esSupervision = true;
    } else {
        esAlarma = true;
    }

    let zonaEntrada = null;
    const matchZona = txt.match(/zona de alarma\s*#?0*(\d+)/i) || txt.match(/zona\s*#?0*(\d+)/i);
    if (matchZona && matchZona[1]) {
        zonaEntrada = parseInt(matchZona[1], 10);
    }

    if (grupoCol === "anunciacion") {
        if (esAlarma && tipoCol === "alarma") return "X";
        if (esSupervision && tipoCol === "supervision") return "X";
        if (esFalla && tipoCol === "falla") return "X";
    }

    if (grupoCol === "notificacion" && esAlarma) {
        if (zonaEntrada !== null) {
            const matchZonaSalida = nombreCol.match(/zona de alarma\s*#?0*(\d+)/i) || nombreCol.match(/zona\s*#?0*(\d+)/i);
            if (matchZonaSalida && matchZonaSalida[1]) {
                const zonaSalida = parseInt(matchZonaSalida[1], 10);
                if (zonaEntrada === zonaSalida) return "X";
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

export function desplegarMatrizExcelFinal(superContenedor) {
    superContenedor.innerHTML = ""; 

    superContenedor.innerHTML = `
        <div style="width: 100%; max-width: 1700px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <div>
                <h2 style="margin:0; font-size:22px; color:#fff;">Matrices de Causa y Efecto por Panel</h2>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #a1a1aa;">Haz <strong>anticlic (clic derecho)</strong> sobre una fila o columna para eliminarla. Haz clic en los textos (filas y columnas) para editarlos.</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <button id="btn-comentario" style="background: #d97706; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size:14px; transition: background 0.2s;"><i class="fas fa-comment-alt"></i>Comentario</button>
                <button id="btn-regresar-config" style="background: #4b5563; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size:14px; transition: background 0.2s;"><i class="fas fa-arrow-left"></i> Volver a Configuración</button>
                <button id="btn-exportar-excel-all" style="background: #10b981; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size:14px;"><i class="fas fa-file-excel"></i> Descargar Excel (.xls)</button>
                <button id="btn-cerrar-final" style="background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size:14px;">✓ Guardar Todo y Regresar</button>
            </div>
        </div>
        <div id="matrices-paneles-container" style="width: 100%; max-width: 1700px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; position: relative;"></div>

        <button id="row-insert-btn-floating" style="position: absolute; display: none; background: #2563eb; color: white; border: none; width: 22px; height: 22px; border-radius: 50%; font-size: 14px; font-weight: bold; cursor: pointer; z-index: 100000; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.5); padding:0;">+</button>
        <button id="col-insert-btn-floating" style="position: absolute; display: none; background: #065f46; color: white; border: none; width: 22px; height: 22px; border-radius: 50%; font-size: 14px; font-weight: bold; cursor: pointer; z-index: 100000; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.5); padding:0;">+</button>

        <div id="custom-context-menu" style="display: none; position: absolute; background: #1f1f23; border: 1px solid #3f3f46; border-radius: 6px; z-index: 100001; box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 5px 0; width: 140px;">
            <div id="ctx-delete-item" style="padding: 8px 12px; color: #ef4444; font-size: 13px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Eliminar</div>
        </div>

        <!-- MODAL DE FEEDBACK DE LA WEB -->
        <div id="modal-comentario" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 100002; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: #1f2937; border: 1px solid #374151; border-radius: 12px; width: 100%; max-width: 500px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                <h3 style="margin: 0 0 8px 0; color: #f9fafb; font-size: 18px; font-weight: bold;">Feedback y Sugerencias de la Web</h3>
                <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 13px;">Escribe tus comentarios, sugerencias o fallos encontrados para mejorar la aplicación.</p>
                
                <textarea id="txt-comentario" style="width: 100%; height: 120px; background: #111827; border: 1px solid #4b5563; border-radius: 8px; padding: 12px; color: #fff; font-family: inherit; font-size: 14px; resize: vertical; box-sizing: border-box; outline: none;" placeholder="¿Qué te pareció la herramienta? ¿Encontraste algún error o mejora?"></textarea>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button id="btn-cerrar-modal" style="background: #4b5563; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">Cancelar</button>
                    <button id="btn-guardar-comentario" style="background: #d97706; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">Enviar Feedback</button>
                </div>
            </div>
        </div>
    `;

    // Referencias
    const btnComentario = document.getElementById('btn-comentario');
    const modalComentario = document.getElementById('modal-comentario');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnGuardarComentario = document.getElementById('btn-guardar-comentario');
    const txtComentario = document.getElementById('txt-comentario');

    btnComentario.addEventListener('click', () => {
        modalComentario.style.display = 'flex';
    });

    btnCerrarModal.addEventListener('click', () => {
        modalComentario.style.display = 'none';
    });

    modalComentario.addEventListener('click', (e) => {
        if (e.target === modalComentario) {
            modalComentario.style.display = 'none';
        }
    });
    
    btnGuardarComentario.addEventListener('click', () => {
        const texto = txtComentario.value.trim();

        if (!texto) {
            alert("Por favor escribe un comentario antes de enviar.");
            return;
        }

        btnGuardarComentario.disabled = true;
        btnGuardarComentario.innerText = "Enviando...";

        window.dispatchEvent(new CustomEvent('guardarComentarioSupabaseEvent', {
            detail: { texto: texto }
        }));
    });

    window.addEventListener('comentarioGuardadoResultado', (e) => {
        btnGuardarComentario.disabled = false;
        btnGuardarComentario.innerText = "Enviar Feedback";

        if (e.detail.exito) {
            alert("¡Muchas gracias por tus comentarios!");
            modalComentario.style.display = 'none';
            txtComentario.value = "";
        } else {
            alert("Error de Supabase: " + e.detail.error);
        }
    }, { once: true });

    const mainContainer = superContenedor.querySelector('#matrices-paneles-container');
    const rowFloater = superContenedor.querySelector('#row-insert-btn-floating');
    const colFloater = superContenedor.querySelector('#col-insert-btn-floating');
    const ctxMenu = superContenedor.querySelector('#custom-context-menu');
    const ctxDeleteBtn = superContenedor.querySelector('#ctx-delete-item');

    let activeTargetInfo = null; 
    let rightClickedElementInfo = null;

    function getExcelColumnLabel(index) {
        let label = "";
        while (index >= 0) {
            label = String.fromCharCode((index % 26) + 65) + label;
            index = Math.floor(index / 26) - 1;
        }
        return label;
    }

    for (let f = 1; f <= facusConfigurados; f++) {
        const listaEntradas = entradasPorFacu[f] || [];
        const bloqueFacu = document.createElement('div');

        const countAnunc = (salidasPorFacu[f] || []).filter(s => s.grupo === "anunciacion").length;
        const countNotif = (salidasPorFacu[f] || []).filter(s => s.grupo === "notificacion").length;
        const countEnclav = (salidasPorFacu[f] || []).filter(s => s.grupo === "enclavamiento").length;

        bloqueFacu.id = `bloque-facu-${f}`;
        bloqueFacu.style.cssText = "width: 100%; background: #141417; border: 1px solid #27272a; border-radius: 8px; padding: 20px; box-sizing: border-box; position: relative;";
        
        bloqueFacu.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #3b82f6; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
                ⚙️ MATRIZ DE CAUSA Y EFECTO - FACU #0${f}
            </h3>
            
            <div style="width: 100%; overflow-x: auto; border: 1px solid #3f3f46; border-radius: 6px;">
                <table id="tabla-facu-${f}" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; color: #e4e4e7; position: relative;">
                    <thead>
                        <tr class="row-headers-subgroups" style="background: #27272a;">
                            <th rowspan="3" style="padding: 12px; border: 1px solid #3f3f46; min-width: 350px;">ENTRADAS / SALIDAS</th>
                            <th id="header-anunciacion-${f}" colspan="${countAnunc}" style="padding: 6px; border: 1px solid #3f3f46; text-align: center; background: #1e3a8a;">Anunciación</th>
                            <th id="header-notificacion-${f}" colspan="${countNotif}" style="padding: 6px; border: 1px solid #3f3f46; text-align: center; background: #065f46;">Notificación</th>
                            <th id="header-enclavamiento-${f}" colspan="${countEnclav}" style="padding: 6px; border: 1px solid #3f3f46; text-align: center; background: #9a3412;">Enclavamiento</th>
                        </tr>
                        <tr class="row-headers-names" style="background: #1e1e22;">
                            ${(salidasPorFacu[f] || []).map((s) => `<th contenteditable="true" class="col-trigger-header" style="padding: 6px; border: 1px solid #3f3f46; font-size: 11px; text-align: center; min-width: 45px; position: relative; outline: none;">${typeof s === 'object' ? s.nombre : s}</th>`).join('')}
                        </tr>
                        <tr class="row-headers-letters" style="background: #1e1e22;">
                            ${(salidasPorFacu[f] || []).map((s, idx) => {
                                let letra = getExcelColumnLabel(idx);
                                if(typeof s === 'object') s.letra = letra; 
                                return `<th style="padding: 4px; border: 1px solid #3f3f46; text-align: center; color: #3b82f6; font-weight: bold;">${letra}</th>`;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody class="tbody-matriz-causas">
                        ${listaEntradas.map((entradaItem, index) => {
                            const causaTexto = obtenerTextoCausa(entradaItem);
                            const interseccionesGuardadas = (typeof entradaItem === 'object' && entradaItem.intersecciones) ? entradaItem.intersecciones : null;

                            let entradaLimpia = causaTexto.replace(/^FACU\s*#?\d+\s*-\s*/i, '');
                            
                            let cellsHtml = "";
                            (salidasPorFacu[f] || []).forEach((salida, idxCol) => {
                                let valorFinal;

                                if (interseccionesGuardadas && interseccionesGuardadas[idxCol] !== undefined) {
                                    valorFinal = interseccionesGuardadas[idxCol];
                                } else {
                                    valorFinal = calcularInterseccionAutomatica(causaTexto, salida);
                                }

                                let estiloCelda = (valorFinal === "X") 
                                    ? "background-color: #2563eb; color: white; font-weight: bold;" 
                                    : "color: #52525b;";

                                cellsHtml += `<td class="excel-interseccion-cell" style="padding: 10px; border: 1px solid #3f3f46; text-align: center; cursor: pointer; ${estiloCelda}">${valorFinal}</td>`;
                            });

                            return `<tr class="row-trigger-causa" style="border-bottom: 1px solid #27272a;"><td contenteditable="true" class="editable-cause-cell" style="padding: 10px; border: 1px solid #3f3f46; background: #18181b; outline: none; min-width: 350px;"><strong>${index + 1}</strong>. ${entradaLimpia}</td>${cellsHtml}</tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        mainContainer.appendChild(bloqueFacu);
    }

    mainContainer.addEventListener('mousemove', (e) => {
        const row = e.target.closest('.row-trigger-causa');
        if (row) {
            const rect = row.getBoundingClientRect();
            if ((e.clientY - rect.top) > rect.height - 8) {
                const containerRect = superContenedor.getBoundingClientRect();
                rowFloater.style.display = 'flex';
                rowFloater.style.top = `${rect.bottom + superContenedor.scrollTop - containerRect.top - 11}px`;
                rowFloater.style.left = `${rect.left - containerRect.left + 10}px`;
                activeTargetInfo = { type: 'row', element: row, table: row.closest('table') };
                return;
            }
        }

        const th = e.target.closest('.col-trigger-header');
        if (th) {
            const rect = th.getBoundingClientRect();
            if ((e.clientX - rect.left) > rect.width - 8) {
                const containerRect = superContenedor.getBoundingClientRect();
                colFloater.style.display = 'flex';
                colFloater.style.top = `${rect.top + superContenedor.scrollTop - containerRect.top - 25}px`;
                colFloater.style.left = `${rect.right - containerRect.left - 11}px`;
                activeTargetInfo = { type: 'col', index: th.cellIndex, table: th.closest('table') };
                return;
            }
        }
    });

    superContenedor.addEventListener('mouseleave', () => {
        rowFloater.style.display = 'none'; colFloater.style.display = 'none';
    });

    rowFloater.addEventListener('click', () => {
        if (!activeTargetInfo || activeTargetInfo.type !== 'row') return;
        const desc = prompt("Descripción de la nueva causa:");
        if (!desc || !desc.trim()) return;

        const currentRow = activeTargetInfo.element;
        const tbody = activeTargetInfo.table.querySelector('.tbody-matriz-causas');
        const numCols = activeTargetInfo.table.querySelector('.row-headers-letters').children.length;

        const newTr = document.createElement('tr');
        newTr.className = "row-trigger-causa";
        newTr.style.borderBottom = "1px solid #27272a";

        let html = `<td contenteditable="true" class="editable-cause-cell" style="padding: 10px; border: 1px solid #3f3f46; background: #18181b; outline: none;">${desc}</td>`;
        for (let i = 0; i < numCols; i++) {
            html += `<td class="excel-interseccion-cell" style="padding: 10px; border: 1px solid #3f3f46; text-align: center; cursor: pointer; color: #52525b;">-</td>`;
        }
        newTr.innerHTML = html;
        currentRow.parentNode.insertBefore(newTr, currentRow.nextSibling);
        
        reindexarFilasTabla(tbody);
        rowFloater.style.display = 'none';
    });

    colFloater.addEventListener('click', () => {
        if (!activeTargetInfo || activeTargetInfo.type !== 'col') return;
        const name = prompt("Nombre del dispositivo de salida:");
        if (!name || !name.trim()) return;

        const targetIndex = activeTargetInfo.index; 
        const tabla = activeTargetInfo.table;
        const facuNum = tabla.id.replace('tabla-facu-', '');

        const headerNotif = document.getElementById(`header-notificacion-${facuNum}`);
        if (headerNotif) headerNotif.colSpan = headerNotif.colSpan + 1;

        if (salidasPorFacu[facuNum]) {
            salidasPorFacu[facuNum].splice(targetIndex + 1, 0, {
                nombre: name,
                grupo: "notificacion"
            });
        }

        const rowNames = tabla.querySelector('.row-headers-names');
        const thName = document.createElement('th');
        thName.className = "col-trigger-header";
        thName.contentEditable = "true";
        thName.style.cssText = "padding: 6px; border: 1px solid #3f3f46; font-size: 11px; text-align: center; min-width: 45px; position: relative; outline: none;";
        thName.innerText = name;
        rowNames.insertBefore(thName, rowNames.children[targetIndex].nextSibling);

        const rowLetters = tabla.querySelector('.row-headers-letters');
        const thLetter = document.createElement('th');
        thLetter.style.cssText = "padding: 4px; border: 1px solid #3f3f46; text-align: center; color: #3b82f6; font-weight: bold;";
        rowLetters.insertBefore(thLetter, rowLetters.children[targetIndex]);

        const tbodyRows = tabla.querySelector('.tbody-matriz-causas').children;
        for (let row of tbodyRows) {
            const tdCell = document.createElement('td');
            tdCell.className = "excel-interseccion-cell";
            tdCell.style.cssText = "padding: 10px; border: 1px solid #3f3f46; text-align: center; cursor: pointer; color: #52525b;";
            tdCell.innerText = "-";
            row.insertBefore(tdCell, row.children[targetIndex + 1]); 
        }

        Array.from(rowLetters.children).forEach((thL, idx) => {
            let letraCorrecta = getExcelColumnLabel(idx);
            thL.innerText = letraCorrecta;
            thL.setAttribute('data-letra', letraCorrecta);
        });

        colFloater.style.display = 'none';
    });

    function reindexarFilasTabla(tbody) {
        Array.from(tbody.children).forEach((row, i) => {
            const firstCell = row.children[0];
            const limpio = firstCell.innerHTML.replace(/^<strong>.*?<\/strong>\.?\s*/, '');
            firstCell.innerHTML = `<strong>${i + 1}</strong>. ${limpio}`;
        });
    }

    mainContainer.addEventListener('click', (e) => {
        ctxMenu.style.display = 'none';
        const cell = e.target.closest('.excel-interseccion-cell');
        if (!cell) return;
        if (cell.innerText === "-") {
            cell.innerText = "X"; cell.style.backgroundColor = "#2563eb"; cell.style.color = "white"; cell.style.fontWeight = "bold";
        } else {
            cell.innerText = "-"; cell.style.backgroundColor = "transparent"; cell.style.color = "#52525b"; cell.style.fontWeight = "normal";
        }
    });

    mainContainer.addEventListener('contextmenu', (e) => {
        const rowCausa = e.target.closest('.row-trigger-causa');
        const colHeader = e.target.closest('.col-trigger-header');

        if (rowCausa || colHeader) {
            e.preventDefault();
            
            const containerRect = superContenedor.getBoundingClientRect();
            ctxMenu.style.display = 'block';
            ctxMenu.style.top = `${e.clientY + superContenedor.scrollTop - containerRect.top}px`;
            ctxMenu.style.left = `${e.clientX - containerRect.left}px`;

            if (rowCausa) {
                rightClickedElementInfo = { type: 'row', element: rowCausa, tbody: rowCausa.closest('.tbody-matriz-causas') };
            } else if (colHeader) {
                rightClickedElementInfo = { type: 'col', index: colHeader.cellIndex, table: colHeader.closest('table') };
            }
        }
    });

    superContenedor.addEventListener('click', (e) => {
        if (!e.target.closest('#custom-context-menu')) ctxMenu.style.display = 'none';
    });

    ctxDeleteBtn.addEventListener('click', () => {
        if (!rightClickedElementInfo) return;

        if (rightClickedElementInfo.type === 'row') {
            rightClickedElementInfo.element.remove();
            reindexarFilasTabla(rightClickedElementInfo.tbody);
        } 
        else if (rightClickedElementInfo.type === 'col') {
            const idx = rightClickedElementInfo.index;
            const tabla = rightClickedElementInfo.table;
            const facuNum = tabla.id.replace('tabla-facu-', '');

            const headerNotif = document.getElementById(`header-notificacion-${facuNum}`);
            if (headerNotif && headerNotif.colSpan > 1) headerNotif.colSpan = headerNotif.colSpan - 1;

            if (salidasPorFacu[facuNum] && salidasPorFacu[facuNum][idx]) {
                salidasPorFacu[facuNum].splice(idx, 1);
            }

            const rowNames = tabla.querySelector('.row-headers-names');
            if(rowNames && rowNames.children[idx]) rowNames.children[idx].remove();
            
            const rowLetters = tabla.querySelector('.row-headers-letters');
            if(rowLetters && rowLetters.children[idx]) rowLetters.children[idx].remove();

            const tbodyRows = tabla.querySelector('.tbody-matriz-causas').children;
            for (let row of tbodyRows) {
                if (row.children[idx + 1]) row.children[idx + 1].remove();
            }

            if(rowLetters) {
                Array.from(rowLetters.children).forEach((thL, idxL) => {
                    let letraCorrecta = getExcelColumnLabel(idxL);
                    thL.innerText = letraCorrecta;
                    thL.setAttribute('data-letra', letraCorrecta);
                });
            }
        }

        ctxMenu.style.display = 'none';
        rightClickedElementInfo = null;
    });

    ctxDeleteBtn.addEventListener('mouseenter', () => ctxDeleteBtn.style.background = '#27272a');
    ctxDeleteBtn.addEventListener('mouseleave', () => ctxDeleteBtn.style.background = 'transparent');

    superContenedor.querySelector('#btn-exportar-excel-all').addEventListener('click', async () => {
        try {
            const datosEstructurados = obtenerDatosEstructuradosDeLaPantalla();
            const nombreOriginal = window.nombreProyectoActual || "Matriz_Causa_Efecto_DYA";

            await descargarExcelConPlantillaDYA(datosEstructurados, nombreOriginal);
        } catch (err) {
            console.error("Error al exportar con formato ExcelJS:", err);
            alert("Asegúrate de haber importado la librería ExcelJS en tu HTML.");
        }
    });

    superContenedor.querySelector('#btn-cerrar-final').addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            const datosEstructurados = obtenerDatosEstructuradosDeLaPantalla();
            const nombreOriginal = window.nombreProyectoActual || "Proyecto Base";
            const nuevoNombreCopia = generarNombreCopia(nombreOriginal);

            window.idProyectoActual = null; 
            window.nombreProyectoActual = nuevoNombreCopia;

            const customEvent = new CustomEvent('guardarProyectoSupabaseEvent', {
                detail: { 
                    datos: datosEstructurados,
                    nombreProyecto: nuevoNombreCopia
                }
            });
            window.dispatchEvent(customEvent);

            superContenedor.remove();
            if (typeof chatBoxGlobal !== 'undefined' && chatBoxGlobal) {
                const aviso = document.createElement('div');
                aviso.className = 'bot-message';
                aviso.style.marginTop = "10px";
                aviso.innerHTML = `Nuevo proyecto creado.`;
                chatBoxGlobal.appendChild(aviso);
                chatBoxGlobal.scrollTop = chatBoxGlobal.scrollHeight;
            }

        } catch (error) {
            console.error("❌ Error al procesar el guardado:", error);
            alert("Ocurrió un error al preparar los datos: " + error.message);
        }
    });

    const btnRegresar = superContenedor.querySelector('#btn-regresar-config');
    btnRegresar.addEventListener('mouseenter', () => btnRegresar.style.background = '#374151');
    btnRegresar.addEventListener('mouseleave', () => btnRegresar.style.background = '#4b5563');
    
    btnRegresar.addEventListener('click', () => {
        const datosActualesEnPantalla = obtenerDatosEstructuradosDeLaPantalla(); 

        Object.keys(datosActualesEnPantalla).forEach(fId => {
            entradasPorFacu[fId] = datosActualesEnPantalla[fId].entradas;
        });
        
        facuActualIndex = 1;
        subFaseActual = "entradas";

        renderizarFlujoSecuencial(); 
    });
}

export function obtenerDatosEstructuradosDeLaPantalla() {
    const datosParaGuardar = {};
    const tablas = document.querySelectorAll('[id^="tabla-facu-"]');
    
    if (tablas.length === 0) {
        console.warn("No se encontraron tablas de FACU activas para extraer.");
        return {};
    }

    tablas.forEach(tabla => {
        const facuId = tabla.id.replace('tabla-facu-', '');
        
        // 1. Extraer Nombres de Columnas / Salidas (Modificadas o Editadas)
        const thCols = tabla.querySelectorAll('.row-headers-names .col-trigger-header');
        const salidasActualizadas = [];

        thCols.forEach((th, cIdx) => {
            const textoColumnaEditado = th.innerText.trim();
            const salidaPrevia = (salidasPorFacu[facuId] && salidasPorFacu[facuId][cIdx]) ? salidasPorFacu[facuId][cIdx] : {};

            if (typeof salidaPrevia === 'object') {
                salidasActualizadas.push({
                    ...salidaPrevia,
                    nombre: textoColumnaEditado
                });
            } else {
                salidasActualizadas.push({
                    nombre: textoColumnaEditado,
                    grupo: "notificacion"
                });
            }
        });

        salidasPorFacu[facuId] = salidasActualizadas;

        const entradas = [];
        const filas = tabla.querySelectorAll('.tbody-matriz-causas tr');
        filas.forEach(fila => {
            const celdaCausa = fila.querySelector('.editable-cause-cell');
            let textoCausa = "";
            if (celdaCausa) {
                textoCausa = celdaCausa.innerHTML.replace(/^<strong>.*?<\/strong>\.?\s*/, '').trim();
            }

            const celdasInterseccion = fila.querySelectorAll('.excel-interseccion-cell');
            const intersecciones = [];
            celdasInterseccion.forEach(celda => {
                const valor = celda.innerText.trim();
                intersecciones.push(valor === "X" ? "X" : "-");
            });

            entradas.push({
                causa: textoCausa,
                intersecciones: intersecciones
            });
        });

        datosParaGuardar[facuId] = {
            entradas: entradas,
            salidas: salidasActualizadas
        };
    });

    return datosParaGuardar;

}

/**
 * Genera y descarga la Matriz Causa-Efecto en Excel (.xlsx) respetando los colores y bordes DYA.
 * 
 * @param {Object} datosMatriz Objeto con la estructura cargada o extraída de pantalla
 * @param {String} nombreProyecto Nombre del archivo a guardar
 */
async function descargarExcelConPlantillaDYA(datosMatriz, nombreProyecto = "Matriz_Causa_Efecto") {
    if (typeof ExcelJS === 'undefined') {
        alert("Falta la librería ExcelJS. Agrega <script src='https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js'></script> en tu HTML.");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const facuKeys = Object.keys(datosMatriz);

    if (facuKeys.length === 0) {
        alert("No hay datos de matrices para exportar.");
        return;
    }

    // Mapa oficial de colores ARGB
    const PALETA_COLORES = {
        NOTIFICACION: 'FF92D050',  // Verde
        ALARMA: 'FFFF9696',        // Rojo
        SUPERVISION: 'FFFFC000',   // Naranja/Amarillo
        FALLA: 'FFFFFF00',         // Amarillo brillante
        DESPLEGAR: 'FF00B0F0',     // Azul
        ENCLAVAMIENTO: 'FFFFCCFF'  // Rosado/Morado claro
    };

    // DEFINICIÓN DE BORDES: "Todos los bordes" (Thin / Delgado)
    const BORDES_TODOS = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    facuKeys.forEach((fKey) => {
        const datosFacu = datosMatriz[fKey] || {};
        const salidas = datosFacu.salidas || [];
        const entradas = datosFacu.entradas || [];
        const totalSalidas = salidas.length;

        const nombreHoja = `FACU #0${fKey}`;
        const worksheet = workbook.addWorksheet(nombreHoja);

        // Anchos de columna
        worksheet.getColumn(1).width = 5;  // A: Número
        worksheet.getColumn(2).width = 75; // B: Descripción de Entradas

        for (let c = 0; c < totalSalidas; c++) {
            worksheet.getColumn(3 + c).width = 5.5; // C en adelante: Salidas
        }

        // --- FILA 1: ENCABEZADO SALIDAS FACU ---
        if (totalSalidas > 0) {
            worksheet.mergeCells(1, 3, 1, 2 + totalSalidas);
            
            // Aplicar borde a todas las celdas combinadas de la Fila 1 para evitar cortes visuales
            for (let c = 3; c <= 2 + totalSalidas; c++) {
                const cell = worksheet.getCell(1, c);
                cell.border = BORDES_TODOS;
            }

            const cellSalidas = worksheet.getCell(1, 3);
            cellSalidas.value = `SALIDAS FACU #0${fKey}`;
            cellSalidas.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6DCE4' } };
            cellSalidas.font = { name: 'Arial', size: 11, bold: true };
            cellSalidas.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // --- FILA 2: GRUPOS / MÓDULOS (Anunciación, Notificación, Enclavamiento) ---
        let colCursor = 3;
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

                // Asegurar bordes en todo el rango combinado del grupo
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

        // --- FILA 3: TEXTO ROTADO DE SALIDAS (AJUSTE DINÁMICO PERFECTO) ---
        // 1. Encontrar la oración más larga para calcular el alto de la fila 3
        const maxCaracteres = salidas.reduce((max, s) => {
            const txt = typeof s === 'object' ? (s.nombre || "") : String(s);
            return Math.max(max, txt.length);
        }, 0);

        // 2. Calcular la altura ideal según la longitud del texto
        const alturaCalculada = Math.max(120, maxCaracteres * 5.5);
        worksheet.getRow(3).height = alturaCalculada;

        salidas.forEach((salida, index) => {
            const colIdx = 3 + index;
            const cell = worksheet.getCell(3, colIdx);

            const textoSalida = typeof salida === 'object' ? (salida.nombre || "") : String(salida);
            const grupo = (salida.grupo || "").toLowerCase();
            const tipo = (salida.tipo || "").toLowerCase();
            const textoLower = textoSalida.toLowerCase();

            cell.value = textoSalida;

            // Determinación de color según reglas de señal
            let colorAsignado = PALETA_COLORES.ALARMA;

            if (grupo === 'enclavamiento') {
                colorAsignado = PALETA_COLORES.ENCLAVAMIENTO;
            } else if (grupo === 'notificacion') {
                colorAsignado = PALETA_COLORES.NOTIFICACION;
            } else if (textoLower.includes('desplegar') || textoLower.includes('imprimir') || textoLower.includes('cambio de estado')) {
                colorAsignado = PALETA_COLORES.DESPLEGAR;
            } else if (tipo === 'supervision' || textoLower.includes('supervisión') || textoLower.includes('supervision')) {
                colorAsignado = PALETA_COLORES.SUPERVISION;
            } else if (tipo === 'falla' || textoLower.includes('falla')) {
                colorAsignado = PALETA_COLORES.FALLA;
            } else if (tipo === 'alarma' || textoLower.includes('alarma') || textoLower.includes('facu')) {
                colorAsignado = PALETA_COLORES.ALARMA;
            }

            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorAsignado } };
            cell.font = { name: 'Arial', size: 9 };
            
            // Alineación vertical a 90° en 1 sola línea sin margen excedente
            cell.alignment = { 
                textRotation: 90, 
                vertical: 'bottom', 
                horizontal: 'center', 
                wrapText: false 
            };
            
            cell.border = BORDES_TODOS;
        });

        // --- FILA 4: ENCABEZADO ENTRADAS Y LETRAS CORRELATIVAS (A, B, C...) ---
        const cellEntradasHeader = worksheet.getCell(4, 2);
        cellEntradasHeader.value = `ENTRADAS FACU #0${fKey}`;
        cellEntradasHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
        cellEntradasHeader.font = { name: 'Arial', size: 10, bold: true };
        cellEntradasHeader.alignment = { vertical: 'middle', horizontal: 'center' };
        cellEntradasHeader.border = BORDES_TODOS; // Borde marcado

        salidas.forEach((_, index) => {
            const colIdx = 3 + index;
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
            cell.border = BORDES_TODOS; // Borde marcado
        });

        // --- FILAS 5 EN ADELANTE: CAUSAS E INTERSECCIONES ---
        entradas.forEach((entrada, rIdx) => {
            const rowNum = 5 + rIdx;
            const row = worksheet.getRow(rowNum);
            row.height = 24;

            // Columna A: Número correlativo
            const cellNum = worksheet.getCell(rowNum, 1);
            cellNum.value = rIdx + 1;
            cellNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
            cellNum.font = { name: 'Arial', size: 9, bold: true };
            cellNum.alignment = { vertical: 'middle', horizontal: 'center' };
            cellNum.border = BORDES_TODOS; // Borde marcado

            // Columna B: Causa / Descripción
            const cellDesc = worksheet.getCell(rowNum, 2);
            let textoCausa = obtenerTextoCausa(entrada);
            textoCausa = textoCausa.replace(/^FACU\s*#?\d+\s*-\s*/i, '');

            cellDesc.value = textoCausa;
            cellDesc.font = { name: 'Arial', size: 9 };
            cellDesc.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            cellDesc.border = BORDES_TODOS; // Borde marcado

            // Columnas C en adelante: Intersecciones ('X' o '-')
            const arrayIntersecciones = entrada.intersecciones || [];

            salidas.forEach((salidaItem, cIdx) => {
                const colIdx = 3 + cIdx;
                const cellVal = worksheet.getCell(rowNum, colIdx);

                let valorCruz = arrayIntersecciones[cIdx];
                if (valorCruz === undefined || valorCruz === null) {
                    valorCruz = calcularInterseccionAutomatica(textoCausa, salidaItem);
                }

                cellVal.value = valorCruz;
                cellVal.font = { name: 'Arial', size: 10, bold: valorCruz === "X" };
                cellVal.alignment = { vertical: 'middle', horizontal: 'center' };
                cellVal.border = BORDES_TODOS; // Borde marcado
            });
        });
    });

    // Descarga del archivo .xlsx
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
