import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { flujoMatriz } from './n-proy-matriz.js';
import { flujoBateria } from './n-proy-bateria.js';
import { flujoVoltaje } from './n-proy-voltaje.js';
import { setBotState, typeWelcomeMessage, renderBotResponse } from './bot-ui.js';


const SUPABASE_URL = "https://hesgsgvzgfdagityctdk.supabase.co";
const SUPABASE_KEY = "sb_publishable_fYCASIho-yAC7XIXtF7YvA_y4TtnEfW";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getSupabaseClient() {
    return supabase;
}

const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const welcomeScreen = document.getElementById('welcome-screen');
const botAvatar = document.getElementById('bot-avatar');

let silenceTimeout = null; 

// Estado conversacional global para flujos de módulos ('matriz' | 'voltaje' | 'baterias' | null)
let moduloActivoNuevoProy = null;

let clienteActual = "";
let proyectoEnEdicionId = null; 

if (sendBtn) {
    sendBtn.addEventListener('click', () => { sendMessage(userInput.value); });
}

if (userInput) {
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(userInput.value);
        }
    });
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Inicialización de la pantalla de bienvenida usando bot-ui.js
window.addEventListener('load', () => { 
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden') && botAvatar) {
        typeWelcomeMessage(botAvatar, () => {
            // Callback opcional al finalizar el tipeo de bienvenida
        });
    }
});

// Helper para generar botoneras generales
function generarOpcionesChat(opciones) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = "display: flex; flex-direction: column; gap: 8px; margin-top: 10px; width: 100%;";
    opciones.forEach(opc => {
        const btn = document.createElement('button');
        btn.style.cssText = "background: #222227; color: #e4e4e7; border: 1px solid #3f3f46; padding: 10px 12px; text-align: left; border-radius: 6px; cursor: pointer; font-size: 13px; width: 100%; transition: background 0.2s;";
        btn.innerHTML = `<strong>${opc.texto}</strong>${opc.subtexto ? `<br><span style="color: #a1a1aa; font-size: 11px;">${opc.subtexto}</span>` : ''}`;
        btn.addEventListener('mouseenter', () => btn.style.background = '#2d2d34');
        btn.addEventListener('mouseleave', () => btn.style.background = '#222227');
        btn.addEventListener('click', () => sendMessage(opc.valor));
        wrapper.appendChild(btn);
    });
    return wrapper;
}

// Helper para botones horizontales de "Nueva tarea"
function crearBotoneraNuevasTareas() {
    const contenedorAccionesNuevas = document.createElement('div');
    contenedorAccionesNuevas.style.cssText = "margin-top: 10px; padding-top: 8px; border-top: 1px solid #3f3f46; display: flex; flex-direction: column; gap: 6px;";

    const labelNuevos = document.createElement('span');
    labelNuevos.style.cssText = "font-size: 11px; color: #a1a1aa;";
    labelNuevos.innerText = "Puedes crear una nueva tarea desde cero:";
    contenedorAccionesNuevas.appendChild(labelNuevos);

    const filaBotones = document.createElement('div');
    filaBotones.style.cssText = "display: flex; gap: 6px; flex-wrap: wrap;";

    const btnNuevoMatriz = document.createElement('button');
    btnNuevoMatriz.style.cssText = "background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; transition: background 0.2s;";
    btnNuevoMatriz.innerText = "Matriz Causa/Efecto";
    btnNuevoMatriz.addEventListener('click', (e) => {
        e.stopPropagation();
        iniciarNuevoProyecto("matriz");
    });

    const btnNuevoVoltaje = document.createElement('button');
    btnNuevoVoltaje.style.cssText = "background: #0284c7; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; transition: background 0.2s;";
    btnNuevoVoltaje.innerText = "Caída de Voltaje";
    btnNuevoVoltaje.addEventListener('click', (e) => {
        e.stopPropagation();
        iniciarNuevoProyecto("voltaje");
    });

    const btnNuevoBaterias = document.createElement('button');
    btnNuevoBaterias.style.cssText = "background: #d97706; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; transition: background 0.2s;";
    btnNuevoBaterias.innerText = "Cálculo de Baterías";
    btnNuevoBaterias.addEventListener('click', (e) => {
        e.stopPropagation();
        iniciarNuevoProyecto("baterias");
    });

    filaBotones.appendChild(btnNuevoMatriz);
    filaBotones.appendChild(btnNuevoVoltaje);
    filaBotones.appendChild(btnNuevoBaterias);

    contenedorAccionesNuevas.appendChild(filaBotones);
    return contenedorAccionesNuevas;
}

// Envía y delega el renderizado a bot-ui.js
function publicarRespuestaBot(botReply, opciones = null, miniAvatar, msgDiv, customElementHTML = null) {
    let elementoInteractivo = null;

    if (opciones && opciones.length > 0) {
        elementoInteractivo = generarOpcionesChat(opciones);
    } else if (customElementHTML) {
        elementoInteractivo = customElementHTML;
    }

    renderBotResponse(msgDiv, botReply, miniAvatar, chatBox, elementoInteractivo);
}

// Inicialización de flujos con los módulos importados al inicio
function iniciarNuevoProyecto(tipoModulo) {
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
        welcomeScreen.classList.add('hidden');
        chatBox.classList.remove('hidden');
    }

    moduloActivoNuevoProy = tipoModulo;
    let inicioData = null;

    if (tipoModulo === "matriz") {
        inicioData = flujoMatriz.iniciar();
    } else if (tipoModulo === "voltaje") {
        inicioData = flujoVoltaje.iniciar();
    } else if (tipoModulo === "baterias") {
        inicioData = flujoBateria.iniciar();
    }

    if (inicioData) {
        const container = document.createElement('div');
        container.classList.add('bot-msg-container');
        const miniAvatar = document.createElement('img');
        miniAvatar.src = 'bot-thinking-chat.png'; 
        miniAvatar.className = 'bot-chat-img';
        const msgDiv = document.createElement('div');
        msgDiv.className = 'bot-message';
        
        container.appendChild(miniAvatar);
        container.appendChild(msgDiv);
        chatBox.appendChild(container);

        publicarRespuestaBot(inicioData.texto, inicioData.opciones, miniAvatar, msgDiv);
    }
}

async function sendMessage(text) {
    if (!text || !text.trim()) return;

    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
        welcomeScreen.classList.add('hidden');
        chatBox.classList.remove('hidden');
    }

    appendUserMessage(text);
    userInput.value = '';
    userInput.style.height = 'auto';

    const container = document.createElement('div');
    container.classList.add('bot-msg-container');
    const miniAvatar = document.createElement('img');
    miniAvatar.src = 'bot-thinking-chat.png'; 
    miniAvatar.className = 'bot-chat-img';
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bot-message';
    
    container.appendChild(miniAvatar);
    container.appendChild(msgDiv);
    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;

    setBotState('thinking', miniAvatar, true); 

    setTimeout(async () => {
        let cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        // 1. EVALUAR FLUJOS DE PREGUNTAS ACTIVOS
        if (moduloActivoNuevoProy === "matriz") {
            const contextoChat = { msgDiv, miniAvatar, chatBox, setBotState };
            const resp = await flujoMatriz.procesarRespuesta(text, contextoChat);
            publicarRespuestaBot(resp.texto, resp.opciones, miniAvatar, msgDiv);
            if (resp.moduloCompletado) moduloActivoNuevoProy = null;
            return;
        }

        if (moduloActivoNuevoProy === "voltaje") {
            const resp = await flujoVoltaje.procesarRespuesta(text);
            publicarRespuestaBot(resp.texto, resp.opciones, miniAvatar, msgDiv);
            if (resp.moduloCompletado) moduloActivoNuevoProy = null;
            return;
        }

        if (moduloActivoNuevoProy === "baterias") {
            const resp = await flujoBateria.procesarRespuesta(text);
            publicarRespuestaBot(resp.texto, resp.opciones, miniAvatar, msgDiv);
            if (resp.moduloCompletado) moduloActivoNuevoProy = null;
            return;
        }

        // 2. RECONOCER INTENCIONES POR COMANDO O TEXTO DIRECTO
        const pideMatriz = cleanText.includes('causa') || cleanText.includes('efecto') || cleanText.includes('matriz');
        const pideBaterias = cleanText.includes('bateria') || cleanText.includes('baterias');
        const pideVoltaje = cleanText.includes('caida') || cleanText.includes('voltaje') || cleanText.includes('tension');

        if (pideMatriz) {
            container.remove();
            iniciarNuevoProyecto("matriz");
            return;
        } 
        if (pideBaterias) {
            container.remove();
            iniciarNuevoProyecto("baterias");
            return;
        } 
        if (pideVoltaje) {
            container.remove();
            iniciarNuevoProyecto("voltaje");
            return;
        }

        // 3. BÚSQUEDA Y CONSULTAS EN SUPABASE
        let botReply = "";
        let customElementHTML = null;

        try {
            const client = getSupabaseClient();
            let { data: proyectos, error } = await client
                .from('proyectos')
                .select('*')
                .ilike('cliente', `%${text.trim()}%`); 

            if (error) throw error;
            clienteActual = text; 

            if (proyectos && proyectos.length > 0) {
                botReply = `He encontrado los siguientes registros asociados a "${text}" en la nube. Haz clic sobre uno para abrirlo:`;
                
                customElementHTML = document.createElement('div');
                customElementHTML.style.cssText = "display: flex; flex-direction: column; gap: 8px; margin-top: 10px; width: 100%;";

                proyectos.forEach(proy => {
                    const btnProy = document.createElement('button');
                    btnProy.style.cssText = "background: #222227; color: #e4e4e7; border: 1px solid #3f3f46; padding: 10px; text-align: left; border-radius: 6px; cursor: pointer; font-size: 13px; width: 100%; transition: background 0.2s;";
                    btnProy.innerHTML = `<strong>${proy.nombre_proyecto}</strong>`;
                    btnProy.addEventListener('mouseenter', () => btnProy.style.background = '#2d2d34');
                    btnProy.addEventListener('mouseleave', () => btnProy.style.background = '#222227');
                    btnProy.addEventListener('click', () => desplegarOpcionesProyecto(btnProy, proy));
                    customElementHTML.appendChild(btnProy);
                });

            } else {
                botReply = `No localicé proyectos existentes para "${text}".`;
                customElementHTML = crearBotoneraNuevasTareas();
            }
        } catch (err) {
            console.error("Error detallado:", err);
            botReply = `Hubo un inconveniente con Supabase. Detalle: ${err.message || err}`;
        }

        publicarRespuestaBot(botReply, null, miniAvatar, msgDiv, customElementHTML);

    }, 600);
}

function desplegarOpcionesProyecto(botonPadre, proyectoRow) {
    const contenedorExistente = botonPadre.querySelector('.panel-opciones-proyecto');
    if (contenedorExistente) { 
        contenedorExistente.remove(); 
        return; 
    }

    const panelOpciones = document.createElement('div');
    panelOpciones.className = 'panel-opciones-proyecto';
    panelOpciones.style.cssText = "display: flex; flex-direction: column; gap: 10px; margin-top: 8px; padding-left: 10px; border-left: 2px solid #2563eb;";

    const btnEditar = document.createElement('button');
    btnEditar.style.cssText = "background: #16a34a; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; width: fit-content;";
    btnEditar.innerText = "Editar Proyecto";
    
    btnEditar.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        proyectoEnEdicionId = proyectoRow.id; 
        clienteActual = proyectoRow.cliente;
        
        const tipoProyecto = (proyectoRow.tipo || 'matriz').toLowerCase();
        
        appendUserMessage(`Cargando proyecto para editar: ${proyectoRow.nombre_proyecto}`);

        if (tipoProyecto === 'voltaje' || tipoProyecto === 'caida_voltaje' || tipoProyecto === 'caida_tension') {
            const { moduloVoltaje } = await import('./modulo-voltaje.js');
            const datosGuardados = proyectoRow.datos || {};
            
            const estadoProyecto = datosGuardados.estadoActual || {
                fuentes: datosGuardados.fuentes || [
                    {
                        nombreFuente: "FUENTE NAC #01",
                        marca: "Notifier UL",
                        modelo: "ACPS-610 CLASS B",
                        voltajeNominal: 20.4,
                        clase: "B",
                        circuitos: [
                            {
                                nombreCircuito: "NAC Circuit1",
                                calibreAWG: "14",
                                dispositivos: []
                            }
                        ]
                    }
                ]
            };

            if (typeof moduloVoltaje.cargarEstadoCompleto === 'function') {
                moduloVoltaje.cargarEstadoCompleto(estadoProyecto);
            }

            moduloVoltaje.abrirModalVoltaje(
                estadoProyecto, 
                (datosFormulario) => moduloVoltaje.procesarDatosModal(datosFormulario)
            );
        } else {
            const moduloMatriz = await import('./modulo-matriz.js');
            let totalFacusDetectados = Object.keys(proyectoRow.datos || {}).length || 1;
            let totalZonasDetectadas = window.totalZonasGlobalesSistema || 5; 

            moduloMatriz.iniciarModuloMatriz(
                document.createElement('div'), 
                document.createElement('img'), 
                chatBox, 
                totalZonasDetectadas, 
                totalFacusDetectados, 
                () => {}
            );

            setTimeout(() => {
                moduloMatriz.cargarDatosGuardados(proyectoRow.datos);
            }, 150);
        }
    }); // <-- Aquí cierra correctamente la función del eventListener

    panelOpciones.appendChild(btnEditar);
    
    if (typeof crearBotoneraNuevasTareas === 'function') {
        panelOpciones.appendChild(crearBotoneraNuevasTareas());
    }

    botonPadre.appendChild(panelOpciones);
}

window.addEventListener('guardarProyectoSupabaseEvent', async (event) => {
    const { datos, tipo } = event.detail;

    let nombreFinalProyecto = prompt(
        "Asigna un nombre a este proyecto:", 
        proyectoEnEdicionId ? "" : ""
    );
    
    if (!nombreFinalProyecto) return;

    let cName = clienteActual || "Cliente Anonimo";
    let tipoModuloGuardar = tipo || moduloActivoNuevoProy || 'matriz';

    if (tipoModuloGuardar === 'caida_tension' || tipoModuloGuardar === 'caida_voltaje') {
        tipoModuloGuardar = 'voltaje';
    }

    try {
        const client = getSupabaseClient();
        const { error } = await client
            .from('proyectos')
            .insert([{ 
                cliente: cName.toLowerCase().trim(), 
                nombre_proyecto: nombreFinalProyecto, 
                tipo: tipoModuloGuardar,
                datos: datos 
            }]);

        if (error) throw error;
        alert("Proyecto guardado exitosamente.");

    } catch (err) {
        console.error("Error persistiendo datos:", err);
        alert(`No se pudo guardar en la nube: ${err.message || err}`);
    } finally {
        proyectoEnEdicionId = null; 
        moduloActivoNuevoProy = null;
    }
});

window.addEventListener('guardarComentarioSupabaseEvent', async (event) => {
    const { texto } = event.detail;

    try {
        const client = getSupabaseClient();
        const { error } = await client
            .from('comentarios_web')
            .insert([{ comentario: texto }]);

        if (error) throw error;

        window.dispatchEvent(new CustomEvent('comentarioGuardadoResultado', {
            detail: { exito: true }
        }));

    } catch (err) {
        console.error("Error al guardar comentario:", err);
        window.dispatchEvent(new CustomEvent('comentarioGuardadoResultado', {
            detail: { exito: false, error: err.message || err }
        }));
    }
});

function appendUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    let finalTranscript = "";

    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (micBtn.classList.contains('recording')) { recognition.stop(); } 
            else { finalTranscript = ""; recognition.start(); }
        });
    }

    recognition.onstart = () => { if(micBtn) micBtn.classList.add('recording'); userInput.placeholder = "Te escucho..."; };
    recognition.onresult = (event) => {
        if (silenceTimeout) clearTimeout(silenceTimeout);
        let resultText = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) resultText += event.results[i][0].transcript;
        }
        finalTranscript += resultText;
        silenceTimeout = setTimeout(() => { recognition.stop(); }, 1500); 
    };
    recognition.onend = () => {
        if(micBtn) micBtn.classList.remove('recording');
        userInput.placeholder = "Escribe un mensaje aquí...";
        if (finalTranscript.trim()) sendMessage(finalTranscript);
    };
}