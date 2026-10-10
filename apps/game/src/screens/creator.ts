import {
  ACCESSORIES, avatarSVG, HAIR_COLORS, HAIR_STYLES, randomLook, SHIRTS, SKINS, type Look,
} from '../art/avatar';
import { h } from '../core/dom';
import { icons } from '../core/icons';
import { go, type Screen } from '../core/router';
import { sfx } from '../core/sound';
import { store } from '../core/store';
import { button, iconButton, topBar } from '../core/ui';

type Tab = { id: keyof Look; label: string; kind: 'color' | 'preview'; values: readonly string[] };

const TABS: Tab[] = [
  { id: 'skin', label: 'Piel', kind: 'color', values: SKINS },
  { id: 'hair', label: 'Peinado', kind: 'preview', values: HAIR_STYLES },
  { id: 'hairColor', label: 'Color', kind: 'color', values: HAIR_COLORS },
  { id: 'shirt', label: 'Ropa', kind: 'color', values: SHIRTS },
  { id: 'accessory', label: 'Extra', kind: 'preview', values: ACCESSORIES },
];

const NAMES = ['Luna', 'Mateo', 'Sofía', 'Leo', 'Valen', 'Sam', 'Emma', 'Tomás', 'Mía', 'Nico'];

export function creatorScreen(): Screen {
  const profile = store.workingProfile();
  let activeTab = 0;
  let smileTimer = 0;

  const preview = h('div', { class: 'creator-avatar', attrs: { 'data-expr': 'neutral' } });
  const renderPreview = () => { preview.innerHTML = avatarSVG(profile.look, 'live'); };

  const smile = () => {
    preview.dataset.expr = 'happy';
    preview.classList.remove('pop');
    void preview.offsetWidth;
    preview.classList.add('pop');
    clearTimeout(smileTimer);
    smileTimer = window.setTimeout(() => (preview.dataset.expr = 'neutral'), 900);
  };

  const nameInput = h('input', {
    class: 'name-input',
    attrs: { type: 'text', maxlength: 12, placeholder: 'Escribe tu nombre', autocomplete: 'off', enterkeyhint: 'done', 'aria-label': 'Tu nombre' },
    on: {
      input: () => { profile.name = nameInput.value.trimStart(); },
      keydown: (e) => { if (e.key === 'Enter') nameInput.blur(); },
    },
  });
  nameInput.value = profile.name;

  const tabsEl = h('div', { class: 'segmented', attrs: { role: 'tablist' } });
  const grid = h('div', { class: 'option-grid', attrs: { role: 'tabpanel' } });

  const renderTabs = () => {
    tabsEl.replaceChildren(...TABS.map((t, i) => h('button', {
      class: `segment ${i === activeTab ? 'active' : ''}`,
      text: t.label,
      attrs: { type: 'button', role: 'tab', 'aria-selected': String(i === activeTab) },
      on: { click: () => { sfx.tap(); activeTab = i; renderTabs(); renderGrid(); } },
    })));
  };

  const renderGrid = () => {
    const tab = TABS[activeTab];
    grid.className = `option-grid ${tab.kind === 'color' ? 'grid-colors' : 'grid-previews'}`;
    grid.replaceChildren(...tab.values.map((value, i) => {
      const selected = profile.look[tab.id] === i;
      const content = tab.kind === 'color'
        ? h('span', { class: 'swatch', style: { background: value } })
        : h('span', { class: 'option-preview', html: avatarSVG({ ...profile.look, [tab.id]: i }, 'neutral') });
      const btn = h('button', {
        class: `option ${selected ? 'selected' : ''}`,
        attrs: { type: 'button', 'aria-pressed': String(selected), 'aria-label': tab.kind === 'color' ? `${tab.label} ${i + 1}` : value },
        on: {
          click: () => {
            sfx.tap();
            profile.look[tab.id] = i;
            renderPreview();
            renderGrid();
            smile();
          },
        },
      }, content);
      if (tab.kind === 'preview') btn.append(h('span', { class: 'option-label', text: value }));
      return btn;
    }));
  };

  const randomize = () => {
    profile.look = randomLook();
    if (!profile.name) {
      profile.name = NAMES[Math.floor(Math.random() * NAMES.length)];
      nameInput.value = profile.name;
    }
    renderPreview();
    renderGrid();
    smile();
  };

  renderPreview();
  renderTabs();
  renderGrid();

  const next = () => {
    profile.name = profile.name.trim() || 'Piloto';
    go('garage');
  };

  const el = h('section', { class: 'page creator' },
    topBar('Tu personaje', {
      back: () => { store.draft = null; go('home'); },
      right: iconButton(icons.dice, 'Personaje aleatorio', randomize),
    }),
    h('div', { class: 'page-body creator-body' },
      h('div', { class: 'card creator-preview' },
        h('div', { class: 'preview-glow' }),
        preview,
        h('label', { class: 'field' }, h('span', { class: 'field-label', text: '¿Cómo te llamas?' }), nameInput),
      ),
      h('div', { class: 'card creator-options' }, tabsEl, grid),
    ),
    h('footer', { class: 'page-footer' }, button('Elegir vehículo', next, 'primary', icons.next)),
  );

  return { el, destroy: () => clearTimeout(smileTimer) };
}
