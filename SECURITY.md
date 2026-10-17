# Política de Seguridad, Privacidad (LOPDP Ecuador) y Gobernanza de Datos — BioMedic Centro Médico

## 1. Marco Legal Aplicable en la República del Ecuador
- **Ley Orgánica de Protección de Datos Personales (LOPDP — Registro Oficial Suplemento 459):** Cumplimiento estricto de los principios de licitud, lealtad, transparencia, finalidad, pertinencia y minimización de datos (Art. 10), consentimiento expreso e informado (Art. 7 y 8) y protección reforzada de datos sensibles relativos a la salud (Art. 25 y 26).
- **Ley Orgánica de Salud del Ecuador:** Confidencialidad y secreto profesional médico sobre motivos de consulta en las 9 áreas clínicas/diagnósticas (Laboratorio Clínico, Fisioterapia, Ginecología, Odontología, Pediatría, Medicina General, Geriatría, Psicología y Cardiología).
- **Normativa ARCSA:** Confidencialidad industrial sobre formulaciones y carpetas técnicas de alimentos procesados, cosméticos y productos naturales.

---

## 2. Controles Técnicos de Ciberseguridad Implementados

| Capa de Seguridad | Archivo / Componente | Medida Implementada |
| :--- | :--- | :--- |
| **1. Cabeceras HTTP y CSP en Producción** | [`vercel.json`](./vercel.json) | `Strict-Transport-Security (HSTS)`, `Content-Security-Policy (CSP)`, `X-Frame-Options: DENY` (Anti-Clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Permissions-Policy`. |
| **2. Seguridad en Base de Datos (RLS)** | [`supabase_schema.sql`](./supabase_schema.sql) | **Row Level Security (RLS)** activo en `public.leads`. Operaciones `UPDATE` y `DELETE` bloqueadas para clientes públicos. |
| **3. Autenticación Cifrada JWT** | [`app.js`](./app.js) | Integración oficial con **Supabase Auth** (`signUp`, `signInWithPassword`, `signOut`, `onAuthStateChange`). |
| **4. Enmascaramiento de Datos Sensibles (PII Masking)** | [`app.js`](./app.js) | Los números de WhatsApp y correos electrónicos en el panel de demostración se enmascaran automáticamente (`+593 *** 503`, `va***@dominio.ec`) cuando el visitante no tiene sesión verificada en Supabase Auth. |
| **5. Sanitización Anti-XSS e Inyección** | [`app.js`](./app.js) | Validación estricta de formato de email/teléfono, límite de longitud de campos, eliminación de etiquetas HTML (`sanitizePlainText`) y codificación segura de salida (`escapeHtml`). |
| **6. Protección Anti-Bots y Anti-Spam** | [`index.html`](./index.html) / [`app.js`](./app.js) | Campo trampa invisible (*Honeypot* `website_hp`) para bloquear bots automatizados + *Rate-Limiting* de 15 segundos entre envíos consecutivos. |
| **7. Consentimiento Explícito LOPDP y Cookies** | [`index.html`](./index.html) / [`app.js`](./app.js) | Casilla obligatoria de consentimiento informado con sello de tiempo UTC auditable + Banner interactivo de Galletas (Cookies) con opción de revocación en 1 clic. |
| **8. Protección de Secretos de Servidor** | [`.gitignore`](./.gitignore) / [`.env.example`](./.env.example) | Exclusión total de `.env` del control de versiones para proteger tokens privados (`APIFY_API_TOKEN`). |
