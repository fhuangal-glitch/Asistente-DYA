export const ARBOL_DISPOSITIVOS = {
    "alarma": {
        "Estaciones Manuales": {
            "De Alarma": {
                "Estándar": { "Direccionable": true, "Convencional": true },
                "Weather Proof": { "Direccionable": true, "Convencional": true },
                "Explosion Proof": { "Direccionable": true, "Convencional": true }
            },
            "De Descarga": {
                "Estándar": { "Direccionable": true, "Convencional": true },
                "Explosion Proof": { "Direccionable": true, "Convencional": true }
            }
        },
        "Detectores de Humo": {
            "Puntual": {
                "Estándar": { "Direccionable": true, "Convencional": true },
                "Explosion Proof": { "Direccionable": true, "Convencional": true }
            },
            "Por Aspiración": {
                "Relé de alarma": true
            },
            "En Ducto": {
                "Estándar": { "Direccionable": true, "Convencional": true }
            },
            "De Haz Proyectado": {
                "Relé de alarma": true
            }
        },
        "Detectores multicriterio": {
            "Puntual": {
                "Estándar": { "Direccionable": true, "Convencional": true }
            }
        },
        "Detectores de Temperatura": {
            "Puntual": {
                "Estándar": { "Direccionable": true, "Convencional": true }
            },
            "Lineal": {
                "Cobre": { "Relé de alarma": true },
                "Fibra": { "Relé de alarma": true }
            }
        },
        "Detectores de Flama": {
            "Puntual": {
                "Relé de alarma": true
            }
        },
        "Detectores de Gas": {
            "Hidrógeno": {
                "Estándar": { "Direccionable": true, "Convencional": true }
            },
            "Dióxido de Carbono": {
                "Estándar": { "Direccionable": true, "Convencional": true }
            },
            "Gas Licuado de Petróleo": {
                "Estándar": { "Direccionable": true, "Convencional": true }
            }
        }
    },
    
    "supervision": {
         "Detectores de Humo": {
            "Por Aspiración": {
                "Relé de acción": true,
                "Relé programable": true
            }
        },
        "Detectores de Temperatura": {
            "Lineal": {
                "Cobre": { "Relé de supervisión": true },
                "Fibra": { "Relé de supervisión": true }
            }
        },
        "Sistema de Extinción de Incendios": {
            "Interruptor de Detector del Flujo": true,
            "Interruptor de Tamper Switch de Válvula": true,
            "Interruptor de Presión de Descarga": true,
            "De Presión de Agua": true
        },
        "Sistema de Agente Limpio": {
            "Presión de Descarga": true,
            "Baja Presión de Cilindro": true
        },
        "Monitoreo de Equipos Críticos": {
            "Tablero Bomba Diésel": true,
            "Tablero Bomba Eléctrica": true
        }
    },
    
    "falla_sistema": {
        "Fallas de Potencia en Fuentes NAC": {
            "Suministro Primario": true,
            "Suministro Secundario": true
        },
        "Fallas de Potencia en FACU": {
            "Suministro Primario": true,
            "Suministro Secundario": true
        },
        "Fallas de Línea / Circuitos": {
            "Integridad de Lazos": {
                "Circuito abierto": true,
                "Falla a tierra": true
            },
            "Integridad de Notificación": {
                "Cortocircuito": true
            }
        },
        "Detectores de Temperatura": {
            "Lineal": {
                "Cobre": { "Relé de Falla": true, "Relé de Corto": true },
                "Fibra": { "Relé de Falla": true, "Relé de Corto": true }
            }
        },
        "Detectores de Humo": {
            "Por Aspiración": {
                "Relé de falla": true
            },
            "De Haz Proyectado": {
                "Relé de falla": true
            }
        },
        "Detectores de Flama": {
            "Puntual": {
                "Relé de falla": true
            }
        },
    },

    "notificacion": {
        "Cornetas": { "Estándar": true, "Weather Proof": true, "Explosion Proof": true },
        "Cornetas con luces estroboscopica": { "Estándar": true, "Weather Proof": true, "Explosion Proof": true },
        "Parlantes de evacuación": { "Estándar": true, "Weather Proof": true, "Explosion Proof": true },
        "Parlantes de evacuación con luz estrobocópica": { "Estándar": true, "Weather Proof": true, "Explosion Proof": true },
        "Campanas": { "Estándar": true, "Weather Proof": true, "Explosion Proof": true },
        "Campanas con luces estroboscópica": { "Estándar": true, "Weather Proof": true, "Explosion Proof": true },
                "Luces estroboscópicas": { "Estándar": true, "Weather Proof": true, "Explosion Proof": true }
    },

    "enclavamiento": {
        "Módulo de contorl para apagado de equipo aire acondicionado": true,
        "Módulo de control para encendido de equipo de presurización de escaleras": true,
        "Módulo de control para el encendido de equipo de inyección de aire fresco": true,
        "Módulo de control para llamada de ascensores": true,
        "Módulo de control para desactivación de puertas de control de accesos de rutas de evacuación": true
    }
};

export const LISTA_SALIDAS_EXCEL = [
    { letra: "A", grupo: "Anunciación", nombre: "Activar indicador común de la señal de alarma" },
    { letra: "B", grupo: "Anunciación", nombre: "Activar señal de alarma audible" },
    { letra: "C", grupo: "Anunciación", nombre: "Activar indicador común de la señal de supervisión" },
    { letra: "D", grupo: "Anunciación", nombre: "Activar señal de supervisión audible" },
    { letra: "E", grupo: "Anunciación", nombre: "Activar indicador común de la señal de falla" },
    { letra: "F", grupo: "Anunciación", nombre: "Activar señal de falla audible" }
];