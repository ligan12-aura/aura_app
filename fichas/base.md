# Ficha normativa: Placa base articulada y empotrada (versión de prueba)

Placa base de columna de acero de sección I sobre un pedestal de hormigón, en dos programas de la misma página: articulada (`?tipo=articulada`, compresión o tracción concéntrica y corte) y empotrada (`?tipo=empotrada`, compresión, momento en el eje fuerte y corte). La placa sigue la AISC Design Guide 1, el aplastamiento y la soldadura la AISC 360-16 y los pernos el Apéndice D del ACI 318-08. Es una **versión de prueba**: los resultados aún no se han validado contra ejemplos publicados.

Documentos: AISC 360-16 (español); ACI 318-08 (español); Manual de Diseño ICHA 2000 (Instituto Chileno del Acero). La AISC Design Guide 1 (2.ª ed.) no está en el proyecto.

## Criterios y límites

### Articulada

- No verifica momento en la base ni las armaduras del pedestal. La tracción T_u es concéntrica, se reparte por igual entre los 4 pernos y se supone concomitante con todo el corte; no se considera el efecto de palanca en la placa.
- Con levantamiento (T_u > 0) no se acepta el roce: el corte va por los pernos o por la llave.
- Sismo (opción): resistencias del hormigón por 0.75 (D.3.3.3) y, a elección, falla dúctil del acero (D.3.3.4: la resistencia del acero debe ser menor que la del menor modo del hormigón) o 0.4 × todas las resistencias (D.3.3.6).
- Armadura de anclaje a tracción (opción): reemplaza el cono de hormigón con 0.75 n A_b f_y (A630-420H); su desarrollo a ambos lados del plano de falla no se verifica.

### Empotrada

- Procedimiento de la AISC Design Guide 1 (2.ª ed., LRFD) con presión rectangular bajo la placa y momento en el eje fuerte. Presión máxima f_p,máx = φc 0.85 f'c √(A2/A1), con √(A2/A1) ≤ 2; q_máx = f_p,máx B; e = M_u/P_u; e_crít = N/2 − P_u/(2 q_máx).
- Momento pequeño (e ≤ e_crít): Y = N − 2e, f_p = P_u/(B Y), sin tracción en los pernos; la tarjeta y la razón D/C son f_p/f_p,máx.
- Momento grande (e > e_crít): la solución existe si (f + N/2)² ≥ 2 P_u (e + f)/q_máx (se informa como D/C "equilibrio con la presión máxima"; si no se cumple, no se sigue calculando y hay que agrandar la placa). Y = (f + N/2) − √((f + N/2)² − 2 P_u (e + f)/q_máx) y T_u = q_máx Y − P_u.
- Espesor del lado comprimido con m y, como indica la guía, también con n en su lugar: Y ≥ ℓ, t = ℓ √(2 f_p/(φ F_y)); Y < ℓ, t = √(4 f_p Y (ℓ − Y/2)/(φ F_y)), con φ = 0.90 (equivalen a los coeficientes 1.5 y 2.11 de la guía). Lado traccionado: x = f − d/2 + t_f/2 y t = √(4 T_u x/(φ F_y B)). No se usa el factor λn' de Thornton.
- Pernos: dos filas de n = 2, 3 o 4 pernos fuera de las alas, a ±f del eje, repartidos en s2. La fila traccionada toma T_u por igual (N_ua = T_u/n). Su cono (D.5.2) es el de la fila sola: borde exterior c_a1 = N_p/2 − f, sin borde hacia el interior, bordes laterales (B_p − s2)/2, ψ_ec,N = 1 y h'_ef de D.5.2.3 con tres bordes a menos de 1.5 h_ef. Desprendimiento lateral de la fila junto al borde exterior (D-18 o D-17) y del perno de esquina hacia el borde lateral (D-17 con factor de esquina).
- Corte por los pernos: todos (2n) con golillas soldadas; arrancamiento fila frontal (c_a1 = N_p/2 − f, V/2) y trasera (c_a1 + 2f, V); palanca con el cono del grupo completo y s = máx(2f ; s2/(n − 1)). Interacción D-32 con la mayor razón de tracción de la fila y la mayor de corte del grupo (conservador). Por roce: φ μ P_u con la P_u de la misma combinación. Por llave: igual que la articulada.
- Soldadura: el momento pasa por las alas como par de brazo d − t_f; ala traccionada M_u/(d − t_f) − P_u/2, comprimida + P_u/2. Con contacto pleno la soldadura del ala toma solo la tracción. Filete en ambas caras (largo 2 b_f − t_w, sin el aumento J2-5) o penetración completa (φ = 0.90 F_y b_f t_f, Tabla J2.5). El alma toma el corte con filete en ambas caras.
- Combinaciones: hasta 6 filas (P_u, M_u, V_u) concomitantes; se verifican todas, se desarrolla la de mayor D/C y el veredicto reúne los motivos de todas. Una combinación con P_u ≤ 0 (tracción neta) queda SIN VERIFICAR.
- Fuera de alcance: placas atiesadoras (sillas), momento en el eje débil, tracción neta con momento y armaduras del pedestal.
- Comprobación: el núcleo del procedimiento (`momentoDG1`) reproduce un ejemplo de momento grande publicado con perfil W18×119 (Y ≈ 1.94 in, T_u ≈ 68 kips, espesores 1.63, 1.93 y 1.09 in) y el ejemplo 2 de la guía de placas base de HSS del Steel Tube Institute (Y = 9.71 in, T_u = 53.3 kips, lado traccionado 0.73 in). El caso de momento pequeño se comprobó a mano (Y = N − 2e, f_p y espesores).

### Comunes

- Extracción: tuerca hexagonal pesada con F = 1.5 d_a + 3 mm (A_brg = 0.866 F² − π d_a²/4) o gancho con 3 d_a ≤ e_h ≤ 4.5 d_a.
- Flexión de la placa por la tracción de los pernos: voladizo de brazo x hasta la cara del perfil más cercana (ala o alma) y ancho efectivo a 45°, hasta x por lado, limitado por la mitad de la separación al perno vecino y por el borde de la placa; t_req = √(4 N_ua x / (φ F_y b_ef)).
- En sismo el hormigón se supone fisurado (D.3.3.3): la página bloquea la opción "no fisurado".
- Desprendimiento lateral: D-17 con el coeficiente 13 de la versión métrica; en el grupo (D-18) N_sb va sin el factor de esquina; con s ≥ 6c_a1 los pernos se toman individuales, con ese factor.
- Llave de corte (AISC Design Guide 1, 2.ª ed., 3.5): aplastamiento φ 0.85 f'c b_L d_L con φ = 0.65 y d_L = H_L − grout; flexión con M_u = V_u (grout + d_L/2) y Z = b t²/4; soldadura con el momento como par de fuerzas de brazo t_L (criterio de structura, conservador); arrancamiento del hormigón 0.33 φ √f'c A_V (MPa) con φ = 0.75 y A_V a 45° descontando el área de apoyo (criterio de ACI 349 que usa la DG1).
- Las expresiones del Apéndice D del ACI 318-08 se evalúan en N, mm y MPa y se convierten a tf.
- El arrancamiento por corte se revisa con dos casos: fila frontal con la mitad del corte y fila trasera con todo el corte (perforaciones sobredimensionadas).
- φc de aplastamiento: 0.65 (AISC 360-16 J8) o 0.60 (Especificación ICHA 13.9), a elección.
- La golilla (cuadrada, lado y espesor de la Tabla 2.3 de la AISC Design Guide 1 llevada a mm) debe quedar fuera del perfil y de su soldadura: la distancia libre debe ser al menos el tamaño del filete (criterio constructivo de structura).
- Sin torque, la distancia mínima al borde (D.8.2) usa el recubrimiento de 7.7.1c (hormigón expuesto): 50 mm para pernos de más de 16 mm y 40 mm hasta 16 mm, medido a la superficie del perno.
- El aplastamiento en la perforación (J3.10) se verifica en la golilla soldada, porque la perforación de la placa está sobredimensionada. Con el corte por los pernos, la soldadura de cada golilla (filete en su contorno, 4 a_g) toma V_u/4 (J2-4), con mínimo de la Tabla J2.4 y máximo de J2.2b (el filete corre por el borde de la golilla).
- El tamaño máximo de J2.2b no se verifica: se refiere a uniones traslapadas, no a la unión en T columna–placa.
- Manual ICHA: la página del PDF es la del archivo Perfiles_icha_2010.pdf.

## Referencias usadas por el cálculo

| Parte del cálculo | Resultado en structura | Referencia | Documento | Pág. PDF |
|---|---|---|---|---|
| Aplastamiento del hormigón | Resistencia al aplastamiento: φcPp | J8-2 | AISC 360-16 (español) |  |
| Aplastamiento del hormigón | Resistencia al aplastamiento: φcPp (φc = 0.60) | 13.9.2 | Manual de Diseño ICHA 2000, Cap. 5 | 546 |
| Espesor de la placa base | Voladizos m, n y λn' | 3.1 | AISC Design Guide 1 (no está en el proyecto) |  |
| Espesor de la placa base | Espesor requerido: treq | 3.3.14a | AISC Design Guide 1 (no está en el proyecto) |  |
| Espesor de la placa base | Placa sin cepillar hasta 50 mm | 16.2.8 | Manual de Diseño ICHA 2000, Cap. 5 | 578 |
| Pernos de anclaje: disposición | Perforación en la placa | Tabla 4-46 | Manual de Diseño ICHA 2000, Cap. 4 | 332 |
| Pernos de anclaje: disposición | Aceros para pernos | Tabla 4-45 | Manual de Diseño ICHA 2000, Cap. 4 | 332 |
| Pernos de anclaje: disposición | Golilla: lado × espesor | Tabla 2.3 | AISC Design Guide 1 (no está en el proyecto) |  |
| Pernos de anclaje: disposición | Separación mínima entre pernos (4da sin torque, 6da con torque) | D.8.1 | ACI 318-08 (español) |  |
| Pernos de anclaje: disposición | Distancia mínima al borde | D.8.2, 7.7.1 | ACI 318-08 (español) |  |
| Transferencia del corte | Resistencia por roce | 3.5 | AISC Design Guide 1 (no está en el proyecto) |  |
| Transferencia del corte | Placa de corte sobre unas 5 t (criterio de detallamiento) | 3.3 | Manual de Diseño ICHA 2000, Cap. 3 | 234 |
| Resistencia del acero del perno | Resistencia a corte del grupo: φVsa | D-20, D.6.1.3 | ACI 318-08 (español) |  |
| Arrancamiento del hormigón por corte | Vb, AVc, AVco, ψed,V, ψc,V, ψh,V | D-22 a D-29 | ACI 318-08 (español) |  |
| Arrancamiento del hormigón por corte | Miembro angosto: ca1 ≤ máx(ca2/1.5 ; ha/1.5 ; s/3) | D.6.2.4 | ACI 318-08 (español) | 432 |
| Aplastamiento en la perforación de la golilla | Aplastamiento del grupo: φRn | J3-6a | AISC 360-16 (español) |  |
| Tracción en los pernos | Tracción en el acero, por perno: φNsa | D-3 | ACI 318-08 (español) |  |
| Tracción en los pernos | Arrancamiento del cono por tracción: φNcbg | D-5 a D-11 | ACI 318-08 (español) |  |
| Tracción en los pernos | Armadura de anclaje a tracción | D.5.2.9 | ACI 318-08 (español) |  |
| Tracción en los pernos | Extracción: Np con tuerca o gancho, φNpn | D-14, D-15, D-16 | ACI 318-08 (español) |  |
| Tracción en los pernos | Desprendimiento lateral: Nsb, Nsbg | D-17, D-18, D.5.4.2 | ACI 318-08 (español) |  |
| Aplastamiento en la perforación de la golilla | Soldadura de las golillas: φRn y tamaños | J2-4, Tabla J2.4, J2.2b | AISC 360-16 (español) |  |
| Tracción en los pernos | Flexión de la placa por la tracción de los pernos | 3.4 | AISC Design Guide 1 (no está en el proyecto) |  |
| Interacción tracción – corte | Nua/φNn + Vua/φVn ≤ 1.2 | D.7, D-32 | ACI 318-08 (español) |  |
| Sismo | Hormigón fisurado; 0.75 en el hormigón; falla dúctil; 0.4 × resistencia | D.3.3.3, D.3.3.4, D.3.3.6 | ACI 318-08 (español) |  |
| Llave de corte | Procedimiento general | 3.5 | AISC Design Guide 1 (no está en el proyecto) |  |
| Llave de corte | Aplastamiento del hormigón | 10.14.1, 9.3.2.4 | ACI 318-08 (español) |  |
| Llave de corte | Flexión de la llave | F11-1 | AISC 360-16 (español) |  |
| Llave de corte | Fluencia por corte de la llave | J4-3 | AISC 360-16 (español) |  |
| Llave de corte | Soldadura de la llave y tamaño mínimo | J2-4, Tabla J2.4 | AISC 360-16 (español) |  |
| Desprendimiento por palanca | h'ef, Nb, Ncbg, φVcpg | D.5.2.3, D-7, D-8, D-31 | ACI 318-08 (español) |  |
| Factores de reducción | φ = 0.65 acero dúctil a corte; φ = 0.70 hormigón, condición B | D.4.4 | ACI 318-08 (español) |  |
| Pernos de anclaje (general) | Diseño según ACI o PCI | 13.10 | Manual de Diseño ICHA 2000, Cap. 5 | 547 |
| Soldadura columna – placa | Resistencia del filete: φrn | J2-4 | AISC 360-16 (español) |  |
| Soldadura columna – placa | Tamaño mínimo del filete: alma ; alas (parte más delgada de cada unión) | Tabla J2.4 | AISC 360-16 (español) |  |
| Soldadura columna – placa | Metal base del alma, fluencia por corte | J4-3 | AISC 360-16 (español) |  |
| Soldadura columna – placa | Compresión por contacto pleno | 13.1.4 | Manual de Diseño ICHA 2000, Cap. 5 | 511 |
| Soldadura columna – placa | Holgura máxima de 2 mm en el contacto | 16.4.4 | Manual de Diseño ICHA 2000, Cap. 5 | 579 |
| Base empotrada: presión y excentricidad | f_p,máx, q_máx, e, e_crít | 3.3, 3.4 | AISC Design Guide 1 (no está en el proyecto; numeración de secciones por confirmar) |  |
| Base empotrada: momento pequeño | Y = N − 2e, f_p, espesor con m y n | 3.3 | AISC Design Guide 1 (no está en el proyecto) |  |
| Base empotrada: momento grande | Existencia de la solución, Y, T_u, espesor de los lados comprimido y traccionado | 3.4 | AISC Design Guide 1 (no está en el proyecto) |  |
| Base empotrada: fila traccionada | Cono de la fila, h'ef, ψed,N | D.5.2, D-5, D-6, D-11, D.5.2.3 | ACI 318-08 (español) |  |
| Base empotrada: soldadura de las alas | Penetración completa, tracción normal al eje | Tabla J2.5 | AISC 360-16 (español) |  |
