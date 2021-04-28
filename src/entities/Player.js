import Phaser from 'phaser';
import initAnimations from './anims/playerAnims';
import collidable from '../mixins/collidable';
import anims from '../mixins/anims';
import HealthBar from '../headsUpDisplay/HealthBar';
import Projectiles from '../attacks/Projectiles';
import MeleeWeapon from '../attacks/MeleeWeapon';
import { getTimestamp } from '../utils/functions';
import EventEmitter from '../events/Emitter';

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
    Object.assign(this, anims);

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
    this.isSliding = false;
    this.consecutiveJumps = 1;
    this.hasBeenHit = false;
    this.bounceVelocity = 250;
    this.health = 100;
    this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
    this.hp = new HealthBar(this.scene, this.scene.config.leftTopCorner.x + 5, this.scene.config.leftTopCorner.y + 5, 3, this.health);
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.meeleWeapon = new MeleeWeapon(this.scene, 0, 0, 'sword-default');
    this.projectiles = new Projectiles(this.scene, 'iceball-1');

    this.jumpSound = this.scene.sound.add('jump', { volume: 1 / 100 });
    this.projectileSound = this.scene.sound.add('projectile-attack', { volume: 1 / 100 });
    this.stepSound = this.scene.sound.add('step', { volume: 1 / 100 });
    this.swipeSound = this.scene.sound.add('swipe', { volume: 1 / 100 });

    initAnimations(this.scene.anims);

    this.handleAttacks();
    this.handleMovements();

    this.scene.time.addEvent({
      delay: 350,
      repeat: -1,
      callbackScope: this,
      callback: () => {
        if (this.isPlayingAnims('run')) {
          this.stepSound.play();
        }
      }
    })
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    if (this.hasBeenHit || this.isSliding || !this.body) {
      return;
    }

    if (this.getBounds().top > this.scene.config.height) {
      EventEmitter.emit('PLAYER_LOST');
      return;
    }

    const { space, up } = this.cursors;
    const onFloor = this.body.onFloor();
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
    const isUpJustDown = Phaser.Input.Keyboard.JustDown(up);

    if (this.cursors.left.isDown) {
      this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
      this.setVelocityX(-this.playerSpeed);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
      this.setVelocityX(this.playerSpeed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

   if ((onFloor || this.jumpCount < this.consecutiveJumps) && (isUpJustDown || isSpaceJustDown)) {
     this.jumpSound.play();
      this.setVelocityY(-this.playerSpeed * 2);
      this.jumpCount += 1;
    }

   if (onFloor) {
     this.jumpCount = 0;
   }

   if (this.isPlayingAnims('throw') || this.isPlayingAnims('slide')) {
    return;
   }

   onFloor ?
    this.body.velocity.x !== 0? this.play('run', true) : this.play('idle', true) : this.play('jump', true) ;
  }

  handleAttacks() {
    this.scene.input.keyboard.on('keydown-E', () => {
      if (this.timeFromLastSwing && this.timeFromLastSwing + this.meeleWeapon.attackSpeed > getTimestamp()) {
        return;
      }

      this.swipeSound.play();
      this.play('throw', true);
      this.meeleWeapon.swing(this);
      this.timeFromLastSwing = getTimestamp();
    });
    this.scene.input.keyboard.on('keydown-Q', () => {
      this.projectileSound.play();
      this.play('throw', true);
      this.projectiles.fireProjectile(this, 'iceball');
    });
  }

  handleMovements() {
    this.scene.input.keyboard.on('keydown-DOWN', () => {
      if (!this.body.onFloor()) {
        return;
      }

      this.body.setSize(this.width, this.height / 2);
      this.setOffset(0,this.height / 2);
      this.setVelocityX(0);
      this.play('slide', true);
      this.isSliding = true;
    });
    this.scene.input.keyboard.on('keyup-DOWN', () => {
      this.body.setSize(this.width, 38);
      this.setOffset(0, 0);
      this.isSliding = false;
    });
  }

  bounceOff(source) {
    if (source.body) {
      this.body.touching.right ?
        this.setVelocityX(-this.bounceVelocity) :
        this.setVelocityX(this.bounceVelocity);
    } else {
      this.body.blocked.right ?
        this.setVelocityX(-this.bounceVelocity) :
        this.setVelocityX(this.bounceVelocity);
    }


    setTimeout(() => {
      this.setVelocityY(-this.bounceVelocity);
    }, 0)
  }

  playDamageTween() {
    return this.scene.tweens.add({
      targets: this,
      duration: 100,
      yoyo: true,
      repeat: -1,
      tint: 0xffffff,
    })
  }

  takesHit(source) {
    if (this.hasBeenHit) { return; }

    this.health -= source.damage || source.properties.damage || 0;

    if (this.health <= 0) {
      EventEmitter.emit('PLAYER_LOST');
      return;
    }

    this.hasBeenHit = true;
    this.bounceOff(source);
    const hitAnim = this.playDamageTween();

    this.hp.decrease(this.health);

    source.deliversHit && source.deliversHit(this);

    this.scene.time.delayedCall(800, () => {
      this.hasBeenHit = false;
      hitAnim.stop();
      this.clearTint();
    });
  }
}

export default Player;
