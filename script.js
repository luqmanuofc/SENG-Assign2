// Course: SENG 513
// Date: Oct 20, 2023
// Assignment: 2
// Name: Luqman Bukhari
// UCID: 30105752

// ===== Initializing Game =====
const gameBoard = document.querySelector('.game-board');
const gameBoardIconsRow = document.querySelector('.game-board-icons-row');

let pending = false;

const navbarResetButton = document.querySelector('#navbar-reset');
navbarResetButton.addEventListener('click', function () {
  resetGame();
});
const modalResetButton = document.querySelector('#modal-reset');
modalResetButton.addEventListener('click', function () {
  document.getElementById('end-game-modal').style.display = 'none';
  resetGame();
});

const gameRulesButton = document.querySelector('#game-rules-button');
gameRulesButton.addEventListener('click', function () {
  document.getElementById('game-rules-modal').style.display = 'flex';
});
const hideGameRulesModalButton = document.querySelector(
  '#hide-game-rules-modal-button'
);
hideGameRulesModalButton.addEventListener('click', function () {
  document.getElementById('game-rules-modal').style.display = 'none';
});

const customAlgorithmButton = document.querySelector(
  '#custom-algorithm-button'
);
customAlgorithmButton.addEventListener('click', function () {
  if (pending) return;
  customAlgorithmForPlacingDisc(currentPlayer);
});

for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 7; col++) {
    if (row === 0) {
      createCell(row, col, true); // Create a cell with an icon
    }
    createCell(row, col);
  }
}

// Handles the click event on the board's cells, determining the column clicked and placing a disc for the current player.
// Params: e (Event object)
function cellClicked(e) {
  if (pending) return;
  const col = parseInt(e.target.getAttribute('data-col'));
  placeDisc(currentPlayer, col);
}

let currentPlayer = 1;
const board = Array(6)
  .fill(null)
  .map(() => Array(7).fill(null)); // 6x7 board initialized with null

updateUI();

// ===== Game Logic =====

// Places the disc of the current player into the selected column. Determines the correct row and initiates disc falling animation.
// Params: player (Number: 1 or 2), column (Number: 0-6)
function placeDisc(player, column) {
  pending = true;
  let targetRow = -1;
  for (let row = 5; row >= 0; row--) {
    if (!board[row][column]) {
      targetRow = row;
      break;
    }
  }

  if (targetRow !== -1) {
    animateFallingDisc(player, 0, targetRow, column); // Start animation from the top
  } else {
    pending = false;
  }
}

// Animates the falling disc in the specified column until it reaches the target row.
// Params: player (Number: 1 or 2), currentRow (Number: 0-5), targetRow (Number: 0-5), column (Number: 0-6)
function animateFallingDisc(player, currentRow, targetRow, column) {
  if (currentRow <= targetRow) {
    const cell = document.querySelector(
      `[data-row='${currentRow}'][data-col='${column}']`
    );

    // Temporarily show the disc at this cell
    cell.classList.add(`player${player}`, 'falling');

    setTimeout(() => {
      // Remove temporary disc and continue animation to next cell
      cell.classList.remove(`player${player}`, 'falling');

      // Go to next cell in the column
      animateFallingDisc(player, currentRow + 1, targetRow, column);
    }, 50); // 50ms for each cell animation
  } else {
    // Animation ended, update board state and UI as previously
    board[targetRow][column] = player;
    updateUI();
    if (checkForWin(player, targetRow, column)) {
      showGameEndModal(player);
    } else if (checkForTie()) {
      showGameEndModal(-1);
    } else {
      switchTurn();
    }
    pending = false;
  }
}

// Updates the visual state of the board and the current player's turn indicator.
function updateUI() {
  // Update the board visuals based on the board array
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cell = document.querySelector(
        `[data-row='${row}'][data-col='${col}']`
      );
      if (board[row][col] === 1) {
        cell.classList.add('player1');
      } else if (board[row][col] === 2) {
        cell.classList.add('player2');
      } else {
        cell.classList.remove('player1', 'player2');
      }
    }
  }
  // Update the turn indicator
  const infoCell = document.querySelector('.info .info-box .cell');
  const infoPlayer = document.querySelector('.info .info-player');
  infoPlayer.textContent = `Player ${currentPlayer}'s turn:`;
  infoCell.classList.remove('player1', 'player2');
  infoCell.classList.add(`player${currentPlayer}`);

  return;
}

// ===== Winning Logic =====

// Checks if placing a disc by the specified player at the given row and column results in a win.
// Params: player (Number: 1 or 2), row (Number: 0-5), col (Number: 0-6)
// Returns: boolean indicating if the move is a winning one.
function checkForWin(player, row, col, _board = board) {
  let winningCells = checkForHorizontalWin(player, row, _board);
  if (winningCells.length >= 4) {
    if (_board === board) highlightWinningDiscs(winningCells); // Don't highlight if checking for potential win
    return true;
  }

  winningCells = checkForVerticalWin(player, col, _board);
  if (winningCells.length >= 4) {
    if (_board === board) highlightWinningDiscs(winningCells); // Don't highlight if checking for potential win
    return true;
  }

  winningCells = checkForDiagonalWin(player, row, col, _board);
  if (winningCells.length >= 4) {
    if (_board === board) highlightWinningDiscs(winningCells); // Don't highlight if checking for potential win
    return true;
  }

  return false;
}

// Checks for a horizontal win based on the player's disc placed in the given row.
// Params: player (Number: 1 or 2), row (Number: 0-5)
// Returns: Array of winning cell coordinates. Empty array if no win.
function checkForHorizontalWin(player, row, _board) {
  const winningCells = [];
  for (let j = 0; j < 7; j++) {
    if (_board[row][j] === player) {
      winningCells.push([row, j]);
      if (winningCells.length === 4) {
        return winningCells;
      }
    } else {
      winningCells.length = 0;
    }
  }
  return [];
}

// Checks for a vertical win based on the player's disc placed in the given column.
// Params: player (Number: 1 or 2), col (Number: 0-6)
// Returns: Array of winning cell coordinates. Empty array if no win.
function checkForVerticalWin(player, col, _board) {
  const winningCells = [];
  for (let i = 0; i < 6; i++) {
    if (_board[i][col] === player) {
      winningCells.push([i, col]);
      if (winningCells.length === 4) {
        return winningCells;
      }
    } else {
      winningCells.length = 0;
    }
  }
  return [];
}

// Checks for a diagonal win based on the player's disc placed at the given row and column.
// Params: player (Number: 1 or 2), row (Number: 0-5), col (Number: 0-6)
// Returns: Array of winning cell coordinates. Empty array if no win.
// Reference: https://codereview.stackexchange.com/questions/150518/connect-four-code-to-check-for-horizontals-verticals-and-diagonals
function checkForDiagonalWin(player, row, col, _board) {
  const winningCells = [[row, col]]; // Start with the last placed disc

  // Check for Diagonal from bottom-left to top-right (`/` direction)

  // Check below-left of the placed disc
  for (let i = row + 1, j = col - 1; i < 6 && j >= 0; i++, j--) {
    if (_board[i][j] === player) {
      winningCells.push([i, j]);
    } else {
      break;
    }
  }

  // Check above-right of the placed disc
  for (
    let i = row - 1, j = col + 1;
    i >= 0 && j < 7 && winningCells.length < 4;
    i--, j++
  ) {
    if (_board[i][j] === player) {
      winningCells.push([i, j]);
    } else {
      break;
    }
  }

  if (winningCells.length >= 4) return winningCells;

  winningCells.length = 1; // Reset winningCells to only the last placed disc

  // Check for Diagonal from bottom-right to top-left (`\` direction)

  // Check below-right of the placed disc
  for (let i = row + 1, j = col + 1; i < 6 && j < 7; i++, j++) {
    if (_board[i][j] === player) {
      winningCells.push([i, j]);
    } else {
      break;
    }
  }

  // Check above-left of the placed disc
  for (
    let i = row - 1, j = col - 1;
    i >= 0 && j >= 0 && winningCells.length < 4;
    i--, j--
  ) {
    if (_board[i][j] === player) {
      winningCells.push([i, j]);
    } else {
      break;
    }
  }

  if (winningCells.length >= 4) return winningCells;

  return [];
}

// ===== Custom Algorithm Logic =====

// Custom algorithm to automatically place a disc for the current player.
// Params: player (Number: 1 or 2)
function customAlgorithmForPlacingDisc(player) {
  // Calling isPotentialWinningMoveForPlayer() here:
  // Check if there's a column where the opponent could win on their next move and block it
  for (let col = 0; col < 7; col++) {
    if (isPotentialWinningMoveForPlayer(player === 1 ? 2 : 1, col)) {
      // Found a winning column for the opponent, block it
      placeDisc(player, col);
      return;
    }
  }
  // For part 1, just place the disc in a random column:
  // 2. If no winning column found for the opponent, place disc in a random column
  let randomColumn;
  do {
    randomColumn = Math.floor(Math.random() * 7);
  } while (board[0][randomColumn] !== null); // Ensure the column is not full

  placeDisc(player, randomColumn);
}

// Simulates the result of placing a disc by testPlayer in the given column to check if it would lead to a win.
// Params: testPlayer (Number: 1 or 2), col (Number: 0-6)
// Returns: boolean indicating if the move would lead to a win.
// NOT IMPLEMENTED YET: Always returns false for now.
function isPotentialWinningMoveForPlayer(testPlayer, col) {
  let testBoard = board.map((row) => row.slice()); // Clone the board

  // Find the row where the disc would fall
  let targetRow = -1;
  for (let row = 5; row >= 0; row--) {
    if (!testBoard[row][col]) {
      targetRow = row;
      break;
    }
  }

  if (targetRow === -1) return false; // Column is full, can't place disc

  testBoard[targetRow][col] = testPlayer; // Temporarily place disc

  // Check if this move results in a win for testPlayer
  return checkForWin(testPlayer, targetRow, col, testBoard);
}

// ===== End Game Logic =====

// Displays the game end modal with the appropriate message based on the game result.
// Params: player (Number: 1, 2, or -1 for a tie)
function showGameEndModal(player) {
  const modal = document.getElementById('end-game-modal');
  const winningMessage = document.getElementById('end-game-message');
  if (player === -1) {
    winningMessage.textContent = `It's a tie!`;
  } else {
    winningMessage.textContent = `Player ${player} wins!`;
  }
  modal.style.display = 'flex';
}

// Resets the game board and initializes the current player to 1.
function resetGame() {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      board[row][col] = null;
    }
  }
  currentPlayer = 1;

  const highlightedCells = document.querySelectorAll('.cell.winning');
  highlightedCells.forEach((cell) => cell.classList.remove('winning'));
  updateUI();
}

// ===== Other Helper funtions=====

// Checks if all cells on the board are filled, indicating a tie.
// Returns: boolean indicating if the game is a tie.
function checkForTie() {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (!board[row][col]) return false; // Found an empty spot, so not a tie
    }
  }
  return true; // No empty spots found, it's a tie
}

// Switches the current player's turn.
function switchTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateUI();
}

// Creates a cell element on the game board, optionally with an icon.
// Params: row (Number: 0-5), col (Number: 0-6), withIcon (Boolean: default=false)
function createCell(row, col, withIcon = false) {
  const cell = document.createElement('div');

  if (withIcon) {
    const icon = document.createElement('img');
    icon.src = './assets/downArrow.svg';
    icon.classList.add('down-icon');
    icon.setAttribute('data-col', col);
    icon.addEventListener('click', cellClicked);
    cell.appendChild(icon);
    cell.classList.add('game-board-icon');
    gameBoardIconsRow.appendChild(cell);
  } else {
    cell.classList.add('cell');
    cell.setAttribute('data-row', row);
    cell.setAttribute('data-col', col);
    cell.addEventListener('click', cellClicked);
    gameBoard.appendChild(cell);
  }
}

// Highlights the discs on the board that form the winning combination.
// Params: winningCells (Array of cell coordinates)
function highlightWinningDiscs(winningCells) {
  for (const cell of winningCells) {
    const [row, col] = cell;
    const cellElement = document.querySelector(
      `[data-row='${row}'][data-col='${col}']`
    );
    cellElement.classList.add('winning');
  }
}
