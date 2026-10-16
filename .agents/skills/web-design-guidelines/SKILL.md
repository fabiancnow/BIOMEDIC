---
name: web-design-guidelines
description: >-
  Guía de interfaz web de Vercel (spacing, tipografía, interacción, estados de
  formulario y accesibilidad Mobile + Desktop) aplicada a BIOMEDIC.
---

# Web Design Guidelines (Vercel) — BIOMEDIC

1. **Tipografía y Jerarquía:**
   - Usar escalas fluidas con `clamp()` y `line-height` legible (`1.12` en títulos, `1.6` en cuerpo).
2. **Formularios e Interacción:**
   - Todos los `<input>`, `<select>` y `<textarea>` deben tener `<label for="...">` explícito, `autocomplete` apropiado y retroalimentación clara al enviar (`disabled` durante carga).
3. **Accesibilidad y Dispositivos:**
   - Contraste WCAG AA mínimo, navegación por teclado (`:focus-visible`) y áreas táctiles amplias en pantallas móviles.
