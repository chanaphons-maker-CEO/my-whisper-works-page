// --- ดึง Element จาก HTML ---
const scoreElement = document.getElementById('score');
const timerBar = document.getElementById('timer-bar');
const problemTextElement = document.getElementById('problem-text');
const formulaHintElement = document.getElementById('formula-hint');
const answerInput = document.getElementById('answer-input');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const correctAnswerElement = document.getElementById('correct-answer');
const restartButton = document.getElementById('restartButton');

// --- ตัวแปรหลักของเกม ---
let score;
let timeLeft;
let maxTime = 15; // เวลา 15 วินาทีต่อข้อ
let timerInterval;
let currentProblem;
let isGameOver;

// --- คลังโจทย์ฟิสิกส์ (หัวใจของเกม) ---
const problemTemplates = [
    {
        // โจทย์: หา s จาก u, t, a
        // สูตร: s = ut + 0.5 * a * t^2
        generate: () => {
            const u = Math.floor(Math.random() * 10) + 1; // 1-10
            const t = Math.floor(Math.random() * 5) + 2;  // 2-6
            const a = Math.floor(Math.random() * 5) + 1;  // 1-5
            const s = u * t + 0.5 * a * t * t;
            return {
                text: `วัตถุมีความเร็วต้น (u) = ${u} m/s, ความเร่ง (a) = ${a} m/s², เคลื่อนที่เป็นเวลา (t) = ${t} s. จงหาระยะทาง (s) ที่เคลื่อนที่ได้ (m)?`,
                formula: 's = ut + ½at²',
                answer: s
            };
        }
    },
    {
        // โจทย์: หา v จาก u, a, t
        // สูตร: v = u + at
        generate: () => {
            const u = Math.floor(Math.random() * 20); // 0-19
            const a = Math.floor(Math.random() * 10) + 1; // 1-10
            const t = Math.floor(Math.random() * 10) + 1; // 1-10
            const v = u + a * t;
            return {
                text: `รถยนต์เริ่มเคลื่อนที่ด้วยความเร็ว (u) = ${u} m/s และมีความเร่งคงที่ (a) = ${a} m/s². เมื่อเวลาผ่านไป (t) = ${t} s, รถจะมีความเร็วปลาย (v) เท่าใด (m/s)?`,
                formula: 'v = u + at',
                answer: v
            };
        }
    },
    {
        // โจทย์: หา F จาก m, a
        // สูตร: F = ma
        generate: () => {
            const m = Math.floor(Math.random() * 50) + 10; // 10-59
            const a = Math.floor(Math.random() * 10) + 2;  // 2-11
            const F = m * a;
            return {
                text: `ถ้าต้องการทำให้วัตถุมวล (m) = ${m} kg เคลื่อนที่ด้วยความเร่ง (a) = ${a} m/s², จะต้องใช้แรง (F) กี่นิวตัน (N)?`,
                formula: 'F = ma',
                answer: F
            };
        }
    }
];

// --- ฟังก์ชันเริ่มต้น/รีเซ็ตเกม ---
function startGame() {
    score = 0;
    isGameOver = false;
    scoreElement.textContent = score;
    gameOverScreen.classList.add('hidden');
    answerInput.disabled = false;
    answerInput.focus();
    
    nextProblem();
}

// --- ฟังก์ชันสร้างและแสดงโจทย์ใหม่ ---
function nextProblem() {
    // สุ่มโจทย์จากคลัง
    const template = problemTemplates[Math.floor(Math.random() * problemTemplates.length)];
    currentProblem = template.generate();

    // แสดงโจทย์และคำใบ้
    problemTextElement.textContent = currentProblem.text;
    formulaHintElement.textContent = `คำใบ้: ${currentProblem.formula}`;
    
    // เคลียร์ช่องคำตอบและตั้งเวลาใหม่
    answerInput.value = '';
    resetTimer();
}

// --- ฟังก์ชันจัดการเวลา ---
function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = maxTime;
    timerBar.style.transition = 'none'; // ปิด transition ชั่วคราว
    timerBar.style.width = '100%';
    
    // หน่วงเวลาเล็กน้อยเพื่อให้ browser render ก่อนเริ่ม transition ใหม่
    setTimeout(() => {
        timerBar.style.transition = `width ${maxTime}s linear`;
        timerBar.style.width = '0%';
    }, 50);

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// --- ฟังก์ชันจบเกม ---
function endGame() {
    isGameOver = true;
    answerInput.disabled = true;
    clearInterval(timerInterval);

    finalScoreElement.textContent = score;
    correctAnswerElement.textContent = currentProblem.answer;
    gameOverScreen.classList.remove('hidden');
}

// --- ฟังก์ชันตรวจสอบคำตอบ ---
function checkAnswer() {
    if (isGameOver) return;

    const userAnswer = parseFloat(answerInput.value);
    
    // ใช้ Math.abs เพื่อจัดการความคลาดเคลื่อนของทศนิยม
    if (Math.abs(userAnswer - currentProblem.answer) < 0.01) {
        // ตอบถูก
        score++;
        scoreElement.textContent = score;
        nextProblem();
    } else {
        // ตอบผิด
        endGame();
    }
}

// --- Event Listeners ---
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

restartButton.addEventListener('click', startGame);

// --- เริ่มเกมครั้งแรก ---
startGame();
