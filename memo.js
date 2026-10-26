// Memoria de cálculo desplegable (compartida por acero, hormigón, madera y espectros).
// Cada paso muestra sus resultados; al pincharlo se despliegan las ecuaciones con
// los valores reemplazados (las mismas del informe .tex), dibujadas con KaTeX.
"use strict";

const KATEX = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/";
let katexListo = null;
function cargarKatex() {
  if (katexListo) return katexListo;
  katexListo = new Promise((ok) => {
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = KATEX + "katex.min.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = KATEX + "katex.min.js";
    js.onload = () => ok(true);
    js.onerror = () => ok(false);
    document.head.appendChild(js);
  });
  return katexListo;
}

// Texto LaTeX de un párrafo → HTML; las fórmulas $...$ quedan marcadas para KaTeX.
function texParrafo(s) {
  const partes = s.trim().split(/(\$[^$]+\$)/);
  return partes.map((p) => {
    if (p.startsWith("$") && p.length > 1) return `<span class="km" data-tex="${encodeURIComponent(p.slice(1, -1))}"></span>`;
    return p.replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/\\textbf\{([^}]*)\}/g, "<b>$1</b>").replace(/\\textit\{([^}]*)\}/g, "<i>$1</i>")
      .replace(/\\%/g, "%").replace(/---/g, "—").replace(/--/g, "–").replace(/~/g, " ");
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
  .km.crudo { font-family: Consolas, monospace; font-size: 12px; white-space: pre-wrap; }
  .vereq, .todasEq { font: inherit; font-size: 12.5px; padding: 4px 10px; border: 1px solid var(--accent, #2f7d6d); color: var(--accent, #2f7d6d); background: #fff; border-radius: 4px; cursor: pointer; }
  .todasEq { margin: 10px 16px 0; }
  @media print { .todasEq, .vereq, .chev { display: none; } }
  `;
  document.head.appendChild(st);
})();
