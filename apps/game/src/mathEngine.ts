// --- MOTOR DE OPERACIONES MATEMÁTICAS ---
// Módulo puro (sin Phaser): genera preguntas de suma, resta, multiplicación
// y división según un "tier" de dificultad, más opciones de respuesta.
//
// Garantías:
//  - Las restas nunca dan resultados negativos.
//  - Las divisiones siempre son exactas (se construyen como divisor × cociente).
//  - Las opciones incorrectas nunca son negativas ni repetidas.

export interface MathQuestion {
    text: string;   // Ej: "12 ÷ 3"
    answer: number; // Ej: 4
}

type Range = [number, number];
type Kind = 'add' | 'sub' | 'mul' | 'div' | 'combo';

interface TierConfig {
    add: Range;       // Rango de cada sumando
    sub: Range;       // Rango del minuendo (el sustraendo es <= minuendo)
    mulA: Range;      // Tabla (primer factor)
    mulB: Range;      // Segundo factor
    divisor: Range;   // Divisor
    quotient: Range;  // Cociente (resultado entero)
    weights: Record<Kind, number>; // Probabilidad relativa de cada tipo
}

// Tier 1-2 = niveles iniciales; 3-4 = intermedios; 5-6 = avanzados.
const TIERS: TierConfig[] = [
    // Tier 1: sumas/restas hasta 10, tablas del 1 al 3, divisiones muy simples
    { add: [1, 9], sub: [2, 10], mulA: [1, 3], mulB: [1, 5], divisor: [2, 3], quotient: [1, 5],
      weights: { add: 3, sub: 3, mul: 2, div: 2, combo: 0 } },
    // Tier 2: sumas/restas hasta 20, tablas del 2 al 5
    { add: [1, 15], sub: [5, 20], mulA: [2, 5], mulB: [1, 10], divisor: [2, 5], quotient: [1, 10],
      weights: { add: 3, sub: 3, mul: 2, div: 2, combo: 0 } },
    // Tier 3: números de dos cifras, tablas hasta el 7
    { add: [5, 40], sub: [10, 50], mulA: [2, 7], mulB: [2, 10], divisor: [2, 6], quotient: [2, 10],
      weights: { add: 2, sub: 2, mul: 3, div: 3, combo: 0 } },
    // Tier 4: hasta 99, todas las tablas del 2 al 10, aparecen combinaciones
    { add: [10, 99], sub: [20, 99], mulA: [2, 10], mulB: [2, 10], divisor: [2, 10], quotient: [2, 10],
      weights: { add: 2, sub: 2, mul: 3, div: 3, combo: 1 } },
    // Tier 5: centenas, tablas hasta el 12
    { add: [20, 199], sub: [50, 199], mulA: [3, 12], mulB: [2, 12], divisor: [2, 12], quotient: [2, 12],
      weights: { add: 2, sub: 2, mul: 3, div: 3, combo: 2 } },
    // Tier 6+: máximo reto
    { add: [50, 499], sub: [100, 499], mulA: [4, 15], mulB: [3, 12], divisor: [3, 12], quotient: [3, 15],
      weights: { add: 1, sub: 1, mul: 2, div: 2, combo: 3 } }
];

// La dificultad elegida en el menú define el punto de partida;
// cada nivel superado sube un tier.
const DIFFICULTY_OFFSET: Record<string, number> = { 'Fácil': 0, 'Medio': 2, 'Difícil': 3 };

export function getTier(difficulty: string, level: number): number {
    const offset = DIFFICULTY_OFFSET[difficulty] ?? 0;
    return Math.min(TIERS.length, Math.max(1, level + offset));
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randIn = ([min, max]: Range) => rand(min, max);

function pickKind(weights: Record<Kind, number>): Kind {
    const entries = Object.entries(weights) as [Kind, number][];
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = Math.random() * total;
    for (const [kind, w] of entries) {
        roll -= w;
        if (roll < 0) return kind;
    }
    return 'add';
}

function makeAdd(c: TierConfig): MathQuestion {
    const a = randIn(c.add), b = randIn(c.add);
    return { text: `${a} + ${b}`, answer: a + b };
}

function makeSub(c: TierConfig): MathQuestion {
    const a = randIn(c.sub);
    const b = rand(1, a); // Nunca negativo
    return { text: `${a} - ${b}`, answer: a - b };
}

function makeMul(c: TierConfig): MathQuestion {
    const a = randIn(c.mulA), b = randIn(c.mulB);
    return Math.random() < 0.5
        ? { text: `${a} × ${b}`, answer: a * b }
        : { text: `${b} × ${a}`, answer: a * b };
}

function makeDiv(c: TierConfig): MathQuestion {
    // Se construye al revés para garantizar división exacta
    const divisor = randIn(c.divisor), quotient = randIn(c.quotient);
    return { text: `${divisor * quotient} ÷ ${divisor}`, answer: quotient };
}

function makeCombo(c: TierConfig): MathQuestion {
    // Operaciones combinadas con paréntesis para que el orden sea obvio
    const small: Range = [2, Math.min(20, c.add[1])];
    switch (rand(0, 3)) {
        case 0: { // (a × b) + c
            const a = randIn(c.mulA), b = randIn(c.mulB), k = randIn(small);
            return { text: `(${a} × ${b}) + ${k}`, answer: a * b + k };
        }
        case 1: { // (a × b) - c, sin negativos
            const a = randIn(c.mulA), b = randIn(c.mulB);
            const k = rand(1, Math.min(a * b, small[1]));
            return { text: `(${a} × ${b}) - ${k}`, answer: a * b - k };
        }
        case 2: { // (a ÷ b) + c, división exacta
            const d = randIn(c.divisor), q = randIn(c.quotient), k = randIn(small);
            return { text: `(${d * q} ÷ ${d}) + ${k}`, answer: q + k };
        }
        default: { // a + b - c, sin negativos
            const a = randIn(small), b = randIn(small);
            const k = rand(1, a + b);
            return { text: `${a} + ${b} - ${k}`, answer: a + b - k };
        }
    }
}

const BUILDERS: Record<Kind, (c: TierConfig) => MathQuestion> = {
    add: makeAdd, sub: makeSub, mul: makeMul, div: makeDiv, combo: makeCombo
};

/**
 * Genera una pregunta para el tier indicado.
 * @param avoidText Texto de la pregunta anterior para no repetirla seguida.
 */
export function generateQuestion(tier: number, avoidText?: string): MathQuestion {
    const config = TIERS[Math.min(TIERS.length, Math.max(1, tier)) - 1];
    let q = BUILDERS[pickKind(config.weights)](config);
    for (let i = 0; i < 5 && q.text === avoidText; i++) {
        q = BUILDERS[pickKind(config.weights)](config);
    }
    return q;
}

/**
 * Devuelve `count` opciones mezcladas (incluye la correcta), todas distintas
 * y >= 0. Los distractores son cercanos a la respuesta para que haya que pensar.
 */
export function buildAnswerOptions(answer: number, count = 3): number[] {
    const options = new Set<number>([answer]);
    const spread = Math.min(10, Math.max(3, Math.round(answer * 0.15)));

    let attempts = 0;
    while (options.size < count && attempts < 50) {
        attempts++;
        const delta = rand(1, spread) * (Math.random() < 0.5 ? -1 : 1);
        const candidate = answer + delta;
        if (candidate >= 0) options.add(candidate);
    }
    // Respaldo (por si la respuesta es 0 o muy pequeña)
    let k = 1;
    while (options.size < count) options.add(answer + k++);

    const list = [...options];
    for (let i = list.length - 1; i > 0; i--) {
        const j = rand(0, i);
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}
