---
name: web-design-guidelines
description: >-
  Guía de interfaz web de Vercel (spacing, tipografía de alta definición,
  interacción en video, estados de formulario, cumplimiento LOPDP y accesibilidad
  Mobile + Desktop) aplicada a BIOMEDIC.
---

# Web Design Guidelines — BIOMEDIC Centro Médico (Cuenca)

## Reglas de Interfaz, Nitidez Visual y Accesibilidad (Vercel Standard)

1. **Nitidez Tipográfica y Contraste Clínico:**
   - Renderizado de fuente de máxima precisión (`text-rendering: optimizeLegibility`, `-webkit-font-smoothing: antialiased`) sin textos grises pálidos ni desenfoques sobre texto.
2. **Alineación Geométrica en el Hero (`align-items: start`):**
   - La columna principal izquierda incorpora el **Monitor de Video Clínico de las 10 Especialidades (`#heroVideoShowcase`)** en su parte superior, nivelando exactamente el borde superior con el widget de Agenda Rápida a la derecha y eliminando cualquier espacio muerto.
3. **Estados de Formulario y Seguridad:**
   - Validación clara en cada input, trampa anti-bots (`honeypot`), casilla de consentimiento informado LOPDP Ecuador y estados visuales de carga/éxito al insertar en Supabase (`public.leads`).
4. **Accesibilidad Táctil y Teclado:**
   - Todos los botones, selectores de horario y pestañas de las 10 especialidades en el reproductor de video cuentan con `focus-visible`, etiquetas `aria-label` y área táctil óptima.
