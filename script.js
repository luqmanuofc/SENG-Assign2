// Todo:
// 1. Add a reset button (Done)
// 2. Add the abity to choose colors for the players
// 3. Add Win/Tie screens + animations
// 3. Add animations.
// 4. Add a disc at the top of the board to show which player's turn it is.
// 5. Include a board image in the background.
// 6. Add a score board.
// 7. Add a timer.
// 8. Change player names.

const gameBoard = document.querySelector(".game-board");

const resetButton = document.querySelector("#reset");
resetButton.addEventListener("click", resetGame);

// Create the 6x7 grid dynamically
for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 7; col++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-row", row);
    cell.setAttribute("data-col", col);

    // Adding a click event listener to each cell
    cell.addEventListener("click", cellClicked);

    gameBoard.appendChild(cell);
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
      alert("The game is a tie!");
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
    checkForStraightWin(player, row) || checkForDiagonalWin(player, row, col)
  );
}

function checkForStraightWin(player, row) {
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
  const info = document.querySelector(".info");
  info.textContent = `Player ${currentPlayer} (${
    currentPlayer === 1 ? "red" : "yellow"
  }) Turn`;

  return;
}
