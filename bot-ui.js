let mouthInterval = null;

export function setBotState(state, targetImg, isChat = false) {
    if (mouthInterval) {
        clearInterval(mouthInterval);
        mouthInterval = null;
    }

    if (state === 'idle') {
        targetImg.src = isChat ? 'bot-open-original-chat.png' : 'bot-original.png';
    } else if (state === 'thinking') {
        targetImg.src = isChat ? 'bot-thinking-chat.png' : 'bot-thinking.png';
    } else if (state === 'talking') {
        let toggle = true;
        mouthInterval = setInterval(() => {
            if (isChat) {
                targetImg.src = toggle ? 'bot-open-A-chat.png' : 'bot-open-B-chat.png';
            } else {
                targetImg.src = toggle ? 'bot-open-A.png' : 'bot-open-B.png';
            }
            toggle = !toggle;
        }, 120); 
    }
}

export function typeWelcomeMessage(avatarImg, onComplete) {
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeParagraph = document.getElementById('welcome-p');
    
    const titleText = "Hola, soy DYAbot tu asistente.";
    const paragraphText = "Para comenzar, escribe tu nombre y apellido o el nombre del proyecto:";
    
    welcomeTitle.innerText = "";
    welcomeParagraph.innerText = ""; 
    
    setBotState('talking', avatarImg);

    const titleWords = titleText.split(" ");
    let titleIndex = 0;

    const titleInterval = setInterval(() => {
        if (titleIndex < titleWords.length) {
            welcomeTitle.innerText += (titleIndex === 0 ? "" : " ") + titleWords[titleIndex];
            titleIndex++;
        } else {
            clearInterval(titleInterval);
            animateParagraph();
        }
    }, 120);

    function animateParagraph() {
        const paragraphWords = paragraphText.split(" ");
        let paragraphIndex = 0;

        const paragraphInterval = setInterval(() => {
            if (paragraphIndex < paragraphWords.length) {
                welcomeParagraph.innerText += (paragraphIndex === 0 ? "" : " ") + paragraphWords[paragraphIndex];
                paragraphIndex++;
            } else {
                clearInterval(paragraphInterval);
                setBotState('idle', avatarImg);
                if (onComplete) onComplete();
            }
        }, 120);
    }
}

export function renderBotResponse(msgElement, fullText, avatarImg, chatBox, interactiveForm) {
    const words = fullText.split(" ");
    let index = 0;
    
    setBotState('talking', avatarImg, true);

    const typingInterval = setInterval(() => {
        if (index < words.length) {
            msgElement.innerText += (index === 0 ? "" : " ") + words[index];
            index++;
            chatBox.scrollTop = chatBox.scrollHeight;
        } else {
            clearInterval(typingInterval);
            // GARANTIZA LA CARA CIRCULAR DE REPOSO EN EL CHAT
            setBotState('idle', avatarImg, true);
            
            if (interactiveForm) {
                msgElement.appendChild(document.createElement('br'));
                msgElement.appendChild(interactiveForm);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    }, 120);
}

/* ==========================================================================
   FUNCIÓN DE VALIDACIÓN Y LIMPIEZA DE NOMBRES
   ========================================================================== */
export function validarEntradaNombre(texto) {
    if (!texto || !texto.trim()) {
        return { esValido: false, respuesta: "Por favor escribe tu nombre o el del proyecto para continuar." };
    }

    const minus = texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const palabras = minus.split(/\s+/);

    const saludos = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'hey', 'saludos', 'como estas'];
    const preguntas = ['quien eres', 'que haces', 'para que sirves', 'que es esto', 'como funciona', 'ayuda', 'help'];
    const basura = ['si', 'no', 'ok', 'vale', 'bien', 'gracias', 'test', 'prueba', '123', 'asd'];

    if (preguntas.some(p => minus.includes(p))) {
        return { esValido: false, respuesta: "¡Soy DYAbot! Por favor dime tu nombre o el del proyecto para poder guardar tus datos." };
    }

    if (saludos.some(s => minus.includes(s)) && palabras.length <= 3) {
        return { esValido: false, respuesta: "¡Hola! Por favor escribe tu nombre y apellido o el del proyecto para registrarlo:" };
    }

    if (texto.trim().length < 3 || basura.includes(minus)) {
        return { esValido: false, respuesta: "Por favor ingresa un nombre o título de proyecto válido." };
    }

    // Limpia conectores comunes
    let nombreLimpio = texto;
    const prefijos = [
        /^(me llamo|mi nombre es|soy|proyecto|el proyecto es|cliente)\s+/i,
        /^(ing\.|ingeniero|arqt\.|arq\.)\s+/i
    ];

    prefijos.forEach(regex => {
        nombreLimpio = nombreLimpio.replace(regex, '');
    });

    return {
        esValido: true,
        nombreLimpio: nombreLimpio.trim()
    };
}