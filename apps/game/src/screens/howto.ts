// Pantalla "¿Cómo se juega?": se muestra antes de cada partida.
// Explica con dibujos, frases cortas y teclas animadas qué hacer,
// adaptándose al modo 1 jugador o 2 jugadores.
import { avatarSVG, DEFAULT_LOOK } from '../art/avatar';
import { vehicleSVG } from '../art/vehicles';
import { h } from '../core/dom';
import { icons } from '../core/icons';
import { targetForLevel, type Difficulty } from '../core/math';
import { go, type Screen } from '../core/router';
import { sfx } from '../core/sound';
import { store } from '../core/store';
import { topBar } from '../core/ui';
import { versusRacers, type Racer } from './versus';

interface KeySet {
  up: string[];
  down: string[];
  go: string[];
}

const keycap = (label: string, cls = '') => h('kbd', { class: `keycap ${cls}`, text: label });

/** Teclas + qué hacen. `anim` sincroniza la tecla con la demo del carrito. */
function keyRow(keys: string[], what: string, anim: 'up' | 'down' | 'go') {
  return h('div', { class: 'key-col' },
    h('span', { class: 'key-group' }, ...keys.map((k, i) => [
      i > 0 ? h('span', { class: 'key-or', text: 'o' }) : null,
      keycap(k, `press-${anim}`),
    ]).flat()),
    h('span', { class: 'key-what', text: what }),
  );
}

/** Tarjeta con el personaje, una mini pista animada y sus teclas. */
function controlsCard(racer: Racer, keys: KeySet, title: string, onEdit?: () => void) {
  return h('div', { class: `card howto-player racer-p${racer.id}` },
    h('div', { class: 'howto-player-head' },
      h('div', { class: 'chip-avatar', html: avatarSVG(racer.look, 'happy') }),
      h('div', {}, h('strong', { text: title }), h('span', { class: 'muted', text: racer.name })),
      onEdit ? h('button', {
        class: 'howto-edit',
        attrs: { type: 'button', 'aria-label': `Editar personaje de ${title}` },
        on: { click: () => { sfx.tap(); onEdit(); } },
      }, h('span', { html: icons.pencil }), h('span', { text: 'Editar' })) : null,
    ),
    h('div', { class: 'demo-road', attrs: { 'aria-hidden': 'true' } },
      h('i', { class: 'demo-line l1' }),
      h('i', { class: 'demo-line l2' }),
      h('div', { class: 'demo-car', html: vehicleSVG(racer.vehicleId, racer.look, 'happy') }),
    ),
    h('div', { class: 'key-list' },
      keyRow(keys.up, 'Subir', 'up'),
      keyRow(keys.down, 'Bajar', 'down'),
      keyRow(keys.go, '¡Acelerar!', 'go'),
    ),
  );
}

export function howtoScreen(params?: Record<string, unknown>): Screen {
  const difficulty = (params?.difficulty as Difficulty) ?? 'facil';
  const players = params?.players === 2 ? 2 : 1;
  const profile = store.profile;
  const target = targetForLevel(1);

  const steps = [
    {
      title: 'Mira la operación',
      text: 'Arriba aparece una cuenta. Piensa cuál es la respuesta.',
      art: h('div', { class: 'howto-q' }, '3 + 4 ', h('span', { class: 'q-eq', text: '=' }), h('span', { class: 'q-answer', text: '?' })),
    },
    {
      title: 'Ve a la burbuja correcta',
      text: 'Mueve tu vehículo al carril de la burbuja con la respuesta.',
      art: h('div', { class: 'howto-bubbles' },
        h('span', { class: 'mini-gate', text: '6' }),
        h('span', { class: 'mini-gate ok', text: '7' }),
        h('span', { class: 'mini-gate', text: '9' }),
      ),
    },
    players === 2
      ? { title: '¡Gana el más rápido!', text: `El primero en lograr ${target} aciertos gana el nivel.`, art: h('div', { class: 'howto-emoji', text: '🏆' }) }
      : { title: 'Junta estrellas', text: `Logra ${target} aciertos para pasar de nivel.`, art: h('div', { class: 'howto-emoji', text: '⭐' }) },
  ];

  const stepsCard = h('ol', { class: 'card howto-steps' },
    ...steps.map((s, i) => h('li', { class: 'howto-step', style: { animationDelay: `${0.1 + i * 0.12}s` } },
      h('span', { class: 'howto-num', text: String(i + 1) }),
      h('div', { class: 'howto-step-text' }, h('strong', { text: s.title }), h('span', { class: 'muted', text: s.text })),
      s.art,
    )),
  );

  let controls: HTMLElement;
  if (players === 2) {
    const [p1, p2] = versusRacers();
    controls = h('div', { class: 'howto-controls two' },
      controlsCard(p1, { up: ['W'], down: ['S'], go: ['D'] }, 'Jugador 1',
        () => go('creator', { player: 1, difficulty })),
      h('span', { class: 'versus-vs', text: 'VS' }),
      controlsCard(p2, { up: ['↑'], down: ['↓'], go: ['→'] }, 'Jugador 2',
        () => go('creator', { player: 2, difficulty })),
    );
  } else {
    const me: Racer = { id: 1, name: profile?.name ?? '', look: profile?.look ?? DEFAULT_LOOK, vehicleId: profile?.vehicleId ?? 'rayo' };
    controls = h('div', { class: 'howto-controls' },
      controlsCard(me, { up: ['W', '↑'], down: ['S', '↓'], go: ['Espacio'] }, 'Tus teclas'),
    );
  }

  const touchTip = h('p', { class: 'howto-touch' },
    h('span', { text: '📱' }),
    players === 2
      ? ' En tablet o celular: cada uno toca la burbuja de su lado.'
      : ' En tablet o celular: ¡solo toca la burbuja con la respuesta!',
  );

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    sfx.tap();
    go(players === 2 ? 'versus' : 'game', { difficulty });
  };

  const startBtn = h('button', { class: 'btn btn-primary howto-start', attrs: { type: 'button' }, on: { click: start } },
    h('span', { text: '¡A jugar!' }), h('span', { class: 'btn-icon', html: icons.play }));

  const el = h('section', { class: 'page howto' },
    topBar('¿Cómo se juega?', { back: () => go('difficulty') }),
    h('div', { class: 'page-body howto-body' },
      h('p', { class: 'page-lead', text: players === 2 ? '¡Carrera de 2 jugadores en el mismo teclado!' : profile ? `¡Así se juega, ${profile.name}!` : '¡Así se juega!' }),
      stepsCard,
      controls,
      touchTip,
    ),
    h('div', { class: 'page-footer' }, startBtn),
  );

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); }
  };

  return {
    el,
    mount() { window.addEventListener('keydown', onKey); },
    destroy() { window.removeEventListener('keydown', onKey); },
  };
}
