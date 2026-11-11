# Ficha normativa: Columnas de hormigón

Columna rectangular o circular de hormigón armado con cargas sin mayorar por estado (D, L, E_x, E_y) que structura combina según la NCh 3171 con 1.4E (DS 60). Verifica flexocompresión uniaxial y biaxial, esbeltez, corte, límites del refuerzo y disposiciones sísmicas (pórtico especial, intermedio o sin ellas).

Documentos: ACI 318-19 (español, SI); DS 60 (2011).

## Criterios y límites

- **NCh 430:2026 por confirmar.** No está en el proyecto. Se calcula con el ACI 318-19 y se aplican, como criterio de structura, las adecuaciones del DS 60 (escritas para el ACI 318-08) que afectan a columnas.
- La página del PDF del ACI 318-19 no sigue un desfase fijo respecto de la página impresa: se anota la página del PDF.
- Unidades internas kgf y cm; las expresiones del ACI en MPa y mm se convierten con 1 MPa = 10.1972 kgf/cm². E_s = 200 000 MPa.
- Flexocompresión por compatibilidad de deformaciones con el bloque rectangular recortado sobre el contorno real (la circular como polígono de 144 lados). En flexión biaxial se gira el eje neutro hasta alinear el momento resistente con el solicitante. Para cada P_u se resuelve el eje neutro por bisección.
- Razón D/C a carga axial constante: máx(M_u/φM_n(P_u) ; P_u/φP_n,máx). Validado a mano: 40 × 40, 8 φ18, G25, A630-420H, flexión pura: c = 6.76 cm, ε_t = 0.0120, φM_n = 12.11 tf·m; con c = 30 cm: P_n = 250.4 tf, M_n = 20.79 tf·m.
- Con esbeltez se suman vectorialmente los momentos amplificados de ambos ejes (conservador). Sin esbeltez se verifica cada extremo con sus momentos.
- Momentos de los extremos con el signo del diagrama del análisis: igual signo en ambos extremos = curvatura simple (M_1/M_2 negativo en el ACI 318-19).
- No arriostrado: el análisis incluye P-Δ (δ_s = 1) o δ_s = 1/(1 − Q) aplicado al momento total (criterio conservador). Si δ_s > 1.5 queda SIN VERIFICAR. El P-δ del miembro usa k = 1 en P_c (criterio).
- Corte: d a la capa extrema en la rectangular; ρ_w con la capa de la cara traccionada. Circular: d = 0.8D, b_w = D, A_v = 2A_b y ρ_w con la mitad de las barras (criterio). La separación máxima de la Tabla 10.7.6.5.2 se evalúa con el V_s requerido.
- Pórtico especial: V_e con M_pr de la propia columna (1.25f_y, φ = 1, máximo en el intervalo de P_u sísmicas), limitado opcionalmente por el corte de las vigas y nunca menor que el del análisis. Columna fuerte – viga débil con M_nc mínimo en el intervalo de P_u sísmicas y la columna superior igual a esta (criterio).
- Pórtico intermedio: se usa 18.4.3.1(a), sin Ω_oE (conservador).
- Recubrimiento: informativo frente a la Tabla 20.5.1.3.1 (40 mm); no entra en el D/C.
- V_c = 0 en ℓ_o (18.7.6.2.1) se decide con la menor P_u sísmica. M_pr y M_n máximos incluyen los puntos de la curva dentro del intervalo de P_u sísmicas (vértice cercano a P_b).
- Sección circular solo con número par de barras (simétrica); en pórtico especial h_x es la separación de barras del perímetro.
- A440-280H en pórtico especial queda SIN VERIFICAR: el DS 60 (21.1.5.2) lo permite solo con f_y real ≤ f_y + 125 MPa.
- Sin ΣM_nb (valor 0) la columna fuerte – viga débil queda SIN VERIFICAR.
- El ACI 318-19 no trae el límite kℓ_u/r ≤ 100 de ediciones anteriores (no hay 6.2.6).

## Referencias usadas por el cálculo

| Parte del cálculo | Resultado en structura | Referencia | Documento | Pág. PDF |
|---|---|---|---|---|
| Sección y materiales | Hipótesis de deformación última ε_cu = 0.003 | 22.2.2.1 | ACI 318-19 (español) | 409 |
| Sección y materiales | Bloque rectangular equivalente y β_1 | 22.2.2.4.1 a Tabla 22.2.2.4.3 | ACI 318-19 (español) | 409-410 |
| Sección y materiales | Módulo de elasticidad del acero E_s | 20.2.2.2 | ACI 318-19 (español) | 383 |
| Sección y materiales | Deformación de fluencia ε_ty | 21.2.2.1 | ACI 318-19 (español) | 403 |
| Sección y materiales | Factor φ según ε_t | Tabla 21.2.2 | ACI 318-19 (español) | 404 |
| Sección y materiales | Resistencia axial P_o | 22.4.2.2 | ACI 318-19 (español) | 412 |
| Sección y materiales | φP_n,máx (0.80 o 0.85 P_o) | Tabla 22.4.2.1 | ACI 318-19 (español) | 411-412 |
| Sección y materiales | Tracción pura P_nt | 22.4.3.1 | ACI 318-19 (español) | 412 |
| Combinaciones | 1.4D; 1.2D + 1.6L; 1.2D + 1.0L ± E; 0.9D ± E | NCh 3171 | Criterio |  |
| Combinaciones | Factor 1.4 del sismo de la NCh 433 | 9.1.4 | DS 60 | 7 |
| Esbeltez | Límites kℓ_u/r (22 ; 34 + 12M_1/M_2 ≤ 40) | 6.2.5.1 | ACI 318-19 (español) | 73-74 |
| Esbeltez | Radio de giro 0.30h o 0.25D | 6.2.5.2 | ACI 318-19 (español) | 74 |
| Esbeltez | M_c ≤ 1.4 M de primer orden | 6.2.5.3 | ACI 318-19 (español) | 75 |
| Esbeltez | Índice de estabilidad Q | 6.6.4.4.1 | ACI 318-19 (español) | 84 |
| Esbeltez | P_c y (EI)_eff | 6.6.4.4.2 y 6.6.4.4.4 | ACI 318-19 (español) | 85 |
| Esbeltez | δ, C_m y M_2,mín | 6.6.4.5.1 a 6.6.4.5.4 | ACI 318-19 (español) | 85-86 |
| Esbeltez | δ_s del piso | 6.6.4.6.1 y 6.6.4.6.2 | ACI 318-19 (español) | 87 |
| Esbeltez | Efectos a lo largo de la columna no arriostrada | 6.6.4.6.4 | ACI 318-19 (español) | 88 |
| Esbeltez | Módulo E_c | 19.2.2.1 | ACI 318-19 (español) | 365 |
| Flexocompresión | φS_n ≥ U | 10.5.1.1 | ACI 318-19 (español) | 162 |
| Flexocompresión | P_n y M_n con las hipótesis de 22.2 | 22.4.1.1 | ACI 318-19 (español) | 411 |
| Flexocompresión | Profundidad c perpendicular al eje neutro | 22.2.2.4.2 | ACI 318-19 (español) | 410 |
| Refuerzo longitudinal | Cuantía 1 % a 8 % | 10.6.1.1 | ACI 318-19 (español) | 162 |
| Refuerzo longitudinal | Número mínimo de barras | 10.7.3.1 | ACI 318-19 (español) | 163 |
| Refuerzo longitudinal | Separación libre mínima | 25.2.3 | ACI 318-19 (español) | 482 |
| Corte | V_n = V_c + V_s y límite de la sección | 22.5.1.1 y 22.5.1.2 | ACI 318-19 (español) | 413 |
| Corte | Corte en dos direcciones | 22.5.1.10 y 22.5.1.11 | ACI 318-19 (español) | 414 |
| Corte | d y b_w en secciones circulares | 22.5.2.2 | ACI 318-19 (español) | 414 |
| Corte | V_c con carga axial y efecto de tamaño | Tabla 22.5.5.1 | ACI 318-19 (español) | 416 |
| Corte | V_s y A_v de estribos circulares | 22.5.8.5.3 y 22.5.8.5.6 | ACI 318-19 (español) | 421-422 |
| Corte | A_v,mín | 10.6.2.1 y 10.6.2.2 | ACI 318-19 (español) | 163 |
| Corte | Separación máxima | Tabla 10.7.6.5.2 | ACI 318-19 (español) | 168 |
| Corte | f_yt máximo para V_s | 20.2.2.4 | ACI 318-19 (español) | 383 |
| Refuerzo transversal | Estribos: separación, diámetro y apoyo lateral | 25.7.2.1 a 25.7.2.3 | ACI 318-19 (español) | 513 |
| Refuerzo transversal | Espirales: paso, diámetro y ρ_s | 25.7.3.1 a 25.7.3.3 | ACI 318-19 (español) | 516 |
| Refuerzo transversal | Estribo ≥ 1/3 de la barra longitudinal | 7.10.5.1 | DS 60 | 7 |
| Refuerzo transversal | Ganchos de 135° en estribos y trabas | 21.6.4.2 | DS 60 | 8 |
| Pórtico especial | Todo Chile es Categoría D | 21.1.1.2 | DS 60 | 7 |
| Pórtico especial | Acero A630-420H en elementos sísmicos | 21.1.5.2 | DS 60 | 8 |
| Pórtico especial | Dimensiones mínimas | 18.7.2.1 | ACI 318-19 (español) | 317 |
| Pórtico especial | Columna fuerte – viga débil y exención 18.7.3.1 | 18.7.3.1 y 18.7.3.2 | ACI 318-19 (español) | 317 |
| Pórtico especial | Exención en el cielo del último piso | 21.6.2.2 | DS 60 | 8 |
| Pórtico especial | Cuantía 1 % a 6 %, 6 barras en estribos circulares, 1.25ℓ_d ≤ ℓ_u/2 | 18.7.4.1 a 18.7.4.3 | ACI 318-19 (español) | 318 |
| Pórtico especial | ℓ_d de barras rectas | Tabla 25.4.2.3 | ACI 318-19 (español) | 488 |
| Pórtico especial | ℓ_o y disposición del refuerzo (h_x) | 18.7.5.1 y 18.7.5.2 | ACI 318-19 (español) | 319 |
| Pórtico especial | Separación s_o | 18.7.5.3 | ACI 318-19 (español) | 320 |
| Pórtico especial | A_sh y ρ_s de confinamiento, k_f y k_n | Tabla 18.7.5.4 | ACI 318-19 (español) | 321 |
| Pórtico especial | Separación fuera de ℓ_o | 18.7.5.5 | ACI 318-19 (español) | 321 |
| Pórtico especial | Corte V_e con M_pr | 18.7.6.1.1 | ACI 318-19 (español) | 322 |
| Pórtico especial | Definición de M_pr | Cap. 2 | ACI 318-19 (español) | 25 |
| Pórtico especial | V_c = 0 en ℓ_o | 18.7.6.2.1 | ACI 318-19 (español) | 322-323 |
| Pórtico intermedio | Uso en estructuras mixtas | 21.1.1.9 | DS 60 | 7-8 |
| Pórtico intermedio | Corte de diseño | 18.4.3.1 | ACI 318-19 (español) | 305 |
| Pórtico intermedio | ℓ_o, s_o y primer estribo | 18.4.3.3 y 18.4.3.4 | ACI 318-19 (español) | 306 |
| Recubrimiento | 40 mm a estribos de columnas no expuestas | Tabla 20.5.1.3.1 | ACI 318-19 (español) | 393 |
| Recubrimiento | Recubrimientos del DS 60 (con ACI 318-08) | 7.7.1 | DS 60 | 4-6 |

## No incluido

Nudos viga–columna, empalmes por traslapo, torsión, columnas que soportan miembros rígidos discontinuos (18.7.5.6) y columnas que no forman parte del sistema sismorresistente (18.14).
