/* Animaciones premium — 100% nativo, cero librerías */
export class Animaciones {
  constructor() {
    this.observador = new IntersectionObserver((e) => this.alAparecer(e), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  }
  observarReveals(c = document) {
    c.querySelectorAll(".reveal:not(.is-visible)").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 5) * 0.07}s`;
      this.observador.observe(el);
    });
  }
  observar(el) { this.observador.observe(el); }
  alAparecer(es) {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("is-visible"); this.observador.unobserve(e.target); }
  }
  contador(el, dest) {
    if (!el) return;
    if (this.reduced) { el.textContent = dest; return; }
    const d = 1000, t0 = performance.now();
    const f = (t) => { const k = Math.min((t - t0) / d, 1); el.textContent = Math.round(dest * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  entradaHero() {
    if (this.reduced) { document.querySelectorAll(".hero .reveal").forEach((el) => el.classList.add("is-visible")); return; }
    requestAnimationFrame(() => document.querySelectorAll(".hero .reveal").forEach((el, i) => {
      el.style.transitionDelay = `${0.15 + i * 0.09}s`; this.observador.observe(el);
    }));
  }
  typing(roles = []) {
    const el = document.querySelector("#typing");
    if (!el || !roles.length || this.reduced) return;
    let ri = 0, ci = roles[0].length, borrando = true;
    // empieza con texto completo y borra para efecto inmediato
    const tick = () => {
      const word = roles[ri];
      el.textContent = word.slice(0, ci);
      let wait = borrando ? 38 : 62;
      if (!borrando && ci === word.length) { wait = 1700; borrando = true; }
      else if (borrando && ci === 0) { borrando = false; ri = (ri + 1) % roles.length; wait = 350; }
      else ci += borrando ? -1 : 1;
      setTimeout(tick, wait);
    };
    setTimeout(tick, 1200);
  }
  tiltFoto() {
    if (this.reduced || !this.fine) return;
    const tilt = document.querySelector("#foto-tilt"), frame = document.querySelector("#foto-frame"), glare = document.querySelector("#foto-glare");
    if (!tilt || !frame) return;
    let mx = 0, my = 0, cx = 0, cy = 0, gx = 50, gy = 50;
    addEventListener("mousemove", (e) => {
      mx = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      my = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      const r = frame.getBoundingClientRect();
      gx = ((e.clientX - r.left) / r.width) * 100; gy = ((e.clientY - r.top) / r.height) * 100;
    }, { passive: true });
    const loop = () => {
      cx += (mx * 13 - cx) * 0.07; cy += (my * 10 - cy) * 0.07;
      tilt.style.transform = `rotateY(${(cx * 0.9).toFixed(2)}deg) rotateX(${(-cy * 0.9).toFixed(2)}deg)`;
      frame.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (glare) glare.style.background = `linear-gradient(115deg, transparent 30%, rgba(255,255,255,.20) 48%, transparent 62%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  particulasHero() {
    const canvas = document.querySelector("#hero-particulas");
    if (!canvas || this.reduced) return;
    const ctx = canvas.getContext("2d"), hero = canvas.closest(".hero");
    let w = 0, h = 0, pts = [], mouse = { x: -999, y: -999 };
    const mobile = () => innerWidth < 700;
    const resize = () => {
      w = canvas.width = hero.clientWidth; h = canvas.height = hero.clientHeight;
      const n = mobile() ? 24 : 55;
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.9 + 0.6,
        c: ["187,143,206", "241,148,138", "50,190,190", "244,180,26"][Math.floor(Math.random() * 4)]
      }));
    };
    resize(); addEventListener("resize", resize);
    hero.addEventListener("mousemove", (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("mouseleave", () => { mouse.x = -999; });
    let vis = true;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(hero);
    const draw = () => {
      requestAnimationFrame(draw);
      if (!vis) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120 && d > 1) { p.x += (dx / d) * 0.7; p.y += (dy / d) * 0.7; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},0.6)`; ctx.fill();
      }
      if (!mobile()) for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < 115) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(187,143,206,${(0.15 * (1 - d / 115)).toFixed(3)})`; ctx.lineWidth = 1; ctx.stroke(); }
      }
    };
    draw();
  }
  spotlight() {
    if (this.reduced || !this.fine) return;
    document.addEventListener("mousemove", (e) => {
      const t = e.target.closest?.(".spotlight");
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`);
      t.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true });
  }
  magnetic() {
    if (this.reduced || !this.fine) return;
    document.querySelectorAll(".magnetic").forEach((b) => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.18}px)`;
      });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
  }
  cursor() {
    if (this.reduced || !this.fine) return;
    const c = document.querySelector("#cursor-glow");
    if (!c) return;
    let x = -500, y = -500, tx = x, ty = y;
    addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const f = () => { x += (tx - x) * 0.12; y += (ty - y) * 0.12; c.style.left = `${x}px`; c.style.top = `${y}px`; requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  scrollProgress() {
    const fill = document.querySelector("#scroll-fill");
    if (!fill) return;
    const f = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      fill.style.width = `${h > 0 ? (scrollY / h) * 100 : 0}%`;
    };
    addEventListener("scroll", f, { passive: true }); f();
  }
  navActive() {
    const links = [...document.querySelectorAll("[data-nav]")];
    if (!links.length) return;
    const map = new Map(links.map((a) => [a.dataset.nav, a]));
    ["sobre-mi", "skills", "proyectos", "trayectoria", "github", "contacto"].forEach((id) => {
      const s = document.getElementById(id);
      if (s) new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { links.forEach((a) => a.classList.remove("active")); map.get(id)?.classList.add("active"); }
      }, { rootMargin: "-40% 0px -55% 0px" }).observe(s);
    });
  }
  preloader() {
    const pre = document.querySelector("#preloader"), fill = document.querySelector("#preloader-fill");
    if (!pre) return;
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(p + Math.random() * 28, 92);
      if (fill) fill.style.width = `${p}%`;
    }, 160);
    const done = () => {
      clearInterval(t);
      if (fill) fill.style.width = "100%";
      setTimeout(() => pre.classList.add("done"), 250);
      setTimeout(() => pre.remove(), 900);
    };
    if (document.readyState === "complete") setTimeout(done, 500);
    else addEventListener("load", () => setTimeout(done, 400));
    setTimeout(done, 3200); // seguridad
  }
}
