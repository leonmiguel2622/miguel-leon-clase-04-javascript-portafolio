# Portafolio v3 — JavaScript modular (POO + JSON)

Este es el portafolio de la Clase 04 en su versión **profesional**: el JavaScript está
separado en **clases** (POO), cada archivo tiene **una sola responsabilidad**, y el
**contenido** vive en `datos.json` (no dentro del HTML).

## 📁 Estructura

```
codigo/
├── index.html          → solo la ESTRUCTURA (contenedores vacíos con id)
├── styles.css          → estilos (de la Clase 03, + tags de proyectos)
├── datos.json          → TU CONTENIDO: nombre, skills, proyectos, redes
└── js/
    ├── main.js         → director de orquesta (importa y arranca todo)
    ├── Tema.js         → clase: modo claro/oscuro (+ recuerda con localStorage)
    ├── Portafolio.js   → clase: lee datos.json y pinta la página
    ├── GitHubAPI.js    → clase: pide tus datos reales a la API de GitHub
    ├── Contacto.js     → clase: valida el formulario y envía el correo
    ├── Animaciones.js  → clase: reveal al scroll, contadores, anime.js
    └── Reloj.js        → clase: muestra la hora en el footer y se actualiza cada segundo
```

> **Idea clave:** para actualizar tu portafolio **no tocas el HTML ni el JS**, solo
> editas `datos.json`. Los datos están separados de la presentación.

## ▶️ Cómo abrirlo (IMPORTANTE)

Este proyecto usa **módulos** (`import`/`export`) y `fetch("datos.json")`. Por seguridad,
el navegador **NO** deja usar eso si abres el archivo con doble clic (`file://`).

**Ábrelo con Live Server:** en VS Code, clic derecho sobre `index.html` →
**"Open with Live Server"** (o el botón *Go Live* abajo a la derecha). Se abrirá en
`http://127.0.0.1:5500`, y ahí todo funciona.

## 🔧 Personalización (3 pasos)

### 1. Tu contenido → `datos.json`
Cambia nombre, resumen, skills, proyectos y tus redes. En `redes.github` pon **tu usuario**
de GitHub (así se cargan tu avatar y tus repos reales). En `redes.linkedin`, la URL de tu perfil, y
en `redes.linkedinUsuario`, el trozo final de esa URL (p. ej. `ana-perez`): con eso se dibuja el
**badge oficial de LinkedIn**. Con el placeholder `tu-usuario` solo verás el enlace de respaldo; con
tu usuario real, la tarjeta completa (necesita internet).

### 2. Tu GitHub
Ya sale de `datos.json` (`redes.github`). Si lo dejas en blanco, `main.js` usa
`githubUsuarioPorDefecto`.

### 3. El correo del formulario → Web3Forms (por defecto)
1. Entra a **https://web3forms.com**, escribe tu correo y te llega un **Access Key** gratis
   (no hay que crear cuenta).
2. Pega esa key en `js/main.js`, en `CONFIG.web3formsKey`.
3. Listo: cuando alguien te escriba, el mensaje llega a **tu correo**.

## ✨ Mejoras de la Clase 04 (tareas evaluativas)

### 2) Frase desde JSON
`datos.json` tiene `perfil.frase` (cita favorita). `Portafolio.js` crea `pintarFrase()` que la muestra en `.hero` con `id="p-frase"` y se llama desde `cargar()`. Criterio: cambiar la frase en el JSON y recargar cambia en la página sin tocar HTML ni JS.

### 3) Clase Reloj (POO + módulo)
`js/Reloj.js` exporta `class Reloj`:
```js
/* Mi clase Reloj muestra la hora en el footer y la actualiza
   cada segundo con setInterval. La hice en archivo aparte para
   POO y módulos: main.js solo la importa y arranca con
   new Reloj("#reloj").iniciar() */
```
Se importa en `main.js` y se arranca con `new Reloj("#reloj").iniciar()`. Usa `setInterval(() => actualizar(), 1000)` y `Date.toLocaleTimeString('es-CO')`. El contenedor es `<p id="reloj">` en el footer.

### 4) Validación con guarda anti-spam
`Contacto.js` tiene guarda en `validar()`:
```js
if (datos.mensaje.toLowerCase().includes("http")) return "⚠️ No se permiten enlaces en el mensaje.";
```
Si el mensaje contiene `http` no hace `fetch`, muestra aviso y `return` antes de enviar.

### 5) Mejora libre: Filtro de proyectos y GitHub
* **Filtro proyectos:** `index.html` añade `#filtro-proyectos` con botones `todos/JS/HTML`. `Portafolio.js` tiene `pintarProyectos(lista)`, `filtrarProyectos(tag)` con `filter(p => p.tags.includes(tag))` y `activarFiltro()` con delegación de eventos.
* **Filtro GitHub:** `index.html` añade `#filtro-github`. `main.js` guarda `window._reposCache` y filtra por `repo.language` con la misma lógica.
*Por qué así:* separa datos de vista, filtra en memoria sin duplicar HTML y cada clase mantiene su responsabilidad.

## ✉️ Otras opciones de correo (gratis)

| Herramienta | Cómo funciona | Cuándo usarla |
|-------------|---------------|---------------|
| **Web3Forms** (por defecto) | Solo un *access key*, sin cuenta. POST a su API. | La más simple. |
| **Formspree** | Creas cuenta, te dan un *endpoint* por formulario. | Si quieres un panel de mensajes. |
| **EmailJS** | *service + template + public key*; más pasos. | Si quieres plantillas de correo. |

## 🎬 Animaciones con librerías

`Animaciones.js` ya trae la entrada del hero con **anime.js** (import dinámico, con plan B en
CSS si no hay internet).

## ⚠️ Internet
`fetch` a GitHub, el envío del correo y las librerías por CDN **usan internet**. Si la red se
cae, el resto del portafolio se sigue viendo (hay `try/catch` en todo). GitHub API sin token permite 60 peticiones/hora por IP (error `403` es normal si recargas mucho).
