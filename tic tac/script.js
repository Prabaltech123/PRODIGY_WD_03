
const cells = [...document.querySelectorAll(".cell")];
const statusText = document.getElementById("status");
const mode = document.getElementById("mode");

const scoreXText = document.getElementById("scoreX");
const scoreOText = document.getElementById("scoreO");
const xCard = document.getElementById("xCard");
const oCard = document.getElementById("oCard");

const restartBtn = document.getElementById("restart");
const resetBtn = document.getElementById("reset");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let scoreX = 0;
let scoreO = 0;
let aiTimer = null;

const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function getWinner(state) {
    for (const line of wins) {
        const [a, b, c] = line;

        if (
            state[a] &&
            state[a] === state[b] &&
            state[b] === state[c]
        ) {
            return { player: state[a], line };
        }
    }

    return null;
}

function updateTurnDisplay() {
    xCard.classList.toggle("active", currentPlayer === "X");
    oCard.classList.toggle("active", currentPlayer === "O");
}

function renderBoard() {
    cells.forEach((cell, i) => {
        cell.textContent = board[i];
        cell.classList.toggle("x", board[i] === "X");
        cell.classList.toggle("o", board[i] === "O");
        cell.classList.remove("winner");

        cell.setAttribute(
            "aria-label",
            `Square ${i + 1}${board[i] ? ": " + board[i] : ""}`
        );

        cell.disabled =
            !gameActive ||
            board[i] !== "" ||
            (mode.value === "ai" && currentPlayer === "O");
    });

    updateTurnDisplay();
}

function finishGame(result) {
    gameActive = false;
    clearTimeout(aiTimer);
    aiTimer = null;

    if (result) {
        result.line.forEach(i => cells[i].classList.add("winner"));

        if (result.player === "X") {
            scoreX++;
            scoreXText.textContent = scoreX;
            statusText.textContent =
                mode.value === "ai" ? "🎉 You win!" : "🎉 Player X wins!";
        } else {
            scoreO++;
            scoreOText.textContent = scoreO;
            statusText.textContent =
                mode.value === "ai" ? "🤖 AI wins! Try again!" : "🎉 Player O wins!";
        }
    } else {
        statusText.textContent = "🤝 It's a draw!";
    }

    renderBoard();
}

function checkGame() {
    const result = getWinner(board);

    if (result) {
        finishGame(result);
        return true;
    }

    if (board.every(cell => cell !== "")) {
        finishGame(null);
        return true;
    }

    return false;
}

function makeMove(index) {
    if (!gameActive || board[index] !== "") return;
    if (mode.value === "ai" && currentPlayer === "O") return;

    board[index] = currentPlayer;
    renderBoard();

    if (checkGame()) return;

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnDisplay();

    if (mode.value === "ai" && currentPlayer === "O") {
        statusText.textContent = "🤖 AI is thinking...";
        renderBoard();

        aiTimer = setTimeout(() => {
            aiTimer = null;

            if (!gameActive || mode.value !== "ai") return;

            const move = findBestMove();
            if (move !== -1) makeAIMove(move);
        }, 350);
    } else {
        statusText.textContent = `Player ${currentPlayer}'s turn`;
        renderBoard();
    }
}

function makeAIMove(index) {
    if (!gameActive || board[index] !== "") return;

    board[index] = "O";
    renderBoard();

    if (checkGame()) return;

    currentPlayer = "X";
    statusText.textContent = "Your turn — choose a square!";
    renderBoard();
}

// Minimax: explores possible moves to choose the best outcome.
function minimax(state, maximizing) {
    const result = getWinner(state);

    if (result?.player === "O") return 10;
    if (result?.player === "X") return -10;
    if (state.every(cell => cell !== "")) return 0;

    if (maximizing) {
        let best = -Infinity;

        for (let i = 0; i < 9; i++) {
            if (state[i] === "") {
                state[i] = "O";
                best = Math.max(best, minimax(state, false));
                state[i] = "";
            }
        }

        return best;
    }

    let best = Infinity;

    for (let i = 0; i < 9; i++) {
        if (state[i] === "") {
            state[i] = "X";
            best = Math.min(best, minimax(state, true));
            state[i] = "";
        }
    }

    return best;
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMoves = [];

    for (let i = 0; i < 9; i++) {
        if (board[i] !== "") continue;

        board[i] = "O";
        const score = minimax(board, false);
        board[i] = "";

        if (score > bestScore) {
            bestScore = score;
            bestMoves = [i];
        } else if (score === bestScore) {
            bestMoves.push(i);
        }
    }

    if (bestMoves.length === 0) return -1;

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function newRound() {
    clearTimeout(aiTimer);
    aiTimer = null;

    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;

    statusText.textContent = mode.value === "ai"
        ? "Your turn — choose a square!"
        : "Player X's turn";

    renderBoard();
}

function resetScores() {
    scoreX = 0;
    scoreO = 0;
    scoreXText.textContent = "0";
    scoreOText.textContent = "0";
    newRound();
}

function updateModeLabels() {
    const aiMode = mode.value === "ai";

    document.getElementById("oTitle").textContent =
        aiMode ? "AI PLAYER O" : "PLAYER O";

    document.getElementById("xLabel").textContent =
        aiMode ? "You" : "Player One";

    document.getElementById("oLabel").textContent =
        aiMode ? "Computer" : "Player Two";
}

cells.forEach((cell, index) => {
    cell.addEventListener("click", () => makeMove(index));
});

restartBtn.addEventListener("click", newRound);
resetBtn.addEventListener("click", resetScores);

mode.addEventListener("change", () => {
    updateModeLabels();
    newRound();
});

updateModeLabels();
newRound();
