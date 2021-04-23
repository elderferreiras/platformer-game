import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemies from '../groups/Enemies';

import initAnims from '../anims'
import Collectable from '../collectables/Collectable';
import Collectables from '../groups/Collectables';

class Play extends Phaser.Scene {
  constructor(config) {
    super('PlayScene');
    this.player = null;
    this.config = config;
  }

  preload() {
    this.load.image('sky', 'assets/sky.png')
  }

  create() {
    this.score = 0;
    const map = this.createMap();

    initAnims(this.anims);

    const layers = this.createLayers(map);
    const playerZones = this.getPlayerZones(layers.playerZones);
    const player = this.createPlayer(playerZones.start);
    const enemies = this.createEnemies(layers.enemySpawns, layers.platformColliders);
    const collectibles = this.createCollectibles(layers.collectibles);

    this.createPlayerColliders(player, {
      colliders: {
        collectibles,
        platformColliders: layers.platformColliders,
        projectiles: enemies.getAllProjectiles(),
      }
    });
    this.createEnemyColliders(enemies, {
      colliders: {
        platformColliders: layers.platformColliders,
        player,
      }
    });
    this.createEndOfLevel(playerZones.end, player);
    this.setupFollowUpCameraOn(player);
  }

  createMap() {
    const map = this.make.tilemap({
      key: 'map',
    });
    map.addTilesetImage('main_lev_build_1', 'tiles-1');
    return map;
  }

  createLayers(map) {
    const tileset = map.getTileset('main_lev_build_1');
    const platformColliders = map.createStaticLayer('platforms_colliders', tileset);
    const environment = map.createStaticLayer('environment', tileset).setDepth(-2);
    const platforms = map.createStaticLayer('platforms', tileset);
    const playerZones = map.getObjectLayer('player_zones');
    const enemySpawns = map.getObjectLayer('enemy_spawns');
    const collectibles = map.getObjectLayer('collectables');

    platformColliders.setCollisionByProperty({ collides: true });

    return {
      collectibles,
      platformColliders,
      environment,
      platforms,
      playerZones,
      enemySpawns,
    };
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

  update(time, delta) {

  }

  createPlayerColliders(player, { colliders }) {
    player
      .addCollider(colliders.platformColliders)
      .addCollider(colliders.projectiles, this.onWeaponHit)
      .addOverlap(colliders.collectibles, this.onCollect, this);
  }

  onCollect(entity, collectable) {
    this.score += collectable.score;
    // true: deactivate the object
    // true: hide game object
    collectable.disableBody(true, true);
  }

  onWeaponHit(entity, source) {
    entity.takesHit(source);
  }

  createEnemyColliders(enemies, { colliders }) {
    enemies
      .addCollider(colliders.platformColliders)
      .addCollider(colliders.player, this.onPlayerCollision)
      .addCollider(colliders.player.projectiles, this.onWeaponHit)
      .addOverlap(colliders.player.meeleWeapon, this.onWeaponHit);
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
      console.log('Player has won!');
    });
  }

}

export default Play;
