// n_proy_bateria.js

export const flujoBateria = {
    paso: "INICIO",

    iniciar: function() {
        this.paso = "PREGUNTA_CORRIENTE";
        return {
            texto: "Módulo de Baterías activo. Ingresa la corriente en reposo (Standby) en Amperios (A):"
        };
    },

    procesarRespuesta: async function(texto) {
        // Aquí conectas con tu módulo de baterías actual
        const { iniciarModuloBaterias } = await import('./modulo-baterias.js');
        const instancia = iniciarModuloBaterias();
        return instancia.procesarRespuesta(texto);
    }
};