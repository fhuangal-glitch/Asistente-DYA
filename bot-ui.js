let mouthInterval = null;

// Setea los estados de las imágenes del bot y controla el parpadeo/movimiento de la boca
// 💡 Añadimos un nuevo parámetro: "isChat" (true o false)
export function setBotState(state, targetImg, isChat = false) {
    if (mouthInterval) {
        clearInterval(mouthInterval);
        mouthInterval = null;
    }

    if (state === 'idle') {
        // Si está en el chat usa el original de chat, si no, el normal
        targetImg.src = isChat ? 'bot-open-original-chat.png' : 'bot-original.png';
    } else if (state === 'thinking') {
        // Si está en el chat usa el thinking de chat, si no, el normal
        targetImg.src = isChat ? 'bot-thinking-chat.png' : 'bot-thinking.png';
    } else if (state === 'talking') {
        let toggle = true;
        mouthInterval = setInterval(() => {
            if (isChat) {
                // Secuencia de boca para el chat
                targetImg.src = toggle ? 'bot-open-A-chat.png' : 'bot-open-B-chat.png';
            } else {
                // Secuencia de boca para la bienvenida
                targetImg.src = toggle ? 'bot-open-A.png' : 'bot-open-B.png';
            }
            toggle = !toggle;
        }, 220); 
    }
}

// Función predeterminada para el efecto máquina de escribir en la bienvenida
export function typeWelcomeMessage(avatarImg, onComplete) {
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeParagraph = document.getElementById('welcome-p');
    
    const titleText = "Hola, soy DYAbot tu asistente.";
    const paragraphText = "¿En qué puedo ayudarte hoy? Puedes escribir o hablar.";
    
    welcomeTitle.innerText = "";
    welcomeParagraph.innerText = ""; 
    
    // 🏠 Bienvenida: No pasamos "true", por lo que usa las imágenes normales por defecto
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
    }, 200);

    function animateParagraph() {
        const paragraphWords = paragraphText.split(" ");
        let paragraphIndex = 0;

        const paragraphInterval = setInterval(() => {
            if (paragraphIndex < paragraphWords.length) {
                welcomeParagraph.innerText += (paragraphIndex === 0 ? "" : " ") + paragraphWords[paragraphIndex];
                paragraphIndex++;
            } else {
                clearInterval(paragraphInterval);
                // 🏠 Bienvenida: Usa imágenes normales
                setBotState('idle', avatarImg);
                if (onComplete) onComplete();
            }
        }, 200);
    }
}

// Renderizador de respuestas del Chat
export function renderBotResponse(msgElement, fullText, avatarImg, chatBox, interactiveForm) {
    const words = fullText.split(" ");
    let index = 0;
    
    // 💬 Chat: Pasamos "true" al final para forzar el uso de las imágenes del chat (-chat.png)
    setBotState('talking', avatarImg, true);

    const typingInterval = setInterval(() => {
        if (index < words.length) {
            msgElement.innerText += (index === 0 ? "" : " ") + words[index];
            index++;
            chatBox.scrollTop = chatBox.scrollHeight;
        } else {
            clearInterval(typingInterval);
            // 💬 Chat: Pasamos "true" al finalizar para que use 'bot-open-original-chat.png'
            setBotState('idle', avatarImg, true);
            
            if (interactiveForm) {
                msgElement.appendChild(document.createElement('br'));
                msgElement.appendChild(interactiveForm);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    }, 200);
}