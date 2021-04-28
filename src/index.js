import Phaser from 'phaser';

import './index.css';

import PlayScene from './scenes/Play';
import MenuScene from './scenes/Menu';
import PreloadScene from './scenes/Preload';
import LevelsScene from './scenes/Levels';
import CreditScene from './scenes/Credit';

const isMobile = screen.width <= 480;
const scaleSettings = isMobile ? {
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
} : {};
const ZOOM_FACTOR = 2;
const MAP_WIDTH = 1600;
const WIDTH = document.body.offsetWidth;
const HEIGHT = 640;
const SHARED_CONFIG = {
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 0,
  width: WIDTH,
  height: HEIGHT,
  zoomFactor: ZOOM_FACTOR,
  debug: false,
  leftTopCorner: {
    x: (WIDTH - (WIDTH / ZOOM_FACTOR )) / 2,
    y: (HEIGHT - (HEIGHT / ZOOM_FACTOR )) / 2,
  },
  rightTopCorner: {
    x: WIDTH / ZOOM_FACTOR + (WIDTH - (WIDTH / ZOOM_FACTOR )) / 2,
    y: (HEIGHT - (HEIGHT / ZOOM_FACTOR )) / 2,
  },
  rightBottomCorner: {
    x: WIDTH / ZOOM_FACTOR + (WIDTH - (WIDTH / ZOOM_FACTOR )) / 2,
    y: (HEIGHT / ZOOM_FACTOR) + ((HEIGHT - (HEIGHT / ZOOM_FACTOR)) / 2),
  },
  lastLevel: 2,
};

const scenes = [PreloadScene, MenuScene, PlayScene, LevelsScene, CreditScene];
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
      debug: SHARED_CONFIG.debug,
    }
  },
  scene: initScenes(),
};

new Phaser.Game(config);
