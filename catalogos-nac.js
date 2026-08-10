// catalogos-nac.js - Catálogo de dispositivos de notificación comerciales

export const OPCIONES_DESPLEGABLES = {
    marcas: ["HONEYWELL", "SIMPLEX", "WHEELOCK"],
    tipos: ["ESTROBO", "SIRENA", "SIRENA CON ESTROBO"],
    montajes: [
        "PARED", 
        "TECHO", 
        "PARED / TECHO INTERIOR", 
        "PARED / TECHO EXTERIOR"
    ]
};

// Base de Datos de Dispositivos con consumos en mA
export const CATALOGO_MATRIZ_CONSUMOS = [
    // ==========================================
    // 1. HONEYWELL - PARED
    // ==========================================
    // Honeywell Pared Estrobo
    ...[15, 30, 75, 95, 110, 135, 185].map((cd, idx) => ({
        marca: "HONEYWELL", tipo: "ESTROBO", montaje: "PARED", candela: String(cd), patron: "N/A", volumen: "N/A",
        mA: [18, 22, 70, 75, 85, 105, 120][idx]
    })),
    // Honeywell Pared Estrobo con Sirena
    ...[
        { patron: "Temporal", volumen: "Alto", mA: [35, 38, 87, 92, 94, 189, 190] },
        { patron: "Temporal", volumen: "Bajo", mA: [35, 38, 87, 92, 94, 135, 145] },
        { patron: "No Temporal", volumen: "Alto", mA: [50, 52, 87, 92, 94, 127, 135] },
        { patron: "No Temporal", volumen: "Bajo", mA: [35, 38, 87, 92, 94, 125, 130] },
        { patron: "Temporal 3.1K", volumen: "Alto", mA: [35, 38, 87, 89, 91, 155, 165] },
        { patron: "Temporal 3.1K", volumen: "Bajo", mA: [35, 38, 87, 89, 91, 128, 135] },
        { patron: "No Temporal 3.1K", volumen: "Alto", mA: [40, 42, 87, 89, 91, 125, 135] },
        { patron: "No Temporal 3.1K", volumen: "Bajo", mA: [35, 38, 87, 89, 91, 120, 130] }
    ].flatMap(cfg => [15, 30, 75, 95, 110, 135, 185].map((cd, i) => ({
        marca: "HONEYWELL", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: String(cd), patron: cfg.patron, volumen: cfg.volumen, mA: cfg.mA[i]
    }))),
    // ==========================================
    // HONEYWELL - SIRENA INTERIOR Y EXTERIOR (ACTUALIZADO)
    // ==========================================
    // Interior
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "Temporal", volumen: "Alto", mA: 44 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "Temporal", volumen: "Bajo", mA: 32 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "No Temporal", volumen: "Alto", mA: 47 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "No Temporal", volumen: "Bajo", mA: 32 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "Temporal 3.1 kHz", volumen: "Alto", mA: 41 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "Temporal 3.1 kHz", volumen: "Bajo", mA: 32 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "No Temporal 3.1 kHz", volumen: "Alto", mA: 43 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "No Temporal 3.1 kHz", volumen: "Bajo", mA: 29 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "Codificado", volumen: "Alto", mA: 47 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO INTERIOR", candela: "N/A", patron: "Codificado 3.1 kHz", volumen: "Alto", mA: 43 },

    // Exterior
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO EXTERIOR", candela: "N/A", patron: "Temporal", volumen: "Alto", mA: 35 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO EXTERIOR", candela: "N/A", patron: "Temporal", volumen: "Bajo", mA: 35 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO EXTERIOR", candela: "N/A", patron: "No Temporal", volumen: "Alto", mA: 50 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO EXTERIOR", candela: "N/A", patron: "No Temporal", volumen: "Bajo", mA: 35 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO EXTERIOR", candela: "N/A", patron: "Temporal 3.1 kHz", volumen: "Alto", mA: 35 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO EXTERIOR", candela: "N/A", patron: "Temporal 3.1 kHz", volumen: "Bajo", mA: 35 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO EXTERIOR", candela: "N/A", patron: "No Temporal 3.1 kHz", volumen: "Alto", mA: 40 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "PARED / TECHO EXTERIOR", candela: "N/A", patron: "No Temporal 3.1 kHz", volumen: "Bajo", mA: 35 },

    // ==========================================
    // 2. HONEYWELL - TECHO
    // ==========================================
    // Honeywell Techo Estrobo
    ...[15, 30, 75, 95, 115, 150, 177].map((cd, idx) => ({
        marca: "HONEYWELL", tipo: "ESTROBO", montaje: "TECHO", candela: String(cd), patron: "N/A", volumen: "N/A",
        mA: [18, 22, 70, 75, 90, 110, 115][idx]
    })),
    // Honeywell Techo Estrobo con Sirena
    ...[
        { patron: "Temporal", volumen: "Alto", mA: [35, 38, 87, 92, 94, 189, 190] },
        { patron: "Temporal", volumen: "Bajo", mA: [35, 38, 87, 92, 94, 135, 145] },
        { patron: "No Temporal", volumen: "Alto", mA: [50, 52, 87, 92, 94, 127, 135] },
        { patron: "No Temporal", volumen: "Bajo", mA: [35, 38, 87, 92, 94, 125, 130] },
        { patron: "Temporal 3.1K", volumen: "Alto", mA: [35, 38, 87, 89, 91, 155, 165] },
        { patron: "Temporal 3.1K", volumen: "Bajo", mA: [35, 38, 87, 89, 91, 128, 135] },
        { patron: "No Temporal 3.1K", volumen: "Alto", mA: [40, 42, 87, 89, 91, 125, 135] },
        { patron: "No Temporal 3.1K", volumen: "Bajo", mA: [35, 38, 87, 89, 91, 120, 130] }
    ].flatMap(cfg => [15, 30, 75, 95, 110, 135, 185].map((cd, i) => ({
        marca: "HONEYWELL", tipo: "SIRENA CON ESTROBO", montaje: "TECHO", candela: String(cd), patron: cfg.patron, volumen: cfg.volumen, mA: cfg.mA[i]
    }))),
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "TECHO", candela: "N/A", patron: "Temporal", volumen: "Alto", mA: 44 },
    { marca: "HONEYWELL", tipo: "SIRENA", montaje: "TECHO", candela: "N/A", patron: "Temporal", volumen: "Bajo", mA: 32 },

    // ==========================================
    // 3. SIMPLEX
    // ==========================================
    // Simplex Estrobo con Sirena (Pared/Techo)
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "15", patron: "Estándar", volumen: "Estándar", mA: 51 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "30", patron: "Estándar", volumen: "Estándar", mA: 63 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "75", patron: "Estándar", volumen: "Estándar", mA: 81 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "110", patron: "Estándar", volumen: "Estándar", mA: 143 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "135", patron: "Estándar", volumen: "Estándar", mA: 143 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "185", patron: "Estándar", volumen: "Estándar", mA: 143 },
    
    // Simplex Estrobo
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED", candela: "15", patron: "N/A", volumen: "N/A", mA: 31 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED", candela: "30", patron: "N/A", volumen: "N/A", mA: 44 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED", candela: "75", patron: "N/A", volumen: "N/A", mA: 60 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED", candela: "110", patron: "N/A", volumen: "N/A", mA: 125 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED", candela: "135", patron: "N/A", volumen: "N/A", mA: 125 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED", candela: "185", patron: "N/A", volumen: "N/A", mA: 125 },

    // Simplex Solo Sirena
    { marca: "SIMPLEX", tipo: "SIRENA", montaje: "PARED", candela: "N/A", patron: "Estándar", volumen: "Estándar", mA: 27 },

    // ==========================================
    // 4. WHEELOCK (EXCEDER)
    // ==========================================
    // Wheelock Solo Sirena
    { marca: "WHEELOCK", tipo: "SIRENA", montaje: "PARED", candela: "N/A", patron: "Estándar", volumen: "90 dB", mA: 22 },
    { marca: "WHEELOCK", tipo: "SIRENA", montaje: "PARED", candela: "N/A", patron: "Estándar", volumen: "95 dB", mA: 30 },

    // Wheelock Estrobo
    { marca: "WHEELOCK", tipo: "ESTROBO", montaje: "PARED", candela: "15", patron: "N/A", volumen: "N/A", mA: 30 },
    { marca: "WHEELOCK", tipo: "ESTROBO", montaje: "PARED", candela: "30", patron: "N/A", volumen: "N/A", mA: 40 },
    { marca: "WHEELOCK", tipo: "ESTROBO", montaje: "PARED", candela: "75", patron: "N/A", volumen: "N/A", mA: 115 },
    { marca: "WHEELOCK", tipo: "ESTROBO", montaje: "PARED", candela: "110", patron: "N/A", volumen: "N/A", mA: 200 },

    // Wheelock Estrobo con Sirena
    { marca: "WHEELOCK", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "15", patron: "Estándar", volumen: "90 dB", mA: 38 },
    { marca: "WHEELOCK", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "30", patron: "Estándar", volumen: "90 dB", mA: 42 },
    { marca: "WHEELOCK", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "75", patron: "Estándar", volumen: "90 dB", mA: 122 },
    { marca: "WHEELOCK", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "110", patron: "Estándar", volumen: "90 dB", mA: 209 },
    { marca: "WHEELOCK", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "15", patron: "Estándar", volumen: "95 dB", mA: 40 },
    { marca: "WHEELOCK", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "30", patron: "Estándar", volumen: "95 dB", mA: 46 },
    { marca: "WHEELOCK", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "75", patron: "Estándar", volumen: "95 dB", mA: 125 },
    { marca: "WHEELOCK", tipo: "SIRENA CON ESTROBO", montaje: "PARED", candela: "110", patron: "Estándar", volumen: "95 dB", mA: 219 }
];

export function obtenerOpcionesFiltradas(marca, tipo, montaje, candela, patron) {
    let items = CATALOGO_MATRIZ_CONSUMOS;

    if (marca) {
        items = items.filter(x => String(x.marca).toUpperCase() === String(marca).toUpperCase());
    }

    if (tipo) {
        items = items.filter(x => String(x.tipo).toUpperCase() === String(tipo).toUpperCase());
    }

    const montajesDisponibles = [...new Set(items.map(x => String(x.montaje)))];

    if (montaje && montajesDisponibles.includes(String(montaje))) {
        items = items.filter(x => String(x.montaje) === String(montaje));
    }

    const candelas = [...new Set(items.map(x => String(x.candela)))];

    if (candela && candelas.includes(String(candela))) {
        items = items.filter(x => String(x.candela) === String(candela));
    }

    const patrones = [...new Set(items.map(x => String(x.patron)))];

    if (patron && patrones.includes(String(patron))) {
        items = items.filter(x => String(x.patron) === String(patron));
    }

    const volumenes = [...new Set(items.map(x => String(x.volumen)))];

    return { 
        montajes: montajesDisponibles, 
        candelas, 
        patrones, 
        volumenes 
    };
}

export function obtenerConsumoAmperios(marca, tipo, montaje, candela, patron, volumen) {
    const m = String(marca || "").toUpperCase();
    const t = String(tipo || "").toUpperCase();
    const mo = String(montaje || "").toUpperCase();
    const cd = String(candela || "");
    const pt = String(patron || "");
    const vl = String(volumen || "");

    const dev = CATALOGO_MATRIZ_CONSUMOS.find(x => 
        String(x.marca).toUpperCase() === m && 
        String(x.tipo).toUpperCase() === t && 
        String(x.montaje).toUpperCase() === mo && 
        String(x.candela) === cd && 
        String(x.patron) === pt && 
        String(x.volumen) === vl
    );

    if (dev && typeof dev.mA === 'number') {
        return dev.mA / 1000;
    }

    const devParcial = CATALOGO_MATRIZ_CONSUMOS.find(x => 
        String(x.marca).toUpperCase() === m && 
        String(x.tipo).toUpperCase() === t && 
        String(x.montaje).toUpperCase() === mo && 
        String(x.candela) === cd
    );

    if (devParcial && typeof devParcial.mA === 'number') {
        return devParcial.mA / 1000;
    }

    return 0.000;
}