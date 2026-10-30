/* Native scrolling remains in control. Only the decorative landscape interpolates. */
(() => {
  'use strict';
  const config = window.PORTFOLIO_TOUR || { chapters: [] };
  const root = document.documentElement;
  const video = document.getElementById('landscape-video');
  const button = document.getElementById('motion-toggle');
  const label = document.getElementById('chapter-label');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chapters = config.chapters.map(chapter => ({ ...chapter, element: document.getElementById(chapter.id), offset: 0 })).filter(chapter => chapter.element);
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  let paused = preference.matches;
  let progress = 0;
  let displayed = 0;
  let maxScroll = 1;
  let frame = 0;
  let lastTime = 0;
  let activeChapter = -1;
  let videoFailed = false;

  const clamp = value => Math.max(0, Math.min(1, value));
  const motionAllowed = () => !paused && !preference.matches;

  function measure() {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    chapters.forEach(chapter => { chapter.offset = chapter.element.getBoundingClientRect().top + window.scrollY; });
    onScroll();
  }

  function updateChapter() {
    const position = window.scrollY + window.innerHeight * 0.4;
    let next = 0;
    chapters.forEach((chapter, index) => { if (chapter.offset <= position) next = index; });
    if (next === activeChapter || !chapters.length) return;
    activeChapter = next;
    label.textContent = String(next + 1).padStart(2, '0') + ' / ' + chapters[next].label.toUpperCase();
    navLinks.forEach(link => {
      if (link.hash === '#' + chapters[next].id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function syncVideo() {
    if (!motionAllowed() || videoFailed || video.readyState < 2 || video.seeking || !Number.isFinite(video.duration) || video.duration <= 0) return;
    // Stay one frame away from the end to avoid an ended-state flash.
    const target = displayed * Math.max(0, video.duration - 1 / 30);
    if (Math.abs(video.currentTime - target) > 1 / 60) {
      try { video.currentTime = target; } catch (_) { /* Poster remains available. */ }
    }
  }

  function render(time) {
    frame = 0;
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
    lastTime = time;
    if (motionAllowed()) {
      displayed += (progress - displayed) * (1 - Math.exp(-elapsed / 150));
      if (Math.abs(progress - displayed) < 0.0002) displayed = progress;
      root.style.setProperty('--travel', (-displayed * 24).toFixed(2) + 'px');
      root.style.setProperty('--zoom', (1.04 + displayed * 0.055).toFixed(4));
      syncVideo();
    }
    updateChapter();
    if (motionAllowed() && displayed !== progress) requestFrame();
    else lastTime = 0;
  }

  function requestFrame() {
    if (!frame && !document.hidden) frame = window.requestAnimationFrame(render);
  }

  function onScroll() {
    progress = clamp(window.scrollY / maxScroll);
    root.style.setProperty('--progress', progress.toFixed(5));
    requestFrame();
  }

  function updateMotionControl() {
    button.textContent = preference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
    button.disabled = preference.matches;
    button.setAttribute('aria-pressed', String(paused));
    document.body.classList.toggle('motion-paused', !motionAllowed());
    if (!motionAllowed()) {
      video.pause();
      document.body.classList.remove('video-ready');
      root.style.setProperty('--travel', '0px');
      root.style.setProperty('--zoom', '1.04');
    } else {
      if (video.readyState >= 2 && !videoFailed) document.body.classList.add('video-ready');
      if (config.videoSrc && !video.getAttribute('src')) video.src = config.videoSrc;
    }
    requestFrame();
  }

  // Fail open: text, navigation and poster never depend on video decoding.
  video.addEventListener('loadeddata', () => {
    if (motionAllowed()) document.body.classList.add('video-ready');
    requestFrame();
  });
  video.addEventListener('seeked', syncVideo);
  video.addEventListener('error', () => {
    videoFailed = true;
    document.body.classList.remove('video-ready');
  });
  button.hidden = false;
  button.addEventListener('click', () => {
    paused = !paused;
    updateMotionControl();
  });
  preference.addEventListener('change', () => { paused = preference.matches; updateMotionControl(); });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    else if (!document.hidden) onScroll();
  });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.querySelector('main'));
  measure();
  displayed = progress;
  updateMotionControl();
})();
