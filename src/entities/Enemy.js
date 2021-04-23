import Phaser from 'phaser';
import mixins from '../mixins/collidable';
import anims from '../mixins/anims';

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = scene.config;
    // Mixins
    Object.assign(this, mixins);
    Object.assign(this, anims);
    this.init();
    this.initEvents();
  }

  init() {
    this.rayGraphics = this.scene.add.graphics({ lineStyle: 2, color: 0xaa00aa });
    this.timeFromLastTurn = 0;
    this.gravity = 500;
    this.health = 20;
    this.speed = 25;
    this.maxPatrolDistance = 250;
    this.currentPatrolDistance = 0;
    this.platformCollidersLayer = null;
    this.damage = 20;
    this.body.setGravityY(this.gravity);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setOrigin(0.5, 1);
    this.setVelocityX(this.speed);
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update(time, delta) {
    if (this.getBounds().bottom > 600) {
      this.scene.events.removeListener(Phaser.Scenes.Events.UPDATE, this.update, this);
      this.setActive(false);
      this.rayGraphics.clear();
      this.destroy();
    }
    this.patrol(time);
  }

  deliversHit() {}

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

  takesHit(source) {
    source.deliversHit(this);
    this.health -= source.damage;
    if (this.health <= 0) {
      this.setTint(0xff0000);
      this.setVelocity(0, -200);
      this.body.checkCollision.none = true;
      this.setCollideWorldBounds(false);
    }
  }
}

export default Enemy;
