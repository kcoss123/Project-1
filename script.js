class TicTacToe {
    constructor() {
        // Initialize the game board
        this.originalBoard = [];
        // Define players' symbols
        this.player1 = '';
        this.player2 = '';
        this.aiPlayer = '';
        // Define winning combinations on the board
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
        // Get all cells on the game board
        this.cells = document.querySelectorAll('.cell');
        // Set default game mode to single-player
        this.twoPlayerMode = false;
        // Initialize turn count
        this.turnCount = 0;
        // Initialize current game mode
        this.currentMode = '';
        // Initialize players' points
        this.player1Points = 0;
        this.player2Points = 0;
        // Initialize the game
        this.init();
    }

    // Initialize the game
    init() {
        // Add event listeners to cells for player moves
        this.cells.forEach(cell => {
            cell.addEventListener('click', (event) => this.turnClick(event), false);
        });

        // Add event listeners to menu buttons for selecting game mode
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

    //Select Player Symbol
    selectSym(sym) {
        // Assign symbols to player1 and player2
        this.player1Symbol = sym;
        this.player2Symbol = sym === 'X' ? 'O' : 'X';
    
        // Assign a symbol to the AI player
        this.aiPlayerSymbol = this.player1Symbol === 'X' ? 'O' : 'X';
    
        this.originalBoard = Array.from(Array(9).keys());
    
        // Hide symbol selection menu and show game mode buttons
        document.querySelector('.selectSym').style.display = "none";
        document.getElementById('pvp-button').style.display = 'block';
        document.getElementById('pvc-easy-button').style.display = 'block';
        document.getElementById('pvc-expert-button').style.display = 'block';
    }
    

    // Start the game
    startGame(mode) {
        this.currentMode = mode;
        // Hide the menu and display the game board
        document.querySelector(".menu").style.display = "none";
        document.querySelector(".game").style.display = "block";

        // Determine game mode
        if (mode === 'pvp') {
            this.twoPlayerMode = true;
            // Prompt players for their names
            this.player1Name = prompt("Enter Player 1's name:");
            this.player2Name = prompt("Enter Player 2's name:") || "Player 2";

            // Display players' names on the upper opposite corners
            document.getElementById('player1-name').innerText = this.player1Name;
            document.getElementById('player2-name').innerText = this.player2Name;
        } else {
            this.twoPlayerMode = false;
            // Prompt only player1's name
            this.player1Name = prompt("Enter Your name:");
            // Display player's name on the upper corner
            document.getElementById('player1-name').innerText = this.player1Name;

            // Set default name for Player 2 in AI modes
            this.player2Name = (mode === 'pvc-easy' || mode === 'pvc-expert') ? 'AI' : 'Player 2';
            document.getElementById('player2-name').innerText = this.player2Name;
        }
    }
    
    resetGame() {
        // Reset the game board and turn count
        this.originalBoard = Array.from(Array(9).keys());
        this.turnCount = 0;
    
        // Clear the board UI and add event listeners to cells
        this.cells.forEach(cell => {
            cell.innerText = '';
            cell.style.removeProperty('background-color');
            cell.addEventListener('click', (event) => this.turnClick(event), false);
        });
    
        // Hide endgame message and buttons
        document.querySelector(".endgame").style.display = "none";
        document.querySelector(".endgame .replay-button").style.display = "none";
        document.querySelector(".endgame .menu-button").style.display = "none";
    }
    
    turnClick(square) {
        if (this.twoPlayerMode) {
            // Handle turns in two-player mode
            if (typeof this.originalBoard[square.target.id] == 'number') {
                let currentPlayer = this.turnCount % 2 === 0 ? this.player1Symbol : this.player2Symbol;
                this.turn(square.target.id, currentPlayer);
                this.turnCount++;
            }
        } else {
            // Handle turns in single-player mode
            if (typeof this.originalBoard[square.target.id] == 'number' && !this.checkWin(this.originalBoard, this.player1Symbol)) {
                this.turn(square.target.id, this.player1Symbol);
                if (!this.checkWin(this.originalBoard, this.player1Symbol) && !this.checkTie()) {
                    this.turn(this.bestSpot(this.currentMode), this.aiPlayerSymbol);
                }
            }
        }
    }       

    // Execute player's move
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

    // Check if a player has won the game
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
                gameWon.player === this.player1 ? "blue" : "red";
        }
    
        // Remove click event listeners from cells
        this.cells.forEach(cell => {
            cell.removeEventListener('click', (event) => this.turnClick(event), false);
        });
    
        if (gameWon.player === this.player1Symbol) {
            this.player1Points++;
            this.declareWinner(`${this.player1Name} wins!`);
        } else if (gameWon.player === this.player2Symbol) {
            this.player2Points++;
            this.declareWinner(`${this.player2Name} wins!`);
        } else if (gameWon.player === this.aiPlayerSymbol) {
            this.player2Points++;
            this.declareWinner("AI wins!");
        } else {
            // It's a tie
            this.declareWinner("It's a tie!");
        }        
    
        // Update points display
        document.getElementById('player1-points').innerText = this.player1Points;
        document.getElementById('player2-points').innerText = this.player2Points;
    }
    

    // Display the winner
    declareWinner(who) {
        document.querySelector(".endgame").style.display = "block";
        document.querySelector(".endgame .text").innerText = who;
        document.querySelector(".endgame .replay-button").style.display = "inline-block";
        document.querySelector(".endgame .menu-button").style.display = "inline-block";
    }

    // Return to the main menu
    returnToMenu() {
        // Hide the endgame screen and game board, show the main menu
        document.querySelector(".endgame").style.display = "none";
        document.querySelector(".menu").style.display = "block";
        document.querySelector(".game").style.display = "none";
        document.querySelector('.selectSym').style.display = "block";
        document.getElementById('pvp-button').style.display = 'none';
        document.getElementById('pvc-easy-button').style.display = 'none';
        document.getElementById('pvc-expert-button').style.display = 'none';
    
        // Reset the game
        this.resetGame();
    
        // Reset player names
        this.player1Name = '';
        this.player2Name = '';
        document.getElementById('player1-name').innerText = '';
        document.getElementById('player2-name').innerText = '';
    
        // Reset points counter
        this.player1Points = 0;
        this.player2Points = 0;
        document.getElementById('player1-points').innerText = this.player1Points;
        document.getElementById('player2-points').innerText = this.player2Points;
    }    
    
    // Find empty squares on the board
    emptySquares() {
        return this.originalBoard.filter(s => typeof s == 'number');
    }

    // Find the best move for the AI
    bestSpot(mode) {
        if (mode === 'pvc-easy') {
            // For easy mode, randomly select an available spot
            let availableSpots = this.emptySquares();
            return availableSpots[Math.floor(Math.random() * availableSpots.length)];
        } else {
            // For expert mode, use the minimax algorithm to determine the best move
            return this.minimax(this.originalBoard, this.aiPlayerSymbol).index;
        }
    }

    // Check if the game is tied
    checkTie() {
        if (this.emptySquares().length == 0) {
            // If no more empty squares and no winner, it's a tie
            this.cells.forEach(cell => {
                cell.style.backgroundColor = "green";
                cell.removeEventListener('click', (event) => this.turnClick(event), false);
            });
            this.declareWinner("Tie Game!")
            return true;
        }
        return false;
    }

    // Minimax algorithm for AI decision making
    minimax(newBoard, player) {
        var availableSpots = this.emptySquares(newBoard);

        if (this.checkWin(newBoard, this.aiPlayerSymbol)){
            return {score: 10};
        } else if (this.checkWin(newBoard, this.player1Symbol)){
            return {score: -10};
        } else if (availableSpots.length === 0) {
            return {score: 0};
        }

        var moves = [];
        for (var i = 0; i < availableSpots.length; i++) {
            var move = {};
            move.index = newBoard[availableSpots[i]];
            newBoard[availableSpots[i]] = player;

            if (player == this.aiPlayerSymbol) {
                var result = this.minimax(newBoard, this.player1Symbol);
                move.score = result.score;
            } else {
                var result = this.minimax(newBoard, this.aiPlayerSymbol);
                move.score = result.score;
            }

            newBoard[availableSpots[i]] = move.index;

            moves.push(move);
        }

        var bestMove;
        if(player === this.aiPlayerSymbol) {
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