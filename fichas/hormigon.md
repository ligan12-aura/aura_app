# Ficha normativa: Vigas y losas de hormigón

Verifica vigas y losas según ACI 318-08 (o ACI 318-19 como opción, aún no vigente en Chile), con detallamiento y tablas de Czerny para losas.

Documentos: ACI 318-08 (español); Manual ICH (hormigón); ACI 318M-19 (inglés, SI), opción.

## Criterios y límites

- La página del PDF de ACI 318-08 es la impresa + 2.
- También existen en la carpeta ACI 318S-14, NCh 430 y el Manual de detallamiento, sin páginas registradas en esta ficha.
- Losa, comparación con ETABS (casilla «Comparar Czerny con los momentos de ETABS»): la losa se diseña con los momentos de Czerny y con los momentos últimos de ETABS, con el mismo procedimiento, y una tabla compara Mu, As requerida, armadura y diferencias, más el As que entrega ETABS si se ingresa. Es la misma comparación de la Tabla N° 6.19 del Informe Final IIO348 (pág. 26 del informe), que compara Czerny, el cálculo manual con los momentos de ETABS y el diseño de ETABS. La verificación y el veredicto usan el método elegido en «Método».

## Referencias usadas por el cálculo

| Parte del cálculo | Resultado en structura | Referencia | Documento | Pág. PDF |
|---|---|---|---|---|
|  | Momento último ; momento nominal requerido: Mu ; Mn | 9.3.2.1 | ACI 318-08 (español) | 126 |
|  | Cuantía mínima: ρmín | 10.5.1 | ACI 318-08 (español) | 145 |
|  | Cuantía máxima ; referencia 0.75 cuantía balanceada: ρmáx ; 0.75ρb | 10.3.5 | ACI 318-08 (español) | 143 |
|  | Espaciamiento libre entre barras: s ≥ smín | 7.6.1 | ACI 318-08 (español) | 96 |
|  | Espaciamiento entre ejes (control de fisuración): s ≤ smáx | 10.6.4 | ACI 318-08 (español) | 146 |
|  | Profundidad del bloque de compresión ; eje neutro: a ; c | 10.2.7 | ACI 318-08 (español) | 140 |
|  | Deformación del acero en tracción ; factor de reducción: εt ; φ | 10.3.5 | ACI 318-08 (español) | 143 |
|  | Deformación del acero en tracción ; factor de reducción: εt ; φ | 9.3.2 | ACI 318-08 (español) | 126 |
|  | Altura útil ; factor de reducción por corte: d ; φ | 9.3.2.3 | ACI 318-08 (español) | 127 |
|  | Resistencia al corte del hormigón: Vc ; φVc | 11.2.1.1 | ACI 318-08 (español) | 168 |
|  | Criterio sísmico: Vc = 0 (Vu debe ser el corte Ve de 21.5.4.1) | 21.5.4.2 | ACI 318-08 (español) | 355 |
|  | Corte requerido al acero: Vs | 11.4.7.1 | ACI 318-08 (español) | 177 |
|  | Límite del corte resistido por el acero: Vs ≤ Vs,máx | 11.4.7.9 | ACI 318-08 (español) | 179 |
|  | Armadura de corte requerida: Av/s | 11-15 | ACI 318-08 (español) | 177 |
|  | Armadura de corte mínima: (Av/s)mín | 11.4.6.3 | ACI 318-08 (español) | 177 |
|  | Diámetro interior de doblado: D | 7.2.2 | ACI 318-08 (español) | 93 |
|  | Extensión del gancho 135° …: lext | 21.1 | ACI 318-08 (español) | 339 |
|  | Extensión del gancho 135° …: lext | 7.1.3(c) | ACI 318-08 (español) | 93 |
| Losa — diseño de armadura por flexión | Carga última: q | 9.2.1 | ACI 318-08 (español) | 123 |
| Losa — diseño de armadura por flexión | Armadura requerida: As | 7.12.2.1 | ACI 318-08 (español) | 106 |
| Losa — diseño de armadura por flexión | Espaciamiento calculado φ… ; espaciamiento máximo: s ; smáx | 13.3.2 | ACI 318-08 (español) | 249 |
| Losa — diseño de armadura por flexión | Espaciamiento calculado φ… ; espaciamiento máximo: s ; smáx | 7.6.5 | ACI 318-08 (español) | 96 |
| Ganchos y largos de barras — Manual de Detallamiento ICH | Diámetro de doblado ; extensión estándar: D ; lext | T.1 | Manual ICH (hormigón) |  |

## Opción ACI 318-19 (casilla «Versión del código»)

La página calcula con ACI 318-08 por defecto. Con la casilla en ACI 318-19 (aún no vigente en Chile) cambian las referencias y estos criterios: cuantía mínima de vigas con 0.25√f'c/fy y 1.4/fy en MPa; vigas y losas controladas por tracción (εt ≥ εty + 0.003); φ entre εty y εty + 0.003; Vc = 0.17λ√f'c bw d (expresión (a), porque la viga siempre lleva al menos Av,mín); separación sísmica de estribos d/4, 6db y 150 mm; extensión del gancho de 135° de 6db y 75 mm; losas con 0.0018 Ag para todo fy. Los coeficientes en MPa se convierten a kgf/cm² con 1 MPa = 10.197 kgf/cm² (c√f'c → 3.193 c√f'c).

Documento: ACI 318M-19 (inglés, unidades SI). La página del PDF es la impresa + 2.

| Parte del cálculo | Referencia ACI 318-19 | Pág. PDF |
|---|---|---|
| Combinaciones de carga de la losa | Tabla 5.3.1 | 64 |
| Losa en una dirección controlada por tracción | 7.3.3.1 | 92 |
| Cuantía mínima de losas (una y dos direcciones) | 7.6.1.1 ; 8.6.1.1 | 94 ; 112 |
| Retracción y temperatura | 24.4.3.2 | 464 |
| Separación máxima en losas en una y dos direcciones | 7.7.2.3 ; 8.7.2.2 | 97 ; 116 |
| Losa en dos direcciones controlada por tracción | 8.3.3.1 | 104 |
| Viga controlada por tracción | 9.3.3.1 | 132 |
| Cuantía mínima de vigas | 9.6.1.2 | 137 |
| Cuándo se exige Av,mín | 9.6.3.1 | 138 |
| Av,mín | Tabla 9.6.3.4 | 140 |
| Separación máxima de estribos | Tabla 9.7.6.2.2 | 149 |
| Separación de estribos en vigas sísmicas | 18.6.4.4 | 304 |
| Corte de diseño Ve y Vc = 0 en vigas sísmicas | 18.6.5.1 ; 18.6.5.2 | 305 |
| Recubrimiento | 20.5.1.3.1 | 384 |
| Factores φ | Tabla 21.2.1 ; Tabla 21.2.2 | 393 ; 395 |
| Bloque de compresiones y β1 | 22.2.2.4 ; Tabla 22.2.2.4.3 | 400 ; 401 |
| Límite de la sección: Vs ≤ 0.66√f'c bw d | 22.5.1.2 | 404 |
| Vc | Tabla 22.5.5.1 | 406 |
| Vs de los estribos | 22.5.8.5.3 | 412 |
| Control de fisuración | Tabla 24.3.2 | 462 |
| Separación libre entre barras | 25.2.1 | 469 |
| Ganchos de estribos y ganchos sísmicos | Tabla 25.3.2 ; 25.3.4 | 472 |
