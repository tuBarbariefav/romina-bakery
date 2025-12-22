/* ============================================================
   ROMINA BAKERY — MAIN.JS
   - Formspree universal
   - Hero con rotador + fade-in
   - Slider del blog
============================================================ */

(function () {
  'use strict';

  /* ===============================
     FORMSPREE — FORMULARIOS
  =============================== */

  const FORMSPREE_DEFAULT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';

  function findForms() {
    const direct = [...document.querySelectorAll('form[data-formspree="true"]')];
    const withAction = [...document.querySelectorAll('form[action*="formspree.io"]')];
    const byAria = [...document.querySelectorAll('form[aria-label]')].filter(f =>
      /contact|contacto|formulario|mensaje/i.test(f.getAttribute('aria-label'))
    );
    return [...new Set([...direct, ...withAction, ...byAria])];
  }

  function attachForm(form) {
    if (!form || form.__attached) return;
    form.__attached = true;

    const endpoint = form.dataset.endpoint || form.action || FORMSPREE_DEFAULT;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector("button[type='submit'], input[type='submit']");
      const originalText = btn
        ? (btn.tagName === 'INPUT' ? btn.value : btn.textContent)
        : null;

      if (btn) {
        btn.disabled = true;
        btn.tagName === 'INPUT'
          ? (btn.value = 'Enviando...')
          : (btn.textContent = 'Enviando...');
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          alert('¡Tu mensaje fue enviado con éxito!');
          form.reset();
        } else {
          alert('Hubo un problema enviando el mensaje.');
        }
      } catch {
        alert('Error de conexión. Intentá nuevamente.');
      }

      if (btn) {
        btn.disabled = false;
        btn.tagName === 'INPUT'
          ? (btn.value = originalText)
          : (btn.textContent = originalText);
      }
    });
  }

  findForms().forEach(attachForm);

  /* ===============================
     HERO — ROTADOR + FADE-IN
  =============================== */

  document.addEventListener('DOMContentLoaded', () => {
    const heroBg = document.querySelector('.hero-bg');
    const heroContent = document.querySelector('.hero-content');
    const heroSection = document.querySelector('.hero');

    if (!heroBg || !heroContent || !heroSection) return;

    const images = {
      home: 'assets/img/pastel-portada.jpg',
      productos: 'assets/img/pastel-tres.jpg',
      blog: 'assets/img/pastel-dos.jpg',
      sobre: 'assets/img/pastel-portada.jpg',
      contacto: 'assets/img/pastel-uno.jpg'
    };

    const keys = Object.keys(images);
    let index = 0;
    let timer = null;
    const DELAY = 6000;

    function setHeroImage(url) {
      heroBg.style.backgroundImage = `url('${url}')`;
      requestAnimationFrame(() => heroBg.classList.add('is-visible'));
    }

    // Preload
    Object.values(images).forEach(src => {
      const img = new Image();
      img.src = src;
    });

    setHeroImage(images.home);

    function start() {
      stop();
      timer = setInterval(() => {
        index = (index + 1) % keys.length;
        setHeroImage(images[keys[index]]);
      }, DELAY);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    start();

    // Fade-in del contenido
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroContent.classList.add('in-view');
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });

    obs.observe(heroSection);
  });

  /* ===============================
     BLOG SLIDER — ESTABLE
  =============================== */

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('blog-slider');
    if (!root) return;

    const track = root.querySelector('.slider-track');
    const viewport = root.querySelector('.slider-viewport');
    const slides = Array.from(track.children);
    const prevBtn = root.querySelector('.slider-btn.prev');
    const nextBtn = root.querySelector('.slider-btn.next');
    const dotsWrap = root.querySelector('.slider-dots');

    if (!track || !viewport || !prevBtn || !nextBtn || !dotsWrap || slides.length === 0) return;

    function getSlidesPerView() {
      const w = window.innerWidth;
      if (w >= 992) return 3;
      if (w >= 768) return 2;
      return 1;
    }

    let spv = getSlidesPerView();
    let currentIndex = 0;
    let autoplayTimer = null;
    const AUTOPLAY = 4500;

    function buildDots() {
      dotsWrap.innerHTML = '';
      const pages = Math.ceil(slides.length / spv);
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        dot.addEventListener('click', () => moveTo(i * spv));
        dotsWrap.appendChild(dot);
      }
      updateDots();
    }

    function updateDots() {
      const active = Math.floor(currentIndex / spv);
      dotsWrap.querySelectorAll('.slider-dot')
        .forEach((d, i) => d.classList.toggle('active', i === active));
    }

    function recalc() {
      spv = getSlidesPerView();
      const gap = parseFloat(getComputedStyle(track).gap) || 20;
      const width = viewport.clientWidth;
      const slideW = Math.floor((width - gap * (spv - 1)) / spv);

      slides.forEach(sl => (sl.style.flex = `0 0 ${slideW}px`));
      moveTo(currentIndex);
      buildDots();
    }

    function moveTo(index) {
      currentIndex = Math.max(0, Math.min(index, slides.length - spv));
      const slideW = slides[0].getBoundingClientRect().width +
        (parseFloat(getComputedStyle(track).gap) || 20);
      track.style.transform = `translateX(${-slideW * currentIndex}px)`;
      updateDots();
    }

    function start() {
      stop();
      autoplayTimer = setInterval(() => {
        moveTo(currentIndex + spv >= slides.length ? 0 : currentIndex + spv);
      }, AUTOPLAY);
    }

    function stop() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    prevBtn.addEventListener('click', () => moveTo(currentIndex - spv));
    nextBtn.addEventListener('click', () => moveTo(currentIndex + spv));
    window.addEventListener('resize', recalc);

    recalc();
    start();
  });

})();
