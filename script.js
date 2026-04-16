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
