// Memoria de cálculo desplegable (compartida por acero, hormigón, madera, espectros y diseño vial).
// Cada paso muestra sus resultados; al pincharlo se despliegan las ecuaciones con
// los valores reemplazados (las mismas del informe .tex), dibujadas con KaTeX.
"use strict";

const KATEX = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/";
let katexListo = null;
function cargarKatex() {
  if (katexListo) return katexListo;
  // crossOrigin: la respuesta debe ser CORS (no opaca) para que el service worker la guarde.
  katexListo = new Promise((ok) => {
    if (!document.querySelector("link[data-katex]")) {
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = KATEX + "katex.min.css"; css.crossOrigin = "anonymous";
      css.dataset.katex = "1";
      document.head.appendChild(css);
    }
    const js = document.createElement("script");
    js.src = KATEX + "katex.min.js"; js.crossOrigin = "anonymous";
    js.onload = () => ok(true);
    js.onerror = () => { js.remove(); katexListo = null; ok(false); }; // se reintenta en el próximo uso
    document.head.appendChild(js);
  });
  return katexListo;
}

// Datos obligatorios: reglas [id, mínimo, estricto]. Un campo vacío, no numérico o bajo el
// mínimo se marca en rojo y se devuelve su nombre; la página no calcula (evita un "CUMPLE" falso).
function datosInvalidos(reglas) {
  const malos = [];
  for (const [id, min = 0, estricto = false] of reglas) {
    const el = document.getElementById(id);
    if (!el) continue;
    const v = parseFloat(el.value);
    const bad = el.value.trim() === "" || !Number.isFinite(v) || (estricto ? v <= min : v < min);
    el.classList.toggle("invalido", bad);
    if (bad) malos.push((el.labels && el.labels[0] ? el.labels[0].textContent : id).replace(/\s+/g, " ").trim());
  }
  return malos;
}
// Limpia la marca de los campos que ya no se validan (p. ej. al cambiar de pestaña).
function limpiarInvalidos(raiz = document) {
  raiz.querySelectorAll(".invalido").forEach((el) => el.classList.remove("invalido"));
}
const avisoInvalidos = (malos) =>
  `<div class="verdict bad" style="margin:10px 0;padding:10px 14px;border-radius:6px;background:#fdecea;color:#8e2a1e;font-weight:600">✘ Datos inválidos — revise: ${malos.join(" · ")}. No se calcula hasta corregirlos.</div>`;

// pdflatex con inputenc utf8 no trae definidos los griegos ni varios símbolos matemáticos:
// se declaran en el preámbulo los que aparecen en el documento.
const TEX_UNICODE = {
  "03B1": "\\alpha", "03B2": "\\beta", "03B3": "\\gamma", "03B4": "\\delta", "03B5": "\\varepsilon",
  "03B6": "\\zeta", "03B7": "\\eta", "03B8": "\\theta", "03BB": "\\lambda", "03BC": "\\mu",
  "03BD": "\\nu", "03BE": "\\xi", "03C0": "\\pi", "03C1": "\\rho", "03C3": "\\sigma", "03C4": "\\tau",
  "03C6": "\\phi", "03D5": "\\phi", "03C8": "\\psi", "03C9": "\\omega", "0394": "\\Delta",
  "03A3": "\\Sigma", "03A6": "\\Phi", "2264": "\\le", "2265": "\\ge", "2260": "\\ne", "2248": "\\approx",
  "2192": "\\rightarrow", "21D2": "\\Rightarrow", "221E": "\\infty", "221A": "\\surd", "2212": "-",
  "2211": "\\sum", "2202": "\\partial", "2074": "^{4}", "2076": "^{6}", "2080": "_{0}", "2081": "_{1}",
  "2082": "_{2}", "2033": "''", "2032": "'",
};
function texUnicode(doc) {
  // babel-spanish redefine \% y falla con el espacio fino previo ("\,\%" → Incompatible glue units);
  // el propio babel ya agrega el espacio antes del signo
  doc = doc.replace(/\\,\\%/g, "\\%");
  const usados = Object.keys(TEX_UNICODE).filter((c) => doc.includes(String.fromCodePoint(parseInt(c, 16))));
  if (!usados.length) return doc;
  const decl = "\\ifdefined\\DeclareUnicodeCharacter\n"
    + usados.map((c) => `\\DeclareUnicodeCharacter{${c}}{\\ensuremath{${TEX_UNICODE[c]}}}`).join("\n") + "\n\\fi\n";
  return doc.replace(/(\\usepackage\[T1\]\{fontenc\}\r?\n)/, `$1${decl}`);
}

// ---------------------------------------------------------------------------
// Formato de la memoria .tex, al estilo de una memoria hecha a mano: una ecuación por
// línea, la expresión general sobre el reemplazo numérico, los pasos encabezados en
// negrita como viñetas y "¡CUMPLE!" al cerrar cada verificación.
// ---------------------------------------------------------------------------
// Posiciones de los "=" de nivel superior (fuera de llaves y de \left ... \right)
function igualdadesTop(s) {
  const pos = []; let nivel = 0, lr = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") {
      if (s.startsWith("\\left", i) && !/[a-zA-Z]/.test(s[i + 5] || "")) { lr++; i += 4; continue; }
      if (s.startsWith("\\right", i) && !/[a-zA-Z]/.test(s[i + 6] || "")) { lr--; i += 5; continue; }
      i++;   // salta el carácter siguiente: \{ \, \; no cuentan como llaves ni signos
      continue;
    }
    if (c === "{") nivel++;
    else if (c === "}") nivel--;
    else if (c === "=" && nivel === 0 && lr === 0) pos.push(i);
  }
  return pos;
}
// "X = fórmula = valores = resultado" (larga) → fórmula en la primera línea y valores en la segunda
function partirEcuacion(s) {
  if (s.length < 60 || /\\begin|&/.test(s)) return s;
  const p = igualdadesTop(s);
  if (p.length < 2) return s;
  const gen = s.slice(p[0] + 1, p[1]);
  const letras = gen.replace(/\\[a-zA-Z]+/g, "").replace(/\\./g, "");
  if (!/[A-Za-z]/.test(letras)) return s;   // la primera igualdad ya es numérica
  // "V_s = 0 \le V_{s,max} = ...": el primer tramo ya compara; partirlo cambiaría el sentido
  if (/\\(le|leq|ge|geq)(?![a-zA-Z])|\\Rightarrow|\\rightarrow|<|>/.test(gen)) return s;
  return `\\begin{aligned}\n${s.slice(0, p[0]).trim()} &= ${gen.trim()}\\\\\n&= ${s.slice(p[1] + 1).trim()}\n\\end{aligned}`;
}
// Comparación final contra 1 (razón demanda/capacidad) → "¡CUMPLE!" o "¡NO CUMPLE!"
function marcaVerificacion(s) {
  const m = s.match(/(\\le|\\leq|<|>|\\ge|\\geq)\s*(?:\\;)?\s*1(?:\{,\}0)?\s*$/);
  if (!m) return s;
  const ok = ["\\le", "\\leq", "<"].includes(m[1]);
  return s + (ok ? "\\hspace{2em}\\textbf{¡CUMPLE!}" : "\\hspace{2em}\\textbf{¡NO CUMPLE!}");
}
// Ecuación del .tex: cada igualdad unida por \qquad o \quad va en su propia línea
function texDisplay(s, ref) {
  const piezas = separarQquad(s);
  return piezas.map((p, i) => {
    const tag = ref && i === piezas.length - 1 ? `\\tag*{(${ref})}` : "";
    return `\\[\n${partirEcuacion(marcaVerificacion(p.trim()))}${tag}\n\\]`;
  }).join("\n");
}
// Párrafos que empiezan en negrita ("\textbf{Fluencia:} ...") se vuelven viñetas; el texto y
// las ecuaciones que les siguen quedan dentro de la viñeta hasta el próximo título.
function memoTexP(m, s) {
  if (/^\s*\\textbf\{/.test(s)) {
    if (!m.lista) { m.tex.push("\\begin{itemize}"); m.lista = true; }
    m.tex.push("\\item " + s.trim() + "\n");
  } else m.tex.push(s + "\n");
}
function memoTexCerrar(m) {
  if (m.lista) { m.tex.push("\\end{itemize}"); m.lista = false; }
}
// Preámbulo común: sin sangría, párrafos separados y viñetas cuadradas
const TEX_ESTILO = String.raw`\setlength{\parindent}{0pt}
\setlength{\parskip}{5pt}
\renewcommand{\labelitemi}{\tiny$\blacksquare$}
\renewcommand{\labelitemii}{\textbullet}`;

// Texto LaTeX de un párrafo → HTML; las fórmulas $...$ quedan marcadas para KaTeX.
function texParrafo(s) {
  const partes = s.trim().split(/(\$[^$]+\$)/);
  return partes.map((p) => {
    if (p.startsWith("$") && p.length > 1) return `<span class="km" data-tex="${encodeURIComponent(p.slice(1, -1))}"></span>`;
    return p.replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/\\textbf\{([^}]*)\}/g, "<b>$1</b>").replace(/\\textit\{([^}]*)\}/g, "<i>$1</i>")
      .replace(/\\%/g, "%").replace(/\{,\}/g, ",").replace(/\\,/g, " ").replace(/\\ /g, " ")
      .replace(/---/g, "—").replace(/--/g, "–").replace(/~/g, " ");
  }).join("");
}

// Ecuación en bloque: separa la etiqueta \tag*{(ref)} para mostrarla a la derecha.
function texEcuacion(s) {
  const m = s.match(/\\tag\*\{\(([^}]*)\)\}\s*$/);
  const cuerpo = m ? s.slice(0, m.index) : s;
  const ref = m ? `<span class="kref">(${m[1]})</span>` : "";
  return separarQquad(cuerpo).map((c, i, a) =>
    `<div class="kd"><span class="km" data-display="1" data-tex="${encodeURIComponent(c.trim())}"></span>${i === a.length - 1 ? ref : ""}</div>`).join("");
}

// En pantalla, igualdades unidas por \qquad o \quad (fuera de llaves y entornos) van en líneas separadas.
function separarQquad(s) {
  if (/\\begin/.test(s)) return [s];
  const out = []; let nivel = 0, ini = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") nivel++;
    else if (s[i] === "}") nivel--;
    else if (nivel === 0 && s.startsWith("\\qquad", i)) { out.push(s.slice(ini, i)); ini = i + 6; i += 5; }
    else if (nivel === 0 && s.startsWith("\\quad", i)) { out.push(s.slice(ini, i)); ini = i + 5; i += 4; }
  }
  out.push(s.slice(ini));
  return out.filter((c) => c.trim());
}

async function dibujarTex(raiz) {
  const ok = await cargarKatex();
  raiz.querySelectorAll(".km:not([data-ok])").forEach((el) => {
    const tex = decodeURIComponent(el.dataset.tex);
    el.dataset.ok = "1";
    if (ok && window.katex) {
      try { katex.render(tex, el, { displayMode: !!el.dataset.display, throwOnError: false, strict: false }); return; } catch (e) { /* texto plano */ }
    }
    el.textContent = tex;
    el.classList.add("crudo");
  });
}

// out: lista de items del Memo — texto HTML (títulos, notas), {k, v, ref} (filas) o {tex, eq} (LaTeX).
// Agrupa las filas y el LaTeX entre títulos en un paso desplegable.
function memoHTML(out) {
  let s = "", filas = "", tex = "";
  const cerrar = () => {
    if (filas) {
      s += tex
        ? `<div class="paso"><table class="calc clic" title="Pinchar para ver las ecuaciones">${filas}</table><div class="eqs hidden">${tex}</div></div>`
        : `<table class="calc">${filas}</table>`;
    } else if (tex) {
      s += `<div class="paso"><button type="button" class="vereq">Ver ecuaciones</button><div class="eqs hidden">${tex}</div></div>`;
    }
    filas = ""; tex = "";
  };
  for (const it of out) {
    if (typeof it === "string") {
      if (/^<h[34]/.test(it)) { cerrar(); s += it; }
      else { // nota: queda visible junto a las filas del paso
        if (filas) filas += `<tr><td colspan="2">${it}</td></tr>`;
        else { cerrar(); s += it; }
      }
    } else if (it.tex !== undefined) {
      tex += it.eq ? texEcuacion(it.tex) : `<p>${texParrafo(it.tex)}</p>`;
    } else {
      const flecha = '<span class="chev">▸</span>';
      filas += `<tr><td class="k">${filas ? "" : flecha}${it.k}${it.ref ? `<span class="ref">${it.ref}</span>` : ""}</td><td class="v">${it.v}</td></tr>`;
    }
  }
  cerrar();
  return s;
}

function alternarPaso(paso, abrir) {
  const eqs = paso.querySelector(".eqs");
  const ab = abrir === undefined ? eqs.classList.contains("hidden") : abrir;
  eqs.classList.toggle("hidden", !ab);
  paso.classList.toggle("abierto", ab);
  const b = paso.querySelector(".vereq");
  if (b) b.textContent = ab ? "Ocultar ecuaciones" : "Ver ecuaciones";
  if (ab) dibujarTex(eqs);
}

// Botón sobre cada memoria: abre todos los pasos (o los cierra si ya están todos abiertos).
function botonTodas(id) {
  const memo = document.getElementById(id);
  if (!memo) return;
  const b = document.createElement("button");
  b.type = "button"; b.className = "todasEq"; b.textContent = "Mostrar / ocultar todas las ecuaciones";
  b.addEventListener("click", () => {
    const pasos = [...memo.querySelectorAll(".paso")];
    const abrir = pasos.some((p) => !p.classList.contains("abierto"));
    pasos.forEach((p) => alternarPaso(p, abrir));
  });
  memo.parentNode.insertBefore(b, memo);
}
// Al recalcular, la memoria se vuelve a generar: se reabren los pasos que estaban abiertos.
const abiertos = {};
function recordar(cont) {
  abiertos[cont.id] = [...cont.querySelectorAll(".paso")].map((p) => p.classList.contains("abierto"));
}
document.addEventListener("DOMContentLoaded", () => {
  ["memo", "lmemo"].forEach(botonTodas);
  ["memo", "lmemo", "pasosR", "pasosU"].forEach((id) => {
    const cont = document.getElementById(id);
    if (!cont) return;
    cont.addEventListener("click", () => setTimeout(() => recordar(cont)));
    cont.previousElementSibling?.classList?.contains("todasEq") && cont.previousElementSibling.addEventListener("click", () => recordar(cont));
    new MutationObserver(() => {
      const est = abiertos[cont.id] || [];
      cont.querySelectorAll(".paso").forEach((p, i) => { if (est[i] && !p.classList.contains("abierto")) alternarPaso(p, true); });
    }).observe(cont, { childList: true });
  });
});

document.addEventListener("click", (ev) => {
  const t = ev.target.closest(".paso > table.clic, .paso > .vereq");
  if (t) alternarPaso(t.parentElement);
});

(function estilos() {
  const st = document.createElement("style");
  st.textContent = `
  .paso { margin: 0; }
  .paso > table.clic { cursor: pointer; }
  .paso > table.clic:hover td { background: #f6f9f8; }
  .chev { display: inline-block; width: 1em; color: var(--accent, #2f7d6d); transition: transform .15s; }
  .paso.abierto .chev { transform: rotate(90deg); }
  .eqs { margin: 4px 0 10px; padding: 8px 12px; background: #f3f7f6; border-left: 3px solid var(--accent, #2f7d6d); border-radius: 4px; font-size: 13px; overflow-x: auto; }
  .eqs p { margin: 6px 0; }
  .kd { display: flex; align-items: center; gap: 10px; margin: 4px 0; }
  .kd > .km { flex: 1; min-width: 0; }
  .kd .katex-display { margin: 4px 0; padding: 3px 0; overflow-x: auto; overflow-y: hidden; text-align: left; }
  .kd .katex-display > .katex { text-align: left; }
  .eqs .katex { font-size: 1.08em; }
  .kref { color: var(--muted, #5f6b7a); font-size: 12px; white-space: nowrap; }
  input.invalido, select.invalido { border-color: #c0392b !important; background: #fdecea !important; }
  .km.crudo { font-family: Consolas, monospace; font-size: 12px; white-space: pre-wrap; }
  .vereq, .todasEq { font: inherit; font-size: 12.5px; padding: 4px 10px; border: 1px solid var(--accent, #2f7d6d); color: var(--accent, #2f7d6d); background: #fff; border-radius: 4px; cursor: pointer; }
  .todasEq { margin: 10px 16px 0; }
  @media print { .todasEq, .vereq, .chev { display: none; } }
  `;
  document.head.appendChild(st);
})();
