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
  // Memorias con punto como separador decimal: "12{,}5" → "12.5" (los miles quedan con espacio fino "\,")
  doc = doc.replace(/\{,\}/g, ".");
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
  table.comb { width: 100%; min-width: 680px; border-collapse: collapse; font-size: 12.5px; margin: 6px 0; }
  table.comb td:first-child { white-space: nowrap; }
  table.comb td:nth-child(2) { min-width: 190px; }
  table.comb th, table.comb td { border-bottom: 1px solid #e3e7ec; padding: 5px 6px; text-align: left; vertical-align: top; }
  table.comb th { font-weight: 600; background: rgba(47,125,109,.08); }
  table.comb td.num { text-align: right; white-space: nowrap; }
  table.comb tr.sel td { background: rgba(42,111,176,.12); font-weight: 600; }
  .combWrap { overflow-x: auto; }
  .critTag { display: inline-block; font-size: 11px; font-weight: 700; color: #fff; background: #c0392b; border-radius: 3px; padding: 0 5px; margin-left: 4px; }
  .selTag { display: inline-block; font-size: 11px; font-weight: 700; color: #fff; background: #2a6fb0; border-radius: 3px; padding: 0 5px; margin-left: 4px; }
  @media print { .todasEq, .vereq, .chev { display: none; } }
  `;
  document.head.appendChild(st);
})();

// ---------------------------------------------------------------------------
// Combinaciones de carga para columnas y pies derechos (madera aserrada y MLE)
// Cada combinación usa el K_D de su carga de menor duración (NCh 1198, Anexo G).
// d: qPP, qSCp, qSCt, KDpp, KDsc, KDt, KDv.
// ---------------------------------------------------------------------------
const COMBINACIONES = [
  { n: "C1", inc: ["PP"], kd: "KDpp", kdTxt: "permanente" },
  { n: "C2", inc: ["PP", "SCp"], kd: "KDsc", kdTxt: "SC de piso" },
  { n: "C3", inc: ["PP", "SCp", "SCt"], kd: "KDt", kdTxt: "SC de techo" },
  { n: "C4", inc: ["PP", "SCp", "V"], kd: "KDv", kdTxt: "viento" },
  { n: "C5", inc: ["PP", "SCp", "SCt", "V"], kd: "KDv", kdTxt: "viento" },
];
const COMB_HTML = { PP: "PP", SCp: "SC<sub>piso</sub>", SCt: "SC<sub>techo</sub>", V: "V" };
const COMB_TEX = { PP: "PP", SCp: "SC_{piso}", SCt: "SC_{techo}", V: "V" };
const COMB_DESC = { PP: "peso propio", SCp: "sobrecarga de piso", SCt: "sobrecarga de techo", V: "viento" };
function combinaciones(d, conViento) {
  return COMBINACIONES.filter(c => conViento || !c.inc.includes("V")).map(c => {
    const desc = c.inc.map(k => COMB_DESC[k]);
    return {
      n: c.n, inc: c.inc, kdTxt: c.kdTxt, KD: d[c.kd], viento: c.inc.includes("V"),
      txt: c.inc.map(k => COMB_HTML[k]).join(" + "),
      tex: c.inc.map(k => COMB_TEX[k]).join(" + "),
      desc: (desc.length > 1 ? desc.slice(0, -1).join(", ") + " y " + desc.at(-1) : desc[0]).replace(/^./, s => s.toUpperCase()),
      q: (c.inc.includes("PP") ? d.qPP : 0) + (c.inc.includes("SCp") ? d.qSCp : 0) + (c.inc.includes("SCt") ? d.qSCt : 0),
    };
  });
}
// Opciones del selector "Combinación a analizar"; las con viento se deshabilitan si el viento es nulo
function opcionesCombinacion(sel, conViento) {
  const v = sel.value || "auto";
  sel.innerHTML = `<option value="auto">Crítica (automática)</option>` + COMBINACIONES.map(c =>
    `<option value="${c.n}"${!conViento && c.inc.includes("V") ? " disabled" : ""}>${c.n} — ${c.inc.map(k => k === "SCp" ? "SC piso" : k === "SCt" ? "SC techo" : k).join(" + ")}</option>`).join("");
  sel.value = !conViento && COMBINACIONES.find(c => c.n === v)?.inc.includes("V") ? "auto" : v;
}
// c.max: mayor razón del elemento en la combinación (compresión paralela y, con viento, flexión, cizalle e interacción)
function elegirCombinacion(combos, valor) {
  const crit = combos.reduce((a, c) => (c.max > a.max ? c : a));
  return { sel: combos.find(c => c.n === valor) || crit, crit };
}
// Combinaciones que se desarrollan completas en la memoria .tex: C2 a C5 (y C1 solo si resulta crítica)
function combosMemoria(combos, crit) {
  return combos.filter(c => c.n !== "C1" || c === crit);
}
// Tabla resumen de combinaciones: en pantalla todas (marca la analizada); en el .tex las de la memoria (cT).
// s: símbolos { f, F, ftex, Ftex }
function tablaCombinaciones(m, combos, sel, crit, elemento, s, cT = combos) {
  const hayV = combos.some(c => c.viento);
  const f3 = (x) => (Number.isFinite(x) ? fmt(x, 3) : "∞");
  m.out.push(`<div class="combWrap"><table class="comb"><tr><th>Comb.</th><th>Incluye</th><th>K<sub>D</sub></th><th>P [kgf]</th><th>${s.f} [kgf/cm²]</th><th>${s.F} [kgf/cm²]</th><th>${s.f}/${s.F}</th>${hayV ? "<th>Flexocomp.</th>" : ""}<th>Razón máx.</th></tr>` +
    combos.map(c => `<tr${c === sel ? ' class="sel"' : ""}><td>${c.n}${c === crit ? '<br><span class="critTag">crítica</span>' : ""}${c === sel ? '<br><span class="selTag">analizada</span>' : ""}</td>` +
      `<td>${c.txt}<div class="unit">${c.desc}; K<sub>D</sub> de ${c.kdTxt}</div></td><td class="num">${fmt(c.KD, 2)}</td><td class="num">${fmt(c.P, 1)}</td>` +
      `<td class="num">${fmt(c.fc, 2)}</td><td class="num">${fmt(c.Fcl, 2)}</td><td class="num">${fmt(c.ratio, 3)}</td>` +
      (hayV ? `<td class="num">${c.viento ? f3(c.inter) : "—"}</td>` : "") + `<td class="num">${f3(c.max)}</td></tr>`).join("") +
    `</table></div><div class="unit" style="margin-top:4px">Combinación crítica: <b>${crit.n}</b> (razón máxima ${f3(crit.max)}). Combinación analizada: <b>${sel.n}</b>. La razón máxima de cada combinación es la de compresión paralela${hayV ? " o, en las combinaciones con viento, la mayor entre compresión paralela, flexión, cizalle y flexocompresión" : ""}.${hayV ? "" : " Sin viento no se generan las combinaciones C4 y C5."}</div>`);
  const t3 = (x) => (Number.isFinite(x) ? tn(x, 3) : L`$\infty$`);
  const hayVT = cT.some(c => c.viento);
  const lista = cT.map(c => c.n).join(", ").replace(/, ([^,]*)$/, " y $1");
  memoTexCerrar(m);
  m.tex.push(L`\begin{table}[H]
\centering\footnotesize\setlength{\tabcolsep}{4pt}
\caption{Resumen de las combinaciones de carga ${elemento} (${lista}): tensiones de trabajo ($${s.ftex}$) y de diseño con pandeo ($${s.Ftex}$) en kgf/cm$^2$. Combinación crítica: ${crit.n}.}
\begin{tabular}{ll${"r".repeat(hayVT ? 7 : 6)}}
\toprule
Comb. & Incluye & $K_D$ & $P$ [kgf] & $${s.ftex}$ & $${s.Ftex}$ & Comp. par. & ${hayVT ? "Flexocomp. & " : ""}Razón máx.\\
\midrule
${cT.map(c => `${c === crit ? `\\textbf{${c.n}} (crítica)` : c.n} & $${c.tex}$ & ${tn(c.KD, 2)} & ${tn(c.P, 1)} & ${tn(c.fc, 3)} & ${tn(c.Fcl, 2)} & ${tn(c.ratio, 3)} & ${hayVT ? `${c.viento ? t3(c.inter) : "---"} & ` : ""}${t3(c.max)}\\\\`).join("\n")}
\bottomrule
\end{tabular}
\end{table}
`);
  m.tex.push(L`Cada combinación usa el $K_D$ de su carga de menor duración. La razón máxima de cada combinación es la de compresión paralela${hayVT ? " o, en las combinaciones con viento, la mayor entre compresión paralela, flexión, cizalle y flexocompresión" : ""}. La combinación crítica es ${crit.n} (${crit.desc.toLowerCase()}). En las secciones siguientes se desarrollan completas las verificaciones de las combinaciones ${lista}${hayVT ? "; las verificaciones por viento corresponden a las combinaciones que lo incluyen" : ""}.
`);
}
