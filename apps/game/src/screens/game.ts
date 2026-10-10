import { avatarSVG, type Expression } from '../art/avatar';
import { CLOUD } from '../art/scenery';
import { vehicleSVG } from '../art/vehicles';
import { h, pick, prefersReducedMotion } from '../core/dom';
import { icons } from '../core/icons';
import {
  DIFFICULTIES, makeQuestion, starsFor, targetForLevel, travelSeconds, type Difficulty, type Question,
} from '../core/math';
import { go, type Screen } from '../core/router';
import { sfx, vibrate } from '../core/sound';
import { store } from '../core/store';
import { button, iconButton, sheet } from '../core/ui';

type State = 'intro' | 'running' | 'resolving' | 'levelup';

interface Gate {
  el: HTMLElement;
  value: number;
  lane: number;
  p: number;        // progreso 0 → 1 (1 = llega al vehículo)
  frozen: boolean;  // se queda quieta (respuesta recogida)
}

const CHEERS = ['¡Genial', '¡Excelente', '¡Muy bien', '¡Increíble', '¡Eso es', '¡Súper'];
const OOPS = ['¡Casi', '¡Uy, casi', '¡Sigue intentando'];

export function gameScreen(params?: Record<string, unknown>): Screen {
  const profile = store.profile!;
  const difficulty = (params?.difficulty as Difficulty) ?? 'facil';
  const reduced = prefersReducedMotion();

  // ---------- Estado ----------
  let state: State = 'intro';
  let paused = false;
  let level = 1;
  let correct = 0;
  let mistakes = 0;
  let score = 0;
  let streak = 0;
  let lane = 1;
  let question: Question | null = null;
  let gates: Gate[] = [];
  let boost = 1;
  let boostTarget = 1;
  let gameTime = 0;
  let lastFrame = 0;
  let raf = 0;
  let scroll = 0;
  let firstAnswerDone = false;
  let exprTimer: { at: number } | null = null;
  const timers: { at: number; fn: () => void }[] = [];
  const later = (ms: number, fn: () => void) => timers.push({ at: gameTime + ms / 1000, fn });

  // ---------- Medidas (responsive) ----------
  const m = { w: 0, h: 0, laneH: 0, vehW: 0, vehH: 0, vehX: 0, hitX: 0, gate: 0, spawnX: 0 };

  // ---------- DOM ----------
  const hudAvatar = h('div', { class: 'hud-avatar', html: avatarSVG(profile.look, 'live'), attrs: { 'data-expr': 'neutral' } });
  const scoreEl = h('span', { class: 'hud-score-value', text: '0' });
  const streakEl = h('span', { class: 'hud-streak' });
  const levelLabel = h('span', { class: 'q-label' });
  const qText = h('span', { class: 'q-text' });
  const qAnswer = h('span', { class: 'q-answer', text: '?' });
  const progress = h('div', { class: 'progress', attrs: { role: 'progressbar', 'aria-valuemin': 0 } });

  const player = h('div', { class: 'player', attrs: { 'data-expr': 'neutral' } },
    h('div', { class: 'player-tilt', html: vehicleSVG(profile.vehicleId, profile.look, 'live') }),
  );
  const road = h('div', { class: 'road' },
    h('div', { class: 'road-edge top' }),
    h('div', { class: 'lane-line l1' }),
    h('div', { class: 'lane-line l2' }),
    h('div', { class: 'lane-glow' }),
    h('div', { class: 'road-edge bottom' }),
    player,
  );
  const hills = h('div', { class: 'layer hills' });
  const trees = h('div', { class: 'layer trees' });
  const flowers = h('div', { class: 'layer flowers' });
  const laneGlow = road.querySelector<HTMLElement>('.lane-glow')!;
  const lines = [...road.querySelectorAll<HTMLElement>('.lane-line')];
  const cheer = h('div', { class: 'cheer', attrs: { 'aria-live': 'polite' } });
  const flash = h('div', { class: 'flash' });
  const overlay = h('div', { class: 'countdown' });
  const hint = h('div', { class: 'hint', text: 'Toca la burbuja con la respuesta correcta' });

  const track = h('div', { class: 'track' },
    h('div', { class: 'sky' },
      h('div', { class: 'cloud c1', html: CLOUD }),
      h('div', { class: 'cloud c2', html: CLOUD }),
      h('div', { class: 'cloud c3', html: CLOUD }),
    ),
    hills, trees, road, flowers, cheer, flash, overlay, hint,
  );

  const el = h('section', { class: 'game' },
    h('header', { class: 'hud' },
      iconButton(icons.pause, 'Pausa', () => openPause(), 'glass'),
      h('div', { class: 'hud-player glass' }, hudAvatar, h('span', { class: 'hud-name', text: profile.name })),
      h('div', { class: 'hud-score glass' }, h('span', { class: 'hud-star', html: icons.star }), scoreEl, streakEl),
    ),
    h('div', { class: 'question card' },
      levelLabel,
      h('div', { class: 'q-line', attrs: { 'aria-live': 'polite' } }, qText, h('span', { class: 'q-eq', text: '=' }), qAnswer),
      progress,
    ),
    track,
  );

  // ---------- Helpers visuales ----------
  function layout() {
    const r = road.getBoundingClientRect();
    m.w = r.width;
    m.h = r.height;
    m.laneH = m.h / 3;
    m.vehW = Math.min(m.laneH * 1.75, m.w * 0.42);
    m.vehH = (m.vehW * 130) / 220;
    m.vehX = Math.max(8, m.w * 0.03);
    m.hitX = m.vehX + m.vehW * 0.9;
    m.gate = Math.min(m.laneH * 0.74, 104, (m.w - m.hitX) * 0.4);
    m.spawnX = m.w + m.gate;
    el.style.setProperty('--gate', `${m.gate}px`);
    el.style.setProperty('--lane-h', `${m.laneH}px`);
    player.style.width = `${m.vehW}px`;
    player.style.height = `${m.vehH}px`;
    placePlayer();
    gates.forEach(placeGate);
  }

  const laneCenter = (l: number) => m.laneH * (l + 0.5);

  function placePlayer() {
    const y = laneCenter(lane) - m.vehH * 0.6;
    player.style.transform = `translate3d(${m.vehX}px, ${y}px, 0)`;
    laneGlow.style.transform = `translate3d(0, ${m.laneH * lane}px, 0)`;
  }

  function placeGate(g: Gate) {
    const x = m.spawnX - g.p * (m.spawnX - m.hitX) - m.gate / 2;
    g.el.style.transform = `translate3d(${x}px, ${laneCenter(g.lane) - m.gate / 2}px, 0)`;
  }

  function setExpr(expr: Expression, ms = 1300) {
    player.dataset.expr = expr;
    hudAvatar.dataset.expr = expr;
    exprTimer = expr === 'neutral' ? null : { at: gameTime + ms / 1000 };
  }

  function renderProgress() {
    const target = targetForLevel(level);
    progress.setAttribute('aria-valuemax', String(target));
    progress.setAttribute('aria-valuenow', String(correct));
    progress.replaceChildren(...Array.from({ length: target }, (_, i) => h('i', { class: i < correct ? 'on' : '' })));
  }

  function renderHud() {
    scoreEl.textContent = String(score);
    streakEl.textContent = streak >= 3 ? `Racha ×${streak}` : '';
    streakEl.classList.toggle('show', streak >= 3);
    levelLabel.textContent = `Nivel ${level} · ${DIFFICULTIES[difficulty].label}`;
  }

  function bump(node: HTMLElement, cls = 'bump') {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  function burst(x: number, y: number, count = 16) {
    if (reduced) count = 6;
    const colors = ['#FFCC00', '#34C759', '#007AFF', '#FF2D55', '#AF52DE', '#FF9500'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 40 + Math.random() * 60;
      const p = h('i', {
        class: `particle ${i % 3 === 0 ? 'star' : ''}`,
        style: {
          left: `${x}px`, top: `${y}px`, background: pick(colors),
          '--dx': `${Math.cos(angle) * dist}px`, '--dy': `${Math.sin(angle) * dist}px`, '--rot': `${Math.random() * 360}deg`,
        },
      });
      p.addEventListener('animationend', () => p.remove());
      road.append(p);
    }
  }

  function showCheer(ok: boolean, answer: number) {
    const msg = ok ? `${pick(CHEERS)}, ${profile.name}!` : `${pick(OOPS)}! Era ${answer}`;
    cheer.className = `cheer ${ok ? 'good' : 'bad'}`;
    cheer.replaceChildren(
      h('div', { class: 'cheer-avatar', html: avatarSVG(profile.look, ok ? 'happy' : 'oops') }),
      h('div', { class: 'cheer-text' }, h('strong', { text: msg }), ok ? h('span', { text: `+${10 + (streak >= 3 ? 5 : 0)} puntos` }) : h('span', { text: '¡Tú puedes!' })),
    );
    bump(cheer, 'show');
  }

  // ---------- Flujo del juego ----------
  function startLevel() {
    correct = 0;
    mistakes = 0;
    state = 'intro';
    renderProgress();
    renderHud();
    qText.textContent = '';
    qAnswer.textContent = '?';
    qAnswer.className = 'q-answer';
    const steps = ['3', '2', '1', '¡Ya!'];
    overlay.classList.add('on');
    steps.forEach((s, i) => later(i * 650, () => {
      overlay.replaceChildren(h('span', { text: s, class: i === steps.length - 1 ? 'go' : '' }));
      if (i < steps.length - 1) sfx.move(); else sfx.tap();
    }));
    later(steps.length * 650, () => {
      overlay.classList.remove('on');
      overlay.replaceChildren();
      nextQuestion();
    });
  }

  function nextQuestion() {
    gates.forEach((g) => g.el.remove());
    question = makeQuestion(difficulty, level, Math.random, question?.text);
    qText.textContent = question.text;
    qAnswer.textContent = '?';
    qAnswer.className = 'q-answer';
    bump(qText.parentElement!, 'q-new');
    boost = boostTarget = 1;
    gates = question.options.map((value, laneIdx) => {
      const gEl = h('div', {
        class: 'gate',
        attrs: { role: 'button', 'aria-label': `Respuesta ${value}`, 'data-lane': laneIdx },
      }, h('span', { text: String(value) }));
      road.append(gEl);
      const g: Gate = { el: gEl, value, lane: laneIdx, p: 0, frozen: false };
      placeGate(g);
      return g;
    });
    state = 'running';
  }

  function moveTo(target: number) {
    target = Math.max(0, Math.min(2, target));
    if (target === lane) return;
    const dir = target > lane ? 'down' : 'up';
    lane = target;
    sfx.move();
    placePlayer();
    player.classList.remove('tilt-up', 'tilt-down');
    void player.offsetWidth;
    player.classList.add(`tilt-${dir}`);
  }

  function choose(target: number) {
    if (state !== 'running') return;
    moveTo(target);
    boostTarget = 3.2;
    if (!firstAnswerDone) {
      firstAnswerDone = true;
      hint.classList.add('hide');
    }
  }

  function resolve() {
    if (!question) return;
    state = 'resolving';
    const chosen = gates.find((g) => g.lane === lane)!;
    const right = gates.find((g) => g.value === question!.answer)!;
    const ok = chosen.value === question.answer;
    store.recordAnswer(ok);

    if (ok) {
      correct++;
      streak++;
      score += 10 + (streak >= 3 ? 5 : 0);
      chosen.frozen = true;
      chosen.el.classList.add('collected');
      burst(m.hitX + m.gate * 0.2, laneCenter(lane));
      setExpr('happy', 1500);
      bump(player, 'hop');
      sfx.correct();
      qAnswer.textContent = String(question.answer);
      qAnswer.className = 'q-answer good';
    } else {
      mistakes++;
      streak = 0;
      chosen.el.classList.add('wrong');
      right.el.classList.add('reveal');
      setExpr('oops', 1500);
      if (!reduced) bump(track, 'shake');
      bump(flash, 'on');
      sfx.wrong();
      vibrate(120);
      qAnswer.textContent = String(question.answer);
      qAnswer.className = 'q-answer bad';
    }
    gates.forEach((g) => { if (g !== chosen && g !== right) g.el.classList.add('pass'); });
    showCheer(ok, question.answer);
    renderHud();
    renderProgress();
    bump(scoreEl);

    later(1250, () => {
      gates.forEach((g) => g.el.remove());
      gates = [];
      if (correct >= targetForLevel(level)) levelComplete();
      else nextQuestion();
    });
  }

  function levelComplete() {
    state = 'levelup';
    const stars = starsFor(mistakes);
    store.recordLevel({ name: profile.name, difficulty, level, correct, mistakes, score });
    sfx.levelUp();
    setExpr('happy', 99999);

    const starRow = h('div', { class: 'stars' }, ...[0, 1, 2].map((i) => h('span', {
      class: `big-star ${i < stars ? 'on' : ''}`, html: icons.star, style: { animationDelay: `${0.25 + i * 0.18}s` },
    })));
    const content = h('div', { class: 'levelup' },
      h('div', { class: 'levelup-art', attrs: { 'data-expr': 'happy' } },
        h('div', { class: 'confetti-ring' }),
        h('div', { class: 'levelup-car', html: vehicleSVG(profile.vehicleId, profile.look, 'happy') }),
      ),
      h('h2', { text: `¡Nivel ${level} superado!` }),
      h('p', { class: 'muted', text: stars === 3 ? `¡Perfecto, ${profile.name}! Sin errores.` : `¡Muy bien, ${profile.name}! Sigue así.` }),
      starRow,
      h('div', { class: 'stat-grid' },
        h('div', {}, h('strong', { text: String(correct) }), h('span', { text: 'Aciertos' })),
        h('div', {}, h('strong', { text: String(mistakes) }), h('span', { text: 'Errores' })),
        h('div', {}, h('strong', { text: String(score) }), h('span', { text: 'Puntos' })),
      ),
      h('div', { class: 'sheet-actions' },
        button('Siguiente nivel', () => { s.close(); level++; setExpr('neutral'); startLevel(); }, 'primary', icons.next),
        button('Menú', () => { s.close(); go('home'); }, 'secondary', icons.home),
      ),
    );
    const s = sheet(content);
  }

  let pauseSheet: ReturnType<typeof sheet> | null = null;
  function openPause() {
    if (paused || state === 'levelup') return;
    paused = true;
    el.classList.add('paused');
    const content = h('div', { class: 'pause' },
      h('div', { class: 'pause-avatar', html: avatarSVG(profile.look, 'neutral') }),
      h('h2', { text: 'Pausa' }),
      h('p', { class: 'muted', text: `Nivel ${level} · ${correct}/${targetForLevel(level)} aciertos` }),
      h('div', { class: 'sheet-actions' },
        button('Continuar', () => pauseSheet?.close(), 'primary', icons.play),
        button('Reiniciar nivel', () => {
          pauseSheet?.close();
          gates.forEach((g) => g.el.remove());
          gates = [];
          timers.length = 0;
          startLevel();
        }, 'secondary', icons.refresh),
        button('Salir al menú', () => { pauseSheet?.close(); go('home'); }, 'ghost', icons.home),
      ),
    );
    pauseSheet = sheet(content, { dismissable: true, onClose: resume });
  }

  function resume() {
    pauseSheet = null;
    paused = false;
    el.classList.remove('paused');
    lastFrame = performance.now();
  }

  // ---------- Bucle principal ----------
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    if (paused) return;
    gameTime += dt;

    // Temporizadores del juego (se detienen en pausa)
    for (let i = timers.length - 1; i >= 0; i--) {
      if (timers[i].at <= gameTime) timers.splice(i, 1)[0].fn();
    }
    if (exprTimer && exprTimer.at <= gameTime) setExpr('neutral');

    boost += (boostTarget - boost) * Math.min(1, dt * 6);
    const travel = travelSeconds(difficulty, level);
    const pxPerSec = (m.spawnX - m.hitX) / travel;
    const v = state === 'levelup' ? pxPerSec * 0.6 : pxPerSec * (state === 'running' ? boost : 1);

    // Fondo con paralaje
    scroll += v * dt;
    lines.forEach((l) => (l.style.backgroundPositionX = `${-scroll}px`));
    flowers.style.backgroundPositionX = `${-scroll}px`;
    trees.style.backgroundPositionX = `${-scroll * 0.5}px`;
    hills.style.backgroundPositionX = `${-scroll * 0.2}px`;

    // Respuestas que se acercan
    if (state === 'running' || state === 'resolving') {
      const step = (dt / travel) * (state === 'running' ? boost : 1);
      for (const g of gates) {
        if (g.frozen) continue;
        g.p += step;
        placeGate(g);
      }
      if (state === 'running' && gates.length && gates[0].p >= 1) resolve();
    }
  }

  // ---------- Entrada (toque, deslizar, teclado) ----------
  let startY = 0, startX = 0, startT = 0;
  const laneFromY = (clientY: number) => {
    const r = road.getBoundingClientRect();
    return Math.floor(((clientY - r.top) / r.height) * 3);
  };

  track.addEventListener('pointerdown', (e) => {
    startX = e.clientX; startY = e.clientY; startT = performance.now();
    const gateEl = (e.target as HTMLElement).closest<HTMLElement>('.gate');
    if (gateEl && state === 'running') {
      // Tocar la burbuja = elegir esa respuesta al instante
      choose(Number(gateEl.dataset.lane));
      bump(gateEl, 'tapped');
      startT = 0;
    }
  });
  track.addEventListener('pointerup', (e) => {
    if (!startT || state !== 'running') return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dy) > 28 && Math.abs(dy) > Math.abs(dx)) {
      moveTo(lane + (dy > 0 ? 1 : -1));
    } else if (performance.now() - startT < 500) {
      const l = laneFromY(e.clientY);
      if (l >= 0 && l <= 2) moveTo(l);
    }
  });

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'p') { if (pauseSheet) pauseSheet.close(); else openPause(); return; }
    if (paused || state !== 'running') return;
    if (e.key === 'ArrowUp' || e.key === 'w') moveTo(lane - 1);
    else if (e.key === 'ArrowDown' || e.key === 's') moveTo(lane + 1);
    else if (e.key === '1' || e.key === '2' || e.key === '3') choose(Number(e.key) - 1);
    else if (e.key === ' ' || e.key === 'Enter') choose(lane);
    else return;
    e.preventDefault();
  };

  const onVisibility = () => { if (document.hidden) openPause(); };
  const ro = new ResizeObserver(() => layout());

  return {
    el,
    mount() {
      layout();
      ro.observe(road);
      window.addEventListener('keydown', onKey);
      document.addEventListener('visibilitychange', onVisibility);
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
      startLevel();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
