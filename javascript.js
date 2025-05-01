function Cell() {
  let value = 0;

  const addMarker = (player) => {
      value = player;
  };

  const getValue = () => value;

  return {
      addMarker,
      getValue
  };
}

function Gameboard() {
  const row = 3;
  const column = 3;
  const board = [];

  for (let i = 0; i < row; i++) {
      board[i] = [];
      for (let j = 0; j < column; j++) {
          board[i].push(Cell());
      }
  }

  const getBoard = () => board;

  const markBoard = (row, column, player) => {
      if (board[row][column].getValue() === 0) {
          board[row][column].addMarker(player);
      }
  };

  const checkBoard = (currentBoard) => {
      const availableCells = [];
      currentBoard.forEach(row => {
          row.forEach(cell => {
              if (cell.getValue() === 0) {
                  availableCells.push(cell);
              }
          });
      });
      return availableCells.length;
  };

  return {
      getBoard,
      markBoard,
      checkBoard
  };
}

function GameController(playerOne = "Player One", playerTwo = "Player Two") {
  const board = Gameboard();
  const players = [
      { name: playerOne, marker: 1 },
      { name: playerTwo, marker: 2 }
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const playRound = (row, column) => {
      if (!board.getBoard()[row][column].getValue()) {
          board.markBoard(row, column, getActivePlayer().marker);

          const winner = checkWin(board.getBoard());
          if (winner) {
              return { status: "win", winner };
          }
          if (board.checkBoard(board.getBoard()) === 0) {
              return { status: "tie" };
          }

          switchPlayerTurn();
          return { status: "continue" };
      }

      return { status: "invalid" };
  };

  const checkWin = (board) => {
      for (let i = 0; i < 3; i++) {
          const a = board[i][0].getValue();
          const b = board[i][1].getValue();
          const c = board[i][2].getValue();
          if (a !== 0 && a === b && b === c) return players.find(p => p.marker === a);
      }

      for (let i = 0; i < 3; i++) {
          const a = board[0][i].getValue();
          const b = board[1][i].getValue();
          const c = board[2][i].getValue();
          if (a !== 0 && a === b && b === c) return players.find(p => p.marker === a);
      }

      let a = board[0][0].getValue();
      let b = board[1][1].getValue();
      let c = board[2][2].getValue();
      if (a !== 0 && a === b && b === c) return players.find(p => p.marker === a);

      a = board[0][2].getValue();
      b = board[1][1].getValue();
      c = board[2][0].getValue();
      if (a !== 0 && a === b && b === c) return players.find(p => p.marker === a);

      return null;
  };

  const reset = () => {
      for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
              board.getBoard()[i][j] = Cell();
          }
      }
      activePlayer = players[0];
  };

  return {
      getActivePlayer,
      playRound,
      checkWin,
      getBoard: board.getBoard,
      reset
  };
}

function ScreenController() {
  let game;

  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");

  const formDialog = document.querySelector("#names");
  const form = formDialog.querySelector("form");

  const restartDialog = document.querySelector("#restart");
  const restartBtn = document.querySelector("#restart > button");

  const updateScreen = () => {
      boardDiv.textContent = "";
      const board = game.getBoard();
      const activePlayer = game.getActivePlayer();

      playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

      board.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
              const cellButton = document.createElement("button");
              cellButton.classList.add("cell");
              cellButton.dataset.row = rowIndex;
              cellButton.dataset.col = colIndex;

              const value = cell.getValue();
              if (value === 1) {
                  cellButton.classList.add("x");
              } else if (value === 2) {
                  cellButton.classList.add("o");
              }

              boardDiv.appendChild(cellButton);
          });
      });
  };

  function clickBoard(e) {
      const selectedRow = e.target.dataset.row;
      const selectedCol = e.target.dataset.col;
      if (!selectedRow || !selectedCol) return;

      const result = game.playRound(selectedRow, selectedCol);
      if (result.status === "invalid") return;

      updateScreen();
      if (result.status === "win") {
          restartDialog.querySelector("h2").textContent = `${result.winner.name} wins!`;
          restartDialog.showModal();
      } else if (result.status === "tie") {
          restartDialog.querySelector("h2").textContent = `It's a tie!`;
          restartDialog.showModal();
      }
  }

  function restartBoard() {
      game.reset();
      updateScreen();
      restartDialog.close();
      formDialog.showModal();
  }

  form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const playerOne = formData.get("playerOne") || "Player One";
      const playerTwo = formData.get("playerTwo") || "Player Two";

      game = GameController(playerOne, playerTwo);
      updateScreen();
      formDialog.close();
  });

  boardDiv.addEventListener("click", clickBoard);
  restartBtn.addEventListener("click", restartBoard);
  formDialog.showModal();
}

ScreenController();
