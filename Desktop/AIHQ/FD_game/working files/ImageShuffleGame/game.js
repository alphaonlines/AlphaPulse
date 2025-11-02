const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let gridSize = 4; // Default 4x4 grid
let tileSize = canvas.width / gridSize;

let tiles = [];
let emptyTile = { x: gridSize - 1, y: gridSize - 1 };
let moveCount = 0;
let timer = 0;
let timerInterval = null;
let img = new Image();
img.src = 'https://picsum.photos/400/400'; // Random image from Lorem Picsum
let highScores = {};
let audioContext = null;
let recordedMoves = [];
let scrambledTiles = null;
let gameWon = false;

let dragging = false;
let draggedTile = null;
let animating = false;
let animTile = null;
let animStart = { x: 0, y: 0 };
let animEnd = { x: 0, y: 0 };
let animProgress = 0;
let undoStack = [];

const imagePacks = {
    nature: [
        'https://picsum.photos/400/400?random=10',
        'https://picsum.photos/400/400?random=11',
        'https://picsum.photos/400/400?random=12'
    ],
    art: [
        'https://picsum.photos/400/400?random=20',
        'https://picsum.photos/400/400?random=21',
        'https://picsum.photos/400/400?random=22'
    ],
    animals: [
        'https://picsum.photos/400/400?random=30',
        'https://picsum.photos/400/400?random=31',
        'https://picsum.photos/400/400?random=32'
    ]
};

// Simple seeded random
function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function shuffleWithSeed(seed) {
    recordedMoves = [];
    let rng = seededRandom(seed);
    for (let i = 0; i < 60; i++) {
        const neighbors = getNeighbors(emptyTile.x, emptyTile.y);
        if (neighbors.length === 0) break;
        rng = seededRandom(rng * 1000 + i);
        const randomNeighbor = neighbors[Math.floor(rng * neighbors.length)];
        recordedMoves.push({ x: randomNeighbor.x, y: randomNeighbor.y });
        moveTile(randomNeighbor.x, randomNeighbor.y, false, true, true); // Instant, no draw
    }
    drawTiles(); // Draw once at end
    scrambledTiles = tiles.map(tile => ({ ...tile }));
    scrambledTiles.emptyTile = { ...emptyTile };
    moveCount = 0;
    updateMoveCount();
    resetTimer();
    startTimer();
    playSound(600, 0.3);
}

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported');
    }
}

function playSound(frequency, duration, type = 'sine') {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function initTiles() {
    tiles = [];
    obstacles = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            tiles.push({ x, y, correctX: x, correctY: y });
        }
    }
    // Remove the last tile to create the empty space
    tiles.pop();
    emptyTile = { x: gridSize - 1, y: gridSize - 1 };
    tileSize = canvas.width / gridSize;
}

function drawTiles() {
    if (!img.complete) return; // Wait for image to load
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw empty tile with distinct color
    ctx.fillStyle = '#000';
    ctx.fillRect(emptyTile.x * tileSize, emptyTile.y * tileSize, tileSize, tileSize);

    tiles.forEach(tile => {
        if (animating && tile === animTile) return; // Skip animating tile
        const sx = tile.correctX * tileSize;
        const sy = tile.correctY * tileSize;
        const dx = tile.x * tileSize;
        const dy = tile.y * tileSize;

        ctx.drawImage(img, sx, sy, tileSize, tileSize, dx, dy, tileSize, tileSize);


    });

    // Draw animating tile
    if (animating) {
        const sx = animTile.correctX * tileSize;
        const sy = animTile.correctY * tileSize;
        const dx = (animStart.x + (animEnd.x - animStart.x) * animProgress) * tileSize;
        const dy = (animStart.y + (animEnd.y - animStart.y) * animProgress) * tileSize;

        ctx.drawImage(img, sx, sy, tileSize, tileSize, dx, dy, tileSize, tileSize);
    }
}

function shuffleTiles() {
    recordedMoves = [];
    for (let i = 0; i < 60; i++) {
        const neighbors = getNeighbors(emptyTile.x, emptyTile.y);
        if (neighbors.length === 0) break; // Should not happen
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        recordedMoves.push({ x: randomNeighbor.x, y: randomNeighbor.y });
        moveTile(randomNeighbor.x, randomNeighbor.y, false, true, true); // Instant, no draw for shuffle
    }
    drawTiles(); // Draw once at end
    scrambledTiles = tiles.map(tile => ({ ...tile })); // Deep copy
    scrambledTiles.emptyTile = { ...emptyTile };
    moveCount = 0;
    updateMoveCount();
    resetTimer();
    startTimer();
    playSound(600, 0.3); // Shuffle sound
}

function getNeighbors(x, y) {
    const neighbors = [];
    if (x > 0) neighbors.push({ x: x - 1, y });
    if (x < gridSize - 1) neighbors.push({ x: x + 1, y });
    if (y > 0) neighbors.push({ x, y: y - 1 });
    if (y < gridSize - 1) neighbors.push({ x, y: y + 1 });
    return neighbors;
}

function moveTile(x, y, countMove = true, instant = false, noDraw = false) {
    if (animating && !instant) return false; // Prevent moves during animation unless instant
    const tileIndex = tiles.findIndex(t => t.x === x && t.y === y);
    if (tileIndex === -1) {
        console.log(`Tile not found at (${x}, ${y})`);
        return false;
    }

    if ((Math.abs(emptyTile.x - x) === 1 && emptyTile.y === y) ||
        (Math.abs(emptyTile.y - y) === 1 && emptyTile.x === x)) {
        // Push to undo stack
        undoStack.push({
            tileX: tiles[tileIndex].x,
            tileY: tiles[tileIndex].y,
            emptyX: emptyTile.x,
            emptyY: emptyTile.y,
            moveCount: moveCount
        });
        if (instant) {
            // Instant move
            [tiles[tileIndex].x, emptyTile.x] = [emptyTile.x, tiles[tileIndex].x];
            [tiles[tileIndex].y, emptyTile.y] = [emptyTile.y, tiles[tileIndex].y];
            if (!noDraw) drawTiles();
            if (checkWin() && !gameWon) {
                gameWon = true;
                stopTimer();
                const isNewRecord = checkAndUpdateHighScore();
                const recordMsg = isNewRecord ? ' New record!' : '';
                playSound(1000, 0.5);
                setTimeout(() => {
                    alert('Congratulations! You solved the puzzle in ' + moveCount + ' moves and ' + timer + ' seconds.' + recordMsg);
                }, 100);
            }
        } else {
            // Start animation
            animating = true;
            animTile = tiles[tileIndex];
            animStart = { x: tiles[tileIndex].x, y: tiles[tileIndex].y };
            animEnd = { x: emptyTile.x, y: emptyTile.y };
            animProgress = 0;
            animateMove();
        }
        if (countMove) {
            moveCount++;
            updateMoveCount();
        }
        return true;
    }
    return false;
}

function animateMove() {
    animProgress += 0.1; // Speed
    if (animProgress >= 1) {
        animProgress = 1;
        // Complete move
        [animTile.x, emptyTile.x] = [emptyTile.x, animTile.x];
        [animTile.y, emptyTile.y] = [emptyTile.y, animTile.y];
        animating = false;
        drawTiles();
        if (checkWin() && !gameWon) {
            gameWon = true;
            stopTimer();
            const isNewRecord = checkAndUpdateHighScore();
            const recordMsg = isNewRecord ? ' New record!' : '';
            playSound(1000, 0.5); // Win sound
            setTimeout(() => {
                alert('Congratulations! You solved the puzzle in ' + moveCount + ' moves and ' + timer + ' seconds.' + recordMsg);
            }, 100); // Delay alert to let sound play
        }
    } else {
        drawTiles();
        requestAnimationFrame(animateMove);
    }
}

function checkWin() {
    return tiles.every(tile => tile.x === tile.correctX && tile.y === tile.correctY);
}

function loadHighScores() {
    for (let size = 3; size <= 5; size++) {
        const stored = localStorage.getItem(`highScore_${size}`);
        if (stored) {
            highScores[size] = JSON.parse(stored);
        } else {
            highScores[size] = { moves: Infinity, time: Infinity };
        }
    }
    updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
    const best = highScores[gridSize];
    const diffEl = document.getElementById('current-difficulty');
    if (diffEl) diffEl.textContent = `${gridSize}x${gridSize}`;
    const movesEl = document.getElementById('best-moves');
    if (movesEl) movesEl.textContent = best.moves === Infinity ? '-' : best.moves;
    const timeEl = document.getElementById('best-time');
    if (timeEl) timeEl.textContent = best.time === Infinity ? '-' : best.time;
}

function checkAndUpdateHighScore() {
    const current = { moves: moveCount, time: timer };
    const best = highScores[gridSize];
    let isNewRecord = false;
    if (current.moves < best.moves || (current.moves === best.moves && current.time < best.time)) {
        highScores[gridSize] = current;
        localStorage.setItem(`highScore_${gridSize}`, JSON.stringify(current));
        isNewRecord = true;
    }
    updateHighScoreDisplay();
    return isNewRecord;
}

function updateMoveCount() {
    const el = document.getElementById('move-count');
    if (el) el.textContent = moveCount;
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timer++;
        const el = document.getElementById('timer');
        if (el) el.textContent = timer;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    timer = 0;
    const el = document.getElementById('timer');
    if (el) el.textContent = timer;
}

function resetGame() {
    initTiles();
    drawTiles();
    moveCount = 0;
    updateMoveCount();
    resetTimer();
    gameWon = false;
    recordedMoves = [];
    scrambledTiles = null;
    undoStack = [];
}



function solvePuzzle() {
    if (!scrambledTiles) {
        alert('Shuffle the puzzle first.');
        return;
    }
    // Reset to scrambled state
    tiles = scrambledTiles.map(tile => ({ ...tile }));
    emptyTile = { ...scrambledTiles.emptyTile };
    drawTiles();
    // Animate reverse moves
    const reverseMoves = [...recordedMoves].reverse();
    let step = 0;
    const interval = setInterval(() => {
        if (step >= reverseMoves.length) {
            clearInterval(interval);
            return;
        }
        const move = reverseMoves[step];
        moveTile(move.x, move.y, false, true); // Instant for solve
        step++;
    }, 200); // 200ms per move
}



function handleTileClick(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / tileSize);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / tileSize);
    moveTile(x, y);
}

canvas.addEventListener('click', handleTileClick);
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    handleTileClick(touch);
});

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / tileSize);
    const y = Math.floor((e.clientY - rect.top) * scaleY / tileSize);
    const tileIndex = tiles.findIndex(t => t.x === x && t.y === y);
    if (tileIndex !== -1 && !obstacles.some(o => o.x === x && o.y === y)) {
        dragging = true;
        draggedTile = tiles[tileIndex];
    }
});

canvas.addEventListener('mouseup', e => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX / tileSize);
        const y = Math.floor((e.clientY - rect.top) * scaleY / tileSize);
        if (x === emptyTile.x && y === emptyTile.y) {
            moveTile(draggedTile.x, draggedTile.y);
        }
        dragging = false;
        draggedTile = null;
    }
});

document.getElementById('shuffle-btn').addEventListener('click', () => {
    console.log('Shuffle clicked');
    shuffleTiles();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    console.log('Reset clicked');
    resetGame();
});

document.getElementById('try-again-btn').addEventListener('click', () => {
    console.log('Try Again clicked');
    if (!scrambledTiles) {
        alert('Shuffle the puzzle first.');
        return;
    }
    tiles = scrambledTiles.map(tile => ({ ...tile }));
    emptyTile = { ...scrambledTiles.emptyTile };
    drawTiles();
    moveCount = 0;
    updateMoveCount();
    resetTimer();
    gameWon = false;
    undoStack = [];
});

document.getElementById('undo-btn').addEventListener('click', () => {
    console.log('Undo clicked');
    if (undoStack.length === 0 || animating) return;
    const lastMove = undoStack.pop();
    // Reverse the move
    const tileIndex = tiles.findIndex(t => t.x === lastMove.emptyX && t.y === lastMove.emptyY);
    if (tileIndex !== -1) {
        tiles[tileIndex].x = lastMove.tileX;
        tiles[tileIndex].y = lastMove.tileY;
        emptyTile.x = lastMove.emptyX;
        emptyTile.y = lastMove.emptyY;
        moveCount = lastMove.moveCount;
        updateMoveCount();
        drawTiles();
        gameWon = false; // Allow winning again if undone
    }
});



document.getElementById('leaderboard-btn').addEventListener('click', () => {
    const content = document.getElementById('leaderboard-content');
    if (!content) return;
    content.innerHTML = '';
    for (let size = 3; size <= 5; size++) {
        const scores = highScores[size];
        content.innerHTML += `<h4>${size}x${size}</h4>`;
        if (scores.moves === Infinity) {
            content.innerHTML += '<p>No scores yet.</p>';
        } else {
            content.innerHTML += `<p>Moves: ${scores.moves}, Time: ${scores.time}s</p>`;
        }
    }
    const lb = document.getElementById('leaderboard');
    if (lb) lb.style.display = 'block';
});

document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
    const lb = document.getElementById('leaderboard');
    if (lb) lb.style.display = 'none';
});

document.getElementById('daily-challenge-btn').addEventListener('click', () => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    img.src = `https://picsum.photos/400/400?random=${seed % 100}`;
    img.onload = () => {
        resetGame();
        shuffleWithSeed(seed);
    };
});

document.getElementById('solve-btn').addEventListener('click', () => {
    console.log('Solve clicked');
    solvePuzzle();
});

document.getElementById('pack-select').addEventListener('change', (e) => {
    const pack = e.target.value;
    if (pack && imagePacks[pack]) {
        const urls = imagePacks[pack];
        img.src = urls[Math.floor(Math.random() * urls.length)];
    } else {
        img.src = 'https://picsum.photos/400/400';
    }
});

document.getElementById('preset-select').addEventListener('change', (e) => {
    img.src = e.target.value;
});

document.getElementById('image-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('difficulty-select').addEventListener('change', (e) => {
    gridSize = parseInt(e.target.value);
    updateHighScoreDisplay();
    resetGame();
});

document.getElementById('customize-btn').addEventListener('click', () => {
    const imageSel = document.getElementById('image-selection');
    const diffSel = document.getElementById('difficulty-selection');
    if (imageSel) imageSel.style.display = 'flex';
    if (diffSel) diffSel.style.display = 'flex';
    const customizeBtn = document.getElementById('customize-btn');
    if (customizeBtn) customizeBtn.style.display = 'none';
});



document.getElementById('toggle-preview').addEventListener('click', () => {
    const preview = document.getElementById('preview');
    const btn = document.getElementById('toggle-preview');
    if (preview && btn) {
        if (preview.style.display === 'none') {
            preview.style.display = 'block';
            btn.textContent = '👁️ Hide Preview';
        } else {
            preview.style.display = 'none';
            btn.textContent = '👁️ Show Preview';
        }
    }
});

// Initialize game on load
initAudio();
loadHighScores();
img.onload = () => {
    const preview = document.getElementById('preview');
    if (preview) preview.src = img.src;
    resetGame();
    const customizeBtn = document.getElementById('customize-btn');
    if (customizeBtn) customizeBtn.style.display = 'inline-block';
};
