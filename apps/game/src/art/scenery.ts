// Fondos repetibles (colinas, árboles, nubes) generados como SVG para usar en CSS.
const toUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export const HILLS = toUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120">
  <path d="M0 120 L0 66 C90 66 120 22 240 30 C360 38 420 66 600 66 L600 120 Z" fill="#B7E4A7"/>
  <path d="M0 120 L0 90 C120 90 200 64 330 72 C450 80 500 90 600 90 L600 120 Z" fill="#8FD18A"/>
</svg>`);

const tree = (x: number, s: number) => `<g transform="translate(${x} ${120 - 70 * s}) scale(${s})">
  <rect x="17" y="40" width="8" height="30" rx="3" fill="#A0703F"/>
  <circle cx="21" cy="28" r="20" fill="#4CB860"/><circle cx="12" cy="38" r="12" fill="#43A856"/><circle cx="31" cy="36" r="13" fill="#56C46A"/>
  <circle cx="15" cy="22" r="5" fill="rgba(255,255,255,.25)"/></g>`;

const bush = (x: number) => `<g transform="translate(${x} 96)"><circle cx="10" cy="16" r="10" fill="#5CC46B"/><circle cx="24" cy="12" r="13" fill="#4CB860"/><circle cx="38" cy="17" r="9" fill="#5CC46B"/></g>`;

export const TREES = toUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="120" viewBox="0 0 520 120">
  ${tree(20, 1)}${bush(110)}${tree(190, 0.8)}${tree(250, 1.1)}${bush(340)}${tree(430, 0.9)}
</svg>`);

export const FLOWERS = toUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="40" viewBox="0 0 240 40">
  <g fill="#fff"><circle cx="20" cy="20" r="3"/><circle cx="26" cy="20" r="3"/><circle cx="23" cy="15" r="3"/><circle cx="23" cy="25" r="3"/></g><circle cx="23" cy="20" r="2" fill="#FFCC00"/>
  <g fill="#FF9EC4"><circle cx="120" cy="12" r="3"/><circle cx="126" cy="12" r="3"/><circle cx="123" cy="7" r="3"/><circle cx="123" cy="17" r="3"/></g><circle cx="123" cy="12" r="2" fill="#FFCC00"/>
  <path d="M180 30 q4 -8 8 0 M70 34 q3 -6 6 0" stroke="#3E9F4F" stroke-width="2" fill="none"/>
</svg>`);

export const CLOUD = `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M28 52 Q8 52 10 36 Q12 22 28 24 Q32 6 54 8 Q72 8 78 22 Q92 16 102 28 Q116 32 110 46 Q106 54 94 52 Z" fill="#fff"/></svg>`;
