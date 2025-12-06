/* ============================================================
   ROMINA BAKERY — MAIN.JS
   - Menú hamburguesa accesible
   - Cierre automático del menú
   - Formspree universal
   - Hero con rotador, preload y fade-in
============================================================ */

(function () {
  'use strict';

  /* ===============================
     MENÚ HAMBURGUESA ACCESIBLE
  =============================== */
  const toggle = document.getElementById('nav-toggle');
  const hamburgerLabel = document.querySelector('label.hamburger[for="nav-toggle"]');
  const navLinks = document.querySelectorAll('.main-nav a');

  function setMenuAria(isOpen) {
    if (hamburgerLabel)
      hamburgerLabel.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (isOpen) document.body.setAttribute('data-open', 'true');
    else document.body.removeAttribute('data-open');
  }

  if (toggle && hamburgerLabel) {
    setMenuAria(toggle.checked);

    toggle.addEventListener('change', () => {
      setMenuAria(toggle.checked);
      if (toggle.checked) {
        const firstLink = document.querySelector('.main-nav a');
        if (firstLink) firstLink.focus();
      } else {
        hamburgerLabel.focus();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (toggle.checked) {
          toggle.checked = false;
          setMenuAria(false);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && toggle.checked) {
        toggle.checked = false;
        setMenuAria(false);
        hamburgerLabel.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!toggle.checked) return;
      const inside = e.target.closest('.main-nav') || e.target.closest('label.hamburger') || e.target.closest('#nav-toggle');
      if (!inside) {
        toggle.checked = false;
        setMenuAria(false);
        hamburgerLabel.focus();
      }
    });
  }

  /* ===============================
     FORMSPREE — FORMULARIOS
  =============================== */

  const FORMSPREE_DEFAULT = "https://formspree.io/f/YOUR_FORMSPREE_ID";

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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = form.querySelector("button[type='submit'], input[type='submit']");
      const originalText = btn?.tagName === "INPUT" ? btn.value : btn?.textContent;

      if (btn) {
        btn.disabled = true;
        if (btn.tagName === "INPUT") btn.value = "Enviando...";
        else btn.textContent = "Enviando...";
      }

      const data = new FormData(form);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" }
        });

        if (res.ok) {
          alert("¡Tu mensaje fue enviado con éxito!");
          form.reset();
        } else {
          alert("Hubo un problema enviando el mensaje, intenta de nuevo.");
        }
      } catch (err) {
        alert("Error de conexión, por favor intenta otra vez.");
      }

      if (btn) {
        btn.disabled = false;
        if (btn.tagName === "INPUT") btn.value = originalText;
        else btn.textContent = originalText;
      }
    });
  }

  findForms().forEach(attachForm);

  /* ===============================
     HERO — ROTADOR + FADE-IN
  =============================== */

  document.addEventListener("DOMContentLoaded", () => {
    const heroBg = document.querySelector(".hero-bg");
    const heroContent = document.querySelector(".hero-content");
    const heroSection = document.querySelector(".hero");

    if (!heroBg || !heroContent || !heroSection) return;

    const images = {
      home: "assets/img/pastel-portada.jpg",
      productos: "assets/img/pastel-tres.jpg",
      blog: "assets/img/pastel-dos.jpg",
      sobre: "assets/img/pastel-portada.jpg",
      contacto: "assets/img/pastel-uno.jpg"
    };

    const keys = Object.keys(images);
    let index = 0;
    const DELAY = 6000;
    let timer = null;

    function setHeroImage(url) {
      heroBg.style.backgroundImage = `url('${url}')`;
      requestAnimationFrame(() => heroBg.classList.add("is-visible"));
    }

    function preload(url) {
      const img = new Image();
      img.src = url;
    }

    Object.values(images).forEach(preload);

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

    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-cat]");
      if (!el) return;

      const cat = el.dataset.cat;
      if (images[cat]) {
        setHeroImage(images[cat]);
        index = keys.indexOf(cat);
        stop();
        setTimeout(start, 9000);
      }
    });

    ["mouseenter", "touchstart"].forEach(evt => heroBg.addEventListener(evt, stop));
    ["mouseleave", "touchend"].forEach(evt => heroBg.addEventListener(evt, start));

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroContent.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    obs.observe(heroSection);
  });

})();
