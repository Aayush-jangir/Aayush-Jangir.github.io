document.documentElement.classList.add('js');
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav background after scrolling, mobile menu
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('solid', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menu = document.querySelector('.menu'), links = document.querySelector('.nav-links');
  if (menu && links) {
    menu.addEventListener('click', () => { const o = links.classList.toggle('open'); menu.setAttribute('aria-expanded', o); });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
  }

  // reveal on scroll
  const rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -40px 0px' });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('in'));

  // looping videos: play only while visible, never with reduced motion
  const vids = document.querySelectorAll('video[data-loop]');
  const start = () => {
  if (!reduce && 'IntersectionObserver' in window) {
    const vo = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } const p = v.play(); if (p) p.catch(() => {}); }
      else v.pause();
    }), { threshold: .2 });
    vids.forEach(v => vo.observe(v));
  }
  };
  // let the page finish loading first, so video never competes with the first paint
  // heavy video waits for the first sign of a real visitor (or 4 s), so it never slows the first view
  let started = false;
  const go = () => { if (started) return; started = true; ['scroll','pointermove','touchstart','keydown'].forEach(ev => window.removeEventListener(ev, go)); start(); };
  ['scroll','pointermove','touchstart','keydown'].forEach(ev => window.addEventListener(ev, go, { passive: true, once: true }));
  window.addEventListener('load', () => setTimeout(go, 4000));

  // posters for videos further down load only as they come near
  const lazyPosters = document.querySelectorAll('video[data-poster]');
  if ('IntersectionObserver' in window) {
    const po = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.poster = e.target.dataset.poster; po.unobserve(e.target); } }), { rootMargin: '600px 0px' });
    lazyPosters.forEach(v => po.observe(v));
  } else lazyPosters.forEach(v => v.poster = v.dataset.poster);

  // modal for the reel and images
  const modal = document.createElement('div');
  modal.className = 'modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = '<button class="modal-x" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="modal-in"></div>';
  document.body.appendChild(modal);
  const inner = modal.querySelector('.modal-in');
  let last = null;
  const close = () => { modal.classList.remove('on'); inner.innerHTML = ''; document.body.style.overflow = ''; if (last) last.focus(); };
  const open = html => { last = document.activeElement; inner.innerHTML = html; modal.classList.add('on'); document.body.style.overflow = 'hidden'; modal.querySelector('.modal-x').focus(); };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal-x')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('on')) close(); });
  document.querySelectorAll('[data-reel]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    open('<video src="' + el.getAttribute('data-reel') + '" controls autoplay playsinline muted></video>');
  }));
  document.querySelectorAll('[data-zoom]').forEach(el => el.addEventListener('click', () => open('<img src="' + el.getAttribute('src') + '" alt="">')));
})();
