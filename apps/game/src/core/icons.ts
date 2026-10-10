// Iconos SVG en línea (estilo SF Symbols simplificado).
const svg = (path: string, extra = '') =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${path}</svg>`;

export const icons = {
  back: svg('<path d="M15 5l-7 7 7 7"/>'),
  next: svg('<path d="M9 5l7 7-7 7"/>'),
  pause: svg('<rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" stroke="none"/>'),
  play: svg('<path d="M7 4.5v15a1 1 0 001.5.86l12-7.5a1 1 0 000-1.72l-12-7.5A1 1 0 007 4.5z" fill="currentColor" stroke="none"/>'),
  soundOn: svg('<path d="M4 9.5h3l5-4v13l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/>'),
  soundOff: svg('<path d="M4 9.5h3l5-4v13l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>'),
  dice: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  home: svg('<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>'),
  refresh: svg('<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>'),
  pencil: svg('<path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z"/>'),
  star: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor"/></svg>`,
};
