// Generador de preguntas matemáticas. Funciones puras para poder probarlas.

export type Difficulty = 'facil' | 'medio' | 'dificil';

export interface Question {
  text: string;        // "7 + 5"
  answer: number;
  options: number[];   // 3 opciones barajadas, una es la correcta
}

export type Rng = () => number;

const int = (rng: Rng, min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

export const DIFFICULTIES: Record<Difficulty, { label: string; sample: string; desc: string; color: string }> = {
  facil: { label: 'Fácil', sample: '2 + 3', desc: 'Suma, resta, × y ÷ con números pequeños', color: 'green' },
  medio: { label: 'Medio', sample: '24 ÷ 4', desc: 'Las 4 operaciones con números más grandes', color: 'orange' },
  dificil: { label: 'Difícil', sample: '4 × 6', desc: 'Tablas grandes y operaciones combinadas', color: 'purple' },
};

export type Kind = '+' | '−' | '×' | '÷' | 'mix';
type Range = [number, number];

/**
 * Escalones de dificultad. Cada nivel superado sube un escalón.
 *  1–2: iniciales (sumas/restas sencillas, tablas pequeñas, divisiones exactas fáciles)
 *  3–4: intermedios (números de dos cifras, tablas hasta el 8, aparecen combinadas)
 *  5–6: avanzados (centenas, tablas hasta el 12, más combinadas)
 */
interface Tier {
  add: number;           // suma máxima del resultado de una suma
  sub: number;           // minuendo máximo de una resta
  mulA: Range;           // tabla
  mulB: Range;           // multiplicador
  divisor: Range;
  quotient: Range;       // resultado de la división (siempre entero)
  weights: Record<Kind, number>;
}

const TIERS: Tier[] = [
  { add: 10, sub: 10, mulA: [1, 3], mulB: [1, 5], divisor: [2, 3], quotient: [1, 5],
    weights: { '+': 3, '−': 3, '×': 2, '÷': 2, mix: 0 } },
  { add: 18, sub: 18, mulA: [2, 5], mulB: [1, 10], divisor: [2, 5], quotient: [1, 5],
    weights: { '+': 3, '−': 3, '×': 2, '÷': 2, mix: 0 } },
  { add: 30, sub: 30, mulA: [2, 6], mulB: [1, 10], divisor: [2, 5], quotient: [1, 10],
    weights: { '+': 2, '−': 2, '×': 3, '÷': 3, mix: 0 } },
  { add: 50, sub: 50, mulA: [2, 8], mulB: [2, 10], divisor: [2, 8], quotient: [2, 10],
    weights: { '+': 2, '−': 2, '×': 3, '÷': 3, mix: 1 } },
  { add: 100, sub: 100, mulA: [2, 10], mulB: [2, 10], divisor: [2, 10], quotient: [2, 10],
    weights: { '+': 2, '−': 2, '×': 3, '÷': 3, mix: 2 } },
  { add: 200, sub: 200, mulA: [3, 12], mulB: [2, 12], divisor: [2, 12], quotient: [2, 12],
    weights: { '+': 1, '−': 1, '×': 2, '÷': 2, mix: 3 } },
];

/** La dificultad elegida define el escalón de partida; cada nivel sube uno. */
const START_TIER: Record<Difficulty, number> = { facil: 1, medio: 3, dificil: 4 };

export function tierFor(difficulty: Difficulty, level: number): number {
  return Math.max(1, Math.min(TIERS.length, START_TIER[difficulty] + level - 1));
}

const between = (rng: Rng, [min, max]: Range) => int(rng, min, max);

function pickKind(weights: Record<Kind, number>, rng: Rng): Kind {
  const entries = Object.entries(weights) as [Kind, number][];
  let roll = rng() * entries.reduce((sum, [, w]) => sum + w, 0);
  for (const [kind, w] of entries) {
    roll -= w;
    if (roll < 0) return kind;
  }
  return '+';
}

type Op = { text: string; answer: number; kind: Kind; a: number; b: number };

/** Operaciones combinadas, con paréntesis para que el orden sea claro y números pequeños. */
function mixed(t: Tier, rng: Rng): Op {
  const c = int(rng, 1, 9);
  switch (int(rng, 0, 3)) {
    case 0: { // (a × b) + c
      const a = between(rng, t.mulA), b = between(rng, t.mulB);
      return { text: `(${a} × ${b}) + ${c}`, answer: a * b + c, kind: 'mix', a, b };
    }
    case 1: { // (a × b) − c, nunca negativo
      const a = between(rng, t.mulA), b = between(rng, t.mulB);
      const k = Math.min(c, a * b - 1);
      if (k < 1) return { text: `(${a} × ${b}) + ${c}`, answer: a * b + c, kind: 'mix', a, b };
      return { text: `(${a} × ${b}) − ${k}`, answer: a * b - k, kind: 'mix', a, b };
    }
    case 2: { // (D ÷ d) + c, división exacta
      const d = between(rng, t.divisor), q = between(rng, t.quotient);
      return { text: `(${d * q} ÷ ${d}) + ${c}`, answer: q + c, kind: 'mix', a: d * q, b: d };
    }
    default: { // a + b − c, nunca negativo
      const a = int(rng, 2, 12), b = int(rng, 2, 12);
      const k = int(rng, 1, a + b - 1);
      return { text: `${a} + ${b} − ${k}`, answer: a + b - k, kind: 'mix', a, b };
    }
  }
}

/** Crea la operación (sin opciones) según dificultad y nivel. */
function operation(difficulty: Difficulty, level: number, rng: Rng): Op {
  const t = TIERS[tierFor(difficulty, level) - 1];
  switch (pickKind(t.weights, rng)) {
    case '+': {
      const a = int(rng, 1, t.add - 1);
      const b = int(rng, 1, t.add - a);
      return { text: `${a} + ${b}`, answer: a + b, kind: '+', a, b };
    }
    case '−': {
      const a = int(rng, 3, t.sub);
      const b = int(rng, 1, a - 1); // nunca negativo ni cero
      return { text: `${a} − ${b}`, answer: a - b, kind: '−', a, b };
    }
    case '×': {
      const a = between(rng, t.mulA), b = between(rng, t.mulB);
      return { text: `${a} × ${b}`, answer: a * b, kind: '×', a, b };
    }
    case '÷': {
      // Se construye al revés (divisor × cociente) para que siempre sea exacta
      const d = between(rng, t.divisor), q = between(rng, t.quotient);
      return { text: `${d * q} ÷ ${d}`, answer: q, kind: '÷', a: d * q, b: d };
    }
    default:
      return mixed(t, rng);
  }
}

/** Distractores creíbles: cercanos a la respuesta, distintos y no negativos. */
export function makeOptions(answer: number, kind: Kind, a: number, rng: Rng): number[] {
  const candidates = new Set<number>();
  if (kind === '×') {
    candidates.add(answer + a);
    candidates.add(answer - a);
  }
  for (const d of [1, 2, 3, -1, -2, -3, 10, -10]) candidates.add(answer + d);
  candidates.delete(answer);
  const pool = [...candidates].filter((n) => n >= 0);
  // Mezclamos y tomamos dos
  shuffle(pool, rng);
  const options = [answer, pool[0], pool[1]];
  return shuffle(options, rng);
}

export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function makeQuestion(difficulty: Difficulty, level: number, rng: Rng = Math.random, previous?: string): Question {
  let op = operation(difficulty, level, rng);
  // Evita repetir exactamente la misma pregunta dos veces seguidas
  for (let tries = 0; op.text === previous && tries < 5; tries++) op = operation(difficulty, level, rng);
  return { text: op.text, answer: op.answer, options: makeOptions(op.answer, op.kind, op.a, rng) };
}

/** Aciertos necesarios para superar un nivel. */
export const targetForLevel = (level: number) => Math.min(5 + (level - 1), 8);

/** Segundos que tardan las respuestas en llegar al vehículo. */
export function travelSeconds(difficulty: Difficulty, level: number): number {
  const base = difficulty === 'facil' ? 7 : difficulty === 'medio' ? 8.5 : 8;
  return Math.max(base - (level - 1) * 0.6, 3.6);
}

/** Estrellas al terminar un nivel según los errores cometidos. */
export const starsFor = (mistakes: number) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1);
