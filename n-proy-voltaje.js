export const flujoVoltaje = {
    paso: "INICIO",
    estado: {
        metodo: "peor_caso",
        clase: "B",
        calibreAWG: "14 Solid",
        voltajeFuente: 24,
        distanciaTotal: 0,
        corrienteTotal: 0,
        numDispositivos: 0,
        fuentes: []
    },

    iniciar: async function() {
        this.paso = "FINALIZADO";

        const { moduloVoltaje } = await import('./modulo-voltaje.js');
        setTimeout(() => {
            moduloVoltaje.abrirModalVoltaje(this.estado, (datosForm) => {
                if (typeof moduloVoltaje.procesarDatosModal === 'function') {
                    moduloVoltaje.procesarDatosModal(datosForm);
                }
            });
        }, 100);

        return {
            texto: "Abriendo el Panel de Cálculo de Caída de Voltaje ..",
            moduloCompletado: true
        };
    },

    procesarRespuesta: async function(texto) {
        return this.iniciar();
    }
};