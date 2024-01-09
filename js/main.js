const gameBoard = document.getElementById('gameBoard');
const currentScoreContainer = document.getElementById('currentScore');
const highScoreContainer = document.getElementById('highScore');
const gridSize = 20;

let snake;
let food;
let direction;
let gameIntervalId;
let score;
let hightScore;
let gameInterval;
let scoreIncreaseValue;
let speedRate;
let gameStarted = false;

function createPalette() {
    document.documentElement.style.setProperty('--snake-color', `hsl(${58+speedRate*60}, 36%, 82%)`);
    document.documentElement.style.setProperty('--food-color', `hsl(${17+speedRate*30}, ${52-speedRate*3}%, ${71+speedRate}%)`);
    // document.documentElement.style.setProperty('--main-accent-color', `hsl(${4+speedRate*10}, 45%, 64%)`);
    // document.documentElement.style.setProperty('--main-bg-color', `hsl(${34+speedRate*30}, 46%, 86%)`);
}

function getHighScore() {
    if (!localStorage.getItem('highScore')) {
      localStorage.setItem('highScore', 0)
    }

    hightScore = localStorage.getItem('highScore');
};

function resetGame() {
    score = 0;
    direction = 'up';
    snake = [{x: 10, y: 10, direction: direction}];
    gameInterval = 200;
    scoreIncreaseValue = 10;
    speedRate = 1;
    currentScoreContainer.innerText = score;

    createPalette()

    getHighScore();
    highScoreContainer.innerText = hightScore;
}

function createFood() {
    let x = Math.floor(Math.random() * gridSize) + 1;
    let y = Math.floor(Math.random() * gridSize) + 1;

    snake.forEach((segment) => {
        while (segment.x === x && segment.y === y) {
            console.log('while')
            x = Math.floor(Math.random() * gridSize) + 1;
            y = Math.floor(Math.random() * gridSize) + 1;
        } 
    })

    return {x: x, y: y};
}

function createAnimation(dir) {
    return `move-${dir} linear ${gameInterval/1000}s forwards`;
}

function drawSnake() {

    snake.forEach((segment) => {
        const segmentElement = document.createElement('div');
        segmentElement.className = 'snake';
        segmentElement.style.animation = createAnimation(segment.direction);
        segmentElement.style.gridColumn = segment.x;
        segmentElement.style.gridRow = segment.y;
        gameBoard.insertAdjacentElement("beforeend", segmentElement);
    })

}

function drawFood() {
    food = createFood();

    const foodElement = document.createElement('div');
    const firstChild = document.createElement('span');
    const secondChild = document.createElement('span');

    foodElement.className = 'food';
    foodElement.style.gridColumn = food.x;
    foodElement.style.gridRow = food.y;

    firstChild.style.cssText = '--i:0'
    secondChild.style.cssText = '--i:2'

    foodElement.appendChild(firstChild);
    foodElement.appendChild(secondChild);
    gameBoard.insertAdjacentElement("beforeend", foodElement);
}

function gameOverMessage() {

    let message = 'try again';

    if (score >= 100) {
        message = 'not bad'
    }
    
    if (score >= 500) {
        message = 'WOW!'
    }
    
    if (score >= 1000) {
        message = 'AMAZING!!!'
    }

    if (score > hightScore) {
        message = "it's a NEW RECORD!!!"
    }

    if (score == hightScore) {
        message = "almost beat a record! COOL!!!"
    }

    return message;
}

function eventHandler(context) {
    if (context == 'start') {
        gameBoard.addEventListener('keydown', helper)
        gameBoard.addEventListener('touchend', helper)
    
        function helper(e) {
            if (e.code == 'Space') {
                startGame();
                gameBoard.removeEventListener('keydown', helper);
                gameBoard.removeEventListener('touchend', helper);
            } else if (e.type == 'touchend') {
                startGame();
                gameBoard.removeEventListener('keydown', helper);
                gameBoard.removeEventListener('touchend', helper);
            }
        }
    } else if (context == 'end') {
        gameBoard.addEventListener('keydown', helper)
        gameBoard.addEventListener('touchend', helper)
    
        function helper(e) {
            if (e.code == 'Space') {
                setStartScreen();
                gameBoard.removeEventListener('keydown', helper);
                gameBoard.removeEventListener('touchend', helper);
            } else if (e.type == 'touchend') {
                setStartScreen();
                gameBoard.removeEventListener('keydown', helper);
                gameBoard.removeEventListener('touchend', helper);
            }
        }
    }
}

function setStartScreen() {

    gameBoard.innerHTML = '';

    resetGame ();

    const startScreenHTML = `<div class="start-screen">
        <h1 class="title">snake</h1>
        <p class="message pulse-message pc">press SPACE to start</p>
        <p class="message pulse-message touch">TOUCH to start</p>
    </div>`

    gameBoard.insertAdjacentHTML("beforeend", startScreenHTML);

    eventHandler('start');
}

function setGameOverScreen() {

    gameBoard.innerHTML = '';

    if (score > hightScore) {
        localStorage.setItem('highScore', score);
    }

    const gameOverScreenHTML = `<div class="gameover-screen">
            <h1 class="gameover_title">game over<br>:(</h1>
            <p class="message">
                your score <span>${score}</span>!<br>
                <div class="pulse-message">${gameOverMessage()}</div>
                <span class="pc">press SPACE to continue</span>
                <span class="touch">TOUCH to continue</span>
            </p>
    </div>`

    gameBoard.insertAdjacentHTML("beforeend", gameOverScreenHTML);

    eventHandler('end');
}

function gameOver() {

    clearInterval(gameIntervalId);
    window.removeEventListener('keydown', changeDirection);

    snakeHeadElement = gameBoard.querySelector('.snake');
    snakeHeadElement.style.backgroundColor = 'var(--main-accent-color)';
    snakeHeadElement.style.borderColor = 'var(--main-accent-color)';

    setTimeout(setGameOverScreen, 1000);
    
}

function setNextCoordinates() {

    let dX;
    let dY;

    switch (direction) {
        case 'up': 
        dX = 0;
        dY = -1;
        break;
    
        case 'down': 
        dX = 0;
        dY = 1;
        break;
    
        case 'left': 
        dX = -1;
        dY = 0;
        break;
    
        case 'right': 
        dX = 1;
        dY = 0;
        break;
        }

    const newHead = {x: snake[0].x + dX, y: snake[0].y + dY, direction: direction};
    return newHead
}

function checkCollisions(newHead) {
    let result = false;

    snake.forEach((segment) =>{
        if (segment.x === newHead.x && segment.y === newHead.y) {
            result=true;
        }
    })

    return result;
}

function changeDirection(e) {
    switch (e.code) {
        case 'ArrowUp': 
        case 'KeyW':
        if (snake[0].direction != 'down') {
            direction = 'up'
        }
        break;

        case 'ArrowDown':
        case 'KeyS': 
        if (snake[0].direction != 'up') {
            direction = 'down'
        }
        break;

        case 'ArrowLeft': 
        case 'KeyA':
        if (snake[0].direction != 'right') {
            direction = 'left'
        }
        break;

        case 'ArrowRight': 
        case 'KeyD':
        if (snake[0].direction != 'left') {
            direction = 'right'
        }
        break;
    }

    switch (e.detail.dir) {
        case 'up': 
        if (snake[0].direction != 'down') {
            direction = 'up'
        }
        break;

        case 'down':
        if (snake[0].direction != 'up') {
            direction = 'down'
        }
        break;

        case 'left': 
        if (snake[0].direction != 'right') {
            direction = 'left'
        }
        break;

        case 'right': 
        if (snake[0].direction != 'left') {
            direction = 'right'
        }
        break;
    }
}

function difficultyUp() {
    if (Math.floor(score / 100) >= speedRate && gameInterval>60) {
        scoreIncreaseValue += 5;
        gameInterval -= 20;
        speedRate += 1;

        clearInterval(gameIntervalId);
        gameIntervalId = setInterval(moveSnake, gameInterval);
        createPalette();

        console.log('faster!', speedRate, scoreIncreaseValue)
    } 
}

function moveSnake() {

    let newHead = setNextCoordinates();

    if (newHead.x === 21 || newHead.y === 21 || newHead.x === 0 || newHead.y === 0 ) {
       
        gameOver();

    } else if (checkCollisions(newHead)) {

        gameOver();

    } else {

        snake.unshift(newHead);

        if (newHead.x === food.x && newHead.y === food.y) {
            gameBoard.querySelector('.food').remove();
            score += scoreIncreaseValue;
            difficultyUp();
            drawFood();

            currentScoreContainer.innerText = score;
        } else {
            snake.pop();
        }
    
        gameBoard.querySelectorAll('.snake').forEach(e => e.remove());

        drawSnake();
    }
}

function startGame() {
    gameBoard.innerHTML = '';
    drawFood();
    window.addEventListener("keydown", changeDirection);
    window.addEventListener('swiped', changeDirection);
    gameIntervalId = setInterval(moveSnake, gameInterval);
}

function fullScreen(element) {
    if(element.requestFullscreen) {
      element.requestFullscreen();
    } else if(element.webkitrequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if(element.mozRequestFullscreen) {
      element.mozRequestFullScreen();
    }
}

const html = document.documentElement;

fullScreen(html);

setStartScreen()