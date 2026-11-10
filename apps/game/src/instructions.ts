import Phaser from 'phaser';
import { COLORS, GameState, PLAYER_COLORS } from './state';

// --- PANTALLA "¿CÓMO SE JUEGA?" ---
// Se muestra antes de cada partida (después de elegir dificultad).
// Explica con dibujos y frases cortas qué hacer y qué teclas usar,
// adaptándose al modo 1 jugador o 2 jugadores.
export class InstructionsScene extends Phaser.Scene {
    constructor() { super('InstructionsScene'); }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const u = Math.min(w / 900, h / 700, 1.3); // Escala responsive
        const twoPlayers = GameState.players === 2;
        this.cameras.main.setBackgroundColor(COLORS.bg);

        // Nubes decorativas como en el menú
        for (let i = 0; i < 4; i++) {
            const cloud = this.add.image(Phaser.Math.Between(0, w), Phaser.Math.Between(40, h / 2), 'cloud').setAlpha(0.5);
            this.tweens.add({ targets: cloud, x: w + 100, duration: Phaser.Math.Between(12000, 22000), repeat: -1 });
        }

        const title = this.add.text(w / 2, h * 0.09, '¿Cómo se juega?', {
            fontSize: `${Math.round(54 * u)}px`, color: '#ffffff', stroke: '#3b82f6', strokeThickness: 10, fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, y: title.y - 8, yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.easeInOut' });

        // --- PASOS (panel blanco como el de las preguntas) ---
        const steps = [
            { icon: '👀', text: 'Mira la operación de arriba y piensa la respuesta.' },
            { icon: '🚗', text: 'Mueve tu carro al carril de la nube correcta.' },
            { icon: twoPlayers ? '🏆' : '⭐', text: twoPlayers
                ? '¡El primero en lograr 5 aciertos gana!'
                : `¡Logra ${GameState.targetScore} aciertos para pasar de nivel!` }
        ];
        const panelW = Math.min(w * 0.92, 720);
        const stepH = 46 * u;
        const panelTop = h * 0.17;
        const panelH = steps.length * stepH + 24 * u;
        this.add.rectangle(w / 2, panelTop + panelH / 2, panelW, panelH, COLORS.panel).setStrokeStyle(4, 0x000);

        steps.forEach((step, i) => {
            const y = panelTop + 12 * u + stepH * (i + 0.5);
            const left = w / 2 - panelW / 2 + 20 * u;
            const num = this.add.circle(left + 18 * u, y, 18 * u, 0x3b82f6);
            const n = this.add.text(num.x, y, `${i + 1}`, { fontSize: `${Math.round(22 * u)}px`, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            this.add.text(left + 48 * u, y, `${step.icon}  ${step.text}`, {
                fontSize: `${Math.round(22 * u)}px`, color: COLORS.text, fontStyle: 'bold',
                wordWrap: { width: panelW - 90 * u }
            }).setOrigin(0, 0.5);

            // Aparecen uno por uno
            [num, n].forEach(o => o.setScale(0));
            this.tweens.add({ targets: [num, n], scale: 1, delay: 300 + i * 350, duration: 300, ease: 'Back.easeOut' });
        });

        // --- CONTROLES ---
        const ctrlY = panelTop + panelH + (h * 0.8 - (panelTop + panelH)) / 2;
        if (twoPlayers) {
            this.drawPlayerControls(w * 0.27, ctrlY, u, 1, 'car', ['A', 'D']);
            this.drawPlayerControls(w * 0.73, ctrlY, u, 2, 'car-blue', ['←', '→']);
            this.add.text(w / 2, ctrlY, 'VS', {
                fontSize: `${Math.round(44 * u)}px`, color: '#fbbf24', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
            }).setOrigin(0.5);
        } else {
            this.drawPlayerControls(w / 2, ctrlY, u, 1, 'car', ['A', 'D'], ['←', '→']);
        }

        // Pista táctil para tablets / celulares
        this.add.text(w / 2, h * 0.8, twoPlayers
            ? '📱 En pantalla táctil: toca la nube de tu lado'
            : '📱 También puedes tocar la nube con la respuesta', {
            fontSize: `${Math.round(20 * u)}px`, color: COLORS.text, fontStyle: 'bold', stroke: '#fff', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5);

        // --- BOTÓN ¡A JUGAR! (mismo estilo que el menú) ---
        const by = h * 0.91;
        const btn = this.add.rectangle(w / 2, by, 280 * Math.min(u, 1), 70 * Math.min(u, 1) + 10, 0xef4444).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(6, 0xffffff);
        const btnText = this.add.text(w / 2, by, '¡A JUGAR!', { fontSize: `${Math.round(36 * Math.min(u, 1))}px`, color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: [btn, btnText], scale: 1.06, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });

        btn.on('pointerover', () => { btn.fillColor = 0xdc2626; });
        btn.on('pointerout', () => { btn.fillColor = 0xef4444; });

        const start = () => this.scene.start(twoPlayers ? 'VersusScene' : 'GameScene');
        btn.on('pointerdown', start);
        this.input.keyboard?.once('keydown-ENTER', start);
        this.input.keyboard?.once('keydown-SPACE', start);
    }

    /** Dibuja un carro con su nombre y las teclas que lo mueven, con una demo animada. */
    drawPlayerControls(x: number, y: number, u: number, id: 1 | 2, carKey: string, keys: [string, string], altKeys?: [string, string]) {
        const color = PLAYER_COLORS[id];

        this.add.text(x, y - 95 * u, `Jugador ${id}`, {
            fontSize: `${Math.round(28 * u)}px`, color: '#fff', fontStyle: 'bold', stroke: color.css, strokeThickness: 8
        }).setOrigin(0.5);

        const car = this.add.image(x, y - 20 * u, carKey).setScale(0.75 * u);

        const gap = 85 * u;
        const left = this.drawKey(x - gap, y - 20 * u, keys[0], u, color.hex);
        const right = this.drawKey(x + gap, y - 20 * u, keys[1], u, color.hex);

        const labelStyle = { fontSize: `${Math.round(18 * u)}px`, color: COLORS.text, fontStyle: 'bold' };
        this.add.text(left.x, y + 30 * u, '⬅ izquierda', labelStyle).setOrigin(0.5);
        this.add.text(right.x, y + 30 * u, 'derecha ➡', labelStyle).setOrigin(0.5);

        if (altKeys) {
            this.add.text(x, y + 62 * u, `o usa las flechas  ${altKeys[0]}  ${altKeys[1]}`, {
                fontSize: `${Math.round(18 * u)}px`, color: '#64748b', fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        // Demo: la tecla se "presiona" y el carro se mueve hacia ese lado
        const press = (key: Phaser.GameObjects.Container, dir: number) => [
            { targets: key, scale: 0.85, duration: 100, yoyo: true },
            { targets: car, x: x + dir * 30 * u, angle: dir * 15, duration: 200, ease: 'Power2' }
        ];
        this.tweens.chain({
            loop: -1, loopDelay: 400,
            tweens: [
                ...press(left, -1),
                { targets: car, x, angle: 0, duration: 250, delay: 300 },
                ...press(right, 1),
                { targets: car, x, angle: 0, duration: 250, delay: 300 }
            ] as any
        });
    }

    /** Tecla de teclado dibujada (fondo blanco, borde de color del jugador). */
    drawKey(x: number, y: number, label: string, u: number, borderColor: number) {
        const size = 62 * u;
        const g = this.add.graphics();
        g.fillStyle(0x1e293b, 1).fillRoundedRect(-size / 2, -size / 2 + 6 * u, size, size, 12 * u); // Sombra
        g.fillStyle(0xffffff, 1).fillRoundedRect(-size / 2, -size / 2, size, size, 12 * u);
        g.lineStyle(4, borderColor, 1).strokeRoundedRect(-size / 2, -size / 2, size, size, 12 * u);
        const t = this.add.text(0, 0, label, { fontSize: `${Math.round(32 * u)}px`, color: COLORS.text, fontStyle: 'bold' }).setOrigin(0.5);
        return this.add.container(x, y, [g, t]);
    }
}
