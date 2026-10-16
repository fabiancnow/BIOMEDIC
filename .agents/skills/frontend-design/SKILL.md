---
name: frontend-design
description: >-
  Diseño de interfaces web de grado producción (Mobile-First y Desktop Widescreen)
  para BIOMEDIC Cuenca. Aplica jerarquía visual clínica, tipografía moderna,
  micro-interacciones y componentes de alta conversión.
---

# Frontend Design — BIOMEDIC

## Reglas de Diseño Visual y Adaptativo (Mobile + Desktop)

1. **Estética Biomédica de Confianza (Identidad Oficial BioMedic):**
   - Combinar los colores del logo oficial: **Azul Índigo Corporativo** (`#231F6E` / `#191654`) y **Rojo Carmesí Médico** (`#D3122A` / `#B00E22`) sobre fondos clínicos limpios (`#F7F8FC`, `#FFFFFF` y `#EEF0FF`).
2. **Arquitectura Dual (Mobile-First + Escritorio):**
   - **Móvil (`< 768px`):** Botones táctiles de mínimo `44px` de alto, barra inferior flotante fija (*Sticky Bottom Bar*) para reservar en 1 toque y campos de formulario con `autocomplete` y teclado adaptado (`type="tel"`, `type="email"`).
   - **Escritorio (`>= 1024px`):** Hero en grilla asimétrica de 2 columnas con widget interactivo en vivo, catálogo en Bento Grid de 3 columnas y resumen de cita fijo (`position: sticky`) junto al formulario.
3. **Rendimiento y Carga Óptima:**
   - Cero dependencias pesadas innecesarias; uso de CSS Grid/Flexbox nativo, `<dialog>` nativo y tipografía optimizada con `font-display: swap`.
