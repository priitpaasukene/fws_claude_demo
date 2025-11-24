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

const DIFFICULTY_PROFILES = {
    'random': {
        winRate: 0,
        blockRate: 0,
        setupRate: 0,
        strategicRate: 0,
        description: 'Makes random legal moves'
    },
    'easy': {
        winRate: 1.0,
        blockRate: 0,
        setupRate: 0,
        strategicRate: 0,
        description: 'Wins if possible, otherwise random'
    },
    'medium': {
        winRate: 1.0,
        blockRate: 1.0,
        setupRate: 0,
        strategicRate: 0,
        description: 'Wins if possible, blocks your wins, otherwise random'
    },
    'hard': {
        winRate: 1.0,
        blockRate: 1.0,
        setupRate: 1.0,
        strategicRate: 1.0,
        description: 'Wins if possible, blocks your wins, sets up 2-move wins, uses strategic positioning'
    }
};

class ChickenCrocodileGame {
    constructor() {
        this.gameState = GAME_STATES.RULES;
        this.currentPlayer = null;
        this.board = this.createEmptyBoard();
        this.gameEnded = false;
        this.winner = null;
        this.computerThinking = false;
        this.computerDifficulty = 'random';

        // Performance analytics
        this.gameStats = {
            gamesPlayed: 0,
            playerWins: 0,
            computerWins: 0,
            draws: 0,
            totalMoves: 0,
            averageGameLength: 0
        };
        this.currentGameMoves = 0;
        this.gameStartTime = null;

        // Debug tracking for AI decisions
        this.lastDecisionTree = null;

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

            // Debug window toggle
            document.getElementById('debug-toggle').addEventListener('click', () => {
                this.toggleDebugWindow();
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

            // Initialize game tracking
            this.currentGameMoves = 0;
            this.gameStartTime = Date.now();

            const difficultySelect = document.getElementById('difficulty-select');
            this.computerDifficulty = difficultySelect ? difficultySelect.value : 'random';

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
                this.trackMove();
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


    getComputerMoveDelay() {
        try {
            // Variable timing based on difficulty - harder difficulties "think" longer
            const delays = {
                'random': 200 + Math.random() * 300,    // 200-500ms
                'easy': 400 + Math.random() * 400,      // 400-800ms
                'medium': 600 + Math.random() * 500,    // 600-1100ms
                'hard': 800 + Math.random() * 700       // 800-1500ms
            };
            return delays[this.computerDifficulty] || 300;
        } catch (error) {
            this.handleError('Error getting computer move delay: ' + error.message);
            return 300; // fallback delay
        }
    }

    switchToComputerTurn() {
        try {
            this.currentPlayer = PLAYERS.COMPUTER;
            this.computerThinking = true;
            this.updateStatusMessage();
            this.disableBoard();

            // Variable delay based on difficulty level
            setTimeout(() => {
                this.makeComputerMove();
            }, this.getComputerMoveDelay());
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

            const chosenMove = this.getConfigurableMove(legalMoves, this.computerDifficulty);

            const { row, col, action } = chosenMove;

            if (action === 'place_egg') {
                this.board[row][col] = CELL_STATES.EGG;
            } else if (action === 'evolve_egg') {
                this.board[row][col] = CELL_STATES.CROCODILE;
            }

            this.trackMove();
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

            // Update debug window with decision tree
            this.updateDebugWindow();
        } catch (error) {
            this.handleError('Error making computer move: ' + error.message);
        }
    }

    getRandomMove(legalMoves) {
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    getConfigurableMove(legalMoves, difficulty) {
        try {
            const profile = DIFFICULTY_PROFILES[difficulty];
            if (!profile) {
                this.lastDecisionTree = {
                    difficulty: difficulty,
                    profile: null,
                    legalMoves: [...legalMoves],
                    decisionSteps: [{
                        step: 'error',
                        description: 'Unknown difficulty profile',
                        result: 'fallback to random'
                    }],
                    chosenMove: null,
                    reasoning: 'Unknown difficulty profile, using random move'
                };
                const randomMove = this.getRandomMove(legalMoves);
                this.lastDecisionTree.chosenMove = randomMove;
                return randomMove;
            }

            // Initialize decision tree tracking
            this.lastDecisionTree = {
                difficulty: difficulty,
                profile: profile,
                legalMoves: [...legalMoves],
                decisionSteps: [],
                chosenMove: null,
                reasoning: ''
            };

            // Priority order based on profile settings
            // 1. Win immediately if possible (controlled by winRate)
            if (profile.winRate > 0) {
                const winningMove = this.findWinningMove(legalMoves, PLAYERS.COMPUTER);
                this.lastDecisionTree.decisionSteps.push({
                    step: 'win_check',
                    description: 'Check for immediate winning moves',
                    enabled: true,
                    movesFound: winningMove ? [winningMove] : [],
                    result: winningMove ? 'winning move found' : 'no winning moves'
                });
                if (winningMove) {
                    this.lastDecisionTree.chosenMove = winningMove;
                    this.lastDecisionTree.reasoning = 'Immediate win available';
                    return winningMove;
                }
            } else {
                this.lastDecisionTree.decisionSteps.push({
                    step: 'win_check',
                    description: 'Check for immediate winning moves',
                    enabled: false,
                    result: 'disabled by difficulty profile'
                });
            }

            // 2. Block human from winning (controlled by blockRate)
            if (profile.blockRate > 0) {
                const blockingMove = this.findWinningMove(legalMoves, PLAYERS.HUMAN);
                this.lastDecisionTree.decisionSteps.push({
                    step: 'block_check',
                    description: 'Check for moves that block human wins',
                    enabled: true,
                    movesFound: blockingMove ? [blockingMove] : [],
                    result: blockingMove ? 'blocking move found' : 'no blocking needed'
                });
                if (blockingMove) {
                    this.lastDecisionTree.chosenMove = blockingMove;
                    this.lastDecisionTree.reasoning = 'Block human from winning';
                    return blockingMove;
                }
            } else {
                this.lastDecisionTree.decisionSteps.push({
                    step: 'block_check',
                    description: 'Check for moves that block human wins',
                    enabled: false,
                    result: 'disabled by difficulty profile'
                });
            }

            // 3. Set up 2-move win (controlled by setupRate)
            if (profile.setupRate > 0) {
                const twoMoveWin = this.findTwoMoveWin(legalMoves);
                this.lastDecisionTree.decisionSteps.push({
                    step: 'setup_check',
                    description: 'Check for moves that setup 2-move wins',
                    enabled: true,
                    movesFound: twoMoveWin ? [twoMoveWin] : [],
                    result: twoMoveWin ? 'setup move found' : 'no setup moves'
                });
                if (twoMoveWin) {
                    this.lastDecisionTree.chosenMove = twoMoveWin;
                    this.lastDecisionTree.reasoning = 'Setup 2-move win opportunity';
                    return twoMoveWin;
                }
            } else {
                this.lastDecisionTree.decisionSteps.push({
                    step: 'setup_check',
                    description: 'Check for moves that setup 2-move wins',
                    enabled: false,
                    result: 'disabled by difficulty profile'
                });
            }

            // 4. Strategic positioning (controlled by strategicRate)
            if (profile.strategicRate > 0) {
                const centerMove = this.findCenterMove(legalMoves);
                const cornerMove = this.findCornerMove(legalMoves);

                this.lastDecisionTree.decisionSteps.push({
                    step: 'strategic_check',
                    description: 'Check for strategic positioning (center/corners)',
                    enabled: true,
                    centerAvailable: centerMove ? true : false,
                    cornersAvailable: cornerMove ? [cornerMove] : [],
                    result: centerMove ? 'center move chosen' : (cornerMove ? 'corner move chosen' : 'no strategic positions')
                });

                if (centerMove) {
                    this.lastDecisionTree.chosenMove = centerMove;
                    this.lastDecisionTree.reasoning = 'Strategic center position';
                    return centerMove;
                }

                if (cornerMove) {
                    this.lastDecisionTree.chosenMove = cornerMove;
                    this.lastDecisionTree.reasoning = 'Strategic corner position';
                    return cornerMove;
                }
            } else {
                this.lastDecisionTree.decisionSteps.push({
                    step: 'strategic_check',
                    description: 'Check for strategic positioning (center/corners)',
                    enabled: false,
                    result: 'disabled by difficulty profile'
                });
            }

            // 5. Default to random move
            this.lastDecisionTree.decisionSteps.push({
                step: 'random_fallback',
                description: 'No strategic moves found, select random move',
                enabled: true,
                result: 'random move selected'
            });

            const randomMove = this.getRandomMove(legalMoves);
            this.lastDecisionTree.chosenMove = randomMove;
            this.lastDecisionTree.reasoning = 'No better moves found, random selection';
            return randomMove;
        } catch (error) {
            this.handleError('Error getting configurable move: ' + error.message);
            const fallbackMove = this.getRandomMove(legalMoves);
            this.lastDecisionTree = {
                difficulty: difficulty,
                profile: null,
                legalMoves: [...legalMoves],
                decisionSteps: [{
                    step: 'error',
                    description: 'Error in decision making: ' + error.message,
                    result: 'fallback to random'
                }],
                chosenMove: fallbackMove,
                reasoning: 'Error occurred, using fallback random move'
            };
            return fallbackMove;
        }
    }

    trackMove() {
        try {
            this.currentGameMoves++;
        } catch (error) {
            this.handleError('Error tracking move: ' + error.message);
        }
    }

    updateGameStatistics(winner) {
        try {
            this.gameStats.gamesPlayed++;
            this.gameStats.totalMoves += this.currentGameMoves;
            this.gameStats.averageGameLength = this.gameStats.totalMoves / this.gameStats.gamesPlayed;

            if (winner === PLAYERS.HUMAN) {
                this.gameStats.playerWins++;
            } else if (winner === PLAYERS.COMPUTER) {
                this.gameStats.computerWins++;
            } else {
                this.gameStats.draws++;
            }
        } catch (error) {
            this.handleError('Error updating game statistics: ' + error.message);
        }
    }

    getGameAnalytics() {
        try {
            const winRate = this.gameStats.gamesPlayed > 0
                ? (this.gameStats.playerWins / this.gameStats.gamesPlayed * 100).toFixed(1)
                : 0;

            const profile = DIFFICULTY_PROFILES[this.computerDifficulty];

            return {
                gamesPlayed: this.gameStats.gamesPlayed,
                playerWinRate: winRate + '%',
                computerWins: this.gameStats.computerWins,
                draws: this.gameStats.draws,
                averageGameLength: this.gameStats.averageGameLength.toFixed(1),
                currentDifficulty: this.computerDifficulty,
                difficultyDescription: profile ? profile.description : 'Unknown',
                difficultyProfile: profile
            };
        } catch (error) {
            this.handleError('Error getting game analytics: ' + error.message);
            return {
                gamesPlayed: 0,
                playerWinRate: '0%',
                computerWins: 0,
                draws: 0,
                averageGameLength: '0',
                currentDifficulty: this.computerDifficulty || 'unknown',
                difficultyDescription: 'Error loading analytics',
                difficultyProfile: null
            };
        }
    }

    findWinningMove(moves, player) {
        for (const move of moves) {
            if (this.simulateMove(move, player)) {
                return move;
            }
        }
        return null;
    }


    findTwoMoveWin(moves) {
        for (const move of moves) {
            if (this.canSetupWinInTwoMoves(move)) {
                return move;
            }
        }
        return null;
    }

    findCenterMove(moves) {
        try {
            // Prefer center position (1,1) for strategic advantage
            return moves.find(move => move.row === 1 && move.col === 1);
        } catch (error) {
            this.handleError('Error finding center move: ' + error.message);
            return null;
        }
    }

    findCornerMove(moves) {
        try {
            // Prefer corner positions for strategic advantage
            const cornerPositions = [[0,0], [0,2], [2,0], [2,2]];
            return moves.find(move =>
                cornerPositions.some(([row, col]) => move.row === row && move.col === col)
            );
        } catch (error) {
            this.handleError('Error finding corner move: ' + error.message);
            return null;
        }
    }

    canSetupWinInTwoMoves(move) {
        // Simulate the move
        const originalState = this.board[move.row][move.col];

        // Apply the move
        if (move.action === 'place_egg') {
            this.board[move.row][move.col] = CELL_STATES.EGG;
        } else if (move.action === 'evolve_egg') {
            this.board[move.row][move.col] = this.getPlayerCreature(PLAYERS.COMPUTER);
        }

        // Get legal moves after this move
        const futureMoves = this.getLegalMoves();

        // Check if any future move leads to a win
        const canWinNext = this.findWinningMove(futureMoves, PLAYERS.COMPUTER) !== null;

        // Restore original state
        this.board[move.row][move.col] = originalState;

        return canWinNext;
    }

    simulateMove(move, player) {
        // Create a copy of the board to simulate the move
        const originalState = this.board[move.row][move.col];

        // Apply the move
        if (move.action === 'place_egg') {
            this.board[move.row][move.col] = CELL_STATES.EGG;
        } else if (move.action === 'evolve_egg') {
            this.board[move.row][move.col] = this.getPlayerCreature(player);
        }

        // Check if this move results in a win
        const isWinning = this.checkWinCondition(player);

        // Restore original state
        this.board[move.row][move.col] = originalState;

        return isWinning;
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

            // Update game statistics
            this.updateGameStatistics(winner);

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

            // Log analytics to console for development
            console.log('Game Analytics:', this.getGameAnalytics());
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

            let message;
            if (this.currentPlayer === PLAYERS.HUMAN) {
                message = "Player's Turn";
            } else if (this.currentPlayer === PLAYERS.COMPUTER) {
                if (this.computerThinking) {
                    // Show different thinking messages based on difficulty
                    const thinkingMessages = {
                        'random': "Computer thinking... 🎲",
                        'easy': "Computer thinking... 🤔",
                        'medium': "Computer strategizing... 🧠",
                        'hard': "Computer calculating... ⚡"
                    };
                    message = thinkingMessages[this.computerDifficulty] || "Computer's Turn";
                } else {
                    message = "Computer's Turn";
                }
            }

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

    toggleDebugWindow() {
        try {
            const debugWindow = document.getElementById('debug-window');
            const toggleButton = document.getElementById('debug-toggle');

            if (debugWindow.style.display === 'none') {
                debugWindow.style.display = 'block';
                toggleButton.textContent = 'Hide';
            } else {
                debugWindow.style.display = 'none';
                toggleButton.textContent = 'Show Debug';
            }
        } catch (error) {
            this.handleError('Error toggling debug window: ' + error.message);
        }
    }

    updateDebugWindow() {
        try {
            if (!this.lastDecisionTree) {
                return;
            }

            // Show debug window if hidden
            const debugWindow = document.getElementById('debug-window');
            if (debugWindow.style.display === 'none') {
                debugWindow.style.display = 'block';
                document.getElementById('debug-toggle').textContent = 'Hide';
            }

            // Update summary
            document.getElementById('debug-difficulty').textContent =
                `Difficulty: ${this.lastDecisionTree.difficulty.toUpperCase()}`;

            document.getElementById('debug-reasoning').textContent =
                `Reasoning: ${this.lastDecisionTree.reasoning}`;

            const chosenMove = this.lastDecisionTree.chosenMove;
            document.getElementById('debug-chosen-move').textContent =
                `Chosen Move: Row ${chosenMove.row}, Col ${chosenMove.col} (${chosenMove.action})`;

            // Update decision steps
            const stepsList = document.getElementById('debug-steps-list');
            stepsList.innerHTML = '';

            this.lastDecisionTree.decisionSteps.forEach((step, index) => {
                const stepDiv = document.createElement('div');
                stepDiv.className = 'debug-step';

                if (step.enabled) {
                    stepDiv.classList.add('enabled');
                } else {
                    stepDiv.classList.add('disabled');
                }

                // Check if this step resulted in the chosen move
                if (step.movesFound && step.movesFound.some(move =>
                    move.row === chosenMove.row && move.col === chosenMove.col)) {
                    stepDiv.classList.add('chosen');
                }

                stepDiv.innerHTML = `
                    <div class="debug-step-header">${step.description}</div>
                    <div class="debug-step-result">${step.result}</div>
                `;

                stepsList.appendChild(stepDiv);
            });

            // Update legal moves
            const movesList = document.getElementById('debug-moves-list');
            movesList.innerHTML = '';

            this.lastDecisionTree.legalMoves.forEach(move => {
                const moveDiv = document.createElement('div');
                moveDiv.className = 'debug-move';

                if (move.row === chosenMove.row && move.col === chosenMove.col &&
                    move.action === chosenMove.action) {
                    moveDiv.classList.add('chosen');
                }

                moveDiv.textContent = `(${move.row},${move.col}) ${move.action}`;
                movesList.appendChild(moveDiv);
            });

        } catch (error) {
            this.handleError('Error updating debug window: ' + error.message);
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