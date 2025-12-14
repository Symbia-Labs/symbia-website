(function() {
  const rotationInterval = 10000;
  const container = document.querySelector('.hero-rotation');
  if (!container) return;
  const slides = Array.from(container.querySelectorAll('.hero-slide'));
  const dots = Array.from(container.querySelectorAll('.hero-dot'));
  if (slides.length === 0) return;

  container.classList.remove('no-js');

  let index = 0;
  let timer = null;
  let paused = false;

  function setActive(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
      dot.setAttribute('tabindex', active ? '0' : '-1');
    });
  }

  function startTimer() {
    clearTimer();
    timer = setInterval(() => {
      if (!paused) setActive(index + 1);
    }, rotationInterval);
  }

  function clearTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      setActive(i);
      startTimer();
    });
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(i);
        startTimer();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActive(index + 1);
        startTimer();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActive(index - 1);
        startTimer();
      }
    });
  });

  container.addEventListener('mouseenter', () => { paused = true; });
  container.addEventListener('mouseleave', () => { paused = false; });

  setActive(0);
  startTimer();
})();
