import { avatarSVG, DEFAULT_LOOK } from '../art/avatar';
import { CLOUD } from '../art/scenery';
import { vehicleSVG } from '../art/vehicles';
import { h } from '../core/dom';
import { icons } from '../core/icons';
import { go, type Screen } from '../core/router';
import { store } from '../core/store';
import { button, soundToggle } from '../core/ui';

/** Escena decorativa con el vehículo avanzando (se reutiliza en otras pantallas). */
export function miniStage(vehicleId: string, look = DEFAULT_LOOK, expr: 'neutral' | 'happy' | 'live' = 'happy'): HTMLElement {
  return h('div', { class: 'stage auto-scroll' },
    h('div', { class: 'sky' },
      h('div', { class: 'cloud c1', html: CLOUD }),
      h('div', { class: 'cloud c2', html: CLOUD }),
      h('div', { class: 'cloud c3', html: CLOUD }),
    ),
    h('div', { class: 'layer hills' }),
    h('div', { class: 'layer trees' }),
    h('div', { class: 'stage-road' }, h('div', { class: 'road-dash' })),
    h('div', { class: 'stage-car', html: vehicleSVG(vehicleId, look, expr) }),
  );
}

export function homeScreen(): Screen {
  const profile = store.profile;
  const look = profile?.look ?? DEFAULT_LOOK;
  const vehicleId = profile?.vehicleId ?? 'rayo';

  const actions = h('div', { class: 'home-actions' });

  if (profile) {
    const pct = store.totals.answered ? Math.round((store.totals.correct / store.totals.answered) * 100) : 0;
    actions.append(
      h('div', { class: 'player-chip' },
        h('div', { class: 'chip-avatar', html: avatarSVG(look, 'happy') }),
        h('div', { class: 'chip-text' },
          h('strong', { text: `¡Hola, ${profile.name}!` }),
          h('span', { text: store.totals.answered ? `${store.totals.correct} aciertos · ${pct}% de precisión` : '¿Listo para tu primera carrera?' }),
        ),
      ),
      button('Jugar', () => go('difficulty'), 'primary', icons.play),
      button('Cambiar personaje', () => go('creator'), 'secondary', icons.pencil),
    );
  } else {
    actions.append(
      h('p', { class: 'home-lead', text: 'Crea tu personaje, elige tu vehículo y resuelve operaciones para ganar la carrera.' }),
      button('Comenzar', () => go('creator'), 'primary', icons.play),
    );
  }

  const el = h('section', { class: 'home' },
    h('div', { class: 'home-top' }, h('span', { class: 'pill-badge', text: 'EduRunner Math' }), soundToggle()),
    h('div', { class: 'home-hero' },
      h('h1', { class: 'home-title' }, 'Carrera', h('br'), h('span', { text: 'Matemática' })),
      h('p', { class: 'home-sub', text: 'Suma, resta y multiplica a toda velocidad' }),
    ),
    h('div', { class: 'home-stage card' }, miniStage(vehicleId, look, 'happy')),
    h('div', { class: 'card home-card' }, actions),
  );

  return { el };
}
