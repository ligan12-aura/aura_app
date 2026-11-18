# -*- coding: utf-8 -*-
"""
structura_etabs.py — Extrae de ETABS los datos para la memoria de cálculo del edificio en structura.

Uso (Windows, con ETABS 22 abierto y el modelo ya analizado):

    python structura_etabs.py                   # deja <modelo>.structura.json.gz junto al .EDB
    python structura_etabs.py --salida C:\\Temp  # en otra carpeta (o con otro nombre .json.gz)
    python structura_etabs.py --sin-nudos       # sin desplazamientos de nudos (más liviano)
    python structura_etabs.py --sin-elementos   # sin esfuerzos de vigas, columnas, diagonales y reacciones

Requiere Python 3 y la librería comtypes (python -m pip install comtypes).

Qué hace:
  1. Se conecta a la instancia de ETABS abierta (API OAPI de CSI, ETABSv1).
  2. Revisa que los casos estén analizados.
  3. Lee el modelo completo desde el archivo .$et que ETABS escribe al guardar.
  4. Lee las tablas de resultados (como "Show Tables") con sus unidades.
  5. Lee por la API de resultados, con precisión completa: modos, masa participante, reacciones
     basales, drifts, desplazamientos de los centros de masa y de los nudos del modelo.
  6. Escribe un único archivo JSON comprimido con gzip, que se sube a structura.

No modifica el modelo: no analiza, no guarda y deja las unidades, la selección de casos de las
tablas y la opción de modos como estaban, aunque falle a mitad. Los resultados se piden en tonf, m y s.
Las rutas de archivos de su equipo (C:\\Users\\…) se reemplazan por el nombre del archivo.
"""

import argparse
import datetime
import gzip
import json
import math
import os
import re
import sys
import time
import traceback

VERSION_FORMATO = 1
UNIDADES_TONF_M = 12  # eUnits.Ton_m_C
ELEMENTO, GRUPO = 1, 2  # eItemTypeElm

# Tipos de caso de la API (eLoadCaseType)
TIPO_CASO = {1: "Lineal estático", 2: "No lineal estático", 3: "Modal", 4: "Espectro de respuesta",
             5: "Tiempo-historia lineal modal", 6: "Tiempo-historia no lineal modal",
             7: "Tiempo-historia lineal directo", 8: "Tiempo-historia no lineal directo",
             9: "Estado de movimiento", 10: "Pandeo", 11: "Estado estacionario",
             12: "Densidad espectral de potencia", 13: "Estático lineal multipaso",
             14: "Hiperestático", 15: "Modal externo"}
ESTADO_CASO = {1: "No corrido", 2: "No se pudo comenzar", 3: "No terminó", 4: "Terminado"}

# Tablas (nombre exacto en "Show Tables"). Las de diseño se buscan por prefijo, porque su nombre
# incluye la norma (por ejemplo "Concrete Column Summary - ACI 318-19").
TABLAS = [
    # Modal
    "Modal Periods And Frequencies", "Modal Participating Mass Ratios", "Modal Participation Factors",
    "Modal Load Participation Ratios", "Modal Direction Factors", "Response Spectrum Modal Info",
    # Estructura
    "Mass Summary by Story", "Mass Summary by Diaphragm", "Centers Of Mass And Rigidity",
    "Story Forces", "Base Reactions", "Story Drifts", "Story Max Over Avg Drifts",
    "Story Max Over Avg Displacements", "Diaphragm Center Of Mass Displacements",
    "Diaphragm Max Over Avg Drifts", "Story Stiffness", "Story Accelerations",
    # Definiciones con nombres únicos y coordenadas (para dibujar sin depender del .$et)
    "Load Case Definitions - Summary", "Load Combination Definitions", "Mass Source Definition",
    "Load Case Definitions - Response Spectrum", "Functions - Response Spectrum - User Defined",
    "Functions - Response Spectrum - From File", "Story Definitions",
    "Point Object Connectivity", "Column Object Connectivity", "Beam Object Connectivity",
    "Brace Object Connectivity", "Wall Object Connectivity", "Floor Object Connectivity",
    "Pier Section Properties", "Spandrel Section Properties",
    # Muros
    "Pier Forces", "Spandrel Forces",
]
TABLAS_ELEMENTOS = ["Element Forces - Columns", "Element Forces - Beams", "Element Forces - Braces",
                    "Joint Reactions"]
PREFIJOS_DISENO = ["Concrete Column Summary", "Concrete Beam Summary", "Concrete Joint Summary",
                   "Shear Wall Pier Summary", "Shear Wall Spandrel Summary",
                   "Steel Frame Design Summary", "Composite Beam Summary", "Composite Column Summary"]

# Rutas de Windows (C:\… o \\servidor\…): se dejan solo con el nombre del archivo
RUTA_EXT = re.compile(r"(?:[A-Za-z]:|\\\\[^\\\s\"]+)\\[^\"\r\n]*?([^\\\"\r\n]+\.(?:\$et|edb|e2k|txt|csv|xlsx?|dat))",
                      re.IGNORECASE)
RUTA_ENTRE_COMILLAS = re.compile(r"\"(?:[A-Za-z]:|\\\\)\\(?:[^\"\\]*\\)*([^\"\\]*)\"")


class ErrorUsuario(Exception):
    """Error con un mensaje para el usuario (sin traza)."""


avisos = []


def avisar(texto):
    print("  ! " + texto)
    avisos.append(texto)


def sin_rutas(texto):
    if not isinstance(texto, str):
        return texto
    texto = RUTA_EXT.sub(lambda m: m.group(1), texto)
    return RUTA_ENTRE_COMILLAS.sub(lambda m: '"' + m.group(1) + '"', texto)


def conectar():
    try:
        import comtypes
        import comtypes.client
    except ImportError:
        raise ErrorUsuario("Falta la librería comtypes. Instálela con:  python -m pip install comtypes")
    try:
        helper = comtypes.client.CreateObject("ETABSv1.Helper")
        import comtypes.gen.ETABSv1 as ETABSv1
        helper = helper.QueryInterface(ETABSv1.cHelper)
    except (OSError, ImportError, comtypes.COMError):
        raise ErrorUsuario("No se encontró la API de ETABS. Instale ETABS 22 o ejecute RegisterETABS.exe "
                           "desde su carpeta de instalación.")
    try:
        etabs = helper.GetObject("CSI.ETABS.API.ETABSObject")
        if etabs is None:
            raise OSError
    except (OSError, comtypes.COMError):
        raise ErrorUsuario("No hay un ETABS abierto. Abra el modelo en ETABS, analícelo y vuelva a ejecutar.")
    return etabs.SapModel


def nombres(lista_api):
    """Las funciones GetNameList entregan [n, (nombres...), ret]."""
    return [x for x in lista_api[1][:lista_api[0]] if x] if lista_api and lista_api[0] else []


def a_tabla(res, campos, nombre):
    """Convierte la salida de una función de Results (arreglos paralelos) en {campos, filas}.
    Devuelve None (con aviso) si ETABS informa un error o si el número de columnas no calza,
    para no guardar columnas corridas."""
    if res[-1] != 0:
        avisar("ETABS no entregó «%s» (código %s)." % (nombre, res[-1]))
        return None
    n = res[0]
    arreglos = [x for x in res[1:-1] if isinstance(x, (tuple, list))]
    if len(arreglos) != len(campos):
        avisar("«%s» llegó con %d columnas y se esperaban %d: no se guarda." % (nombre, len(arreglos), len(campos)))
        return None
    return {"campos": campos, "filas": [[a[i] for a in arreglos] for i in range(n)]}


def leer_tabla(dt, clave):
    _, version, campos, n, datos, ret = dt.GetTableForDisplayArray(clave, [], "All")
    if ret != 0 or not n:
        return None
    campos = list(campos)
    nom, uni = {}, {}
    d = dt.GetAllFieldsInTable(clave)
    if d[-1] == 0 and d[2]:
        nom = dict(zip(d[2], d[3]))
        uni = dict(zip(d[2], d[5]))
    nc = len(campos)
    return {
        "version": version,
        "campos": campos,
        "nombres": [nom.get(c, c) for c in campos],
        "unidades": [uni.get(c, "") or "" for c in campos],
        "filas": [[sin_rutas(x) for x in datos[i * nc:(i + 1) * nc]] for i in range(n)],
    }


def seleccionar(S, casos=(), combos=()):
    S.DeselectAllCasesAndCombosForOutput()
    for c in casos:
        S.SetCaseSelectedForOutput(c)
    for c in combos:
        S.SetComboSelectedForOutput(c)


def limpiar_numeros(x):
    """JSON.parse del navegador no acepta NaN ni Infinity."""
    if isinstance(x, float) and not math.isfinite(x):
        return None
    if isinstance(x, list):
        return [limpiar_numeros(v) for v in x]
    if isinstance(x, dict):
        return {k: limpiar_numeros(v) for k, v in x.items()}
    return x


def leer_et(ruta):
    with open(ruta, "rb") as f:
        crudo = f.read()
    for cod in ("utf-8-sig", "cp1252"):
        try:
            return crudo.decode(cod), cod
        except UnicodeDecodeError:
            pass
    return crudo.decode("latin-1"), "latin-1"


def extraer(m, args, archivo):
    """Lee tablas y resultados. Supone las unidades ya fijadas en tonf-m."""
    dt, R = m.DatabaseTables, m.Results
    S = R.Setup

    # Casos y combinaciones
    estado = m.Analyze.GetCaseStatus()
    casos_estado = dict(zip(estado[1][:estado[0]], estado[2][:estado[0]])) if estado[0] else {}
    casos = []
    for c in nombres(m.LoadCases.GetNameList()):
        t = m.LoadCases.GetTypeOAPI_1(c)
        casos.append({"nombre": c, "tipo": TIPO_CASO.get(t[0], str(t[0])), "codigo_tipo": t[0],
                      "estado": ESTADO_CASO.get(casos_estado.get(c), "Desconocido")})
    combos = nombres(m.RespCombo.GetNameList())
    corridos = [c["nombre"] for c in casos if c["estado"] == "Terminado"]
    modales = [c["nombre"] for c in casos if c["codigo_tipo"] == 3 and c["estado"] == "Terminado"]
    sismicos = [c["nombre"] for c in casos if c["codigo_tipo"] == 4 and c["estado"] == "Terminado"]
    if not modales:
        avisar("El modelo no tiene un caso modal analizado.")
    if not sismicos:
        avisar("El modelo no tiene casos de espectro de respuesta analizados.")

    # Tablas, con todos los casos y combinaciones a la vista
    print("Leyendo tablas…")
    dt.SetLoadCasesSelectedForDisplay(corridos)
    dt.SetLoadCombinationsSelectedForDisplay(combos)
    disponibles = set(nombres(dt.GetAvailableTables()))
    lista = TABLAS + ([] if args.sin_elementos else TABLAS_ELEMENTOS)
    claves = [t for t in lista if t in disponibles]
    claves += sorted(t for t in disponibles if any(t.startswith(p) for p in PREFIJOS_DISENO))
    tablas = {}
    for clave in claves:
        try:
            tab = leer_tabla(dt, clave)
        except Exception as e:  # una tabla con problemas no debe botar toda la extracción
            avisar("No se pudo leer la tabla «%s» (%s)." % (clave, e))
            continue
        if tab:
            tablas[clave] = tab
            print("  {:<45} {:>8} filas".format(clave, len(tab["filas"])))
    defs = tablas.get("Story Definitions")
    if defs and "Tower" in defs["campos"]:
        i = defs["campos"].index("Tower")
        if len({f[i] for f in defs["filas"]}) > 1:
            avisar("El modelo tiene varias torres: los drifts de la API no indican la torre; "
                   "use las tablas, que sí la traen.")

    # Resultados con precisión completa
    print("Leyendo resultados…")
    res = {}

    def bloque(nombre, fn):
        try:
            t = fn()
            if t:
                res[nombre] = t
        except Exception as e:
            avisar("No se pudo leer «%s» (%s)." % (nombre, e))

    if modales:
        seleccionar(S, casos=modales)
        bloque("masa_participante", lambda: a_tabla(R.ModalParticipatingMassRatios(), [
            "Caso", "TipoPaso", "Modo", "Periodo", "UX", "UY", "UZ", "SumUX", "SumUY", "SumUZ",
            "RX", "RY", "RZ", "SumRX", "SumRY", "SumRZ"], "masa participante"))
        bloque("factores_participacion", lambda: a_tabla(R.ModalParticipationFactors(), [
            "Caso", "TipoPaso", "Modo", "Periodo", "UX", "UY", "UZ", "RX", "RY", "RZ",
            "MasaModal", "RigidezModal"], "factores de participación"))
        # ETABS 22 entrega StepNum = 0 en estas dos funciones: se numeran los modos por caso
        for clave in ("masa_participante", "factores_participacion"):
            cuenta = {}
            for f in res.get(clave, {}).get("filas", []):
                cuenta[f[0]] = cuenta.get(f[0], 0) + 1
                f[1], f[2] = "Mode", cuenta[f[0]]

    def basales():
        seleccionar(S, casos=corridos, combos=combos)
        r = R.BaseReact()
        t = a_tabla(r, ["Caso", "TipoPaso", "Paso", "FX", "FY", "FZ", "MX", "MY", "MZ"], "reacciones basales")
        if t:
            t["punto_momentos"] = list(r[-4:-1])  # punto donde se toman los momentos
        return t
    bloque("reacciones_basales", basales)

    def drifts():
        seleccionar(S, casos=[c for c in corridos if c not in modales], combos=combos)
        return a_tabla(R.StoryDrifts(), ["Piso", "Caso", "TipoPaso", "Paso", "Direccion", "Drift",
                                         "Punto", "X", "Y", "Z"], "drifts de piso")
    bloque("drifts", drifts)

    campos_u = ["Punto", "Elemento", "Caso", "TipoPaso", "Paso", "U1", "U2", "U3", "R1", "R2", "R3"]

    # Desplazamientos de los centros de masa (formas modales y sismo por piso)
    def centros_masa():
        cm = tablas.get("Diaphragm Center Of Mass Displacements")
        if not cm or "Point" not in cm["campos"]:
            return None
        i = cm["campos"].index("Point")
        puntos = sorted({f[i] for f in cm["filas"] if f[i]})
        seleccionar(S, casos=modales + sismicos)
        filas = []
        for p in puntos:
            # Los puntos de centro de masa los genera ETABS: se piden como elemento
            t = a_tabla(R.JointDispl(p, ELEMENTO), campos_u, "desplazamientos del centro de masa " + p)
            if t:
                filas += t["filas"]
        return {"campos": campos_u, "filas": filas}
    if modales or sismicos:
        bloque("desplazamientos_cm", centros_masa)

    # Desplazamientos de los nudos del modelo (para dibujar deformadas y modos). Solo los puntos
    # objeto de "Point Object Connectivity" (no los de la malla) y en forma compacta: una lista de
    # puntos y, por caso y paso, sus U1, U2, U3 seguidos, con 4 cifras significativas (None si
    # ETABS no entregó el punto).
    def nudos():
        conect = tablas.get("Point Object Connectivity")
        if not conect or "UniqueName" not in conect["campos"]:
            avisar("Falta la tabla «Point Object Connectivity»: no se guardan los desplazamientos de nudos.")
            return None
        j = conect["campos"].index("UniqueName")
        puntos = [f[j] for f in conect["filas"]]
        indice = {p: i for i, p in enumerate(puntos)}
        seleccionar(S, casos=modales + sismicos)
        t = a_tabla(R.JointDispl("All", GRUPO), campos_u, "desplazamientos de nudos")
        if not t:
            return None
        pasos = {}
        for f in t["filas"]:
            i = indice.get(f[0])
            if i is None:
                continue  # nudo de la malla
            clave = (f[2], f[3] or "", f[4])
            u = pasos.setdefault(clave, [None] * (3 * len(puntos)))
            u[3 * i:3 * i + 3] = [float("%.4g" % v) for v in f[5:8]]
        if not pasos:
            avisar("Ningún desplazamiento de nudo coincidió con los puntos del modelo.")
            return None
        print("  {:<45} {:>8} pasos".format("Desplazamientos de nudos", len(pasos)))
        return {"puntos": puntos,
                "pasos": [{"caso": c, "tipo_paso": tp, "paso": p, "u": u} for (c, tp, p), u in pasos.items()]}
    if not args.sin_nudos and (modales or sismicos):
        bloque("desplazamientos_nudos", nudos)

    return casos, combos, res, tablas


def restaurar(m, unidades, sel_casos, sel_combos, modos):
    """Deja ETABS como estaba; cada paso por separado para que una falla no impida los demás."""
    pasos = [
        ("unidades", lambda: m.SetPresentUnits(unidades)),
        ("selección de salida", lambda: m.Results.Setup.DeselectAllCasesAndCombosForOutput()),
        # Con la selección vacía, ETABS responde ret = 1: se deja vacía otra vez
        ("casos de las tablas", lambda: m.DatabaseTables.SetLoadCasesSelectedForDisplay(
            nombres(sel_casos) if sel_casos[-1] == 0 else [])),
        ("combinaciones de las tablas", lambda: m.DatabaseTables.SetLoadCombinationsSelectedForDisplay(
            nombres(sel_combos) if sel_combos[-1] == 0 else [])),
        ("opción de modos", lambda: modos[-1] == 0 and m.Results.Setup.SetOptionModeShape(*modos[:3])),
    ]
    for nombre, fn in pasos:
        try:
            fn()
        except Exception as e:
            print("  ! No se pudo restaurar %s en ETABS (%s). Revíselo antes de seguir." % (nombre, e))


def ruta_salida(args, base):
    nombre = os.path.basename(base) + ".structura.json.gz"
    if not args.salida:
        return base + ".structura.json.gz"
    if os.path.isdir(args.salida):
        return os.path.join(args.salida, nombre)
    return args.salida


def main():
    ap = argparse.ArgumentParser(description="Extrae de ETABS los datos para la memoria de structura.")
    ap.add_argument("--salida", help="carpeta o archivo de salida (.json.gz)")
    ap.add_argument("--sin-nudos", action="store_true", help="no incluir desplazamientos de nudos")
    ap.add_argument("--sin-elementos", action="store_true",
                    help="no incluir esfuerzos de vigas, columnas, diagonales ni reacciones en nudos")
    args = ap.parse_args()
    t0 = time.time()

    print("Conectando con ETABS…")
    m = conectar()
    archivo = m.GetModelFilename()
    if not archivo:
        raise ErrorUsuario("El modelo abierto en ETABS no está guardado. Guárdelo y analícelo antes de exportar.")
    version = m.GetVersion()[0]
    print("  Modelo: " + archivo)
    print("  ETABS " + version + "  (si hay varios ETABS abiertos, se usa uno solo: revise el modelo)")

    # Estado del análisis
    estado = m.Analyze.GetCaseStatus()
    casos_estado = dict(zip(estado[1][:estado[0]], estado[2][:estado[0]])) if estado[0] else {}
    if not casos_estado or all(e != 4 for e in casos_estado.values()):
        raise ErrorUsuario("El modelo no tiene resultados. Analícelo en ETABS (F5) y vuelva a ejecutar.")
    sin_correr = [c for c, e in casos_estado.items() if e != 4 and not c.startswith("~")]
    if sin_correr:
        avisar("Casos sin analizar: " + ", ".join(sin_correr))

    # Modelo desde el .$et
    base = os.path.splitext(archivo)[0]
    ruta_et = base + ".$et"
    texto_et, codificacion = None, None
    if os.path.exists(ruta_et):
        texto_et, codificacion = leer_et(ruta_et)
        texto_et = sin_rutas(texto_et)
        if os.path.getmtime(ruta_et) + 60 < os.path.getmtime(archivo):
            avisar("El archivo .$et es anterior al .EDB: guarde el modelo en ETABS para actualizarlo.")
    else:
        avisar("No se encontró " + os.path.basename(ruta_et) + ": guarde el modelo en ETABS para crearlo.")

    # Estado de ETABS que se cambia y se restaura
    dt, S = m.DatabaseTables, m.Results.Setup
    unidades = m.GetPresentUnits()
    sel_casos = dt.GetLoadCasesSelectedForDisplay()
    sel_combos = dt.GetLoadCombinationsSelectedForDisplay()
    modos = S.GetOptionModeShape()
    try:
        m.SetPresentUnits(UNIDADES_TONF_M)
        S.SetOptionModeShape(1, 0, True)  # todos los modos
        casos, combos, res, tablas = extraer(m, args, archivo)
    finally:
        restaurar(m, unidades, sel_casos, sel_combos, modos)

    salida = limpiar_numeros({
        "formato": "structura-etabs",
        "version": VERSION_FORMATO,
        "generado": datetime.datetime.now().isoformat(timespec="seconds"),
        "etabs": {"version": version},
        "modelo": {"archivo": os.path.basename(archivo), "et": texto_et, "codificacion_et": codificacion},
        "unidades": {"fuerza": "tonf", "largo": "m", "tiempo": "s"},
        "casos": casos,
        "combinaciones": combos,
        "resultados": res,
        "tablas": tablas,
        "avisos": avisos,
    })
    ruta = ruta_salida(args, base)
    temporal = ruta + ".tmp"
    try:
        with gzip.open(temporal, "wt", encoding="utf-8") as f:
            json.dump(salida, f, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
        os.replace(temporal, ruta)
    except OSError as e:
        try:
            os.remove(temporal)
        except OSError:
            pass
        raise ErrorUsuario("No se pudo escribir %s (%s). Use --salida con otra carpeta." % (ruta, e.strerror or e))
    mb = os.path.getsize(ruta) / 1e6
    print("Listo en {:.1f} s: {} ({:.1f} MB)".format(time.time() - t0, ruta, mb))
    print("El archivo incluye el modelo completo (nombres e información del proyecto), sin las rutas de su equipo.")
    print("Súbalo en structura, en «Memoria del edificio (ETABS)».")
    if avisos:
        print("Revise los avisos (!) de arriba: también quedan guardados en el archivo.")


def consola_propia():
    """True si la ventana se abrió solo para este script (doble clic), para pausar al final."""
    try:
        import ctypes
        lista = (ctypes.c_uint * 8)()
        return ctypes.windll.kernel32.GetConsoleProcessList(lista, 8) <= 2
    except Exception:
        return False


if __name__ == "__main__":
    codigo = 0
    try:
        main()
    except ErrorUsuario as e:
        print("\nERROR: " + str(e))
        codigo = 1
    except KeyboardInterrupt:
        print("\nCancelado.")
        codigo = 1
    except Exception:
        traceback.print_exc()
        print("\nERROR inesperado al leer ETABS. ETABS quedó con sus unidades y selección originales; "
              "envíe el texto de arriba para revisarlo.")
        codigo = 1
    if consola_propia():
        try:
            input("\nPresione Enter para cerrar…")
        except (EOFError, KeyboardInterrupt):
            pass
    sys.exit(codigo)
