// Game state and constants
const GAME_STATES = {
    RULES: 'rules',
    PLAYING: 'playing',
    ENDED: 'ended',
    ERROR: 'error'
};

const CELL_STATES = {
    EMPTY: 'empty',
    EGG: 'egg',
    CHICKEN: 'chicken',
    CROCODILE: 'crocodile'
};

const PLAYERS = {
    HUMAN: 'human',
    COMPUTER: 'computer'
};

class ChickenCrocodileGame {
    constructor() {
        this.gameState = GAME_STATES.RULES;
        this.currentPlayer = null;
        this.board = this.createEmptyBoard();
        this.gameEnded = false;
        this.winner = null;
        this.computerThinking = false;

        this.initializeEventListeners();
        this.showRulesScreen();
    }

    createEmptyBoard() {
        return Array(3).fill(null).map(() => Array(3).fill(CELL_STATES.EMPTY));
    }

    forEachCell(callback) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                callback(row, col, this.board[row][col]);
            }
        }
    }

    getPlayerCreature(player) {
        return player === PLAYERS.HUMAN ? CELL_STATES.CHICKEN : CELL_STATES.CROCODILE;
    }

    initializeEventListeners() {
        try {
            document.getElementById('start-game-button').addEventListener('click', () => {
                this.startGame();
            });

            document.getElementById('reset-button').addEventListener('click', () => {
                this.resetGame();
            });

            document.getElementById('reset-to-initial-button').addEventListener('click', () => {
                this.resetToInitial();
            });

            // Add click listeners to all cells
            const cells = document.querySelectorAll('.cell');
            cells.forEach((cell, index) => {
                cell.addEventListener('click', () => {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    this.handleCellClick(row, col);
                });
            });
        } catch (error) {
            this.handleError('Failed to initialize event listeners: ' + error.message);
        }
    }

    showRulesScreen() {
        try {
            document.getElementById('rules-screen').style.display = 'block';
            document.getElementById('game-screen').style.display = 'none';
            document.getElementById('error-screen').style.display = 'none';
        } catch (error) {
            this.handleError('Failed to show rules screen: ' + error.message);
        }
    }

    startGame() {
        try {
            this.gameState = GAME_STATES.PLAYING;
            this.currentPlayer = PLAYERS.HUMAN;

            this.board = this.createEmptyBoard();
            this.gameEnded = false;
            this.winner = null;
            this.computerThinking = false;

            document.getElementById('rules-screen').style.display = 'none';
            document.getElementById('game-screen').style.display = 'block';
            document.getElementById('error-screen').style.display = 'none';

            this.updateGameDisplay();
            this.updateStatusMessage();
        } catch (error) {
            this.handleError('Failed to start game: ' + error.message);
        }
    }

    resetGame() {
        try {
            if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.ENDED) {
                this.startGame();
            }
        } catch (error) {
            this.handleError('Failed to reset game: ' + error.message);
        }
    }

    resetToInitial() {
        try {
            this.gameState = GAME_STATES.RULES;
            this.currentPlayer = null;
            this.board = this.createEmptyBoard();
            this.gameEnded = false;
            this.winner = null;
            this.computerThinking = false;
            this.showRulesScreen();
        } catch (error) {
            this.handleError('Failed to reset to initial state: ' + error.message);
        }
    }

    handleCellClick(row, col) {
        try {
            if (this.gameState !== GAME_STATES.PLAYING ||
                this.gameEnded ||
                this.computerThinking) {
                return;
            }

            // Only allow human moves when it's the player's turn
            if (this.currentPlayer !== PLAYERS.HUMAN) {
                return;
            }

            if (row < 0 || row >= 3 || col < 0 || col >= 3) {
                throw new Error('Invalid cell coordinates');
            }

            const cellState = this.board[row][col];
            let actionTaken = false;

            if (cellState === CELL_STATES.EMPTY) {
                // Place egg in empty cell
                this.board[row][col] = CELL_STATES.EGG;
                actionTaken = true;
            } else if (cellState === CELL_STATES.EGG) {
                // Evolve egg to appropriate creature based on player
                this.board[row][col] = this.getPlayerCreature(this.currentPlayer);
                actionTaken = true;
            }

            if (actionTaken) {
                this.updateGameDisplay();

                if (this.checkWinCondition(this.currentPlayer)) {
                    this.endGame(this.currentPlayer);
                    return;
                }

                if (this.isBoardFull()) {
                    this.endGame(null); // Draw
                    return;
                }

                // Switch to computer turn after player move
                this.switchToComputerTurn();
            }
        } catch (error) {
            this.handleError('Error handling cell click: ' + error.message);
        }
    }


    switchToComputerTurn() {
        try {
            this.currentPlayer = PLAYERS.COMPUTER;
            this.computerThinking = true;
            this.updateStatusMessage();
            this.disableBoard();

            // 50 millisecond delay before computer move as specified
            setTimeout(() => {
                this.makeComputerMove();
            }, 50);
        } catch (error) {
            this.handleError('Error switching to computer turn: ' + error.message);
        }
    }


    makeComputerMove() {
        try {
            const legalMoves = this.getLegalMoves();

            if (legalMoves.length === 0) {
                this.endGame(null); // Draw
                return;
            }

            // Computer always makes random legal move as specified
            const chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            const { row, col, action } = chosenMove;

            if (action === 'place_egg') {
                this.board[row][col] = CELL_STATES.EGG;
            } else if (action === 'evolve_egg') {
                this.board[row][col] = CELL_STATES.CROCODILE;
            }

            this.updateGameDisplay();

            if (this.checkWinCondition(PLAYERS.COMPUTER)) {
                this.endGame(PLAYERS.COMPUTER);
                return;
            }

            if (this.isBoardFull()) {
                this.endGame(null); // Draw
                return;
            }

            // Switch back to human turn
            this.currentPlayer = PLAYERS.HUMAN;
            this.computerThinking = false;
            this.updateStatusMessage();
            this.enableBoard();
        } catch (error) {
            this.handleError('Error making computer move: ' + error.message);
        }
    }

    getLegalMoves() {
        const moves = [];

        try {
            let hasEggs = false;
            let hasEmptyOrFinalCreatures = false;

            // Single pass: collect board state and determine moves
            this.forEachCell((row, col, cellState) => {
                if (cellState === CELL_STATES.EGG) {
                    hasEggs = true;
                    moves.push({ row, col, action: 'evolve_egg' });
                } else if (cellState === CELL_STATES.EMPTY) {
                    moves.push({ row, col, action: 'place_egg' });
                }

                if (cellState === CELL_STATES.EMPTY ||
                    cellState === CELL_STATES.CHICKEN ||
                    cellState === CELL_STATES.CROCODILE) {
                    hasEmptyOrFinalCreatures = true;
                }
            });

            // Filter place_egg moves based on rules
            return moves.filter(move => {
                if (move.action === 'place_egg') {
                    return !hasEggs || hasEmptyOrFinalCreatures;
                }
                return true;
            });
        } catch (error) {
            this.handleError('Error getting legal moves: ' + error.message);
            return [];
        }
    }

    checkWinCondition(player) {
        try {
            let targetCreature;
            if (player === PLAYERS.HUMAN) {
                targetCreature = CELL_STATES.CHICKEN;
            } else if (player === PLAYERS.COMPUTER) {
                targetCreature = CELL_STATES.CROCODILE;
            } else {
                return false;
            }

            // Check rows
            for (let row = 0; row < 3; row++) {
                if (this.board[row][0] === targetCreature &&
                    this.board[row][1] === targetCreature &&
                    this.board[row][2] === targetCreature) {
                    this.highlightWinningCells([[row, 0], [row, 1], [row, 2]]);
                    return true;
                }
            }

            // Check columns
            for (let col = 0; col < 3; col++) {
                if (this.board[0][col] === targetCreature &&
                    this.board[1][col] === targetCreature &&
                    this.board[2][col] === targetCreature) {
                    this.highlightWinningCells([[0, col], [1, col], [2, col]]);
                    return true;
                }
            }

            // Check diagonals
            if (this.board[0][0] === targetCreature &&
                this.board[1][1] === targetCreature &&
                this.board[2][2] === targetCreature) {
                this.highlightWinningCells([[0, 0], [1, 1], [2, 2]]);
                return true;
            }

            if (this.board[0][2] === targetCreature &&
                this.board[1][1] === targetCreature &&
                this.board[2][0] === targetCreature) {
                this.highlightWinningCells([[0, 2], [1, 1], [2, 0]]);
                return true;
            }

            return false;
        } catch (error) {
            this.handleError('Error checking win condition: ' + error.message);
            return false;
        }
    }

    highlightWinningCells(cells) {
        try {
            cells.forEach(([row, col]) => {
                const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cellElement) {
                    cellElement.classList.add('winning-row');
                }
            });
        } catch (error) {
            this.handleError('Error highlighting winning cells: ' + error.message);
        }
    }

    isBoardFull() {
        try {
            let hasEmptyOrEgg = false;
            this.forEachCell((row, col, cellState) => {
                if (cellState === CELL_STATES.EMPTY || cellState === CELL_STATES.EGG) {
                    hasEmptyOrEgg = true;
                }
            });
            return !hasEmptyOrEgg;
        } catch (error) {
            this.handleError('Error checking if board is full: ' + error.message);
            return false;
        }
    }

    endGame(winner) {
        try {
            this.gameEnded = true;
            this.winner = winner;
            this.gameState = GAME_STATES.ENDED;

            let message;
            if (winner === PLAYERS.HUMAN) {
                message = "🎉 You Win! 🎉";
            } else if (winner === PLAYERS.COMPUTER) {
                message = "💻 Computer Wins! 💻";
            } else {
                message = "🤝 It's a Draw! 🤝";
            }

            this.updateStatus(message);
            this.disableBoard();
        } catch (error) {
            this.handleError('Error ending game: ' + error.message);
        }
    }

    updateGameDisplay() {
        try {
            const cells = document.querySelectorAll('.cell');
            cells.forEach((cell) => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                const cellState = this.board[row][col];

                // Remove all state classes and winning highlight
                cell.classList.remove('empty', 'egg', 'chicken', 'crocodile', 'winning-row');

                // Add current state class
                cell.classList.add(cellState);
            });
        } catch (error) {
            this.handleError('Error updating game display: ' + error.message);
        }
    }

    updateStatusMessage() {
        try {
            if (!this.currentPlayer) {
                return; // No message to display if game hasn't started
            }

            const message = this.currentPlayer === PLAYERS.HUMAN ? "Player's Turn" : "Computer's Turn";
            this.updateStatus(message);
        } catch (error) {
            this.handleError('Error updating status message: ' + error.message);
        }
    }

    updateStatus(message) {
        try {
            const statusElement = document.getElementById('game-status');
            if (statusElement) {
                statusElement.textContent = message;

                // Add appropriate CSS classes
                statusElement.classList.remove('player-turn', 'computer-turn', 'game-over');

                if (this.gameEnded) {
                    statusElement.classList.add('game-over');
                } else if (this.currentPlayer === PLAYERS.HUMAN) {
                    statusElement.classList.add('player-turn');
                } else {
                    statusElement.classList.add('computer-turn');
                }
            }
        } catch (error) {
            this.handleError('Error updating status: ' + error.message);
        }
    }

    disableBoard() {
        try {
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                cell.classList.add('disabled');
            });
        } catch (error) {
            this.handleError('Error disabling board: ' + error.message);
        }
    }

    enableBoard() {
        try {
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                cell.classList.remove('disabled');
            });
        } catch (error) {
            this.handleError('Error enabling board: ' + error.message);
        }
    }

    handleError(errorMessage) {
        console.error(errorMessage);

        this.gameState = GAME_STATES.ERROR;

        document.getElementById('rules-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('error-screen').style.display = 'block';

        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = `Game Error: ${errorMessage}`;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new ChickenCrocodileGame();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h1>Game Failed to Load</h1>
                <p>Error: ${error.message}</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
});