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
      const color = "rgba(170, 50, 215, 1)";
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
          ctx.strokeStyle = `rgba(170, 50, 215, ${opacityValue})`;
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

function equalizeTestimonialHeights() {
  const inner = document.querySelector('.testimonials-carousel .carousel-inner');
  const items = Array.from(document.querySelectorAll('.testimonials-carousel .carousel-item'));
  if (!inner || items.length === 0) return;

  inner.style.height = '';
  items.forEach(item => { item.style.height = ''; });

  items.forEach(item => {
    item.style.cssText += ';display:block!important;visibility:hidden!important;position:absolute!important;';
  });

  let maxH = 0;
  items.forEach(item => { if (item.offsetHeight > maxH) maxH = item.offsetHeight; });

  items.forEach(item => {
    item.style.cssText = item.style.cssText
      .replace(/display:[^;]+!important;/, '')
      .replace(/visibility:[^;]+!important;/, '')
      .replace(/position:[^;]+!important;/, '');
    item.style.height = maxH + 'px';
  });
  inner.style.height = maxH + 'px';
}

equalizeTestimonialHeights();
window.addEventListener('resize', equalizeTestimonialHeights);

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
