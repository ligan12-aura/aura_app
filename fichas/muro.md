# Ficha normativa: Muros de contención

Verifica un muro en voladizo con Rankine y Mononobe-Okabe, y diseña pantalla, pie y talón con ACI 318-08, según las pautas del curso.

Documentos: ACI 318-08 (español).

## Criterios y límites

- La página del PDF de ACI 318-08 es la impresa + 2.
- Rankine, Mononobe-Okabe y los criterios marcados como curso provienen de las pautas del curso, no de una norma registrada en esta ficha.

## Referencias usadas por el cálculo

| Parte del cálculo | Resultado en structura | Referencia | Documento | Pág. PDF |
|---|---|---|---|---|
|  | Cuantía calculada ; cuantía mínima: ρ ; ρmín | criterio del curso | Criterio |  |
|  | Separación calculada ; separación máxima → armadura adoptada: s ; smáx | 7.6.5 | ACI 318-08 (español) | 96 |
|  | Bloque de compresión ; eje neutro ; deformación del acero: a ; c ; εt | 10.2.7 | ACI 318-08 (español) | 140 |
|  | Deformación mínima del acero (…): εt ≥ 0.004 ; φ | 10.3.5 | ACI 318-08 (español) | 143 |
|  | Deformación mínima del acero (…): εt ≥ 0.004 ; φ | 9.3.2 | ACI 318-08 (español) | 126 |
|  | Resistencia de diseño con la armadura dispuesta: φMn | 10.2 | ACI 318-08 (español) | 139 |
|  | Resistencia al corte del hormigón: Vc ; φVc | 11-3 | ACI 318-08 (español) | 169 |
| Caso 1: empujes de tierra más sobrecarga | Coeficiente de empuje activo: Ka | Rankine | Criterio |  |
| Caso 1: empujes de tierra más sobrecarga | Coeficiente de empuje pasivo: Kp | Rankine | Criterio |  |
| Caso 1: estabilidad del muro | Largo comprimido… ≥ … % de B | criterio del curso | Criterio |  |
| Caso 2: empujes de tierra más sobrecarga más sismo | Coeficiente de empuje sísmico: Kas | Mononobe-Okabe | Criterio |  |
| Diseño de la pantalla | Mínima vertical, cara exterior: A's | criterio del curso | Criterio |  |
| Diseño de la pantalla | Mínima horizontal, por cara: As,h | criterio del curso | Criterio |  |
| Diseño de la pantalla | Mínima horizontal, por cara: As,h | 14.3.3 | ACI 318-08 (español) | 268 |
| Diseño de la zapata: talón | Corte en la cara del trasdós: Vu | 11.1.3.1 | ACI 318-08 (español) | 166 |
| Diseño de la zapata: talón | Mínima transversal en la cara opuesta: A's | criterio del curso | Criterio |  |
| Diseño de la zapata: talón | Mínima longitudinal (repartición), por cara: As,l | criterio del curso | Criterio |  |

## Opción ACI 318-19 (casilla «Versión del código»)

La estabilidad no cambia. Con la casilla en ACI 318-19 (aún no vigente en Chile), el diseño en hormigón armado trata la pantalla como losa en una dirección (13.3.6.1) y el pie y el talón como fundación superficial en una dirección (13.3.2.1):

- Secciones controladas por tracción, εt ≥ εty + 0.003 (7.3.3.1), con φ de la Tabla 21.2.2 y β1 de la Tabla 22.2.2.4.3.
- Corte sin estribos con la expresión (c) de la Tabla 22.5.5.1: Vc = 0.66 λs λ ρw^(1/3) √f'c b d (MPa), con ρw de la armadura de flexión dispuesta. En la pantalla se aplica λs = √(2/(1 + 0.004d)) ≤ 1 (22.5.5.1.3); en el pie y el talón, λs = 1 (13.2.6.2).
- La armadura horizontal de la pantalla es de retracción y temperatura de losa, 0.0018 bh en total para todo diámetro (24.4.3.2); el criterio del curso de 0.001 bh por cara la cumple. La regla de 0.0025 con barras mayores que φ16 era del ACI 318-08 14.3.3 y no se aplica.
- Los coeficientes en MPa se convierten a kgf/cm² con 1 MPa = 10.197 kgf/cm².

Documento: ACI 318M-19 (inglés, unidades SI). La página del PDF es la impresa + 2.

| Parte del cálculo | Referencia ACI 318-19 | Pág. PDF |
|---|---|---|
| Factores de carga | Tabla 5.3.1 | 64 |
| Losa controlada por tracción | 7.3.3.1 | 92 |
| Sección crítica de corte del talón | 7.4.3.2 | 93 |
| Retracción y temperatura | 7.6.4.1 ; 24.4.3.2 | 95 ; 464 |
| Separación máxima | 7.7.2.3 | 97 |
| Efecto de tamaño despreciable en fundaciones | 13.2.6.2 | 196 |
| Sección crítica del pie | 13.2.7.2 | 197 |
| Fundación en una dirección | 13.3.2.1 | 199 |
| Pantalla de muro en voladizo como losa en una dirección | 13.3.6.1 | 200 |
| Factores φ | Tabla 21.2.2 | 395 |
| Bloque de compresiones y β1 | 22.2.2.4 ; Tabla 22.2.2.4.3 | 400 ; 401 |
| Vc ; λs | Tabla 22.5.5.1 ; 22.5.5.1.3 | 406 ; 407 |
