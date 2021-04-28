import BaseScene from './Base';

class CreditScene extends BaseScene {
  constructor(config) {
    super('CreditScene', { ...config, canGoBack: true });

    this.menu = [
      {scene: null, text: 'Thank you for playing!'},
      {scene: null, text: 'Author: Elder Patten Ferreira'},
    ];
  }

  create() {
    super.create();
    super.createOverlay();
    this.createMenu(this.menu, () => {});
  }
}

export default CreditScene;
