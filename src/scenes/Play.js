import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemies from '../groups/Enemies';

import initAnims from '../anims'
import Collectables from '../groups/Collectables';
import EventEmitter from '../events/Emitter';
import Hud from '../headsUpDisplay';

class Play extends Phaser.Scene {
  constructor(config) {
    super('PlayScene');
    this.player = null;
    this.config = config;
  }

  preload() {
    this.load.image('sky', 'assets/sky.png')
  }

  create({ gameStatus }) {
    this.score = 0;
    const map = this.createMap();

    initAnims(this.anims);

    const layers = this.createLayers(map);
    const playerZones = this.getPlayerZones(layers.playerZones);
    const player = this.createPlayer(playerZones.start);
    const enemies = this.createEnemies(layers.enemySpawns, layers.platformColliders);
    const collectibles = this.createCollectibles(layers.collectibles);
    this.createBackground(map);
    this.createHud();
    this.playThemeMusic();
    this.createPlayerColliders(player, {
      colliders: {
        collectibles,
        platformColliders: layers.platformColliders,
        projectiles: enemies.getAllProjectiles(),
        traps: layers.traps,
      }
    });
    this.createEnemyColliders(enemies, {
      colliders: {
        platformColliders: layers.platformColliders,
        player,
      }
    });
    this.createBackButton();
    this.createEndOfLevel(playerZones.end, player);
    this.setupFollowUpCameraOn(player);


    this.collectSound = this.sound.add('coin-pickup', { volume: 1 / 100 });

    if (gameStatus === 'PLAYER_LOST') {
      return;
    }
    this.createGameEvents();
  }

  getCurrentLevel() {
    return this.registry.get('level') || 1;
  }

  createBackButton() {
    const btn = this.add.image(this.config.rightBottomCorner.x, this.config.rightBottomCorner.y, 'back')
      .setOrigin(1)
      .setScrollFactor(0)
      .setScale(2)
      .setInteractive();

    btn.on('pointerup', () => {
      this.scene.start('MenuScene');
    })
  }

  createGameEvents() {
    EventEmitter.on('PLAYER_LOST', () => {
      this.scene.restart({ gameStatus: 'PLAYER_LOST'});
    })
  }

  createMap() {
    const map = this.make.tilemap({
      key: `level_${this.getCurrentLevel()}`,
    });
    map.addTilesetImage('main_lev_build_1', 'tiles-1');
    map.addTilesetImage('bg_spikes_tileset', 'bg-spikes-tileset');
    return map;
  }

  createHud() {
    this.hud = new Hud(this, 0, 0);
  }

  createLayers(map) {
    const tileset = map.getTileset('main_lev_build_1');
    const tilesetBg = map.getTileset('bg_spikes_tileset');
    const distance = map.createStaticLayer('distance', tilesetBg).setDepth(-12);
    const platformColliders = map.createStaticLayer('platforms_colliders', tileset);
    const environment = map.createStaticLayer('environment', tileset).setDepth(-2);
    const platforms = map.createStaticLayer('platforms', tileset);
    const traps = map.createStaticLayer('traps', tileset);
    const playerZones = map.getObjectLayer('player_zones');
    const enemySpawns = map.getObjectLayer('enemy_spawns');
    const collectibles = map.getObjectLayer('collectables');

    platformColliders.setCollisionByProperty({ collides: true });
    traps.setCollisionByExclusion(-1);

    return {
      collectibles,
      platformColliders,
      environment,
      platforms,
      playerZones,
      enemySpawns,
      traps,
    };
  }

  createBackground(map) {
    const bgObject = map.getObjectLayer('distance_bg').objects[0];
    this.spikesImage = this.add.tileSprite(bgObject.x, bgObject.y, this.config.width, this.config.height, 'bg-spikes-dark')
      .setOrigin(0, 1)
      .setDepth(-10)
      .setScrollFactor(0, 1);
    this.skyImage = this.add.tileSprite(0, 0, this.config.width, 180, 'sky-play')
      .setOrigin(0, 0)
      .setDepth(-11)
      .setScale(1.1)
      .setScrollFactor(0, 1);
  }

  createPlayer(playerZones) {
    return new Player(this, playerZones.x, playerZones.y);
  }

  createEnemies(spawnLayer, platformLayer) {
    const enemies = new Enemies(this);
    const enemyTypes = enemies.getTypes();
    spawnLayer.objects.map((spawnPoint, i) => {
      const enemy = new enemyTypes[spawnPoint.type](this, spawnPoint.x, spawnPoint.y);
      enemy.setPlatformColliders(platformLayer);
      enemies.add(enemy);
    });
    return enemies;
  }

  createCollectibles(collectableLayer) {
    const collectables = new Collectables(this).setDepth(-1);
    collectables.addFromLayer(collectableLayer);
    collectables.playAnimation('diamond-shine');

    return collectables;
  }

  createPlayerColliders(player, { colliders }) {
    player
      .addCollider(colliders.platformColliders)
      .addCollider(colliders.projectiles, this.onHit)
      .addCollider(colliders.traps, this.onHit)
      .addOverlap(colliders.collectibles, this.onCollect, this);
  }

  onCollect(entity, collectable) {
    this.score += collectable.score;
    this.hud.updateScoreBoard(this.score);
    // true: deactivate the object
    // true: hide game object
    this.collectSound.play();
    collectable.disableBody(true, true);
  }

  onHit(entity, source) {
    entity.takesHit(source);
  }

  createEnemyColliders(enemies, { colliders }) {
    enemies
      .addCollider(colliders.platformColliders)
      .addCollider(colliders.player, this.onPlayerCollision)
      .addCollider(colliders.player.projectiles, this.onHit)
      .addOverlap(colliders.player.meeleWeapon, this.onHit);
  }

  onPlayerCollision(enemy, player) {
    player.takesHit(enemy);
  }

  setupFollowUpCameraOn(player) {
    const { height, width, mapOffset, zoomFactor } = this.config;
    this.physics.world.setBounds(0, 0, width + mapOffset, height + 200);
    this.cameras.main.setBounds(0, 0, width + mapOffset, height).setZoom(zoomFactor);
    this.cameras.main.startFollow(player);
  }

  getPlayerZones(playerZonesLayer) {
    const playerZones = playerZonesLayer.objects;

    return {
      start: playerZones.find(zone => zone.name === 'startZone'),
      end: playerZones.find(zone => zone.name === 'endZone'),
    }
  }

  createEndOfLevel(end, player) {
    const endOfLevel  =this.physics.add.sprite(end.x, end.y, 'end')
      .setSize(5, this.config.height)
      .setAlpha(0)
      .setOrigin(0.5, 1);

    const eolOverlap = this.physics.add.overlap(player, endOfLevel, () => {
      eolOverlap.active = false;

      if (this.registry.get('level') === this.config.lastLevel) {
        this.scene.start('CreditScene');
        return;
      }

      this.registry.inc('level', 1);
      this.registry.inc('unlocked-levels', 1);
      this.scene.restart({ gameStatus: 'LEVEL_COMPLETED' });
    });
  }

  playThemeMusic() {
    if (this.sound.get('theme')) {
      return;
    }
    this.sound.add('theme', { loop: true, volume: 1 / 100 }).play();
  }

  update(time, delta) {
    this.spikesImage.tilePositionX = this.cameras.main.scrollX * 0.3;
    this.skyImage.tilePositionX = this.cameras.main.scrollX * 0.1;
  }
}

export default Play;
