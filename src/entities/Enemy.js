import Phaser from 'phaser';
import mixins from '../mixins/collidable';

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = scene.config;
    // Mixins
    Object.assign(this, mixins);

    this.init();
    this.initEvents();
  }

  init() {
    this.rayGraphics = this.scene.add.graphics({ lineStyle: 2, color: 0xaa00aa });
    this.timeFromLastTurn = 0;
    this.gravity = 500;
    this.speed = 25;
    this.maxPatrolDistance = 250;
    this.currentPatrolDistance = 0;
    this.platformCollidersLayer = null;
    this.damage = 20;
    this.body.setGravityY(this.gravity);
    this.setSize(20, 45);
    this.setOffset(7, 20);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setOrigin(0.5, 1);
    this.setVelocityX(this.speed);
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update(time, delta) {
    this.patrol(time);
  }

  patrol(time) {
    if (!this.body || !this.body.onFloor()) { return; }

    this.currentPatrolDistance += Math.abs(this.body.deltaX());

    const { hasHit, ray } = this.raycast(this.body, this.platformCollidersLayer, { raylength: 30, precision: 2, steepness: 0.2 });

    if ((!hasHit || this.currentPatrolDistance >= this.maxPatrolDistance) && this.timeFromLastTurn + 100 < time) {
      this.setFlipX(!this.flipX);
      this.setVelocityX(this.speed = -this.speed);
      this.timeFromLastTurn = time;
      this.currentPatrolDistance = 0;
    }

    if (this.config.debug) {
      this.rayGraphics.clear();
      this.rayGraphics.strokeLineShape(ray);
    }
  }

  setPlatformColliders(platformColliders) {
    this.platformCollidersLayer = platformColliders;
  }
}

export default Enemy;
