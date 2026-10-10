import { describe, expect, it } from 'vitest';
import { makeQuestion, starsFor, targetForLevel, travelSeconds, type Difficulty } from '../math';

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

  it('la respuesta coincide con la operación mostrada', () => {
    for (const d of DIFFS) {
      for (let i = 0; i < 300; i++) {
        const q = makeQuestion(d, 3);
        const expr = q.text.replace('×', '*').replace('−', '-');
        expect(Function(`return ${expr}`)()).toBe(q.answer);
      }
    }
  });

  it('fácil usa sumas de una cifra', () => {
    for (let i = 0; i < 300; i++) {
      const [a, op, b] = makeQuestion('facil', 4).text.split(' ');
      expect(op).toBe('+');
      expect(Number(a)).toBeLessThan(10);
      expect(Number(b)).toBeLessThan(10);
    }
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
