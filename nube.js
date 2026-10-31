// Conexión con Supabase (usuarios y proyectos en la nube). Se carga en el <head> de todas las páginas,
// después de la librería supabase-js. Sin sesión, las páginas redirigen a login.html.
// La clave publicable es pública por diseño: la protección la dan las reglas por fila (RLS) del esquema.
"use strict";
const SUPABASE_URL = "https://olrrwjwmcrezpnigybwo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Zr1WEb3QFTx9TCr8hZALPg_-F9VX-l6";
const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
let usuarioActual = null;
const esPaginaAcceso = /login\.html$/.test(location.pathname);
const baseApp = location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");

// La página queda oculta hasta confirmar la sesión (evita mostrar el programa sin acceso)
if (sb && !esPaginaAcceso) document.documentElement.style.visibility = "hidden";

// Usuario de la última sesión guardada en este navegador (para trabajar sin conexión con el token vencido)
function usuarioGuardado() {
  try {
    const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
    const s = JSON.parse(localStorage.getItem(`sb-${ref}-auth-token`) || "null");
    return s && s.user ? s.user : null;
  } catch { return null; }
}
let sinConexion = false;
// Promesa con el usuario de la sesión. Sin librería (primera visita sin conexión) se trabaja en modo local.
const sesionLista = (async () => {
  if (!sb) return null;
  try {
    // Tiempo máximo: sin red, el refresco del token podría quedar colgado y la página oculta
    const r = await Promise.race([sb.auth.getSession(), new Promise((_, mal) => setTimeout(() => mal(new Error("tiempo agotado")), 6000))]);
    usuarioActual = r.data.session?.user || null;
  } catch { usuarioActual = null; }
  // Sin conexión no se puede refrescar un token vencido: se mantiene el acceso con la sesión guardada (las calculadoras funcionan;
  // los proyectos en la nube quedan disponibles al volver la conexión)
  if (!usuarioActual && !navigator.onLine) { usuarioActual = usuarioGuardado(); sinConexion = !!usuarioActual; }
  if (!usuarioActual && !esPaginaAcceso) {
    location.replace(`login.html?volver=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}`);
    return new Promise(() => {});        // se detiene mientras redirige
  }
  document.documentElement.style.visibility = "";
  return usuarioActual;
})();

async function cerrarSesion() {
  try { if (sb) await sb.auth.signOut(); } catch { /* sin conexión: igual se borra la sesión local */ }
  // Datos de la sesión en este navegador (equipos compartidos)
  for (const k of ["auraProyectoActivo", "auraPanelAbierto", "auraCalculista", "auraOficina"]) { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } }
  location.replace("login.html");
}
// Mensajes de error de Supabase en español
function errorEnEspanol(e) {
  const m = (e && (e.message || e.error_description || String(e))) || "";
  if (/Invalid login credentials/i.test(m)) return "Correo o contraseña incorrectos.";
  if (/Email not confirmed/i.test(m)) return "Debe confirmar su correo antes de iniciar sesión. Revise su bandeja de entrada.";
  if (/already registered|already been registered/i.test(m)) return "Ya existe una cuenta con ese correo.";
  if (/Password should be at least (\d+)/i.test(m)) return `La contraseña debe tener al menos ${m.match(/at least (\d+)/i)[1]} caracteres.`;
  if (/rate limit|too many/i.test(m)) return "Demasiados intentos. Espere unos minutos e intente nuevamente.";
  if (/Unable to validate email|invalid format/i.test(m)) return "El correo no es válido.";
  if (/Failed to fetch|NetworkError|network/i.test(m)) return "No hay conexión con el servidor. Revise su conexión a internet.";
  return m || "Ocurrió un error inesperado.";
}
