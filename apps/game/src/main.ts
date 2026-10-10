import Phaser from 'phaser';

// --- CONFIGURACIÓN GLOBAL ---
const COLORS = {
    bg: '#86efac',     // Pasto verde claro
    road: 0x94a3b8,    // Carretera
    line: 0xffffff,    // Líneas blancas
    text: '#1e293b',   // Texto oscuro
    panel: 0xffffff    // Paneles UI
};

const GameState = {
    difficulty: 'Fácil',
    score: 0,
    level: 1,
    targetScore: 5 // Puntos para pasar al siguiente nivel
};

// --- PRECARGA DE GRÁFICOS (ASSETS REALES SVG) ---
class Preloader extends Phaser.Scene {
    constructor() { super('Preloader'); }
    preload() {
        // En lugar de Emojis, usamos SVGs de alta calidad
        this.load.svg('car', '/assets/car.svg', { width: 80, height: 120 });
        this.load.svg('cloud', '/assets/cloud.svg', { width: 140, height: 90 });
        this.load.svg('tree', '/assets/tree.svg', { width: 80, height: 100 });
        
        // UI Text
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Cargando el Juego...', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    }
    create() {
        this.scene.start('MenuScene');
    }
}

// --- PANTALLA PRINCIPAL (BIENVENIDA) ---
class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.cameras.main.setBackgroundColor(COLORS.bg);

        // Nubes decorativas moviéndose en el fondo
        for(let i=0; i<5; i++) {
            const cloud = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(50, height/2), 'cloud');
            cloud.setAlpha(0.6);
            this.tweens.add({ targets: cloud, x: width + 100, duration: Phaser.Math.Between(10000, 20000), repeat: -1 });
        }

        // Título Gigante
        const title = this.add.text(width / 2, height * 0.3, 'Carrera\nMatemática', {
            fontSize: `${Math.min(width * 0.1, 80)}px`,
            color: '#ffffff',
            stroke: '#3b82f6', strokeThickness: 10,
            align: 'center', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, y: (height * 0.3) - 20, yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.easeInOut' });

        // Vehículo de exhibición
        const showcaseCar = this.add.image(width / 2, height * 0.55, 'car').setScale(1.5);
        this.tweens.add({ targets: showcaseCar, y: (height * 0.55) - 10, yoyo: true, repeat: -1, duration: 800 });

        // Botón JUGAR interactivo
        const btn = this.add.rectangle(width / 2, height * 0.8, 280, 80, 0xef4444, 1).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(6, 0xffffff);
        const btnText = this.add.text(width / 2, height * 0.8, '¡JUGAR!', { fontSize: '40px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        
        btn.on('pointerover', () => { btn.fillColor = 0xdc2626; this.tweens.add({ targets: [btn, btnText], scale: 1.1, duration: 100 }); });
        btn.on('pointerout', () => { btn.fillColor = 0xef4444; this.tweens.add({ targets: [btn, btnText], scale: 1, duration: 100 }); });
        
        btn.on('pointerdown', () => this.scene.start('DifficultyScene'));
    }
}

// --- PANTALLA DE DIFICULTAD ---
class DifficultyScene extends Phaser.Scene {
    constructor() { super('DifficultyScene'); }
    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.setBackgroundColor(COLORS.bg);

        this.add.text(w / 2, h * 0.15, 'Selecciona un Nivel', { fontSize: '48px', color: '#fff', stroke: '#000', strokeThickness: 6, fontStyle: 'bold' }).setOrigin(0.5);

        const diffs = [
            { id: 'Fácil', color: 0x22c55e, desc: 'Sumas de 1 cifra' },
            { id: 'Medio', color: 0xeab308, desc: 'Sumas y Restas' },
            { id: 'Difícil', color: 0xef4444, desc: 'Multiplicaciones' }
        ];

        diffs.forEach((diff, index) => {
            const y = (h * 0.35) + (index * (h * 0.2));
            const btn = this.add.rectangle(w / 2, y, Math.min(w * 0.8, 400), Math.min(h * 0.15, 100), diff.color).setInteractive({ useHandCursor: true });
            btn.setStrokeStyle(4, 0xffffff);
            
            this.add.text(w / 2, y - 15, diff.id, { fontSize: '36px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            this.add.text(w / 2, y + 20, diff.desc, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
            
            btn.on('pointerdown', () => {
                GameState.difficulty = diff.id;
                GameState.score = 0;
                GameState.level = 1;
                this.scene.start('GameScene');
            });
        });
    }
}

// --- PANTALLA PRINCIPAL DEL JUEGO (RESPONSIVE) ---
class GameScene extends Phaser.Scene {
    player!: Phaser.Physics.Arcade.Sprite;
    currentLane: number = 1; // 0: Izquierda, 1: Centro, 2: Derecha
    questionText!: Phaser.GameObjects.Text;
    levelText!: Phaser.GameObjects.Text;
    progressBar!: Phaser.GameObjects.Rectangle;
    obstaclesGroup!: Phaser.Physics.Arcade.Group;
    sceneryGroup!: Phaser.Physics.Arcade.Group;
    correctAnswer: number = 0;
    laneWidth!: number;
    roadX!: number;
    speed: number = 300;

    constructor() { super('GameScene'); }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.setBackgroundColor(COLORS.bg);
        
        // --- CÁLCULOS RESPONSIVE PARA LA CARRETERA ---
        // La carretera ocupa el 60% de la pantalla en PC, o el 90% en móviles
        const roadWidth = w > 800 ? w * 0.5 : w * 0.9; 
        this.laneWidth = roadWidth / 3;
        this.roadX = (w - roadWidth) / 2;

        // Dibujar el asfalto
        this.add.rectangle(w / 2, h / 2, roadWidth, h, COLORS.road);

        // Líneas divisorias dinámicas
        for (let i = 0; i < 20; i++) {
            this.add.rectangle(this.roadX + this.laneWidth, i * (h / 10), 6, h/20, COLORS.line);
            this.add.rectangle(this.roadX + (this.laneWidth * 2), i * (h / 10), 6, h/20, COLORS.line);
        }

        this.sceneryGroup = this.physics.add.group();

        // --- EL VEHÍCULO (ASSET REAL Y ANIMADO) ---
        const startX = this.roadX + (this.laneWidth * 1.5);
        this.player = this.physics.add.sprite(startX, h * 0.8, 'car');
        // Escalar el carro basado en el ancho del carril
        this.player.setDisplaySize(this.laneWidth * 0.6, (this.laneWidth * 0.6) * 1.5);
        this.player.body?.setSize(80, 120);

        // --- UI E INDICADORES DE NIVEL ---
        // Panel superior blanco
        this.add.rectangle(w / 2, 60, Math.min(w * 0.9, 600), 100, 0xffffff).setStrokeStyle(4, 0x000);
        
        this.levelText = this.add.text(w / 2, 25, `Nivel ${GameState.level} - ¡Consigue ${GameState.targetScore} aciertos!`, { 
            fontSize: '20px', color: '#64748b', fontStyle: 'bold' 
        }).setOrigin(0.5);

        this.questionText = this.add.text(w / 2, 70, '¿?', { 
            fontSize: '56px', color: '#0f172a', fontStyle: 'bold' 
        }).setOrigin(0.5);
        
        // Barra de progreso
        this.add.rectangle(w / 2, 130, 300, 15, 0xe2e8f0).setStrokeStyle(2, 0x000);
        this.progressBar = this.add.rectangle((w / 2) - 150, 130, 0, 15, 0x22c55e).setOrigin(0, 0.5);

        // --- CONTROLES Y EVENTOS ---
        this.input.keyboard?.on('keydown-LEFT', () => this.movePlayer(-1));
        this.input.keyboard?.on('keydown-RIGHT', () => this.movePlayer(1));
        this.input.keyboard?.on('keydown-A', () => this.movePlayer(-1));
        this.input.keyboard?.on('keydown-D', () => this.movePlayer(1));

        // Control táctil (Click/Touch) dividido en mitades
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < w / 2) this.movePlayer(-1);
            else this.movePlayer(1);
        });

        this.obstaclesGroup = this.physics.add.group();
        this.generateQuestion();

        this.physics.add.overlap(this.player, this.obstaclesGroup, this.handleCollision as any, undefined, this);
        
        // Decoración de los bordes
        this.time.addEvent({ delay: 800, callback: this.spawnScenery, callbackScope: this, loop: true });

        // Sincronización offline check
        if (navigator.onLine) this.syncData();
    }

    spawnScenery() {
        const w = this.cameras.main.width;
        // Aparece fuera del área de la carretera
        const isLeft = Phaser.Math.Between(0, 1) === 0;
        const x = isLeft ? Phaser.Math.Between(0, this.roadX - 40) : Phaser.Math.Between(this.roadX + (this.laneWidth * 3) + 40, w);
        
        const tree = this.physics.add.sprite(x, -100, 'tree');
        tree.setVelocityY(this.speed);
        this.sceneryGroup.add(tree);
    }

    movePlayer(dir: number) {
        this.currentLane += dir;
        if (this.currentLane < 0) this.currentLane = 0;
        if (this.currentLane > 2) this.currentLane = 2;
        
        const targetX = this.roadX + (this.laneWidth * 0.5) + (this.currentLane * this.laneWidth);
        
        // Animación dinámica de giro del vehículo (Inclinación deportiva)
        this.tweens.add({
            targets: this.player,
            x: targetX,
            angle: dir * 15, // Inclinar el carro al girar
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({ targets: this.player, angle: 0, duration: 100 }); // Enderezar
            }
        });
    }

    generateQuestion() {
        let num1, num2;
        if (GameState.difficulty === 'Fácil') {
            num1 = Phaser.Math.Between(1, 10);
            num2 = Phaser.Math.Between(1, 10);
            this.correctAnswer = num1 + num2;
            this.questionText.setText(`${num1} + ${num2}`);
        } else if (GameState.difficulty === 'Medio') {
            const isSum = Phaser.Math.Between(0, 1) === 0;
            if(isSum){
                num1 = Phaser.Math.Between(10, 50); num2 = Phaser.Math.Between(1, 20);
                this.correctAnswer = num1 + num2; this.questionText.setText(`${num1} + ${num2}`);
            } else {
                num1 = Phaser.Math.Between(10, 30); num2 = Phaser.Math.Between(1, num1);
                this.correctAnswer = num1 - num2; this.questionText.setText(`${num1} - ${num2}`);
            }
        } else {
            num1 = Phaser.Math.Between(2, 10);
            num2 = Phaser.Math.Between(2, 10);
            this.correctAnswer = num1 * num2;
            this.questionText.setText(`${num1} × ${num2}`);
        }

        let fake1 = this.correctAnswer + Phaser.Math.Between(1, 5);
        let fake2 = this.correctAnswer - Phaser.Math.Between(1, 4);
        if (fake2 < 0) fake2 = this.correctAnswer + 3;
        if (fake1 === fake2) fake1++;
        
        const answers = [this.correctAnswer, fake1, fake2];
        Phaser.Utils.Array.Shuffle(answers);

        this.tweens.add({ targets: this.questionText, scale: 1.3, yoyo: true, duration: 300 });

        for (let i = 0; i < 3; i++) {
            const laneX = this.roadX + (this.laneWidth * 0.5) + (i * this.laneWidth);
            
            const cloud = this.physics.add.sprite(laneX, -100, 'cloud');
            cloud.setDisplaySize(this.laneWidth * 0.8, (this.laneWidth * 0.8) * 0.6);
            
            const text = this.add.text(laneX, -100, answers[i].toString(), { 
                fontSize: '40px', color: '#0f172a', fontStyle: 'bold' 
            }).setOrigin(0.5);
            
            cloud.setVelocityY(this.speed);
            cloud.body?.setSize(100, 60);
            
            (cloud as any).answer = answers[i];
            (cloud as any).textObj = text;

            this.obstaclesGroup.add(cloud);
        }
    }

    update() {
        let obstaclesGone = false;
        const h = this.cameras.main.height;

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

        // Si las nubes pasaron y no chocó con ninguna, es un error (se saltó la pregunta)
        if (obstaclesGone && this.obstaclesGroup.getLength() === 0) {
            this.handleError();
        }
    }

    handleCollision(player: any, cloud: any) {
        if (cloud.answer === this.correctAnswer) {
            GameState.score++;
            
            // Actualizar barra de progreso
            const progress = (GameState.score / GameState.targetScore) * 300;
            this.tweens.add({ targets: this.progressBar, width: progress, duration: 300 });

            // Animación de salto de victoria
            this.tweens.add({ targets: player, y: player.y - 40, duration: 150, yoyo: true });
            
            if (GameState.score >= GameState.targetScore) {
                this.levelUp();
            } else {
                this.clearObstacles();
                this.time.delayedCall(400, () => this.generateQuestion());
            }
        } else {
            this.handleError();
        }
    }

    handleError() {
        this.cameras.main.shake(400, 0.03); // Fuerte sacudida
        
        // Fogonazo rojo
        const flash = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, this.cameras.main.width, this.cameras.main.height, 0xef4444);
        flash.setAlpha(0.5);
        this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });

        this.clearObstacles();
        this.time.delayedCall(500, () => this.generateQuestion());
    }

    levelUp() {
        this.clearObstacles();
        GameState.level++;
        GameState.targetScore += 5; // Más difícil
        this.speed += 50; // Más rápido

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.7);
        const winText = this.add.text(w/2, h/2 - 50, '¡NIVEL SUPERADO!', { fontSize: '60px', color: '#fbbf24', fontStyle: 'bold', stroke: '#000', strokeThickness: 8 }).setOrigin(0.5);
        const nextBtn = this.add.rectangle(w/2, h/2 + 50, 300, 80, 0x3b82f6).setInteractive({ useHandCursor: true }).setStrokeStyle(4, 0xffffff);
        this.add.text(w/2, h/2 + 50, 'Siguiente Nivel 🚀', { fontSize: '30px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

        this.tweens.add({ targets: winText, scale: 1.2, yoyo: true, repeat: -1, duration: 800 });

        nextBtn.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    clearObstacles() {
        this.obstaclesGroup.getChildren().forEach((child) => {
            const cloud = child as any;
            if(cloud.textObj) cloud.textObj.destroy();
        });
        this.obstaclesGroup.clear(true, true);
    }

    syncData() {
        // Mock de sincronización
        console.log('Sincronizando puntos:', GameState.score);
    }
}

// Configuración Responsiva Avanzada
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE, // 100% responsivo para cualquier pantalla (Celular, Tablet, PC)
        parent: 'app',
        width: '100%',
        height: '100%'
    },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [Preloader, MenuScene, DifficultyScene, GameScene]
};

new Phaser.Game(config);
