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

// Promesa con el usuario de la sesión. Sin librería (primera visita sin conexión) se trabaja en modo local.
const sesionLista = (async () => {
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    usuarioActual = data.session?.user || null;
  } catch { usuarioActual = null; }
  if (!usuarioActual && !esPaginaAcceso) {
    location.replace(`login.html?volver=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}`);
    return new Promise(() => {});        // se detiene mientras redirige
  }
  document.documentElement.style.visibility = "";
  return usuarioActual;
})();

async function cerrarSesion() {
  if (sb) await sb.auth.signOut();
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
