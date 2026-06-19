// 3D Isometric Soccer Game - Enhanced Graphics
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
    goalsScored: 0,
    canKick: true
};

// Input handling
let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    e: false,
    spacePressedThisFrame: false
};

let mouse = {
    x: 0,
    y: 0
};

// Game objects
let player = {
    x: 0,
    y: 0,
    z: -15,
    vx: 0,
    vy: 0,
    vz: 0,
    speed: 0.25,
    jumpPower: 0.6,
    isJumping: false,
    width: 1,
    height: 2,
    depth: 0.5,
    color: '#ff0000',
    name: 'Player',
    angle: 0
};

let ball = {
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 0.4,
    color: '#ffffff',
    friction: 0.97,
    mass: 0.5,
    spin: 0
};

let field = {
    width: 45,
    height: 90,
    color: '#2d7a3e',
    lineColor: '#ffffff'
};

let goals = [
    { x: 0, y: 0, z: 42, width: 6, height: 3, direction: 'z' }, // Top goal
    { x: 0, y: 0, z: -42, width: 6, height: 3, direction: 'z' }  // Bottom goal
];

let npcs = [];
let particles = [];
let lastFrameTime = 0;
let fps = 0;
let frameCount = 0;

// Camera settings for isometric view
let camera = {
    x: 0,
    y: 25,
    z: -5,
    scale: 15
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 3D to 2D Isometric projection
function project3D(x, y, z) {
    const scale = camera.scale;
    const screenX = canvas.width / 2 + (x - z) * scale * 0.866;
    const screenY = canvas.height / 2 + (y - (x + z) * 0.5) * scale * 0.5;
    return { x: screenX, y: screenY, scale: scale * (1 + y * 0.1) };
}

// Initialize game
function initGame() {
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.timeRemaining = 120;
    gameState.level = parseInt(document.getElementById('difficulty').value);
    gameState.playerName = document.getElementById('playerName').value;
    gameState.playerColor = document.getElementById('playerColor').value;
    gameState.canKick = true;
    
    player.color = gameState.playerColor;
    player.name = gameState.playerName;
    player.x = 0;
    player.y = 0;
    player.z = -15;
    
    ball.x = 0;
    ball.y = 0;
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
            x: (Math.random() - 0.5) * 18,
            y: 0,
            z: (Math.random() - 0.5) * 35,
            vx: 0,
            vy: 0,
            vz: 0,
            speed: 0.12 + (gameState.level * 0.018),
            width: 0.8,
            height: 1.9,
            depth: 0.4,
            color: `hsl(${210 + i * 30}, 70%, 50%)`,
            targetX: 0,
            targetZ: 0,
            updateCounter: 0,
            intelligence: 0.35 + (gameState.level * 0.05),
            angle: 0
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
        if (!keys.space) {
            keys.spacePressedThisFrame = true;
        }
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
    const speed = keys.e ? player.speed * 1.6 : player.speed;
    
    if (keys.w) moveZ -= speed;
    if (keys.s) moveZ += speed;
    if (keys.a) moveX -= speed;
    if (keys.d) moveX += speed;
    
    if (moveX !== 0 || moveZ !== 0) {
        player.angle = Math.atan2(moveZ, moveX);
    }
    
    player.vx = moveX;
    player.vz = moveZ;
    
    // Jump
    if (keys.spacePressedThisFrame && !player.isJumping) {
        player.vy = player.jumpPower;
        player.isJumping = true;
        keys.spacePressedThisFrame = false;
    }
    
    // Gravity
    player.vy -= 0.018;
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    player.z += player.vz;
    
    // Ground collision
    if (player.y <= 0) {
        player.y = 0;
        player.vy = 0;
        player.isJumping = false;
        
        // Kick ball when on ground and space pressed
        if (keys.space && gameState.canKick) {
            updateBallKick();
            gameState.canKick = false;
        }
    } else {
        gameState.canKick = true;
    }
    
    // Field boundaries
    if (player.x > field.width / 2) player.x = field.width / 2;
    if (player.x < -field.width / 2) player.x = -field.width / 2;
    if (player.z > field.height / 2) player.z = field.height / 2;
    if (player.z < -field.height / 2) player.z = -field.height / 2;
    
    // Ball interaction
    updateBallCollision();
}

function updateBallKick() {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dz = ball.z - player.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const minDistance = (player.width + ball.radius) * 1.5;
    
    if (distance < minDistance) {
        const force = 0.7;
        const kickDir = Math.atan2(dz, dx);
        ball.vx = Math.cos(kickDir) * force;
        ball.vy = 0.35 + (dy * 0.2);
        ball.vz = Math.sin(kickDir) * force;
        ball.spin = Math.random() * 0.1;
        createParticles(ball.x, ball.y, ball.z, '#ffff00', 15);
    }
}

function updateBallCollision() {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dz = ball.z - player.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const minDistance = player.width + ball.radius;
    
    if (distance < minDistance && distance > 0) {
        const overlap = (minDistance - distance) * 0.5;
        const nx = dx / distance;
        const ny = dy / distance;
        const nz = dz / distance;
        
        ball.x += nx * overlap;
        ball.y += ny * overlap;
        ball.z += nz * overlap;
    }
}

function updateBall(deltaTime) {
    // Gravity
    ball.vy -= 0.018;
    
    // Update position
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.z += ball.vz;
    
    // Friction (with spin effect)
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    ball.vz *= ball.friction;
    ball.spin *= 0.99;
    
    // Ground collision with bounce
    if (ball.y < ball.radius) {
        ball.y = ball.radius;
        ball.vy *= -0.75;
        ball.vx *= 0.92;
        ball.vz *= 0.92;
    }
    
    // Field boundaries
    if (Math.abs(ball.x) > field.width / 2) {
        ball.x = ball.x > 0 ? field.width / 2 : -field.width / 2;
        ball.vx *= -0.85;
    }
    if (ball.z > field.height / 2) {
        ball.z = field.height / 2;
        ball.vz *= -0.85;
    }
    if (ball.z < -field.height / 2) {
        ball.z = -field.height / 2;
        ball.vz *= -0.85;
    }
    
    // Check goals
    checkGoals();
}

function checkGoals() {
    goals.forEach((goal, index) => {
        if (Math.abs(ball.x - goal.x) < goal.width / 2 &&
            Math.abs(ball.y - goal.y) < goal.height * 0.5 &&
            Math.abs(ball.z - goal.z) < 2) {
            
            scoreGoal();
            resetBall();
        }
    });
}

function scoreGoal() {
    gameState.score++;
    gameState.goalsScored++;
    createParticles(ball.x, ball.y, ball.z, '#ffff00', 30);
    
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
    ball.y = 0;
    ball.z = 0;
    ball.vx = 0;
    ball.vy = 0;
    ball.vz = 0;
}

function updateNPCs(deltaTime) {
    npcs.forEach((npc, index) => {
        npc.updateCounter++;
        
        // Update target every 40 frames
        if (npc.updateCounter > 40) {
            npc.updateCounter = 0;
            const targetSelection = Math.random();
            
            if (targetSelection < npc.intelligence) {
                // Chase ball
                npc.targetX = ball.x;
                npc.targetZ = ball.z;
            } else if (targetSelection < npc.intelligence + 0.4) {
                // Chase player
                npc.targetX = player.x + (Math.random() - 0.5) * 3;
                npc.targetZ = player.z + (Math.random() - 0.5) * 3;
            } else {
                // Random patrol
                npc.targetX = (Math.random() - 0.5) * 18;
                npc.targetZ = (Math.random() - 0.5) * 40;
            }
        }
        
        // Move towards target
        const dx = npc.targetX - npc.x;
        const dz = npc.targetZ - npc.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 0.5) {
            npc.angle = Math.atan2(dz, dx);
            npc.vx = Math.cos(npc.angle) * npc.speed;
            npc.vz = Math.sin(npc.angle) * npc.speed;
        } else {
            npc.vx *= 0.85;
            npc.vz *= 0.85;
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
        const ballDz = ball.z - npc.z;
        const ballDistance = Math.sqrt(ballDx * ballDx + ballDz * ballDz);
        const ballMinDistance = npc.width * 1.5 + ball.radius;
        
        if (ballDistance < ballMinDistance && Math.random() < 0.25) {
            const kickForce = 0.4;
            ball.vx += (ballDx / ballDistance) * kickForce;
            ball.vy += 0.2;
            ball.vz += (ballDz / ballDistance) * kickForce;
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
        alert(`⚽ GAME OVER! ⚽\n\nFinal Score: ${gameState.score}\nLevel: ${gameState.level}\nGoals Scored: ${gameState.goalsScored}`);
        goToMainMenu();
    }, 100);
}

function createParticles(x, y, z, color, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            z: z,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.3 + 0.3,
            vz: (Math.random() - 0.5) * 0.5,
            color: color,
            life: 1,
            maxLife: 1,
            size: Math.random() * 4 + 2
        });
    }
}

function updateParticles(deltaTime) {
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.life -= deltaTime / 1000;
        p.vy -= 0.012;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
    });
}

// Rendering
function drawScene() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw field shadow
    drawFieldShadow();
    
    // Draw field
    drawField();
    
    // Sort and draw all game objects by depth (z + y)
    const objects = [];
    
    objects.push(...npcs.map(npc => ({ type: 'npc', obj: npc, depth: npc.z + npc.x })));
    objects.push({ type: 'ball', obj: ball, depth: ball.z + ball.x });
    objects.push({ type: 'player', obj: player, depth: player.z + player.x });
    objects.push(...particles.map(p => ({ type: 'particle', obj: p, depth: p.z + p.x })));
    
    // Sort by depth (painter's algorithm)
    objects.sort((a, b) => a.depth - b.depth);
    
    objects.forEach(obj => {
        if (obj.type === 'player') drawPlayer(obj.obj);
        if (obj.type === 'npc') drawNPC(obj.obj);
        if (obj.type === 'ball') drawBall(obj.obj);
        if (obj.type === 'particle') drawParticle(obj.obj);
    });
    
    // Draw goals
    drawGoals();
    
    // Draw HUD
    drawHUD();
}

function drawFieldShadow() {
    const topLeft = project3D(-field.width / 2, 0, -field.height / 2);
    const topRight = project3D(field.width / 2, 0, -field.height / 2);
    const bottomRight = project3D(field.width / 2, 0, field.height / 2);
    const bottomLeft = project3D(-field.width / 2, 0, field.height / 2);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.fill();
}

function drawField() {
    const topLeft = project3D(-field.width / 2, 0, -field.height / 2);
    const topRight = project3D(field.width / 2, 0, -field.height / 2);
    const bottomRight = project3D(field.width / 2, 0, field.height / 2);
    const bottomLeft = project3D(-field.width / 2, 0, field.height / 2);
    
    // Field background
    ctx.fillStyle = field.color;
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.fill();
    
    // Field lines
    ctx.strokeStyle = field.lineColor;
    ctx.lineWidth = 2;
    
    // Border
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.stroke();
    
    // Midline
    const midLeft = project3D(-field.width / 2, 0, 0);
    const midRight = project3D(field.width / 2, 0, 0);
    ctx.beginPath();
    ctx.moveTo(midLeft.x, midLeft.y);
    ctx.lineTo(midRight.x, midRight.y);
    ctx.stroke();
    
    // Center circle
    const center = project3D(0, 0, 0);
    ctx.beginPath();
    ctx.arc(center.x, center.y, 6 * camera.scale, 0, Math.PI * 2);
    ctx.stroke();
}

function drawGoals() {
    goals.forEach((goal, index) => {
        const isTop = index === 0;
        const x1 = project3D(goal.x - goal.width / 2, 0, goal.z);
        const x2 = project3D(goal.x + goal.width / 2, 0, goal.z);
        const y1 = project3D(goal.x - goal.width / 2, goal.height, goal.z);
        const y2 = project3D(goal.x + goal.width / 2, goal.height, goal.z);
        
        ctx.fillStyle = isTop ? 'rgba(255, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x1.x, x1.y);
        ctx.lineTo(x2.x, x2.y);
        ctx.lineTo(y2.x, y2.y);
        ctx.lineTo(y1.x, y1.y);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = isTop ? '#ffff00' : '#00ff00';
        ctx.lineWidth = 3;
        ctx.stroke();
    });
}

function drawBall(ball) {
    const pos = project3D(ball.x, ball.y, ball.z);
    const radius = Math.max(2, 8 * pos.scale / camera.scale);
    
    // Ball shadow
    const shadow = project3D(ball.x, 0, ball.z);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y, radius * 1.5, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball with gradient
    const ballGradient = ctx.createRadialGradient(pos.x - 2, pos.y - 2, 0, pos.x, pos.y, radius);
    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(0.7, '#f0f0f0');
    ballGradient.addColorStop(1, '#cccccc');
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball outline
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Pentagon pattern
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const x1 = pos.x + Math.cos(angle) * radius * 0.6;
        const y1 = pos.y + Math.sin(angle) * radius * 0.6;
        const x2 = pos.x + Math.cos(angle + Math.PI * 2 / 5) * radius * 0.6;
        const y2 = pos.y + Math.sin(angle + Math.PI * 2 / 5) * radius * 0.6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawPlayer(player) {
    const pos = project3D(player.x, player.y, player.z);
    const size = 12 * pos.scale / camera.scale;
    
    // Player shadow
    const shadow = project3D(player.x, 0, player.z);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = player.color;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(player.angle);
    ctx.fillRect(-size * 0.25, -size * 0.5, size * 0.5, size);
    
    // Head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(0, -size * 0.6, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-size * 0.1, -size * 0.65, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.1, -size * 0.65, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // Accessories
    if (gameState.unlockedAccessories.includes('headband')) {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-size * 0.3, -size * 0.75, size * 0.6, size * 0.08);
    }
    if (gameState.unlockedAccessories.includes('armband')) {
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(-size * 0.35, -size * 0.2, size * 0.08, size * 0.3);
        ctx.fillRect(size * 0.27, -size * 0.2, size * 0.08, size * 0.3);
    }
    if (gameState.unlockedAccessories.includes('boots')) {
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(-size * 0.25, size * 0.4, size * 0.2, size * 0.15);
        ctx.fillRect(size * 0.05, size * 0.4, size * 0.2, size * 0.15);
    }
    
    ctx.restore();
}

function drawNPC(npc) {
    const pos = project3D(npc.x, npc.y, npc.z);
    const size = 12 * pos.scale / camera.scale;
    
    // NPC shadow
    const shadow = project3D(npc.x, 0, npc.z);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = npc.color;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(npc.angle);
    ctx.fillRect(-size * 0.25, -size * 0.5, size * 0.5, size);
    
    // Head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(0, -size * 0.6, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-size * 0.1, -size * 0.65, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.1, -size * 0.65, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawParticle(p) {
    const pos = project3D(p.x, p.y, p.z);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawHUD() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = Math.floor(gameState.timeRemaining % 60);
    
    document.getElementById('score').textContent = `⚽ Score: ${gameState.score}`;
    document.getElementById('level').textContent = `Level: ${gameState.level}`;
    document.getElementById('timer').textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('fps').textContent = fps;
    document.getElementById('distance').textContent = Math.floor(Math.sqrt(player.x * player.x + player.z * player.z));
}

// Main game loop
function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - lastFrameTime, 16.67);
    lastFrameTime = currentTime;
    
    // Update FPS
    frameCount++;
    if (frameCount % 15 === 0) {
        fps = Math.round(1000 / deltaTime);
    }
    
    if (gameState.isPlaying && !gameState.isPaused) {
        updatePlayer(deltaTime);
        updateBall(deltaTime);
        updateNPCs(deltaTime);
        updateParticles(deltaTime);
        updateGameTime(deltaTime);
        
        // Update camera to follow player
        camera.x = player.x;
        camera.z = player.z - 8;
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
