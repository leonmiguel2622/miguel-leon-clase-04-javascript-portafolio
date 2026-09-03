/* ============================================================
   Reloj.js — Mi clase Reloj (explicación con mis palabras)
   ------------------------------------------------------------
   Esta clase muestra la hora actual en el footer y la actualiza
   sola cada segundo. La hice en su propio archivo para cumplir
   con POO y módulos: main.js solo la importa y la arranca con
   new Reloj("#reloj").iniciar(). Usa setInterval para llamar a
   actualizar() cada 1000ms y Date + toLocaleTimeString para
   formatear la hora en español.
   ============================================================ */
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