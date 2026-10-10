import Phaser from 'phaser';

const CONFIG = {
    laneWidth: 120,
    colors: {
        bg: '#F9F7F1', // Papel crema
        road: 0xEEE5D3, 
        line: 0xD3C4A5, 
        text: '#333333',
        btn: 0xFF9900
    },
    fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", "Coming Soon", cursive, sans-serif'
};

// --- ESTADO GLOBAL DEL JUEGO ---
const GameState = {
    avatar: '🚗',
    difficulty: 'Fácil', // Fácil (sumas basicas), Medio (Restas), Difícil (Multiplicación)
    score: 0
};

// --- PANTALLA DE INICIO (BIENVENIDA) ---
class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    
    create() {
        this.cameras.main.setBackgroundColor(CONFIG.colors.bg);
        
        // Título animado
        const title = this.add.text(200, 180, 'EduRunner\nMath!', {
            fontSize: '60px',
            color: CONFIG.colors.text,
            fontFamily: CONFIG.fontFamily,
            fontStyle: 'bold',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.tweens.add({ targets: title, y: 160, yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.easeInOut' });

        // Decoraciones (Estética Infantil)
        this.add.text(60, 80, '☀️', { fontSize: '60px' }).setOrigin(0.5);
        this.add.text(350, 480, '🌳', { fontSize: '70px' }).setOrigin(0.5);
        this.add.text(40, 520, '🦋', { fontSize: '40px' }).setOrigin(0.5);

        // Botón JUGAR
        const btn = this.add.rectangle(200, 380, 220, 70, CONFIG.colors.btn, 1).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(5, 0x000000);
        const btnText = this.add.text(200, 380, '¡JUGAR!', { fontSize: '36px', color: '#fff', fontFamily: CONFIG.fontFamily, fontStyle: 'bold' }).setOrigin(0.5);
        
        // Animación de Latido para el botón
        this.tweens.add({ targets: [btn, btnText], scale: 1.05, yoyo: true, repeat: -1, duration: 800 });

        btn.on('pointerdown', () => this.scene.start('AvatarScene'));
    }
}

// --- PANTALLA DE SELECCIÓN DE PERSONAJE ---
class AvatarScene extends Phaser.Scene {
    constructor() { super('AvatarScene'); }
    
    create() {
        this.cameras.main.setBackgroundColor(CONFIG.colors.bg);
        this.add.text(200, 80, 'Elige tu\nPersonaje', { fontSize: '40px', color: CONFIG.colors.text, fontFamily: CONFIG.fontFamily, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

        // Personajes disponibles (Emojis estilo dibujo)
        const avatars = ['🚗', '🐷', '🐢', '👧', '👦', '🚀'];
        
        avatars.forEach((avatar, index) => {
            const x = 120 + (index % 2) * 160;
            const y = 220 + Math.floor(index / 2) * 120;
            
            const box = this.add.rectangle(x, y, 90, 90, 0xffffff).setInteractive({ useHandCursor: true });
            box.setStrokeStyle(5, 0x000000);
            this.add.text(x, y, avatar, { fontSize: '60px' }).setOrigin(0.5);
            
            box.on('pointerdown', () => {
                GameState.avatar = avatar;
                // Efecto al elegir
                this.tweens.add({
                    targets: box, scale: 1.2, duration: 150, yoyo: true, onComplete: () => {
                        this.scene.start('DifficultyScene');
                    }
                });
            });
            box.on('pointerover', () => box.fillColor = 0xfff0b3); // Resaltar amarillo
            box.on('pointerout', () => box.fillColor = 0xffffff);
        });
    }
}

// --- PANTALLA DE SELECCIÓN DE DIFICULTAD ---
class DifficultyScene extends Phaser.Scene {
    constructor() { super('DifficultyScene'); }
    
    create() {
        this.cameras.main.setBackgroundColor(CONFIG.colors.bg);
        this.add.text(200, 100, 'Nivel', { fontSize: '48px', color: CONFIG.colors.text, fontFamily: CONFIG.fontFamily, fontStyle: 'bold' }).setOrigin(0.5);

        const diffs = [
            { id: 'Fácil', color: 0x32CD32, desc: '(Sumas)' },
            { id: 'Medio', color: 0xFFA500, desc: '(Restas)' },
            { id: 'Difícil', color: 0xFF4500, desc: '(Multiplicar)' }
        ];

        diffs.forEach((diff, index) => {
            const y = 240 + (index * 110);
            const btn = this.add.rectangle(200, y, 240, 80, diff.color).setInteractive({ useHandCursor: true });
            btn.setStrokeStyle(5, 0x000000);
            
            this.add.text(200, y - 10, diff.id, { fontSize: '32px', color: '#fff', fontFamily: CONFIG.fontFamily, fontStyle: 'bold' }).setOrigin(0.5);
            this.add.text(200, y + 20, diff.desc, { fontSize: '18px', color: '#fff', fontFamily: CONFIG.fontFamily }).setOrigin(0.5);
            
            btn.on('pointerdown', () => {
                GameState.difficulty = diff.id;
                this.tweens.add({
                    targets: btn, scale: 1.1, duration: 150, yoyo: true, onComplete: () => {
                        this.scene.start('GameScene');
                    }
                });
            });
        });
    }
}

// --- PANTALLA PRINCIPAL DEL JUEGO ---
class GameScene extends Phaser.Scene {
    player!: Phaser.GameObjects.Text;
    currentLane: number = 1;
    questionText!: Phaser.GameObjects.Text;
    scoreText!: Phaser.GameObjects.Text;
    statusText!: Phaser.GameObjects.Text;
    obstaclesGroup!: Phaser.Physics.Arcade.Group;
    sceneryGroup!: Phaser.Physics.Arcade.Group;
    correctAnswer: number = 0;
    
    constructor() { super('GameScene'); }

    create() {
        // Cargar puntos guardados offline
        const savedScore = localStorage.getItem('eduRunner_score');
        if (savedScore) GameState.score = parseInt(savedScore, 10);

        this.cameras.main.setBackgroundColor(CONFIG.colors.bg);
        
        // El Camino
        this.add.rectangle(200, 300, 360, 600, CONFIG.colors.road);
        for (let i = 0; i < 12; i++) {
            this.add.rectangle(140, i * 60, 4, 30, CONFIG.colors.line);
            this.add.rectangle(260, i * 60, 4, 30, CONFIG.colors.line);
        }

        this.sceneryGroup = this.physics.add.group();

        // El Jugador (Avatar seleccionado)
        this.player = this.add.text(200, 500, GameState.avatar, { fontSize: '64px' }).setOrigin(0.5);
        this.physics.add.existing(this.player);
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(40, 40);

        // UI Superior
        this.questionText = this.add.text(200, 80, '¿?', { 
            fontSize: '60px', 
            color: CONFIG.colors.text, 
            fontFamily: CONFIG.fontFamily,
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.scoreText = this.add.text(60, 30, '⭐ ' + GameState.score, { 
            fontSize: '28px', color: '#FF9900', fontFamily: CONFIG.fontFamily, fontStyle: 'bold' 
        }).setOrigin(0.5);

        // Indicador Offline
        this.statusText = this.add.text(330, 20, navigator.onLine ? '🟢 Sinc' : '🔴 Off', { 
            fontSize: '16px', color: '#333333', fontFamily: CONFIG.fontFamily
        }).setOrigin(0.5);

        window.addEventListener('online', () => { this.statusText.setText('🟢 Sinc'); this.syncData(); });
        window.addEventListener('offline', () => { this.statusText.setText('🔴 Off'); });

        // Controles (Teclado y Táctil)
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-LEFT', () => this.movePlayer(-1));
            this.input.keyboard.on('keydown-RIGHT', () => this.movePlayer(1));
            this.input.keyboard.on('keydown-A', () => this.movePlayer(-1));
            this.input.keyboard.on('keydown-D', () => this.movePlayer(1));
        }
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < 200) this.movePlayer(-1);
            else this.movePlayer(1);
        });

        // Botón de Volver al Menú
        const backBtn = this.add.text(20, 550, '🔙', { fontSize: '32px' }).setInteractive();
        backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

        this.obstaclesGroup = this.physics.add.group();
        this.generateQuestion();

        this.physics.add.overlap(this.player, this.obstaclesGroup, this.handleCollision as any, undefined, this);
        this.time.addEvent({ delay: 1200, callback: this.spawnScenery, callbackScope: this, loop: true });
    }

    spawnScenery() {
        const side = Phaser.Math.Between(0, 1) === 0 ? 20 : 380;
        const items = ['🌳', '🌸', '🦋', '🌻', '🏡'];
        const emoji = Phaser.Utils.Array.GetRandom(items);
        
        const item = this.add.text(side, -50, emoji, { fontSize: '40px' }).setOrigin(0.5);
        this.physics.add.existing(item);
        (item.body as Phaser.Physics.Arcade.Body).setVelocityY(100 + (GameState.score * 5));
        this.sceneryGroup.add(item);
    }

    movePlayer(dir: number) {
        this.currentLane += dir;
        if (this.currentLane < 0) this.currentLane = 0;
        if (this.currentLane > 2) this.currentLane = 2;
        
        const targetX = 80 + (this.currentLane * 120);
        this.tweens.add({ targets: this.player, x: targetX, duration: 200, ease: 'Back.easeOut' });
    }

    generateQuestion() {
        let num1, num2;
        
        if (GameState.difficulty === 'Fácil') {
            num1 = Phaser.Math.Between(1, 10);
            num2 = Phaser.Math.Between(1, 10);
            this.correctAnswer = num1 + num2;
            this.questionText.setText(`${num1} + ${num2}`);
        } else if (GameState.difficulty === 'Medio') {
            num1 = Phaser.Math.Between(5, 20);
            num2 = Phaser.Math.Between(1, num1); // Resta simple
            this.correctAnswer = num1 - num2;
            this.questionText.setText(`${num1} - ${num2}`);
        } else {
            num1 = Phaser.Math.Between(1, 10);
            num2 = Phaser.Math.Between(1, 5); // Multiplicación simple
            this.correctAnswer = num1 * num2;
            this.questionText.setText(`${num1} × ${num2}`);
        }

        let fake1 = this.correctAnswer + Phaser.Math.Between(1, 5);
        let fake2 = this.correctAnswer - Phaser.Math.Between(1, 4);
        if (fake2 < 0) fake2 = this.correctAnswer + 3;
        
        const answers = [this.correctAnswer, fake1, fake2];
        Phaser.Utils.Array.Shuffle(answers);

        // Animación de la pregunta
        this.tweens.add({ targets: this.questionText, scale: 1.3, yoyo: true, duration: 300 });

        for (let i = 0; i < 3; i++) {
            const laneX = 80 + (i * 120);
            
            const cloud = this.add.text(laneX, -50, '☁️', { fontSize: '100px' }).setOrigin(0.5);
            const text = this.add.text(laneX, -50, answers[i].toString(), { 
                fontSize: '36px', color: '#222222', fontFamily: CONFIG.fontFamily, fontStyle: 'bold' 
            }).setOrigin(0.5);
            
            this.physics.add.existing(cloud);
            const speed = 150 + (GameState.score * 12);
            (cloud.body as Phaser.Physics.Arcade.Body).setVelocityY(speed);
            (cloud.body as Phaser.Physics.Arcade.Body).setSize(70, 50);
            
            (cloud as any).answer = answers[i];
            (cloud as any).textObj = text;

            this.obstaclesGroup.add(cloud);
        }
    }

    update() {
        let obstaclesGone = false;

        this.obstaclesGroup.getChildren().forEach((child) => {
            const cloud = child as any;
            cloud.textObj.y = cloud.y;
            if (cloud.y > 650) {
                cloud.textObj.destroy();
                cloud.destroy();
                obstaclesGone = true;
            }
        });

        this.sceneryGroup.getChildren().forEach((child) => {
            const item = child as any;
            if (item.y > 650) item.destroy();
        });

        if (obstaclesGone && this.obstaclesGroup.getLength() === 0) {
            this.handleError();
        }
    }

    handleCollision(player: any, cloud: any) {
        if (cloud.answer === this.correctAnswer) {
            GameState.score++;
            this.scoreText.setText('⭐ ' + GameState.score);
            localStorage.setItem('eduRunner_score', GameState.score.toString());
            
            const star = this.add.text(player.x, player.y - 50, '✨', { fontSize: '40px' }).setOrigin(0.5);
            this.tweens.add({ targets: star, y: player.y - 100, alpha: 0, duration: 800, onComplete: () => star.destroy() });
            this.tweens.add({ targets: player, angle: 360, duration: 400 });
        } else {
            this.handleError();
        }

        this.clearObstacles();
        this.time.delayedCall(300, () => this.generateQuestion());
    }

    handleError() {
        GameState.score = Math.max(0, GameState.score - 1);
        this.scoreText.setText('⭐ ' + GameState.score);
        localStorage.setItem('eduRunner_score', GameState.score.toString());
        this.cameras.main.shake(300, 0.02);
        
        const sad = this.add.text(this.player.x, this.player.y - 40, '💦', { fontSize: '40px' }).setOrigin(0.5);
        this.tweens.add({ targets: sad, y: this.player.y + 30, alpha: 0, duration: 800, onComplete: () => sad.destroy() });
    }

    clearObstacles() {
        this.obstaclesGroup.getChildren().forEach((child) => {
            const cloud = child as any;
            if(cloud.textObj) cloud.textObj.destroy();
        });
        this.obstaclesGroup.clear(true, true);
    }

    syncData() {
        console.log('Sincronizando...');
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [MenuScene, AvatarScene, DifficultyScene, GameScene], // Todas las escenas cargadas aquí
    parent: 'app',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    backgroundColor: '#F9F7F1'
};

new Phaser.Game(config);
