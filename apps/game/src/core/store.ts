// Persistencia local (offline-first). Todo se guarda en localStorage del dispositivo.
import { DEFAULT_LOOK, type Look } from '../art/avatar';
import type { Difficulty } from './math';

export interface Profile {
  name: string;
  look: Look;
  vehicleId: string;
}

export interface SessionRecord {
  id: string;
  date: string;
  name: string;
  difficulty: Difficulty;
  level: number;
  correct: number;
  mistakes: number;
  score: number;
}

interface SaveData {
  version: 2;
  profile: Profile | null;
  muted: boolean;
  best: Partial<Record<Difficulty, { level: number; score: number }>>;
  totals: { correct: number; answered: number };
  pending: SessionRecord[]; // sesiones aún no enviadas al servidor
}

const KEY = 'edurunner:v2';

const empty = (): SaveData => ({
  version: 2,
  profile: null,
  muted: false,
  best: {},
  totals: { correct: 0, answered: 0 },
  pending: [],
});

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as SaveData;
    return data.version === 2 ? { ...empty(), ...data } : empty();
  } catch {
    return empty();
  }
}

let data = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* modo privado o almacenamiento lleno: el juego sigue funcionando */
  }
}

export const store = {
  get profile(): Profile | null {
    return data.profile;
  },
  /** Perfil en edición (aún no guardado) o el guardado. */
  draft: null as Profile | null,

  workingProfile(): Profile {
    if (!this.draft) {
      this.draft = data.profile
        ? structuredClone(data.profile)
        : { name: '', look: { ...DEFAULT_LOOK }, vehicleId: 'rayo' };
    }
    return this.draft;
  },

  saveProfile(p: Profile) {
    data.profile = structuredClone(p);
    this.draft = null;
    save();
  },

  get muted() {
    return data.muted;
  },
  set muted(v: boolean) {
    data.muted = v;
    save();
  },

  best(d: Difficulty) {
    return data.best[d];
  },

  get totals() {
    return data.totals;
  },

  recordAnswer(correct: boolean) {
    data.totals.answered++;
    if (correct) data.totals.correct++;
    save();
  },

  recordLevel(rec: Omit<SessionRecord, 'id' | 'date'>) {
    const prev = data.best[rec.difficulty];
    if (!prev || rec.level > prev.level || (rec.level === prev.level && rec.score > prev.score)) {
      data.best[rec.difficulty] = { level: rec.level, score: rec.score };
    }
    data.pending.push({ ...rec, id: crypto.randomUUID?.() ?? String(Date.now()), date: new Date().toISOString() });
    data.pending = data.pending.slice(-200);
    save();
  },

  get pending() {
    return data.pending;
  },

  clearPending(ids: string[]) {
    data.pending = data.pending.filter((s) => !ids.includes(s.id));
    save();
  },
};
