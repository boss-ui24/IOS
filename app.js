/* Разбор — сценарий страницы: hero, лаборатория, чип, история, материалы.
   Анимации интерфейса работают на Motion (motion.dev): пружины, появление при прокрутке,
   лента истории и прогресс, привязанные к скроллу. Без Motion страница работает, только спокойнее. */
(() => {
  'use strict';
  const D = window.RAZBOR_DEVICES;
  const M = window.Motion || null;
  const ORDER = ['iphone', 'mac', 'watch', 'airpods'];
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reduceMQ.matches;
  const motionOK = () => !!M && !reduced();
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const EASE = [0.22, 1, 0.36, 1];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const listParts = (spec, out = []) => {
    if (spec.children) spec.children.forEach(c => listParts(c, out));
    else out.push(spec);
    return out;
  };

  $('#statParts').textContent = ORDER.reduce((n, id) => n + listParts(D[id].root).length, 0);

  /* ── вход: элементы hero появляются по очереди ── */
  if (motionOK()) M.animate($$('[data-in]'), { opacity: [0, 1], y: [18, 0] }, { duration: 0.9, ease: EASE, delay: M.stagger(0.08) });

  /* ── живое время на экранах устройств ──────── */
  function tickClock() {
    const d = new Date();
    const time = d.toLocaleTimeString('ru-RU', { hour: 'numeric', minute: '2-digit' });
    const date = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    const short = (d.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '') + ' ' + d.getDate()).toUpperCase();
    $$('.x-clock').forEach(n => { n.textContent = time; });
    $$('.x-date').forEach(n => { n.textContent = date; });
    $$('.x-dshort').forEach(n => { n.textContent = short; });
  }

  /* ── hero: модель, которая сама разбирается ── */
  const hero = new Exploder($('#heroStage'), { labels: false, loop: true, parallax: true });
  hero.setModel(D.iphone, 0);

  /* ── лаборатория ───────────────────────────── */
  const stageEl = $('#labStage');
  const lab = new Exploder(stageEl, { labels: true });
  const ui = {
    btn: $('#explodeBtn'), range: $('#explodeRange'), out: $('#explodeOut'),
    auto: $('#autoBtn'), reset: $('#resetBtn'), hint: $('#stageHint'), list: $('#partsList'),
    card: $('#partCard'), pos: $('#pcPos'), dev: $('#pcDev'), name: $('#pcName'), desc: $('#pcDesc'), facts: $('#pcFacts'),
    text: $('.pc-text'), cu: $('#pcCu'), bits: $('#pcBits'), zoom: $('#pcZoom')
  };
  const BITS = window.RAZBOR_BITS || {};
  let cuSeed = 0;
  let devId = null;
  let cardKey = '∅';
  let rangeActive = false;

  const facts = arr => (arr || []).map(f => `<li>${f}</li>`).join('');

  function renderParts(model) {
    ui.list.innerHTML = listParts(model.root).map((p, i) =>
      `<li><button type="button" data-key="${p.key}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span>${p.name}</span></button></li>`).join('');
  }

  function showCard(p) {
    const dev = D[devId];
    const key = p ? p.spec.key : null;
    if (key === cardKey) return;
    cardKey = key;
    ui.pos.textContent = p ? 'Поз. ' + p.num : 'Обзор';
    ui.name.textContent = p ? p.spec.name : dev.name;
    ui.desc.textContent = p ? p.spec.desc : dev.tag;
    ui.facts.innerHTML = facts(p ? p.spec.facts : dev.facts);
    ui.dev.textContent = dev.name;
    $$('button[data-key]', ui.list).forEach(b => b.classList.toggle('on', b.dataset.key === key));
    const devBits = BITS[devId] || {};
    const node = p || lab.byKey[devBits.cover];
    if (node) closeUp(node, p ? devBits[key] || [] : []);
    if (motionOK()) {
      M.animate(ui.text, { opacity: [0.35, 1], y: [8, 0] }, { duration: 0.4, ease: EASE });
      M.animate(ui.cu, { opacity: [0, 1], scale: [0.94, 1] }, { type: 'spring', visualDuration: 0.45, bounce: 0.25 });
      const dots = ui.cu.querySelectorAll('.cu-bit');
      if (dots.length) M.animate(dots, { opacity: [0, 1], scale: [0.3, 1] }, { type: 'spring', visualDuration: 0.4, bounce: 0.45, delay: M.stagger(0.06, { startDelay: 0.12 }) });
    }
  }

  // Крупный план: рисунок детали без 3D, обрезанный по её контуру, с пронумерованными элементами.
  function closeUp(node, bits) {
    const sp = node.spec, w = node.w, h = node.h, u = 'cu' + (++cuSeed) + '_';
    let inner = '';
    if (sp.art) inner = sp.art(u, w, h);
    else if (sp.thick) {
      const t = sp.thick;
      inner = `<rect x="${t.bw / 2}" y="${t.bw / 2}" width="${w - t.bw}" height="${h - t.bw}" rx="${t.r - t.bw / 2}" fill="none" stroke="${t.color(0.5)}" stroke-width="${t.bw}"/>${t.extra ? t.extra(0.5, Math.floor((t.n - 1) / 2), u) : ''}`;
    }
    ui.cu.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
    const svg = ui.cu.firstElementChild;
    svg.querySelectorAll('.ghost').forEach(n => n.remove());
    let bb = { x: 0, y: 0, width: w, height: h };
    try { const b = svg.getBBox(); if (b.width > 1 && b.height > 1) bb = b; } catch (_) { /* остаётся полный кадр */ }
    const pad = Math.max(bb.width, bb.height) * 0.12 + 4;
    const vw = bb.width + pad * 2, vh = bb.height + pad * 2;
    svg.setAttribute('viewBox', `${(bb.x - pad).toFixed(1)} ${(bb.y - pad).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
    const r = Math.max(vw, vh) * 0.033;
    svg.insertAdjacentHTML('beforeend', bits.map(([x, y], i) =>
      `<g class="cu-bit"><circle class="halo" cx="${x}" cy="${y}" r="${(r * 1.75).toFixed(1)}"/><circle class="dot" cx="${x}" cy="${y}" r="${r.toFixed(1)}" stroke-width="${(r * 0.18).toFixed(2)}"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${(r * 1.15).toFixed(1)}">${i + 1}</text></g>`).join(''));
    ui.bits.innerHTML = bits.map(([, , t], i) => `<li><b>${i + 1}</b>${t}</li>`).join('');
    const box = ui.cu.getBoundingClientRect();
    const cuScale = Math.min((box.width - 20) / vw, (box.height - 20) / vh);
    const ratio = cuScale / ((lab.fit && lab.fit.E ? lab.fit.E.s : 1) * lab.zoom);
    ui.zoom.textContent = ratio >= 1.2 ? 'Вид сверху · М ' + ratio.toFixed(1).replace('.', ',') + ' : 1' : 'Вид сверху';
  }

  lab.on('part', showCard);
  lab.on('state', t => {
    const open = t > 0.5;
    ui.btn.querySelector('span').textContent = open ? 'Собрать' : 'Разобрать';
    ui.btn.setAttribute('aria-pressed', String(open));
    ui.hint.querySelector('span').textContent = open ? 'Наведите на деталь или нажмите на неё' : 'Нажмите на устройство, чтобы разобрать';
  });
  lab.on('progress', e => {
    const v = Math.round(clamp(e) * 100);
    if (!rangeActive) ui.range.value = v;
    ui.out.textContent = v + '%';
    ui.hint.classList.toggle('hide', e > 0.02 && e < 0.98);
  });

  ui.btn.addEventListener('click', () => lab.toggle());
  ui.range.addEventListener('pointerdown', () => { rangeActive = true; });
  addEventListener('pointerup', () => { rangeActive = false; });
  ui.range.addEventListener('input', () => {
    lab.setProgress(ui.range.value / 100);
    ui.out.textContent = ui.range.value + '%';
  });
  ui.auto.addEventListener('click', () => {
    const on = ui.auto.getAttribute('aria-pressed') !== 'true';
    ui.auto.setAttribute('aria-pressed', String(on));
    lab.setAuto(on);
  });
  ui.reset.addEventListener('click', () => { lab.resetView(); markPreset('iso'); });

  /* пульт положения: ракурсы, поворот с удержанием, масштаб */
  const presetBtns = $$('[data-view]');
  const zoomOut = $('#zoomOut');
  function markPreset(name) { presetBtns.forEach(b => b.classList.toggle('on', b.dataset.view === name)); }
  presetBtns.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.view === 'iso') lab.resetView(); else lab.preset(b.dataset.view);
    markPreset(b.dataset.view);
  }));
  lab.on('manual', () => markPreset(null));
  lab.on('zoom', z => { zoomOut.textContent = Math.round(z * 100) + '%'; });
  lab.on('model', () => { zoomOut.textContent = '100%'; markPreset('iso'); });
  $$('[data-nudge]').forEach(b => {
    const [dTurn, dTilt] = b.dataset.nudge.split(',').map(Number);
    let delay = 0, repeat = 0;
    const stop = () => { clearTimeout(delay); clearInterval(repeat); b.classList.remove('hold'); };
    b.addEventListener('pointerdown', ev => {
      if (ev.button > 0) return;
      lab.nudge(dTurn, dTilt);
      b.classList.add('hold');
      delay = setTimeout(() => { repeat = setInterval(() => lab.nudge(dTurn / 3, dTilt / 3), 90); }, 380);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, stop));
    b.addEventListener('click', ev => { if (ev.detail === 0) lab.nudge(dTurn, dTilt); });
  });
  $$('[data-zoom]').forEach(b => b.addEventListener('click', () => lab.zoomBy(+b.dataset.zoom)));

  const keyOf = ev => { const b = ev.target.closest('button[data-key]'); return b ? b.dataset.key : null; };
  ui.list.addEventListener('click', ev => {
    const k = keyOf(ev);
    if (!k) return;
    if (lab.target < 0.5) lab.explode();
    lab.select(lab.selKey === k ? null : k);
  });
  ui.list.addEventListener('pointerover', ev => {
    const k = keyOf(ev);
    if (k && ev.pointerType === 'mouse' && lab.target > 0.5) lab.setHover(k);
  });
  ui.list.addEventListener('pointerleave', () => lab.setHover(null));
  ui.list.addEventListener('focusin', ev => { const k = keyOf(ev); if (k && lab.target > 0.5) lab.setHover(k); });
  ui.list.addEventListener('focusout', () => lab.setHover(null));

  /* вкладки устройств: подчёркивание переезжает на пружине */
  const tabs = $$('.tab');
  const ind = $('.tab-ind');
  function moveInd(animated) {
    const t = tabs.find(b => b.getAttribute('aria-selected') === 'true');
    if (!t) return;
    if (M) M.animate(ind, { x: t.offsetLeft, width: t.offsetWidth }, animated === true && !reduced() ? { type: 'spring', visualDuration: 0.45, bounce: 0.2 } : { duration: 0 });
    else { ind.style.width = t.offsetWidth + 'px'; ind.style.transform = `translateX(${t.offsetLeft}px)`; }
  }

  function setDevice(id, opts = {}) {
    if (!D[id]) return;
    tabs.forEach(b => {
      const on = b.dataset.dev === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    moveInd(true);
    stageEl.setAttribute('aria-labelledby', 'tab-' + id);
    if (id === devId) { if (opts.explode) lab.explode(); return; }
    const open = opts.explode != null ? opts.explode : lab.target > 0.5;
    const first = !devId;
    const swap = () => {
      devId = id;
      cardKey = '∅';
      renderParts(D[id]);
      lab.setModel(D[id], reduced() ? (open ? 1 : 0) : (open ? 0 : 1));
      lab.setTarget(open ? 1 : 0);
      tickClock();
      $('#stName').textContent = D[id].name;
      $('#stCount').textContent = lab.parts.length;
      $('#stSheet').textContent = (ORDER.indexOf(id) + 1) + ' / 4';
    };
    if (first || !motionOK()) { swap(); return; }
    // Старое устройство гаснет, новое собирается из деталей прямо на глазах.
    M.animate(stageEl, { opacity: 0, scale: 0.985 }, { duration: 0.2, ease: 'easeIn' }).then(() => {
      swap();
      M.animate(stageEl, { opacity: [0, 1], scale: [0.985, 1] }, { type: 'spring', visualDuration: 0.5, bounce: 0.15 });
    });
  }

  tabs.forEach((b, i) => {
    b.addEventListener('click', () => setDevice(b.dataset.dev));
    b.addEventListener('keydown', ev => {
      const map = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!(ev.key in map)) return;
      ev.preventDefault();
      tabs[map[ev.key]].focus();
      setDevice(tabs[map[ev.key]].dataset.dev);
    });
  });
  addEventListener('resize', () => moveInd());
  if (document.fonts) document.fonts.ready.then(() => moveInd());

  setDevice('iphone');
  tickClock();
  setInterval(tickClock, 15000);

  // Кнопки «Разобрать …»: прокрутка к лаборатории и разборка нужного устройства.
  $$('[data-go]').forEach(a => a.addEventListener('click', ev => {
    ev.preventDefault();
    $('#lab').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => setDevice(a.dataset.go, { explode: true }), reduced() ? 0 : 750);
  }));

  /* ── чип M4 ────────────────────────────────── */
  const grid = (x, y, cols, rows, dx, dy, w, h) => {
    const r = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) r.push([x + i * dx, y + j * dy, w, h]);
    return r;
  };
  const BLOCKS = [
    { id: 'p', name: 'P-ядра', tag: 'P-CORE', fill: '#3a2f22', rects: grid(204, 204, 2, 2, 44, 36, 40, 32), text: 'Производительные ядра берут на себя тяжёлые задачи: компиляцию, рендер, обработку фото. В M4 их до четырёх.' },
    { id: 'e', name: 'E-ядра', tag: 'E-CORE', fill: '#2c3137', rects: grid(300, 204, 3, 2, 33, 36, 29, 32), text: 'Энергоэффективные ядра обслуживают фоновые процессы и берегут батарею. В M4 их шесть.' },
    { id: 'gpu', name: 'GPU', tag: 'GPU', fill: '#213238', rects: grid(204, 282, 5, 2, 39.4, 31, 35.4, 27), text: 'Графический процессор с аппаратной трассировкой лучей. В M4 до 10 графических ядер.' },
    { id: 'ne', name: 'Neural Engine', tag: 'NE', fill: '#33273a', rects: grid(204, 352, 4, 4, 23.5, 12.5, 20.5, 10), text: '16 ядер для задач машинного обучения: до 38 трлн операций в секунду.' },
    { id: 'cache', name: 'Кэш', tag: 'SLC', fill: '#2d2d2d', rects: [[302, 352, 97, 20]], text: 'Общий кэш системного уровня ускоряет обмен данными между блоками чипа.' },
    { id: 'media', name: 'Медиадвижок', tag: 'MEDIA', fill: '#27311f', rects: [[302, 378, 97, 24]], text: 'Аппаратно кодирует и декодирует видео, в том числе ProRes, почти не нагружая процессор.' },
    { id: 'mem', name: 'Единая память', tag: 'RAM', fill: '#121314', rects: [[160, 196, 24, 208], [416, 196, 24, 208]], text: 'Память общая для CPU, GPU и Neural Engine, поэтому данные не приходится копировать между ними.' }
  ];

  function buildChip() {
    const svg = $('#chipSvg');
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const sides = [
      { o: t => [t, 150], out: [0, -1], al: [1, 0] },
      { o: t => [450, t], out: [1, 0], al: [0, 1] },
      { o: t => [t, 450], out: [0, 1], al: [-1, 0] },
      { o: t => [150, t], out: [-1, 0], al: [0, -1] }
    ];
    let traces = '', pulses = '', pads = '';
    sides.forEach((sd, si) => {
      for (let k = 0; k < 7; k++) {
        const [x0, y0] = sd.o(176 + k * 41.3);
        const a = 14 + rnd() * 34, d = (rnd() - 0.5) * 46, L = 138;
        const P = (o, l) => [x0 + sd.out[0] * o + sd.al[0] * l, y0 + sd.out[1] * o + sd.al[1] * l];
        const pts = [P(0, 0), P(a, 0), P(a + Math.abs(d), d), P(L, d)];
        const dpath = 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L');
        traces += `<path class="c-trace" d="${dpath}"/>`;
        pads += `<circle cx="${pts[3][0].toFixed(1)}" cy="${pts[3][1].toFixed(1)}" r="3.2" class="c-pin"/>`;
        if ((k + si) % 2 === 0) {
          pulses += `<path class="c-pulse" pathLength="100" d="${dpath}" style="animation-duration:${(2.4 + rnd() * 2.4).toFixed(2)}s;animation-delay:-${(rnd() * 4).toFixed(2)}s"/>`;
        }
      }
    });
    let pins = '';
    for (let k = 0; k < 14; k++) {
      const t = 166 + k * 20;
      pins += `<rect x="${t}" y="144" width="8" height="6" rx="1" class="c-pin"/><rect x="${t}" y="450" width="8" height="6" rx="1" class="c-pin"/><rect x="144" y="${t}" width="6" height="8" rx="1" class="c-pin"/><rect x="450" y="${t}" width="6" height="8" rx="1" class="c-pin"/>`;
    }
    const blocks = BLOCKS.map(b => `<g class="blk" data-b="${b.id}">${b.rects.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="${b.fill}" stroke="#4b4239" stroke-width=".8"/>`).join('')}<text x="${b.rects[0][0] + 4}" y="${b.rects[0][1] + 11}" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#fff" fill-opacity=".55" pointer-events="none">${b.tag}</text></g>`).join('');
    svg.innerHTML = `<defs><linearGradient id="chipSheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="chipDie"><rect x="190" y="190" width="220" height="220" rx="8"/></clipPath></defs>
<g>${traces}</g><g>${pulses}</g><g>${pads}</g><g>${pins}</g>
<rect x="150" y="150" width="300" height="300" rx="20" fill="#151311" stroke="#3a332d" stroke-width="1.5"/>
<rect x="190" y="190" width="220" height="220" rx="8" fill="#1d1a17" stroke="#4b4239"/>
${blocks}
<g clip-path="url(#chipDie)" pointer-events="none"><rect id="chipSheenRect" x="120" y="180" width="90" height="240" fill="url(#chipSheen)"/></g>
<text x="300" y="434" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="15" fill="#d9cfc4" fill-opacity=".8" letter-spacing="3" pointer-events="none">M4</text>`;
    // Блик бежит по кристаллу по кругу.
    if (motionOK()) M.animate('#chipSheenRect', { x: [-160, 360], skewX: [-18, -18] }, { duration: 5.2, repeat: Infinity, ease: [0.65, 0, 0.35, 1] });

    const legend = $('#chipLegend'), cap = $('#chipCap'), vis = $('.chip-visual');
    legend.innerHTML = BLOCKS.map(b => `<button type="button" data-b="${b.id}" aria-pressed="false">${b.name}</button>`).join('');
    const defCap = cap.innerHTML;
    let pinned = null;
    const show = id => {
      const b = BLOCKS.find(x => x.id === id);
      vis.classList.toggle('focus', !!b);
      $$('.blk', svg).forEach(g => g.classList.toggle('on', !!b && g.dataset.b === id));
      $$('button', legend).forEach(x => { x.classList.toggle('on', !!b && x.dataset.b === id); x.setAttribute('aria-pressed', String(pinned === x.dataset.b)); });
      cap.innerHTML = b ? `<b>${b.name}.</b> ${b.text}` : defCap;
      if (b && motionOK()) M.animate(cap, { opacity: [0.4, 1], y: [6, 0] }, { duration: 0.35, ease: EASE });
    };
    const hoverIn = ev => { const t = ev.target.closest('[data-b]'); if (t) show(t.dataset.b); };
    const hoverOut = () => show(pinned);
    svg.addEventListener('pointerover', hoverIn);
    svg.addEventListener('pointerleave', hoverOut);
    legend.addEventListener('pointerover', hoverIn);
    legend.addEventListener('pointerleave', hoverOut);
    legend.addEventListener('focusin', hoverIn);
    legend.addEventListener('focusout', hoverOut);
    const pick = ev => {
      const t = ev.target.closest('[data-b]');
      if (!t) return;
      pinned = pinned === t.dataset.b ? null : t.dataset.b;
      show(pinned || t.dataset.b);
    };
    svg.addEventListener('click', pick);
    legend.addEventListener('click', pick);
  }
  buildChip();

  // Счётчики крутятся с нуля, когда блок впервые попадает в кадр.
  if (motionOK()) {
    const stopCounters = M.inView('.counters', () => {
      stopCounters();
      $$('.count').forEach(el => {
        const to = +el.dataset.to;
        M.animate(0, to, { duration: 1.7, ease: EASE, onUpdate: v => { el.textContent = Math.round(v); } });
      });
    }, { amount: 0.4 });
  }

  /* ── история: горизонтальная лента, которую двигает прокрутка ── */
  const histSec = $('#history'), track = $('#histTrack'), bar = $('#histBar'), vp = $('#histViewport');
  const cards = $$('.hist-card', track);
  let pinned = false, maxX = 0, stopHist = null;
  function applyHist(p) {
    track.style.transform = `translate3d(${(-p * maxX).toFixed(1)}px,0,0)`;
    cards.forEach(c => {
      const cr = c.getBoundingClientRect();
      const off = (cr.left + cr.width / 2 - innerWidth / 2) / innerWidth;
      c.querySelector('.hist-year').style.transform = `translateX(${(off * -36).toFixed(1)}px)`;
    });
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  }
  function updHist() {
    if (pinned) {
      const r = histSec.getBoundingClientRect();
      applyHist(clamp(-r.top / Math.max(1, r.height - innerHeight)));
    } else {
      const p = vp.scrollWidth > vp.clientWidth ? vp.scrollLeft / (vp.scrollWidth - vp.clientWidth) : 1;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    }
  }
  function setupHist() {
    if (stopHist) { stopHist(); stopHist = null; }
    pinned = innerWidth >= 900 && !reduced();
    histSec.classList.toggle('pinned', pinned);
    if (pinned) {
      const padL = parseFloat(getComputedStyle(vp).paddingLeft) || 0;
      maxX = Math.max(0, padL * 2 + track.scrollWidth - innerWidth);
      histSec.style.height = Math.round(innerHeight + maxX) + 'px';
      if (M) stopHist = M.scroll(p => applyHist(p), { target: histSec, offset: ['start start', 'end end'] });
    } else {
      histSec.style.height = '';
      track.style.transform = '';
      cards.forEach(c => { c.querySelector('.hist-year').style.transform = ''; });
    }
    updHist();
  }
  vp.addEventListener('scroll', updHist, { passive: true });
  let resizeRaf = 0;
  addEventListener('resize', () => { cancelAnimationFrame(resizeRaf); resizeRaf = requestAnimationFrame(setupHist); });
  setupHist();

  /* ── бегущие строки: Motion гоняет их по кругу, скорость и наклон зависят от скорости прокрутки ── */
  const mqBoxes = $$('.marquee');
  const anims = motionOK() ? $$('.mq-track').map((t, i) => M.animate(t, { x: i % 2 ? ['-50%', '0%'] : ['0%', '-50%'] }, { duration: 46 + i * 9, ease: 'linear', repeat: Infinity })) : [];
  let mqVisible = false, mqRun = false, vel = 0, lastY = scrollY, rate = 1, skew = 0;
  function mqLoop() {
    const y = scrollY, dy = y - lastY;
    lastY = y;
    vel += (dy - vel) * 0.2;
    rate += (1 + Math.min(5, Math.abs(vel) * 0.12) - rate) * 0.1;
    anims.forEach(a => { a.speed = rate; });
    skew += (clamp(-vel * 0.15, -7, 7) - skew) * 0.12;
    mqBoxes.forEach(m => { m.style.transform = `skewX(${skew.toFixed(2)}deg)`; });
    if (mqVisible) requestAnimationFrame(mqLoop);
    else mqRun = false;
  }
  if (anims.length) {
    M.inView('#materials', () => {
      mqVisible = true;
      if (!mqRun) { mqRun = true; lastY = scrollY; requestAnimationFrame(mqLoop); }
      return () => { mqVisible = false; };
    });
  }

  /* ── прокрутка: полоска прогресса и активный раздел ─── */
  const prog = $('.progress');
  if (M) M.scroll(M.animate(prog, { scaleX: [0, 1] }, { ease: 'linear' }));
  const links = $$('.nav-links a');
  const secs = links.map(a => $(a.getAttribute('href')));
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (!M) {
        const h = document.documentElement.scrollHeight - innerHeight;
        prog.style.transform = `scaleX(${h > 0 ? clamp(scrollY / h).toFixed(4) : 0})`;
        if (pinned) updHist();
      }
      const mid = innerHeight * 0.4;
      links.forEach((a, i) => {
        const r = secs[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── появление разделов: пружинный подъём (текст виден всегда, двигается только сдвиг) ── */
  if (motionOK()) {
    const below = n => n.getBoundingClientRect().top > innerHeight;
    const rise = (els, extra) => M.animate(els, { y: 0 }, Object.assign({ type: 'spring', visualDuration: 0.7, bounce: 0.18 }, extra));
    $$('[data-reveal]').filter(below).forEach(n => {
      M.animate(n, { y: 48 }, { duration: 0 });
      const stop = M.inView(n, () => { stop(); rise(n); }, { margin: '0px 0px -8% 0px' });
    });
    ['.counters', '.mat-grid'].forEach(sel => {
      const box = $(sel);
      if (!box || !below(box)) return;
      const kids = Array.from(box.children);
      M.animate(kids, { y: 36 }, { duration: 0 });
      const stop = M.inView(box, () => { stop(); rise(kids, { delay: M.stagger(0.06) }); }, { margin: '0px 0px -8% 0px' });
    });

    /* отклик на нажатие: кнопки чуть проседают и пружинят обратно */
    M.press('.btn, .pill-btn, .presets button, .dpad button, .zoompad button, .tab, .chip-legend button', el => {
      M.animate(el, { scale: 0.94 }, { type: 'spring', stiffness: 700, damping: 30 });
      return () => M.animate(el, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 15 });
    });

    /* наклон карточек материалов за курсором */
    if (finePointer) {
      const follow = { type: 'spring', stiffness: 260, damping: 22 };
      $$('[data-tilt]').forEach(card => {
        card.addEventListener('pointermove', e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          M.animate(card, { rotateX: (0.5 - y) * 10, rotateY: (x - 0.5) * 12 }, follow);
          card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        });
        card.addEventListener('pointerleave', () => M.animate(card, { rotateX: 0, rotateY: 0 }, { type: 'spring', stiffness: 180, damping: 14 }));
      });
    }
  }
})();
