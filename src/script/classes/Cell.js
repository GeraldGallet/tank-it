class Cell {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = (y * (GAME_WIDTH / CELL_SIZE + 1)) + x;

    this.walls = {
      top: true,
      right: true,
      bottom: true,
      left: true,
    };

    this.wallSprites = {
      top: null,
      right: null,
      bottom: null,
      left: null
    }
  }

  draw(walls) {
    for (let wY = (WALL_HEIGHT * WALL_SCALE) / 2; wY < CELL_SIZE; wY += WALL_HEIGHT) {
      if (this.walls.left) {
        this.wallSprites.left = walls.create(this.x * CELL_SIZE, this.y * CELL_SIZE + wY, 'vertical_wall').setScale(WALL_SCALE).refreshBody();
      }

      if (this.walls.right) {
        this.wallSprites.right = walls.create((this.x + 1) * CELL_SIZE, this.y * CELL_SIZE + wY, 'vertical_wall').setScale(WALL_SCALE).refreshBody();
      }
    }

    for (let wX = (WALL_HEIGHT * WALL_SCALE) / 2; wX < CELL_SIZE; wX += WALL_HEIGHT) {
      // console.log(wX);
      if (this.walls.top) {
        this.wallSprites.top = walls.create(this.x * CELL_SIZE + wX, this.y * CELL_SIZE, 'horizontal_wall').setScale(WALL_SCALE).refreshBody();
      }

      if (this.walls.bottom) {
        this.wallSprites.bottom = walls.create(this.x * CELL_SIZE + wX, (this.y + 1) * CELL_SIZE, 'horizontal_wall').setScale(WALL_SCALE).refreshBody();
      }
    }


    // walls.create(this.x * CELL_SIZE, this.y * CELL_SIZE + 5, 'wall').setScale(WALL_SCALE).refreshBody();
  }

  destroy() {
    if (this.wallSprites.top) {
      this.wallSprites.top.destroy();
    }

    if (this.wallSprites.right) {
      this.wallSprites.right.destroy();
    }

    if (this.wallSprites.bottom) {
      this.wallSprites.bottom.destroy();
    }

    if (this.wallSprites.left) {
      this.wallSprites.left.destroy();
    }
  }
}
