// Sincronización opcional: si se define VITE_SYNC_URL, las sesiones guardadas
// sin internet se envían al servidor cuando vuelve la conexión.
import { store } from './store';

const URL = import.meta.env.VITE_SYNC_URL as string | undefined;

export async function syncPending(): Promise<void> {
  if (!URL || !navigator.onLine || store.pending.length === 0) return;
  const batch = store.pending.slice(0, 50);
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: batch }),
    });
    if (res.ok) store.clearPending(batch.map((s) => s.id));
  } catch {
    /* sin conexión real: se intentará más tarde */
  }
}

export function startSync() {
  window.addEventListener('online', () => void syncPending());
  void syncPending();
}
