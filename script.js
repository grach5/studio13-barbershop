(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var header = document.querySelector('.site-header');
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && header && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    mainNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Открыть меню');
      }
    });
  }

  /* ---------- Booking form -> WhatsApp ---------- */
  var WHATSAPP_NUMBER = '79152335020';
  var form = document.getElementById('bookingForm');
  var status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.value;
      var time = form.time.value.trim();
      var comment = form.comment.value.trim();

      if (!name || !phone || !service) {
        status.textContent = 'Пожалуйста, заполните имя, телефон и выберите услугу.';
        return;
      }

      var lines = [
        'Здравствуйте! Хочу записаться в Студию 13.',
        'Имя: ' + name,
        'Телефон: ' + phone,
        'Услуга: ' + service
      ];
      if (time) lines.push('Желаемое время: ' + time);
      if (comment) lines.push('Комментарий: ' + comment);

      var text = encodeURIComponent(lines.join('\n'));
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;

      status.textContent = 'Заявка сформирована — открываем WhatsApp...';
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  /* ---------- Scroll reveal (progressive enhancement) ---------- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll(
      '.service-card, .gallery-tile, .trust-panel, .booking-form, .section-head, .contact-list, .map-card, .payment-panel'
    );
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Service cards: 3D pointer tilt ---------- */
  if (!prefersReduced) {
    var TILT_MAX = 7; // degrees, matches the ±6-8° premium/subtle spec
    var ICON_LIFT = (getComputedStyle(document.documentElement).getPropertyValue('--tilt-icon-lift') || '20px').trim();

    document.querySelectorAll('.service-card').forEach(function (card) {
      var frame = null;

      function onMove(e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;  // 0..1
        var py = (e.clientY - rect.top) / rect.height;  // 0..1

        var rotateY = (px - 0.5) * TILT_MAX * 2;   // left/right tilt
        var rotateX = (0.5 - py) * TILT_MAX * 2;   // up/down tilt

        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          card.style.setProperty('--iconz', ICON_LIFT);
          card.style.transform =
            'perspective(900px) translateY(-4px) ' +
            'rotateX(' + rotateX.toFixed(2) + 'deg) ' +
            'rotateY(' + rotateY.toFixed(2) + 'deg)';
          // Metallic shadow/rim that leans away from the light (opposite the tilt)
          var shadowX = (-rotateY * 2.2).toFixed(1);
          var shadowY = (10 + rotateX * -2.2).toFixed(1);
          card.style.boxShadow =
            shadowX + 'px ' + shadowY + 'px 34px -14px var(--c-tilt-shadow), ' +
            (rotateY * -1).toFixed(1) + 'px ' + (rotateX * 1).toFixed(1) + 'px 0 0 var(--c-tilt-rim)';
        });

        card.classList.add('is-tilting');
      }

      function onLeave() {
        if (frame) cancelAnimationFrame(frame);
        card.classList.remove('is-tilting');
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.removeProperty('--iconz');
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      }

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('blur', onLeave);
    });
  }

  /* ---------- Hero parallax on scroll (different speeds per layer) ---------- */
  if (!prefersReduced) {
    var heroSection = document.getElementById('hero');
    var heroBlade = document.querySelector('.hero-blade');
    var heroTexture = document.querySelector('.hero-texture');

    if (heroSection && (heroBlade || heroTexture)) {
      var rootStyle = getComputedStyle(document.documentElement);
      var BLADE_SPEED = parseFloat(rootStyle.getPropertyValue('--parallax-blade-speed')) || 0.18;
      var TEXTURE_SPEED = parseFloat(rootStyle.getPropertyValue('--parallax-texture-speed')) || 0.06;
      var ticking = false;

      function updateParallax() {
        ticking = false;
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;
        // Only bother transforming while the hero is anywhere near the viewport
        var heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        if (scrollY > heroBottom + 200) return;

        if (heroBlade) {
          heroBlade.style.transform = 'translate3d(0, ' + (scrollY * BLADE_SPEED).toFixed(1) + 'px, 0)';
        }
        if (heroTexture) {
          heroTexture.style.transform = 'translate3d(0, ' + (scrollY * TEXTURE_SPEED).toFixed(1) + 'px, 0)';
        }
      }

      function onScroll() {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      updateParallax();
    }
  }
})();
