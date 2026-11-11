# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Estudiantes de ingeniería civil (cursos como Hormigón Armado IIO348 y Diseño de Proyectos de Ingeniería) y calculistas profesionales que verifican elementos estructurales y firman memorias. Ambos públicos pesan lo mismo.

## Product Purpose
structura verifica elementos estructurales según normas chilenas y AISC y entrega la razón demanda/capacidad de cada verificación con su cláusula, la memoria de cálculo y el plano. Éxito: el usuario llega a un veredicto confiable y a una memoria lista para entregar sin rehacer el cálculo a mano.

## Positioning
Una sola app, en español de Chile, que cubre acero, hormigón, madera, fundaciones, sismo, viento y pavimentos con normas chilenas (NCh) y AISC 360-16, y que exporta la memoria .tex para Overleaf y planos DXF con viñeta NCh 13.

## Operating Context
PWA en HTML y JS puro publicada en GitHub Pages. Acceso con Google (Supabase); solo correos autorizados. Funciona sin conexión con service worker. Modo claro u oscuro según el sistema o la elección guardada.

## Capabilities and Constraints
- Sin frameworks, CDN nuevos ni pasos de compilación. Recursos externos permitidos: KaTeX, supabase-js y reCAPTCHA.
- Sin fuentes web: pila del sistema ("Segoe UI", system-ui).
- Varias herramientas están marcadas como versión de prueba (placa base, conexiones, viento).
- Bienvenida tras iniciar sesión: se muestra en cada inicio, con animación breve, botón «Entrar» y avance automático al terminar.

## Brand Commitments
- Nombre: structura, en minúsculas. Isotipo «S de pórticos»: tres vigas y dos columnas con un nudo naranja (`icons/structura.svg`).
- Paleta de `aura.css`: azul #00008B, naranja #e65c00, gris acero #e3e6ea; en oscuro azul #2c3cc8 y naranja #ff8a3d.
- Tono técnico y sobrio, en español de Chile.
- La bienvenida puede afirmar: normas chilenas y AISC por disciplina; memorias .tex y planos DXF. No mencionar a MMP ni a Hormi en la bienvenida.

## Evidence on Hand
Herramientas y normas listadas en `index.html` y `lateral.js`. No hay testimonios, clientes, cifras de uso ni precios: no inventarlos.

## Product Principles
1. Un dato sin verificar nunca se presenta como cumplimiento.
2. Cada resultado lleva su razón D/C y su referencia a la norma.
3. Rapidez para llegar al cálculo: nada debe demorar al usuario que ya sabe qué quiere hacer.

## Accessibility & Inclusion
Contraste 4,5:1 en texto, foco visible, uso con teclado y respeto de `prefers-reduced-motion`.
