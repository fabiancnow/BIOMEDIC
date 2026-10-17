---
name: frontend-design
description: >-
  Diseño de interfaces web de grado producción (Mobile-First y Desktop Widescreen)
  para BIOMEDIC Cuenca. Aplica jerarquía visual clínica, tipografía moderna de alto
  contraste, Reel de Video Interactivo de 10 Especialidades en el Hero y componentes
  de alta conversión.
---

# Frontend Design — BIOMEDIC Centro Médico (Cuenca)

## Reglas de Diseño Clínico de Alta Conversión (Skills.sh / Anthropic Standard)

1. **Identidad Cromática Oficial (Logo BioMedic):**
   - **Azul Índigo Biomédico (`#231F6E` / `#131047`):** Autoridad médica, confianza institucional y rigor diagnóstico.
   - **Rojo Carmesí Clínico (`#D3122A`):** Acción prioritaria, urgencia médica y acentos de conversión.
   - **Superficies Clínicas Puras (`#FFFFFF` y `#F4F6FF`):** Máxima limpieza visual y legibilidad sin fatiga ocular.

2. **Tipografía Nítida de Alto Contraste (Anti-Blur):**
   - Títulos en `Plus Jakarta Sans` (`700`/`800`) y cuerpo en `Inter` (`500`/`600`) con `text-rendering: optimizeLegibility` y tinta oscura `#0B0A24` / `#2D334A` (contraste WCAG AAA > 12:1).

3. **Hero Widescreen con Video Clínico de las 10 Especialidades (`#heroVideoShowcase`):**
   - Alineación superior perfecta (`align-items: start`) entre la columna izquierda y el widget derecho para eliminar espacios vacíos sobre el distintivo `CENTRO MÉDICO INTEGRAL · CUENCA`.
   - Reproductor interactivo en vivo que recorre automáticamente las **10 áreas oficiales**: Laboratorio Clínico, Fisioterapia, Ginecología, Odontología, Pediatría, Medicina General, Geriatría, Psicología Clínica, Cardiología y Registros Sanitarios ARCSA, combinando imagen clínica HD + telemetría biomédica en Canvas Retina 2x a 60fps.

4. **Adaptabilidad Dual (Mobile-First + Desktop Widescreen):**
   - En móvil: Barra inferior fija de acción rápida y controles táctiles de mínimo `44x44px`.
   - En escritorio (`>= 1024px`): Grillas multi-columna balanceadas, selector rápido interactivo y resumen flotante (`sticky`).
