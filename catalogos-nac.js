export const OPCIONES_DESPLEGABLES = {
    marcas: ["HONEYWELL", "SIMPLEX", "EXCEDER", "WHEELOCK"],
    tipos: ["ESTROBO", "SIRENA", "SIRENA CON ESTROBO"],
    montajes: [
        "PARED", 
        "TECHO", 
        "PARED / TECHO INTERIOR", 
        "PARED / TECHO EXTERIOR",
        "PARED / TECHO"
    ]
};

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
    // HONEYWELL - SIRENA INTERIOR Y EXTERIOR 
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
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "15", patron: "Estándar", volumen: "Estándar", mA: 51 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "30", patron: "Estándar", volumen: "Estándar", mA: 63 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "75", patron: "Estándar", volumen: "Estándar", mA: 81 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "110", patron: "Estándar", volumen: "Estándar", mA: 143 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "135", patron: "Estándar", volumen: "Estándar", mA: 143 },
    { marca: "SIMPLEX", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "185", patron: "Estándar", volumen: "Estándar", mA: 143 },
    
    // Simplex Estrobo
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "15", patron: "N/A", volumen: "N/A", mA: 31 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "30", patron: "N/A", volumen: "N/A", mA: 44 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "75", patron: "N/A", volumen: "N/A", mA: 60 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "110", patron: "N/A", volumen: "N/A", mA: 125 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "135", patron: "N/A", volumen: "N/A", mA: 125 },
    { marca: "SIMPLEX", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "185", patron: "N/A", volumen: "N/A", mA: 125 },

    // Simplex Solo Sirena
    { marca: "SIMPLEX", tipo: "SIRENA", montaje: "PARED / TECHO", candela: "N/A", patron: "Estándar", volumen: "Estándar", mA: 27 },

    // ==========================================
    // 4. EXCEDER
    // ==========================================

    // Solo Sirena
    { marca: "EXCEDER", tipo: "SIRENA", montaje: "PARED / TECHO", candela: "N/A", patron: "Estándar", volumen: "90 dB", mA: 22 },
    { marca: "EXCEDER", tipo: "SIRENA", montaje: "PARED / TECHO", candela: "N/A", patron: "Estándar", volumen: "95 dB", mA: 44 },
    { marca: "EXCEDER", tipo: "SIRENA", montaje: "PARED / TECHO", candela: "N/A", patron: "Estándar", volumen: "99 dB", mA: 84 },

    // Estrobo
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "15", patron: "N/A", volumen: "N/A", mA: 61 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "30", patron: "N/A", volumen: "N/A", mA: 85 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "60", patron: "N/A", volumen: "N/A", mA: 103 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "75", patron: "N/A", volumen: "N/A", mA: 135 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "95", patron: "N/A", volumen: "N/A", mA: 163 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "110", patron: "N/A", volumen: "N/A", mA: 182 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "115", patron: "N/A", volumen: "N/A", mA: 182 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "135", patron: "N/A", volumen: "N/A", mA: 205 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "150", patron: "N/A", volumen: "N/A", mA: 205 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "177", patron: "N/A", volumen: "N/A", mA: 253 },
    { marca: "EXCEDER", tipo: "ESTROBO", montaje: "PARED / TECHO", candela: "185", patron: "N/A", volumen: "N/A", mA: 253 },

    // Sirena con estrobo
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "15", patron: "Estándar", volumen: "90 dB", mA: 65 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "30", patron: "Estándar", volumen: "90 dB", mA: 84 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "60", patron: "Estándar", volumen: "90 dB", mA: 120 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "75", patron: "Estándar", volumen: "90 dB", mA: 136 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "95", patron: "Estándar", volumen: "90 dB", mA: 157 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "110", patron: "Estándar", volumen: "90 dB", mA: 184 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "115", patron: "Estándar", volumen: "90 dB", mA: 184 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "135", patron: "Estándar", volumen: "90 dB", mA: 226 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "150", patron: "Estándar", volumen: "90 dB", mA: 226 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "177", patron: "Estándar", volumen: "90 dB", mA: 267 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "185", patron: "Estándar", volumen: "90 dB", mA: 267 },

    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "15", patron: "Estándar", volumen: "95 dB", mA: 73 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "30", patron: "Estándar", volumen: "95 dB", mA: 87 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "60", patron: "Estándar", volumen: "95 dB", mA: 128 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "75", patron: "Estándar", volumen: "95 dB", mA: 139 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "95", patron: "Estándar", volumen: "95 dB", mA: 163 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "110", patron: "Estándar", volumen: "95 dB", mA: 186 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "115", patron: "Estándar", volumen: "95 dB", mA: 186 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "135", patron: "Estándar", volumen: "95 dB", mA: 230 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "150", patron: "Estándar", volumen: "95 dB", mA: 230 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "177", patron: "Estándar", volumen: "95 dB", mA: 272 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "185", patron: "Estándar", volumen: "95 dB", mA: 282 },

    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "15", patron: "Estándar", volumen: "99 dB", mA: 82 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "30", patron: "Estándar", volumen: "99 dB", mA: 102 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "60", patron: "Estándar", volumen: "99 dB", mA: 141 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "75", patron: "Estándar", volumen: "99 dB", mA: 148 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "95", patron: "Estándar", volumen: "99 dB", mA: 176 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "110", patron: "Estándar", volumen: "99 dB", mA: 197 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "115", patron: "Estándar", volumen: "99 dB", mA: 197 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "135", patron: "Estándar", volumen: "99 dB", mA: 242 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "150", patron: "Estándar", volumen: "99 dB", mA: 242 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "177", patron: "Estándar", volumen: "99 dB", mA: 282 },
    { marca: "EXCEDER", tipo: "SIRENA CON ESTROBO", montaje: "PARED / TECHO", candela: "185", patron: "Estándar", volumen: "99 dB", mA: 282 },

    // ==========================================
    // 4. WHEELOCK
    // ==========================================

    // BELL STROBE
    { marca: "WHEELOCK", tipo: "CAMPANA CON ESTROBO", montaje: "PARED / TECHO", candela: "15", patron: "Estándar", volumen: "N/A", mA: 100 },
    { marca: "WHEELOCK", tipo: "CAMPANA CON ESTROBO", montaje: "PARED / TECHO", candela: "30", patron: "Estándar", volumen: "N/A", mA: 132 },
    { marca: "WHEELOCK", tipo: "CAMPANA CON ESTROBO", montaje: "PARED / TECHO", candela: "75", patron: "Estándar", volumen: "N/A", mA: 205 },
    { marca: "WHEELOCK", tipo: "CAMPANA CON ESTROBO", montaje: "PARED / TECHO", candela: "110", patron: "Estándar", volumen: "N/A", mA: 260 },
   

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