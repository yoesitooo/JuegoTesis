// Componentes de interfaz reutilizables (estilo iOS).
import { h } from './dom';
import { icons } from './icons';
import { sfx } from './sound';
import { store } from './store';

export function iconButton(icon: string, label: string, onClick: () => void, extraClass = ''): HTMLButtonElement {
  return h('button', {
    class: `icon-btn ${extraClass}`,
    html: icon,
    attrs: { type: 'button', 'aria-label': label, title: label },
    on: { click: () => { sfx.tap(); onClick(); } },
  });
}

export function button(label: string, onClick: () => void, variant: 'primary' | 'secondary' | 'ghost' = 'primary', icon?: string): HTMLButtonElement {
  const b = h('button', {
    class: `btn btn-${variant}`,
    attrs: { type: 'button' },
    on: { click: () => { sfx.tap(); onClick(); } },
  });
  b.append(h('span', { text: label }));
  if (icon) b.append(h('span', { class: 'btn-icon', html: icon }));
  return b;
}

export function soundToggle(): HTMLButtonElement {
  const btn = iconButton(store.muted ? icons.soundOff : icons.soundOn, 'Sonido', () => {
    store.muted = !store.muted;
    btn.innerHTML = store.muted ? icons.soundOff : icons.soundOn;
    btn.setAttribute('aria-pressed', String(!store.muted));
  });
  btn.setAttribute('aria-pressed', String(!store.muted));
  return btn;
}

export function topBar(title: string, opts: { back?: () => void; right?: HTMLElement | null } = {}): HTMLElement {
  return h('header', { class: 'top-bar' },
    opts.back ? iconButton(icons.back, 'Volver', opts.back) : h('span', { class: 'icon-btn-spacer' }),
    h('h2', { class: 'top-title', text: title }),
    opts.right ?? h('span', { class: 'icon-btn-spacer' }),
  );
}

/** Hoja modal que sube desde abajo, como en iOS. */
export function sheet(content: HTMLElement, opts: { dismissable?: boolean; onClose?: () => void } = {}) {
  const host = document.getElementById('app')!;
  const panel = h('div', { class: 'sheet', attrs: { role: 'dialog', 'aria-modal': 'true' } }, h('div', { class: 'sheet-grabber' }), content);
  const backdrop = h('div', { class: 'sheet-backdrop' }, panel);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    backdrop.classList.remove('open');
    setTimeout(() => backdrop.remove(), 320);
    opts.onClose?.();
  };
  if (opts.dismissable) {
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  }
  host.append(backdrop);
  requestAnimationFrame(() => requestAnimationFrame(() => backdrop.classList.add('open')));
  setTimeout(() => panel.querySelector<HTMLElement>('button')?.focus({ preventScroll: true }), 50);
  return { close, el: panel };
}
