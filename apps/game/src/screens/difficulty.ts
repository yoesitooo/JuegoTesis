import { avatarSVG } from '../art/avatar';
import { h } from '../core/dom';
import { icons } from '../core/icons';
import { DIFFICULTIES, type Difficulty } from '../core/math';
import { go, type Screen } from '../core/router';
import { sfx } from '../core/sound';
import { store } from '../core/store';
import { topBar } from '../core/ui';

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
      on: { click: () => { sfx.tap(); go('game', { difficulty: id }); } },
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
      h('div', { class: 'level-list' }, ...cards),
    ),
  );

  return { el };
}
