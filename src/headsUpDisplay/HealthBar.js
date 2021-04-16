import Phaser from 'phaser';

class HealthBar {
  constructor(scene, x, y, scale = 1, health) {
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.bar.setScrollFactor(0, 0);

    this.x = x / scale;
    this.y = y / scale;
    this.value = health;
    this.scale = scale;

    this.size = {
      width: 40,
      height: 8,
    };

    this.pixelPerHealth = this.size.width / this.value;

    scene.add.existing(this.bar);

    this.draw(this.x, this.y, scale);
  }

  decrease(amount) {
    this.value = amount <= 0? 0 : amount;
    this.draw(this.x, this.y, this.scale)
  }

  draw(x, y, scale) {
    this.bar.clear();

    const { width, height } = this.size;

    const margin = 2;

    this.bar.fillStyle(0x000000);
    this.bar.fillRect(x, y, width + margin, height + margin);

    this.bar.fillStyle(0xFFFFFF);
    this.bar.fillRect(x + margin, y + margin, width - margin, height - margin);

    const healthWidth = Math.floor(this.value * this.pixelPerHealth);

    let statusColor = 0x00FF00;
    if (healthWidth <= this.size.width / 3) {
      statusColor = 0xFF0000;
    }

    if (healthWidth > 0) {
      this.bar.fillStyle(statusColor);
      this.bar.fillRect(x + margin, y + margin, healthWidth - margin, height - margin);
    }

    this.bar.setScrollFactor(0, 0).setScale(scale)
  }
}

export default HealthBar;
