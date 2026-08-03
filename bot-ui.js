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
    const paragraphText = "Para comenzar, escribe tu nombre y apellido o el nombre del cliente del proyecto:";
    
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
            setBotState('idle', avatarImg, true);
            
            if (interactiveForm) {
                msgElement.appendChild(document.createElement('br'));
                msgElement.appendChild(interactiveForm);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    }, 120);
}