// ===== Valentine's Day Configuration =====
const VALENTINE_DATE = new Date('2026-02-14T00:00:00');

// ===== URL Parameter Parsing (Shareable Links) =====
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const data = {};
  ['name', 'greetingText', 'wishText', 'imagePath', 'letterBody', 'finalMessage'].forEach(key => {
    if (params.get(key)) data[key] = decodeURIComponent(params.get(key));
  });
  return data;
}

// ===== Apply Customization Data =====
function applyData(data) {
  Object.keys(data).forEach(key => {
    if (data[key] !== '') {
      const el = document.getElementById(key);
      if (el) {
        if (key === 'imagePath') {
          el.setAttribute('src', data[key]);
        } else {
          el.innerText = data[key];
        }
      }
    }
  });
}

// ===== Fetch & Merge Customization =====
let imageList = [];
async function fetchData() {
  const urlParams = getUrlParams();
  try {
    const response = await fetch('customize.json');
    const fileData = await response.json();
    // Extract images array before applying text data
    if (fileData.images && Array.isArray(fileData.images)) {
      imageList = fileData.images;
    }
    const textData = { ...fileData, ...urlParams };
    delete textData.images; // Don't try to set innerHTML for images
    applyData(textData);
  } catch (e) {
    applyData(urlParams);
  }
  // Build the gallery with whatever images we found
  buildPhotoGallery(imageList);
}

// ===== Dynamic Photo Gallery Builder =====
function buildPhotoGallery(images) {
  const gallery = document.getElementById('photo-gallery');
  if (!gallery || images.length === 0) return;

  const count = images.length;
  // Calculate grid: how many columns and rows
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  // Base photo size adapts to how many images there are
  const isMobile = window.innerWidth <= 500;
  const baseWidth = isMobile ? Math.min(120, 280 / cols) : Math.min(190, 500 / cols);
  const baseHeight = baseWidth * 0.8;

  images.forEach((src, i) => {
    const frame = document.createElement('div');
    frame.className = 'photo-frame';

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Memory ${i + 1}`;
    frame.appendChild(img);

    // Calculate grid cell
    const col = i % cols;
    const row = Math.floor(i / cols);

    const cellW = 100 / cols;
    const cellH = 100 / rows;

    // Position within cell with randomness so it feels organic
    const left = col * cellW + cellW * 0.1 + Math.random() * (cellW * 0.2);
    const top = row * cellH + cellH * 0.1 + Math.random() * (cellH * 0.2);

    // Random rotation between -8 and 8 degrees
    const rotation = (Math.random() - 0.5) * 16;

    // Slight size variation
    const sizeJitter = 0.85 + Math.random() * 0.3;
    const w = Math.round(baseWidth * sizeJitter);
    const h = Math.round(baseHeight * sizeJitter);

    frame.style.left = `${left}%`;
    frame.style.top = `${top}%`;
    frame.style.width = `${w}px`;
    frame.style.height = `${h}px`;
    frame.style.transform = `rotate(${rotation.toFixed(1)}deg)`;

    gallery.appendChild(frame);
  });
}

// ===== Loading Screen =====
function hideLoadingScreen() {
  return new Promise(resolve => {
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      setTimeout(resolve, 800);
    }, 2500);
  });
}

// ===== Floating Hearts Background =====
function createFloatingHearts() {
  const container = document.getElementById('floating-hearts');
  const hearts = ['❤️', '💖', '💕', '💗', '💘', '💝', '♥️'];

  function spawnHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 18 + 10) + 'px';
    heart.style.animationDuration = (Math.random() * 8 + 7) + 's';
    heart.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 18000);
  }

  for (let i = 0; i < 8; i++) setTimeout(spawnHeart, i * 400);
  setInterval(spawnHeart, 1800);
}

// ===== Countdown Timer =====
let countdownInterval = null;
function initCountdown() {
  const el = document.getElementById('countdown');
  function update() {
    const diff = VALENTINE_DATE - new Date();
    if (diff <= 0) {
      el.innerHTML = '<p style="font-family:Dancing Script,cursive;font-size:2rem;">💖 Happy Valentine\'s Day! 💖</p>';
      clearInterval(countdownInterval);
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    el.innerHTML = [
      { n: d, l: 'Days' }, { n: h, l: 'Hours' }, { n: m, l: 'Min' }, { n: s, l: 'Sec' }
    ].map(i => `<div class="countdown-item"><span class="number">${i.n}</span><span class="label">${i.l}</span></div>`).join('');
  }
  update();
  countdownInterval = setInterval(update, 1000);
}

// ===== Cursor Trail (Hearts Following Mouse) =====
function initCursorTrail() {
  const canvas = document.getElementById('cursor-trail');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function addParticle(x, y) {
    particles.push({
      x, y,
      size: Math.random() * 14 + 8,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2 - 1,
      life: 1,
      decay: Math.random() * 0.015 + 0.008,
      hue: 340 + Math.random() * 30
    });
  }

  document.addEventListener('mousemove', e => addParticle(e.clientX, e.clientY));
  document.addEventListener('touchmove', e => {
    e.preventDefault();
    addParticle(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❤', p.x, p.y);
      ctx.restore();
    }
    if (particles.length > 120) particles = particles.slice(-90);
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== Background Music (Web Audio API) =====
let audioCtx = null;
let musicPlaying = false;
let musicLoop = null;

function initMusic() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Create reverb
  const convolver = audioCtx.createConvolver();
  const rate = audioCtx.sampleRate;
  const len = rate * 2.5;
  const impulse = audioCtx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = impulse.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  convolver.buffer = impulse;

  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.12;
  convolver.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  // Romantic melody notes (Hz)
  const melody = [
    523.25, 493.88, 440.00, 392.00, 440.00, 493.88, 523.25, 659.26,
    587.33, 523.25, 493.88, 440.00, 392.00, 349.23, 392.00, 440.00,
    523.25, 587.33, 659.26, 587.33, 523.25, 493.88, 440.00, 523.25,
    659.26, 587.33, 523.25, 440.00, 392.00, 440.00, 493.88, 523.25
  ];

  let idx = 0;
  function playNote() {
    if (!musicPlaying || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = melody[idx % melody.length];
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);
    osc.connect(gain);
    gain.connect(convolver);
    gain.connect(masterGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 1.8);
    idx++;
  }

  musicLoop = setInterval(playNote, 600);
  playNote();
}

function toggleMusic() {
  const icon = document.getElementById('music-icon');
  if (!musicPlaying) {
    musicPlaying = true;
    initMusic();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    icon.textContent = '🔊';
  } else {
    musicPlaying = false;
    if (musicLoop) clearInterval(musicLoop);
    musicLoop = null;
    if (audioCtx) audioCtx.suspend();
    icon.textContent = '🔇';
  }
}

document.getElementById('music-toggle').addEventListener('click', toggleMusic);

// ===== "No" Button Dodging =====
function initNoButtonDodge() {
  const btnNo = document.getElementById('btn-no');
  let dodgeCount = 0;

  function dodge(e) {
    e.preventDefault();
    dodgeCount++;

    const phrases = ['No 😅', 'Hehe 😜', 'Try again!', 'Nope! 🏃', 'Can\'t catch me!', 'Just say Yes! 💖', 'Please? 🥺'];
    btnNo.textContent = phrases[Math.min(dodgeCount, phrases.length - 1)];

    // Move to random position within the question area
    const parent = document.getElementById('scene-question');
    const rect = parent.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();
    const maxX = rect.width - btnRect.width - 20;
    const maxY = rect.height - btnRect.height - 20;

    const newX = Math.random() * maxX - maxX / 2;
    const newY = Math.random() * maxY - maxY / 2;

    btnNo.style.position = 'relative';
    btnNo.style.transform = `translate(${newX}px, ${newY}px)`;

    // After too many dodges, grow the Yes button
    const btnYes = document.getElementById('btn-yes');
    btnYes.style.transform = `scale(${1 + dodgeCount * 0.08})`;
  }

  btnNo.addEventListener('mouseenter', dodge);
  btnNo.addEventListener('click', dodge);
  btnNo.addEventListener('touchstart', dodge, { passive: false });
}

// ===== "Yes" Button - Confetti Explosion =====
function initYesButton(tl) {
  document.getElementById('btn-yes').addEventListener('click', () => {
    // Hide buttons, show response
    document.getElementById('question-buttons').style.display = 'none';
    const response = document.getElementById('yes-response');
    response.style.display = 'block';
    gsap.from(response, { scale: 0.3, opacity: 0, duration: 0.6, ease: 'back.out(2)' });

    // Massive confetti explosion!
    const duration = 4000;
    const end = Date.now() + duration;
    const colors = ['#ff1744', '#ff4081', '#f48fb1', '#ffd700', '#e91e63', '#ff80ab'];

    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors });
      confetti({
        particleCount: 3, angle: 90, spread: 100, origin: { x: 0.5, y: 0.3 }, colors,
        shapes: ['circle'], scalar: 1.5
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    // Continue timeline after a pause
    setTimeout(() => tl.resume(), 3500);
  });
}

// ===== Main Animation Timeline (GSAP 3) =====
function animationTimeline() {
  // Split text into individual spans for char-by-char animation
  const chatBox = document.querySelector('.hbd-chatbox');
  const wishHbd = document.querySelector('.wish-hbd');

  chatBox.innerHTML = `<span>${chatBox.innerHTML.split('').join('</span><span>')}</span>`;
  wishHbd.innerHTML = `<span>${wishHbd.innerHTML.split('').join('</span><span>')}</span>`;

  const ideaIn = { opacity: 0, y: -20, rotationX: 5, skewX: '15deg' };
  const ideaOut = { opacity: 0, y: 20, rotationY: 5, skewX: '-15deg' };

  const tl = gsap.timeline();

  tl
    // Show container
    .to('.container', { visibility: 'visible', duration: 0.1 })

    // Scene 1: Greeting
    .from('.greeting-name', { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' })
    .from('.greeting-name span', { scale: 0.5, color: '#fff', duration: 0.5, ease: 'back.out(2)' }, '-=0.3')
    .from('.greeting-text', { opacity: 0, y: 10, duration: 0.5 })
    .to('.scene-one', { opacity: 0, y: 10, duration: 0.7 }, '+=2.5')

    // Scene 2: Valentine Announcement + Countdown
    .from('.valentine-announce', { opacity: 0, scale: 0.5, duration: 0.8, ease: 'back.out(1.5)' })
    .from('.countdown', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
    .to('.scene-two', { opacity: 0, y: 10, duration: 0.7 }, '+=3')

    // Scene 3: Chat Bubble
    .from('.scene-three', { scale: 0.2, opacity: 0, duration: 0.7 })
    .from('.fake-btn', { scale: 0.2, opacity: 0, duration: 0.3 })
    .to('.hbd-chatbox span', { visibility: 'visible', duration: 0.5, stagger: 0.04 })
    .to('.fake-btn', { backgroundColor: 'rgb(127, 206, 248)', duration: 0.1 })
    .to('.scene-three', { scale: 0.2, opacity: 0, y: -150, duration: 0.5 }, '+=1')

    // Scene 4: Story
    .from('.idea-1', { ...ideaIn, duration: 0.7 })
    .to('.idea-1', { ...ideaOut, duration: 0.7 }, '+=1.5')
    .from('.idea-2', { ...ideaIn, duration: 0.7 })
    .to('.idea-2', { ...ideaOut, duration: 0.7 }, '+=1.5')
    .from('.idea-3', { ...ideaIn, duration: 0.7 })
    .to('.idea-3 strong', { scale: 1.2, x: 10, color: '#fff', duration: 0.5 })
    .to('.idea-3', { ...ideaOut, duration: 0.7 }, '+=1.5')
    .from('.idea-4', { ...ideaIn, duration: 0.7 })
    .to('.idea-4', { ...ideaOut, duration: 0.7 }, '+=1.5')
    .from('.idea-5', { rotationX: 15, rotationZ: -10, skewY: '-5deg', y: 50, opacity: 0, duration: 0.7 }, '+=0.5')
    .to('.idea-5 span', { rotation: 90, x: 8, duration: 0.7 }, '+=0.4')
    .to('.idea-5', { scale: 0.2, opacity: 0, duration: 0.7 }, '+=2')
    .from('.idea-6 span', { scale: 3, opacity: 0, rotation: 15, ease: 'expo.out', duration: 0.8, stagger: 0.2 })
    .to('.idea-6 span', { scale: 3, opacity: 0, rotation: -15, ease: 'expo.out', duration: 0.8, stagger: 0.2 }, '+=1')

    // Scene 5: Love Letter
    .from('.love-letter', { opacity: 0, scale: 0.5, rotationX: 30, duration: 0.8, ease: 'power2.out' })
    .from('.letter-seal', { scale: 3, opacity: 0, rotation: 360, duration: 0.6, ease: 'back.out(2)' }, '-=0.3')
    .from('.letter-paper', { scaleY: 0, opacity: 0, duration: 0.7, ease: 'power2.out' })
    .from('.letter-dear', { opacity: 0, x: -20, duration: 0.4 })
    .from('.letter-body', { opacity: 0, y: 15, duration: 0.6 })
    .from('.letter-sign', { opacity: 0, x: 20, duration: 0.4 })
    .to('.scene-five', { opacity: 0, scale: 0.8, duration: 0.7 }, '+=3')

    // Scene 6: Photo Reveal + Balloons
    .fromTo('.baloons img', { opacity: 0.9, y: 1400 }, { opacity: 1, y: -1000, duration: 2.5, stagger: 0.15 })
    .from('.photo-frame', {
      scale: 3, opacity: 0, rotationZ: () => (Math.random() - 0.5) * 60,
      x: () => (Math.random() - 0.5) * 200,
      y: () => (Math.random() - 0.5) * 200,
      duration: 0.5, ease: 'back.out(1.5)',
      stagger: { each: 0.15, from: 'random' }
    }, '-=2')
    .from('.wish-hbd span', {
      opacity: 0, y: -50, rotation: 150, skewX: '30deg',
      ease: 'elastic.out(1, 0.5)', duration: 0.7, stagger: 0.06
    }, 'party')
    .fromTo('.wish-hbd span', { scale: 1.4, rotationY: 150 }, {
      scale: 1, rotationY: 0, color: 'rgba(255, 2, 2, 1)ff', ease: 'expo.out', duration: 0.7, stagger: 0.06
    }, 'party')
    .from('.wish h5', { opacity: 0, y: 10, skewX: '-15deg', duration: 0.5 }, 'party')

    // Scene 7: Expanding circles confetti burst
    .to('.scene-seven svg', {
      visibility: 'visible', opacity: 0, scale: 80,
      repeat: 2, repeatDelay: 1.4, duration: 1.5, stagger: 0.3
    })
    .to('.scene-six', { opacity: 0, y: 30, zIndex: '-1', duration: 0.5 })

    // Scene 8: Will You Be My Valentine?
    .set('.scene-eight', { opacity: 1 })
    .set('.question-title', { opacity: 1 })
    .set('.btn-yes', { opacity: 1 })
    .set('.btn-no', { opacity: 1 })
    .fromTo('.scene-eight', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' })
    .fromTo('.question-title', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
    .fromTo('.btn-yes', { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 })
    .fromTo('.btn-no', { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, '-=0.3')
    .addPause() // ← PAUSES here, waiting for "Yes" click

    // Scene 9: Final (resumes after Yes click)
    .to('.scene-eight', { opacity: 0, y: 20, duration: 0.5 })
    .from('.scene-nine', { ...ideaIn, duration: 0 })
    .from('.final-message', { ...ideaIn, duration: 1 })
    .from('.replay-btn', { ...ideaIn, duration: 1 }, '-=0.3')
    .from('.last-smile', { opacity: 0, duration: 0.5 })
    .to('.last-smile', { rotation: 90, duration: 0.5 }, '+=1');

  // Wire up interactive elements
  initNoButtonDodge();
  initYesButton(tl);

  // Replay
  document.getElementById('replay').addEventListener('click', () => {
    // Reset question state
    document.getElementById('question-buttons').style.display = 'flex';
    document.getElementById('yes-response').style.display = 'none';
    const btnNo = document.getElementById('btn-no');
    btnNo.textContent = 'No 😅';
    btnNo.style.transform = '';
    btnNo.style.position = '';
    document.getElementById('btn-yes').style.transform = '';
    tl.restart();
  });
}

// ===== Initialize Everything =====
async function init() {
  createFloatingHearts();
  initCursorTrail();
  initCountdown();
  await fetchData();
  await hideLoadingScreen();
  animationTimeline();
}

init();
