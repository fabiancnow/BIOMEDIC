# Fase 1: Arquitectura del Negocio e Inteligencia de Mercado — BIOMEDIC (Cuenca, Ecuador)

> **Fuente de Datos:** Extracción automatizada en vivo mediante **Apify API** (`apify/google-search-scraper`, región `EC`, idioma `ES`) ejecutada desde [`estudio_mercado_apify.py`](file:///Users/fabiancampoverde/Desktop/BIOMEDIC/fase1_investigacion/estudio_mercado_apify.py) y almacenada en [`apify_mercado_cuenca.json`](file:///Users/fabiancampoverde/Desktop/BIOMEDIC/fase1_investigacion/apify_mercado_cuenca.json).

---

## 1. Hallazgos Clave del Mercado en Cuenca (Evidencia Apify)

### A. Segmento Laboratorio Clínico y Toma de Muestras en Cuenca
* **Competidores detectados por Apify:**
  * *Cadenas y Hospitales:* Hospital Santa Inés, Hospital del Río, Veris, Interlab.
  * *Laboratorios locales:* Laboratorio Clínico Platinum (`laboratorioplatinum.com`), Accu-Lab (`acculab.bio`).
* **Búsquedas frecuentes de los usuarios en Google Ecuador (*People Also Ask*):**
  1. *"¿Cuáles son los precios de los exámenes de laboratorio?"*
  2. *"¿Cuánto cuesta un examen de sangre en Ecuador?"*
  3. *"¿Cuánto cuesta un examen de orina completo?"*
* **Vacío de mercado detectado:** Los usuarios buscan transparencia de costos, toma de muestras sin filas (o a domicilio/empresa) y entrega rápida de resultados digitales.

### B. Segmento Licencias para Crear Productos y Registro Sanitario (ARCSA)
* **Competidores y contexto detectado por Apify:**
  * Consultoras regulatorias nacionales (`asetecni.com`, `iurisred.com`, `registrosanitarioec.com`, `fcomex.com`) y páginas de Facebook locales (`Registros Sanitarios Cuenca`).
  * **Alerta de mercado real en Cuenca:** Apify detectó noticias oficiales del portal `controlsanitario.gob.ec` sobre *clausuras de establecimientos en Cuenca por comercializar productos sin registro sanitario*.
* **Búsquedas frecuentes de los usuarios (*People Also Ask*):**
  1. *"¿Cuánto cuesta el registro del ARCSA?"*
  2. *"¿Qué establece la Resolución ARCSA-DE-036-2020-MAFG?"*
  3. *"¿Dónde puedo encontrar la normativa e instructivos de la ARCSA?"*
* **Vacío de mercado detectado:** Los emprendedores y empresas en Cuenca sufren porque tienen que contratar por un lado a un tramitador legal y por otro lado buscar un laboratorio que haga los análisis fisicoquímicos/microbiológicos de sus productos (alimentos, cosméticos, suplementos, productos naturales). **BIOMEDIC une Laboratorio + Gestión de Licencias en un solo lugar.**

### C. Segmento Especialidades Clínicas (Medicina General, Psicología, Odontología)
* **Competidores detectados por Apify:**
  * Consultorios fragmentados (`Clinident Cuenca`, `Psicología Integral`, `ODONTOint`, `CD Odontología Integral`) que operan únicamente con páginas de Facebook, perfiles de Instagram o sitios gratuitos dados de baja (`negocio.site`).
* **Vacío de mercado detectado:** Ausencia de una plataforma web integral donde un paciente o empresa de Cuenca pueda agendar en 1 minuto Medicina General, Odontología, Psicología o Laboratorio sin esperar horas a que una recepcionista conteste el teléfono.

---

## 2. Matriz de Puntos de Dolor (Pain Points) $\rightarrow$ Solución en la Web de BIOMEDIC

| # | Dolor Real Detectado en Apify | Quién lo sufre | Cómo lo resuelve la Landing + Web App de BIOMEDIC |
| :--- | :--- | :--- | :--- |
| **Dolor 1** | **Incertidumbre de precios y demoras para cotizar o agendar exámenes de laboratorio.** | Pacientes particulares y empresas en Cuenca. | Catálogo claro de servicios con tiempos de entrega, preparación previa y reserva de turno inmediata 24/7. |
| **Dolor 2** | **Trámites confusos, lentos y riesgo de multas/clausuras de ARCSA al crear o vender productos sin licencia ni análisis de laboratorio.** | Emprendedores, fabricantes de alimentos, cosméticos y productos naturales. | Módulo especializado de **Licencias y Registros Sanitarios + Análisis de Laboratorio** con diagnóstico y cotización según presupuesto. |
| **Dolor 3** | **Atención médica fragmentada (tener que ir a distintos lugares para Medicina General, Odontología, Psicología y Laboratorio).** | Familias, profesionales ocupados y departamentos de RRHH. | Centro Médico Integral en Cuenca: todas las especialidades y laboratorio bajo un mismo techo y una sola agenda digital. |
| **Dolor 4** | **Falta de respuesta rápida en WhatsApp/teléfono para confirmar citas urgentes.** | Pacientes con dolor dental, urgencia médica o necesidad psicológica. | Formulario de reserva y cualificación conectado en tiempo real a **Supabase** con confirmación inmediata. |

---

## 3. Arquitectura del Negocio y Diseño del Formulario Filtro (Fase 2)

Para cumplir al 100% con la rúbrica técnica y con el modelo real de **BIOMEDIC**, el formulario de conversión y reserva enlazado a la tabla **`leads`** de **Supabase** tendrá la siguiente arquitectura estratégica:

### Campos Obligatorios de la Rúbrica + Motor de Reserva BIOMEDIC:
1. **Nombre completo** (`nombre_completo` - `text`): Identificación del paciente o representante comercial.
2. **Correo electrónico** (`correo_electronico` - `text`): Envío de confirmación de cita, proforma o resultados digitales.
3. **WhatsApp** (`whatsapp` - `text`): Canal directo para recordatorio automático y contacto inmediato en Cuenca.
4. **Empresa / Negocio (o Particular)** (`empresa_negocio` - `text`):
   * *Por qué cualifica:* Permite identificar de inmediato si es un **cliente B2B / Emprendedor** (que requiere licencias ARCSA para sus productos o chequeos ocupacionales para su personal) o un **Paciente Particular/Familiar**.
5. **Presupuesto estimado** (`presupuesto_estimado` - `text` - Menú desplegable con rangos comerciales):
   * `Menos de $50 USD (Consulta individual / Exámenes básicos)`
   * `$50 - $150 USD (Chequeo integral / Tratamiento odontológico o psicológico)`
   * `$150 - $500 USD (Análisis de producto + Trámite de Licencia / Paquete familiar)`
   * `Más de $500 USD (Certificación sanitaria completa de línea de productos / Convenio empresarial)`
   * *Por qué descalifica prospectos no aptos:* Filtra a quienes buscan trámites regulatorios complejos o análisis industriales sin contar con el presupuesto mínimo de tasas ARCSA y pruebas de laboratorio, priorizando la atención comercial.
6. **Dolor principal / Mayor obstáculo (y Especialidad + Fecha de Reserva)** (`dolor_principal` - `text`):
   * Combina la selección de **Área requerida** (*Laboratorio Clínico, Licencias para Productos ARCSA, Medicina General, Psicología, Odontología*), **Fecha/Hora deseada de cita** y el **obstáculo o motivo principal** del cliente.
