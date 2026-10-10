// Navegación entre pantallas con transición suave.
export type Route = 'home' | 'creator' | 'garage' | 'difficulty' | 'game';

export interface Screen {
  el: HTMLElement;
  /** Se llama cuando la pantalla ya está en el DOM. */
  mount?(): void;
  destroy?(): void;
}

type Factory = (params?: Record<string, unknown>) => Screen;

const routes = new Map<Route, Factory>();
let current: Screen | null = null;
let root: HTMLElement;

export function setupRouter(container: HTMLElement, table: Record<Route, Factory>) {
  root = container;
  for (const [k, f] of Object.entries(table)) routes.set(k as Route, f);
}

export function go(route: Route, params?: Record<string, unknown>) {
  const factory = routes.get(route);
  if (!factory) throw new Error(`Ruta desconocida: ${route}`);
  const prev = current;
  const next = factory(params);
  next.el.classList.add('screen', 'screen-enter');
  root.append(next.el);
  current = next;
  next.mount?.();
  requestAnimationFrame(() => next.el.classList.remove('screen-enter'));

  if (prev) {
    prev.destroy?.();
    prev.el.classList.add('screen-exit');
    prev.el.setAttribute('aria-hidden', 'true');
    setTimeout(() => prev.el.remove(), 320);
  }
}
