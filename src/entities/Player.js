import Phaser from 'phaser';
import initAnimations from './anims/playerAnims';
import collidable from '../mixins/collidable';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.gravity = 500;
    this.velocityY = 200;
    this.playerSpeed = 150;

    // Mixins
    Object.assign(this, collidable);

    this.init();
    this.initEvents();
  }

  init() {
    this.body.setSize(20, 36);
    this.body.setGravityY(this.gravity);
    this.setVelocityY(this.velocityY);
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 1);
    this.jumpCount = 0;
    this.consecutiveJumps = 1;

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    initAnimations(this.scene.anims);
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    const { space, up } = this.cursors;
    const onFloor = this.body.onFloor();
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
    const isUpJustDown = Phaser.Input.Keyboard.JustDown(up);

    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.playerSpeed);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.playerSpeed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

   if ((onFloor || this.jumpCount < this.consecutiveJumps) && (isUpJustDown || isSpaceJustDown)) {
      this.setVelocityY(-this.playerSpeed * 2);
      this.jumpCount += 1;
    }

   if (onFloor) {
     this.jumpCount = 0;
   }

   onFloor ?
    this.body.velocity.x !== 0? this.play('run', true) : this.play('idle', true) : this.play('jump', true) ;
  }
}

export default Player;
