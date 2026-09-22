/* Portafolio — datos.json → DOM premium, seguro */
export class Portafolio {
  constructor(rutaJson, animaciones) { this.rutaJson = rutaJson; this.animaciones = animaciones; this.datos = null; }
  async cargar() {
    const res = await fetch(this.rutaJson);
    if (!res.ok) throw new Error("JSON");
    this.datos = await res.json();
    this.pintarPerfil(); this.pintarFrase(); this.pintarSobreMi();
    this.pintarInfo(); this.pintarSkills(); this.pintarProyectos();
    this.activarFiltro(); this.pintarTimeline(); this.pintarRedes();
    this.animaciones.typing(this.datos.perfil?.roles || []);
    return this.datos;
  }
  $(s) { return document.querySelector(s); }
  esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  pintarPerfil() {
    const p = this.datos.perfil;
    this.$("#p-eyebrow").textContent = p.eyebrow;
    this.$("#p-nombre").textContent = p.nombre;
    this.$("#p-titulo").textContent = p.titulo;
    this.$("#p-resumen").textContent = p.resumen;
    const u = this.$("#p-ubicacion"); if (u && p.ubicacion) u.textContent = p.ubicacion;
    document.title = `${p.nombre} · Frontend Developer`;
    if (p.foto) {
      const f = this.$("#mi-foto");
      if (f) { f.src = p.foto; f.alt = `Fotografía de ${p.nombre}, desarrollador de software`; }
    }
    const exp = this.$("#h-stat-exp"); if (exp && p.añosFormacion) exp.textContent = p.añosFormacion;
    const tech = this.$("#h-stat-tech"); if (tech && Array.isArray(this.datos.skills)) tech.textContent = this.datos.skills.length;
  }
  pintarFrase() {
    const el = this.$("#p-frase");
    if (!el) return;
    const f = this.datos.perfil?.frase;
    el.textContent = f ? `"${f}"` : "";
    if (!f) el.style.display = "none";
  }
  pintarSobreMi() {
    const c = this.$("#sobre-mi-texto");
    const a = Array.isArray(this.datos.sobreMi) ? this.datos.sobreMi : [];
    c.innerHTML = a.map((x) => `<p>${this.esc(x)}</p>`).join("");
  }
  pintarInfo() {
    const g = this.$("#info-grid");
    if (!g) return;
    const arr = this.datos.infoCards || [];
    g.innerHTML = "";
    for (const it of arr) {
      const d = document.createElement("div");
      const i = document.createElement("i"); i.className = it.icono; i.setAttribute("aria-hidden", "true");
      const s = document.createElement("strong"); s.textContent = it.titulo;
      const sp = document.createElement("span"); sp.textContent = it.texto;
      d.append(i, s, sp); g.appendChild(d);
    }
  }
  nivelLabel(n) { return n >= 85 ? "Avanzado" : n >= 70 ? "Intermedio" : n >= 50 ? "En progreso" : "Base"; }
  pintarSkills() {
    const ul = this.$("#skills-lista");
    ul.innerHTML = "";
    for (const s of this.datos.skills || []) {
      const li = document.createElement("li");
      li.className = "skill-card spotlight reveal";
      const top = document.createElement("div"); top.className = "skill-card__top";
      const ico = document.createElement("div"); ico.className = "skill-ico";
      const i = document.createElement("i"); i.className = s.icono; i.setAttribute("aria-hidden", "true");
      ico.appendChild(i);
      const tx = document.createElement("div");
      const st = document.createElement("strong"); st.textContent = s.nombre;
      const sm = document.createElement("small"); sm.textContent = s.detalle || "";
      tx.append(st, sm);
      const lvl = document.createElement("span"); lvl.className = "lvl"; lvl.textContent = this.nivelLabel(Number(s.nivel));
      top.append(ico, tx, lvl);
      const bar = document.createElement("div"); bar.className = "bar";
      bar.setAttribute("role", "img"); bar.setAttribute("aria-label", `${s.nombre} ${s.nivel} de 100`);
      const fill = document.createElement("i"); fill.style.setProperty("--pct", `${Number(s.nivel)}%`);
      bar.appendChild(fill);
      const pct = document.createElement("span"); pct.className = "pct"; pct.textContent = `${s.nivel}% · ${this.nivelLabel(Number(s.nivel))}`;
      li.append(top);
      if (s.detalle) { const p = document.createElement("p"); p.textContent = s.detalle; li.appendChild(p); }
      li.append(bar, pct);
      ul.appendChild(li);
    }
    this.animaciones.observarReveals(ul);
  }
  projectCard(proy, featured) {
    const art = document.createElement("article");
    art.className = `project spotlight reveal${featured ? " project--featured" : ""}`;
    // mock visual
    const vis = document.createElement("div"); vis.className = "browser";
    const bar = document.createElement("div"); bar.className = "browser__bar";
    bar.innerHTML = `<i></i><i></i><i></i>`;
    const url = document.createElement("span"); url.className = "browser__url";
    url.textContent = (proy.repo && proy.repo.startsWith("http") ? proy.repo.replace("https://", "") : "localhost · " + proy.nombre);
    bar.appendChild(url);
    const body = document.createElement("div"); body.className = "browser__body";
    const mock = document.createElement("div"); mock.className = "browser__mock";
    mock.textContent = proy.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "</>";
    body.appendChild(mock);
    vis.append(bar, body);
    // info
    const info = document.createElement("div"); info.className = "project__body";
    const flags = document.createElement("div"); flags.className = "project__flags";
    if (featured) { const f = document.createElement("span"); f.className = "flag flag--feat"; f.textContent = "★ DESTACADO"; flags.appendChild(f); }
    if (proy.año) { const y = document.createElement("span"); y.className = "flag flag--year"; y.textContent = proy.año; flags.appendChild(y); }
    if (proy.estado) { const e = document.createElement("span"); e.className = "flag flag--ok"; e.textContent = proy.estado; flags.appendChild(e); }
    const h3 = document.createElement("h3"); h3.textContent = proy.nombre;
    const p = document.createElement("p"); p.textContent = proy.descripcion;
    const tags = document.createElement("div"); tags.className = "repo__tags";
    for (const t of proy.tags || []) { const s = document.createElement("span"); s.className = "tag"; s.textContent = t; tags.appendChild(s); }
    const links = document.createElement("div"); links.className = "project__links";
    const a1 = document.createElement("a"); a1.href = proy.repo; a1.target = "_blank"; a1.rel = "noopener"; a1.textContent = "Código →";
    const a2 = document.createElement("a"); a2.href = proy.enlace; a2.target = "_blank"; a2.rel = "noopener"; a2.textContent = "Ver demo →";
    if (proy.repo === "#") { a1.style.opacity = ".45"; a1.textContent = "Pronto →"; }
    links.append(a1, a2);
    info.append(flags, h3, p, tags, links);
    art.append(vis, info);
    return art;
  }
  pintarProyectos(lista = this.datos.proyectos) {
    const c = this.$("#proyectos-lista");
    if (!c) return;
    c.innerHTML = "";
    if (!lista.length) { c.innerHTML = `<p class="muted">No hay proyectos con ese filtro.</p>`; return; }
    const dest = lista.filter((p) => p.destacado), rest = lista.filter((p) => !p.destacado);
    for (const p of [...dest, ...rest]) c.appendChild(this.projectCard(p, !!p.destacado));
    this.animaciones.observarReveals(c);
  }
  filtrarProyectos(tag) {
    const f = tag === "todos" ? this.datos.proyectos : this.datos.proyectos.filter((p) => (p.tags || []).includes(tag));
    this.pintarProyectos(f);
  }
  activarFiltro() {
    const c = this.$("#filtro-proyectos");
    if (!c) return;
    c.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-tag]");
      if (!b) return;
      this.filtrarProyectos(b.dataset.tag);
      c.querySelectorAll("button").forEach((x) => { x.classList.remove("btn--primary"); x.classList.add("btn--ghost"); x.setAttribute("aria-pressed", "false"); });
      b.classList.remove("btn--ghost"); b.classList.add("btn--primary"); b.setAttribute("aria-pressed", "true");
    });
  }
  pintarTimeline() {
    const ol = this.$("#timeline");
    if (!ol) return;
    ol.innerHTML = "";
    for (const t of this.datos.trayectoria || []) {
      const li = document.createElement("li"); li.className = "reveal";
      const pe = document.createElement("div"); pe.className = "periodo"; pe.textContent = t.periodo;
      const h = document.createElement("h3"); h.textContent = t.titulo;
      const p = document.createElement("p"); p.textContent = t.texto;
      const tags = document.createElement("div"); tags.className = "repo__tags";
      for (const tg of t.tags || []) { const s = document.createElement("span"); s.className = "tag"; s.textContent = tg; tags.appendChild(s); }
      li.append(pe, h, p, tags);
      ol.appendChild(li);
    }
    this.animaciones.observarReveals(ol);
  }
  pintarRedes() {
    const r = this.datos.redes;
    if (!r) return;
    const gh = this.$("#red-github"); if (gh && r.github) gh.href = `https://github.com/${r.github}`;
    const hg = this.$("#hero-github"); if (hg && r.github) hg.href = `https://github.com/${r.github}`;
    const li = this.$("#red-linkedin"); if (li && r.linkedin) li.href = r.linkedin;
    const m = this.$("#red-correo"); if (m && r.correo) m.href = `mailto:${r.correo}`;
    const l = this.$("#li-link"); if (l && r.linkedin) l.href = r.linkedin;
    const cm = this.$("#copy-mail-txt"); if (cm && r.correo) cm.textContent = r.correo;
  }
}
