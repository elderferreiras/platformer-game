import Phaser from "phaser";

import "./index.css";

import PlayScene from './scenes/Play';
import PreloadScene from './scenes/Preload';

const isMobile = screen.width <= 480;
const scaleSettings = isMobile ? {
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
} : {};

const MAP_WIDTH = 1600;
const WIDTH = document.body.offsetWidth;
const HEIGHT = 600;
const SHARED_CONFIG = {
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 0,
  width: WIDTH,
  height: HEIGHT,
  zoomFactor: 1.5,
};

const scenes = [PreloadScene, PlayScene];
const createScene = Scene => new Scene(SHARED_CONFIG);
const initScenes = () => scenes.map(createScene);

const config = {
  ...scaleSettings,
  // WebGL (Web graphics library) JS Api for rendering 2D and 3D graphics
  type: Phaser.AUTO,
  parent: 'phaser-game',
  width: WIDTH,
  height: HEIGHT,
  pixelArt: true,
  physics: {
    // Arcade physics plugin, manages physics simulation
    default: 'arcade',
    arcade: {
      debug: true,
    }
  },
  scene: initScenes(),
};

new Phaser.Game(config);
