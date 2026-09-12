/* shared.js — Logo Design Module */

const SECTIONS = [
  { id: 'intro',       label: 'What is Logo Design?',  file: 'part1-intro.html'      },
  { id: 'sketching',   label: 'Sketching Techniques',  file: 'part2-sketching.html'  },
  { id: 'digitizing',  label: 'Digitizing Your Sketch',file: 'part3-digitizing.html' },
  { id: 'scalability', label: 'Scalability & Formats', file: 'part4-scalability.html'},
  { id: 'summary',     label: 'Activity & Summary',    file: 'part5-summary.html'    },
];

function buildRail(activeId) {
  /* store activeId for buildMobileNav */
  document.body.dataset.activeSection = activeId;

  const partsEl = document.getElementById('snavParts');
  if (!partsEl) return;
  SECTIONS.forEach((sec, i) => {
    const a = document.createElement('a');
    a.className = 'snav-part' + (sec.id === activeId ? ' active' : '');
    a.href = sec.file;
    a.innerHTML = `<span class="dot"></span>${String(i + 1).padStart(2,'0')} ${sec.label}`;
    partsEl.appendChild(a);
  });
}

/* ── Background pen-path animation ── */
function buildBgAnimation() {
  const deck = document.querySelector('.deck');
  const canvas = document.createElement('canvas');
  canvas.id = 'bgCanvas';
  deck.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, pts, t;

  function randPts() {
    const count = 2 + Math.round(Math.random()); /* 2 or 3 points */
    return Array.from({ length: count }, (_, i) => ({
      x:  (i / (count - 1)) * W * 0.85 + W * 0.075,
      y:  H * (0.25 + Math.random() * 0.5),
      cx: (i / (count - 1)) * W * 0.85 + W * 0.075 + (Math.random() - 0.5) * W * 0.35,
      cy: H * (0.1 + Math.random() * 0.8),
    }));
  }

  function init() {
    W = canvas.width  = deck.offsetWidth;
    H = canvas.height = deck.offsetHeight;
    pts = randPts();
    t = 0;
  }

  function sample(progress) {
    const segs = pts.length - 1;
    const s    = Math.min(Math.floor(progress * segs), segs - 1);
    const u    = progress * segs - s;
    const a = pts[s], b = pts[s + 1], iu = 1 - u;
    return {
      x: iu*iu*iu*a.x + 3*iu*iu*u*a.cx + 3*iu*u*u*b.cx + u*u*u*b.x,
      y: iu*iu*iu*a.y + 3*iu*iu*u*a.cy + 3*iu*u*u*b.cy + u*u*u*b.y,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const ORANGE = '#FF5A1F', TEAL = '#1B4B4A';

    /* ghost full path */
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++)
      ctx.bezierCurveTo(pts[i].cx, pts[i].cy, pts[i+1].cx, pts[i+1].cy, pts[i+1].x, pts[i+1].y);
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* drawn portion */
    ctx.beginPath();
    const p0 = sample(0);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i <= 100; i++) {
      const prog = (i / 100) * t;
      if (prog > t) break;
      const p = sample(prog);
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 3;
    ctx.stroke();

    /* anchor points + handles */
    const segs = pts.length - 1;
    pts.forEach((pt, i) => {
      const thresh = i / segs;
      if (t < thresh) return;
      const alpha = Math.min(1, (t - thresh) / 0.05);
      /* handle line */
      ctx.globalAlpha = alpha * 0.6;
      ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pt.cx, pt.cy);
      ctx.strokeStyle = ORANGE; ctx.lineWidth = 1.5; ctx.stroke();
      /* handle circle */
      ctx.beginPath(); ctx.arc(pt.cx, pt.cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = ORANGE; ctx.fill();
      /* anchor square */
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = i === 0 ? TEAL : ORANGE;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(pt.x - 6, pt.y - 6, 12, 12);
      /* filled center */
      ctx.fillStyle = i === 0 ? TEAL : '#fff';
      ctx.globalAlpha = alpha * 0.9;
      ctx.fillRect(pt.x - 4, pt.y - 4, 8, 8);
      ctx.globalAlpha = 1;
    });

    /* moving cursor dot */
    const cur = sample(Math.min(t, 1));
    ctx.beginPath(); ctx.arc(cur.x, cur.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = ORANGE; ctx.globalAlpha = 0.9; ctx.fill();
    ctx.beginPath(); ctx.arc(cur.x, cur.y, 11, 0, Math.PI * 2);
    ctx.strokeStyle = ORANGE; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.3; ctx.stroke();
    ctx.globalAlpha = 1;

    t += 0.0018;
    if (t > 1.08) { t = 0; pts = randPts(); }
    requestAnimationFrame(draw);
  }

  init();
  window.addEventListener('resize', init);
  draw();
}

/* ── Slide deck engine ── */
function buildSlides() {
  /* On mobile (≤ 700px) all slides are visible and the page scrolls —
     skip the deck engine entirely. */
  if (window.innerWidth <= 700) return;

  const deck    = document.querySelector('.deck');
  const slides  = Array.from(deck.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('snavPrev');
  const nextBtn = document.getElementById('snavNext');
  const dotsEl  = document.getElementById('snavDots');
  const labelEl = document.getElementById('snavLabel');
  const nextPart = document.body.dataset.next || null;
  const prevPart = document.body.dataset.prev || null;

  if (!slides.length) return;

  let current = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'sdot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  function updateButtons() {
    prevBtn.disabled = current === 0 && !prevPart;
    nextBtn.disabled = current === slides.length - 1 && !nextPart;
  }

  function goTo(idx) {
    if (idx < 0 || idx >= slides.length || idx === current) return;
    const prev = current;
    slides[prev].classList.remove('active');
    slides[prev].classList.add('exit-left');
    setTimeout(() => slides[prev].classList.remove('exit-left'), 350);
    current = idx;
    slides[current].classList.add('active');
    dotsEl.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (labelEl) labelEl.textContent = slides[current].dataset.section || `${current + 1} / ${slides.length}`;
    updateButtons();
  }

  slides[0].classList.add('active');
  if (labelEl) labelEl.textContent = slides[0].dataset.section || `1 / ${slides.length}`;
  updateButtons();

  prevBtn.addEventListener('click', () => {
    if (current === 0 && prevPart) { location.href = prevPart + '?slide=last'; return; }
    goTo(current - 1);
  });
  nextBtn.addEventListener('click', () => {
    if (current === slides.length - 1 && nextPart) { location.href = nextPart; return; }
    goTo(current + 1);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (current === slides.length - 1 && nextPart) location.href = nextPart;
      else goTo(current + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (current === 0 && prevPart) location.href = prevPart + '?slide=last';
      else goTo(current - 1);
    }
  });

  const slideParam = new URLSearchParams(location.search).get('slide');
  if (slideParam === 'last') goTo(slides.length - 1);
  else if (slideParam !== null && !isNaN(slideParam)) goTo(parseInt(slideParam));
}

/* ── Mobile sticky bottom nav — slide-to-slide, then part-to-part ── */
function buildMobileNav() {
  if (window.innerWidth > 700) return;

  const prevPart = document.body.dataset.prev || null;
  const nextPart = document.body.dataset.next || null;
  const activeId = document.body.dataset.activeSection || '';
  const activeSection = SECTIONS.find(s => s.id === activeId);
  const partIdx = activeSection ? SECTIONS.indexOf(activeSection) : -1;

  const slides = Array.from(document.querySelectorAll('.slide'));
  let current = 0;

  const nav = document.createElement('nav');
  nav.className = 'mobile-nav';
  nav.setAttribute('aria-label', 'Slide navigation');

  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = '&#8592; Prev';
  prevBtn.className = 'mnav-btn';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'mnav-label';

  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = 'Next &#8594;';
  nextBtn.className = 'mnav-btn';

  function updateNav() {
    const isFirst = current === 0;
    const isLast  = current === slides.length - 1;
    prevBtn.disabled = isFirst && !prevPart;
    nextBtn.disabled = isLast  && !nextPart;
    labelSpan.textContent = `${current + 1} / ${slides.length}`;
  }

  function goTo(idx) {
    if (idx < 0 || idx >= slides.length) return;
    current = idx;
    slides[current].scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateNav();
  }

  prevBtn.addEventListener('click', () => {
    if (current === 0 && prevPart) { location.href = prevPart + '?slide=last'; return; }
    goTo(current - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (current === slides.length - 1 && nextPart) { location.href = nextPart; return; }
    goTo(current + 1);
  });

  /* keep current in sync as user scrolls */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = slides.indexOf(e.target);
        if (idx !== -1 && idx !== current) { current = idx; updateNav(); }
      }
    });
  }, { threshold: 0.5 });
  slides.forEach(s => observer.observe(s));

  /* handle ?slide=last on arrival */
  if (new URLSearchParams(location.search).get('slide') === 'last') {
    current = slides.length - 1;
    setTimeout(() => slides[current].scrollIntoView({ block: 'start' }), 80);
  }

  nav.appendChild(prevBtn);
  nav.appendChild(labelSpan);
  nav.appendChild(nextBtn);

  updateNav();

  const deck = document.querySelector('.deck');
  if (deck) deck.parentNode.insertBefore(nav, deck.nextSibling);
}
