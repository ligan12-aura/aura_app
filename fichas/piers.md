# Ficha normativa: Muros de corte

Verifica solo el corte de piers importados desde ETABS, reproduciendo la hoja Muro de la planilla IIO348. Flexocompresión y elementos de borde quedan SIN VERIFICAR.

Documentos: ACI 318-08 (español).

## Criterios y límites

- La página del PDF de ACI 318-08 es la impresa + 2.
- Criterio de la planilla, distinto del ACI: φVn usa 0.53 en vez de αc (21.9.4.1) y ρmín en vez de la cuantía dispuesta.
- Criterio de la planilla: el límite 0.75 Vs,máx no es la expresión de 21.9.4.4, que usa 2.12 Acv √f'c en conjunto y 2.65 Acw √f'c por machón.
- Criterio de la planilla: Sv,máx usa Lw/3, y ACI 11.9.9.3 (pág. PDF 201) usa Lw/5; ACI 21.9.2.1 limita a 450 mm.
- ACI 9.3.4(a) (pág. PDF 129) puede exigir φ = 0.60; structura usa 0.75, como la planilla.
- DS 60 no está en el proyecto: sus exigencias para muros en Chile deben comprobarse directamente.

## Referencias usadas por el cálculo

| Parte del cálculo | Resultado en structura | Referencia | Documento | Pág. PDF |
|---|---|---|---|---|
| Pier | Límite del corte del acero: Vs ≤ Vs,máx | 11.4.7.9 | ACI 318-08 (español) | 179 |
| Pier | Cuantía requerida ; cuantía mínima: ρ ; ρmín | 21.9.2.1 | ACI 318-08 (español) | 366 |
| Pier | Resistencia al corte: Vu ≤ φVn | 21.9.4.1 | ACI 318-08 (español) | 367 |
| Pier | Límite de resistencia: Vu ≤ 0.75 Vs,máx | 21.9.4.4 | ACI 318-08 (español) | 367 |
| Pier | Límite con Acv ; límite con Acw | 21.9.4.4 | ACI 318-08 (español) | 367 |

## Opción ACI 318-19 (casilla «Versión del código»)

Por defecto la página reproduce la planilla del Informe IIO348 (ACI 318-08). Con la casilla en ACI 318-19 (aún no vigente en Chile), el corte se verifica como muro estructural especial (18.10):

- Corte de diseño amplificado Ve = Ωv ωv Vu ≤ 3Vu (18.10.3.1). Ωv es un dato (1.5 por defecto) cuando hw/Lw > 1.5, porque la página no calcula Mpr; con hw/Lw ≤ 1.5, Ωv = 1.0. ωv = 1.0 si hw/Lw < 2; si no, 0.9 + ns/10 (ns ≤ 6) o 1.3 + ns/30 ≤ 1.8, con ns igual al número de pisos del pier en la tabla y no menor que 0.00028 hwcs. Se toma hwcs = Hw.
- Vn = (αc λ √f'c + ρt fy) Acv con Acv = Lw e (sin d = 0.8Lw); αc = 0.25 si hw/Lw ≤ 1.5, 0.17 si hw/Lw ≥ 2.0, lineal entre ambos (18.10.4.1). ρt es la cuantía dispuesta.
- Límite de un segmento 0.83√f'c Acv (18.10.4.4), que entra en la razón D/C. El límite 0.66√f'c ΣAcv del conjunto de segmentos se informa y no se verifica.
- ρt ≥ 0.0025; si Vu ≤ 0.083λ√f'c Acv se permite la Tabla 11.6.1 (0.0020 con barras ≤ φ16 de A630-420H) (18.10.2.1). Separación ≤ mín(3e ; 450 mm).
- φ = 0.75. El ACI 318-19 21.2.4.1 puede exigir φ = 0.60 si el muro no se diseña según 18.10.6.2; queda declarado en la memoria.

Documento: ACI 318M-19 (inglés, unidades SI). La página del PDF es la impresa + 2.

| Parte del cálculo | Referencia ACI 318-19 | Pág. PDF |
|---|---|---|
| Cuantía mínima horizontal reducida | Tabla 11.6.1 | 173 |
| Separación máxima | 11.7.3.1 | 174 |
| Cuantías mínimas y separación en muros especiales | 18.10.2.1 | 320 |
| Dos capas de armadura | 18.10.2.2 | 320 |
| Ve ; Ωv ; ωv | 18.10.3.1 ; Tabla 18.10.3.1.2 ; 18.10.3.1.3 | 323 |
| Vn y αc | 18.10.4.1 | 324 |
| Límites 0.66 y 0.83√f'c | 18.10.4.4 | 324 |
| fy máximo para armadura de corte sísmica | Tabla 20.2.2.4(a) | 378 |
| φ = 0.60 en corte | 21.2.4.1 | 398 |
