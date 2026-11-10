// --- CONFIGURACIÓN GLOBAL COMPARTIDA ---
// Se separa de main.ts para que las escenas en otros módulos (versus.ts)
// usen exactamente la misma paleta y estado sin importaciones circulares.

export const COLORS = {
    bg: '#86efac',     // Pasto verde claro
    road: 0x94a3b8,    // Carretera
    line: 0xffffff,    // Líneas blancas
    text: '#1e293b',   // Texto oscuro
    panel: 0xffffff    // Paneles UI
};

// Colores de identificación de cada jugador (tomados de la paleta existente)
export const PLAYER_COLORS = {
    1: { hex: 0xef4444, css: '#ef4444' }, // Rojo (botón JUGAR)
    2: { hex: 0x3b82f6, css: '#3b82f6' }  // Azul (título / botones)
} as const;

export const GameState = {
    difficulty: 'Fácil',
    score: 0,
    level: 1,
    targetScore: 5, // Puntos para pasar al siguiente nivel
    players: 1 as 1 | 2,
    versusWins: [0, 0] // Niveles ganados por J1 y J2 en modo 2 jugadores
};
