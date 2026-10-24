---
name: emilkowalski-animations
description: >-
  Ingeniería de animaciones y micro-interacciones web inspirada en Emil Kowalski
  (emilkowalski/skill), auto-corregida y adaptada a HTML5 + CSS3 GPU + Vanilla JS
  para BioMedic Centro Médico Cuenca.
---

# Emil Kowalski Animations & Micro-Interactions — BioMedic Cuenca

## Reglas de Ingeniería de Movimiento (Auto-Corregidas a CSS3 Puro / 60fps)

1. **Curvas de Aceleración Naturales (Spring-like Cubic Beziers):**
   - Utilizar curvas físicas suaves en lugar de transiciones lineales:
     - `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` para entradas de tarjetas, modales y menús.
     - `--ease-spring: cubic-bezier(0.22, 1, 0.36, 1)` para giros 3D (`#hvsStage`), botones y píldoras interactivas.

2. **Respuesta Táctil Instantánea (`scale(0.98)` en `:active`):**
   - Todo botón interactivo (`.btn`, `.quick-service-btn`, `.hvs-tab`, `.slot-btn`, `.filter-tab`) debe responder al toque/clic con `transform: scale(0.98)` en estado `:active` para dar sensación táctil nativa en iOS, Android y Windows.

3. **Animaciones Exclusivamente en Propiedades Aceleradas por GPU:**
   - Animar únicamente `transform` y `opacity` para garantizar 60fps constantes sin provocar *layout shifts* ni cambiar el tamaño de contenedores (como `#hvsStage`, cuya altura se mantiene fija en `310px` en las 10 especialidades).

4. **Respeto a `prefers-reduced-motion`:**
   - Si el dispositivo del paciente solicita reducir movimiento (`@media (prefers-reduced-motion: reduce)`), atenuar giros y transiciones largas manteniendo la funcionalidad intacta.
