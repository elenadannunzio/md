const cloud = document.querySelector(".cloud");
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let startMouseX, startMouseY;

cloud.addEventListener("mousedown", (e) => {
  const rect = cloud.getBoundingClientRect();
  const scrollbarWidth = cloud.offsetWidth - cloud.clientWidth;
  const resizeHandleSize = 50;

  if (e.clientX > rect.right - scrollbarWidth - resizeHandleSize) return;
  if (e.clientY > rect.bottom - resizeHandleSize) return;

  isDragging = true;
  startMouseX = e.clientX;
  startMouseY = e.clientY;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - startMouseX;
  const deltaY = e.clientY - startMouseY;

  cloud.style.transform = `translate(calc(-50% + ${
    offsetX + deltaX
  }px), calc(-50% + ${offsetY + deltaY}px))`;
});

document.addEventListener("mouseup", (e) => {
  if (isDragging) {
    const deltaX = e.clientX - startMouseX;
    const deltaY = e.clientY - startMouseY;
    offsetX += deltaX;
    offsetY += deltaY;
  }
  isDragging = false;
});

const weatherSlider = document.getElementById("weatherSlider");
const skyBackground = document.querySelector(".sky-background");
const shadow2 = document.getElementById("shadow2");
const shadow3 = document.getElementById("shadow3");
const shadow4 = document.getElementById("shadow4");
const shadow5 = document.getElementById("shadow5");
const lightningGlow = document.querySelector(".lightning-glow");

let lightningInterval = null;

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function updateWeather(value) {
  const t = value / 100;

  if (value == 100) {
    if (!lightningInterval) {
      scheduleLightning();
    }
  } else {
    if (lightningInterval) {
      clearTimeout(lightningInterval);
      lightningInterval = null;
    }
  }

  const saturation = lerp(100, 30, t);
  const brightness = lerp(100, 50, t);
  skyBackground.style.filter = `saturate(${saturation}%) brightness(${brightness}%)`;

  const shadow2Opacity = lerp(0, 0.4, t);
  shadow2.setAttribute("flood-opacity", shadow2Opacity);

  const shadow3Opacity = lerp(0.1, 0.4, t);
  shadow3.setAttribute("flood-opacity", shadow3Opacity);

  const shadow4Opacity = lerp(0.2, 0.6, t);
  shadow4.setAttribute("flood-opacity", shadow4Opacity);

  const shadow5Opacity = lerp(0.2, 0.7, t);
  shadow5.setAttribute("flood-opacity", shadow5Opacity);
}

weatherSlider.addEventListener("input", (e) => {
  updateWeather(e.target.value);
});

updateWeather(0);

function triggerLightning() {
  const cloudRect = cloud.getBoundingClientRect();

  const randomX = (Math.random() - 0.5) * (cloudRect.width * 0.6);
  const randomY = Math.random() * (cloudRect.height * 0.3);

  lightningGlow.style.setProperty("--lightning-x", `${randomX}px`);
  lightningGlow.style.setProperty("--lightning-y", `${randomY}px`);

  lightningGlow.classList.remove("flash");
  void lightningGlow.offsetWidth;
  lightningGlow.classList.add("flash");

  setTimeout(() => {
    lightningGlow.classList.remove("flash");
  }, 800);
}

function scheduleLightning() {
  const randomDelay = 300 + Math.random() * 1200;

  lightningInterval = setTimeout(() => {
    triggerLightning();
    scheduleLightning();
  }, randomDelay);
}

const mucca = document.querySelector(".mucca");

let muckaVelocityX = 0;
let muckaBaseLeft = 10; // percentuale base della posizione left
let muckaPixelOffset = 0; // offset in pixel dalla posizione base
let isBeingPushed = false;

function checkCloudMuccaCollision() {
  const cloudRect = cloud.getBoundingClientRect();
  const muccaRect = mucca.getBoundingClientRect();

  // Espandiamo leggermente la hitbox della nuvola per un effetto più naturale
  const padding = 40;
  const expandedCloud = {
    left: cloudRect.left + padding,
    right: cloudRect.right - padding,
    top: cloudRect.top + padding,
    bottom: cloudRect.bottom - padding,
  };

  const overlap =
    expandedCloud.left < muccaRect.right &&
    expandedCloud.right > muccaRect.left &&
    expandedCloud.top < muccaRect.bottom &&
    expandedCloud.bottom > muccaRect.top;

  if (overlap) {
    // Calcola direzione di spinta: se il centro della nuvola è a sinistra della mucca, spingi a destra e viceversa
    const cloudCenterX = cloudRect.left + cloudRect.width / 2;
    const muccaCenterX = muccaRect.left + muccaRect.width / 2;
    const direction = muccaCenterX > cloudCenterX ? 1 : -1;

    // Forza proporzionale alla sovrapposizione
    const overlapAmount = Math.min(
      expandedCloud.right - muccaRect.left,
      muccaRect.right - expandedCloud.left
    );
    const force = Math.max(2, overlapAmount * 0.3);

    muckaVelocityX += direction * force;
    isBeingPushed = true;
  } else {
    isBeingPushed = false;
  }
}

function updateMucca() {
  // Applica attrito
  muckaVelocityX *= 0.88;

  // Ferma la mucca se si muove troppo lentamente
  if (Math.abs(muckaVelocityX) < 0.1) muckaVelocityX = 0;

  muckaPixelOffset += muckaVelocityX;

  // Limita quanto la mucca può allontanarsi dallo schermo
  const maxOffset = window.innerWidth * 0.8;
  muckaPixelOffset = Math.max(-maxOffset, Math.min(maxOffset, muckaPixelOffset));

  // Ritorno lento alla posizione originale se non viene spinta
  if (!isBeingPushed && Math.abs(muckaVelocityX) < 1) {
    muckaPixelOffset *= 0.97;
  }

  mucca.style.transform = `translateX(calc(-50% + ${muckaPixelOffset}px))`;

  checkCloudMuccaCollision();
  requestAnimationFrame(updateMucca);
}

updateMucca();
// ── PIOGGIA ──────────────────────────────────────────────────────────────────

const canvas = document.createElement("canvas");
canvas.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 999;
`;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let rainIntensity = 0; // 0 = niente pioggia, 1 = pioggia massima
const drops = [];
const MAX_DROPS = 600;

function createDrop() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    length: Math.random() * 20 + 10,
    speed: Math.random() * 8 + 10,
    opacity: Math.random() * 0.4 + 0.2,
    width: Math.random() * 1 + 0.5,
  };
}

function drawRain() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Quante gocce dovremmo avere in base all'intensità
  const targetDrops = Math.floor(rainIntensity * MAX_DROPS);

  // Aggiungi gocce se ne mancano
  while (drops.length < targetDrops) {
    drops.push(createDrop());
  }

  // Rimuovi gocce in eccesso gradualmente
  if (drops.length > targetDrops && drops.length > 0) {
    drops.splice(0, Math.ceil((drops.length - targetDrops) * 0.05));
  }

  for (const drop of drops) {
    drop.y += drop.speed;
    drop.x += drop.speed * 0.15; // leggera inclinazione

    // Reset quando esce dallo schermo
    if (drop.y > canvas.height || drop.x > canvas.width) {
      drop.x = Math.random() * canvas.width;
      drop.y = Math.random() * -200;
    }

    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x + drop.length * 0.15, drop.y + drop.length);
    ctx.strokeStyle = `rgba(180, 210, 240, ${drop.opacity * rainIntensity})`;
    ctx.lineWidth = drop.width;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  requestAnimationFrame(drawRain);
}

drawRain();

// Collega l'intensità della pioggia allo slider del meteo
// Sostituisci il listener esistente dello slider con questo
weatherSlider.removeEventListener("input", weatherSlider._inputHandler);

weatherSlider._inputHandler = (e) => {
  const value = Number(e.target.value);
  updateWeather(value);

  // La pioggia inizia a comparire dal 40% dello slider
  rainIntensity = value < 40 ? 0 : (value - 40) / 60;
};

weatherSlider.addEventListener("input", weatherSlider._inputHandler);

