// 3D Soccer Game - HTML5 Canvas & Three.js
// Game state
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    level: 1,
    timeRemaining: 120,
    playerName: 'Player',
    playerColor: '#ff0000',
    accessories: ['none'],
    unlockedAccessories: ['none'],
    difficulty: 1,
    goalsScored: 0
};

// Input handling
let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    e: false
};

let mouse = {
    x: 0,
    y: 0,
    clicked: false
};

// Game objects
let player = {
    x: 0,
    y: 2,
    z: -10,
    vx: 0,
    vy: 0,
    vz: 0,
    speed: 0.2,
    jumpPower: 0.5,
    isJumping: false,
    width: 1,
    height: 2,
    depth: 0.5,
    color: '#ff0000',
    name: 'Player'
};

let ball = {
    x: 0,
    y: 1,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 0.3,
    color: '#ffffff',
    friction: 0.98,
    mass: 0.5
};

let field = {
    width: 40,
    height: 80,
    color: '#2d7a3e'
};

let goals = [
    { x: 0, y: 2, z: 40, width: 5, height: 4, direction: 'z' }, // Top goal
    { x: 0, y: 2, z: -40, width: 5, height: 4, direction: 'z' }  // Bottom goal
];

let npcs = [];
let particles = [];
let lastFrameTime = 0;
let fps = 0;
let frameCount = 0;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize game
function initGame() {
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.timeRemaining = 120;
    gameState.level = parseInt(document.getElementById('difficulty').value);
    gameState.playerName = document.getElementById('playerName').value;
    gameState.playerColor = document.getElementById('playerColor').value;
    
    player.color = gameState.playerColor;
    player.name = gameState.playerName;
    player.x = 0;
    player.y = 2;
    player.z = -20;
    
    ball.x = 0;
    ball.y = 1;
    ball.z = 0;
    ball.vx = 0;
    ball.vy = 0;
    ball.vz = 0;
    
    npcs = [];
    particles = [];
    createNPCs();
    
    gameLoop();
}

function createNPCs() {
    const npcCount = 2 + gameState.level;
    for (let i = 0; i < npcCount; i++) {
        npcs.push({
            x: (Math.random() - 0.5) * 15,
            y: 2,
            z: (Math.random() - 0.5) * 30,
            vx: 0,
            vy: 0,
            vz: 0,
            speed: 0.1 + (gameState.level * 0.015),
            width: 0.8,
            height: 1.8,
            depth: 0.4,
            color: '#0000ff',
            targetX: 0,
            targetZ: 0,
            updateCounter: 0,
            intelligence: 0.3 + (gameState.level * 0.05)
        });
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = true;
    if (key === 'a') keys.a = true;
    if (key === 's') keys.s = true;
    if (key === 'd') keys.d = true;
    if (key === ' ') {
        keys.space = true;
        e.preventDefault();
    }
    if (key === 'e') keys.e = true;
    if (key === 'escape') togglePause();
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = false;
    if (key === 'a') keys.a = false;
    if (key === 's') keys.s = false;
    if (key === 'd') keys.d = false;
    if (key === ' ') keys.space = false;
    if (key === 'e') keys.e = false;
});

canvas.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / canvas.width) * 2 - 1;
    mouse.y = -(e.clientY / canvas.height) * 2 + 1;
});

canvas.addEventListener('click', () => {
    mouse.clicked = true;
});

// Menu functions
function showMainMenu() {
    document.getElementById('mainMenu').classList.remove('menu-hidden');
    document.getElementById('customizationMenu').classList.add('menu-hidden');
    document.getElementById('controlsMenu').classList.add('menu-hidden');
}

function showCustomization() {
    document.getElementById('mainMenu').classList.add('menu-hidden');
    document.getElementById('customizationMenu').classList.remove('menu-hidden');
    document.getElementById('controlsMenu').classList.add('menu-hidden');
    updateAccessoriesDisplay();
}

function showControls() {
    document.getElementById('mainMenu').classList.add('menu-hidden');
    document.getElementById('customizationMenu').classList.add('menu-hidden');
    document.getElementById('controlsMenu').classList.remove('menu-hidden');
}

function startGame() {
    document.getElementById('menu').classList.add('menu-hidden');
    initGame();
}

function togglePause() {
    if (!gameState.isPlaying) return;
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseMenu').style.display = gameState.isPaused ? 'block' : 'none';
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseMenu').style.display = 'none';
}

function goToMainMenu() {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    document.getElementById('menu').classList.remove('menu-hidden');
    document.getElementById('pauseMenu').style.display = 'none';
    showMainMenu();
}

function updateAccessoriesDisplay() {
    const selectedAccessory = document.getElementById('accessories').value;
    const display = selectedAccessory !== 'none' ? selectedAccessory : 'None - Unlock by scoring goals!';
    document.getElementById('accessoriesDisplay').textContent = display;
}

// Game physics and logic
function updatePlayer(deltaTime) {
    // Movement
    let moveX = 0, moveZ = 0;
    const speed = keys.e ? player.speed * 1.5 : player.speed;
    
    if (keys.w) moveZ += speed;
    if (keys.s) moveZ -= speed;
    if (keys.a) moveX -= speed;
    if (keys.d) moveX += speed;
    
    player.vx = moveX;
    player.vz = moveZ;
    
    // Jump
    if (keys.space && !player.isJumping) {
        player.vy = player.jumpPower;
        player.isJumping = true;
    }
    
    // Gravity
    player.vy -= 0.015;
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    player.z += player.vz;
    
    // Ground collision
    if (player.y <= 2) {
        player.y = 2;
        player.vy = 0;
        player.isJumping = false;
    }
    
    // Field boundaries
    if (player.x > field.width / 2) player.x = field.width / 2;
    if (player.x < -field.width / 2) player.x = -field.width / 2;
    if (player.z > field.height / 2) player.z = field.height / 2;
    if (player.z < -field.height / 2) player.z = -field.height / 2;
    
    // Ball interaction
    updateBallInteraction();
    
    keys.space = false;
}

function updateBallInteraction() {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dz = ball.z - player.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const minDistance = player.width + ball.radius;
    
    if (distance < minDistance) {
        // Kick ball
        if (mouse.clicked) {
            const force = 0.5;
            ball.vx = (dx / distance) * force;
            ball.vy = (dy / distance) * force + 0.2;
            ball.vz = (dz / distance) * force;
            mouse.clicked = false;
            createParticles(ball.x, ball.y, ball.z, '#ffff00');
        } else {
            // Soft collision - push ball away
            const overlap = minDistance - distance;
            ball.x += (dx / distance) * overlap;
            ball.y += (dy / distance) * overlap;
            ball.z += (dz / distance) * overlap;
        }
    }
}

function updateBall(deltaTime) {
    // Gravity
    ball.vy -= 0.015;
    
    // Update position
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.z += ball.vz;
    
    // Friction
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    ball.vz *= ball.friction;
    
    // Ground collision
    if (ball.y <= ball.radius) {
        ball.y = ball.radius;
        ball.vy *= -0.7;
        ball.vx *= 0.95;
        ball.vz *= 0.95;
    }
    
    // Field boundaries
    if (ball.x > field.width / 2) {
        ball.x = field.width / 2;
        ball.vx *= -0.8;
    }
    if (ball.x < -field.width / 2) {
        ball.x = -field.width / 2;
        ball.vx *= -0.8;
    }
    if (ball.z > field.height / 2) {
        ball.z = field.height / 2;
        ball.vz *= -0.8;
    }
    if (ball.z < -field.height / 2) {
        ball.z = -field.height / 2;
        ball.vz *= -0.8;
    }
    
    // Check goals
    checkGoals();
}

function checkGoals() {
    goals.forEach((goal, index) => {
        if (Math.abs(ball.x - goal.x) < goal.width / 2 &&
            Math.abs(ball.y - goal.y) < goal.height / 2 &&
            Math.abs(ball.z - goal.z) < 1) {
            
            scoreGoal();
            resetBall();
        }
    });
}

function scoreGoal() {
    gameState.score++;
    gameState.goalsScored++;
    createParticles(ball.x, ball.y, ball.z, '#ffff00', 20);
    
    // Unlock accessories
    if (gameState.goalsScored === 3 && !gameState.unlockedAccessories.includes('headband')) {
        gameState.unlockedAccessories.push('headband');
    }
    if (gameState.goalsScored === 6 && !gameState.unlockedAccessories.includes('armband')) {
        gameState.unlockedAccessories.push('armband');
    }
    if (gameState.goalsScored === 10 && !gameState.unlockedAccessories.includes('boots')) {
        gameState.unlockedAccessories.push('boots');
    }
}

function resetBall() {
    ball.x = 0;
    ball.y = 1;
    ball.z = 0;
    ball.vx = 0;
    ball.vy = 0;
    ball.vz = 0;
}

function updateNPCs(deltaTime) {
    npcs.forEach((npc, index) => {
        npc.updateCounter++;
        
        // Update target every 30 frames
        if (npc.updateCounter > 30) {
            npc.updateCounter = 0;
            const targetSelection = Math.random();
            
            if (targetSelection < npc.intelligence) {
                // Chase ball
                npc.targetX = ball.x;
                npc.targetZ = ball.z;
            } else if (targetSelection < npc.intelligence + 0.3) {
                // Chase player
                npc.targetX = player.x;
                npc.targetZ = player.z;
            } else {
                // Random patrol
                npc.targetX = (Math.random() - 0.5) * 15;
                npc.targetZ = (Math.random() - 0.5) * 30;
            }
        }
        
        // Move towards target
        const dx = npc.targetX - npc.x;
        const dz = npc.targetZ - npc.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 0.5) {
            npc.vx = (dx / distance) * npc.speed;
            npc.vz = (dz / distance) * npc.speed;
        } else {
            npc.vx *= 0.9;
            npc.vz *= 0.9;
        }
        
        npc.x += npc.vx;
        npc.z += npc.vz;
        
        // Field boundaries
        if (npc.x > field.width / 2) npc.x = field.width / 2;
        if (npc.x < -field.width / 2) npc.x = -field.width / 2;
        if (npc.z > field.height / 2) npc.z = field.height / 2;
        if (npc.z < -field.height / 2) npc.z = -field.height / 2;
        
        // Ball interaction
        const ballDx = ball.x - npc.x;
        const ballDy = ball.y - npc.y;
        const ballDz = ball.z - npc.z;
        const ballDistance = Math.sqrt(ballDx * ballDx + ballDy * ballDy + ballDz * ballDz);
        const ballMinDistance = npc.width + ball.radius;
        
        if (ballDistance < ballMinDistance && Math.random() < 0.3) {
            ball.vx += (ballDx / ballDistance) * 0.3;
            ball.vy += 0.2;
            ball.vz += (ballDz / ballDistance) * 0.3;
        }
    });
}

function updateGameTime(deltaTime) {
    gameState.timeRemaining -= deltaTime / 1000;
    
    if (gameState.timeRemaining <= 0) {
        gameState.isPlaying = false;
        endGame();
    }
}

function endGame() {
    setTimeout(() => {
        alert(`Game Over!\n\nFinal Score: ${gameState.score}\nLevel: ${gameState.level}\nGoals: ${gameState.goalsScored}`);
        goToMainMenu();
    }, 100);
}

function createParticles(x, y, z, color, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            z: z,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3 + 0.2,
            vz: (Math.random() - 0.5) * 0.3,
            color: color,
            life: 1,
            maxLife: 1
        });
    }
}

function updateParticles(deltaTime) {
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.life -= deltaTime / 1000;
        p.vy -= 0.01;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
    });
}

// Rendering
function drawScene() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw field
    drawField();
    
    // Draw goals
    drawGoals();
    
    // Draw ball
    drawBall();
    
    // Draw player
    drawPlayer();
    
    // Draw NPCs
    npcs.forEach(npc => drawNPC(npc));
    
    // Draw particles
    particles.forEach(p => drawParticle(p));
    
    // Draw HUD
    drawHUD();
}

function drawField() {
    const screenX = canvas.width / 2;
    const screenY = canvas.height / 2;
    const scale = 8;
    
    ctx.fillStyle = field.color;
    ctx.fillRect(
        screenX - (field.width / 2 * scale),
        screenY - (field.height / 2 * scale),
        field.width * scale,
        field.height * scale
    );
    
    // Field lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Midline
    ctx.beginPath();
    ctx.moveTo(screenX - (field.width / 2 * scale), screenY);
    ctx.lineTo(screenX + (field.width / 2 * scale), screenY);
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(screenX, screenY, 3 * scale, 0, Math.PI * 2);
    ctx.stroke();
    
    // Field border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(
        screenX - (field.width / 2 * scale),
        screenY - (field.height / 2 * scale),
        field.width * scale,
        field.height * scale
    );
}

function drawGoals() {
    const screenX = canvas.width / 2;
    const screenY = canvas.height / 2;
    const scale = 8;
    
    goals.forEach((goal, index) => {
        const x = screenX + (goal.x * scale);
        const y = screenY + (goal.z * scale);
        const w = goal.width * scale;
        const h = goal.height * scale;
        
        ctx.fillStyle = index === 0 ? '#ffff00' : '#00ff00';
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    });
}

function drawBall() {
    const screenX = canvas.width / 2 + (ball.x * 8);
    const screenY = canvas.height / 2 + (ball.z * 8);
    
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawPlayer() {
    const screenX = canvas.width / 2 + (player.x * 8);
    const screenY = canvas.height / 2 + (player.z * 8);
    
    ctx.fillStyle = player.color;
    const height = 14;
    const width = 6;
    ctx.fillRect(screenX - width / 2, screenY - height / 2, width, height);
    
    // Head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(screenX, screenY - 10, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw accessories
    if (gameState.unlockedAccessories.includes('headband')) {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX - 5, screenY - 14, 10, 2);
    }
    if (gameState.unlockedAccessories.includes('armband')) {
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(screenX - 7, screenY - 4, 3, 6);
        ctx.fillRect(screenX + 4, screenY - 4, 3, 6);
    }
}

function drawNPC(npc) {
    const screenX = canvas.width / 2 + (npc.x * 8);
    const screenY = canvas.height / 2 + (npc.z * 8);
    
    ctx.fillStyle = npc.color;
    const height = 14;
    const width = 6;
    ctx.fillRect(screenX - width / 2, screenY - height / 2, width, height);
    
    // Head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(screenX, screenY - 10, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawParticle(p) {
    const screenX = canvas.width / 2 + (p.x * 8);
    const screenY = canvas.height / 2 + (p.z * 8);
    
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawHUD() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = Math.floor(gameState.timeRemaining % 60);
    
    document.getElementById('score').textContent = `Score: ${gameState.score}`;
    document.getElementById('level').textContent = `Level: ${gameState.level}`;
    document.getElementById('timer').textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('fps').textContent = fps;
    document.getElementById('distance').textContent = Math.floor(Math.sqrt(player.x * player.x + player.z * player.z));
}

// Main game loop
function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    // Update FPS
    frameCount++;
    if (frameCount % 10 === 0) {
        fps = Math.round(1000 / deltaTime);
    }
    
    if (gameState.isPlaying && !gameState.isPaused) {
        updatePlayer(deltaTime);
        updateBall(deltaTime);
        updateNPCs(deltaTime);
        updateParticles(deltaTime);
        updateGameTime(deltaTime);
    }
    
    drawScene();
    
    if (gameState.isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

// Start with main menu
document.addEventListener('DOMContentLoaded', () => {
    showMainMenu();
});
