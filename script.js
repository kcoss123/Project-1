class TicTacToe {
    constructor() {
        this.originalBoard = [];
        this.humanPlayer = 'O';
        this.aiPlayer = 'X';
        this.winningCombos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        this.cells = document.querySelectorAll('.cell');
        this.twoPlayerMode = false;
        this.turnCount = 0;
        this.currentMode = '';
        this.init();
    }


    init() {
        // Add event listeners to cells only once during initialization
        this.cells.forEach(cell => {
            cell.addEventListener('click', (event) => this.turnClick(event), false);
        });

        // Add event listeners to menu buttons
        document.getElementById('pvp-button').addEventListener('click', () => this.startGame('pvp'));
        document.getElementById('pvc-easy-button').addEventListener('click', () => this.startGame('pvc-easy'));
        document.getElementById('pvc-expert-button').addEventListener('click', () => this.startGame('pvc-expert'));

        // Add event listeners to symbol selection buttons
        document.getElementById('selectX').addEventListener('click', () => this.selectSym('X'));
        document.getElementById('selectO').addEventListener('click', () => this.selectSym('O'));

        // Add event listeners to endgame buttons
        document.querySelector(".endgame .replay-button").addEventListener('click', () => this.resetGame());
        document.querySelector(".endgame .menu-button").addEventListener('click', () => this.returnToMenu());
    }

    selectSym(sym) {
        this.humanPlayer = sym;
        this.aiPlayer = sym === 'O' ? 'X' : 'O';
        this.originalBoard = Array.from(Array(9).keys());

        if (this.aiPlayer === 'X') {
            this.turn(this.bestSpot(), this.aiPlayer);
        }
        document.querySelector('.selectSym').style.display = "none";
        // Show the mode buttons after the symbol is selected
        document.getElementById('pvp-button').style.display = 'block';
        document.getElementById('pvc-easy-button').style.display = 'block';
        document.getElementById('pvc-expert-button').style.display = 'block';
    }

    startGame(mode) {
        this.currentMode = mode;
        document.querySelector(".menu").style.display = "none";
        document.querySelector(".game").style.display = "block";

        if (mode === 'pvp') {
            this.twoPlayerMode = true;
        } else if (mode === 'pvc-easy' || mode === 'pvc-expert') {
            this.twoPlayerMode = false;
        }
        this.resetGame();
    }

    resetGame() {
        this.originalBoard = Array.from(Array(9).keys());
        this.turnCount = 0;

        this.cells.forEach(cell => {
            cell.innerText = '';
            cell.style.removeProperty('background-color');
            cell.addEventListener('click', (event) => this.turnClick(event), false);
        });

        document.querySelector(".endgame").style.display = "none";
        document.querySelector(".endgame .replay-button").style.display = "none";
        document.querySelector(".endgame .menu-button").style.display = "none";
    }

    turnClick(square) {
        if (this.twoPlayerMode) {
            if (typeof this.originalBoard[square.target.id] == 'number') {
                let currentPlayer = 'X';
                if (this.turnCount % 2 === 1) {
                    currentPlayer = 'O';
                }
                this.turn(square.target.id, currentPlayer);
                this.turnCount++;
            }
        } else {
            if (typeof this.originalBoard[square.target.id] == 'number' && !this.checkWin(this.originalBoard, this.humanPlayer)) {
                this.turn(square.target.id, this.humanPlayer);
                if (!this.checkWin(this.originalBoard, this.humanPlayer) && !this.checkTie()) {
                    this.turn(this.bestSpot(this.currentMode), this.aiPlayer);
                }
            }
        }
    }


    turn(squareId, player) {
        this.originalBoard[squareId] = player;
        document.getElementById(squareId).innerText = player;
        let gameWon = this.checkWin(this.originalBoard, player);
        if (gameWon) {
            this.gameOver(gameWon);
        } else if (this.checkTie()) {
            document.querySelector(".endgame .replay-button").style.display = "inline-block";
            document.querySelector(".endgame .menu-button").style.display = "inline-block";
        }
    }

    checkWin(board, player) {
        let plays = board.reduce((a, e, i) =>
            (e === player) ? a.concat(i) : a, []);
        let gameWon = null;
        for (let [index, win] of this.winningCombos.entries()) {
            if (win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = { index: index, player: player };
                break;
            }
        }
        return gameWon;
    }

    gameOver(gameWon) {
        for (let index of this.winningCombos[gameWon.index]) {
            document.getElementById(index).style.backgroundColor =
                gameWon.player == this.humanPlayer ? "blue" : "red";
        }
        this.cells.forEach(cell => {
            cell.removeEventListener('click', (event) => this.turnClick(event), false);
        });
        this.declareWinner(gameWon.player == this.humanPlayer ? "You win!" : "You lose.")
    }

    declareWinner(who) {
        document.querySelector(".endgame").style.display = "block";
        document.querySelector(".endgame .text").innerText = who;
        document.querySelector(".endgame .replay-button").style.display = "inline-block";
        document.querySelector(".endgame .menu-button").style.display = "inline-block";
    }

    returnToMenu() {
        document.querySelector(".endgame").style.display = "none";
        document.querySelector(".menu").style.display = "block";
        document.querySelector(".game").style.display = "none";
        document.querySelector('.selectSym').style.display = "block";
        document.getElementById('pvp-button').style.display = 'none';
        document.getElementById('pvc-easy-button').style.display = 'none';
        document.getElementById('pvc-expert-button').style.display = 'none';
    }

    emptySquares() {
        return this.originalBoard.filter(s => typeof s == 'number');
    }

    bestSpot(mode) {
        if (mode === 'pvc-easy') {
            let availableSpots = this.emptySquares();
            return availableSpots[Math.floor(Math.random() * availableSpots.length)];
        } else {
            return this.minimax(this.originalBoard, this.aiPlayer).index;
        }
    }

    checkTie() {
        if (this.emptySquares().length == 0) {
            this.cells.forEach(cell => {
                cell.style.backgroundColor = "green";
                cell.removeEventListener('click', (event) => this.turnClick(event), false);
            });
            this.declareWinner("Tie Game!")
            return true;
        }
        return false;
    }

    minimax(newBoard, player) {
        var availableSpots = this.emptySquares(newBoard);

        if (this.checkWin(newBoard, player)){
            return {score: -10};
        } else if (this.checkWin(newBoard, this.aiPlayer)){
            return {score: 20};
        } else if (availableSpots.length === 0) {
            return {score: 0}
        }
        var moves = [];
        for (var i = 0; i < availableSpots.length; i++) {
            var move = {};
            move.index = newBoard[availableSpots[i]];
            newBoard[availableSpots[i]] = player;

            if (player == this.aiPlayer) {
                var result = this.minimax(newBoard, this.humanPlayer);
                move.score = result.score;
            } else {
                var result = this.minimax(newBoard, this.aiPlayer);
                move.score = result.score;
            }

            newBoard[availableSpots[i]] = move.index;

            moves.push(move);
        }

        var bestMove;
        if(player === this.aiPlayer) {
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
}

// Instantiate the game
const game = new TicTacToe();