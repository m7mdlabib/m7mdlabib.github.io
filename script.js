gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// 1. CURSOR
const cursor = document.getElementById('custom-cursor');
if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    });
}

// 2. BACKGROUND ANIMATION
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
let hearts = [];
const heartColors = ['#B91C1C', '#4169E1', '#262626'];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', initCanvas);
initCanvas();

class Heart {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height + canvas.height;
        this.size = Math.random() * (window.innerWidth < 768 ? 8 : 15) + 5;
        this.speed = Math.random() * 1 + 0.5;
        this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
        this.opacity = Math.random() * 0.3 + 0.1;
    }
    update() {
        this.y -= this.speed;
        if (this.y < -50) this.reset();
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.opacity; ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.moveTo(0,0);
        ctx.bezierCurveTo(-this.size, -this.size, -this.size*2, this.size/2, 0, this.size*1.5);
        ctx.bezierCurveTo(this.size*2, this.size/2, this.size, -this.size, 0, 0);
        ctx.fill(); ctx.restore();
    }
}
for(let i=0; i < (window.innerWidth < 768 ? 25 : 45); i++) hearts.push(new Heart());
function animateBackground() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    hearts.forEach(h => { h.update(); h.draw(); });
    requestAnimationFrame(animateBackground);
}
animateBackground();

// 3. PAPER UNFOLDING (Height adjusted for long text)
const paperArea = document.getElementById('paperUnfoldArea');
const unfoldingPaper = document.querySelector('.unfolding-paper');
const crumpledOverlay = document.querySelector('.crumpled-overlay');
let foldProgress = 0;

function updatePaper(delta) {
    foldProgress += delta;
    foldProgress = Math.min(Math.max(foldProgress, 0), 100);
    // Adjusted max height to fit the long emotional letter
    const maxH = window.innerWidth < 768 ? 950 : 850; 
    gsap.to(paperArea, { height: 100 + (foldProgress * (maxH/100 - 1)), duration: 0.2 });
    gsap.to(unfoldingPaper, { opacity: foldProgress/100, duration: 0.4 });
    gsap.to(crumpledOverlay, { opacity: (100-foldProgress)/100, duration: 0.4 });
}

window.addEventListener('wheel', (e) => {
    const rect = paperArea.getBoundingClientRect();
    if (e.clientX > rect.left && e.clientX < rect.right && e.clientY > rect.top && e.clientY < rect.bottom) {
        if ((foldProgress < 100 && e.deltaY > 0) || (foldProgress > 0 && e.deltaY < 0)) e.preventDefault();
        updatePaper(e.deltaY * 0.1);
    }
}, { passive: false });

let touchStartY = 0;
paperArea.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, {passive: true});
paperArea.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    const diff = touchStartY - currentY;
    if ((foldProgress < 100 && diff > 0) || (foldProgress > 0 && diff < 0)) e.preventDefault();
    updatePaper(diff * 0.5);
    touchStartY = currentY;
}, {passive: false});

// 4. SMART NO BUTTON
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
let yesScale = 1;

function moveNoButton() {
    const border = window.innerWidth < 768 ? 40 : 100; 
    const yesRect = yesBtn.getBoundingClientRect();
    
    let safe = false;
    let targetX, targetY;

    let attempts = 0;
    while (!safe && attempts < 100) {
        // Find random relative position
        const x = (Math.random() - 0.5) * (window.innerWidth - border * 2);
        const y = (Math.random() - 0.5) * (window.innerHeight - border * 2);

        // Convert to absolute screen coordinates
        const absX = (window.innerWidth / 2) + x;
        const absY = (window.innerHeight / 2) + y;

        // Calculate distance from center of YES button
        const dist = Math.sqrt(
            Math.pow(absX - (yesRect.left + yesRect.width/2), 2) + 
            Math.pow(absY - (yesRect.top + yesRect.height/2), 2)
        );

        // Ensure distance is greater than current Yes Button width + buffer
        if (dist > (yesRect.width/2 + 100)) { 
            safe = true; 
            targetX = x; 
            targetY = y; 
        }
        attempts++;
    }

    gsap.to(noBtn, { x: targetX, y: targetY, duration: 0.3, ease: "power2.out" });
    yesScale += 0.2;
    gsap.to(yesBtn, { scale: yesScale, duration: 0.3, ease: "back.out" });
}

noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); });

// 5. SUCCESS & NAVIGATION
const success = document.getElementById('success-screen');
yesBtn.addEventListener('click', () => {
    success.style.display = 'flex';
    gsap.from(success, { opacity: 0, duration: 0.5 });
});

document.getElementById('closeSuccess').addEventListener('click', () => {
    gsap.to(success, { opacity: 0, duration: 0.5, onComplete: () => {
        success.style.display = 'none';
        success.style.opacity = 1;
        yesScale = 1;
        gsap.to(yesBtn, { scale: 1, duration: 0.5 });
        gsap.to(noBtn, { x: 0, y: 0, duration: 0.5 });
    }});
});

function scrollToSec(id) { gsap.to(window, { duration: 1.2, scrollTo: id, ease: "power3.inOut" }); }