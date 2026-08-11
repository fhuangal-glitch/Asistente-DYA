export const flujoVoltaje = {
    paso: "INICIO",
    estado: {
        metodo: "peor_caso", // "peor_caso" (End Point) o "segmentado" (Point to Point)
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
        
        // Cargar y abrir el modal directamente
        const { moduloVoltaje } = await import('./modulo-voltaje.js');
        setTimeout(() => {
            moduloVoltaje.abrirModalVoltaje(this.estado, (datosForm) => {
                if (typeof moduloVoltaje.procesarDatosModal === 'function') {
                    moduloVoltaje.procesarDatosModal(datosForm);
                }
            });
        }, 100);

        return {
            texto: "Abriendo el Panel de Cálculo de Caída de Voltaje NAC...",
            moduloCompletado: true
        };
    },

    procesarRespuesta: async function(texto) {
        // En caso de que se invoque dinámicamente, abre el modal de inmediato
        return this.iniciar();
    }
};