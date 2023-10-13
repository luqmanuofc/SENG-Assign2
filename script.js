// Todo:
// Add a reset button (Done)
// Add the abity to choose colors for the players
// Add Win/Tie screens + animations
// Add animations. (Done)
// Add a disc at the top of the board to show which player's turn it is.
// Include a board image in the background.
// Add a score board.
// Add a timer.
// Change player names.
// Add a waiting state, where the player can't click on the board while the animation is running.

const gameBoard = document.querySelector(".game-board");
const gameBoardIconsRow = document.querySelector(".game-board-icons-row");

const resetButton = document.querySelector("#reset");
resetButton.addEventListener("click", resetGame);

for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 7; col++) {
    if (row === 0) {
      createCell(row, col, true); // Create a cell with an icon
    }
    createCell(row, col);
  }
}

function cellClicked(e) {
  const col = parseInt(e.target.getAttribute("data-col"));
  placeDisc(currentPlayer, col);
}

let currentPlayer = 1;
const board = Array(6)
  .fill(null)
  .map(() => Array(7).fill(null)); // 6x7 board initialized with null

updateUI();

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

function placeDisc(player, column) {
  let targetRow = -1;
  for (let row = 5; row >= 0; row--) {
    if (!board[row][column]) {
      targetRow = row;
      break;
    }
  }

  if (targetRow !== -1) {
    animateFallingDisc(player, 0, targetRow, column); // Start animation from the top
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
    }, 50); // 50ms for each cell animation, adjust for speed
  } else {
    // Animation ended, update board state and UI as previously
    board[targetRow][column] = player;
    updateUI();
    if (checkForWin(player, targetRow, column)) {
      alert(`Player ${player} wins!`);
      resetGame();
    } else if (checkForTie()) {
      alert("The game is a tie!");
      resetGame();
    } else {
      switchTurn();
    }
  }
}

function checkForWin(player, row, col) {
  return (
    checkForHorizontalWin(player, row) ||
    checkForDiagonalWin(player, row, col) ||
    checkForVerticalWin(player, col)
  );
}
function checkForHorizontalWin(player, row) {
  let count = 0;
  for (let j = 0; j < 7; j++) {
    if (board[row][j] === player) {
      count++;
      if (count === 4) return true;
    } else {
      count = 0;
    }
  }
  return false;
}
function checkForVerticalWin(player, col) {
  let count = 0;
  for (let i = 0; i < 6; i++) {
    if (board[i][col] === player) {
      count++;
      if (count === 4) return true;
    } else {
      count = 0;
    }
  }
  return false;
}
function checkForDiagonalWin(player, row, col) {
  // Check for Diagonal from bottom-left to top-right (`/` direction)
  let count = 1;

  // Check below-left of the placed disc
  for (let i = row + 1, j = col - 1; i < 6 && j >= 0; i++, j--) {
    if (board[i][j] === player) {
      count++;
      if (count === 4) return true;
    } else {
      break;
    }
  }

  // Check above-right of the placed disc
  for (let i = row - 1, j = col + 1; i >= 0 && j < 7; i--, j++) {
    if (board[i][j] === player) {
      count++;
      if (count === 4) return true;
    } else {
      break;
    }
  }

  count = 1; // reset count for the next diagonal check

  // Check for Diagonal from bottom-right to top-left (`\` direction)

  // Check below-right of the placed disc
  for (let i = row + 1, j = col + 1; i < 6 && j < 7; i++, j++) {
    if (board[i][j] === player) {
      count++;
      if (count === 4) return true;
    } else {
      break;
    }
  }

  // Check above-left of the placed disc
  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j] === player) {
      count++;
      if (count === 4) return true;
    } else {
      break;
    }
  }

  return false;
}

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

function resetGame() {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      board[row][col] = null;
    }
  }
  currentPlayer = 1;
  updateUI();
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
  infoCell.classList.remove("player1", "player2");
  infoCell.classList.add(`player${currentPlayer}`);

  return;
}
