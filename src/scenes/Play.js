import Phaser from 'phaser';
import Player from '../entities/Player';

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
    this.createPlayerColliders(player, { colliders: {
      platformColliders: layers.platformColliders,
    }});
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
    const environment = map.createStaticLayer('environment', tileset);
    const platforms = map.createStaticLayer('platforms', tileset);
    const playerZones = map.getObjectLayer('player_zones');

    platformColliders.setCollisionByProperty({ collides: true });

    return { platformColliders, environment, platforms, playerZones };
  }

  createPlayer(playerZones) {
    return new Player(this, playerZones.x, playerZones.y);
  }

  update(time, delta) {
  }

  createPlayerColliders(player, { colliders }) {
    player
      .addCollider(colliders.platformColliders);
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
