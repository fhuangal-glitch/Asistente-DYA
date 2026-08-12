export const flujoMatriz = {
    paso: "INICIO",
    totalFacus: 1,
    totalZonas: 1,

    iniciar: function() {
        this.paso = "PREGUNTA_FACUS";
        this.totalFacus = 1;
        this.totalZonas = 1;

        return {
            texto: "¡Excelente! Configuremos la infraestructura base.\n\n ¿Cuántos FACUs (Paneles de Control) tiene tu proyecto?"
        };
    },

    procesarRespuesta: async function(texto, contextoChat) {
        const { msgDiv, miniAvatar, chatBox, setBotState } = contextoChat;
        const numeroDetectado = texto.match(/\d+/);
        const valorNumerico = numeroDetectado ? parseInt(numeroDetectado[0], 10) : null;

        if (this.paso === "PREGUNTA_FACUS") {
            if (valorNumerico === null || valorNumerico <= 0) {
                return { texto: "Por favor, ingresa una cantidad numérica válida de FACUs (ej. 1, 2, 3...)." };
            }

            this.totalFacus = valorNumerico;
            this.paso = "PREGUNTA_ZONAS";
            return {
                texto: `Entendido, se configurarán ${this.totalFacus} FACU(s).\n\n¿Cuántas Zonas de Alarma totales tiene todo el sistema?`
            };
        }

        if (this.paso === "PREGUNTA_ZONAS") {
            if (valorNumerico === null || valorNumerico <= 0) {
                return { texto: "Por favor, ingresa una cantidad numérica válida de Zonas de Alarma." };
            }

            this.totalZonas = valorNumerico;
            this.paso = "FINALIZADO";

            setTimeout(async () => {
                const { iniciarModuloMatriz } = await import('./modulo-matriz.js');
                
                iniciarModuloMatriz(
                    msgDiv, 
                    miniAvatar, 
                    chatBox, 
                    this.totalZonas, 
                    this.totalFacus, 
                    () => {
                        window.dispatchEvent(new CustomEvent('regresoAlChatEvent'));
                    }
                );

                if (typeof setBotState === 'function') {
                    setBotState('idle', miniAvatar, true);
                }
            }, 2500);

            return {
                texto: `Configuración completada (${this.totalFacus} FACUs, ${this.totalZonas} Zonas).\nCargando matriz interactiva...`,
                moduloCompletado: true
            };
        }
    }
};