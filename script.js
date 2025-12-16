const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const image = new Image();
image.src = "image.png"; // imagem do rosto

const text = "JULIANO BALBINO";

// =======================
// CONTROLE
// =======================
let textParticles = [];
let imageParticles = [];

let showText = true;
let showImage = false;

const mouse = { x: null, y: null, radius: 90 };

// =======================
// EVENTOS
// =======================
window.addEventListener("mousemove", e => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener("resize", resizeCanvas);

// =======================
// CANVAS RESPONSIVO
// =======================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createAllParticles();
}

// =======================
// AUTO FONT SIZE
// =======================
function getAutoFontSize(text, maxWidth) {
  let size = canvas.width > 1024 ? 140 : 100;
  do {
    ctx.font = `bold ${size}px Arial`;
    size--;
  } while (ctx.measureText(text).width > maxWidth);
  return size;
}

// =======================
// PARTICLE
// =======================
class Particle {
  constructor(x, y, r, g, b) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.baseX = x;
    this.baseY = y;
    this.size = 1.5;
    this.speed = Math.random() * 6 + 4;
    this.color = `rgb(${r},${g},${b})`;
  }

  update() {
    // cascata
    if (this.y < this.baseY) {
      this.y += this.speed;
    } else {
      this.y += (this.baseY - this.y) * 0.15;
      this.x += (this.baseX - this.x) * 0.15;
    }

    // hover
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouse.radius) {
      this.x -= dx * 0.12;
      this.y -= dy * 0.12;
    }
  }

  draw() {
    ctx.save();

    // 🔥 NEON AZUL
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// =======================
// CRIA PARTÍCULAS
// =======================
function createAllParticles() {
  textParticles = [];
  imageParticles = [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ---------- TEXTO ----------
  const maxWidth = canvas.width * 0.9;
  const fontSize = getAutoFontSize(text, maxWidth);

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textY = canvas.height * 0.22;

  // 🔵 GRADIENTE AZUL NEON
  const gradient = ctx.createLinearGradient(
    canvas.width / 2 - maxWidth / 2,
    0,
    canvas.width / 2 + maxWidth / 2,
    0
  );

  gradient.addColorStop(0, "#00eaff");
  gradient.addColorStop(0.5, "#1e90ff");
  gradient.addColorStop(1, "#0050ff");

  ctx.fillStyle = gradient;
  ctx.fillText(text, canvas.width / 2, textY);

  // ---------- IMAGEM ----------
  if (image.complete) {
    const scale = Math.min(
      canvas.width / image.width,
      canvas.height / image.height
    ) * 0.45;

    const imgW = image.width * scale;
    const imgH = image.height * scale;

    const imgX = (canvas.width - imgW) / 2;
    const imgY = textY + fontSize * 1.2;

    ctx.drawImage(image, imgX, imgY, imgW, imgH);
  }

  // ---------- CAPTURA PIXELS ----------
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 3) {
    for (let x = 0; x < canvas.width; x += 3) {
      const i = (y * canvas.width + x) * 4;
      const a = imageData.data[i + 3];

      if (a > 120) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        // TEXTO (parte superior)
        if (y < canvas.height * 0.35) {
          textParticles.push(new Particle(x, y, r, g, b));
        }
        // IMAGEM
        else {
          imageParticles.push(new Particle(x, y, r, g, b));
        }
      }
    }
  }
}

// =======================
// ANIMAÇÃO
// =======================
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showText) {
    textParticles.forEach(p => {
      p.update();
      p.draw();
    });
  }

  if (showImage) {
    imageParticles.forEach(p => {
      p.update();
      p.draw();
    });
  }

  requestAnimationFrame(animate);
}

// =======================
// START
// =======================
image.onload = () => {
  resizeCanvas();
  animate();

  setTimeout(() => showImage = true, 1200);
};


