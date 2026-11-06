document.documentElement.classList.add('js');

const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const toTop = document.getElementById('toTop');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  toTop.classList.toggle('show', y > 700);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('no-scroll', open);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('in');
        revealObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const counterEl = document.querySelector('.counter');
if (counterEl) {
  const target = parseInt(counterEl.dataset.count, 10) || 500;
  const duration = 2000;
  const animateCount = () => {
    if (prefersReducedMotion) {
      counterEl.textContent = target;
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counterEl.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount();
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counterObserver.observe(counterEl);
}

const sectionIds = ['home', 'about', 'how-it-works', 'benefits', 'partnership', 'contact'];
const navAnchors = new Map();
document.querySelectorAll('.nav-links a:not(.btn)').forEach((a) => {
  const id = a.getAttribute('href').slice(1);
  if (sectionIds.includes(id)) navAnchors.set(id, a);
});
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && navAnchors.has(entry.target.id)) {
        navAnchors.forEach((a) => a.classList.remove('active'));
        navAnchors.get(entry.target.id).classList.add('active');
      }
    });
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
sectionIds.forEach((id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

document.querySelectorAll('[data-glow]').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - rect.left + 'px');
    card.style.setProperty('--my', e.clientY - rect.top + 'px');
  });
});

const canvas = document.getElementById('particles');
if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;
  const resize = () => {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
  };
  const createParticles = () => {
    const count = Math.min(90, Math.floor(canvas.width / 22));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (Math.random() * 2.2 + 0.6) * devicePixelRatio,
      speed: (Math.random() * 0.5 + 0.18) * devicePixelRatio,
      sway: Math.random() * 0.6 - 0.3,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.55 + 0.15,
      orange: Math.random() < 0.14
    }));
  };
  const draw = (t) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += Math.sin(t / 1400 + p.phase) * p.sway * devicePixelRatio * 0.4;
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.orange
        ? 'rgba(255,138,0,' + p.alpha + ')'
        : 'rgba(92,255,46,' + p.alpha + ')';
      ctx.shadowColor = p.orange ? 'rgba(255,138,0,.8)' : 'rgba(92,255,46,.8)';
      ctx.shadowBlur = 8 * devicePixelRatio;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  };
  resize();
  createParticles();
  raf = requestAnimationFrame(draw);
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    createParticles();
    raf = requestAnimationFrame(draw);
  });
}

document.getElementById('year').textContent = new Date().getFullYear();

const partnerModal = document.getElementById('partnerModal');
if (partnerModal) {
  const modalClose = document.getElementById('modalClose');
  const openModal = () => {
    partnerModal.classList.add('open');
    document.body.classList.add('no-scroll');
    modalClose.focus();
  };
  const closeModal = () => {
    partnerModal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };
  document.querySelectorAll('[data-partner-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });
  modalClose.addEventListener('click', closeModal);
  partnerModal.addEventListener('click', (e) => {
    if (e.target === partnerModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && partnerModal.classList.contains('open')) closeModal();
  });
}
