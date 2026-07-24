import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

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

let mouthInterval = null; 
let silenceTimeout = null; 
let currentModule = ""; 
let pasoMatriz = ""; 
let totalFacus = 1;
let totalZonas = 1;
let instanciaCalculo = null;
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

function setBotState(state, targetImg = botAvatar, isChat = false) {
    if (mouthInterval) { clearInterval(mouthInterval); mouthInterval = null; }
    if (state === 'idle') {
        targetImg.src = isChat ? 'bot-open-original-chat.png' : 'bot-original.png';
    } else if (state === 'thinking') {
        targetImg.src = isChat ? 'bot-thinking-chat.png' : 'bot-thinking.png';
    } else if (state === 'talking') {
        let toggle = true;
        mouthInterval = setInterval(() => {
            targetImg.src = isChat 
                ? (toggle ? 'bot-open-A-chat.png' : 'bot-open-B-chat.png')
                : (toggle ? 'bot-open-A.png' : 'bot-open-B.png');
            toggle = !toggle;
        }, 220); 
    }
}

function typeWelcomeMessage() {
    const text = "HOLA, soy DYAbot.";
    if (welcomeScreen && welcomeScreen.classList.contains('hidden')) return; 

    const h1 = document.createElement('h1');
    h1.className = 'welcome-title-gradient'; 
    welcomeScreen.appendChild(h1);

    let index = 0;
    setBotState('talking', botAvatar, false);

    function type() {
        if (index < text.length) {
            h1.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, 40); 
        } else {
            setBotState('idle', botAvatar, false);
            const sub = document.createElement('p');
            sub.className = 'welcome-subtitle';
            sub.style.fontSize = "16px";
            sub.innerText = "Para comenzar, escribe tu nombre y apellido o el nombre del cliente del proyecto:";
            welcomeScreen.appendChild(sub);
        }
    }
    type();
}

window.addEventListener('load', () => { 
    typeWelcomeMessage(); 
});

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
        let botReply = "";
        let cleanText = text.toLowerCase().trim();
        let customElementHTML = null;

        let numeroDetectado = text.match(/\d+/);
        let valorNumerico = numeroDetectado ? parseInt(numeroDetectado[0]) : 1;

        if (currentModule === "" && !cleanText.includes('causa') && !cleanText.includes('matriz') && !cleanText.includes('bateria') && !cleanText.includes('caida')) {
            try {
                const client = getSupabaseClient();

                let { data: proyectos, error } = await client
                    .from('proyectos')
                    .select('*')
                    .ilike('cliente', cleanText); 

                if (error) throw error;

                clienteActual = text; 

                if (proyectos && proyectos.length > 0) {
                    botReply = `He encontrado los siguientes registros asociados a "${text}" en la nube. Haz clic sobre uno para ver sus opciones:`;
                    
                    customElementHTML = document.createElement('div');
                    customElementHTML.style.cssText = "display: flex; flex-direction: column; gap: 8px; margin-top: 10px; width: 100%;";
                    
                    proyectos.forEach(proy => {
                        const btnProy = document.createElement('button');
                        btnProy.style.cssText = "background: #222227; color: #e4e4e7; border: 1px solid #3f3f46; padding: 10px; text-align: left; border-radius: 6px; cursor: pointer; font-size: 13px; width: 100%; transition: background 0.2s; position: relative;";
                        btnProy.innerHTML = `📁 <strong>${proy.nombre_proyecto}</strong> <span style="font-size:11px; color:#a1a1aa; float:right;"></span>`;
                        
                        btnProy.addEventListener('mouseenter', () => btnProy.style.background = '#2d2d34');
                        btnProy.addEventListener('mouseleave', () => btnProy.style.background = '#222227');
                        
                        btnProy.addEventListener('click', () => {
                            desplegarOpcionesProyecto(btnProy, proy);
                        });
                        customElementHTML.appendChild(btnProy);
                    });
                } else {
                    botReply = `No localicé proyectos existentes para "${text}". ¿Deseas iniciar una tarea desde cero? Puedes indicarme:\n\n Matriz Causa Efecto,\n Cálculo de Baterías,\n Caída de Voltaje`;
                }
            } catch (err) {
                console.error("Error detallado:", err);
                botReply = `Hubo un inconveniente con Supabase. Detalle: ${err.message || err}`;
            }
        }

        else if (currentModule === "") {
            if (cleanText.includes('causa') || cleanText.includes('efecto') || cleanText.includes('matriz')) {
                currentModule = "matriz";
                pasoMatriz = "PREGUNTA_FACUS";
                botReply = "¡Excelente! Configuremos la infraestructura base en la nube. ¿Cuántos FACUs (Paneles de Control) tiene tu proyecto?";
            } else if (cleanText.includes('batería') || cleanText.includes('baterias')) {
                currentModule = "baterias";
                const { iniciarModuloBaterias } = await import('./modulo-baterias.js');
                instanciaCalculo = iniciarModuloBaterias();
                botReply = "Módulo de Baterías activo. Ingresa la corriente en reposo (Standby) en Amperios (A):";
            } else if (cleanText.includes('caida') || cleanText.includes('voltaje') || cleanText.includes('tension')) {
                currentModule = "caida_tension";
                const { iniciarModuloVoltaje } = await import('./modulo-voltaje.js');
                instanciaCalculo = iniciarModuloVoltaje();
                botReply = "Módulo de Caída de Tensión activo. Ingresa el voltaje nominal de salida (Ej: 24):";
            } else {
                botReply = "Por ahora, puedo ayudarte con: Matriz causa efecto, Cálculo de baterías, o Caída de voltaje. ¿Cuál deseas iniciar?";
            }
        } else {
            if (currentModule === "matriz") {
                if (pasoMatriz === "PREGUNTA_FACUS") {
                    totalFacus = valorNumerico;
                    pasoMatriz = "PREGUNTA_ZONAS";
                    botReply = `Entendido, se configurarán ${totalFacus} FACU(s) independientes.\n\nAhora, ¿cuántas Zonas de Alarma totales tiene todo el sistema/proyecto?`;
                } 
                else if (pasoMatriz === "PREGUNTA_ZONAS") {
                    totalZonas = valorNumerico; 
                    pasoMatriz = "BOTONERA_INTERACTIVA";
                    
                    const { iniciarModuloMatriz } = await import('./modulo-matriz.js');
                    
                    iniciarModuloMatriz(msgDiv, miniAvatar, chatBox, totalZonas, totalFacus, () => {
                        currentModule = ""; 
                        pasoMatriz = "";
                    });
                    
                    interceptarBotonFinalizarSupabase();
                    
                    setBotState('idle', miniAvatar, true);
                    return;
                }
            } 
            else if (instanciaCalculo) {
                botReply = instanciaCalculo.procesarRespuesta(text);
                if (instanciaCalculo.step === 0) { currentModule = ""; instanciaCalculo = null; }
            }
        }

        setBotState('talking', miniAvatar, true);
        const words = botReply.split(" ");
        let wordIndex = 0;

        const typingInterval = setInterval(() => {
            if (wordIndex < words.length) {
                msgDiv.innerHTML += (wordIndex === 0 ? "" : " ") + words[wordIndex];
                wordIndex++;
                chatBox.scrollTop = chatBox.scrollHeight;
            } else {
                clearInterval(typingInterval);
                setBotState('idle', miniAvatar, true); 
                if (customElementHTML) {
                    msgDiv.appendChild(customElementHTML);
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            }
        }, 120);

        chatBox.scrollTop = chatBox.scrollHeight;
    }, 600);
}

function desplegarOpcionesProyecto(botonPadre, proyectoRow) {
    const contenedorExistente = botonPadre.querySelector('.panel-opciones-proyecto');
    if (contenedorExistente) { contenedorExistente.remove(); return; }

    const panelOpciones = document.createElement('div');
    panelOpciones.className = 'panel-opciones-proyecto';
    panelOpciones.style.cssText = "display: flex; gap: 10px; margin-top: 8px; padding-left: 15px; border-left: 2px solid #2563eb;";

    const btnEditar = document.createElement('button');
    btnEditar.style.cssText = "background: #16a34a; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;";
    btnEditar.innerText = "✏️ Editar Proyecto";
    btnEditar.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        proyectoEnEdicionId = proyectoRow.id; 
        clienteActual = proyectoRow.cliente;
        
        currentModule = "matriz";
        pasoMatriz = "BOTONERA_INTERACTIVA";
        
        appendUserMessage(`Cargando proyecto para editar: ${proyectoRow.nombre_proyecto}`);
        
        const moduloMatriz = await import('./modulo-matriz.js');
        
        let totalFacusDetectados = Object.keys(proyectoRow.datos).length || 1;
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
            interceptarBotonFinalizarSupabase();
        }, 150);
    });

    const btnNuevo = document.createElement('button');
    btnNuevo.style.cssText = "background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;";
    btnNuevo.innerText = "✨ Iniciar uno Nuevo";
    btnNuevo.addEventListener('click', async (e) => {
        e.stopPropagation();

        proyectoEnEdicionId = null; 
        clienteActual = proyectoRow.cliente;
        
        currentModule = "matriz";
        pasoMatriz = "PREGUNTA_FACUS";
        
        appendUserMessage(`Iniciando nueva matriz causa/efecto para el cliente: ${clienteActual}`);
        sendMessage("Matriz Causa Efecto");
    });

    panelOpciones.appendChild(btnEditar);
    panelOpciones.appendChild(btnNuevo);
    botonPadre.appendChild(panelOpciones);
}

function interceptarBotonFinalizarSupabase() {
}

window.addEventListener('guardarProyectoSupabaseEvent', async (event) => {
    const { datos } = event.detail;

    let nombreFinalProyecto = prompt(
        "Asigna un nombre a este proyecto:", 
        proyectoEnEdicionId ? "Matriz Causa Efecto (Copia)" : "Matriz Causa Efecto General"
    );
    
    if (!nombreFinalProyecto) return;

    let cName = clienteActual || "Cliente Anonimo";

    try {
        const client = getSupabaseClient();

        const { error } = await client
            .from('proyectos')
            .insert([{ 
                cliente: cName.toLowerCase().trim(), 
                nombre_proyecto: nombreFinalProyecto, 
                datos: datos 
            }]);

        if (error) throw error;
        
        alert("☁️ Proyecto guardado exitosamente.");

    } catch (err) {
        console.error("Error persistiendo datos:", err);
        alert(`No se pudo guardar en la nube: ${err.message || err}`);
    } finally {
        proyectoEnEdicionId = null; 
        currentModule = "";
        pasoMatriz = "";
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