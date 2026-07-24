export function iniciarModuloBaterias() {
    return {
        step: 1,
        data: {},
        procesarRespuesta: function(text) {
            let val = parseFloat(text) || 0;
            if (this.step === 1) {
                this.data.currentStandby = val || 0.5;
                this.step = 2;
                return "Ingresa el tiempo de respaldo en reposo requerido (Ej: 24 horas):";
            } else if (this.step === 2) {
                this.data.timeStandby = val || 24;
                this.step = 3;
                return "Ingresa la corriente en estado de Alarma en Amperios (A):";
            } else if (this.step === 3) {
                this.data.currentAlarm = val || 2.0;
                this.step = 4;
                return "Ingresa el tiempo de alarma requerido en minutos (Ej: 5 o 15):";
            } else if (this.step === 4) {
                let alarmHours = (val || 5) / 60;
                let capTotal = (this.data.currentStandby * this.data.timeStandby) + (this.data.currentAlarm * alarmHours);
                let capSugerida = (capTotal * 1.25).toFixed(2);
                this.step = 0; // Finalizado
                return `📊 **CÁLCULO DE BATERÍAS:**\nCapacidad total calculada: ${(capTotal).toFixed(2)} Ah.\n**Capacidad sugerida con factor de seguridad (+25%): ${capSugerida} Ah.**\n\n¿Deseas iniciar otra tarea?`;
            }
        }
    };
}