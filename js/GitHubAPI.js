/* GitHubAPI — paginación real para botón "Ver más" */
export class GitHubAPI {
  constructor(usuario) {
    this.usuario = usuario;
    this.base = "https://api.github.com";
  }

  async obtenerPerfil() {
    const res = await fetch(`${this.base}/users/${this.usuario}`);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    return res.json();
  }

  // Paginado: página 1 = primeros N. Devuelve { repos, hasMore }
  // GitHub no dice el total en esta ruta, así que hasMore = (llegaron == porPagina)
  async obtenerRepos(pagina = 1, porPagina = 6, sort = "updated") {
    const url = `${this.base}/users/${this.usuario}/repos?sort=${sort}&direction=desc&per_page=${porPagina}&page=${pagina}`;
    const res = await fetch(url);
    if (res.status === 403) throw new Error("rate-limit");
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const repos = await res.json();
    return { repos, hasMore: Array.isArray(repos) && repos.length === porPagina };
  }

  async obtenerRepoDetalle(nombre) {
    const res = await fetch(`${this.base}/repos/${this.usuario}/${nombre}`);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    return res.json();
  }
}
