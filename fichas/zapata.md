# Ficha normativa: Zapata aislada

Sigue la pauta del curso de Hormigón Armado y agrega complementos del ACI 318-08. El sismo es un procedimiento por verificar y no entra en el veredicto.

Documentos: ACI 318-08 (español).

## Criterios y límites

- La página del PDF de ACI 318-08 es la impresa + 2.
- Material del curso: EJERCICIO_ZAPATA_01.pdf y CLASE 2 - Zapatas.pdf, en hormigon/Fundaciones.
- NCh 3171 no está en el proyecto.

## Referencias usadas por el cálculo

| Parte del cálculo | Resultado en structura | Referencia | Documento | Pág. PDF |
|---|---|---|---|---|
| Cargas y momentos a nivel de sello | Solicitaciones mayoradas (LRFD): Pu ; Mxu ; Myu | 9-1 | ACI 318-08 (español) | 123 |
| Peralte por transferencia de carga columna – zapata | Longitud de desarrollo con gancho: ldh | 12.5.2 | ACI 318-08 (español) | 220 |
| Peralte por transferencia de carga columna – zapata | Longitud de desarrollo en compresión: ldc | 12.3.2 | ACI 318-08 (español) | 219 |
| Diseño a corte | Altura útil: d | criterio del curso | Criterio |  |
| Diseño a corte | Dirección x, resistencia al corte del hormigón: Vcx | 11-3 | ACI 318-08 (español) | 169 |
| Diseño a corte | Dirección y, resistencia al corte del hormigón: Vcy | 11-3 | ACI 318-08 (español) | 169 |
| Diseño a corte | Perímetro crítico ; relación de lados ; factor de posición: b0 ; β ; αs | 11.11.2.1 | ACI 318-08 (español) | 202 |
| Diseño a corte | Resistencia según la relación de lados: Vc1 | 11-31 | ACI 318-08 (español) | 203 |
| Diseño a corte | Resistencia según el perímetro crítico: Vc2 | 11-32 | ACI 318-08 (español) | 203 |
| Diseño a corte | Resistencia límite: Vc3 | pauta del curso | Criterio |  |
| Diseño a corte | Resistencia límite: Vc3 | 11-33 | ACI 318-08 (español) | 203 |
| Diseño a corte | Tensión de corte con transferencia de momento: vu ≤ φvc | 11.11.7.2 | ACI 318-08 (español) | 212 |
| Diseño a corte | Resistencia al aplastamiento: φBn | 10.14.1 | ACI 318-08 (español) | 163 |
| Diseño a flexión | Armadura requerida (…), …: As… | criterio del curso | Criterio |  |
| Diseño a flexión | Resistencia de diseño con la armadura propuesta: φMn | 10.2 | ACI 318-08 (español) | 139 |
| Requisitos de detalle | Altura sobre la armadura inferior d ≥ 15 cm | 15.7 | ACI 318-08 (español) | 278 |
| Requisitos de detalle | Anclaje de As… con gancho desde la cara: ldh ≤ ldisp | 15.6.3 | ACI 318-08 (español) | 278 |
| Requisitos de detalle | Anclaje de As… con gancho desde la cara: ldh ≤ ldisp | 12.5.2 | ACI 318-08 (español) | 220 |
| Requisitos de detalle | Zapata rectangular: fracción de la armadura corta, barras …, en una banda central de ancho | 15.4.4.2 | ACI 318-08 (español) | 276 |
| Análisis sísmico — procedimiento por verificar | Área comprimida ≥ … % (…) | NCh 433 / NCh 2369 | Criterio |  |
| Análisis sísmico — procedimiento por verificar | Corte tipo viga x en la franja más exigida: Vu | 11-3 | ACI 318-08 (español) | 169 |
| Análisis sísmico — procedimiento por verificar | Corte tipo viga y en la franja más exigida: Vu | 11-3 | ACI 318-08 (español) | 169 |
| Análisis sísmico — procedimiento por verificar | Punzonamiento con transferencia de momento: vu ≤ φvc | 11.11.7.2 | ACI 318-08 (español) | 212 |

## Opción ACI 318-19 (casilla «Versión del código»)

La página calcula con ACI 318-08 por defecto. Con la casilla en ACI 318-19 (aún no vigente en Chile):

- Corte tipo viga sin estribos con la expresión (c) de la Tabla 22.5.5.1: Vc = 0.66 λs λ ρw^(1/3) √f'c b d (MPa), con ρw de la armadura de flexión dispuesta en esa dirección. En zapatas aisladas se toma λs = 1 (13.2.6.2). Con cuantías bajas, este Vc es bastante menor que 0.53√f'c b d.
- Punzonamiento con la Tabla 22.6.5.2 (0.33, 0.17 + 0.33/β y 0.17 + 0.083 αs d/b0, por λs λ √f'c), con λs = 1.
- Gancho de la barra de la columna con 25.4.3.1: ldh = (fy ψe ψr ψo ψc / 23λ√f'c) db^1.5, con ψr elegido en los datos (1.6 si no se comprueba el confinamiento) y ψc de la Tabla 25.4.3.2. En la parrilla, ψr = 1.0 si s ≥ 6db y ψo = 1.25 si el recubrimiento es menor que 6db.
- Los coeficientes en MPa se convierten a kgf/cm² con 1 MPa = 10.197 kgf/cm².

Documento: ACI 318M-19 (inglés, unidades SI). La página del PDF es la impresa + 2.

| Parte del cálculo | Referencia ACI 318-19 | Pág. PDF |
|---|---|---|
| Combinación 1.4D | Tabla 5.3.1 | 64 |
| Transferencia de momento por corte excéntrico | 8.4.4.2.3 | 109 |
| Cuantía mínima (referencia) | 8.6.1.1 | 112 |
| Efecto de tamaño despreciable en zapatas | 13.2.6.2 | 196 |
| Secciones críticas | 13.2.7.2 | 197 |
| Desarrollo de la armadura | 13.2.8.1 | 198 |
| d ≥ 150 mm | 13.3.1.2 | 199 |
| Banda central en zapatas rectangulares | 13.3.3.3 | 199 |
| Armadura de traspaso 0.005Ag | 16.3.4.1 | 226 |
| Recubrimiento | 20.5.1.3.1 | 384 |
| Resistencia a flexión | 22.2 | 399 |
| Vc tipo viga | Tabla 22.5.5.1 | 406 |
| Perímetro crítico | 22.6.4 | 414 |
| vc de punzonamiento ; αs | Tabla 22.6.5.2 ; 22.6.5.3 | 418 |
| Aplastamiento | 22.8.3.2 | 431 |
| Patas de 90° | Tabla 25.3.1 | 471 |
| ldh con gancho ; factores ψ | 25.4.3.1 ; Tabla 25.4.3.2 | 476 ; 477 |
| ldc en compresión | 25.4.9.2 | 489 |
