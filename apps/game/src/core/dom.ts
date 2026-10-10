// Mini helper para crear elementos del DOM sin frameworks.
type Child = Node | string | number | null | undefined | false;

interface Props {
  class?: string;
  text?: string;
  html?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  attrs?: Record<string, string | number | boolean>;
  on?: Partial<{ [K in keyof HTMLElementEventMap]: (ev: HTMLElementEventMap[K]) => void }>;
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.html !== undefined) el.innerHTML = props.html;
  if (props.style) {
    for (const [k, v] of Object.entries(props.style)) {
      if (k.startsWith('--')) el.style.setProperty(k, String(v));
      else (el.style as unknown as Record<string, string>)[k] = String(v);
    }
  }
  if (props.attrs) {
    for (const [k, v] of Object.entries(props.attrs)) {
      if (v === false) continue;
      el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  if (props.on) {
    for (const [evt, fn] of Object.entries(props.on)) {
      el.addEventListener(evt, fn as EventListener);
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : String(c));
  }
  return el;
}

/** Inserta un string SVG dentro de un contenedor. */
export function svgBox(svg: string, className = ''): HTMLDivElement {
  return h('div', { class: className, html: svg });
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
