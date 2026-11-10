// Modo 2 jugadores en el mismo computador: pantalla dividida, cada jugador
// con su propia pista, pregunta y burbujas. Reutiliza los mismos estilos y
// animaciones que la pantalla de 1 jugador (game.ts), que no se modifica.
import { avatarSVG, DEFAULT_LOOK, type Expression, type Look } from '../art/avatar';
import { CLOUD } from '../art/scenery';
import { VEHICLES, vehicleSVG } from '../art/vehicles';
import { h, pick, prefersReducedMotion } from '../core/dom';
import { icons } from '../core/icons';
import { DIFFICULTIES, makeQuestion, targetForLevel, travelSeconds, type Difficulty, type Question } from '../core/math';
import { go, type Screen } from '../core/router';
import { sfx, vibrate } from '../core/sound';
import { store } from '../core/store';
import { button, iconButton, sheet } from '../core/ui';

export interface Racer {
  id: 1 | 2;
  name: string;
  look: Look;
  vehicleId: string;
}

/** Aspecto fijo del Jugador 2 (distinto al personaje guardado). */
const P2_LOOK: Look = { skin: 3, hair: 4, hairColor: 0, shirt: 1, accessory: 2 };

/** Jugador 1 = personaje guardado; Jugador 2 = personaje invitado con otro vehículo. */
export function versusRacers(): [Racer, Racer] {
  const p = store.profile;
  const p1: Racer = { id: 1, name: p?.name || 'Jugador 1', look: p?.look ?? DEFAULT_LOOK, vehicleId: p?.vehicleId ?? 'rayo' };
  const v2 = VEHICLES.find((v) => v.id === 'kart' && v.id !== p1.vehicleId) ?? VEHICLES.find((v) => v.id !== p1.vehicleId)!;
  const p2: Racer = { id: 2, name: 'Jugador 2', look: P2_LOOK, vehicleId: v2.id };
  return [p1, p2];
}

/** Teclas de cada jugador (KeyboardEvent.code). */
const KEYS = {
  1: { up: ['KeyW'], down: ['KeyS'], go: ['KeyD'] },
  2: { up: ['ArrowUp'], down: ['ArrowDown'], go: ['ArrowRight'] },
} as const;

type Match = 'intro' | 'running' | 'levelup';
type RunState = 'idle' | 'running' | 'resolving';

interface Gate {
  el: HTMLElement;
  value: number;
  lane: number;
  p: number;
  frozen: boolean;
}

const CHEERS = ['¡Genial', '¡Excelente', '¡Muy bien', '¡Eso es', '¡Súper'];
const OOPS = ['¡Casi', '¡Uy, casi', '¡Sigue intentando'];

export function versusScreen(params?: Record<string, unknown>): Screen {
  const difficulty = (params?.difficulty as Difficulty) ?? 'facil';
  const reduced = prefersReducedMotion();
  const racers = versusRacers();

  // ---------- Estado global de la partida ----------
  let match: Match = 'intro';
  let paused = false;
  let level = 1;
  let gameTime = 0;
  let lastFrame = 0;
  let raf = 0;
  const wins = [0, 0];
  const timers: { at: number; fn: () => void }[] = [];
  const later = (ms: number, fn: () => void) => timers.push({ at: gameTime + ms / 1000, fn });

  const overlay = h('div', { class: 'countdown' });
  const arena = h('div', { class: 'versus-arena' });

  // ---------- Un "corredor" por jugador ----------
  function createRunner(racer: Racer) {
    let state: RunState = 'idle';
    let lane = 1;
    let question: Question | null = null;
    let gates: Gate[] = [];
    let boost = 1;
    let boostTarget = 1;
    let scroll = 0;
    let correct = 0;
    let score = 0;
    let streak = 0;
    let exprTimer: { at: number } | null = null;
    const m = { w: 0, h: 0, laneH: 0, vehW: 0, vehH: 0, vehX: 0, hitX: 0, gate: 0, spawnX: 0 };

    const tag = `J${racer.id}`;
    const chipAvatar = h('div', { class: 'hud-avatar', html: avatarSVG(racer.look, 'live'), attrs: { 'data-expr': 'neutral' } });
    const scoreEl = h('span', { class: 'hud-score-value', text: '0' });
    const winsEl = h('span', { class: 'versus-wins' });
    const chip = h('div', { class: `hud-player glass versus-chip racer-p${racer.id}` },
      chipAvatar,
      h('span', { class: 'hud-name', text: racer.name }),
      h('span', { class: 'versus-points' }, h('span', { class: 'hud-star', html: icons.star }), scoreEl),
      winsEl,
    );

    const levelLabel = h('span', { class: 'q-label' });
    const qText = h('span', { class: 'q-text' });
    const qAnswer = h('span', { class: 'q-answer', text: '?' });
    const progress = h('div', { class: 'progress', attrs: { role: 'progressbar', 'aria-valuemin': 0 } });

    const player = h('div', { class: 'player', attrs: { 'data-expr': 'neutral' } },
      h('div', { class: 'player-tilt', html: vehicleSVG(racer.vehicleId, racer.look, 'live') }),
      h('span', { class: 'racer-tag', text: tag }),
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

    const track = h('div', { class: 'track' },
      h('div', { class: 'sky' },
        h('div', { class: 'cloud c1', html: CLOUD }),
        h('div', { class: 'cloud c2', html: CLOUD }),
      ),
      hills, trees, road, flowers, cheer, flash,
    );

    const col = h('div', { class: `versus-col racer-p${racer.id}` },
      h('div', { class: 'question card' },
        levelLabel,
        h('div', { class: 'q-line', attrs: { 'aria-live': 'polite' } }, qText, h('span', { class: 'q-eq', text: '=' }), qAnswer),
        progress,
      ),
      track,
    );

    // ----- Medidas (idénticas a game.ts) -----
    function layout() {
      const r = road.getBoundingClientRect();
      m.w = r.width;
      m.h = r.height;
      m.laneH = m.h / 3;
      m.vehW = Math.min(m.laneH * 1.75, m.w * 0.42);
      m.vehH = (m.vehW * 130) / 220;
      m.vehX = Math.max(8, m.w * 0.03);
      m.hitX = m.vehX + m.vehW * 0.9;
      m.gate = Math.min(m.laneH * 0.74, 96, (m.w - m.hitX) * 0.4);
      m.spawnX = m.w + m.gate;
      col.style.setProperty('--gate', `${m.gate}px`);
      col.style.setProperty('--lane-h', `${m.laneH}px`);
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
      chipAvatar.dataset.expr = expr;
      exprTimer = expr === 'neutral' ? null : { at: gameTime + ms / 1000 };
    }

    function bump(node: HTMLElement, cls = 'bump') {
      node.classList.remove(cls);
      void node.offsetWidth;
      node.classList.add(cls);
    }

    function burst(x: number, y: number, count = 14) {
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

    function render() {
      const target = targetForLevel(level);
      progress.setAttribute('aria-valuemax', String(target));
      progress.setAttribute('aria-valuenow', String(correct));
      progress.replaceChildren(...Array.from({ length: target }, (_, i) => h('i', { class: i < correct ? 'on' : '' })));
      levelLabel.textContent = `${tag} · Nivel ${level} · ${DIFFICULTIES[difficulty].label}`;
      scoreEl.textContent = String(score);
      winsEl.textContent = wins[racer.id - 1] ? `🏆 ${wins[racer.id - 1]}` : '';
    }

    function clearGates() {
      gates.forEach((g) => g.el.remove());
      gates = [];
    }

    function reset() {
      clearGates();
      state = 'idle';
      correct = 0;
      lane = 1;
      placePlayer();
      qText.textContent = '';
      qAnswer.textContent = '?';
      qAnswer.className = 'q-answer';
      setExpr('neutral');
      render();
    }

    function nextQuestion() {
      if (match !== 'running') return;
      clearGates();
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
      if (state !== 'running') return;
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
    }

    function resolve() {
      if (!question) return;
      state = 'resolving';
      const chosen = gates.find((g) => g.lane === lane)!;
      const right = gates.find((g) => g.value === question!.answer)!;
      const ok = chosen.value === question.answer;
      // Solo el Jugador 1 es el dueño del perfil guardado
      if (racer.id === 1) store.recordAnswer(ok);

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
        qAnswer.className = 'q-answer good';
      } else {
        streak = 0;
        chosen.el.classList.add('wrong');
        right.el.classList.add('reveal');
        setExpr('oops', 1500);
        if (!reduced) bump(track, 'shake'); // Solo tiembla la pista de este jugador
        bump(flash, 'on');
        sfx.wrong();
        vibrate(120);
        qAnswer.className = 'q-answer bad';
      }
      qAnswer.textContent = String(question.answer);
      gates.forEach((g) => { if (g !== chosen && g !== right) g.el.classList.add('pass'); });

      const msg = ok ? `${pick(CHEERS)}, ${racer.name}!` : `${pick(OOPS)}! Era ${question.answer}`;
      cheer.className = `cheer ${ok ? 'good' : 'bad'}`;
      cheer.replaceChildren(
        h('div', { class: 'cheer-avatar', html: avatarSVG(racer.look, ok ? 'happy' : 'oops') }),
        h('div', { class: 'cheer-text' }, h('strong', { text: msg }), h('span', { text: ok ? `${correct}/${targetForLevel(level)} aciertos` : '¡Tú puedes!' })),
      );
      bump(cheer, 'show');
      render();
      bump(scoreEl);

      later(1250, () => {
        if (match !== 'running') return;
        clearGates();
        if (correct >= targetForLevel(level)) declareWinner(runner);
        else nextQuestion();
      });
    }

    /** Avanza un fotograma. */
    function step(dt: number) {
      if (exprTimer && exprTimer.at <= gameTime) setExpr('neutral');
      boost += (boostTarget - boost) * Math.min(1, dt * 6);
      const travel = travelSeconds(difficulty, level);
      const pxPerSec = (m.spawnX - m.hitX) / travel;
      const v = match === 'levelup' ? pxPerSec * 0.6 : pxPerSec * (state === 'running' ? boost : 1);

      scroll += v * dt;
      lines.forEach((l) => (l.style.backgroundPositionX = `${-scroll}px`));
      flowers.style.backgroundPositionX = `${-scroll}px`;
      trees.style.backgroundPositionX = `${-scroll * 0.5}px`;
      hills.style.backgroundPositionX = `${-scroll * 0.2}px`;

      if (state === 'running' || state === 'resolving') {
        const s = (dt / travel) * (state === 'running' ? boost : 1);
        for (const g of gates) {
          if (g.frozen) continue;
          g.p += s;
          placeGate(g);
        }
        if (state === 'running' && gates.length && gates[0].p >= 1) resolve();
      }
    }

    // ----- Toque / deslizar dentro de SU pista -----
    let startY = 0, startX = 0, startT = 0;
    track.addEventListener('pointerdown', (e) => {
      startX = e.clientX; startY = e.clientY; startT = performance.now();
      const gateEl = (e.target as HTMLElement).closest<HTMLElement>('.gate');
      if (gateEl && state === 'running') {
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
        const r = road.getBoundingClientRect();
        const l = Math.floor(((e.clientY - r.top) / r.height) * 3);
        if (l >= 0 && l <= 2) moveTo(l);
      }
    });

    const runner = {
      racer, col, chip, road,
      layout, reset, nextQuestion, step, render, clearGates,
      up: () => moveTo(lane - 1),
      down: () => moveTo(lane + 1),
      go: () => choose(lane),
      stop: () => { clearGates(); state = 'idle'; },
      get score() { return score; },
      get correct() { return correct; },
      celebrate: (expr: Expression) => setExpr(expr, 99999),
    };
    return runner;
  }

  type Runner = ReturnType<typeof createRunner>;
  const runners = racers.map(createRunner);
  arena.append(runners[0].col, runners[1].col, overlay);

  // ---------- Flujo ----------
  function startLevel() {
    match = 'intro';
    runners.forEach((r) => r.reset());
    const steps = ['3', '2', '1', '¡Ya!'];
    overlay.classList.add('on');
    steps.forEach((s, i) => later(i * 650, () => {
      overlay.replaceChildren(h('span', { text: s, class: i === steps.length - 1 ? 'go' : '' }));
      if (i < steps.length - 1) sfx.move(); else sfx.tap();
    }));
    later(steps.length * 650, () => {
      overlay.classList.remove('on');
      overlay.replaceChildren();
      match = 'running';
      runners.forEach((r) => r.nextQuestion());
    });
  }

  function declareWinner(winner: Runner) {
    if (match !== 'running') return;
    match = 'levelup';
    runners.forEach((r) => r.stop());
    wins[winner.racer.id - 1]++;
    runners.forEach((r) => { r.render(); r.celebrate(r === winner ? 'happy' : 'oops'); });
    sfx.levelUp();

    const loser = runners.find((r) => r !== winner)!;
    const content = h('div', { class: 'levelup' },
      h('div', { class: 'levelup-art' },
        h('div', { class: 'confetti-ring' }),
        h('div', { class: 'levelup-car', html: vehicleSVG(winner.racer.vehicleId, winner.racer.look, 'happy') }),
      ),
      h('h2', { text: `¡Gana ${winner.racer.name}!` }),
      h('p', { class: 'muted', text: `Fue el primero en lograr ${targetForLevel(level)} aciertos en el nivel ${level}.` }),
      h('div', { class: 'stat-grid versus-stats' },
        ...runners.map((r) => h('div', { class: `racer-p${r.racer.id}` },
          h('strong', { text: `🏆 ${wins[r.racer.id - 1]}` }),
          h('span', { text: `${r.racer.name} · ${r.score} pts` }),
        )),
      ),
      h('p', { class: 'muted', text: `¡Buen intento, ${loser.racer.name}! La próxima es tuya.` }),
      h('div', { class: 'sheet-actions' },
        button('Siguiente nivel', () => { s.close(); level++; startLevel(); }, 'primary', icons.next),
        button('Menú', () => { s.close(); go('home'); }, 'secondary', icons.home),
      ),
    );
    const s = sheet(content);
  }

  let pauseSheet: ReturnType<typeof sheet> | null = null;
  function openPause() {
    if (paused || match === 'levelup') return;
    paused = true;
    el.classList.add('paused');
    const content = h('div', { class: 'pause' },
      h('h2', { text: 'Pausa' }),
      h('p', { class: 'muted', text: `Nivel ${level} · ${racers[0].name} ${runners[0].correct} – ${runners[1].correct} ${racers[1].name}` }),
      h('div', { class: 'sheet-actions' },
        button('Continuar', () => pauseSheet?.close(), 'primary', icons.play),
        button('Reiniciar nivel', () => {
          pauseSheet?.close();
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
    for (let i = timers.length - 1; i >= 0; i--) {
      if (timers[i].at <= gameTime) timers.splice(i, 1)[0].fn();
    }
    runners.forEach((r) => r.step(dt));
  }

  // ---------- Teclado compartido ----------
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { if (pauseSheet) pauseSheet.close(); else openPause(); return; }
    if (paused || match !== 'running') return;
    for (const r of runners) {
      const k = KEYS[r.racer.id];
      if ((k.up as readonly string[]).includes(e.code)) r.up();
      else if ((k.down as readonly string[]).includes(e.code)) r.down();
      else if ((k.go as readonly string[]).includes(e.code)) r.go();
      else continue;
      e.preventDefault();
      return;
    }
  };

  const onVisibility = () => { if (document.hidden) openPause(); };
  const ro = new ResizeObserver(() => runners.forEach((r) => r.layout()));

  const el = h('section', { class: 'game versus' },
    h('header', { class: 'hud' },
      iconButton(icons.pause, 'Pausa', () => openPause(), 'glass'),
      runners[0].chip,
      h('span', { class: 'versus-vs', text: 'VS' }),
      runners[1].chip,
    ),
    arena,
  );

  return {
    el,
    mount() {
      runners.forEach((r) => { r.layout(); ro.observe(r.road); });
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
