import { describe, expect, it } from 'vitest';
import { makeQuestion, starsFor, targetForLevel, tierFor, travelSeconds, type Difficulty } from '../math';

const DIFFS: Difficulty[] = ['facil', 'medio', 'dificil'];

describe('makeQuestion', () => {
  it.each(DIFFS)('genera 3 opciones distintas, no negativas y con la correcta (%s)', (d) => {
    for (let level = 1; level <= 6; level++) {
      for (let i = 0; i < 500; i++) {
        const q = makeQuestion(d, level);
        expect(q.options).toHaveLength(3);
        expect(new Set(q.options).size).toBe(3);
        expect(q.options).toContain(q.answer);
        q.options.forEach((o) => expect(o).toBeGreaterThanOrEqual(0));
      }
    }
  });

  it('la respuesta coincide con la operación mostrada (entera y no negativa)', () => {
    for (const d of DIFFS) {
      for (let level = 1; level <= 8; level++) {
        for (let i = 0; i < 300; i++) {
          const q = makeQuestion(d, level);
          const expr = q.text.replaceAll('×', '*').replaceAll('−', '-').replaceAll('÷', '/');
          const value = Function(`return ${expr}`)();
          expect(value).toBe(q.answer);
          expect(Number.isInteger(value)).toBe(true);
          expect(value).toBeGreaterThan(0);
        }
      }
    }
  });

  it('niveles 1 y 2 de fácil incluyen las 4 operaciones con números pequeños', () => {
    for (const level of [1, 2]) {
      const seen = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        const q = makeQuestion('facil', level);
        const [a, op, b] = q.text.split(' ');
        seen.add(op);
        expect(q.text).not.toContain('(');
        if (op === '+') expect(q.answer).toBeLessThanOrEqual(18);
        if (op === '−') expect(Number(a)).toBeLessThanOrEqual(18);
        if (op === '×') expect(Math.min(Number(a), Number(b))).toBeLessThanOrEqual(5);
        if (op === '÷') expect(Number(b)).toBeLessThanOrEqual(5);
      }
      expect([...seen].sort()).toEqual(['+', '×', '÷', '−'].sort());
    }
  });

  it('las divisiones siempre son exactas', () => {
    for (const d of DIFFS) {
      for (let i = 0; i < 2000; i++) {
        const q = makeQuestion(d, 5);
        const m = q.text.match(/(\d+) ÷ (\d+)/);
        if (m) expect(Number(m[1]) % Number(m[2])).toBe(0);
      }
    }
  });

  it('la dificultad sube el reto con los niveles', () => {
    expect(tierFor('facil', 1)).toBe(1);
    expect(tierFor('facil', 2)).toBeLessThan(tierFor('facil', 4));
    expect(tierFor('medio', 1)).toBeGreaterThan(tierFor('facil', 1));
    expect(tierFor('dificil', 99)).toBe(6);
  });

  it('no repite la misma pregunta seguida', () => {
    let prev = makeQuestion('facil', 1);
    let repeats = 0;
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion('facil', 1, Math.random, prev.text);
      if (q.text === prev.text) repeats++;
      prev = q;
    }
    expect(repeats).toBeLessThan(3);
  });
});

describe('progresión', () => {
  it('sube la meta y la velocidad con límites', () => {
    expect(targetForLevel(1)).toBe(5);
    expect(targetForLevel(20)).toBe(8);
    expect(travelSeconds('facil', 2)).toBeLessThan(travelSeconds('facil', 1));
    expect(travelSeconds('dificil', 50)).toBeGreaterThanOrEqual(3.6);
  });

  it('estrellas según errores', () => {
    expect(starsFor(0)).toBe(3);
    expect(starsFor(2)).toBe(2);
    expect(starsFor(5)).toBe(1);
  });
});
