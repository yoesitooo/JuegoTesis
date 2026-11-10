import Phaser from 'phaser';
import { COLORS, GameState, PLAYER_COLORS } from './state';
import { generateQuestion, buildAnswerOptions, getTier } from './mathEngine';

// Aciertos necesarios para ganar un nivel en modo 2 jugadores
const VERSUS_TARGET = 5;

interface TrackOptions {
    id: 1 | 2;
    x: number;          // Borde izquierdo de la mitad de pantalla asignada
    width: number;      // Ancho de esa mitad
    carKey: string;     // Textura del carro
    speed: number;
    tier: number;
    onScore: (track: RaceTrack) => void;
}

/**
 * Una pista completa e independiente: carretera de 3 carriles, carro,
 * panel de pregunta, barra de progreso y nubes con respuestas.
 * Reproduce la misma estética y animaciones que GameScene, pero acotada
 * a una región de la pantalla para que dos jugadores no se interfieran.
 */
class RaceTrack {
    scene: Phaser.Scene;
    opts: TrackOptions;
    player!: Phaser.Physics.Arcade.Sprite;
    tag!: Phaser.GameObjects.Text;
    questionText!: Phaser.GameObjects.Text;
    progressBar!: Phaser.GameObjects.Rectangle;
    progressWidth!: number;
    obstaclesGroup!: Phaser.Physics.Arcade.Group;
    sceneryGroup!: Phaser.Physics.Arcade.Group;
    currentLane = 1;
    laneWidth!: number;
    roadX!: number;
    roadWidth!: number;
    correctAnswer = 0;
    lastQuestion = '';
    score = 0;
    active = true;
    resolving = false; // Evita contar dos colisiones de la misma pregunta

    constructor(scene: Phaser.Scene, opts: TrackOptions) {
        this.scene = scene;
        this.opts = opts;
        this.build();
    }

    get centerX() { return this.opts.x + this.opts.width / 2; }

    build() {
        const s = this.scene;
        const h = s.cameras.main.height;
        const { x, width, id } = this.opts;
        const color = PLAYER_COLORS[id];

        // --- CARRETERA (mismo estilo que el modo 1 jugador) ---
        this.roadWidth = width * 0.72;
        this.laneWidth = this.roadWidth / 3;
        this.roadX = x + (width - this.roadWidth) / 2;

        s.add.rectangle(this.centerX, h / 2, this.roadWidth, h, COLORS.road);
        for (let i = 0; i < 20; i++) {
            s.add.rectangle(this.roadX + this.laneWidth, i * (h / 10), 6, h / 20, COLORS.line);
            s.add.rectangle(this.roadX + (this.laneWidth * 2), i * (h / 10), 6, h / 20, COLORS.line);
        }

        this.sceneryGroup = s.physics.add.group();
        this.obstaclesGroup = s.physics.add.group();

        // --- CARRO ---
        const startX = this.laneX(1);
        this.player = s.physics.add.sprite(startX, h * 0.8, this.opts.carKey);
        this.player.setDisplaySize(this.laneWidth * 0.6, (this.laneWidth * 0.6) * 1.5);
        this.player.body?.setSize(80, 120);

        // Etiqueta "J1"/"J2" que sigue al carro
        this.tag = s.add.text(startX, h * 0.8 + this.player.displayHeight / 2 + 16, `J${id}`, {
            fontSize: '22px', color: '#fff', fontStyle: 'bold', stroke: color.css, strokeThickness: 6
        }).setOrigin(0.5);

        // --- PANEL SUPERIOR ---
        const panelWidth = Math.min(width * 0.9, 600);
        s.add.rectangle(this.centerX, 60, panelWidth, 100, COLORS.panel).setStrokeStyle(4, 0x000);

        const wins = GameState.versusWins[id - 1];
        s.add.text(this.centerX, 25, `Jugador ${id} · Nivel ${GameState.level}${wins ? ` · 🏆 ${wins}` : ''}`, {
            fontSize: '20px', color: color.css, fontStyle: 'bold'
        }).setOrigin(0.5);

        this.questionText = s.add.text(this.centerX, 70, '¿?', {
            fontSize: `${Math.min(56, Math.floor(panelWidth / 7))}px`, color: '#0f172a', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Barra de progreso
        this.progressWidth = Math.min(300, panelWidth * 0.7);
        s.add.rectangle(this.centerX, 130, this.progressWidth, 15, 0xe2e8f0).setStrokeStyle(2, 0x000);
        this.progressBar = s.add.rectangle(this.centerX - this.progressWidth / 2, 130, 0, 15, 0x22c55e).setOrigin(0, 0.5);

        s.physics.add.overlap(this.player, this.obstaclesGroup, ((_p: any, cloud: any) => this.handleCollision(cloud)) as any, undefined, this);
    }

    laneX(lane: number) {
        return this.roadX + (this.laneWidth * 0.5) + (lane * this.laneWidth);
    }

    movePlayer(dir: number) {
        if (!this.active) return;
        this.currentLane = Phaser.Math.Clamp(this.currentLane + dir, 0, 2);

        // Misma animación de giro que el modo 1 jugador
        this.scene.tweens.add({
            targets: this.player,
            x: this.laneX(this.currentLane),
            angle: Math.sign(dir) * 15,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({ targets: this.player, angle: 0, duration: 100 });
            }
        });
    }

    moveToLane(lane: number) {
        if (lane !== this.currentLane) this.movePlayer(lane - this.currentLane);
    }

    nextQuestion() {
        if (!this.active) return;
        this.resolving = false;

        const q = generateQuestion(this.opts.tier, this.lastQuestion);
        this.lastQuestion = q.text;
        this.correctAnswer = q.answer;
        this.questionText.setText(q.text);
        this.scene.tweens.add({ targets: this.questionText, scale: 1.3, yoyo: true, duration: 300 });

        const answers = buildAnswerOptions(q.answer, 3);
        const fontSize = Math.min(40, Math.floor(this.laneWidth * 0.28));

        for (let i = 0; i < 3; i++) {
            const laneX = this.laneX(i);
            const cloud = this.scene.physics.add.sprite(laneX, -100, 'cloud').setInteractive({ useHandCursor: true });
            cloud.setDisplaySize(this.laneWidth * 0.8, (this.laneWidth * 0.8) * 0.6);

            const text = this.scene.add.text(laneX, -100, answers[i].toString(), {
                fontSize: `${fontSize}px`, color: '#0f172a', fontStyle: 'bold'
            }).setOrigin(0.5);

            cloud.setVelocityY(this.opts.speed);
            cloud.body?.setSize(100, 60);

            (cloud as any).answer = answers[i];
            (cloud as any).textObj = text;

            // Tocar la nube mueve el carro de ESTE jugador a ese carril
            cloud.on('pointerdown', () => this.moveToLane(i));

            this.obstaclesGroup.add(cloud);
        }
    }

    spawnScenery() {
        if (!this.active) return;
        const margin = this.roadX - this.opts.x;
        if (margin < 50) return; // No hay pasto suficiente
        const isLeft = Phaser.Math.Between(0, 1) === 0;
        const x = isLeft
            ? Phaser.Math.Between(this.opts.x + 20, this.roadX - 30)
            : Phaser.Math.Between(this.roadX + this.roadWidth + 30, this.opts.x + this.opts.width - 20);

        const tree = this.scene.physics.add.sprite(x, -100, 'tree');
        tree.setScale(Math.min(1, margin / 110));
        tree.setVelocityY(this.opts.speed);
        this.sceneryGroup.add(tree);
    }

    update() {
        const h = this.scene.cameras.main.height;
        this.tag.x = this.player.x;

        let obstaclesGone = false;
        this.obstaclesGroup.getChildren().forEach((child) => {
            const cloud = child as any;
            cloud.textObj.y = cloud.y;
            if (cloud.y > h + 100) {
                cloud.textObj.destroy();
                cloud.destroy();
                obstaclesGone = true;
            }
        });

        this.sceneryGroup.getChildren().forEach((child) => {
            const item = child as any;
            if (item.y > h + 100) item.destroy();
        });

        // Las nubes pasaron sin que el jugador eligiera: cuenta como error
        if (obstaclesGone && this.obstaclesGroup.getLength() === 0) {
            this.handleError();
        }
    }

    handleCollision(cloud: any) {
        if (!this.active || this.resolving) return;
        this.resolving = true;

        if (cloud.answer === this.correctAnswer) {
            this.score++;
            const progress = (this.score / VERSUS_TARGET) * this.progressWidth;
            this.scene.tweens.add({ targets: this.progressBar, width: progress, duration: 300 });

            // Salto de victoria
            this.scene.tweens.add({ targets: this.player, y: this.player.y - 40, duration: 150, yoyo: true });

            this.clearObstacles();
            this.opts.onScore(this);
            if (this.active) this.scene.time.delayedCall(400, () => this.nextQuestion());
        } else {
            this.handleError();
        }
    }

    handleError() {
        // Fogonazo rojo SOLO en la mitad de este jugador (no distrae al rival)
        const h = this.scene.cameras.main.height;
        const flash = this.scene.add.rectangle(this.centerX, h / 2, this.opts.width, h, 0xef4444).setAlpha(0.5);
        this.scene.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });

        // Sacudida local del carro en lugar de la cámara completa
        this.scene.tweens.add({ targets: this.player, angle: { from: -12, to: 12 }, duration: 60, yoyo: true, repeat: 2,
            onComplete: () => this.player.setAngle(0) });

        this.clearObstacles();
        this.resolving = true;
        this.scene.time.delayedCall(500, () => this.nextQuestion());
    }

    clearObstacles() {
        this.obstaclesGroup.getChildren().forEach((child) => {
            const cloud = child as any;
            if (cloud.textObj) cloud.textObj.destroy();
        });
        this.obstaclesGroup.clear(true, true);
    }

    stop() {
        this.active = false;
        this.clearObstacles();
    }
}

// --- PANTALLA DE JUEGO PARA 2 JUGADORES (MISMO TECLADO) ---
export class VersusScene extends Phaser.Scene {
    tracks: RaceTrack[] = [];
    finished = false;

    constructor() { super('VersusScene'); }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const half = w / 2;
        this.cameras.main.setBackgroundColor(COLORS.bg);
        this.finished = false;

        const speed = 300 + (GameState.level - 1) * 50; // Igual que el modo 1 jugador
        const tier = getTier(GameState.difficulty, GameState.level);
        const onScore = (track: RaceTrack) => this.checkWinner(track);

        this.tracks = [
            new RaceTrack(this, { id: 1, x: 0, width: half, carKey: 'car', speed, tier, onScore }),
            new RaceTrack(this, { id: 2, x: half, width: half, carKey: 'car-blue', speed, tier, onScore })
        ];
        const [p1, p2] = this.tracks;

        // Separador central
        this.add.rectangle(half, h / 2, 6, h, 0x1e293b);

        // --- INSTRUCCIONES ---
        const helpText = this.add.text(w / 2, h * 0.25, 'Jugador 1: A / D        Jugador 2: ← / →\n¡Llega a la nube correcta primero!', {
            fontSize: `${Math.min(28, Math.floor(w / 32))}px`, color: '#1e293b', fontStyle: 'bold', align: 'center', stroke: '#fff', strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);
        this.tweens.add({ targets: helpText, alpha: 0, delay: 3500, duration: 1000, onComplete: () => helpText.destroy() });

        // --- CONTROLES DE TECLADO INDEPENDIENTES ---
        // Jugador 1: W A S D (A/D cambian de carril)
        this.input.keyboard?.on('keydown-A', () => p1.movePlayer(-1));
        this.input.keyboard?.on('keydown-D', () => p1.movePlayer(1));
        // Jugador 2: flechas (←/→ cambian de carril)
        this.input.keyboard?.on('keydown-LEFT', () => p2.movePlayer(-1));
        this.input.keyboard?.on('keydown-RIGHT', () => p2.movePlayer(1));
        // Evita que las flechas/espacio desplacen la página del navegador
        this.input.keyboard?.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT']);

        // --- CONTROL TÁCTIL: cada mitad de pantalla controla a su jugador ---
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length > 0) return;  // Tocó una nube: ya la maneja la nube
            if (pointer.y <= h * 0.3) return;
            const track = pointer.x < half ? p1 : p2;
            track.movePlayer(pointer.x < track.centerX ? -1 : 1);
        });

        // Decoración de los bordes
        this.time.addEvent({ delay: 800, loop: true, callback: () => this.tracks.forEach(t => t.spawnScenery()) });

        this.tracks.forEach(t => t.nextQuestion());
    }

    update() {
        if (this.finished) return;
        this.tracks.forEach(t => t.update());
    }

    checkWinner(track: RaceTrack) {
        if (this.finished || track.score < VERSUS_TARGET) return;
        this.finished = true;
        this.tracks.forEach(t => t.stop());
        GameState.versusWins[track.opts.id - 1]++;
        this.showWinner(track.opts.id);
    }

    showWinner(id: 1 | 2) {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const color = PLAYER_COLORS[id];

        // Misma pantalla de "nivel superado" del modo 1 jugador
        this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setDepth(20);
        const winText = this.add.text(w / 2, h / 2 - 70, `¡GANA EL JUGADOR ${id}!`, {
            fontSize: `${Math.min(60, Math.floor(w / 14))}px`, color: '#fbbf24', fontStyle: 'bold', stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(21);
        this.add.image(w / 2, h / 2 + 5, id === 1 ? 'car' : 'car-blue').setDepth(21);

        const nextBtn = this.add.rectangle(w / 2, h / 2 + 110, 300, 80, color.hex).setInteractive({ useHandCursor: true })
            .setStrokeStyle(4, 0xffffff).setDepth(21);
        this.add.text(w / 2, h / 2 + 110, 'Siguiente Nivel 🚀', { fontSize: '30px', color: '#fff', fontStyle: 'bold' })
            .setOrigin(0.5).setDepth(22);

        this.tweens.add({ targets: winText, scale: 1.2, yoyo: true, repeat: -1, duration: 800 });

        nextBtn.on('pointerdown', () => {
            GameState.level++;
            this.scene.restart();
        });
    }
}
