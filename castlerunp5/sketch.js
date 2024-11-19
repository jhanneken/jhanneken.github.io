// Sound variables
let loose;
let gameSound;
let jumpSound;
let runSound;
let levelUp;
let j;
let mouseClicked = false;

// Image variables
let door, door_open, pwindow, controls, gameover, levelcompleted;

function preload() {
  // Load sounds
  levelUp = loadSound("./data/win.mp3");
  jumpSound = loadSound("./data/jump.mp3");
  runSound = loadSound("./data/footSteps.mp3");
  gameSound = loadSound("./data/game.mp3");
  loose = loadSound("./data/loose.mp3");

  // Setup background and other images
  door = loadImage("data/door.png");
  door_open = loadImage("data/door_open.png");
  pwindow = loadImage("data/window.png");
  controls = loadImage("data/controls.jpg");
  gameover = loadImage("data/gameover.jpg");
  levelcompleted = loadImage("data/levelcompleted.jpg");
}

function setup() {
  frameRate(60);
  let canvas = createCanvas(800, 800);
  canvas.parent("p5-container");
  j = new JumpnRun();
  gameSound.loop(); // Start background music
}

function draw() {
  j.run();
  mouseClicked = false;
}

// Key pressed event handler
function keyPressed() {
  j.gameKeyPressed();
}

// Key released event handler
function keyReleased() {
  j.gameKeyReleased();
}

// Mouse clicked event handler
function mousePressed() {
  mouseClicked = true;
}

class Animation {
  constructor() {
    this.images = [];
    this.aFrameRate = 60.0;
    this.x = 0.0;
    this.y = 0.0;
    this.speed = 1.0;
    this.numFrames = 0;
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.folder = "";
    this.name = "";
    this.extension = "";
    this.onlyOnce = false;
    this.played = false;
    this.pause = false;
  }

  setNumFrames(n) {
    this.numFrames = n;
  }

  setFiles(f, e) {
    this.folder = f;
    this.extension = e;
  }

  loadImages() {
    this.images = new Array(this.numFrames);

    for (let i = 0; i < this.numFrames; i++) {
      let frameNumber = i + 1;
      let sn;
      frameNumber < 10 ? (sn = "0" + frameNumber) : (sn = frameNumber);
      let imageName = `data/${this.folder}/${this.name}${sn}${this.extension}`;
      this.images[i] = loadImage(imageName);
    }

    // Adapt to different framerates
    this.speed = (60 / this.aFrameRate) * deltaTime;
  }

  play() {
    this.speed = 60 / this.aFrameRate;
    if (this.pause) {
      image(this.images[this.currentFrame % this.numFrames], this.x, this.y);
    } else {
      if (this.onlyOnce) {
        if (!this.played) {
          this.frameCounter += deltaTime / 1000.0; // Add time in seconds
          this.currentFrame = Math.floor(this.frameCounter / this.speed);
          image(
            this.images[this.currentFrame % this.numFrames],
            this.x,
            this.y
          );

          if (this.currentFrame + 1 >= this.numFrames) {
            this.played = true;
            this.frameCounter = 0;
          }
        }
      } else {
        // Reset frameCounter to avoid large numbers
        if (this.frameCounter > this.numFrames * this.speed) {
          this.frameCounter = 0;
        } else {
          this.frameCounter++;
        }

        // Adjust for framerate discrepancies
        this.currentFrame = Math.floor(this.frameCounter / this.speed);
        image(this.images[this.currentFrame % this.numFrames], this.x, this.y);
      }
    }
  }
}
class Enemy {
  constructor(inputP, enemySpeed) {
    this.p = inputP; // The platform the enemy is on
    this.y = this.p.y; // The y position of the enemy is set to the platform's y
    this.left = this.p.x1; // The left boundary of the platform
    this.right = this.p.x2; // The right boundary of the platform
    this.x = random(this.left, this.right); // Random initial x position between the platform boundaries
    this.speed = enemySpeed; // Speed of the enemy

    // Create animation objects for the enemy running to the right and left
    this.enemy_knight_running_right = new Animation();
    this.enemy_knight_running_right.aFrameRate = 18;
    this.enemy_knight_running_right.x = 0;
    this.enemy_knight_running_right.y = -90 / 2;
    this.enemy_knight_running_right.setNumFrames(12);
    this.enemy_knight_running_right.setFiles(
      "enemy_knight_running_right",
      ".png"
    );
    this.enemy_knight_running_right.loadImages();

    this.enemy_knight_running_left = new Animation();
    this.enemy_knight_running_left.aFrameRate = 18;
    this.enemy_knight_running_left.x = 0;
    this.enemy_knight_running_left.y = -90 / 2;
    this.enemy_knight_running_left.setNumFrames(12);
    this.enemy_knight_running_left.setFiles(
      "enemy_knight_running_left",
      ".png"
    );
    this.enemy_knight_running_left.loadImages();

    this.goingLeft = false;
    this.ewidth = 40;
    this.eheight = 50;
  }

  drawEnemy() {
    const scaledDelta = deltaTime / 16.67; // Normalize deltaTime for 60 FPS

    // Move left and right within the platform bounds
    if (this.x < this.left + this.ewidth / 2) {
      this.goingLeft = false;
    }

    if (this.x > this.right - this.eheight / 2) {
      this.goingLeft = true;
    }

    if (!this.goingLeft) {
      this.x += this.speed * scaledDelta; // Move right with frame-independent speed
    } else {
      this.x -= this.speed * scaledDelta; // Move left with frame-independent speed
    }

    // Adjust the speed of the animations based on the enemy's movement speed
    this.enemy_knight_running_right.speed = (60 / this.speed) * 0.1;
    this.enemy_knight_running_left.speed =
      this.enemy_knight_running_right.speed;

    push(); // Use push() instead of pushMatrix()
    translate(this.x, this.y); // Translate the enemy to its current position

    // Play the animation depending on which direction the enemy is facing
    if (!this.goingLeft) {
      this.enemy_knight_running_right.play(); // Play the right-facing animation
    } else {
      this.enemy_knight_running_left.play(); // Play the left-facing animation
    }

    pop(); // Use pop() instead of popMatrix()
  }
}

class JumpPlayer {
  constructor(startPosX, startPosY) {
    this.xDirection = 0;
    this.xPos = startPosX;
    this.yPos = startPosY;
    this.playerSize = 20;
    this.jspeed = 0;
    this.speedDelta = 0.2;
    this.maxSpeed = 25;
    this.ySpeed = 0;
    this.maxYSpeed = 20;
    this.jumpForce = 17;
    this.onFloor = true;

    // Load animations
    this.loadKnightAnimations();
  }

  loadKnightAnimations() {
    // Load knight running right
    this.knight_running_right = new Animation();
    this.knight_running_right.aFrameRate = 18;
    this.knight_running_right.x = 0;
    this.knight_running_right.y = -90 / 2;
    this.knight_running_right.setNumFrames(12);
    this.knight_running_right.setFiles("knight_running_right", ".png");
    this.knight_running_right.loadImages();

    // Load knight running left
    this.knight_running_left = new Animation();
    this.knight_running_left.aFrameRate = 18;
    this.knight_running_left.x = 0;
    this.knight_running_left.y = -90 / 2;
    this.knight_running_left.setNumFrames(12);
    this.knight_running_left.setFiles("knight_running_left", ".png");
    this.knight_running_left.loadImages();

    // Load knight idle
    this.knight_idle = new Animation();
    this.knight_idle.aFrameRate = 3;
    this.knight_idle.x = 0;
    this.knight_idle.y = -90 / 2;
    this.knight_idle.setNumFrames(9);
    this.knight_idle.setFiles("knight_idle", ".png");
    this.knight_idle.loadImages();

    // Load knight jumping images
    this.jumpingRight = loadImage("./data/knight_jumping_right.png");
    this.jumpingLeft = loadImage("./data/knight_jumping_left.png");
  }

  drawPlayer() {
    const animationSpeedScale = deltaTime / 16.67;
    this.knight_running_right.speed =
      (60 / this.jspeed) * 0.5 * animationSpeedScale;
    this.knight_running_left.speed =
      (60 / this.jspeed) * -0.5 * animationSpeedScale;

    push();
    translate(this.xPos, this.yPos);

    if (this.onFloor) {
      if (this.jspeed > 0.3) {
        this.knight_running_right.play();
      } else if (this.jspeed < -0.3) {
        this.knight_running_left.play();
      } else {
        this.knight_idle.play();
      }
    } else {
      if (this.jspeed >= 0) {
        image(this.jumpingRight, 0, -90 / 2); // Jumping right
      } else {
        image(this.jumpingLeft, 0, -90 / 2); // Jumping left
      }
    }
    pop();
  }

  move() {
    const scaledDelta = deltaTime / 16.67;

    if (this.xDirection == 1) {
      if (this.jspeed < this.maxSpeed) {
        this.jspeed += this.speedDelta * scaledDelta;
      }
    }

    if (this.xDirection == -1) {
      if (this.jspeed > -this.maxSpeed) {
        this.jspeed -= this.speedDelta * scaledDelta;
      }
    }

    if (this.xDirection == 0) {
      this.jspeed -= (this.jspeed / (2 / this.speedDelta)) * scaledDelta;
      if (Math.abs(this.jspeed) < 0.05) {
        this.jspeed = 0;
      }
    }

    this.xPos += this.jspeed * scaledDelta;
    this.gravity();
  }

  changeDirection() {
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      // Right arrow or 'd' key
      this.xDirection = 1;
      if (!runSound.isPlaying()) {
        runSound.loop();
      }
    }

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      // Left arrow or 'a' key
      this.xDirection = -1;
      if (!runSound.isPlaying()) {
        runSound.loop();
      }
    }
  }

  stopDirection() {
    if (!keyIsDown(RIGHT_ARROW) && !keyIsDown(68) && this.xDirection == 1) {
      this.xDirection = 0;
      runSound.stop();
    }

    if (!keyIsDown(LEFT_ARROW) && !keyIsDown(65) && this.xDirection == -1) {
      this.xDirection = 0;
      runSound.stop();
    }
  }

  jump() {
    if (this.onFloor && keyIsDown(32)) {
      // Space bar key

      this.ySpeed = -this.jumpForce;

      jumpSound.play();
      this.onFloor = false;
    }
  }

  gravity() {
    const scaledDelta = deltaTime / 16.67;

    if (!this.onFloor) {
      //this.ySpeed += 1;
      this.ySpeed += 1 * scaledDelta; // Apply gravity when not on the floor
    }
    if (this.onFloor) {
      this.ySpeed = 0; // Reset vertical speed when on the floor
    }
    if (this.ySpeed >= this.maxYSpeed) {
      this.ySpeed = this.maxYSpeed; // Limit falling speed
    }
    //this.yPos += this.ySpeed;
    this.yPos += this.ySpeed * scaledDelta;
  }

  testOnFloor(lx1, rx2, by) {
    if (
      this.xPos > lx1 &&
      this.xPos < rx2 &&
      this.ySpeed >= 0 &&
      by >= this.yPos &&
      by < this.yPos + this.maxYSpeed
    ) {
      this.onFloor = true;
      this.yPos = by;
    }
    if (by == this.yPos && !(this.xPos > lx1 && this.xPos < rx2)) {
      this.onFloor = false;
    }
  }
}

class JumpnRun {
  constructor() {
    this.activePlayer = [];
    this.platforms = [];
    this.enemies = [];
    this.enemySpeed = 0;
    this.gameState = 0; // 0 = before start, 1 = running, 2 = paused, 3 = game over, 4 = win
    this.startPos = createVector();
    this.finishPos = createVector();
    this.bg_jumpnrun;
    this.numberOfPlatforms = 8;
    this.numberOfEnemies = 3;
    this.medianPlatform = 180;
    this.platformRandom = 30;
    this.yPositions = [];
    this.platformWidths = [];
    this.platformLefts = [];
    this.windowPositions = [];
    this.jumpCounter = 0;
    this.torch;
    this.finished = false;
    this.level = 1;
    this.pressedKeys = [];
    this.pressedAtEnd = [];

    // Text setup
    textSize(36);
    textAlign(CENTER, CENTER);
    imageMode(CENTER);
    this.bg_jumpnrun = loadImage("data/bg_jumpnrun.jpg");
  }

  setupJump() {
    this.finished = false;
    this.setDifficulty(this.level);

    this.yPositions = new Array(this.numberOfPlatforms);
    this.platformWidths = new Array(this.numberOfPlatforms);
    this.platformLefts = new Array(this.numberOfPlatforms);
    this.windowPositions = new Array(this.numberOfPlatforms);

    this.platformWidths = this.calculatePlatformWidth(
      this.numberOfPlatforms,
      this.medianPlatform,
      this.platformRandom
    );

    for (let i = 0; i < this.numberOfPlatforms; i++) {
      this.platformLefts[i] = int(random(0, width - this.platformWidths[i]));
      this.windowPositions[i] = int(random(40, width - 40));
      this.yPositions[i] = 150 + i * (645 / (this.numberOfPlatforms - 1));
    }

    // Adjust the platform positions to ensure they are spaced properly
    for (let i = 1; i < this.numberOfPlatforms; i++) {
      if (
        this.platformLefts[i] -
          (this.platformLefts[i - 1] + this.platformWidths[i - 1]) >
        70
      ) {
        this.platformLefts[i] =
          this.platformLefts[i - 1] + this.platformWidths[i - 1] + 70;
      }
    }

    for (let i = 1; i < this.numberOfPlatforms; i++) {
      if (
        this.platformLefts[i - 1] -
          (this.platformLefts[i] + this.platformWidths[i]) >
        70
      ) {
        this.platformLefts[i] =
          this.platformLefts[i - 1] - this.platformWidths[i] - 70;
      }
    }

    // Create platforms
    this.platforms = [];
    for (let i = 0; i < this.numberOfPlatforms; i++) {
      this.platforms.push(
        new Platform(
          this.platformLefts[i],
          this.platformLefts[i] + this.platformWidths[i],
          this.yPositions[i]
        )
      );
    }

    // Setup enemies
    let enemyPlatform = [];
    for (let i = 1; i < this.numberOfPlatforms - 1; i++) {
      enemyPlatform.push(i);
    }
    enemyPlatform = shuffle(enemyPlatform);
    this.enemies = [];
    for (let i = 0; i < this.numberOfEnemies; i++) {
      this.enemies.push(
        new Enemy(this.platforms[enemyPlatform[i]], this.enemySpeed)
      );
    }

    // Setup start position
    let bottom = this.platforms[this.platforms.length - 1];
    this.startPos.x = random(bottom.x1, bottom.x2);
    this.startPos.y = bottom.y - 1;

    // Create the active player
    this.activePlayer.push(new JumpPlayer(this.startPos.x, this.startPos.y));

    // Setup finish position
    let top = this.platforms[0];
    this.finishPos.x = random(top.x1, top.x2 - door.width);
    this.finishPos.y = top.y - (door.height + 3);

    // Setup torch animation
    this.torch = new Animation();
    this.torch.aFrameRate = 0.7;
    this.torch.setNumFrames(3);
    this.torch.setFiles("/torch", ".png");
    this.torch.loadImages();
  }

  run() {
    image(this.bg_jumpnrun, width / 2, height / 2);
    noStroke();
    text("Level: " + this.level, 80, 40);
    if (this.gameState === 1) {
      // Draw platforms
      this.platforms.forEach((p) => p.drawPlatform());

      // Draw windows and torches
      for (let i = 0; i < this.numberOfPlatforms - 1; i++) {
        if (i % 2 !== 0) {
          this.torch.x = this.windowPositions[i] + 80;
          this.torch.y = this.yPositions[i] + 45;
          this.torch.play();
          image(pwindow, this.windowPositions[i], this.yPositions[i] + 45);
        } else {
          this.torch.x = this.windowPositions[i];
          this.torch.y = this.yPositions[i] + 45;
          this.torch.play();
        }
      }

      imageMode(CORNER);
      this.drawFinish();
      imageMode(CENTER);

      // Draw enemies
      this.enemies.forEach((e) => e.drawEnemy());

      if (this.gameState === 1) {
        let a = this.activePlayer[0];
        a.drawPlayer();
        a.move();

        // Check collision with platforms
        this.platforms.forEach((p) => a.testOnFloor(p.x1, p.x2, p.y));
      }

      if (this.gameState === 2) {
        let a = this.activePlayer[0];
        a.drawPlayer();
      }
    }

    this.checkGameState();
  }

  gameKeyPressed() {
    if (this.gameState === 1) {
      let a = this.activePlayer[0];
      a.changeDirection();
      a.jump();
    }
    if (!this.pressedKeys.includes(key)) {
      // Prevent duplicates
      this.pressedKeys.push(key);
    }
  }

  gameKeyReleased() {
    if (!this.keysPressedAtEnd) {
      this.keysPressedAtEnd = [];
    }
    this.pressedKeys = this.pressedKeys.filter((k) => k !== key);
    // Check if the key exists in keysPressedAtEnd and remove it
    if (this.keysPressedAtEnd.includes(key)) {
      this.keysPressedAtEnd = this.keysPressedAtEnd.filter((k) => k !== key);
      return; // Exit to prevent triggering further actions
    }

    if (this.gameState === 1) {
      let a = this.activePlayer[0];
      a.stopDirection();
    }

    if (this.gameState === 0) {
      this.setupJump();
      this.gameState = 1;
    }

    if (this.gameState === 2) {
      this.gameState = 1;
    }

    if (this.gameState === 4) {
      this.level++;
      this.setupJump();
      this.gameState = 1;
    }

    if (this.gameState === 3) {
      this.level = 1;
      this.setupJump();
      this.gameState = 1;
    }
  }

  saveCurrentlyPressedKeys() {
    this.keysPressedAtEnd = [...this.pressedKeys];
  }

  checkGameState() {
    if (this.gameState === 1) {
      let a = this.activePlayer[0];
      if (a.yPos > height + 100) {
        this.activePlayer.shift();
        loose.play();
        this.gameState = 3;
        this.saveCurrentlyPressedKeys();
      }

      if (
        a.xPos >= this.finishPos.x + 45 &&
        a.xPos <= this.finishPos.x + 90 &&
        a.yPos >= this.finishPos.y &&
        a.yPos <= this.finishPos.y + 115
      ) {
        this.gameState = 4;
        levelUp.play();
        this.activePlayer.shift();
        this.saveCurrentlyPressedKeys();
      }

      for (let e of this.enemies) {
        if (
          a.xPos >= e.x - e.ewidth &&
          a.xPos <= e.x + e.ewidth &&
          a.yPos >= e.y - e.eheight - 25 &&
          a.yPos <= e.y + e.eheight - 25
        ) {
          this.activePlayer.shift();
          loose.play();
          this.gameState = 3;

          this.saveCurrentlyPressedKeys();
        }
      }
    }

    if (this.gameState === 3) {
      this.startCounter();
      if (this.jumpCounter > 150) {
        this.finished = true;
      }
      image(gameover, width / 2, height / 2);
    }

    if (this.gameState === 0) {
      image(controls, width / 2, height / 2);
    }

    if (this.gameState === 4) {
      this.startCounter();
      if (this.jumpCounter > 150) {
        this.finished = true;
      }
      image(levelcompleted, width / 2, height / 2);
    }
  }

  drawFinish() {
    if (this.gameState < 4) {
      image(door_open, this.finishPos.x, this.finishPos.y);
    } else {
      image(door, this.finishPos.x, this.finishPos.y);
    }
  }

  drawTextBox(t) {
    textSize(36);
    textAlign(CENTER, CENTER);
    let p1 = t.indexOf("\n");
    let hw = p1 > -1 ? textAscent() * 3 : textAscent();
    let tw = textWidth(t);
    noStroke();
    fill(255);
    rectMode(CENTER);
    rect(width / 2, height / 2 + 5, tw + 50, hw + 50, 10);
    fill(0);
    text(t, width / 2, height / 2);
    rectMode(CORNER);
  }

  calculatePlatformWidth(n, v, d) {
    let a = new Array(n);
    let b = new Array(n);
    let list = [];
    let sum = 0;

    for (let i = 0; i < n; i++) {
      a[i] = int(random(0.0, 1000.0));
      sum += a[i];
    }

    for (let i = 0; i < n; i++) {
      a[i] = (a[i] / sum) * 1000 - 1000.0 / n;
    }

    a.sort((a, b) => a - b);

    for (let i = 0; i < n; i++) {
      if (a[i] > 1000.0 / n) {
        let s = a[i] - 1000.0 / n;
        a[i] = 1000.0 / n;
        a[0] += s;
      }
      if (a[i] < -1000.0 / n) {
        let s = a[i] + 1000.0 / n;
        a[i] = -1000.0 / n;
        a[n - 1] += s;
      }
    }

    a.sort((a, b) => a - b);

    for (let i = 0; i < n; i++) {
      a[i] = map(a[i], -1000.0 / n, 1000.0 / n, -d, d);
    }

    for (let i = 0; i < n; i++) {
      list.push(int(a[i]) + v);
    }

    return shuffle(list);
  }

  setDifficulty(d) {
    if (d > 10) {
      if (d > 20) {
        this.numberOfPlatforms = 6;
        this.numberOfEnemies = 4;
      } else {
        this.numberOfPlatforms = 7;
        this.numberOfEnemies = 3;
      }
    } else {
      this.numberOfPlatforms = 8;
      this.numberOfEnemies = 2;
    }

    this.medianPlatform = constrain(int(390 - d * 4.75), 180, 390);
    this.platformRandom = this.medianPlatform / 2;
    this.enemySpeed = 0.8 + d * 0.0175;
  }

  startCounter() {
    this.jumpCounter++;
  }
}

class Platform {
  constructor(x1i, x2i, y1i) {
    this.x1 = x1i;
    this.x2 = x2i;
    this.y = y1i;
  }

  drawPlatform() {
    strokeWeight(8);
    stroke(39, 51, 64);
    line(this.x1, this.y, this.x2, this.y);
  }
}
