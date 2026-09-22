/* ============================================================
   Contacto.js — Valida y envía por Web3Forms. Sin librerías.
   Celebración nativa con CSS (sin canvas-confetti CDN).
   ============================================================ */
export class Contacto {
  constructor(formulario, accessKey) {
    this.form = formulario;
    this.accessKey = accessKey;
    this.msg = formulario.querySelector("#form-msg");
    this.form.addEventListener("submit", (e) => this.enviar(e));
  }

  validar(datos) {
    if (!datos.nombre || datos.nombre.trim().length < 2) return "⚠️ Escribe tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo || "")) return "⚠️ El correo no es válido.";
    if (!datos.mensaje || datos.mensaje.trim().length < 10) return "⚠️ El mensaje es muy corto (mín. 10 letras).";
    if (datos.mensaje.toLowerCase().includes("http")) return "⚠️ No se permiten enlaces en el mensaje.";
    return "";
  }

  async enviar(evento) {
    evento.preventDefault();

    const form = new FormData(this.form);
    const datos = {
      nombre: String(form.get("nombre") || ""),
      correo: String(form.get("correo") || ""),
      mensaje: String(form.get("mensaje") || "")
    };

    const error = this.validar(datos);
    if (error) { this.mostrar(error, "var(--accent)"); return; }

    if (!this.accessKey || this.accessKey === "TU_ACCESS_KEY_AQUI") {
      this.mostrar("⚠️ Configura tu Web3Forms key en js/main.js para recibir mensajes.", "var(--accent)");
      return;
    }

    this.mostrar("Enviando…", "var(--muted)");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: this.accessKey, subject: `Portafolio: mensaje de ${datos.nombre}`, ...datos })
      });
      const r = await res.json();
      if (!r.success) throw new Error(r.message);

      this.mostrar(`✅ ¡Gracias, ${datos.nombre}! Tu mensaje fue enviado.`, "var(--link)");
      this.form.reset();
      this.celebrar();
    } catch {
      this.mostrar("😕 No se pudo enviar. Revisa tu conexión o tu access key.", "var(--accent)");
    }
  }

  mostrar(texto, color) {
    this.msg.textContent = texto;
    this.msg.style.color = color;
  }

  celebrar() {
    this.form.classList.remove("form--ok");
    void this.form.offsetWidth;
    this.form.classList.add("form--ok");
    setTimeout(() => this.form.classList.remove("form--ok"), 700);
  }
}
