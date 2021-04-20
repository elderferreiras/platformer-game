import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemies from '../groups/Enemies';

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
    const map = this.createMap();
    const layers = this.createLayers(map);
    const playerZones = this.getPlayerZones(layers.playerZones);
    const player = this.createPlayer(playerZones.start);
    const enemies = this.createEnemies(layers.enemySpawns, layers.platformColliders);
    this.createPlayerColliders(player, {
      colliders: {
        platformColliders: layers.platformColliders,
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

  finishDrawing(pointer, layer) {
    this.line.x2 = pointer.worldX;
    this.line.y2 = pointer.worldY;
    this.graphics.clear();
    this.graphics.strokeLineShape(this.line);

    this.tileHits = layer.getTilesWithinShape(this.line);

    if (this.tileHits.length > 0) {
      this.tileHits.forEach(tile => {
        if (tile.index !== -1) {
          tile.setCollision(true);
        }
      })
    }

    this.drawDebug(layer);
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
    const environment = map.createStaticLayer('environment', tileset);
    const platforms = map.createStaticLayer('platforms', tileset);
    const playerZones = map.getObjectLayer('player_zones');
    const enemySpawns = map.getObjectLayer('enemy_spawns');

    platformColliders.setCollisionByProperty({ collides: true });

    return { platformColliders, environment, platforms, playerZones, enemySpawns };
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

  update(time, delta) {

  }

  createPlayerColliders(player, { colliders }) {
    player
      .addCollider(colliders.platformColliders);
  }

  onWeaponHit(entity, source) {
    entity.takesHit(source);
  }

  createEnemyColliders(enemies, { colliders }) {
    enemies
      .addCollider(colliders.platformColliders)
      .addCollider(colliders.player, this.onPlayerCollision)
      .addCollider(colliders.player.projectiles, this.onWeaponHit);
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
