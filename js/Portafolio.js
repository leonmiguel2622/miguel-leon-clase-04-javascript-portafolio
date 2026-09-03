/* ============================================================
   Portafolio.js — Clase que LEE datos.json y pinta la página
   ------------------------------------------------------------
   La idea clave: el contenido (tu nombre, skills, proyectos, redes)
   NO está escrito en el HTML, sino en datos.json. Para actualizar tu
   portafolio, editas el JSON y listo. A esto se le llama "separar los
   datos de la presentación".
   ============================================================ */
export class Portafolio {
  constructor(rutaJson, animaciones) {
    this.rutaJson = rutaJson;
    this.animaciones = animaciones;   // reutilizamos la clase de animaciones
    this.datos = null;
  }

  // Pide el JSON, lo guarda y pinta todas las secciones. Devuelve los datos.
  async cargar() {
    const res = await fetch(this.rutaJson);
    if (!res.ok) throw new Error(`No pude leer ${this.rutaJson}`);
    this.datos = await res.json();

    this.pintarPerfil();
    this.pintarFrase();
    this.pintarSobreMi();
    this.pintarSkills();
    this.pintarProyectos();
    this.activarFiltro();
    this.pintarRedes();
    return this.datos;
  }

  // Atajo para escribir menos: busca un elemento por su selector.
  $(sel) { return document.querySelector(sel); }

  pintarPerfil() {
    const p = this.datos.perfil;
    this.$("#p-eyebrow").textContent = p.eyebrow;
    this.$("#p-nombre").textContent = p.nombre;
    this.$("#p-titulo").textContent = p.titulo;
    this.$("#p-resumen").textContent = p.resumen;
    document.title = `${p.nombre} · Dev`;
  }

  pintarFrase() {
    const el = this.$("#p-frase");
    if (!el) return;
    const frase = this.datos.perfil?.frase;
    el.textContent = frase ? `"${frase}"` : "";
  }

  pintarSobreMi() {
    const cont = this.$("#sobre-mi-texto");
    // .map() transforma cada párrafo en <p>…</p>; .join une el array en un texto.
    cont.innerHTML = this.datos.sobreMi.map((parrafo) => `<p>${parrafo}</p>`).join("");
  }

  pintarSkills() {
    const lista = this.$("#skills-lista");
    lista.innerHTML = this.datos.skills.map((s) => `
      <li class="skill">
        <span><i class="${s.icono}"></i> ${s.nombre}</span>
        <div class="bar"><i style="--pct:${s.nivel}%"></i></div>
      </li>`).join("");
  }

  pintarProyectos(lista = this.datos.proyectos) {
    const cont = this.$("#proyectos-lista");
    if (!cont) return;
    if (!lista.length) {
      cont.innerHTML = `<p class="muted">No hay proyectos con ese filtro.</p>`;
      return;
    }
    cont.innerHTML = lista.map((proy) => {
      const tags = proy.tags.map((t) => `<span class="tag">${t}</span>`).join("");
      return `
        <article class="repo reveal">
          <h3><i class="fa-solid fa-folder-open"></i> ${proy.nombre}</h3>
          <p>${proy.descripcion}</p>
          <div class="repo__tags">${tags}</div>
          <div class="repo__foot">
            <a href="${proy.repo}" target="_blank">Código →</a>
            <a href="${proy.enlace}" target="_blank">Ver demo →</a>
          </div>
        </article>`;
    }).join("");
    this.animaciones.observarReveals(cont); // que aparezcan al hacer scroll
  }

  filtrarProyectos(tag) {
    const filtrados = tag === "todos" ? this.datos.proyectos : this.datos.proyectos.filter((p) => p.tags.includes(tag));
    this.pintarProyectos(filtrados);
  }

  activarFiltro() {
    const cont = this.$("#filtro-proyectos");
    if (!cont) return;
    cont.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-tag]");
      if (!btn) return;
      const tag = btn.dataset.tag;
      this.filtrarProyectos(tag);
      cont.querySelectorAll("button").forEach((b) => b.classList.remove("btn--primary"));
      cont.querySelectorAll("button").forEach((b) => b.classList.add("btn--ghost"));
      btn.classList.remove("btn--ghost");
      btn.classList.add("btn--primary");
    });
  }

  pintarRedes() {
    const r = this.datos.redes;
    this.$("#red-github").href = `https://github.com/${r.github}`;
    this.$("#red-linkedin").href = r.linkedin;   // LinkedIn = enlace directo
    this.$("#red-correo").href = `mailto:${r.correo}`;
    this.pintarBadgeLinkedIn(r);
  }

  // Badge OFICIAL de LinkedIn: le ponemos tu usuario y su tema, y cargamos
  // el script de LinkedIn (que reemplaza el div por el badge de verdad).
  pintarBadgeLinkedIn(redes) {
    if (!redes.linkedinUsuario) return;             // sin usuario: no hacemos nada
    const badge = this.$(".LI-profile-badge");
    badge.dataset.vanity = redes.linkedinUsuario;   // tu perfil
    badge.dataset.theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    this.$("#li-link").href = redes.linkedin;       // respaldo si no carga el script

    // Cargamos el SDK de LinkedIn una sola vez (necesita internet).
    if (!document.querySelector("#li-sdk")) {
      const script = document.createElement("script");
      script.id = "li-sdk";
      script.src = "https://platform.linkedin.com/badges/js/profile.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }
}
