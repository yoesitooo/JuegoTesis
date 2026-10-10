// Avatares SVG construidos por partes. Todo es vectorial: se ve nítido en cualquier pantalla.

export type Expression = 'neutral' | 'happy' | 'oops';

export interface Look {
  skin: number;
  hair: number;
  hairColor: number;
  shirt: number;
  accessory: number;
}

export const SKINS = ['#FFE0C7', '#F6C9A0', '#E8AE7E', '#C98B5C', '#9C6440', '#6B4127'];
export const HAIR_COLORS = ['#2B1D16', '#6B3E20', '#C8873A', '#E8C468', '#B33A1F', '#5B6CFF', '#FF6FA8'];
export const SHIRTS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#007AFF', '#AF52DE', '#FF2D55'];
export const HAIR_STYLES = ['Corto', 'Puntas', 'Rizado', 'Largo', 'Coletas', 'Moño'] as const;
export const ACCESSORIES = ['Nada', 'Gafas', 'Gorra', 'Lazo', 'Audífonos', 'Corona'] as const;

export const DEFAULT_LOOK: Look = { skin: 1, hair: 0, hairColor: 1, shirt: 5, accessory: 0 };

export function randomLook(): Look {
  const r = (n: number) => Math.floor(Math.random() * n);
  return {
    skin: r(SKINS.length),
    hair: r(HAIR_STYLES.length),
    hairColor: r(HAIR_COLORS.length),
    shirt: r(SHIRTS.length),
    accessory: r(ACCESSORIES.length),
  };
}

/** Oscurece un color hex (para sombras). */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 - amount))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const INK = '#2B2233';

function hairBack(style: number, c: string): string {
  switch (style) {
    case 3: // Largo
      return `<path d="M27 54 C25 26 42 16 60 16 C78 16 95 26 93 54 L96 96 C88 102 74 100 70 96 L50 96 C46 100 32 102 24 96 Z" fill="${c}"/>`;
    case 4: // Coletas
      return `<circle cx="23" cy="60" r="12" fill="${c}"/><circle cx="97" cy="60" r="12" fill="${c}"/>
              <circle cx="20" cy="76" r="9" fill="${c}"/><circle cx="100" cy="76" r="9" fill="${c}"/>`;
    case 5: // Moño
      return `<circle cx="60" cy="16" r="13" fill="${c}"/>`;
    default:
      return '';
  }
}

function hairFront(style: number, c: string): string {
  const hi = `rgba(255,255,255,.18)`;
  switch (style) {
    case 0: // Corto
      return `<path d="M30 52 C27 28 42 17 60 17 C79 17 93 28 90 52 C87 42 82 37 76 35 C68 41 52 41 42 35 C36 39 32 45 30 52 Z" fill="${c}"/>
              <path d="M44 24 C52 20 64 20 72 23" stroke="${hi}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 1: // Puntas
      return `<path d="M30 52 C28 40 30 32 34 27 L32 15 L44 22 L48 9 L58 20 L66 8 L72 21 L84 13 L84 27 C90 33 92 42 90 52 C86 43 80 38 72 37 C64 42 50 42 42 37 C36 40 32 46 30 52 Z" fill="${c}"/>`;
    case 2: // Rizado
      return `<g fill="${c}">
                <circle cx="34" cy="40" r="9"/><circle cx="40" cy="28" r="10"/><circle cx="52" cy="21" r="10"/>
                <circle cx="66" cy="20" r="10"/><circle cx="79" cy="27" r="10"/><circle cx="86" cy="39" r="9"/>
                <circle cx="60" cy="31" r="10"/><circle cx="46" cy="34" r="8"/><circle cx="74" cy="34" r="8"/>
                <circle cx="31" cy="51" r="6"/><circle cx="89" cy="51" r="6"/>
              </g>`;
    case 3: // Largo (flequillo de lado)
      return `<path d="M29 56 C26 28 42 17 60 17 C79 17 94 28 91 56 C88 46 84 40 78 36 C66 44 46 40 38 34 C33 40 30 47 29 56 Z" fill="${c}"/>`;
    case 4: // Coletas (flequillo)
    case 5: // Moño
      return `<path d="M30 50 C28 28 43 18 60 18 C77 18 92 28 90 50 C86 40 76 33 60 33 C46 33 34 40 30 50 Z" fill="${c}"/>`;
    default:
      return '';
  }
}

function face(expr: Expression): string {
  const blush = expr === 'happy' ? 0.55 : 0.3;
  const cheeks = `<ellipse cx="41" cy="64" rx="5.5" ry="3.5" fill="#FF6B8B" opacity="${blush}"/>
                  <ellipse cx="79" cy="64" rx="5.5" ry="3.5" fill="#FF6B8B" opacity="${blush}"/>`;
  if (expr === 'happy') {
    return `${cheeks}
      <path d="M43 56 Q49 49 55 56" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M65 56 Q71 49 77 56" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M47 64 Q60 64 73 64 Q72 80 60 80 Q48 80 47 64 Z" fill="#7A1F2B"/>
      <path d="M49 64.5 L71 64.5 L70 68 Q60 69.5 50 68 Z" fill="#fff"/>
      <path d="M53 76 Q60 72 67 76 Q64 79.5 60 79.5 Q56 79.5 53 76 Z" fill="#FF7A8A"/>`;
  }
  if (expr === 'oops') {
    return `${cheeks}
      <path d="M43 46 L54 49" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M77 46 L66 49" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="49" cy="56" rx="4" ry="4.6" fill="${INK}"/><ellipse cx="71" cy="56" rx="4" ry="4.6" fill="${INK}"/>
      <circle cx="50.4" cy="54.4" r="1.4" fill="#fff"/><circle cx="72.4" cy="54.4" r="1.4" fill="#fff"/>
      <ellipse cx="60" cy="71" rx="4.6" ry="5.4" fill="#7A1F2B"/>
      <path d="M86 40 Q90 46 86 49 Q82 46 86 40 Z" fill="#7DD3FC"/>`;
  }
  return `${cheeks}
      <path d="M44 47 Q49 45 54 47" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M66 47 Q71 45 76 47" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="49" cy="56" rx="3.4" ry="4.2" fill="${INK}"/><ellipse cx="71" cy="56" rx="3.4" ry="4.2" fill="${INK}"/>
      <circle cx="50.3" cy="54.5" r="1.3" fill="#fff"/><circle cx="72.3" cy="54.5" r="1.3" fill="#fff"/>
      <path d="M51 66 Q60 73 69 66" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

function accessory(kind: number, look: Look): string {
  switch (kind) {
    case 1: // Gafas
      return `<g fill="rgba(255,255,255,.25)" stroke="${INK}" stroke-width="2.6">
                <rect x="39" y="49" width="20" height="15" rx="6"/><rect x="61" y="49" width="20" height="15" rx="6"/>
              </g><path d="M59 55 L61 55" stroke="${INK}" stroke-width="2.6"/>`;
    case 2: { // Gorra
      const c = SHIRTS[(look.shirt + 3) % SHIRTS.length];
      return `<path d="M30 42 C30 22 44 14 60 14 C76 14 90 22 90 42 Z" fill="${c}"/>
              <path d="M58 42 C70 38 88 38 104 44 C100 48 92 48 84 46 Z" fill="${shade(c, 0.18)}"/>
              <path d="M30 42 L90 42" stroke="${shade(c, 0.25)}" stroke-width="3"/>
              <circle cx="60" cy="15" r="3" fill="${shade(c, 0.25)}"/>`;
    }
    case 3: { // Lazo
      const c = '#FF2D55';
      return `<g transform="translate(80 24) rotate(18)">
                <path d="M0 0 L-14 -9 Q-17 0 -14 9 Z" fill="${c}"/><path d="M0 0 L14 -9 Q17 0 14 9 Z" fill="${c}"/>
                <circle r="4.5" fill="${shade(c, 0.2)}"/>
              </g>`;
    }
    case 4: // Audífonos
      return `<path d="M27 54 C25 22 95 22 93 54" stroke="#3A3A3C" stroke-width="5" fill="none" stroke-linecap="round"/>
              <rect x="20" y="46" width="12" height="20" rx="6" fill="#FF3B30"/>
              <rect x="88" y="46" width="12" height="20" rx="6" fill="#FF3B30"/>`;
    case 5: // Corona
      return `<path d="M40 24 L42 6 L51 16 L60 3 L69 16 L78 6 L80 24 Z" fill="#FFCC00" stroke="#E0A800" stroke-width="2" stroke-linejoin="round"/>
              <circle cx="60" cy="16" r="3" fill="#FF2D55"/><circle cx="48" cy="19" r="2.2" fill="#34C759"/><circle cx="72" cy="19" r="2.2" fill="#007AFF"/>`;
    default:
      return '';
  }
}

/**
 * Devuelve el contenido interno (sin <svg>) del avatar en un espacio de 120×120.
 * Con expr = 'live' se incluyen las tres caras y el CSS muestra la que indique
 * el atributo data-expr del contenedor.
 */
export function avatarInner(look: Look, expr: Expression | 'live' = 'neutral', withBody = true): string {
  const skin = SKINS[look.skin] ?? SKINS[0];
  const hairC = HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0];
  const shirt = SHIRTS[look.shirt] ?? SHIRTS[0];
  const skinShade = shade(skin, 0.12);

  const faces = expr === 'live'
    ? (['neutral', 'happy', 'oops'] as Expression[]).map((e) => `<g class="face face-${e}">${face(e)}</g>`).join('')
    : face(expr);

  const body = withBody
    ? `<path d="M18 122 C18 98 36 86 60 86 C84 86 102 98 102 122 Z" fill="${shirt}"/>
       <path d="M48 87 L60 100 L72 87 Z" fill="${shade(shirt, 0.15)}"/>
       <rect x="52" y="74" width="16" height="16" rx="7" fill="${skinShade}"/>`
    : '';

  return `
    ${hairBack(look.hair, hairC)}
    ${body}
    <circle cx="31" cy="57" r="6.5" fill="${skinShade}"/>
    <circle cx="89" cy="57" r="6.5" fill="${skinShade}"/>
    <ellipse cx="60" cy="53" rx="29" ry="30" fill="${skin}"/>
    ${faces}
    ${hairFront(look.hair, hairC)}
    ${accessory(look.accessory, look)}`;
}

export function avatarSVG(look: Look, expr: Expression | 'live' = 'neutral', className = 'avatar-svg'): string {
  return `<svg class="${className}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${avatarInner(look, expr)}</svg>`;
}
