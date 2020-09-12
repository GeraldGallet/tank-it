const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let gameScene;
let cells;

function initPlayer() {
  return {
    sprite: null,
    velocity: {
      x: 0,
      y: 0,
    },
    angle: 0, // RADIAN
    canShoot: true,
  };
}

let player1 = initPlayer();
let player2 = initPlayer();

function resetPlayer(player) {
  player.velocity = {
    x: 0,
    y: 0
  };
  player.angle = 0;
  player.canShoot = true;
  return player;
}
function preload() {
  this.load.image('vertical_wall', 'assets/vertical_wall.png');
  this.load.image('horizontal_wall', 'assets/horizontal_wall.png');
  this.load.image('player1', 'assets/player1.png');
  this.load.image('player2', 'assets/player2.png');
  this.load.image('missile1', 'assets/missile1.png');
  this.load.image('missile2', 'assets/missile2.png');
}

function create () {
  // Position are CENTER
  player1 = resetPlayer(player1);
  player2 = resetPlayer(player2);
  this.cameras.main.setBackgroundColor('rgba(200, 200, 200, 1)');

  walls = this.physics.add.staticGroup();
  cells = [];
  for (let y = 0; y < GAME_HEIGHT / CELL_SIZE; y += 1) {
    const cellsY = [];
      for (let x = 0; x < GAME_WIDTH / CELL_SIZE; x += 1) {
      const newCell = new Cell(x, y);
      cellsY.push(newCell);
    }
    cells.push(cellsY);
  }

  cells = createMaze(cells);
  console.log(cells);

  drawMap(cells);

  let startX = Math.floor(Math.random() * cells[0].length);
  let startY = Math.floor(Math.random() * cells.length);
  player1.sprite = this.physics.add.sprite((startX * CELL_SIZE) + CELL_SIZE / 2, (startY * CELL_SIZE) + CELL_SIZE / 2, 'player1').setScale(PLAYER_SCALE);
  player1.sprite.setCollideWorldBounds(true);
  this.physics.add.collider(player1.sprite, walls);

  startX = Math.floor(Math.random() * cells[0].length);
  startY = Math.floor(Math.random() * cells.length);
  player2.sprite = this.physics.add.sprite((startX * CELL_SIZE) + CELL_SIZE / 2, (startY * CELL_SIZE) + CELL_SIZE / 2, 'player2').setScale(PLAYER_SCALE);
  player2.sprite.setCollideWorldBounds(true);
  this.physics.add.collider(player2.sprite, walls);

  // A voir parce que ca fait de l'inertie c'est chiant
  // this.physics.add.collider(player1.sprite, player2.sprite);

  cursors = this.input.keyboard.createCursorKeys();

  restartGame = restartGame.bind(this);
  handleCollisionMissilePlayer = handleCollisionMissilePlayer.bind(this);
  // log();
}

function update() {
  if (player1.sprite) {
    if (cursors.left.isDown) {
      player1.angle = player1.angle - TICK_ROTATION;
    } else if (cursors.right.isDown) {
      player1.angle = player1.angle + TICK_ROTATION;
    }

    if (cursors.up.isDown) {
      player1.velocity.y = -BASE_VELOCITY;
    } else if (cursors.down.isDown) {
      player1.velocity.y = +BASE_VELOCITY;
    } else {
      player1.velocity.y = 0;
    }

    if (cursors.space.isDown && player1.canShoot) {
      console.log('Shoot !');
      const newMissile = this.physics.add.sprite(player1.sprite.x, player1.sprite.y, 'missile1').setScale(PLAYER_SCALE);
      // newMissile.onCollide = true;
      this.physics.add.collider(newMissile, walls, handleCollisionMissileWall);
      this.physics.add.collider(newMissile, player1.sprite, handleCollisionMissilePlayer);
      this.physics.add.collider(newMissile, player2.sprite, handleCollisionMissilePlayer);
      const newMissileVelocity = rotateVelocity(0, MISSILE_VELOCITY, player1.angle);
      newMissile.setAngle(player1.angle * 180 / PI);
      newMissile.setVelocityX(newMissileVelocity.x);
      newMissile.setVelocityY(newMissileVelocity.y);

      player1.canShoot = false;
      setTimeout(() => {
        player1.canShoot = true;
      }, SHOOT_RATE * 1000);
    }

    const rotatedVelocity = rotateVelocity(player1.velocity.x, player1.velocity.y, player1.angle);
    player1.sprite.setAngle(player1.angle * 180 / PI);
    player1.sprite.setVelocityX(rotatedVelocity.x);
    player1.sprite.setVelocityY(rotatedVelocity.y);
  }
}

function rotateVelocity(x, y, theta) {
  return {
    x: x * Math.cos(theta) - y * Math.sin(theta),
    y: x * Math.sin(theta) + y * Math.cos(theta)
  };
}

function handleCollisionMissileWall(missileObject, wallObject) {
  if (wallObject.texture.key === 'vertical_wall') {
    missileObject.setAngle(-missileObject.angle);
  } else {
    const curAngle = missileObject.angle;
    missileObject.setAngle(180 - missileObject.angle);
  }
  const newMissileVelocity = rotateVelocity(0, MISSILE_VELOCITY, missileObject.angle * PI / 180);
  missileObject.setVelocityX(newMissileVelocity.x);
  missileObject.setVelocityY(newMissileVelocity.y);
}

function handleCollisionMissilePlayer(missileObject, playerObject) {
  this.scene.pause();
  missileObject.destroy();

  let killerGuy = `Player ${missileObject.texture.key[missileObject.texture.key.length - 1]}`
  let deadGuy = `Player ${playerObject.texture.key[playerObject.texture.key.length - 1]}`;
  if (deadGuy === killerGuy) {
    deathText = `${deadGuy} shot himself (loser)`;
  } else {
    deathText = `Nice shot ${killerGuy}`;
  }
  this.add.text(400, 300, deathText, { font: '"Press Start 2P"', fontSize: '40px', color: '#000000' });
  setTimeout(() => {
    restartGame();
  }, 5000);
}

function log() {
  console.log(player1);
  console.log(player1.sprite.angle);
  setTimeout(() => {
    log();
  }, 3000);
}

function restartGame() {
  this.scene.restart();
}


function mySleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createMaze(maze, walls) {
  while(!isPerfectMaze(maze)) {
    const way = Math.random() > 0.5 ? 'vertical' : 'horizontal';
    const startX = Math.floor(Math.random() * (way === 'vertical' ? maze[0].length : maze[0].length - 1));
    const startY = Math.floor(Math.random() * (way === 'horizontal' ? maze.length : maze.length - 1));
    let destX = way === 'horizontal' ? startX + 1 : startX;
    let destY = way === 'vertical' ? startY + 1 : startY;

    if (maze[startY][startX].id !== maze[destY][destX].id) {
      if (way === 'vertical') {
        maze[startY][startX].walls.bottom = false;
        maze[destY][destX].walls.top = false;
      } else {
        maze[startY][startX].walls.right = false;
        maze[destY][destX].walls.left = false;
      }
      maze = changeId(maze, Math.max(maze[destY][destX].id, maze[startY][startX].id), Math.min(maze[destY][destX].id, maze[startY][startX].id));
    }
  }

  return maze;
}

function isPerfectMaze(cells) {
  for (let y = 0; y < cells.length; y += 1) {
    for (let x = 0; x < cells[y].length; x += 1) {
      if (cells[y][x].id !== 0) {
        return false;
      }
    }
  }

  return true;
}

function changeId(cells, previous, newId) {
  for (let y = 0; y < cells.length; y += 1) {
    for (let x = 0; x < cells[y].length; x += 1) {
      if (cells[y][x].id === previous) cells[y][x].id = newId;
    }
  }

  return cells;
}

function drawMap(toDraw) {
  for (let y = 0; y < toDraw.length; y += 1) {
    for (let x = 0; x < toDraw[y].length; x += 1) {
      toDraw[y][x].destroy();
      toDraw[y][x].draw(walls);
    }
  }
}
