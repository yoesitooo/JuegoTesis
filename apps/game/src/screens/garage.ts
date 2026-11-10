import { vehicleSVG, VEHICLES, type Vehicle } from '../art/vehicles';
import { h } from '../core/dom';
import { icons } from '../core/icons';
import { go, type Screen } from '../core/router';
import { sfx } from '../core/sound';
import { store } from '../core/store';
import { button, topBar } from '../core/ui';

function statRow(label: string, value: number) {
  return h('div', { class: 'stat-row' },
    h('span', { text: label }),
    h('span', { class: 'stat-dots' }, ...Array.from({ length: 5 }, (_, i) => h('i', { class: i < value ? 'on' : '' }))),
  );
}

export function garageScreen(params?: Record<string, unknown>): Screen {
  const slot = params?.player === 2 ? 2 : 1;
  const profile = store.workingProfile(slot);
  const list = h('div', { class: 'garage-list', attrs: { role: 'radiogroup', 'aria-label': 'Vehículos' } });

  const card = (v: Vehicle) => {
    const selected = v.id === profile.vehicleId;
    return h('button', {
      class: `card vehicle-card ${selected ? 'selected' : ''}`,
      style: { '--veh': v.color },
      attrs: { type: 'button', role: 'radio', 'aria-checked': String(selected), 'data-id': v.id },
      on: {
        click: () => {
          sfx.tap();
          profile.vehicleId = v.id;
          render();
        },
      },
    },
      h('span', { class: 'vehicle-check', html: icons.check }),
      h('div', { class: `vehicle-art ${selected ? 'driving' : ''}`, html: vehicleSVG(v.id, profile.look, selected ? 'happy' : 'neutral') }),
      h('div', { class: 'vehicle-info' },
        h('strong', { text: v.name }),
        h('span', { class: 'muted', text: v.tagline }),
      ),
      h('div', { class: 'vehicle-stats' }, statRow('Velocidad', v.stats.speed), statRow('Estilo', v.stats.style), statRow('Diversión', v.stats.fun)),
    );
  };

  const render = () => list.replaceChildren(...VEHICLES.map(card));
  render();

  const done = () => {
    store.saveProfile(profile, slot);
    // Si se vino desde "¿Cómo se juega?" (modo 2 jugadores), se regresa ahí
    if (params?.difficulty) go('howto', { difficulty: params.difficulty, players: 2 });
    else go('difficulty');
  };

  const el = h('section', { class: 'page garage' },
    topBar(slot === 2 ? 'Vehículo del Jugador 2' : 'Elige tu vehículo', { back: () => go('creator', params) }),
    h('div', { class: 'page-body garage-body' },
      h('p', { class: 'page-lead', text: `${profile.name || 'Piloto'}, ¿con cuál quieres correr?` }),
      list,
    ),
    h('footer', { class: 'page-footer' }, button('¡Listo!', done, 'primary', icons.check)),
  );

  return {
    el,
    mount: () => {
      // Centra la tarjeta seleccionada en el carrusel (móviles)
      list.querySelector<HTMLElement>('.selected')?.scrollIntoView({ inline: 'center', block: 'nearest' });
    },
  };
}
