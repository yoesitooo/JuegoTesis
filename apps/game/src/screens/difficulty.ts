import { avatarSVG } from '../art/avatar';
import { h } from '../core/dom';
import { icons } from '../core/icons';
import { DIFFICULTIES, type Difficulty } from '../core/math';
import { go, type Screen } from '../core/router';
import { sfx } from '../core/sound';
import { store } from '../core/store';
import { topBar } from '../core/ui';

/** Modo elegido (1 o 2 jugadores); se recuerda mientras la app está abierta. */
let players: 1 | 2 = 1;

export function difficultyScreen(): Screen {
  const profile = store.profile;
  if (!profile) {
    // Sin personaje todavía: primero se crea
    queueMicrotask(() => go('creator'));
  }

  const editChip = profile
    ? h('button', {
        class: 'avatar-btn',
        html: avatarSVG(profile.look, 'happy'),
        attrs: { type: 'button', 'aria-label': 'Editar personaje', title: 'Editar personaje' },
        on: { click: () => { sfx.tap(); go('creator'); } },
      })
    : null;

  const cards = (Object.keys(DIFFICULTIES) as Difficulty[]).map((id) => {
    const d = DIFFICULTIES[id];
    const best = store.best(id);
    return h('button', {
      class: `card level-card tone-${d.color}`,
      attrs: { type: 'button' },
      on: { click: () => { sfx.tap(); go('howto', { difficulty: id, players }); } },
    },
      h('span', { class: 'level-sample', text: d.sample }),
      h('span', { class: 'level-text' },
        h('strong', { text: d.label }),
        h('span', { class: 'muted', text: d.desc }),
        best ? h('span', { class: 'level-best' }, h('span', { html: icons.star }), `Mejor: nivel ${best.level}`) : null,
      ),
      h('span', { class: 'level-go', html: icons.next }),
    );
  });

  const el = h('section', { class: 'page difficulty' },
    topBar('Elige el reto', { back: () => go('home'), right: editChip }),
    h('div', { class: 'page-body difficulty-body' },
      h('p', { class: 'page-lead', text: profile ? `¿Qué quieres practicar hoy, ${profile.name}?` : '' }),
      modePicker(),
      h('div', { class: 'level-list' }, ...cards),
    ),
  );

  return { el };
}

/** Selector "1 Jugador / 2 Jugadores" con el control segmentado del diseño. */
function modePicker(): HTMLElement {
  const options = [
    { value: 1 as const, label: '👤 1 Jugador' },
    { value: 2 as const, label: '👥 2 Jugadores' },
  ];
  const wrap = h('div', { class: 'segmented mode-picker', attrs: { role: 'radiogroup', 'aria-label': 'Jugadores' } });
  const hint = h('p', { class: 'mode-hint muted' });
  const render = () => {
    wrap.querySelectorAll('.segment').forEach((b, i) => {
      const on = options[i].value === players;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', String(on));
    });
    hint.textContent = players === 2
      ? 'Dos jugadores en el mismo teclado: J1 usa W / S / D y J2 las flechas ↑ ↓ →'
      : 'Juega tú solo a tu ritmo';
  };
  options.forEach((o) => wrap.append(h('button', {
    class: 'segment',
    text: o.label,
    attrs: { type: 'button', role: 'radio' },
    on: { click: () => { sfx.tap(); players = o.value; render(); } },
  })));
  render();
  return h('div', { class: 'mode-box' }, wrap, hint);
}
