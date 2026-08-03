export const flujoVoltaje = {
    paso: "INICIO",
    estado: {
        metodo: "",
        clase: "",
        calibreAWG: "14",
        voltajeFuente: 20.4,
        distanciaTotal: 0,
        corrienteTotal: 0,
        numDispositivos: 0
    },

    iniciar: function() {
        this.paso = "METODO";
        this.estado = {
            metodo: "", clase: "", calibreAWG: "14", 
            voltajeFuente: 20.4, distanciaTotal: 0, corrienteTotal: 0, numDispositivos: 0
        };

        return {
            texto: "Módulo de Caída de Voltaje. ¿Qué método de cálculo deseas utilizar?",
            opciones: [
                { texto: "Método Peor Caso", subtexto: "Suma la corriente al final del cable (más conservador)", valor: "Método Peor Caso" },
                { texto: "Método Segmentado", subtexto: "Calcula la caída punto a punto en cada dispositivo (más exacto)", valor: "Método Segmentado" }
            ]
        };
    },

    procesarRespuesta: async function(texto) {
        const cleanText = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        if (this.paso === "METODO") {
            if (cleanText.includes("peor") || cleanText.includes("1")) {
                this.estado.metodo = "peor_caso";
            } else if (cleanText.includes("seg") || cleanText.includes("punto") || cleanText.includes("2")) {
                this.estado.metodo = "segmentado";
            } else {
                return {
                    texto: "Por favor selecciona un método válido usando los botones.",
                    opciones: [
                        { texto: "Método Peor Caso", subtexto: "Suma la corriente al final del cable", valor: "Método Peor Caso" },
                        { texto: "Método Segmentado", subtexto: "Calcula punto a punto", valor: "Método Segmentado" }
                    ]
                };
            }

            this.paso = "CLASE";
            return {
                texto: "Entendido. ¿Qué clase de circuito NAC vas a utilizar?",
                opciones: [
                    { texto: "Clase B", subtexto: "Línea simple con RFL al final", valor: "Clase B" },
                    { texto: "Clase A", subtexto: "Circuito en bucle/loop de regreso al panel", valor: "Clase A" }
                ]
            };
        }

        if (this.paso === "CLASE") {
            const tieneA = /\ba\b/i.test(cleanText) || cleanText === "clase a";
            const tieneB = /\bb\b/i.test(cleanText) || cleanText === "clase b";

            if (tieneB) this.estado.clase = "B";
            else if (tieneA) this.estado.clase = "A";
            else {
                return {
                    texto: "Por favor selecciona Clase A o Clase B usando los botones.",
                    opciones: [
                        { texto: "Clase B", subtexto: "Línea simple con RFL", valor: "Clase B" },
                        { texto: "Clase A", subtexto: "Circuito en bucle/loop", valor: "Clase A" }
                    ]
                };
            }

            this.paso = "CALIBRE";
            return {
                texto: `Configurado para Clase ${this.estado.clase}.\n\n¿Qué calibre de cable AWG usarás?`,
                opciones: [
                    { texto: "AWG 18", subtexto: "Resistencia aprox: 0.021 Ω/m", valor: "AWG 18" },
                    { texto: "AWG 16", subtexto: "Resistencia aprox: 0.013 Ω/m", valor: "AWG 16" },
                    { texto: "AWG 14", subtexto: "Resistencia aprox: 0.008 Ω/m", valor: "AWG 14" },
                    { texto: "AWG 12", subtexto: "Resistencia aprox: 0.005 Ω/m", valor: "AWG 12" }
                ]
            };
        }

        if (this.paso === "CALIBRE") {
            if (cleanText.includes("18")) this.estado.calibreAWG = "18";
            else if (cleanText.includes("16")) this.estado.calibreAWG = "16";
            else if (cleanText.includes("14")) this.estado.calibreAWG = "14";
            else if (cleanText.includes("12")) this.estado.calibreAWG = "12";
            else {
                return { texto: "Selecciona un calibre usando los botones." };
            }

            this.paso = "FINALIZADO";

            // Importar y abrir la modal pasando el estado actualizado
            const { moduloVoltaje } = await import('./modulo-voltaje.js');
            setTimeout(() => {
                moduloVoltaje.abrirModalVoltaje(this.estado, (datosForm) => {
                    if (typeof moduloVoltaje.procesarDatosModal === 'function') {
                        moduloVoltaje.procesarDatosModal(datosForm);
                    }
                });
            }, 200);

            return {
                texto: `Calibre AWG ${this.estado.calibreAWG} seleccionado. Abriendo panel de configuración de parámetros y dispositivos...`,
                moduloCompletado: true
            };
        }
    }
};