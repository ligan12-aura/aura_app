# Ficha normativa: Memoria ETABS

Documenta el análisis modal espectral de un edificio modelado en ETABS y verifica sus resultados globales según la NCh 433:2026. No repite el análisis ni verifica elementos (muros, vigas, columnas, losas ni fundaciones).

Documentos: NCh 433:2026 y NCh 2369:2025 (se elige en la lista «Norma»).

## Datos de entrada

- El archivo `.structura.json.gz` lo genera el script `herramientas/structura_etabs.py` con ETABS 22 abierto y el modelo analizado. Contiene el modelo (`.$et`, sin las rutas del equipo), las tablas de «Show Tables» en tf, m y s, y resultados de la API con precisión completa: períodos y masas participantes, reacciones basales, drifts de piso, desplazamientos de los centros de masa y de los nudos del modelo.
- El archivo se procesa solo en el navegador: no se guarda en el proyecto ni se envía al asistente.
- El factor de diseño de cada dirección es la combinación que escala el caso espectral (por ejemplo SEx = 0.4172 Ex, es decir Ex/R*).

## Criterios y límites

- La página del PDF de la NCh 433:2026 es la impresa + 5.
- T* es el período del modo con mayor masa de traslación equivalente en cada dirección (6.3.4.3).
- El espectro del modelo (función × factor del caso × factor de diseño) se compara con I S A0 α / R* en los períodos de todos los modos; la razón norma/modelo es el D/C.
- El corte basal es el corte del caso espectral en la base del primer piso sobre el nivel basal, por el factor de diseño. Si es menor que Qmín, los desplazamientos de la memoria se multiplican por Qmín/Q0 (6.3.6.1).
- El desplazamiento relativo en el centro de masas se combina con CQC desde los desplazamientos relativos modales de los centros de masa de dos niveles consecutivos (Γ Sa/ω² · Δφ), dividido por la altura del piso. La escala de las formas modales se calibra con los desplazamientos de ETABS del caso; si la razón no es la misma en todos los centros de masa (± 0.1 %, por ejemplo porque el caso incluye la torsión accidental), se usa la diferencia de desplazamientos del caso, con aviso, porque puede subestimarlo. El máximo en cualquier punto es el drift de piso de ETABS.
- Los niveles sin datos y el corte basal sin el caso en el nivel basal quedan SIN VERIFICAR. Los modelos con varias torres no se calculan.
- Sin diafragmas, la torsión accidental queda SIN VERIFICAR. Mientras no se verifique, los desplazamientos del resumen dicen «Cumple sin torsión accidental».
- La comparación de espectros admite 0.1 % por el redondeo del factor de la combinación.
- Torsión accidental: ETABS aplica en los casos espectrales momentos estáticos con excentricidad r·b constante en altura. Con r ≥ 0.10 cubre 0.10 b Zk/H (6.3.3 b) en todos los niveles; con menos, la torsión accidental queda SIN VERIFICAR.
- El porcentaje de sobrecarga de la fuente de masa se compara con el 25 % de 5.5.1; el 50 % para áreas con aglomeración lo decide el usuario.
- Quedan fuera: 5.9.5 (desplazamiento de techo con Tag para hormigón armado), 5.10 (separaciones) y el diseño de elementos.
## NCh 2369:2025 (lista «Norma»)

- La página del PDF de la NCh 2369:2025 es la impresa + 7 (PDF escaneado, leído como imagen).
- Espectro de diseño Sa = I·SaH·(0.05/ξ)^0.4 / R* con SaH = Ar·S·α, Ar = 1.4·A0 y α con r, p y q de la Tabla 6. R* según la Ec. (1b): R si T* ≥ Cr·T1, si no 1.5 + (R − 1.5)·T*/(Cr·T1), con Cr = 0.16·R (acotado a R).
- La corrección (0.05/ξ)^0.4 vale para ξ entre 0.02 y 0.05 (5.4.2): fuera de ese rango no se calcula.
- Q0,mín = 0.25·I·Ar·S·P/g (5.12) y Q0,máx = 2.75·I·Ar·S/(g(R + 1))·(0.05/ξ)^0.4·P (5.13). El aumento por corte mínimo no se aplica a los desplazamientos. R1 = R*·mín(Q0/Q0,mín ; 1) se informa (5.14).
- Desplazamientos con el espectro elástico (6.1): los del caso espectral escalados por la razón entre ese espectro elástico y el espectro del caso en T*, sin depender del factor de la combinación. Simultaneidad direccional de 4.5.2 (que exige 6.1): al drift de cada dirección se suma el 30 % del que produce en ella el caso de la otra dirección (suma de máximos). Límite entre niveles d ≤ dmáx·h (6.3): 0.015 en general, 0.002, 0.003 o 0.0075 según el tipo; se compara con el drift de piso máximo de ETABS. El desplazamiento relativo en el centro de masas se informa como referencia. La excepción que duplica los límites no se aplica. Sobre 0.015 h, el efecto P-Delta (6.4) queda SIN VERIFICAR.
- Si el espectro del modelo supera al de la norma en más de 10 %, se avisa: la combinación podría traer un factor de carga.
- Torsión (5.6.4): la norma no fija una excentricidad accidental; se informa la del modelo y no entra al veredicto.
- Sobrecarga en la masa ≥ 25 % (5.1.2; 50 % en bodegas y acopio lo decide el usuario).
- Quedan fuera: acción vertical (5.7), separaciones (6.2), P-Delta (6.4) y elementos secundarios (cláusula 7).

| Parte del cálculo | Resultado en structura | Referencia | Documento | Pág. PDF |
|---|---|---|---|---|
| Parámetros | Coeficiente de importancia I | 4.3.2 | NCh 2369:2025 | 20 |
| Peso sísmico | Fracción de sobrecarga en la masa | 5.1.2 | NCh 2369:2025 | 26 |
| Espectro | Sa y R* | 5.4.1, Ec. (1a) y (1b) | NCh 2369:2025 | 35 |
| Espectro | SaH y corrección por ξ | 5.4.2, Ec. (3) | NCh 2369:2025 | 36 |
| Análisis modal | Masa acumulada ≥ 90 % | 5.6.2 | NCh 2369:2025 | 39 |
| Combinación modal | CQC | 5.6.3, Ec. (8) a (10) | NCh 2369:2025 | 40-41 |
| Torsión | Efectos de la torsión | 5.6.4 | NCh 2369:2025 | 41 |
| Corte basal | Q0,mín | 5.12, Ec. (12) | NCh 2369:2025 | 55 |
| Corte basal | Q0,máx y R1 | 5.13 y 5.14, Ec. (13) y (14) | NCh 2369:2025 | 56 |
| Parámetros | A0 y Ar | Tabla 3 | NCh 2369:2025 | 64 |
| Parámetros | S, r, T0, p, q, T1 | Tabla 6 | NCh 2369:2025 | 67 |
| Parámetros | R y ξ por sistema | Tabla 7 | NCh 2369:2025 | 67-70 |
| Desplazamientos | Simultaneidad direccional (100 % + 30 %) | 4.5.2 | NCh 2369:2025 | 23 |
| Desplazamientos | Cálculo con el espectro elástico | 6.1 | NCh 2369:2025 | 75 |
| Desplazamientos | d ≤ dmáx·h | 6.3 | NCh 2369:2025 | 76-77 |

## Referencias usadas por el cálculo

| Parte del cálculo | Resultado en structura | Referencia | Documento | Pág. PDF |
|---|---|---|---|---|
| Peso sísmico | Porcentaje de sobrecarga en la masa | 5.5.1 | NCh 433:2026 | 35 |
| Peso sísmico | Peso sísmico total P | 6.2.3.3 | NCh 433:2026 | 43 |
| Parámetros | R, R0 y Δcm/h máximo por sistema estructural | Tabla 5 | NCh 433:2026 | 39-40 |
| Parámetros | Coeficiente I; A0; S, T0, T', n, p | Tablas 6, 7 y 8 | NCh 433:2026 | 51 |
| Análisis modal | Masa equivalente acumulada ≥ 90 % | 6.3.2 | NCh 433:2026 | 45 |
| Espectro | Sa = I S A0 α / R* | 6.3.4.1, Ec. (8) | NCh 433:2026 | 46 |
| Espectro | Factor de amplificación α | 6.3.4.2, Ec. (9) | NCh 433:2026 | 46 |
| Espectro | Factor de reducción R* | 6.3.4.3, Ec. (10) | NCh 433:2026 | 46 |
| Torsión accidental | Excentricidad de los casos espectrales | 6.3.3 | NCh 433:2026 | 45 |
| Combinación modal | CQC | 6.3.5.2 | NCh 433:2026 | 49 |
| Corte basal | Qmín = I S A0 P / 6g | 6.3.6.1 | NCh 433:2026 | 50 |
| Corte basal | Qmáx = I Cmáx P | 6.3.6.2 | NCh 433:2026 | 50 |
| Corte basal | Cmáx según R | Tabla 9 | NCh 433:2026 | 51 |
| Desplazamientos | Δ/h en el centro de masas ≤ Tabla 5 | 5.9.2 | NCh 433:2026 | 37 |
| Desplazamientos | Δ/h en cualquier punto ≤ máx(Δcm/h + 0.001; Tabla 5) | 5.9.3 | NCh 433:2026 | 37 |
