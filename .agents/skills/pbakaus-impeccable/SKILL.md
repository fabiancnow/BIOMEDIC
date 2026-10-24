---
name: pbakaus-impeccable
description: >-
  Pulido de interfaz de precisión óptica inspirado en Paul Bakaus (pbakaus/impeccable),
  auto-corregido para el ecosistema clínico de BioMedic Centro Médico Cuenca.
---

# Impeccable UI Craftsmanship (pbakaus/impeccable) — BioMedic Cuenca

## Estándares de Precisión Óptica y Pulido Clínico

1. **Geometría Concéntrica de Radios (`Outer Radius = Inner Radius + Padding`):**
   - Las tarjetas contenedoras (`.hero-card`, `.hero-desktop-location-card`, `.service-card`, `.booking-form-card`, `.about-card-main`) mantienen radios exteriores armónicos con los elementos internos (`.hdlc-photo-wrap`, `.hdlc-map-embed-wrap`, `.quick-service-btn`), evitando esquinas disonantes.

2. **Alineación Numérica Tabular (`font-variant-numeric: tabular-nums`):**
   - Aplicar `tabular-nums` en horarios (`Lun – Vie: 07:00 a 17:30 · Sáb: 08:00 a 12:30`), contadores del video (`01 / 10`), selectores de turno (`07:30`, `09:30`, `11:00`, `14:30`, `15:30`, `16:30`) y métricas (`< 24 Horas`, `100% Integral`).

3. **Simetría Visual Desktop & Mobile Zero-Overflow:**
   - **En Windows / Escritorio (`>= 1024px`):** La columna izquierda del Hero (`.hero-content` + `.hero-trust-row` + `.hero-desktop-location-card` con foto real del edificio y Google Maps en vivo) empata simétricamente con la columna derecha (`.hero-card`).
   - **En Mobile (`< 1024px`):** Margen lateral limpio de `1rem`, cero desborde horizontal (`overflow-x: hidden`), y orden vertical estricto: Propuesta de Valor + `Agendar Cita Médica Ahora` → `⚡ AGENDA RÁPIDA BIOMEDIC CUENCA` (10 especialidades) → `10 Áreas · < 24 Horas · 100% Integral` → Video 3D (`#heroVideoShowcase`).

4. **Sombras Multicapa de Profundidad Clínica:**
   - Combinar sombra ambiental difusa con borde sutil de alto contraste para que cada tarjeta destaque con nitidez sobre `#F4F6FF` y `#FFFFFF`.
