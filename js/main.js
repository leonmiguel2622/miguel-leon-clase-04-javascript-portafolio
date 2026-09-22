/* main.js — ultra: Ver más GitHub + modal + toast + extras */
import { Tema } from "./Tema.js";
import { Portafolio } from "./Portafolio.js";
import { GitHubAPI } from "./GitHubAPI.js";
import { Contacto } from "./Contacto.js";
import { Animaciones } from "./Animaciones.js";
import { Reloj } from "./Reloj.js";

const CONFIG = { githubUsuarioPorDefecto: "leonmiguel2622", web3formsKey: "TU_ACCESS_KEY_AQUI", perPage: 6 };
document.documentElement.classList.add("js");

const LANG_COLORS = { JavaScript: "#f1e05a", HTML: "#e34c26", CSS: "#563d7c", Python: "#3572A5", TypeScript: "#3178c6", PHP: "#4F5D95", Java: "#b07219" };
const state = { api: null, anim: null, page: 1, perPage: CONFIG.perPage, cache: [], total: 0, hasMore: true, loading: false, lang: "todos", query: "", sort: "updated", perfil: null };

function toast(msg) {
  const t = document.querySelector("#toast");
  if (!t) return;
  t.textContent = msg; t.hidden = false;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.classList.remove("show"); setTimeout(() => { t.hidden = true; }, 300); }, 2400);
}

function tiempoRelativo(iso) {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso)) / 864e5);
  if (d <= 0) return "hoy";
  if (d === 1) return "ayer";
  if (d < 30) return `hace ${d} días`;
  if (d < 365) return `hace ${Math.floor(d / 30)} mes(es)`;
  return `hace ${Math.floor(d / 365)} año(s)`;
}

async function iniciar() {
  const anim = new Animaciones();
  state.anim = anim;
  anim.preloader();
  new Tema(document.querySelector("#btn-tema"));
  anim.observarReveals(); anim.entradaHero(); anim.tiltFoto();
  anim.particulasHero(); anim.spotlight(); anim.magnetic();
  anim.cursor(); anim.scrollProgress(); anim.navActive();
  new Reloj("#reloj").iniciar();
  const y = document.querySelector("#year"); if (y) y.textContent = new Date().getFullYear();

  // Reloj hero Bucaramanga
  const hc = document.querySelector("#hero-clock");
  if (hc) {
    const f = () => { try { hc.textContent = "BGA " + new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }); } catch { hc.textContent = ""; } };
    f(); setInterval(f, 30000);
  }

  const avatar = document.querySelector("#gh-avatar");
  if (avatar) avatar.addEventListener("error", () => {
    if (!avatar.src.includes("assets/images/mi-foto.jpg")) avatar.src = "assets/images/mi-foto.jpg";
  }, { once: true });

  new Contacto(document.querySelector("#form-contacto"), CONFIG.web3formsKey);

  // Contador mensaje
  const ta = document.querySelector("#f-mensaje"), mc = document.querySelector("#msg-count");
  if (ta && mc) {
    const u = () => { mc.textContent = `${ta.value.length}/500`; };
    ta.addEventListener("input", u); u();
  }

  // Nav
  const nav = document.querySelector("#nav");
  const onScroll = () => nav.classList.toggle("is-visible", scrollY > innerHeight * 0.35);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const toggle = document.querySelector("#nav-toggle"), links = document.querySelector("#nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const o = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(o));
      toggle.innerHTML = o ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    links.addEventListener("click", (e) => { if (e.target.closest("a")) { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.innerHTML = '<i class="fa-solid fa-bars"></i>'; } });
    addEventListener("keydown", (e) => { if (e.key === "Escape") links.classList.remove("is-open"); });
  }

  const toTop = document.querySelector("#to-top");
  if (toTop) toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  const copyBtn = document.querySelector("#copy-mail"), hint = document.querySelector("#copy-hint");
  if (copyBtn) copyBtn.addEventListener("click", async () => {
    const mail = document.querySelector("#copy-mail-txt")?.textContent?.trim() || "leonjohan481@gmail.com";
    try { await navigator.clipboard.writeText(mail); if (hint) hint.textContent = "¡copiado!"; toast("Correo copiado al portapapeles"); }
    catch { window.location.href = `mailto:${mail}`; }
    setTimeout(() => { if (hint) hint.textContent = "copiar"; }, 1600);
  });

  // Lightbox foto
  const frame = document.querySelector("#foto-frame"), fmodal = document.querySelector("#foto-modal");
  const openFoto = () => { if (fmodal && fmodal.showModal) fmodal.showModal(); };
  if (frame && fmodal) {
    frame.addEventListener("click", openFoto);
    frame.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFoto(); } });
    document.querySelector("#foto-close")?.addEventListener("click", () => fmodal.close());
    fmodal.addEventListener("click", (e) => { if (e.target === fmodal) fmodal.close(); });
  }

  // Modal repo
  const rmodal = document.querySelector("#repo-modal");
  if (rmodal) {
    document.querySelector("#modal-close")?.addEventListener("click", () => rmodal.close());
    rmodal.addEventListener("click", (e) => { if (e.target === rmodal) rmodal.close(); });
    document.querySelector("#modal-copy")?.addEventListener("click", async () => {
      const txt = document.querySelector("#modal-clone")?.textContent || "";
      try { await navigator.clipboard.writeText(txt); toast("Comando copiado"); } catch { toast(txt); }
    });
  }

  const portafolio = new Portafolio("datos.json", anim);
  let datos;
  try { datos = await portafolio.cargar(); }
  catch {
    document.querySelector("#proyectos-lista").innerHTML = "<p class='muted'>No pude leer datos.json. Usa Live Server.</p>";
    return;
  }
  state.api = new GitHubAPI(datos.redes?.github || CONFIG.githubUsuarioPorDefecto);
  const vt = document.querySelector("#gh-ver-todos");
  if (vt && datos.redes?.github) vt.href = `https://github.com/${datos.redes.github}?tab=repositories`;

  wireGithubUI();
  await cargarPerfil();
  await cargarPagina(1, true);
}

function wireGithubUI() {
  const f = document.querySelector("#filtro-github");
  if (f) f.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-lang]");
    if (!b) return;
    state.lang = b.dataset.lang; state.page = 1;
    f.querySelectorAll("button").forEach((x) => { x.classList.remove("btn--primary"); x.classList.add("btn--ghost"); x.setAttribute("aria-pressed", "false"); });
    b.classList.remove("btn--ghost"); b.classList.add("btn--primary"); b.setAttribute("aria-pressed", "true");
    renderRepos();
  });
  const q = document.querySelector("#gh-buscar");
  if (q) q.addEventListener("input", () => { state.query = q.value.trim().toLowerCase(); renderRepos(); });
  const s = document.querySelector("#gh-orden");
  if (s) s.addEventListener("change", () => { state.sort = s.value; renderRepos(); });
  document.querySelector("#gh-ver-mas")?.addEventListener("click", () => cargarPagina(state.page + 1, false));
}

function skeletons(n, cont) {
  cont.innerHTML = "";
  for (let i = 0; i < n; i++) { const d = document.createElement("div"); d.className = "skel"; cont.appendChild(d); }
}

async function cargarPerfil() {
  try {
    const perfil = await state.api.obtenerPerfil();
    state.perfil = perfil; state.total = perfil.public_repos || 0;
    const av = document.querySelector("#gh-avatar");
    if (av && perfil.avatar_url) { av.src = perfil.avatar_url; av.alt = `Foto de GitHub de ${perfil.login}`; }
    state.anim.contador(document.querySelector("#stat-repos"), perfil.public_repos);
    state.anim.contador(document.querySelector("#stat-followers"), perfil.followers);
    state.anim.contador(document.querySelector("#stat-following"), perfil.following);
  } catch { /* stats quedan en 0, repos lo intentan igual */ }
}

async function cargarPagina(page, inicial) {
  if (state.loading || (!state.hasMore && !inicial)) return;
  state.loading = true;
  const cont = document.querySelector("#gh-repos");
  const btn = document.querySelector("#gh-ver-mas"), hint = document.querySelector("#gh-hint");
  if (inicial) skeletons(state.perPage, cont);
  else if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando…'; }
  try {
    const { repos, hasMore } = await state.api.obtenerRepos(page, state.perPage, "updated");
    if (page === 1) state.cache = repos;
    else state.cache = [...state.cache, ...repos.filter((r) => !state.cache.some((x) => x.id === r.id))];
    state.page = page; state.hasMore = hasMore;
    renderRepos();
    if (hint) hint.textContent = hasMore ? `Mostrando ${state.cache.length}${state.total ? ` de ~${state.total}` : ""} · GitHub muestra ${state.perPage} por tanda` : `Fin · ${state.cache.length} cargados${state.total ? ` de ${state.total} públicos` : ""}`;
  } catch (e) {
    if (inicial) cont.innerHTML = e.message === "rate-limit"
      ? "<div class='empty'><i class='fa-solid fa-triangle-exclamation'></i><p>Límite de GitHub (60/h). Espera un minuto y recarga.</p></div>"
      : "<div class='empty'><i class='fa-solid fa-wifi'></i><p>No pude cargar GitHub. Revisa tu conexión.</p></div>";
    else toast("No pude cargar más (límite o red).");
  } finally {
    state.loading = false;
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-plus"></i> Ver más repositorios'; }
    actualizarBoton();
  }
}

function listaFiltrada() {
  let l = [...state.cache];
  if (state.lang !== "todos") l = l.filter((r) => r.language === state.lang);
  if (state.query) l = l.filter((r) => `${r.name} ${r.description || ""} ${r.language || ""}`.toLowerCase().includes(state.query));
  if (state.sort === "stars") l.sort((a, b) => b.stargazers_count - a.stargazers_count);
  else if (state.sort === "name") l.sort((a, b) => a.name.localeCompare(b.name));
  else l.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  return l;
}

function renderRepos() {
  const cont = document.querySelector("#gh-repos");
  const lista = listaFiltrada();
  const count = document.querySelector("#gh-count");
  if (count) count.textContent = `${lista.length} visibles · ${state.cache.length} cargados${state.total ? ` · ${state.total} públicos` : ""}`;
  cont.innerHTML = "";
  if (!lista.length) {
    const hayFiltros = state.lang !== "todos" || state.query;
    cont.innerHTML = `<div class="empty"><i class="fa-solid fa-magnifying-glass"></i><p>${hayFiltros ? "Nada coincide con esos filtros en lo cargado." : "Aún no hay repos para mostrar."}</p>${hayFiltros && state.hasMore ? "<p class='muted'>Prueba “Ver más” para buscar en el resto.</p>" : ""}</div>`;
    const b = document.createElement("button");
    b.className = "btn btn--ghost"; b.textContent = "Limpiar filtros";
    b.addEventListener("click", () => {
      state.lang = "todos"; state.query = ""; state.sort = "updated";
      document.querySelector("#gh-buscar").value = "";
      document.querySelector("#gh-orden").value = "updated";
      document.querySelectorAll("#filtro-github button").forEach((x, i) => {
        x.classList.toggle("btn--primary", i === 0); x.classList.toggle("btn--ghost", i !== 0);
      });
      renderRepos();
    });
    cont.appendChild(b);
    actualizarBoton();
    return;
  }
  for (const r of lista) cont.appendChild(repoCard(r));
  actualizarBoton();
}

function repoCard(r) {
  const card = document.createElement("article");
  card.className = "repo spotlight reveal is-visible";
  card.setAttribute("role", "listitem"); card.tabIndex = 0;
  card.setAttribute("aria-label", `Ver detalle de ${r.name}`);
  const h3 = document.createElement("h3");
  const ico = document.createElement("i"); ico.className = "fa-solid fa-book-bookmark"; ico.setAttribute("aria-hidden", "true");
  h3.append(ico, document.createTextNode(` ${r.name}`));
  const p = document.createElement("p"); p.textContent = r.description || "Sin descripción";
  const meta = document.createElement("div"); meta.className = "repo__meta";
  const lang = document.createElement("span");
  const dot = document.createElement("span"); dot.className = "lang-dot";
  dot.style.background = LANG_COLORS[r.language] || "var(--lavanda)";
  lang.append(dot, document.createTextNode(r.language || "—"));
  const stars = document.createElement("span"); stars.innerHTML = `⭐ ${r.stargazers_count} · 🍴 ${r.forks_count}`;
  const upd = document.createElement("span"); upd.textContent = "↻ " + tiempoRelativo(r.updated_at);
  meta.append(lang, stars, upd);
  const foot = document.createElement("div"); foot.className = "repo__foot";
  const det = document.createElement("span"); det.style.color = "var(--link)"; det.style.fontWeight = "700"; det.textContent = "Detalle →";
  const a = document.createElement("a"); a.href = r.html_url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "GitHub ↗";
  a.addEventListener("click", (e) => e.stopPropagation());
  foot.append(det, a);
  card.append(h3, p, meta, foot);
  const open = () => openModal(r);
  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
  state.anim.observar(card);
  return card;
}

function actualizarBoton() {
  const btn = document.querySelector("#gh-ver-mas"), todos = document.querySelector("#gh-ver-todos"), hint = document.querySelector("#gh-hint");
  if (!btn) return;
  const filtrando = state.lang !== "todos" || state.query;
  // Si hay filtros, Ver más sigue cargando del servidor (para buscar más allá)
  if (!state.hasMore) {
    btn.hidden = true;
    if (todos) todos.hidden = false;
    if (hint && !hint.textContent) hint.textContent = "Ya viste todo lo disponible por API.";
  } else {
    btn.hidden = false;
    if (todos) todos.hidden = true;
    btn.innerHTML = filtrando
      ? '<i class="fa-solid fa-plus"></i> Cargar más para seguir buscando'
      : '<i class="fa-solid fa-plus"></i> Ver más repositorios';
  }
}

async function openModal(r) {
  const m = document.querySelector("#repo-modal");
  if (!m) { window.open(r.html_url, "_blank", "noopener"); return; }
  document.querySelector("#modal-title").textContent = r.name;
  document.querySelector("#modal-lang").textContent = (r.language || "REPO") + " · " + tiempoRelativo(r.updated_at);
  document.querySelector("#modal-desc").textContent = r.description || "Sin descripción";
  document.querySelector("#modal-stats").innerHTML = "";
  for (const [k, v] of [["⭐", r.stargazers_count], ["🍴", r.forks_count], ["👁", r.watchers_count ?? "—"], ["🐞", r.open_issues_count ?? 0]]) {
    const s = document.createElement("span"); s.textContent = `${k} ${v}`; document.querySelector("#modal-stats").appendChild(s);
  }
  // Detalle extra (topics, homepage, fechas) sin bloquear
  try {
    const d = await state.api.obtenerRepoDetalle(r.name);
    if (d.homepage) { const h = document.querySelector("#modal-home"); h.hidden = false; h.href = d.homepage.startsWith("http") ? d.homepage : `https://${d.homepage}`; }
    else document.querySelector("#modal-home").hidden = true;
    if (Array.isArray(d.topics) && d.topics.length) {
      const s = document.createElement("span"); s.textContent = "🏷 " + d.topics.slice(0, 4).join(", ");
      document.querySelector("#modal-stats").appendChild(s);
    }
  } catch { /* modal sigue útil con lo básico */ }
  document.querySelector("#modal-clone").textContent = `git clone ${r.clone_url || r.html_url + ".git"}`;
  const l = document.querySelector("#modal-link"); l.href = r.html_url;
  if (m.showModal) m.showModal();
}

iniciar();
