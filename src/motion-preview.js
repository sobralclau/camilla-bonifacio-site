(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('motion-preview');

  const note = document.createElement('div');
  note.className = 'motion-preview-note';
  note.textContent = 'Prévia motion editorial';
  document.body.appendChild(note);

  if (reduce) return;

  const ease = 'cubic-bezier(.22,.61,.36,1)';
  const hero = document.querySelector('.hero--editorial');
  const media = document.querySelector('.hero-editorial-media img');
  const lines = [...document.querySelectorAll('.hero-editorial-copy h1 span')];
  const heroAction = document.querySelector('.hero-actions');

  if (media) {
    media.animate(
      [
        { opacity: 0, transform: 'scale(1.025)' },
        { opacity: 1, transform: 'scale(1)' }
      ],
      { duration: 1100, easing: ease, fill: 'both' }
    );
  }

  lines.forEach((line, index) => {
    line.animate(
      [
        { opacity: 0, transform: 'translate3d(0,28px,0)' },
        { opacity: 1, transform: 'translate3d(0,0,0)' }
      ],
      {
        duration: 760,
        delay: 180 + index * 92,
        easing: ease,
        fill: 'both'
      }
    );
  });

  if (heroAction) {
    heroAction.animate(
      [
        { opacity: 0, transform: 'translate3d(0,16px,0)' },
        { opacity: 1, transform: 'translate3d(0,0,0)' }
      ],
      { duration: 680, delay: 680, easing: ease, fill: 'both' }
    );
  }

  const revealGroups = [
    ['.about-portrait', 'motion-reveal motion-reveal--left motion-mask', 0],
    ['.about .section-copy', 'motion-reveal motion-reveal--right', 90],
    ['.section-heading', 'motion-reveal', 0],
    ['.service', 'motion-reveal', 0],
    ['.work-heading', 'motion-reveal', 0],
    ['.work-card', 'motion-reveal', 0],
    ['.work-card-media', 'motion-mask', 0],
    ['.knowledge-heading', 'motion-reveal', 0],
    ['.knowledge-cluster', 'motion-reveal', 0],
    ['.difference-grid', 'motion-reveal', 0],
    ['.contact-inner', 'motion-reveal', 0]
  ];

  const observed = [];
  revealGroups.forEach(([selector, classes, baseDelay]) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      classes.split(' ').forEach(c => el.classList.add(c));
      el.style.setProperty('--motion-delay', `${baseDelay + Math.min(index, 4) * 70}ms`);
      observed.push(el);
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -8% 0px' });

  observed.forEach(el => io.observe(el));

  if (hero && media && window.matchMedia('(min-width: 821px)').matches) {
    let ticking = false;
    const updateParallax = () => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      media.style.transform = `translate3d(0,${progress * 28}px,0) scale(1.018)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });
  }
})();