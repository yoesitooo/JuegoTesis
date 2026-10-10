import Phaser from 'phaser';

const CONFIG = {
    laneWidth: 120,
    colors: {
        bg: '#F9F7F1', // Color papel/crema claro para dar aspecto de dibujo
        road: 0xEEE5D3, // Camino color arena/beige claro
        line: 0xD3C4A5, // Líneas divisorias color arena oscura
        text: '#333333' // Texto negro/gris oscuro (tipo crayola)
    },
    // Fuentes tipo "dibujo a mano" infantiles
    fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", "Coming Soon", cursive, sans-serif'
};

class GameScene extends Phaser.Scene {
    player!: Phaser.GameObjects.Text; // Usaremos un Emoji de carrito 
    currentLane: number = 1;
    questionText!: Phaser.GameObjects.Text;
    scoreText!: Phaser.GameObjects.Text;
    score: number = 0;
    obstaclesGroup!: Phaser.Physics.Arcade.Group;
    sceneryGroup!: Phaser.Physics.Arcade.Group;
    correctAnswer: number = 0;
    
    constructor() {
        super('GameScene');
    }

    create() {
        // Fondo Color Papel (Estilo Doodle/Dibujo)
        this.cameras.main.setBackgroundColor(CONFIG.colors.bg);
        
        // El Camino
        this.add.rectangle(200, 300, 360, 600, CONFIG.colors.road);
        
        // Líneas punteadas del camino
        for (let i = 0; i < 12; i++) {
            this.add.rectangle(140, i * 60, 4, 30, CONFIG.colors.line);
            this.add.rectangle(260, i * 60, 4, 30, CONFIG.colors.line);
        }

        this.sceneryGroup = this.physics.add.group();

        // 🚗 El Jugador: Un carrito rojo (¡Idéntico al de tu foto!)
        this.player = this.add.text(200, 500, '🚗', { fontSize: '64px' }).setOrigin(0.5);
        this.physics.add.existing(this.player);
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(40, 40);

        // ☀️ Sol decorativo en la esquina
        this.add.text(350, 40, '☀️', { fontSize: '64px' }).setOrigin(0.5);

        // UI: Pregunta y Puntos con fuente infantil
        this.questionText = this.add.text(200, 80, '¿?', { 
            fontSize: '56px', 
            color: CONFIG.colors.text, 
            fontFamily: CONFIG.fontFamily,
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.scoreText = this.add.text(60, 30, '⭐ ' + this.score, { 
            fontSize: '28px', 
            color: '#FF9900',
            fontFamily: CONFIG.fontFamily,
            fontStyle: 'bold' 
        }).setOrigin(0.5);

        // Controles
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

        this.obstaclesGroup = this.physics.add.group();
        this.generateQuestion();

        this.physics.add.overlap(this.player, this.obstaclesGroup, this.handleCollision as any, undefined, this);
        
        // Hacer aparecer árboles, flores y mariposas a los lados (Paisaje)
        this.time.addEvent({ delay: 1200, callback: this.spawnScenery, callbackScope: this, loop: true });
    }

    spawnScenery() {
        // Aparece en el lado izquierdo (x: 20) o derecho (x: 380)
        const side = Phaser.Math.Between(0, 1) === 0 ? 20 : 380;
        // Elementos basados en tu dibujo
        const items = ['🌳', '🌸', '🦋', '🐷', '🌻', '🏡'];
        const emoji = Phaser.Utils.Array.GetRandom(items);
        
        const item = this.add.text(side, -50, emoji, { fontSize: '40px' }).setOrigin(0.5);
        this.physics.add.existing(item);
        (item.body as Phaser.Physics.Arcade.Body).setVelocityY(100 + (this.score * 5));
        this.sceneryGroup.add(item);
    }

    movePlayer(dir: number) {
        this.currentLane += dir;
        if (this.currentLane < 0) this.currentLane = 0;
        if (this.currentLane > 2) this.currentLane = 2;
        
        const targetX = 80 + (this.currentLane * 120);
        
        this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 200,
            ease: 'Back.easeOut' // Movimiento con "rebote" caricaturesco
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
            num2 = Phaser.Math.Between(1, num1);
            this.correctAnswer = num1 - num2;
            this.questionText.setText(`${num1} - ${num2}`);
        }

        let fake1 = this.correctAnswer + Phaser.Math.Between(1, 4);
        let fake2 = this.correctAnswer - Phaser.Math.Between(1, 4);
        if (fake2 < 0) fake2 = this.correctAnswer + 5;
        
        const answers = [this.correctAnswer, fake1, fake2];
        Phaser.Utils.Array.Shuffle(answers);

        // Animación saltarina de la pregunta
        this.tweens.add({ targets: this.questionText, scale: 1.2, yoyo: true, duration: 200 });

        for (let i = 0; i < 3; i++) {
            const laneX = 80 + (i * 120);
            
            // ☁️ Las opciones de respuesta ahora son Nubes adorables
            const cloud = this.add.text(laneX, -50, '☁️', { fontSize: '100px' }).setOrigin(0.5);
            const text = this.add.text(laneX, -50, answers[i].toString(), { 
                fontSize: '36px', 
                color: '#222222', 
                fontFamily: CONFIG.fontFamily,
                fontStyle: 'bold' 
            }).setOrigin(0.5);
            
            this.physics.add.existing(cloud);
            const speed = 150 + (this.score * 12);
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

        // Limpiar paisaje que sale de la pantalla
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
            this.score++;
            this.scoreText.setText('⭐ ' + this.score);
            
            // Efecto de celebración (Chispitas ✨)
            const star = this.add.text(player.x, player.y - 50, '✨', { fontSize: '40px' }).setOrigin(0.5);
            this.tweens.add({
                targets: star,
                y: player.y - 100,
                alpha: 0,
                duration: 800,
                onComplete: () => star.destroy()
            });
            this.tweens.add({ targets: player, angle: 360, duration: 400 }); // Pirueta feliz
        } else {
            this.handleError();
        }

        this.clearObstacles();
        this.time.delayedCall(300, () => this.generateQuestion());
    }

    handleError() {
        this.score = Math.max(0, this.score - 1);
        this.scoreText.setText('⭐ ' + this.score);
        this.cameras.main.shake(300, 0.02);
        
        // Efecto de llanto/sudor 💦
        const sad = this.add.text(this.player.x, this.player.y - 40, '💦', { fontSize: '40px' }).setOrigin(0.5);
        this.tweens.add({
            targets: sad,
            y: this.player.y + 30,
            alpha: 0,
            duration: 800,
            onComplete: () => sad.destroy()
        });
    }

    clearObstacles() {
        this.obstaclesGroup.getChildren().forEach((child) => {
            const cloud = child as any;
            if(cloud.textObj) cloud.textObj.destroy();
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
        arcade: { debug: false }
    },
    scene: [GameScene],
    parent: 'app',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#F9F7F1' // Fondo color papel para que coincida
};

new Phaser.Game(config);
