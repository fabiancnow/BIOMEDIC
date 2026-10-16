# ENTREGABLE DEL CAPÍTULO 2: ARQUITECTURA ORIENTADA A LA CONVERSIÓN, BACKEND SERVERLESS Y DESPLIEGUE CONTINUO
**Proyecto:** BioMedic Centro Médico — Cuenca, Ecuador (Salud Integral, Laboratorio Clínico y Licencias Sanitarias ARCSA)  
**Autor:** Fabián Campoverde  
**Fecha:** Octubre 2026  

---

## 1. Enlaces Oficiales de Producción (Despliegue Continuo CI/CD)

| Componente | Enlace Activo / Identificador | Estado |
| :--- | :--- | :--- |
| **Aplicación Web en Producción (Vercel HTTPS)** | **[https://biomedic-opal.vercel.app/](https://biomedic-opal.vercel.app/)** | 🟢 En línea (SSL/TLS Activo) |
| **Repositorio de Código Fuente (GitHub)** | **[https://github.com/fabiancnow/BIOMEDIC](https://github.com/fabiancnow/BIOMEDIC)** | 🟢 Rama `main` sincronizada |
| **Base de Datos Cloud PostgreSQL (Supabase)** | `https://kffjiaxonrkouygbmphd.supabase.co` | 🟢 `public.leads` + `Supabase Auth` (RLS Activo) |

---

## 2. Justificación Estratégica de UX y Arquitectura de Conversión (1 Página)

### 2.1. Traducción de la Inteligencia de Mercado (Fase 1 con Apify) al Diseño Visual
Mediante la extracción automatizada de datos ejecutada con **Apify (`apify/google-search-scraper`)** sobre el ecosistema de salud y regulación sanitaria en **Cuenca, Ecuador**, se identificaron tres fricciones críticas en los pacientes y empresas locales:
1. **Incertidumbre en tiempos de entrega y toma de muestras de Laboratorio Clínico:** Los pacientes buscan atención sin filas desde las 07:00 AM, toma de muestras a domicilio en Cuenca y entrega digital de resultados en el mismo día.
2. **Complejidad técnica, rechazos de carpetas y multas de ARCSA:** Emprendedores y fabricantes de alimentos procesados, cosméticos y productos naturales en el Austro carecen de un proveedor integral que combine **asesoría regulatoria ARCSA + análisis fisicoquímicos/microbiológicos de laboratorio** en una sola sede.
3. **Fragmentación en citas médicas familiares:** Las familias cuencanas requieren centralizar **Medicina General, Pediatría, Ginecología, Odontología y Psicología Clínica** con agendamiento inmediato en línea sin llamadas telefónicas fallidas.

### 2.2. Jerarquía Visual Clínica y Adaptabilidad Dual (Mobile-First + Desktop Widescreen)
Siguiendo las reglas de los *Agent Skills* instalados (`frontend-design`, `web-design-guidelines`, `page-cro-copywriting`, `marketing-psychology` y `supabase-postgres-best-practices`), la interfaz fue diseñada aplicando la identidad cromática oficial de **BioMedic Centro Médico**:
- **Azul Índigo Clínico (`#231F6E`):** Transmite rigor científico, respaldo médico, confianza institucional y cumplimiento normativo.
- **Rojo Carmesí Médico (`#D3122A`):** Reservado estratégicamente para llamados a la acción (CTAs), alertas de prevención regulatoria ARCSA y confirmación de turnos médicos.
- **Experiencia Dual (Mobile + Desktop):** En **Desktop**, el sistema despliega una cuadrícula de dos columnas asimétricas con resumen dinámico de cita en tiempo real; en **Mobile**, se adapta con controles táctiles ergonómicos (`min-height: 48px`), navegación simplificada y selección rápida de especialidad en un toque.

### 2.3. Psicología del Formulario Filtro y Pre-Calificación de Prospectos (`public.leads`)
A diferencia de un formulario de contacto genérico que captura prospectos sin intención real de compra, el **Formulario Filtro Inteligente de BioMedic** actúa como un embudo de calificación comercial y triaje clínico conectado a **Supabase Auth** y a la tabla PostgreSQL **`public.leads`**:
- **Identificación y Canal Directo (`nombre_completo`, `correo_electronico`, `whatsapp`, `empresa_negocio`):** Permite distinguir de inmediato entre un paciente particular (B2C) y una empresa productora o institución (B2B) que requiere convenios o registros sanitarios ARCSA.
- **Filtro de Capacidad de Inversión (`presupuesto_estimado`):** Segmenta automáticamente el ticket esperado en dólares estadounidenses (desde consultas/exámenes individuales de `$35 - $250 USD` hasta proyectos integrales de licenciamiento ARCSA y convenios corporativos superiores a `$2,500 USD`), permitiendo priorizar la atención comercial de alto valor.
- **Contexto Clínico/Regulatorio Enriquecido (`dolor_principal`):** Concatena automáticamente la **Especialidad médica o trámite ARCSA seleccionado**, la **Fecha y Hora del turno**, la **Modalidad (Presencial en Sede Cuenca, Domicilio o Teleconsulta)** y la necesidad específica del paciente, entregando al equipo médico de BioMedic un expediente pre-calificado listo para confirmar por WhatsApp.

---

## 3. Evidencia de Persistencia Real en la Nube (Supabase PostgreSQL — Tabla `public.leads`)

A continuación se documentan los registros reales insertados y verificados en la instancia de producción de Supabase (`Project ID: kffjiaxonrkouygbmphd`), cumpliendo con las políticas de seguridad **Row Level Security (RLS)** y la estructura relacional exigida:

| ID Registro (UUID) | Fecha UTC (`created_at`) | Nombre Completo | Correo Electrónico | WhatsApp | Empresa / Paciente | Presupuesto Estimado | Dolor Principal y Cita Agendada | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `04868ec7-b812-49a9-8422-e3ab11b6e4e9` | `2026-10-16 18:51:21+00` | **Dra. Valeria Espinoza** | `valeria.espinoza@clinicasantaines-cuenca.ec` | `+593 99 842 1503` | Clínica & Laboratorio Bioderm Cuenca | `$800 - $2,500 USD (2 a 4 Productos + Análisis de Laboratorio)` | `[Especialidad: Licencias y Registros Sanitarios ARCSA para Crear Productos \| Fecha: 2026-10-20 10:30 \| Modalidad: Presencial en Sede Cuenca]` Necesitamos obtener Notificación Sanitaria Obligatoria (NSO) ARCSA y análisis microbiológicos/fisicoquímicos de laboratorio para lanzar nuestra línea de 3 dermocosméticos en Cuenca. | `Pre-calificado VIP` |
| `f2fb43ff-a3f2-4ebc-a562-9e63abd9660e` | `2026-10-16 18:51:21+00` | **Ing. Mateo Cordero** | `mcordero@alimentosdelaustro.com.ec` | `+593 98 411 7920` | Alimentos del Austro S.A. / Paciente Particular | `$250 - $800 USD (Chequeo Ejecutivo / 1 Registro Sanitario ARCSA)` | `[Especialidad: Exámenes de Laboratorio Clínico y Medicina General \| Fecha: 2026-10-21 08:00 \| Modalidad: Toma de Muestras a Domicilio en Cuenca]` Solicito perfil lipídico, tiroideo y chequeo médico general preventivo a domicilio para 4 directivos en el sector El Vergel, más cotización de registro sanitario de alimentos. | `Pre-calificado` |
