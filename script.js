// Todo:
// Add Win/Tie screens instead of alerts (Done)
// highlight the winning discs (Done)
// Implement a simple custom algoritm. (Done)
// Comment code
// Add stack-overflow reference links

// Maybes:
// Ability to change player name
// Add the abity to choose colors for the players
// Add a timer.
// Change player names.
// Make sure the buttons icons go with the pixel theme of the game
// Change the background image

// ===== Initializing Game =====
const gameBoard = document.querySelector(".game-board");
const gameBoardIconsRow = document.querySelector(".game-board-icons-row");

let pending = false;

const navbarResetButton = document.querySelector("#navbar-reset");
navbarResetButton.addEventListener("click", function () {
  resetGame();
});
const modalResetButton = document.querySelector("#modal-reset");
modalResetButton.addEventListener("click", function () {
  document.getElementById("end-game-modal").style.display = "none";
  resetGame();
});

const gameRulesButton = document.querySelector("#game-rules-button");
gameRulesButton.addEventListener("click", function () {
  document.getElementById("game-rules-modal").style.display = "flex";
});
const hideGameRulesModalButton = document.querySelector(
  "#hide-game-rules-modal-button"
);
hideGameRulesModalButton.addEventListener("click", function () {
  document.getElementById("game-rules-modal").style.display = "none";
});

const customAlgorithmButton = document.querySelector(
  "#custom-algorithm-button"
);
customAlgorithmButton.addEventListener("click", function () {
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

function cellClicked(e) {
  if (pending) return;
  const col = parseInt(e.target.getAttribute("data-col"));
  placeDisc(currentPlayer, col);
}

let currentPlayer = 1;
const board = Array(6)
  .fill(null)
  .map(() => Array(7).fill(null)); // 6x7 board initialized with null

updateUI();

// ===== Game Logic =====
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

function animateFallingDisc(player, currentRow, targetRow, column) {
  if (currentRow <= targetRow) {
    const cell = document.querySelector(
      `[data-row='${currentRow}'][data-col='${column}']`
    );

    // Temporarily show the disc at this cell
    cell.classList.add(`player${player}`, "falling");

    setTimeout(() => {
      // Remove temporary disc and continue animation to next cell
      cell.classList.remove(`player${player}`, "falling");

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

function updateUI() {
  // Update the board visuals based on the board array
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cell = document.querySelector(
        `[data-row='${row}'][data-col='${col}']`
      );
      if (board[row][col] === 1) {
        cell.classList.add("player1");
      } else if (board[row][col] === 2) {
        cell.classList.add("player2");
      } else {
        cell.classList.remove("player1", "player2");
      }
    }
  }
  // Update the turn indicator
  const infoCell = document.querySelector(".info .info-box .cell");
  const infoPlayer = document.querySelector(".info .info-player");
  infoPlayer.textContent = `Player ${currentPlayer}'s turn:`;
  infoCell.classList.remove("player1", "player2");
  infoCell.classList.add(`player${currentPlayer}`);

  return;
}

// ===== Winning Logic =====
function checkForWin(player, row, col) {
  let winningCells = checkForHorizontalWin(player, row);
  if (winningCells.length >= 4) {
    highlightWinningDiscs(winningCells);
    return true;
  }

  winningCells = checkForVerticalWin(player, col);
  if (winningCells.length >= 4) {
    highlightWinningDiscs(winningCells);
    return true;
  }

  winningCells = checkForDiagonalWin(player, row, col);
  if (winningCells.length >= 4) {
    highlightWinningDiscs(winningCells);
    return true;
  }

  return false;
}

function checkForHorizontalWin(player, row) {
  const winningCells = [];
  for (let j = 0; j < 7; j++) {
    if (board[row][j] === player) {
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

function checkForVerticalWin(player, col) {
  const winningCells = [];
  for (let i = 0; i < 6; i++) {
    if (board[i][col] === player) {
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

function checkForDiagonalWin(player, row, col) {
  const winningCells = [[row, col]]; // Start with the last placed disc

  // Check for Diagonal from bottom-left to top-right (`/` direction)

  // Check below-left of the placed disc
  for (let i = row + 1, j = col - 1; i < 6 && j >= 0; i++, j--) {
    if (board[i][j] === player) {
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
    if (board[i][j] === player) {
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
    if (board[i][j] === player) {
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
    if (board[i][j] === player) {
      winningCells.push([i, j]);
    } else {
      break;
    }
  }

  if (winningCells.length >= 4) return winningCells;

  return [];
}

// ===== Custom Algorithm Logic =====
function customAlgorithmForPlacingDisc(player) {
  // Calling isPotentialWinningMoveForPlayer() here:
  // Check if there's a column where the opponent could win on their next move and block it
  // Note: This is for future implementation, it will always return false for now:
  for (let col = 0; col < 7; col++) {
    if (isPotentialWinningMoveForPlayer(player === 1 ? 2 : 1, col)) {
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

// This function should return true if placing a disc in the given column would allow the given player to win on their next move
function isPotentialWinningMoveForPlayer(testPlayer, col) {
  return false;
}

// ===== End Game Logic =====
function showGameEndModal(player) {
  const modal = document.getElementById("end-game-modal");
  const winningMessage = document.getElementById("end-game-message");
  if (player === -1) {
    winningMessage.textContent = `It's a tie!`;
  } else {
    winningMessage.textContent = `Player ${player} wins!`;
  }
  modal.style.display = "flex";
}

function resetGame() {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      board[row][col] = null;
    }
  }
  currentPlayer = 1;

  const highlightedCells = document.querySelectorAll(".cell.winning");
  highlightedCells.forEach((cell) => cell.classList.remove("winning"));
  updateUI();
}

// ===== Other Helper funtions=====
function checkForTie() {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (!board[row][col]) return false; // Found an empty spot, so not a tie
    }
  }
  return true; // No empty spots found, it's a tie
}

function switchTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateUI();
}

function createCell(row, col, withIcon = false) {
  const cell = document.createElement("div");

  if (withIcon) {
    const icon = document.createElement("img");
    icon.src = "./assets/downArrow.svg";
    icon.classList.add("down-icon");
    icon.setAttribute("data-col", col);
    icon.addEventListener("click", cellClicked);
    cell.appendChild(icon);
    cell.classList.add("game-board-icon");
    gameBoardIconsRow.appendChild(cell);
  } else {
    cell.classList.add("cell");
    cell.setAttribute("data-row", row);
    cell.setAttribute("data-col", col);
    cell.addEventListener("click", cellClicked);
    gameBoard.appendChild(cell);
  }
}

function highlightWinningDiscs(winningCells) {
  for (const cell of winningCells) {
    const [row, col] = cell;
    const cellElement = document.querySelector(
      `[data-row='${row}'][data-col='${col}']`
    );
    cellElement.classList.add("winning");
  }
}
