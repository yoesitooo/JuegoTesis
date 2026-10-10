import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
    }

    create() {
        const text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'EduRunner MVP\n(Phaser 3)',
            { fontSize: '32px', color: '#fff', align: 'center' }
        );
        text.setOrigin(0.5);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [GameScene],
    parent: 'app',
    backgroundColor: '#2d2d2d'
};

new Phaser.Game(config);
