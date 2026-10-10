import Phaser from 'phaser';

const CONFIG = {
    laneWidth: 120,
    colors: {
        bg: 0x87CEEB, // Azul cielo infantil
        player: 0xFFD700, // Amarillo brillante
        road: 0x555555, // Gris asfalto
        text: '#ffffff'
    }
};

class GameScene extends Phaser.Scene {
    player!: Phaser.GameObjects.Rectangle;
    currentLane: number = 1; // 0: Izquierda, 1: Centro, 2: Derecha
    questionText!: Phaser.GameObjects.Text;
    scoreText!: Phaser.GameObjects.Text;
    score: number = 0;
    obstaclesGroup!: Phaser.Physics.Arcade.Group;
    correctAnswer: number = 0;
    
    constructor() {
        super('GameScene');
    }

    create() {
        // Fondo de cielo
        this.cameras.main.setBackgroundColor(CONFIG.colors.bg);
        
        // Pista / Carretera
        this.add.rectangle(200, 300, 360, 600, CONFIG.colors.road);
        
        // Líneas divisorias de la carretera
        for (let i = 0; i < 10; i++) {
            this.add.rectangle(140, i * 80, 5, 40, 0xffffff);
            this.add.rectangle(260, i * 80, 5, 40, 0xffffff);
        }

        // Jugador (Un cuadrito amigable)
        this.player = this.add.rectangle(200, 500, 60, 60, CONFIG.colors.player);
        this.player.setStrokeStyle(4, 0xffa500); // Borde naranja
        this.physics.add.existing(this.player);

        // UI Superior
        const panel = this.add.rectangle(200, 40, 400, 80, 0x000000, 0.5);
        this.questionText = this.add.text(200, 40, '¿?', { fontSize: '48px', color: '#FFF', fontStyle: 'bold' }).setOrigin(0.5);
        
        const scorePanel = this.add.rectangle(60, 20, 100, 30, 0xffffff, 0.2);
        scorePanel.setStrokeStyle(2, 0xffffff);
        this.scoreText = this.add.text(60, 20, '⭐ ' + this.score, { fontSize: '20px', color: '#FFF', fontStyle: 'bold' }).setOrigin(0.5);

        // Controles de Teclado
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-LEFT', () => this.movePlayer(-1));
            this.input.keyboard.on('keydown-RIGHT', () => this.movePlayer(1));
            this.input.keyboard.on('keydown-A', () => this.movePlayer(-1));
            this.input.keyboard.on('keydown-D', () => this.movePlayer(1));
        }

        // Controles Táctiles (Swipe o Tap) para tablets/celulares
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < 200) this.movePlayer(-1);
            else this.movePlayer(1);
        });

        this.obstaclesGroup = this.physics.add.group();
        this.generateQuestion();

        this.physics.add.overlap(this.player, this.obstaclesGroup, this.handleCollision as any, undefined, this);
    }

    movePlayer(dir: number) {
        this.currentLane += dir;
        if (this.currentLane < 0) this.currentLane = 0;
        if (this.currentLane > 2) this.currentLane = 2;
        
        // Coordenadas X: Carril 0 = 80, Carril 1 = 200, Carril 2 = 320
        const targetX = 80 + (this.currentLane * 120);
        
        this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 150,
            ease: 'Back.easeOut'
        });
    }

    generateQuestion() {
        const isSum = Phaser.Math.Between(0, 1) === 0;
        let num1, num2;
        
        if (isSum) {
            num1 = Phaser.Math.Between(1, 10);
            num2 = Phaser.Math.Between(1, 10);
            this.correctAnswer = num1 + num2;
            this.questionText.setText(`${num1} + ${num2}`);
        } else {
            num1 = Phaser.Math.Between(5, 15);
            num2 = Phaser.Math.Between(1, num1); // Evitar negativos
            this.correctAnswer = num1 - num2;
            this.questionText.setText(`${num1} - ${num2}`);
        }

        // Generar respuestas falsas
        let fake1 = this.correctAnswer + Phaser.Math.Between(1, 4);
        let fake2 = this.correctAnswer - Phaser.Math.Between(1, 4);
        if (fake2 < 0) fake2 = this.correctAnswer + 5; // Evitar respuestas falsas negativas para niños peques
        
        const answers = [this.correctAnswer, fake1, fake2];
        Phaser.Utils.Array.Shuffle(answers);

        // Animación de aparición de texto
        this.tweens.add({ targets: this.questionText, scale: 1.5, yoyo: true, duration: 150 });

        // Spawn de opciones en los carriles
        for (let i = 0; i < 3; i++) {
            const laneX = 80 + (i * 120);
            const box = this.add.rectangle(laneX, -50, 90, 90, 0xffffff);
            box.setStrokeStyle(4, 0x000000);
            
            const text = this.add.text(laneX, -50, answers[i].toString(), { 
                fontSize: '40px', 
                color: '#000000', 
                fontStyle: 'bold' 
            }).setOrigin(0.5);
            
            this.physics.add.existing(box);
            // La velocidad aumenta gradualmente con los puntos para más dificultad
            const speed = 150 + (this.score * 15);
            (box.body as Phaser.Physics.Arcade.Body).setVelocityY(speed);
            
            (box as any).answer = answers[i];
            (box as any).textObj = text;

            this.obstaclesGroup.add(box);
        }
    }

    update() {
        let obstaclesGone = false;

        this.obstaclesGroup.getChildren().forEach((child) => {
            const box = child as any;
            box.textObj.y = box.y;
            
            // Si el bloque pasa de largo y no chocó (el niño lo esquivó)
            if (box.y > 650) {
                box.textObj.destroy();
                box.destroy();
                obstaclesGone = true;
            }
        });

        if (obstaclesGone && this.obstaclesGroup.getLength() === 0) {
            // Si las esquivó todas, fue un error pasivo (o no supo cual elegir)
            this.handleError();
        }
    }

    handleCollision(player: any, box: any) {
        if (box.answer === this.correctAnswer) {
            // ¡Correcto!
            this.score++;
            this.scoreText.setText('⭐ ' + this.score);
            this.cameras.main.flash(300, 50, 205, 50); // Destello Verde
            this.tweens.add({ targets: player, angle: 360, duration: 300 }); // Pirueta feliz
        } else {
            // ¡Incorrecto!
            this.handleError();
        }

        // Limpiar oleada actual y lanzar la siguiente
        this.clearObstacles();
        this.time.delayedCall(300, () => this.generateQuestion());
    }

    handleError() {
        this.score = Math.max(0, this.score - 1); // Quitar 1 punto, min 0
        this.scoreText.setText('⭐ ' + this.score);
        this.cameras.main.shake(300, 0.03); // Temblor de pantalla (Error)
        this.player.fillColor = 0xff0000; // Se pone rojo de dolor
        this.time.delayedCall(300, () => this.player.fillColor = CONFIG.colors.player);
    }

    clearObstacles() {
        this.obstaclesGroup.getChildren().forEach((child) => {
            const box = child as any;
            if(box.textObj) box.textObj.destroy();
        });
        this.obstaclesGroup.clear(true, true);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [GameScene],
    parent: 'app',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#000000'
};

new Phaser.Game(config);
