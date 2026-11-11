
const decisions = [
  { short: "УВОЛЬНЕНИЕ", full: "Увольняйся. Даже если не работаешь." },
  { short: "ГУСЬ", full: "Купи гуся. Дальше разберётесь." },
  { short: "ЭКСПЕРИМЕНТ", full: "Сделай вид, что это был социальный эксперимент." },
  { short: "ОМСК", full: "Переезжай в Омск. Хуже уже не будет." },
  { short: "ВАЛЕРА", full: "Усынови кактус. Назови Валерой." },
  { short: "ЗАВЕЩАНИЕ", full: "Напиши завещание. Оставь долги голубям." },
  { short: "ЛОПАТА", full: "Купи лопату. На вопросы отвечай: «Пока рано»." },
  { short: "БЮРО", full: "Открой похоронное бюро. Назови «До скорой встречи»." },
  { short: "КЕШБЭК", full: "Продай душу. Потребуй кешбэк." },
  { short: "ЦИРК", full: "Позвони в цирк. Скажи, что их руководство у тебя дома." },
  { short: "ПРЕСТОЛ", full: "Объяви себя наследником престола. Страну придумай позже." },
  { short: "СКЛЕП", full: "Возьми ипотеку на склеп. Думай о будущем." }
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin-button");
const statusText = document.getElementById("status");
const resultCard = document.getElementById("result-card");
const resultText = document.getElementById("result-text");
const announcement = document.getElementById("announcement");
const confettiContainer = document.getElementById("confetti");
const lightsContainer = document.getElementById("lights");

const TAU = Math.PI * 2;
const slice = TAU / decisions.length;
const radius = canvas.width / 2;
const center = radius;

let rotation = 0;
let spinning = false;
let audioContext = null;
let lastTick = -1;
let spinCount = 0;
let lightsTimer = null;

const colors = [
  "#801e35", "#28101e",
  "#a06a2c", "#5c142c",
  "#2e1826", "#93412c",
  "#801e35", "#28101e",
  "#a06a2c", "#5c142c",
  "#2e1826", "#93412c"
];

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(rotation);

  decisions.forEach((decision, index) => {
    const start = -Math.PI / 2 - slice / 2 + index * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 9, start, end);
    ctx.closePath();

    ctx.fillStyle = colors[index];
    ctx.fill();

    ctx.strokeStyle = "#d5a44b";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + slice / 2);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff0c7";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 5;
    ctx.font = "bold 24px Montserrat, Arial";

    ctx.fillText(decision.short, radius - 30, 0, 230);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, radius - 8, 0, TAU);
  ctx.strokeStyle = "#f1c979";
  ctx.lineWidth = 12;
  ctx.stroke();

  ctx.restore();
}

function createLights() {
  const count = 36;

  for (let i = 0; i < count; i++) {
    const bulb = document.createElement("div");
    bulb.className = "bulb";

    const angle = (i / count) * TAU;
    const x = 50 + 50 * Math.cos(angle);
    const y = 50 + 50 * Math.sin(angle);

    bulb.style.left = `calc(${x}% - 5px)`;
    bulb.style.top = `calc(${y}% - 5px)`;

    lightsContainer.appendChild(bulb);
  }
}

function startLights() {
  let phase = 0;

  lightsTimer = setInterval(() => {
    const bulbs = document.querySelectorAll(".bulb");

    bulbs.forEach((bulb, index) => {
      bulb.classList.toggle("dim", (index + phase) % 3 === 0);
    });

    phase++;
  }, 120);
}

function stopLights() {
  clearInterval(lightsTimer);
  lightsTimer = null;

  document.querySelectorAll(".bulb").forEach(bulb => {
    bulb.classList.remove("dim");
  });
}

function getAudio() {
  if (!audioContext) {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return null;
    audioContext = new AudioClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(frequency, duration = 0.08, type = "sine", volume = 0.06) {
  const audio = getAudio();
  if (!audio) return;

  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  oscillator.connect(gain);
  gain.connect(audio.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

function playTick() {
  playTone(650, 0.025, "square", 0.025);
}

function playFanfare() {
  const notes = [392, 523, 659, 784, 1047];

  notes.forEach((note, index) => {
    setTimeout(() => {
      playTone(note, 0.22, "triangle", 0.075);
    }, index * 130);
  });
}

function playGoose() {
  [280, 230, 280, 190].forEach((note, index) => {
    setTimeout(() => {
      playTone(note, 0.18, "sawtooth", 0.065);
    }, index * 170);
  });
}

function playRejected() {
  playTone(180, 0.3, "sawtooth", 0.07);

  setTimeout(() => {
    playTone(110, 0.4, "sawtooth", 0.06);
  }, 180);
}

function showAnnouncement(message, duration = 1700) {
  announcement.textContent = message;
  announcement.classList.remove("hidden");

  return new Promise(resolve => {
    setTimeout(() => {
      announcement.classList.add("hidden");
      resolve();
    }, duration);
  });
}

function launchConfetti() {
  const palette = ["#ffd66e", "#b91f48", "#fff2c4", "#8c4d9d", "#d99b39"];

  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = palette[Math.floor(Math.random() * palette.length)];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;

    confettiContainer.appendChild(piece);

    setTimeout(() => piece.remove(), 5000);
  }
}

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function normalizeAngle(angle) {
  return ((angle % TAU) + TAU) % TAU;
}

function selectedIndex() {
  const normalized = normalizeAngle(-rotation);
  return Math.floor((normalized + slice / 2) / slice) % decisions.length;
}

function animateSpin(targetRotation, duration) {
  return new Promise(resolve => {
    const startRotation = rotation;
    const distance = targetRotation - startRotation;
    const startTime = performance.now();

    lastTick = -1;

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      rotation = startRotation + distance * easeOutQuint(progress);

      drawWheel();

      const tickPosition = Math.floor(rotation / slice);

      if (tickPosition !== lastTick) {
        if (progress > 0.25) playTick();
        lastTick = tickPosition;
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        rotation = targetRotation;
        drawWheel();
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

async function spinWheel() {
  if (spinning) return;

  spinning = true;
  spinCount++;

  spinButton.disabled = true;
  spinButton.textContent = "СУДЬБА СОВЕЩАЕТСЯ...";
  resultCard.classList.add("hidden");

  getAudio();
  startLights();

  statusText.textContent = "Вращаем бюрократический барабан...";

  const chosen = Math.floor(Math.random() * decisions.length);
  const turns = 6 + Math.floor(Math.random() * 3);

  const current = normalizeAngle(rotation);
  const desired = normalizeAngle(-chosen * slice);
  const extra = normalizeAngle(desired - current);

  await animateSpin(rotation + turns * TAU + extra, 5500);

  let finalChoice = selectedIndex();

  // В 15% случаев комиссия отменяет результат.
  if (Math.random() < 0.15) {
    playRejected();
    statusText.textContent = "ВНИМАНИЕ! ВМЕШАЛАСЬ КОМИССИЯ.";

    await showAnnouncement("КОМИССИЯ ПЕРЕДУМАЛА!", 1900);

    const alternatives = decisions
      .map((_, index) => index)
      .filter(index => index !== finalChoice);

    const newChoice = alternatives[
      Math.floor(Math.random() * alternatives.length)
    ];

    const nextDesired = normalizeAngle(-newChoice * slice);
    const nextCurrent = normalizeAngle(rotation);
    const nextExtra = normalizeAngle(nextDesired - nextCurrent);

    statusText.textContent = "Пересмотр решения. Причины засекречены.";

    await animateSpin(rotation + 4 * TAU + nextExtra, 3500);
    finalChoice = selectedIndex();
  }

  stopLights();

  resultText.textContent = decisions[finalChoice].full;
  resultCard.classList.remove("hidden");

  statusText.textContent = "Решение принято. Юристы уже сбежали.";

  if (finalChoice === 1 || Math.random() < 0.12) {
    playGoose();
  } else {
    playFanfare();
  }

  launchConfetti();

  spinButton.textContent = "ЕЩЁ РАЗ!";

  // Иногда комиссия отказывает в немедленной апелляции.
  if (spinCount > 1 && Math.random() < 0.2) {
    spinButton.textContent = "АПЕЛЛЯЦИЯ ОТКЛОНЕНА";
    playRejected();

    await new Promise(resolve => setTimeout(resolve, 1400));

    spinButton.textContent = "ЕЩЁ РАЗ!";
  }

  spinButton.disabled = false;
  spinning = false;
}

spinButton.addEventListener("click", spinWheel);

createLights();
drawWheel();
