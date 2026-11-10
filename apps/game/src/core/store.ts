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

/** 1 = dueño del dispositivo; 2 = segundo jugador del modo 2 jugadores. */
export type Slot = 1 | 2;

/** Personaje por defecto del Jugador 2 (hasta que lo personalice). */
export const DEFAULT_PLAYER2: Profile = {
  name: 'Jugador 2',
  look: { skin: 3, hair: 4, hairColor: 0, shirt: 1, accessory: 2 },
  vehicleId: 'kart',
};

interface SaveData {
  version: 2;
  profile: Profile | null;
  profile2: Profile | null; // personaje del Jugador 2
  muted: boolean;
  best: Partial<Record<Difficulty, { level: number; score: number }>>;
  totals: { correct: number; answered: number };
  pending: SessionRecord[]; // sesiones aún no enviadas al servidor
}

const KEY = 'edurunner:v2';

const empty = (): SaveData => ({
  version: 2,
  profile: null,
  profile2: null,
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
  /** Personaje del Jugador 2 (o el de por defecto si aún no lo creó). */
  get profile2(): Profile {
    return data.profile2 ?? DEFAULT_PLAYER2;
  },
  /** Perfil en edición (aún no guardado) o el guardado. */
  draft: null as Profile | null,
  draftSlot: 1 as Slot,

  workingProfile(slot: Slot = 1): Profile {
    if (!this.draft || this.draftSlot !== slot) {
      this.draftSlot = slot;
      if (slot === 2) {
        this.draft = structuredClone(this.profile2);
      } else {
        this.draft = data.profile
          ? structuredClone(data.profile)
          : { name: '', look: { ...DEFAULT_LOOK }, vehicleId: 'rayo' };
      }
    }
    return this.draft;
  },

  saveProfile(p: Profile, slot: Slot = 1) {
    if (slot === 2) data.profile2 = structuredClone(p);
    else data.profile = structuredClone(p);
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
