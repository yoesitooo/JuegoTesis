// Vehículos predeterminados en vista lateral (miran a la derecha).
// El personaje elegido va sentado dentro, así su cara (y su sonrisa) se ve mientras juega.
import { avatarInner, shade, SHIRTS, type Expression, type Look } from './avatar';

export interface Vehicle {
  id: string;
  name: string;
  tagline: string;
  color: string;
  stats: { speed: number; style: number; fun: number };
}

export const VEHICLES: Vehicle[] = [
  { id: 'rayo', name: 'Rayo', tagline: 'Deportivo veloz', color: '#FF3B30', stats: { speed: 5, style: 4, fun: 3 } },
  { id: 'kart', name: 'Kart Turbo', tagline: 'Pequeño y ágil', color: '#34C759', stats: { speed: 4, style: 3, fun: 5 } },
  { id: 'scooter', name: 'Vespi', tagline: 'Moto con estilo', color: '#5AC8FA', stats: { speed: 3, style: 5, fun: 4 } },
  { id: 'bus', name: 'Bus Escolar', tagline: 'Para toda la clase', color: '#FFCC00', stats: { speed: 2, style: 3, fun: 5 } },
  { id: 'cohete', name: 'Cohete', tagline: 'Vuela bajito', color: '#AF52DE', stats: { speed: 5, style: 5, fun: 5 } },
  { id: 'monster', name: 'Monster', tagline: 'Ruedas gigantes', color: '#FF9500', stats: { speed: 3, style: 4, fun: 5 } },
];

export const vehicleById = (id: string) => VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];

let uid = 0;

function wheel(cx: number, cy: number, r: number): string {
  return `<g class="wheel" style="transform-origin:${cx}px ${cy}px">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1C1C1E"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="#E5E5EA"/>
      <path d="M${cx - r * 0.5} ${cy} L${cx + r * 0.5} ${cy} M${cx} ${cy - r * 0.5} L${cx} ${cy + r * 0.5}" stroke="#AEAEB2" stroke-width="${r * 0.14}" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="#8E8E93"/>
    </g>`;
}

/** Coloca al avatar: (cx, cy) es el centro de la cabeza dentro del vehículo. */
function driver(look: Look, expr: Expression | 'live', cx: number, cy: number, s: number): string {
  const tx = cx - 60 * s;
  const ty = cy - 53 * s;
  return `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s})">${avatarInner(look, expr)}</g>`;
}

const shadow = (cx: number, w: number) =>
  `<ellipse class="veh-shadow" cx="${cx}" cy="123" rx="${w}" ry="5" fill="rgba(0,0,0,.18)"/>`;

function rayo(v: Vehicle, look: Look, expr: Expression | 'live'): string {
  const c = v.color, d = shade(c, 0.2);
  return `${shadow(112, 96)}
    <rect x="66" y="56" width="10" height="26" rx="4" fill="${shade(c, 0.45)}"/>
    ${driver(look, expr, 96, 50, 0.68)}
    <path d="M16 106 L16 88 Q18 76 36 75 L126 75 L138 75 Q190 76 205 90 Q209 96 208 106 Z" fill="${c}"/>
    <path d="M20 88 Q22 80 36 79 L190 79 Q200 82 204 88 Z" fill="rgba(255,255,255,.22)"/>
    <path d="M130 76 L146 52 L153 54 L141 76 Z" fill="#BFE6FF" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    <rect x="30" y="90" width="150" height="5" rx="2.5" fill="#fff" opacity=".85"/>
    <rect x="16" y="82" width="7" height="9" rx="2" fill="#FF8A80"/>
    <ellipse cx="203" cy="90" rx="4" ry="5" fill="#FFE58A"/>
    <path d="M16 106 L208 106" stroke="${d}" stroke-width="4" stroke-linecap="round"/>
    ${wheel(56, 106, 17)}${wheel(170, 106, 17)}`;
}

function kart(v: Vehicle, look: Look, expr: Expression | 'live'): string {
  const c = v.color;
  return `${shadow(110, 90)}
    <rect x="18" y="58" width="8" height="34" rx="3" fill="#3A3A3C"/>
    <rect x="8" y="54" width="30" height="8" rx="4" fill="${shade(c, 0.25)}"/>
    ${driver(look, expr, 94, 48, 0.74)}
    <path d="M118 84 L128 62" stroke="#3A3A3C" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="129" cy="61" rx="4" ry="9" fill="#3A3A3C" transform="rotate(25 129 61)"/>
    <path d="M26 102 L26 90 Q28 80 44 80 L132 80 Q140 80 146 86 L196 90 Q204 92 204 100 L204 102 Z" fill="${c}"/>
    <path d="M30 88 Q32 84 44 84 L130 84 Q138 85 142 88 Z" fill="rgba(255,255,255,.25)"/>
    <circle cx="80" cy="93" r="8" fill="#fff"/><text x="80" y="97.5" font-size="11" font-weight="900" text-anchor="middle" fill="${shade(c, 0.4)}" font-family="system-ui">7</text>
    <rect x="196" y="88" width="10" height="14" rx="3" fill="#3A3A3C"/>
    ${wheel(52, 106, 15)}${wheel(172, 106, 15)}`;
}

function scooter(v: Vehicle, look: Look, expr: Expression | 'live'): string {
  const c = v.color;
  const sleeve = SHIRTS[look.shirt] ?? c;
  return `${shadow(112, 84)}
    ${driver(look, expr, 92, 34, 0.72)}
    <path d="M104 66 L150 44" stroke="${sleeve}" stroke-width="9" stroke-linecap="round"/>
    <path d="M150 44 L166 38" stroke="#3A3A3C" stroke-width="5" stroke-linecap="round"/>
    <rect x="52" y="68" width="56" height="9" rx="4.5" fill="#3A3A3C"/>
    <path d="M30 104 Q28 78 60 76 L108 76 Q122 76 124 90 L126 104 Z" fill="${c}"/>
    <path d="M36 88 Q40 80 60 80 L104 80 Q114 80 118 88 Z" fill="rgba(255,255,255,.25)"/>
    <path d="M110 104 L162 104 L166 96 L120 96 Z" fill="${shade(c, 0.2)}"/>
    <path d="M150 104 L158 52 Q160 44 168 46 L172 48 L180 104 Z" fill="${c}"/>
    <ellipse cx="170" cy="58" rx="4" ry="5" fill="#FFE58A"/>
    ${wheel(54, 106, 15)}${wheel(174, 106, 15)}`;
}

function bus(v: Vehicle, look: Look, expr: Expression | 'live'): string {
  const c = v.color, id = `bw${++uid}`;
  const windows = [22, 52, 82, 112].map((x) => `<rect x="${x}" y="32" width="24" height="26" rx="6" fill="#BFE6FF"/><path d="M${x + 4} ${54} L${x + 16} ${36}" stroke="#fff" stroke-width="3" opacity=".7"/>`).join('');
  return `${shadow(110, 100)}
    <path d="M10 32 Q10 20 22 20 L168 20 Q186 20 194 38 L208 70 Q212 76 212 86 L212 100 Q212 106 206 106 L16 106 Q10 106 10 100 Z" fill="${c}"/>
    ${windows}
    <clipPath id="${id}"><rect x="142" y="28" width="54" height="40" rx="8"/></clipPath>
    <rect x="142" y="28" width="54" height="40" rx="8" fill="#BFE6FF"/>
    <g clip-path="url(#${id})">${driver(look, expr, 168, 48, 0.56)}</g>
    <rect x="142" y="28" width="54" height="40" rx="8" fill="none" stroke="${shade(c, 0.2)}" stroke-width="3"/>
    <path d="M10 66 L212 66 L212 100 Q212 106 206 106 L16 106 Q10 106 10 100 Z" fill="${c}"/>
    <rect x="10" y="72" width="202" height="5" fill="#1C1C1E"/>
    <rect x="10" y="84" width="202" height="3" fill="#1C1C1E"/>
    <text x="111" y="99" font-size="10" font-weight="900" text-anchor="middle" fill="#1C1C1E" font-family="system-ui" letter-spacing="1">ESCUELA</text>
    <rect x="204" y="78" width="8" height="10" rx="2" fill="#FFF6CC"/>
    ${wheel(50, 106, 16)}${wheel(172, 106, 16)}`;
}

function cohete(v: Vehicle, look: Look, expr: Expression | 'live'): string {
  const c = v.color, d = shade(c, 0.22);
  return `<ellipse class="veh-shadow" cx="114" cy="123" rx="70" ry="4" fill="rgba(0,0,0,.14)"/>
    <g class="hover">
      <path class="flame" d="M24 78 Q2 84 4 86 Q2 88 24 94 Z" fill="#FF9500"/>
      <path class="flame" d="M24 81 Q12 85 13 86 Q12 87 24 91 Z" fill="#FFE58A"/>
      <path d="M40 70 L22 52 L36 52 L60 68 Z" fill="${d}"/>
      ${driver(look, expr, 100, 48, 0.62)}
      <path d="M22 88 Q22 70 62 67 L150 66 Q198 68 214 88 Q198 106 150 108 L54 108 Q22 106 22 88 Z" fill="${c}"/>
      <path d="M30 84 Q34 74 62 72 L150 71 Q186 72 202 82 Z" fill="rgba(255,255,255,.22)"/>
      <path d="M40 104 L24 116 L44 116 L64 104 Z" fill="${d}"/>
      <path d="M62 69 Q64 22 100 22 Q136 22 138 69 Z" fill="#BFE6FF" opacity=".42" stroke="#fff" stroke-width="2"/>
      <path d="M74 50 Q78 32 96 28" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
      <circle cx="170" cy="88" r="7" fill="#fff" opacity=".9"/><circle cx="170" cy="88" r="3.5" fill="${d}"/>
    </g>`;
}

function monster(v: Vehicle, look: Look, expr: Expression | 'live'): string {
  const c = v.color;
  return `${shadow(112, 100)}
    ${driver(look, expr, 120, 36, 0.64)}
    <path d="M92 64 L98 22 Q100 18 104 18 L144 18 Q148 18 150 22 L156 64" stroke="#3A3A3C" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <path d="M14 78 Q14 64 28 64 L190 64 Q210 64 210 80 L210 84 Q210 90 204 90 L20 90 Q14 90 14 84 Z" fill="${c}"/>
    <path d="M18 74 Q20 68 30 68 L190 68 Q204 68 206 74 Z" fill="rgba(255,255,255,.25)"/>
    <path d="M30 80 L60 80 M150 80 L190 80" stroke="${shade(c, 0.3)}" stroke-width="4" stroke-linecap="round"/>
    <rect x="200" y="70" width="8" height="8" rx="2" fill="#FFE58A"/>
    <rect x="50" y="88" width="120" height="6" rx="3" fill="#3A3A3C"/>
    ${wheel(52, 98, 24)}${wheel(170, 98, 24)}`;
}

const DRAW: Record<string, (v: Vehicle, l: Look, e: Expression | 'live') => string> = { rayo, kart, scooter, bus, cohete, monster };

export function vehicleSVG(vehicleId: string, look: Look, expr: Expression | 'live' = 'neutral', className = 'vehicle-svg'): string {
  const v = vehicleById(vehicleId);
  return `<svg class="${className}" viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DRAW[v.id](v, look, expr)}</svg>`;
}
