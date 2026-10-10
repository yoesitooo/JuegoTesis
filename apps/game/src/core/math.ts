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
  facil: { label: 'Fácil', sample: '2 + 3', desc: 'Sumas de una cifra', color: 'green' },
  medio: { label: 'Medio', sample: '15 − 7', desc: 'Sumas y restas', color: 'orange' },
  dificil: { label: 'Difícil', sample: '4 × 6', desc: 'Multiplicaciones', color: 'purple' },
};

/** Crea la operación (sin opciones) según dificultad y nivel. */
function operation(difficulty: Difficulty, level: number, rng: Rng): { text: string; answer: number; kind: '+' | '−' | '×'; a: number; b: number } {
  if (difficulty === 'facil') {
    const max = level <= 1 ? 5 : 9;
    const a = int(rng, 1, max);
    const b = int(rng, 1, max);
    return { text: `${a} + ${b}`, answer: a + b, kind: '+', a, b };
  }
  if (difficulty === 'medio') {
    const max = Math.min(20 + (level - 1) * 10, 50);
    if (rng() < 0.5) {
      const a = int(rng, 2, max - 1);
      const b = int(rng, 1, max - a);
      return { text: `${a} + ${b}`, answer: a + b, kind: '+', a, b };
    }
    const a = int(rng, 3, max);
    const b = int(rng, 1, a - 1);
    return { text: `${a} − ${b}`, answer: a - b, kind: '−', a, b };
  }
  const maxTable = Math.min(5 + (level - 1) * 2, 10);
  const a = int(rng, 2, maxTable);
  const b = int(rng, 1, 10);
  return { text: `${a} × ${b}`, answer: a * b, kind: '×', a, b };
}

/** Distractores creíbles: cercanos a la respuesta, distintos y no negativos. */
export function makeOptions(answer: number, kind: '+' | '−' | '×', a: number, rng: Rng): number[] {
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
