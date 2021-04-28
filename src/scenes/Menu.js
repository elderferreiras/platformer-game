import BaseScene from './Base';

class MenuScene extends BaseScene {
  constructor(config) {
    super('MenuScene', config);

    this.menu = [
      {scene: 'PlayScene', text: 'Play'},
      {scene: 'LevelsScene', text: 'Levels'},
      {scene: null, text: 'Exit'},
    ];
  }

  create() {
    super.create();
    super.createOverlay();
    this.createMenu(this.menu, this.setupMenuEvents.bind(this));
  }

  setupMenuEvents(menuItem) {
    const textGameObject = menuItem.textGameObject;
    textGameObject.setInteractive();
    textGameObject.on('pointerover', () => {
      textGameObject.setStyle({ fill: '#ff0'})
    });
    textGameObject.on('pointerout', () => {
      textGameObject.setStyle({ fill: '#fff'})
    });
    textGameObject.on('pointerup', () => {
      menuItem.scene && this.scene.start(menuItem.scene);

      if (menuItem.text === 'Exit') {
        this.game.destroy(true);
      }
    })
  }
}

export default MenuScene;
