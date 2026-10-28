/* Разбор — движок разнесённого вида на CSS 3D.
   Каждая деталь — плоский слой с SVG-рисунком. Слои стоят в одной 3D-сцене
   и расходятся по оси Z; камера, слои и выноски пересчитываются в одном цикле rAF.
   Прогресс e: 0 — устройство собрано, 1 — полностью разобрано. */
(() => {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  // Положение детали без пружины: нужно для ползунка, замера и запасного режима без Motion.
  const kOf = (e, d) => easeOut(clamp((e - 0.28 - d) / 0.5));
  const n1 = v => v.toFixed(1);
  const n2 = v => v.toFixed(2);
  let seed = 0;

  const el = (tag, cls, parent) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  };

  class Exploder {
    constructor(stage, opts = {}) {
      this.stage = stage;
      this.o = Object.assign({ labels: true, loop: false, parallax: false, wideAt: 820 }, opts);
      this.e = 0; this.target = 0; this.dur = 1.9;
      this.view = { turn: 0, tilt: 0, vt: 0 };
      this.goal = null; this.zoom = 1; this.zoomGoal = 1; this.pan = { x: 0, y: 0 };
      this.anims = []; this.fallback = false; this.lastE = -1;
      this.par = { x: 0, y: 0, tx: 0, ty: 0 };
      this.swayAmt = 1; this.idle = 10; this.rest = 0; this.t = 0; this.lift = 24;
      this.hoverKey = null; this.selKey = null; this.auto = false; this.over = false;
      this.handlers = {}; this.visible = true; this.running = false; this.cls = {};
      this.fit = { A: { s: 1, cx: 0, cy: 0 }, E: { s: 1, cx: 0, cy: 0 } };
      this.reduced = reduceMQ.matches;
      this.tick = this.tick.bind(this);

      stage.classList.add('xs');
      this.viewEl = el('div', 'xs-view', stage);
      this.rig = el('div', 'xs-rig p3d', this.viewEl);
      this.lines = document.createElementNS(SVGNS, 'svg');
      this.lines.setAttribute('class', 'xs-lines');
      this.lines.setAttribute('aria-hidden', 'true');
      stage.appendChild(this.lines);
      this.labelBox = el('div', 'xs-labels', stage);
      this.bind();
    }

    /* ── сборка сцены ─────────────────────────── */
    setModel(model, from = 0) {
      this.model = model;
      this.rig.textContent = '';
      this.lines.textContent = '';
      this.labelBox.textContent = '';
      this.nodes = []; this.parts = []; this.byKey = {};
      this.shadow = el('div', 'xs-shadow', this.rig);
      this.root = this.build(model.root, this.rig, null);
      this.parts.forEach((p, i) => {
        p.num = String(i + 1).padStart(2, '0');
        if (this.o.labels) this.makeLabel(p);
      });
      this.stopAnims();
      this.fallback = false;
      this.e = this.target = clamp(from);
      for (const p of this.parts) p.k = this.e;
      this.hoverKey = this.selKey = null;
      this.view.turn = this.view.tilt = this.view.vt = 0;
      this.goal = null;
      this.zoom = this.zoomGoal = 1;
      this.pan.x = this.pan.y = 0;
      this.cls = {};
      this.measure();
      this.emit('model', model);
      this.emit('state', this.target);
      this.emit('part', null);
      this.start();
    }

    build(spec, parentEl, parent) {
      const w = spec.w || parent.w, h = spec.h || parent.h;
      const n = { spec, w, h, parent, hov: 0, raw: 0, k: 0, idx: 0, delay: 0 };
      const node = el('div', 'xs-n', parentEl);
      node.style.width = w + 'px';
      node.style.height = h + 'px';
      node.style.marginLeft = -w / 2 + 'px';
      node.style.marginTop = -h / 2 + 'px';
      if (spec.origin) node.style.transformOrigin = spec.origin;
      n.el = node;
      this.nodes.push(n);

      if (spec.children) {
        n.group = true;
        node.classList.add('p3d');
        const count = spec.children.length;
        n.kids = spec.children.map((c, i) => {
          const k = this.build(c, node, n);
          k.idx = i;
          k.delay = count > 1 ? (i / (count - 1)) * 0.22 : 0;
          return k;
        });
        return n;
      }

      const u = 'x' + (++seed) + '_';
      n.zA = spec.zA || 0;
      n.zE = spec.zE || 0;
      if (spec.thick) this.thick(n, u);
      if (spec.art) {
        const f = el('div', 'xs-face', node);
        f.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${spec.art(u, w, h)}</svg>`;
        if (spec.thick) f.style.transform = `translateZ(${spec.thick.faceZ || 0}px)`;
        n.face = f;
      }
      node.dataset.part = spec.key;
      const a = el('i', 'xs-anchor', n.face || n.mid);
      a.style.left = spec.anchor[0] + 'px';
      a.style.top = spec.anchor[1] + 'px';
      n.anchor = a;
      this.parts.push(n);
      this.byKey[spec.key] = n;
      return n;
    }

    // Толстая деталь (рамка, корпус): стопка контуров, которая выглядит как сплошной борт.
    thick(n, u) {
      const t = n.spec.thick, w = n.w, h = n.h, bw = t.bw, r = t.r;
      n.el.classList.add('p3d');
      n.slices = [];
      for (let i = 0; i < t.n; i++) {
        const k = t.n > 1 ? i / (t.n - 1) : 0.5;
        const s = el('div', 'xs-slice', n.el);
        s.style.transform = `translateZ(${n2(-t.depth / 2 + k * t.depth)}px)`;
        s.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect x="${bw / 2}" y="${bw / 2}" width="${w - bw}" height="${h - bw}" rx="${r - bw / 2}" fill="none" stroke="${t.color(k)}" stroke-width="${bw}"/>${t.extra ? t.extra(k, i, u) : ''}</svg>`;
        n.slices.push(s);
      }
      n.mid = n.slices[Math.floor((t.n - 1) / 2)];
    }

    makeLabel(p) {
      const b = el('button', 'xs-label', this.labelBox);
      const key = p.spec.key;
      b.type = 'button';
      b.innerHTML = `<span class="xs-num">${p.num}</span><span class="xs-name">${p.spec.short || p.spec.name}</span>`;
      b.setAttribute('aria-label', `${p.num}. ${p.spec.name}`);
      b.addEventListener('click', () => this.select(this.selKey === key ? null : key));
      b.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') this.setHover(key); });
      b.addEventListener('pointerleave', () => this.setHover(null));
      b.addEventListener('focus', () => this.setHover(key));
      b.addEventListener('blur', () => this.setHover(null));
      p.label = b;
      p.side = 0;
      const line = document.createElementNS(SVGNS, 'path');
      line.setAttribute('class', 'xs-line');
      line.setAttribute('pathLength', '1');
      const dot = document.createElementNS(SVGNS, 'circle');
      dot.setAttribute('class', 'xs-dot');
      dot.setAttribute('r', '3');
      this.lines.append(line, dot);
      p.line = line;
      p.dot = dot;
    }

    /* ── ввод ─────────────────────────────────── */
    bind() {
      const st = this.stage;
      st.addEventListener('pointerdown', ev => {
        if (ev.button > 0 || ev.target.closest('.xs-label')) return;
        this.ptr = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, lx: ev.clientX, ly: ev.clientY, lt: performance.now(), moved: false, key: this.keyAt(ev.target) };
        this.view.vt = 0;
        this.goal = null;
        this.idle = 0;
        this.start();
      });
      st.addEventListener('pointermove', ev => {
        const p = this.ptr;
        if (p && ev.pointerId === p.id) {
          if (!p.moved && Math.hypot(ev.clientX - p.x, ev.clientY - p.y) > 6) {
            p.moved = true;
            try { st.setPointerCapture(ev.pointerId); } catch (_) { /* уже отпущен */ }
            st.classList.add('is-drag');
            this.setHover(null);
            this.emit('manual');
          }
          if (p.moved) {
            const now = performance.now(), dx = ev.clientX - p.lx, dy = ev.clientY - p.ly;
            this.view.turn += dx * 0.42;
            this.view.tilt = this.clampTilt(this.view.tilt - dy * 0.25);
            this.view.vt = (dx * 0.42) / Math.max(1, now - p.lt) * 16.7;
            p.lx = ev.clientX; p.ly = ev.clientY; p.lt = now;
            this.idle = 0;
          }
          return;
        }
        if (ev.pointerType === 'mouse' && this.target > 0.5) this.setHover(this.keyAt(ev.target));
      });
      const end = ev => {
        const p = this.ptr;
        if (!p || ev.pointerId !== p.id) return;
        this.ptr = null;
        st.classList.remove('is-drag');
        if (performance.now() - p.lt > 90) this.view.vt = 0;
        if (!p.moved && ev.type === 'pointerup') this.tap(p.key);
      };
      st.addEventListener('pointerup', end);
      st.addEventListener('pointercancel', end);
      st.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') this.over = true; });
      st.addEventListener('pointerleave', ev => {
        if (ev.pointerType !== 'mouse') return;
        this.over = false;
        if (!this.ptr) this.setHover(null);
      });
      st.addEventListener('keydown', ev => this.key(ev));

      new IntersectionObserver(es => {
        this.visible = es[es.length - 1].isIntersecting;
        this.start();
      }, { rootMargin: '160px' }).observe(st);
      document.addEventListener('visibilitychange', () => this.start());
      let raf = 0;
      new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => this.measure());
      }).observe(st);
      reduceMQ.addEventListener('change', () => { this.reduced = reduceMQ.matches; this.start(); });
      if (this.o.parallax) {
        addEventListener('pointermove', ev => {
          if (ev.pointerType !== 'mouse') return;
          this.par.tx = (ev.clientX / innerWidth - 0.5) * 26;
          this.par.ty = (ev.clientY / innerHeight - 0.5) * -10;
          this.start();
        }, { passive: true });
      }
    }

    keyAt(t) {
      const n = t && t.closest ? t.closest('[data-part]') : null;
      return n && this.stage.contains(n) ? n.dataset.part : null;
    }

    tap(key) {
      if (this.target < 0.5) { this.explode(); return; }
      this.select(key && key !== this.selKey ? key : null);
    }

    key(ev) {
      if (ev.target !== this.stage) return;
      const k = ev.key;
      let used = true;
      if (k === 'Enter' || k === ' ') this.toggle();
      else if (k === 'ArrowLeft') this.nudge(-20, 0);
      else if (k === 'ArrowRight') this.nudge(20, 0);
      else if (k === 'ArrowUp') this.nudge(0, -8);
      else if (k === 'ArrowDown') this.nudge(0, 8);
      else if (k === '+' || k === '=') this.zoomBy(1.25);
      else if (k === '-' || k === '_') this.zoomBy(0.8);
      else if (k === '0') this.resetView();
      else if (k === 'Escape') { if (this.selKey) this.select(null); else this.collapse(); }
      else used = false;
      if (used) { ev.preventDefault(); this.idle = 0; this.start(); }
    }

    /* ── положение камеры ─────────────────────── */
    baseCam() {
      const M = this.model, o = easeIO(clamp(this.e / 0.5));
      return { turn: lerp(M.cam.A.turn, M.cam.E.turn, o), tilt: lerp(M.cam.A.tilt, M.cam.E.tilt, o) };
    }
    // Наклон хранится как добавка к базовой камере; итоговый угол держим в 5…100°.
    clampTilt(v) {
      const b = this.model ? this.baseCam().tilt : 70;
      return clamp(v, 5 - b, 100 - b);
    }
    goTo(turn, tilt) {
      const cur = this.goal ? this.goal.turn : this.view.turn;
      const d = (((turn - cur) % 360) + 540) % 360 - 180;
      this.goal = { turn: cur + d, tilt: this.clampTilt(tilt) };
      this.view.vt = 0; this.idle = 0;
      this.start();
    }
    nudge(dTurn, dTilt) {
      const g = this.goal || this.view;
      this.goal = { turn: g.turn + dTurn, tilt: this.clampTilt(g.tilt + dTilt) };
      this.view.vt = 0; this.idle = 0;
      this.emit('manual');
      this.start();
    }
    // Готовые ракурсы — абсолютные углы камеры; что не задано, берётся из базовой камеры.
    preset(name) {
      const P = { front: [0, null], side: [-90, null], back: [180, null], top: [null, 6], iso: [null, null] }[name];
      if (!P || !this.model) return;
      const b = this.baseCam();
      this.goTo(P[0] === null ? 0 : P[0] - b.turn, P[1] === null ? 0 : P[1] - b.tilt);
    }
    zoomBy(f) {
      this.zoomGoal = clamp(this.zoomGoal * f, 0.6, 2.6);
      this.idle = 0;
      this.emit('zoom', this.zoomGoal);
      this.start();
    }

    /* ── API ──────────────────────────────────── */
    explode() { this.setTarget(1); }
    collapse() { this.setTarget(0); this.select(null); }
    toggle() { if (this.target > 0.5) this.collapse(); else this.explode(); }
    setTarget(v) {
      v = clamp(v);
      if (v === this.target) return;
      this.target = v;
      this.rest = 0;
      this.emit('state', v);
      this.play(v);
      this.start();
    }
    setProgress(v) {
      this.stopAnims();
      this.fallback = false;
      this.e = this.target = clamp(v);
      for (const p of this.parts) p.k = kOf(this.e, p.delay);
      this.idle = 0;
      this.emit('state', this.target);
      this.emit('progress', this.e);
      this.start();
    }
    // Разборка на Motion: камера едет плавной кривой, каждая деталь летит на своей пружине с задержкой.
    play(v) {
      this.stopAnims();
      const M = window.Motion;
      if (this.reduced) { this.e = v; for (const p of this.parts) p.k = v; return; }
      if (!M) { this.fallback = true; return; }
      const opening = v > this.e;
      this.anims.push(M.animate(this.e, v, { duration: opening ? 1.5 : 1.25, delay: opening ? 0 : 0.3, ease: [0.65, 0, 0.35, 1], onUpdate: x => { this.e = x; } }));
      for (const p of this.parts) {
        const delay = opening ? 0.4 + p.delay * 1.8 : (0.22 - p.delay) * 1.4;
        this.anims.push(M.animate(p.k, v, { type: 'spring', visualDuration: opening ? 0.8 : 0.55, bounce: opening ? 0.3 : 0.1, delay, onUpdate: x => { p.k = x; } }));
      }
    }
    stopAnims() {
      for (const a of this.anims) a.stop();
      this.anims = [];
    }
    select(key) {
      if (key && !this.byKey[key]) key = null;
      this.selKey = key;
      this.emit('part', this.current());
      this.start();
    }
    setHover(key) {
      if (key === this.hoverKey) return;
      this.hoverKey = key;
      this.emit('part', this.current());
      this.start();
    }
    current() {
      const k = this.hoverKey || this.selKey;
      return k ? this.byKey[k] : null;
    }
    resetView() {
      this.view.turn = (((this.view.turn % 360) + 540) % 360) - 180;
      this.goal = null;
      this.goTo(0, 0);
      this.zoomGoal = 1;
      this.emit('zoom', 1);
    }
    setAuto(on) { this.auto = !!on; this.idle = 10; this.start(); }
    on(name, fn) { (this.handlers[name] = this.handlers[name] || []).push(fn); return this; }
    emit(name, data) { (this.handlers[name] || []).forEach(fn => fn(data, this)); }

    /* ── цикл ─────────────────────────────────── */
    start() {
      if (this.running || !this.visible || document.hidden || !this.model) return;
      this.running = true;
      this.last = performance.now();
      requestAnimationFrame(this.tick);
    }

    tick(now) {
      if (!this.visible || document.hidden) { this.running = false; return; }
      const dt = Math.min(0.1, Math.max(0.001, (now - this.last) / 1000));
      const still = this.reduced;
      this.last = now; this.t += dt; this.idle += dt;

      if (this.fallback && this.e !== this.target) {
        const step = still ? 1 : dt / this.dur;
        this.e = this.e < this.target ? Math.min(this.target, this.e + step) : Math.max(this.target, this.e - step);
        for (const p of this.parts) p.k = kOf(this.e, p.delay);
      }
      if (this.e !== this.lastE) { this.lastE = this.e; this.emit('progress', this.e); }
      if (Math.abs(this.e - this.target) < 1e-3 && this.parts.every(p => Math.abs(p.k - this.target) < 2e-3)) this.rest += dt;
      else this.rest = 0;

      if (this.o.loop && !still && !this.over && !this.ptr && this.idle > 6 && this.rest > (this.target > 0.5 ? 3.4 : 2.2)) {
        this.setTarget(this.target > 0.5 ? 0 : 1);
      }

      const v = this.view;
      if (!this.ptr) {
        if (Math.abs(v.vt) > 0.01) { v.turn += v.vt * dt * 60; v.vt *= Math.exp(-dt * 4.5); }
        if (this.goal) {
          const k = still ? 1 : 1 - Math.exp(-dt * 6);
          v.turn += (this.goal.turn - v.turn) * k;
          v.tilt += (this.goal.tilt - v.tilt) * k;
          if (Math.abs(this.goal.turn - v.turn) < 0.05 && Math.abs(this.goal.tilt - v.tilt) < 0.05) {
            v.turn = this.goal.turn; v.tilt = this.goal.tilt; this.goal = null;
          }
        } else if (this.auto && !still) v.turn += dt * 16;
      }
      this.zoom += (this.zoomGoal - this.zoom) * (still ? 1 : 1 - Math.exp(-dt * 7));
      if (Math.abs(this.zoomGoal - this.zoom) < 0.0005) this.zoom = this.zoomGoal;
      const swayGoal = still || this.auto || this.idle < 2.5 ? 0 : 1;
      this.swayAmt += (swayGoal - this.swayAmt) * (1 - Math.exp(-dt * 1.5));
      if (this.o.parallax && !still) {
        const k = 1 - Math.exp(-dt * 3);
        this.par.x += (this.par.tx - this.par.x) * k;
        this.par.y += (this.par.ty - this.par.y) * k;
      }
      const cur = this.hoverKey || this.selKey;
      let settling = false;
      for (const p of this.parts) {
        const goal = p.spec.key === cur ? 1 : 0;
        p.hov += (goal - p.hov) * (1 - Math.exp(-dt * 10));
        if (Math.abs(goal - p.hov) > 0.002) settling = true;
      }

      this.render();

      // При увеличении камера наводится на выбранную деталь.
      let ptx = 0, pty = 0;
      const fn = this.zoom > 1.05 && this.selKey && this.e > 0.6 ? this.byKey[this.selKey] : null;
      if (fn) {
        const sr = this.stage.getBoundingClientRect(), r = fn.anchor.getBoundingClientRect();
        ptx = this.pan.x + (sr.left + sr.width / 2 - (r.left + r.width / 2));
        pty = this.pan.y + (sr.top + sr.height / 2 - (r.top + r.height / 2));
      }
      const kp = still ? 1 : 1 - Math.exp(-dt * 4);
      this.pan.x += (ptx - this.pan.x) * kp;
      this.pan.y += (pty - this.pan.y) * kp;
      const panning = Math.abs(ptx - this.pan.x) + Math.abs(pty - this.pan.y) > 0.3;

      if (this.o.labels) this.layout();

      const busy = !still || this.e !== this.target || this.ptr || Math.abs(v.vt) > 0.01 || this.goal || this.zoom !== this.zoomGoal || panning || settling;
      if (busy) requestAnimationFrame(this.tick);
      else this.running = false;
    }

    render(measuring) {
      const M = this.model;
      if (!M) return;
      const e = this.e, o = easeIO(clamp(e / 0.5));
      const still = this.reduced || measuring;
      const t = this.t;
      const A = this.fit.A, E = this.fit.E;
      const s = lerp(A.s, E.s, o) * (measuring ? 1 : this.zoom), cx = lerp(A.cx, E.cx, o), cy = lerp(A.cy, E.cy, o);
      const panX = measuring ? 0 : this.pan.x, panY = measuring ? 0 : this.pan.y;
      const vt = measuring ? 0 : this.view.turn + this.par.x;
      const vk = measuring ? 0 : this.view.tilt + this.par.y;
      const sway = still ? 0 : Math.sin(t * 0.35) * 6 * this.swayAmt;
      const tilt = clamp(lerp(M.cam.A.tilt, M.cam.E.tilt, o) + vk, 5, 100);
      const turn = lerp(M.cam.A.turn, M.cam.E.turn, o) + vt + sway;
      const ss = s.toFixed(4);
      this.rig.style.transform = `translate3d(${n1(-cx * s + panX)}px,${n1(-cy * s + panY)}px,0) scale3d(${ss},${ss},${ss}) rotateX(${n2(tilt)}deg) rotateZ(${n2(turn)}deg)`;

      const sh = M.shadow;
      const sw = lerp(sh.A[0], sh.E[0], o), sd = lerp(sh.A[1], sh.E[1], o), sz = lerp(sh.A[2], sh.E[2], o);
      this.shadow.style.transform = `translate3d(0,0,${n1(sz)}px) scale(${(sw / 100).toFixed(3)},${(sd / 100).toFixed(3)})`;

      for (const n of this.nodes) {
        const sp = n.spec;
        if (n.group) {
          const a = sp.A || {}, b = sp.E || {};
          const g = k => lerp(a[k] || 0, b[k] || 0, o);
          const bob = n === this.root && !still ? Math.sin(t * 0.9) * 3 * (1 - o) : 0;
          n.el.style.transform = `translate3d(${n1(g('tx'))}px,${n1(g('ty'))}px,${n2(g('tz') + bob)}px) rotateX(${n2(g('rx'))}deg)`;
        } else {
          const k = measuring ? kOf(e, n.delay) : n.k;
          n.raw = clamp(k);
          const lift = measuring ? 0 : n.hov * this.lift * clamp(k * 1.5);
          const z = lerp(n.zA, n.zE, k) + lift;
          n.el.style.transform = `translate3d(${sp.x || 0}px,${sp.y || 0}px,${n2(z)}px)`;
        }
      }
      this.classes();
    }

    classes() {
      const open = this.e > 0.45;
      const focus = !!(this.hoverKey || this.selKey) && this.e > 0.6;
      const cur = focus ? (this.hoverKey || this.selKey) : null;
      if (open !== this.cls.open) { this.stage.classList.toggle('is-open', open); this.cls.open = open; }
      if (focus !== this.cls.focus) { this.stage.classList.toggle('has-focus', focus); this.cls.focus = focus; }
      if (cur !== this.cls.cur) {
        for (const p of this.parts) {
          const on = p.spec.key === cur;
          p.el.classList.toggle('on', on);
          if (p.label) p.label.classList.toggle('on', on);
        }
        this.cls.cur = cur;
      }
    }

    // Выноски: на широком экране — колонки подписей слева и справа с линиями,
    // на узком — номера прямо на деталях.
    layout() {
      const st = this.stage, sr = st.getBoundingClientRect();
      const sw = sr.width, sh = sr.height;
      const wide = sw >= this.o.wideAt;
      if (wide !== this.cls.wide) { st.classList.toggle('xs-wide', wide); this.cls.wide = wide; }
      const colW = Math.min(240, sw * 0.21), pad = 18, mid = sw / 2;
      const focusKey = this.cls.cur;
      const cols = { L: [], R: [] };
      for (const p of this.parts) {
        p.vis = this.e > 0.3 ? clamp((p.raw - 0.7) / 0.3) : 0;
        if (p.vis <= 0) continue;
        const r = p.anchor.getBoundingClientRect();
        p.ax = r.left + r.width / 2 - sr.left;
        p.ay = r.top + r.height / 2 - sr.top;
        if (!wide) continue;
        if (!p.side) p.side = p.ax < mid ? -1 : 1;
        else if (p.side < 0 && p.ax > mid + 50) p.side = 1;
        else if (p.side > 0 && p.ax < mid - 50) p.side = -1;
        cols[p.side < 0 ? 'L' : 'R'].push(p);
      }
      if (wide) {
        const gap = 40, top = 84, bottom = sh - 64;
        for (const c of [cols.L, cols.R]) {
          c.sort((a, b) => a.ay - b.ay);
          let prev = -1e9;
          for (const p of c) { p.ly = Math.max(p.ay, prev + gap, top); prev = p.ly; }
          let max = bottom;
          for (let i = c.length - 1; i >= 0; i--) {
            if (c[i].ly > max) c[i].ly = max;
            max = c[i].ly - gap;
          }
        }
      }
      for (const p of this.parts) {
        const b = p.label;
        if (!b) continue;
        if (p.vis <= 0) {
          if (b.style.visibility !== 'hidden') {
            b.style.visibility = 'hidden';
            b.style.opacity = '0';
            p.line.style.opacity = '0';
            p.dot.style.opacity = '0';
          }
          continue;
        }
        const dim = focusKey && p.spec.key !== focusKey ? 0.35 : 1;
        b.style.visibility = 'visible';
        b.style.opacity = (p.vis * dim).toFixed(3);
        if (wide) {
          const left = p.side < 0;
          const xe = left ? pad + colW : sw - pad - colW;
          b.classList.toggle('xs-left', left);
          b.style.transform = `translate3d(${n1(xe)}px,${n1(p.ly)}px,0) translate(${left ? '-100%' : '0'},-50%)`;
          const ex = left ? xe + 30 : xe - 30, tx = left ? xe + 7 : xe - 7;
          p.line.setAttribute('d', `M${n1(p.ax)} ${n1(p.ay)}L${n1(ex)} ${n1(p.ly)}L${n1(tx)} ${n1(p.ly)}`);
          p.line.style.strokeDashoffset = (1 - p.vis).toFixed(3);
          p.line.style.opacity = dim.toFixed(2);
          p.dot.setAttribute('cx', n1(p.ax));
          p.dot.setAttribute('cy', n1(p.ay));
          p.dot.style.opacity = (p.vis * dim).toFixed(3);
        } else {
          b.classList.remove('xs-left');
          b.style.transform = `translate3d(${n1(p.ax)}px,${n1(p.ay)}px,0) translate(-50%,-50%)`;
          p.line.style.opacity = '0';
          p.dot.style.opacity = '0';
        }
      }
    }

    // Подбор масштаба: меряем собранное и разобранное состояние и вписываем в сцену.
    measure() {
      if (!this.model) return;
      const sr = this.stage.getBoundingClientRect();
      if (sr.width < 40 || sr.height < 40) return;
      const keep = this.e;
      const wide = this.o.labels && sr.width >= this.o.wideAt;
      const out = {};
      this.fit = { A: { s: 1, cx: 0, cy: 0 }, E: { s: 1, cx: 0, cy: 0 } };
      for (const [key, val] of [['A', 0], ['E', 1]]) {
        this.e = val;
        this.render(true);
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        this.rig.querySelectorAll('.xs-face, .xs-slice').forEach(n => {
          const r = n.getBoundingClientRect();
          if (!r.width && !r.height) return;
          if (r.left < x0) x0 = r.left;
          if (r.top < y0) y0 = r.top;
          if (r.right > x1) x1 = r.right;
          if (r.bottom > y1) y1 = r.bottom;
        });
        const padX = key === 'E' && wide ? Math.min(240, sr.width * 0.21) * 2 + 110 : 40;
        const padY = key === 'E' ? 130 : 80;
        const s = Math.min((sr.width - padX) / (x1 - x0), (sr.height - padY) / (y1 - y0), this.model.maxScale || 1.4);
        out[key] = { s: Math.max(0.1, s), cx: (x0 + x1) / 2 - (sr.left + sr.width / 2), cy: (y0 + y1) / 2 - (sr.top + sr.height / 2) };
      }
      this.fit = out;
      this.e = keep;
      this.cls.open = this.cls.focus = undefined;
      this.render();
      if (this.o.labels) this.layout();
    }
  }

  window.Exploder = Exploder;
})();
