export class Reloj {
  constructor(selector) {
    this.el = document.querySelector(selector);
  }

  iniciar() {
    if (!this.el) return;
    this.actualizar();
    setInterval(() => this.actualizar(), 1000); // cada 1000ms
  }

  actualizar() {
    const ahora = new Date();
    // toLocaleTimeString = formatea hora local
    this.el.textContent = ahora.toLocaleTimeString('es-CO');
  }
}