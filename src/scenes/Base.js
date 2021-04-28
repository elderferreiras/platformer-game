import { Scene } from 'phaser';

class BaseScene extends Scene {
  constructor(key, config) {
    super(key);
    this.config = config;
    this.fontSize = 34;
    this.lineHeight = 42;
    this.fontOptions = { fontSize: `${this.fontSize}px`, fill: '#FFF' };
    this.screenCenter = [config.width / 2, config.height / 2];
    this.overlay = null;
  }

  create() {
    this.add.image(0, 0, 'menu-bg')
      .setOrigin(0)
      .setScale(3);

    if (this.config.canGoBack) {
      this.add.image(this.config.width - 10, this.config.height - 10, 'back')
        .setOrigin(1)
        .setScale(2)
        .setInteractive()
        .on('pointerup', () => {
          this.scene.start('MenuScene');
        });
    }
  }

  createOverlay() {
    this.overlay = this.add.renderTexture(0, 0, this.config.width, this.config.height).fill(0x000000, 0.3);
  }

  destroyOverlay() {
    this.overlay.destroy();
  }

  createMenu(menu, setupMenuEvents) {
    let lastMenuPositionY = 0;
    menu.forEach(menuItem => {
      const menuPosition = [this.screenCenter[0], this.screenCenter[1] + lastMenuPositionY];
      menuItem.textGameObject = this.add.text(...menuPosition, menuItem.text, this.fontOptions).setOrigin(0.5, 1);
      lastMenuPositionY += 42;
      setupMenuEvents(menuItem);
    });
  }
}

export default BaseScene;
