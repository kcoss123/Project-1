// Define global variables
var originalBoard;
const humanPlayer = 'O';
const aiPlayer = 'X';
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Select all cells on the game board
const cells = document.querySelectorAll('.cell');

// Default to false, meaning player vs computer
let twoPlayerMode = false;

// to keep track of whose turn it is in two-player mode
let turnCount = 0;

// Define a global variable to store the current mode
let currentMode = '';

// Add event listeners when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Add event listeners to menu buttons
    document.getElementById('pvp-button').addEventListener('click', function () {
        startGame('pvp'); // Start the game with the selected mode
    });
    document.getElementById('pvc-easy-button').addEventListener('click', function () {
        startGame('pvc-easy'); // Start the game with the selected mode
    });
    document.getElementById('pvc-expert-button').addEventListener('click', function () {
        startGame('pvc-expert'); // Start the game with the selected mode
    });

    // Add event listeners to endgame buttons
    document.querySelector(".endgame .replay-button").addEventListener('click', resetGame);
    document.querySelector(".endgame .menu-button").addEventListener('click', returnToMenu);
});

// Function to start the game
function startGame(mode) {
    // Set the current mode to the selected mode
    currentMode = mode;

    // Hide the menu and display the game board
    document.querySelector(".menu").style.display = "none";
    document.querySelector(".game").style.display = "block";

    // Initialize the game based on the selected mode
    if (mode === 'pvp') {
        twoPlayerMode = true;
    } else if (mode === 'pvc-easy' || mode === 'pvc-expert') {
        twoPlayerMode = false;
    }
    // Reset the game
    resetGame();
}

// Function to reset the game
function resetGame() {
    // Reset the game board and other necessary variables
    originalBoard = Array.from(Array(9).keys());
    turnCount = 0;

    // Reset the display of the game board cells
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }

    // Hide the endgame message and buttons
    document.querySelector(".endgame").style.display = "none";
    document.querySelector(".endgame .replay-button").style.display = "none";
    document.querySelector(".endgame .menu-button").style.display = "none";
}

// Function called when a cell is clicked
function turnClick(square) {

    if (twoPlayerMode) {
        // Two-player mode
        if (typeof originalBoard[square.target.id] == 'number') {
            let currentPlayer = 'X'; // Assume X starts
            if (turnCount % 2 === 1) {
                currentPlayer = 'O';
            }
            turn(square.target.id, currentPlayer);
            turnCount++;
        }
    } else {
        // Player vs Computer mode
        if (typeof originalBoard[square.target.id] == 'number') {
            turn(square.target.id, humanPlayer);
            if (!checkTie()) {
                turn(bestSpot(currentMode), aiPlayer);
            }
        }
    }
}

// Function to make a move
function turn(squareId, player) {
    originalBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(originalBoard, player);
    if (gameWon) {
        gameOver(gameWon);
    } else if (checkTie()) {
        // If it's a tie, show endgame buttons
        document.querySelector(".endgame .replay-button").style.display = "inline-block";
        document.querySelector(".endgame .menu-button").style.display = "inline-block";
    }
}

// Function to check if a player has won
function checkWin(board, player) {
    let plays = board.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winningCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon;
}

// Function called when the game is over
function gameOver(gameWon) {
    for (let index of winningCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player == humanPlayer ? "blue" : "red";
    }
    for (var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner(gameWon.player == humanPlayer ? "You win!" : "You lose.")
}

// Function to declare the winner
function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
    // Update the buttons
    document.querySelector(".endgame .replay-button").style.display = "inline-block";
    document.querySelector(".endgame .menu-button").style.display = "inline-block";
}

// Function to return to the main menu
function returnToMenu() {
    // Reset the game state or perform any necessary actions
    document.querySelector(".endgame").style.display = "none"; // Hide the endgame message
    document.querySelector(".menu").style.display = "block"; // Show the main menu
    document.querySelector(".game").style.display = "none";
}

// Function to return empty squares
function emptySquares() {
    return originalBoard.filter(s => typeof s == 'number');
}

// Function to find the best spot for the computer to play
function bestSpot(mode) {
    
    if (mode === 'pvc-easy') {
        // For player vs computer easy mode, select a random available spot
        let availableSpots = emptySquares();
        return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    } else {
        // For player vs computer expert mode, select the best spot using minimax
        return minimax(originalBoard, aiPlayer).index;
    }
}

// Function to check if the game is a tie
function checkTie() {
    if (emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!")
        return true;
    }
    return false;
}

// Function implementing the minimax algorithm
function minimax(newBoard, player) {
    var availableSpots = emptySquares(newBoard);

    if (checkWin(newBoard, player)){
        return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)){
        return {score: 20};
    } else if (availableSpots.length === 0) {
        return {score: 0}
    }
    var moves = [];
    for (var i = 0; i < availableSpots.length; i++) {
        var move = {};
        move.index = newBoard[availableSpots[i]];
        newBoard[availableSpots[i]] = player;

        if (player == aiPlayer) {
            var result = minimax(newBoard, humanPlayer);
            move.score = result.score;
        } else {
            var result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availableSpots[i]] = move.index;

        moves.push(move);
    }

    var bestMove;
    if(player === aiPlayer) {
        var bestScore = -10000;
        for(var i = 0; i < moves.length; i++){
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        var bestScore = 10000;
        for(var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}