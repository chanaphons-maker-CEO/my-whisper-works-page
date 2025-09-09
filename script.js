// ดึง Element ที่จำเป็นจาก HTML
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// ตั้งค่าขนาด Canvas
canvas.width = 800;
canvas.height = 400;

// --- ตัวแปรหลักของเกม ---
let player;
let gravity;
let obstacles;
let gameSpeed;
let score;
let isGameOver;
let animationFrameId;

// --- Object ของผู้เล่น ---
const playerProps = {
    x: 100,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocityY: 0,
    color: '#00ffff'
};

// --- ฟังก์ชันเริ่มต้น/รีเซ็ตเกม ---
function setup() {
    player = { ...playerProps };
    gravity = 0.5; // แรงโน้มถ่วงเริ่มต้น (ดึงลง)
    obstacles = [];
    gameSpeed = 4;
    score = 0;
    isGameOver = false;

    // ซ่อนหน้าจอ Game Over และอัปเดตคะแนน
    gameOverScreen.classList.add('hidden');
    scoreElement.textContent = 0;

    // สร้างสิ่งกีดขวางเริ่มต้น
    spawnObstacle();

    // เริ่ม Game Loop
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    gameLoop();
}

// --- ฟังก์ชันสร้างสิ่งกีดขวาง ---
function spawnObstacle() {
    const minHeight = 40;
    const maxHeight = canvas.height * 0.4;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    const width = 40;
    
    // สุ่มว่าจะให้สิ่งกีดขวางอยู่บนพื้นหรือเพดาน
    const onGround = Math.random() > 0.5;

    obstacles.push({
        x: canvas.width,
        y: onGround ? canvas.height - height : 0,
        width: width,
        height: height,
        color: '#ff4d4d'
    });
}

// --- การจัดการฟิสิกส์และการเคลื่อนที่ของผู้เล่น ---
function updatePlayer() {
    // ใช้สูตรฟิสิกส์: v = u + at (ในที่นี้คือ velocityY += gravity)
    player.velocityY += gravity;
    player.y += player.velocityY;

    // ตรวจสอบการชนขอบบนและล่าง (พื้นและเพดาน)
    // ถ้าชนพื้น
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
    }
    // ถ้าชนเพดาน
    if (player.y < 0) {
        player.y = 0;
        player.velocityY = 0;
    }
}

// --- การจัดการสิ่งกีดขวาง ---
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;

        // ถ้าสิ่งกีดขวางพ้นจอไปทางซ้าย
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1); // ลบออกจาก Array
            score++;
            scoreElement.textContent = score;

            // เพิ่มความเร็วเกมเล็กน้อยเพื่อความท้าทาย
            gameSpeed += 0.1;
        }
    }

    // สร้างสิ่งกีดขวางใหม่เมื่ออันล่าสุดเคลื่อนที่ไปได้ระยะหนึ่งแล้ว
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) {
        spawnObstacle();
    }
}

// --- การตรวจจับการชนกับสิ่งกีดขวาง ---
function checkCollision() {
    for (const obs of obstacles) {
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            isGameOver = true;
        }
    }
}

// --- ฟังก์ชันการวาดภาพทั้งหมดลงบน Canvas ---
function draw() {
    // เคลียร์ Canvas ให้เป็นสีพื้นหลัง
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // วาดผู้เล่น
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // เพิ่มเงาให้ผู้เล่น
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;


    // วาดสิ่งกีดขวาง
    for (const obs of obstacles) {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // เพิ่มเงาให้สิ่งกีดขวาง
        ctx.shadowColor = obs.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;
    }
}

// --- ฟังก์ชัน Game Loop หลัก ---
function gameLoop() {
    if (isGameOver) {
        // ถ้าเกมจบ, แสดงหน้าจอ Game Over
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
        return;
    }

    // อัปเดตสถานะของเกม
    updatePlayer();
    updateObstacles();
    checkCollision();

    // วาดภาพใหม่
    draw();

    // เรียกตัวเองซ้ำใน Frame ถัดไปเพื่อสร้าง Animation
    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- การควบคุม: สลับแรงโน้มถ่วง ---
function switchGravity() {
    if (!isGameOver) {
        gravity *= -1; // สลับขั้วแรงโน้มถ่วง
    }
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        switchGravity();
    }
});

canvas.addEventListener('mousedown', switchGravity);
restartButton.addEventListener('click', setup);

// --- เริ่มเกมครั้งแรก ---
setup();
