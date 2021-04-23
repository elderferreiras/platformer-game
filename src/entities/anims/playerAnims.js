export default (anims) => {
  anims.create({
    key: 'idle',
    frames: anims.generateFrameNumbers('player', { start: 0, end: 7 }),
    frameRate: 5,
    repeat: -1,
  });

  anims.create({
    key: 'run',
    frames: anims.generateFrameNumbers('player', { start: 11, end: 16 }),
    frameRate: 5,
    repeat: -1,
  });

  anims.create({
    key: 'jump',
    frames: anims.generateFrameNumbers('player', { start: 17, end: 23 }),
    frameRate: 5,
    repeat: 1,
  });

  anims.create({
    key: 'throw',
    frames: anims.generateFrameNumbers('player-throw', { start: 0, end: 7 }),
    frameRate: 14,
    repeat: 0,
  });

  anims.create({
    key: 'slide',
    frames: anims.generateFrameNumbers('player-slide', { start: 0, end: 2 }),
    frameRate: 14,
    repeat: 0,
  });
}
