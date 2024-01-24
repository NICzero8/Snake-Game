const gameBoard = document.getElementById("gameBoard");
const currentScoreContainer = document.getElementById("currentScore");
const highScoreContainer = document.getElementById("highScore");
const dpad = document.getElementById("dpad");
const gridSize = 20;

let direction;
let gameIntervalId;
let score;
let highScore;
let gameInterval;
let scoreIncreaseValue;
let speedRate;
let gameStarted = false;

let eatSound = new Audio("./../sounds/snakeEat.wav");
let crashSound = new Audio("./../sounds/snakeCrash.mp3");
let turnSound = new Audio("./../sounds/snakeTurn.wav");
let gameOverSound = new Audio("./../sounds/gameOver.mp3");

let snake = {
  segments: null,
  direction: null,
  setNextCoordinates: function () {
    let dX;
    let dY;

    switch (this.direction) {
      case "up":
        dX = 0;
        dY = -1;
        break;

      case "down":
        dX = 0;
        dY = 1;
        break;

      case "left":
        dX = -1;
        dY = 0;
        break;

      case "right":
        dX = 1;
        dY = 0;
        break;
    }

    const newHead = {
      x: this.segments[0].x + dX,
      y: this.segments[0].y + dY,
      direction: this.direction,
    };
    return newHead;
  },
  checkCollisions: function (newHead) {
    let result = false;
    this.segments.forEach((segment) => {
      if (segment.x === newHead.x && segment.y === newHead.y) {
        result = true;
      }
    });
    return result;
  },
  createAnimation: function (dir) {
    return `move-${dir} linear ${gameInterval / 1000}s forwards`;
  },
  createHead: function (segment, segmentElement) {
    const head = document.createElement("div");
    const leftEye = document.createElement("div");
    const rightEye = document.createElement("div");
    const tongue = document.createElement("div");

    head.className = "snake-head";
    leftEye.className = "eye eye-left";
    rightEye.className = "eye eye-right";
    tongue.className = "tongue";

    head.appendChild(leftEye);
    head.appendChild(rightEye);
    head.appendChild(tongue);

    switch (segment.direction) {
      case "left":
        head.style.transform = "rotate(-90deg)";
        break;
      case "right":
        head.style.transform = "rotate(90deg)";
        break;
      case "down":
        head.style.transform = "rotate(180deg)";
        break;
    }
    segmentElement.appendChild(head);
  },
  draw: function () {
    this.segments.forEach((segment, i) => {
      const segmentElement = document.createElement("div");
      segmentElement.className = "snake";
      segmentElement.style.animation = snake.createAnimation(segment.direction);
      segmentElement.style.gridColumn = segment.x;
      segmentElement.style.gridRow = segment.y;

      if (i == 0) {
        this.createHead(segment, segmentElement);
      }
      gameBoard.insertAdjacentElement("beforeend", segmentElement);
    });
  },
  move: function () {
    let newHead = snake.setNextCoordinates();

    if (
      newHead.x === gridSize + 1 ||
      newHead.y === gridSize + 1 ||
      newHead.x === gridSize - gridSize ||
      newHead.y === gridSize - gridSize
    ) {
      crashSound.play();
      gameOver();
    } else if (snake.checkCollisions(newHead)) {
      crashSound.play();
      gameOver();
    } else {
      snake.segments.unshift(newHead);
      if (newHead.x === food.x && newHead.y === food.y) {
        eatSound.play();
        gameBoard.querySelector(".food").remove();
        score += scoreIncreaseValue;
        difficultyUp();
        food.draw();
        currentScoreContainer.innerText = score;
      } else {
        snake.segments.pop();
      }

      gameBoard.querySelectorAll(".snake").forEach((e) => e.remove());
      snake.draw();
    }
  },
  changeDirection: function (e) {
    if (e.target.parentNode.id === "dpad") {
      window.navigator.vibrate([20]);
    }

    if (
      e.code === "ArrowUp" ||
      e.code === "KeyW" ||
      e.detail.dir === "up" ||
      e.target.id === "button-up"
    ) {
      if (
        snake.segments[0].direction != "down" &&
        snake.segments[0].direction != "up"
      ) {
        snake.direction = "up";
        turnSound.play();
      }
    }

    if (
      e.code === "ArrowDown" ||
      e.code === "KeyS" ||
      e.detail.dir === "down" ||
      e.target.id === "button-down"
    ) {
      if (
        snake.segments[0].direction != "up" &&
        snake.segments[0].direction != "down"
      ) {
        snake.direction = "down";
        turnSound.play();
      }
    }

    if (
      e.code === "ArrowLeft" ||
      e.code === "KeyA" ||
      e.detail.dir === "left" ||
      e.target.id === "button-left"
    ) {
      if (
        snake.segments[0].direction != "right" &&
        snake.segments[0].direction != "left"
      ) {
        snake.direction = "left";
        turnSound.play();
      }
    }

    if (
      e.code === "ArrowRight" ||
      e.code === "KeyD" ||
      e.detail.dir === "right" ||
      e.target.id === "button-right"
    ) {
      if (
        snake.segments[0].direction != "left" &&
        snake.segments[0].direction != "right"
      ) {
        snake.direction = "right";
        turnSound.play();
      }
    }
  },
};

let food = {
  x: null,
  y: null,

  create: function () {
    this.x = Math.floor(Math.random() * gridSize) + 1;
    this.y = Math.floor(Math.random() * gridSize) + 1;
    snake.segments.forEach((segment) => {
      while (segment.x === this.x && segment.y === this.y) {
        console.log("food inside snake, restart");
        this.x = Math.floor(Math.random() * gridSize) + 1;
        this.y = Math.floor(Math.random() * gridSize) + 1;
      }
    });
  },
  draw: function () {
    this.create();

    const foodElement = document.createElement("div");
    const firstChild = document.createElement("span");
    const secondChild = document.createElement("span");

    foodElement.className = "food";
    foodElement.style.gridColumn = this.x;
    foodElement.style.gridRow = this.y;

    firstChild.style.cssText = "--i:0";
    secondChild.style.cssText = "--i:2";

    foodElement.appendChild(firstChild);
    foodElement.appendChild(secondChild);
    gameBoard.insertAdjacentElement("beforeend", foodElement);
  },
};

function createPalette() {
  document.documentElement.style.setProperty(
    "--snake-color",
    `hsl(${58 + speedRate * 60}, 36%, 82%)`
  );
  document.documentElement.style.setProperty(
    "--food-color",
    `hsl(${17 + speedRate * 30}, ${52 - speedRate * 3}%, ${71 + speedRate}%)`
  );
}

function getHighScore() {
  if (!localStorage.getItem("highScore")) {
    localStorage.setItem("highScore", 0);
  }
  highScore = localStorage.getItem("highScore");
}

function resetGame() {
  score = 0;
  snake.direction = "up";
  snake.segments = [{ x: 10, y: 10, direction: snake.direction }];
  gameInterval = 200;
  scoreIncreaseValue = 10;
  speedRate = 1;
  currentScoreContainer.innerText = score;

  createPalette();
  getHighScore();
  highScoreContainer.innerText = highScore;
}

function gameOverMessage() {
  let message = "try again";

  if (score >= 100) {
    message = "you can better";
  }

  if (score >= 200) {
    message = "not bad";
  }

  if (score >= 800) {
    message = "WOW!";
  }

  if (score >= 1400) {
    message = "AMAZING!!!";
  }

  if (score >= 1800) {
    message = "UNBELIEVABLE!!!";
  }

  if (score > highScore) {
    message = "it's a NEW RECORD!!!";
  }

  if (score == highScore) {
    message = "almost beat a record! COOL!!!";
  }

  return message;
}

function setListeners(context) {
  let f = startGame;
  if (context == "end") {
    f = setStartScreen;
  }

  function eventHandler() {
    f();
    window.removeEventListener("keydown", helper);
    gameBoard.removeEventListener("touchend", helper);
  }

  function helper(e) {
    if (e.code == "Space") {
      eventHandler();
    } else if (e.type == "touchend") {
      eventHandler();
    }
  }

  window.addEventListener("keydown", helper);
  gameBoard.addEventListener("touchend", helper);
}

function setStartScreen() {
  gameBoard.innerHTML = "";

  resetGame();

  const startScreenHTML = `<div class="start-screen">
        <h1 class="title">snake</h1>
        <p class="message pulse-message pc">press SPACE to start</p>
        <p class="message pulse-message touch">TOUCH to start</p>
    </div>`;

  gameBoard.insertAdjacentHTML("beforeend", startScreenHTML);

  setListeners("start");
}

function setGameOverScreen() {
  gameBoard.innerHTML = "";

  if (score > highScore) {
    localStorage.setItem("highScore", score);
  }

  gameOverSound.play();
  const gameOverScreenHTML = `<div class="gameover-screen">
            <h1 class="gameover_title">game over<br>:(</h1>
            <p class="message">
                your score <span>${score}</span>!<br>
                <div class="pulse-message">${gameOverMessage()}</div>
                <span class="pc">press SPACE to continue</span>
                <span class="touch">TOUCH to continue</span>
            </p>
    </div>`;

  gameBoard.insertAdjacentHTML("beforeend", gameOverScreenHTML);
  setListeners("end");
}

function gameOver() {
  clearInterval(gameIntervalId);
  window.removeEventListener("keydown", snake.changeDirection);
  window.removeEventListener("swiped", snake.changeDirection);
  dpad.removeEventListener("click", snake.changeDirection);

  snakeHeadElement = gameBoard.querySelector(".snake");
  snakeHeadElement.style.backgroundColor = "var(--main-accent-color)";
  snakeHeadElement.style.borderColor = "var(--main-accent-color)";

  setTimeout(setGameOverScreen, 1000);
}

function difficultyUp() {
  if ((snake.segments.length - 1) / 6 >= speedRate && gameInterval > 81) {
    scoreIncreaseValue += 5;
    gameInterval -= 17;
    speedRate += 1;

    clearInterval(gameIntervalId);
    gameIntervalId = setInterval(snake.move, gameInterval);
    createPalette();

    console.log("faster!", speedRate, scoreIncreaseValue);
  }
}

function startGame() {
  gameBoard.innerHTML = "";
  food.draw();
  window.addEventListener("keydown", snake.changeDirection);
  window.addEventListener("swiped", snake.changeDirection);
  dpad.addEventListener("click", snake.changeDirection);
  gameIntervalId = setInterval(snake.move, gameInterval);
}

setStartScreen();
