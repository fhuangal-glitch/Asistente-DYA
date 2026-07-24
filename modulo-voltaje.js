
export function iniciarModuloVoltaje() {
    return {
        step: 1,
        data: {},
        procesarRespuesta: function(text) {
            let val = parseFloat(text) || 0;
            if (this.step === 1) {
                this.data.voltajeNominal = val || 24;
                this.step = 2;
                return "Ingresa la corriente total del circuito NAC en Amperios (A):";
            } else if (this.step === 2) {
                this.data.corrienteNac = val || 1.5;
                this.step = 3;
                return "Ingresa la longitud del tramo de cableado en metros (m):";
            } else if (this.step === 3) {
                let longitud = val || 100;
                // Resistencia promedio cable calibre 14 AWG de dos hilos (0.00307 ohm por metro aprox)
                let caidaV = 2 * longitud * 0.00307 * this.data.corrienteNac;
                let vFinal = this.data.voltajeNominal - caidaV;
                this.step = 0; // Finalizado
                let alerta = vFinal < 20.4 ? "⚠️ Caída excesiva. El voltaje es menor al umbral operativo (20.4V)." : "✅ Nivel seguro operativo.";
                return `⚡ **CÁLCULO DE CAÍDA DE VOLTAJE:**\nVoltaje perdido en tramo: ${caidaV.toFixed(2)} V.\n**Voltaje disponible al final de la línea: ${vFinal.toFixed(2)} V.**\n${alerta}\n\n¿Deseas iniciar otra tarea?`;
            }
        }
    };
}