const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealElements.forEach((element) => observer.observe(element));

function initHeroParticles() {
  const canvas = document.getElementById("hero-particles-canvas");
  if (!canvas) return;
  const heroSection = canvas.closest(".hero-canvas-wrap");

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let animationFrameId;
  let particles = [];
  const mouse = { x: null, y: null, radius: 180 };
  let viewportWidth = 0;
  let viewportHeight = 0;
  let dpr = 1;

  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      if (this.x > viewportWidth || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > viewportHeight || this.y < 0) {
        this.directionY = -this.directionY;
      }

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        if (distance < mouse.radius + this.size) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirectionX * force * 4.5;
          this.y -= forceDirectionY * force * 4.5;
        }
      }

      this.x += this.directionX;
      this.y += this.directionY;
      this.draw();
    }
  }

  function init() {
    particles = [];
    const numberOfParticles = Math.max(
      62,
      Math.floor((viewportHeight * viewportWidth) / 6200)
    );
    for (let i = 0; i < numberOfParticles; i += 1) {
      const size = Math.random() * 2 + 1;
      const x = Math.random() * (viewportWidth - size * 2) + size;
      const y = Math.random() * (viewportHeight - size * 2) + size;
      const directionX = Math.random() * 0.5 - 0.25;
      const directionY = Math.random() * 0.5 - 0.25;
      const color = "rgba(191, 128, 255, 1)";
      particles.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  const resizeCanvas = () => {
    mouse.radius = 180;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (heroSection) {
      const rect = heroSection.getBoundingClientRect();
      viewportWidth = Math.max(1, Math.floor(rect.width));
      viewportHeight = Math.max(1, Math.floor(rect.height));
    } else {
      viewportWidth = window.innerWidth;
      viewportHeight = Math.max(window.innerHeight * 0.9, 680);
    }
    canvas.width = Math.floor(viewportWidth * dpr);
    canvas.height = Math.floor(viewportHeight * dpr);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
  };

  const connect = () => {
    for (let a = 0; a < particles.length; a += 1) {
      for (let b = a; b < particles.length; b += 1) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = dx * dx + dy * dy;

        if (distance < (viewportWidth / 7.5) * (viewportHeight / 7.5)) {
          const opacityValue = 1 - distance / 15000;
          ctx.strokeStyle = `rgba(200, 150, 255, ${opacityValue})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    ctx.fillStyle = "rgba(8, 5, 14, 0.14)";
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    for (let i = 0; i < particles.length; i += 1) {
      particles[i].update();
    }
    connect();
  };

  const handlePointerMove = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
  };

  const handleMouseMove = (event) => {
    handlePointerMove(event.clientX, event.clientY);
  };

  const handleTouchMove = (event) => {
    if (!event.touches || !event.touches[0]) return;
    handlePointerMove(event.touches[0].clientX, event.touches[0].clientY);
  };

  const handleMouseOut = () => {
    mouse.x = null;
    mouse.y = null;
  };

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
  window.addEventListener("mouseout", handleMouseOut);
  window.addEventListener("touchend", handleMouseOut, { passive: true });

  resizeCanvas();
  animate();

  window.addEventListener(
    "beforeunload",
    () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("touchend", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    },
    { once: true }
  );
}

initHeroParticles();

// ── Hero chess board animation ────────────────────────────────
(function initHeroChessBoard() {
  const canvas = document.getElementById('hero-chess-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const hero = canvas.closest('section') || canvas.parentElement;
    const w = hero ? hero.offsetWidth : window.innerWidth;
    const h = hero ? hero.offsetHeight : window.innerHeight;
    canvas.width  = w;
    canvas.height = h;
  }
  resize();
  window.addEventListener('resize', resize);

  const LIGHT = '#d4a96a';
  const DARK  = '#7c4f2a';

  const UNI = {
    K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',
    k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟',
  };

  const START = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R'],
  ];

  // Classic Ruy Lopez opening
  const MOVES = [
    [6,4, 4,4], // e4
    [1,4, 3,4], // e5
    [7,6, 5,5], // Nf3
    [0,1, 2,2], // Nc6
    [7,5, 4,2], // Bc4
    [0,5, 3,2], // Bc5
    [6,3, 5,3], // d3
    [1,3, 2,3], // d6
    [7,1, 5,2], // Nc3
    [0,6, 2,5], // Nf6
    [6,2, 5,2], // c3
    [1,0, 3,0], // a5
  ];

  let board = START.map(r => [...r]);
  let moveIdx = 0;
  let animStart = null;
  let pauseEnd  = 0;
  const ANIM_MS  = 900;
  const PAUSE_MS = 1600;

  function draw(fromSq, toSq, t) {
    const W = canvas.width;
    const H = canvas.height;
    const S = Math.min(W, H) * 0.9;
    const C = S / 8;
    const ox = (W - S) / 2;
    const oy = (H - S) / 2;
    ctx.clearRect(0, 0, W, H);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const x = ox + c * C;
        const y = oy + r * C;

        // Base square
        ctx.fillStyle = (r + c) % 2 === 0 ? LIGHT : DARK;
        ctx.fillRect(x, y, C, C);

        // From highlight (fades out)
        if (fromSq && fromSq[0]===r && fromSq[1]===c) {
          const a = t < 0.5 ? 0.7 : 0.7 * (1 - (t - 0.5) / 0.5);
          ctx.fillStyle = `rgba(255,140,43,${a})`;
          ctx.fillRect(x, y, C, C);
        }
        // To highlight (fades in after midpoint)
        if (toSq && toSq[0]===r && toSq[1]===c && t > 0.45) {
          const a = ((t - 0.45) / 0.55) * 0.65;
          ctx.fillStyle = `rgba(255,210,80,${a})`;
          ctx.fillRect(x, y, C, C);
        }

        // Piece
        const p = board[r][c];
        if (p && UNI[p]) {
          const isBlack = p === p.toLowerCase();
          ctx.font = `bold ${Math.round(C * 0.66)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isBlack ? '#1e0900' : '#fdf0dc';
          ctx.strokeStyle = isBlack ? 'rgba(255,200,100,0.25)' : 'rgba(0,0,0,0.25)';
          ctx.lineWidth = 0.8;
          ctx.strokeText(UNI[p], x + C/2, y + C/2 + 1);
          ctx.fillText(UNI[p], x + C/2, y + C/2 + 1);
        }
      }
    }

    // Border
    ctx.strokeStyle = 'rgba(255,140,43,0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox + 0.75, oy + 0.75, S - 1.5, S - 1.5);
  }

  function animate(ts) {
    requestAnimationFrame(animate);

    if (ts < pauseEnd) {
      draw(null, null, 0);
      return;
    }

    if (!animStart) animStart = ts;
    const t = Math.min((ts - animStart) / ANIM_MS, 1);
    const mv = MOVES[moveIdx];
    draw([mv[0], mv[1]], [mv[2], mv[3]], t);

    if (t >= 1) {
      board[mv[2]][mv[3]] = board[mv[0]][mv[1]];
      board[mv[0]][mv[1]] = '';
      moveIdx++;
      if (moveIdx >= MOVES.length) {
        moveIdx = 0;
        board = START.map(r => [...r]);
      }
      animStart = null;
      pauseEnd = ts + PAUSE_MS;
    }
  }

  requestAnimationFrame(animate);
})();

// ── Product gallery: autoplay + lightbox ──────────────────────
(function initProductGallery() {
  const mainImage = document.getElementById('product-main-image');
  const thumbButtons = Array.from(document.querySelectorAll('.product-thumb'));
  if (!mainImage || thumbButtons.length === 0) return;

  const images = thumbButtons.map(btn => ({
    src: btn.getAttribute('data-image') || btn.querySelector('img')?.src || '',
    alt: btn.getAttribute('data-alt') || btn.querySelector('img')?.alt || ''
  }));

  let autoTimer = null;
  let isAutoClick = false;

  function getActive() {
    const i = thumbButtons.findIndex(b => b.classList.contains('is-active'));
    return i >= 0 ? i : 0;
  }

  function triggerThumb(index) {
    const next = (index + thumbButtons.length) % thumbButtons.length;
    isAutoClick = true;
    thumbButtons[next].click();
    isAutoClick = false;
  }

  function startAuto() {
    clearInterval(autoTimer);
    if (thumbButtons.length < 2) return;
    autoTimer = setInterval(() => triggerThumb(getActive() + 1), 3000);
  }

  function stopAuto() { clearInterval(autoTimer); }

  thumbButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isAutoClick) return;
      stopAuto();
      clearTimeout(window._galResume);
      window._galResume = setTimeout(startAuto, 8000);
    });
  });

  // Lightbox
  const lb = document.createElement('div');
  lb.className = 'gallery-lightbox';
  lb.innerHTML = `
    <button class="gallery-lightbox-close" aria-label="Fechar">&times;</button>
    <button class="gallery-lightbox-arrow gallery-lightbox-prev" aria-label="Anterior">&#8249;</button>
    <img class="gallery-lightbox-img" src="" alt="">
    <button class="gallery-lightbox-arrow gallery-lightbox-next" aria-label="Próxima">&#8250;</button>
  `;
  document.body.appendChild(lb);

  const lbImg  = lb.querySelector('.gallery-lightbox-img');
  const lbPrev = lb.querySelector('.gallery-lightbox-prev');
  const lbNext = lb.querySelector('.gallery-lightbox-next');
  let lbIdx = 0;

  if (images.length < 2) {
    lbPrev.style.display = 'none';
    lbNext.style.display = 'none';
  }

  function lbShow(i) {
    lbIdx = (i + images.length) % images.length;
    lbImg.src = images[lbIdx].src;
    lbImg.alt = images[lbIdx].alt;
    triggerThumb(lbIdx);
  }

  function open() {
    lbShow(getActive());
    lb.classList.add('is-open');
    stopAuto();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    startAuto();
  }

  mainImage.addEventListener('click', open);
  lb.querySelector('.gallery-lightbox-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lbPrev.addEventListener('click', () => lbShow(lbIdx - 1));
  lbNext.addEventListener('click', () => lbShow(lbIdx + 1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
    if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
  });

  startAuto();
})();

document.querySelectorAll(".wpp-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (typeof gtag === "function") {
      gtag("event", "conversion", {
        send_to: "AW-16631769005",
        event_category: "whatsapp",
        event_label: "clique_botao_wpp",
      });
    }
  });
});
