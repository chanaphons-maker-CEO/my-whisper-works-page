// === การตั้งค่าเริ่มต้น ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

// ขนาดของ Canvas
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0; // ตัวนับเฟรมของเกม

// === วัตถุในเกม ===

// 1. ยานอวกาศของผู้เล่น (Player's Comet)
const player = {
    x: 0,
    y: 0,
    radius: 15,
    speed: 1.5 // ความเร็วในการเคลื่อนที่ไปตามแกน x
};

// 2. กระสุนเลเซอร์
const bullets = [];
class Bullet {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.speed = 10;
    }
    update() {
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
    draw() {
        ctx.fillStyle = '#ff00ff'; // สีชมพูนีออน
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff69b4';
    }
}

// 3. อุกกาบาต (Enemies)
const enemies = [];
class Enemy {
    constructor() {
        this.radius = Math.random() * 20 + 15; // ขนาดสุ่ม
        this.x = canvas.width + this.radius;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 2 + 1;
    }
    update() {
        this.x -= this.speed;
    }
    draw() {
        ctx.fillStyle = '#a9a9a9'; // สีเทา
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

// === ส่วนของแคลคูลัส ===

// ฟังก์ชันเส้นทางของยาน (เราใช้ sin(x) เพื่อให้ดูน่าสนใจ)
function pathFunction(x) {
    // แปลง x ให้อยู่ใน scale ที่เหมาะสม และบวก canvas.height / 2 เพื่อให้อยู่กลางจอ
    return Math.sin(x / 100) * 100 + canvas.height / 2;
}

// อนุพันธ์ของฟังก์ชันเส้นทาง (Derivative)
// d/dx(sin(x/100)*100) = cos(x/100) * (1/100) * 100 = cos(x/100)
function derivativeFunction(x) {
    return Math.cos(x / 100);
}

// === ฟังก์ชันจัดการเกม ===

// ฟังก์ชันสร้างศัตรู
function handleEnemies() {
    if (gameFrame % 90 === 0) { // สร้างศัตรูทุกๆ 90 เฟรม
        enemies.push(new Enemy());
    }
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        // ลบศัตรูที่ออกจากหน้าจอ
        if (enemies[i].x < 0 - enemies[i].radius) {
            enemies.splice(i, 1);
            i--;
        }
    }
}

// ฟังก์ชันจัดการกระสุน
function handleBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].update();
        bullets[i].draw();
        // ลบกระสุนที่ออกจากหน้าจอ
        if (bullets[i].x < 0 || bullets[i].x > canvas.width || bullets[i].y < 0 || bullets[i].y > canvas.height) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

// ฟังก์ชันตรวจสอบการชนกัน
function handleCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (enemies[i] && bullets[j]) {
                const dx = enemies[i].x - bullets[j].x;
                const dy = enemies[i].y - bullets[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemies[i].radius + bullets[j].radius) {
                    // ชนกัน!
                    score += 10;
                    scoreEl.textContent = score;
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                }
            }
        }
    }
}


// === การควบคุม ===
canvas.addEventListener('click', function(event) {
    // 1. หาความชัน (slope) ณ ตำแหน่งปัจจุบันของยาน
    const slope = derivativeFunction(player.x);

    // 2. แปลงความชันเป็นเวกเตอร์ทิศทาง (Direction Vector)
    // ความชัน m = dy/dx. เราสามารถใช้เวกเตอร์ <dx, dy> เป็น <1, m>
    // แต่เพื่อให้ความเร็วคงที่ เราต้องทำให้เป็น Unit Vector
    const angle = Math.atan(slope);
    
    // จัดการทิศทางของยานที่เคลื่อนที่ไปข้างหน้า
    let velocityX = Math.cos(angle);
    let velocityY = Math.sin(angle);

    // สร้างกระสุนใหม่
    bullets.push(new Bullet(player.x, player.y, velocityX, velocityY));
});


// === Game Loop (หัวใจหลักที่ทำให้เกมเคลื่อนไหว) ===
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // ล้างจอทุกเฟรม

    // วาดเส้นทางของยาน (เพื่อความสวยงาม)
    ctx.strokeStyle = 'rgba(106, 13, 173, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i++) {
        ctx.lineTo(i, pathFunction(i));
    }
    ctx.stroke();

    // อัปเดตและวาดวัตถุต่างๆ
    handleBullets();
    handleEnemies();
    handleCollisions();
    
    // อัปเดตตำแหน่งยาน
    player.x += player.speed;
    player.y = pathFunction(player.x);

    // ทำให้ยานวนกลับมาเมื่อตกขอบ
    if (player.x > canvas.width + player.radius) {
        player.x = 0 - player.radius;
    }

    // วาดยาน
    ctx.fillStyle = '#00ffff'; // สีฟ้านีออน
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    
    gameFrame++;
    requestAnimationFrame(animate); // เรียกใช้ animate() ในเฟรมถัดไป
}

// เริ่มเกม!
animate();
