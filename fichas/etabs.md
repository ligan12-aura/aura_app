# Ficha normativa: Memoria ETABS

Documenta el análisis modal espectral de un edificio modelado en ETABS y verifica sus resultados globales según la NCh 433:2026. No repite el análisis ni verifica elementos (muros, vigas, columnas, losas ni fundaciones).

Documentos: NCh 433:2026.

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
- NCh 2369:2025 aparece como «próximamente»: su PDF está escaneado y aún no se verificó contra la norma.

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
