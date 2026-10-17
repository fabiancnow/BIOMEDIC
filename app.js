/**
 * BIOMEDIC CENTRO MÉDICO CUENCA — Lógica de la Landing + Web App,
 * Experiencia en Video "Motion Sites" (5 Áreas), Supabase Auth y Tabla `leads`
 */

(function () {
  const config = window.BIOMEDIC_CONFIG || {};
  const supabaseUrl = (config.SUPABASE_URL || "").trim();
  const supabaseKey = (config.SUPABASE_ANON_KEY || "").trim();

  let supabaseClient = null;
  let currentAuthUser = null;
  let authMode = "login"; // "login" | "signup"

  const statusBadge = document.getElementById("supabaseStatusBadge");
  const leadsCountBadge = document.getElementById("leadsCountBadge");

  if (
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("tu-proyecto") &&
    window.supabase
  ) {
    try {
      supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
      if (statusBadge) {
        statusBadge.textContent = "● Conectado a Supabase (Auth + leads)";
        statusBadge.classList.add("connected");
      }
    } catch (err) {
      console.error("Error inicializando Supabase:", err);
    }
  } else if (statusBadge) {
    statusBadge.textContent = "● Modo Local (Pendiente llaves Supabase)";
  }

  // 1. Menú móvil
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

  // 2. Inicializar fecha mínima
  const fechaInput = document.getElementById("fecha_cita");
  const summaryDate = document.getElementById("summaryDate");
  if (fechaInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    fechaInput.min = formattedToday;
    fechaInput.value = formattedToday;
    if (summaryDate) summaryDate.textContent = formattedToday;

    fechaInput.addEventListener("change", () => {
      if (summaryDate) summaryDate.textContent = fechaInput.value || "Por definir";
    });
  }

  // 3. Sincronización de Especialidad, Modalidad y Horario
  const serviceSelect = document.getElementById("especialidad_servicio");
  const modalitySelect = document.getElementById("modalidad_atencion");
  const budgetSelect = document.getElementById("presupuesto_estimado");
  const timeHidden = document.getElementById("hora_cita");
  const summaryService = document.getElementById("summaryService");
  const summaryTime = document.getElementById("summaryTime");
  const summaryModality = document.getElementById("summaryModality");

  function setServiceSelection(serviceName, suggestedBudget) {
    if (serviceSelect && serviceName) {
      serviceSelect.value = serviceName;
      if (summaryService) summaryService.textContent = serviceName;
    }
    if (budgetSelect && suggestedBudget && !budgetSelect.value) {
      budgetSelect.value = suggestedBudget;
    }
  }

  if (serviceSelect) {
    serviceSelect.addEventListener("change", () => {
      if (summaryService) summaryService.textContent = serviceSelect.value;
    });
  }

  if (modalitySelect) {
    modalitySelect.addEventListener("change", () => {
      if (summaryModality) summaryModality.textContent = modalitySelect.value;
    });
  }

  const quickButtons = document.querySelectorAll(".quick-service-btn");
  quickButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      quickButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const chosen = btn.getAttribute("data-service");
      setServiceSelection(chosen);
    });
  });

  const catalogButtons = document.querySelectorAll(".select-service-btn");
  catalogButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosen = btn.getAttribute("data-service");
      const budget = btn.getAttribute("data-budget");
      setServiceSelection(chosen, budget);
      const reservarSection = document.getElementById("reservar");
      if (reservarSection) {
        reservarSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  const filterTabs = document.querySelectorAll(".filter-tab");
  const serviceCards = document.querySelectorAll(".service-card");
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const filter = tab.getAttribute("data-filter");
      serviceCards.forEach((card) => {
        const cat = card.getAttribute("data-category");
        card.style.display = filter === "todos" || cat === filter ? "flex" : "none";
      });
    });
  });

  const slotBtns = document.querySelectorAll(".slot-btn");
  slotBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      slotBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const selectedTime = btn.getAttribute("data-time");
      if (timeHidden) timeHidden.value = selectedTime;
      if (summaryTime) summaryTime.textContent = selectedTime;
    });
  });

  // ==========================================================================
  // 4. SUPABASE AUTH — Registro, Inicio de Sesión, Auto-llenado y Mis Citas
  // ==========================================================================
  const authDialog = document.getElementById("authDialog");
  const openAuthBtn = document.getElementById("openAuthBtn");
  const closeAuthBtn = document.getElementById("closeAuthBtn");
  const authBtnLabel = document.getElementById("authBtnLabel");
  const adminAuthStatusPill = document.getElementById("adminAuthStatusPill");
  const tabLoginBtn = document.getElementById("tabLoginBtn");
  const tabSignupBtn = document.getElementById("tabSignupBtn");
  const signupExtraFields = document.getElementById("signupExtraFields");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const supabaseAuthForm = document.getElementById("supabaseAuthForm");
  const authFeedback = document.getElementById("authFeedback");
  const authGuestView = document.getElementById("authGuestView");
  const authUserView = document.getElementById("authUserView");
  const signOutBtn = document.getElementById("signOutBtn");

  function showAuthFeedback(msg, type) {
    if (!authFeedback) return;
    authFeedback.hidden = false;
    authFeedback.className = `form-feedback ${type}`;
    authFeedback.innerHTML = msg;
  }

  function setAuthModeUI(mode) {
    authMode = mode;
    if (tabLoginBtn) tabLoginBtn.classList.toggle("active", mode === "login");
    if (tabSignupBtn) tabSignupBtn.classList.toggle("active", mode === "signup");
    if (signupExtraFields) signupExtraFields.hidden = mode === "login";
    if (authSubmitBtn) {
      authSubmitBtn.textContent =
        mode === "login"
          ? "Iniciar Sesión con Supabase Auth"
          : "Crear Cuenta en BioMedic (Supabase Auth)";
    }
    if (authFeedback) authFeedback.hidden = true;
  }

  if (tabLoginBtn) tabLoginBtn.addEventListener("click", () => setAuthModeUI("login"));
  if (tabSignupBtn) tabSignupBtn.addEventListener("click", () => setAuthModeUI("signup"));

  async function applyAuthState(user) {
    currentAuthUser = user || null;
    const meta = (user && user.user_metadata) || {};
    const fullName = meta.nombre_completo || (user && user.email ? user.email.split("@")[0] : "");
    const email = (user && user.email) || "";
    const whatsapp = meta.whatsapp || "";
    const role = meta.rol || "Paciente / Familiar";

    if (user) {
      if (openAuthBtn) openAuthBtn.classList.add("logged-in");
      if (authBtnLabel) authBtnLabel.textContent = `Mi Cuenta (${fullName})`;
      if (adminAuthStatusPill) adminAuthStatusPill.textContent = `Sesión Auth: ${email}`;
      if (authGuestView) authGuestView.hidden = true;
      if (authUserView) authUserView.hidden = false;

      const nameEl = document.getElementById("userProfileName");
      const emailEl = document.getElementById("userProfileEmail");
      const roleEl = document.getElementById("userProfileRole");
      const avatarEl = document.getElementById("userAvatarInitials");

      if (nameEl) nameEl.textContent = fullName;
      if (emailEl) emailEl.textContent = email;
      if (roleEl) roleEl.textContent = role;
      if (avatarEl) {
        avatarEl.textContent = fullName.slice(0, 2).toUpperCase() || "BM";
      }

      // Pre-cargar datos en el formulario de reservación
      const fNombre = document.getElementById("nombre_completo");
      const fCorreo = document.getElementById("correo_electronico");
      const fWhatsapp = document.getElementById("whatsapp");
      const fEmpresa = document.getElementById("empresa_negocio");

      if (fNombre && !fNombre.value && fullName) fNombre.value = fullName;
      if (fCorreo && !fCorreo.value && email) fCorreo.value = email;
      if (fWhatsapp && !fWhatsapp.value && whatsapp) fWhatsapp.value = whatsapp;
      if (fEmpresa && !fEmpresa.value && role) fEmpresa.value = role;

      await renderUserAppointments(email);
    } else {
      if (openAuthBtn) openAuthBtn.classList.remove("logged-in");
      if (authBtnLabel) authBtnLabel.textContent = "Iniciar Sesión / Crear Cuenta";
      if (adminAuthStatusPill) adminAuthStatusPill.textContent = "Sesión: Invitado";
      if (authGuestView) authGuestView.hidden = false;
      if (authUserView) authUserView.hidden = true;
    }
  }

  async function renderUserAppointments(userEmail) {
    const container = document.getElementById("userAppointmentsList");
    if (!container) return;
    const allRows = await fetchLeads();
    const myRows = allRows.filter(
      (r) =>
        (r.correo_electronico || "").toLowerCase() === (userEmail || "").toLowerCase()
    );
    if (!myRows.length) {
      container.innerHTML =
        '<p class="empty-cell">Aún no tienes citas asociadas a tu correo. ¡Agenda tu primera cita abajo!</p>';
      return;
    }
    container.innerHTML = myRows
      .map(
        (r) => `
        <div class="user-appt-item">
          <strong>${escapeHtml(r.especialidad_servicio || "Reserva BioMedic")}</strong>
          <span>${escapeHtml(r.dolor_principal || "")}</span>
        </div>
      `
      )
      .join("");
  }

  // Inicializar estado de sesión desde Supabase Auth o sesión local de respaldo
  async function initAuthSession() {
    if (supabaseClient && supabaseClient.auth) {
      const { data } = await supabaseClient.auth.getSession();
      if (data && data.session && data.session.user) {
        await applyAuthState(data.session.user);
      }
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        applyAuthState(session ? session.user : null);
      });
    } else {
      const savedLocalUser = localStorage.getItem("biomedic_local_auth_user");
      if (savedLocalUser) {
        try {
          await applyAuthState(JSON.parse(savedLocalUser));
        } catch (_e) {}
      }
    }
  }

  if (openAuthBtn && authDialog) {
    openAuthBtn.addEventListener("click", () => {
      authDialog.showModal();
      if (currentAuthUser) {
        renderUserAppointments(currentAuthUser.email);
      }
    });
  }

  if (closeAuthBtn && authDialog) {
    closeAuthBtn.addEventListener("click", () => authDialog.close());
  }

  // Utilidades de Sanitización, Enmascaramiento LOPDP y Seguridad Anti-XSS
  let lastSubmitTimestamp = 0;
  const SUBMIT_COOLDOWN_MS = 15000; // 15 segundos entre envíos para evitar flooding/DoS

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sanitizePlainText(str, maxLen) {
    const cleaned = String(str || "")
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .trim();
    return maxLen ? cleaned.slice(0, maxLen) : cleaned;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
  }

  function isValidPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }

  function maskEmail(email) {
    const raw = String(email || "").trim();
    if (!raw.includes("@")) return "***@***";
    const [user, domain] = raw.split("@");
    const visible = user.slice(0, 2);
    return `${visible}***@${domain}`;
  }

  function maskPhone(phone) {
    const raw = String(phone || "").trim();
    if (raw.length <= 5) return "***";
    return `${raw.slice(0, 4)} *** ${raw.slice(-3)}`;
  }

  if (supabaseAuthForm) {
    supabaseAuthForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = sanitizePlainText(document.getElementById("auth_email").value, 120);
      const password = document.getElementById("auth_password").value || "";
      const nombre = sanitizePlainText(document.getElementById("auth_nombre").value, 100);
      const whatsapp = sanitizePlainText(document.getElementById("auth_whatsapp").value, 25);
      const rol = sanitizePlainText(document.getElementById("auth_rol").value || "Paciente / Familiar", 60);
      const authConsent = document.getElementById("auth_consent_lopdp");

      if (!isValidEmail(email) || password.length < 6) {
        showAuthFeedback("⚠️ Ingresa un correo electrónico válido y una contraseña de al menos 6 caracteres.", "error");
        return;
      }

      if (authMode === "signup" && authConsent && !authConsent.checked) {
        showAuthFeedback(
          "⚠️ Para crear tu cuenta debes aceptar la Política de Privacidad y Protección de Datos (LOPDP Ecuador).",
          "error"
        );
        return;
      }

      authSubmitBtn.disabled = true;
      authSubmitBtn.textContent = "Procesando de forma cifrada con Supabase Auth...";

      try {
        if (supabaseClient && supabaseClient.auth) {
          if (authMode === "signup") {
            const { data, error } = await supabaseClient.auth.signUp({
              email,
              password,
              options: {
                data: {
                  nombre_completo: nombre || email.split("@")[0],
                  whatsapp,
                  rol,
                  lopdp_consent_at: new Date().toISOString()
                }
              }
            });
            if (error) throw error;
            if (data.user) {
              await applyAuthState(data.user);
              showAuthFeedback("✅ ¡Cuenta creada e iniciada bajo cifrado Supabase Auth!", "success");
            }
          } else {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
              email,
              password
            });
            if (error) throw error;
            if (data.user) {
              await applyAuthState(data.user);
            }
          }
        } else {
          const mockUser = {
            id: "local-user-" + Date.now(),
            email,
            user_metadata: {
              nombre_completo: nombre || email.split("@")[0],
              whatsapp,
              rol
            }
          };
          localStorage.setItem("biomedic_local_auth_user", JSON.stringify(mockUser));
          await applyAuthState(mockUser);
        }
      } catch (err) {
        showAuthFeedback(`❌ Error de autenticación: ${escapeHtml(err.message || "Verifica tus credenciales")}`, "error");
      } finally {
        authSubmitBtn.disabled = false;
        setAuthModeUI(authMode);
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      if (supabaseClient && supabaseClient.auth) {
        await supabaseClient.auth.signOut();
      }
      localStorage.removeItem("biomedic_local_auth_user");
      await applyAuthState(null);
    });
  }

  // ==========================================================================
  // 6. Envío Seguro del Formulario Filtro + Reservación hacia Supabase (`public.leads`)
  // ==========================================================================
  const form = document.getElementById("biomedicLeadForm");
  const feedback = document.getElementById("formFeedback");
  const submitBtn = document.getElementById("submitLeadBtn");

  function showFeedback(message, type) {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.className = `form-feedback ${type}`;
    feedback.innerHTML = message;
  }

  function saveLocalBackup(leadRecord) {
    try {
      const current = JSON.parse(localStorage.getItem("biomedic_leads_backup") || "[]");
      current.unshift({ id: Date.now(), created_at: new Date().toISOString(), ...leadRecord });
      localStorage.setItem("biomedic_leads_backup", JSON.stringify(current.slice(0, 20)));
    } catch (e) {
      console.warn("No se pudo guardar backup local:", e);
    }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Verificación Anti-Bot Honeypot
      const hpInput = document.getElementById("website_hp");
      if (hpInput && hpInput.value.trim() !== "") {
        showFeedback("✅ Solicitud procesada.", "success");
        return;
      }

      // 2. Control de frecuencia (Rate-Limiting contra ataques DoS/Spam)
      const nowMs = Date.now();
      if (nowMs - lastSubmitTimestamp < SUBMIT_COOLDOWN_MS) {
        const waitSec = Math.ceil((SUBMIT_COOLDOWN_MS - (nowMs - lastSubmitTimestamp)) / 1000);
        showFeedback(
          `🛡️ Protección Anti-Spam activa: Por favor espera ${waitSec} segundos antes de enviar otra solicitud.`,
          "error"
        );
        return;
      }

      // 3. Verificación explícita de Consentimiento Informado LOPDP Ecuador
      const consentCheckbox = document.getElementById("consent_lopdp");
      if (consentCheckbox && !consentCheckbox.checked) {
        showFeedback(
          "⚠️ Por disposición de la Ley Orgánica de Protección de Datos Personales (LOPDP Ecuador), debes marcar la casilla de consentimiento informado antes de enviar tus datos.",
          "error"
        );
        consentCheckbox.focus();
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        showFeedback(
          "⚠️ Por favor completa todos los campos obligatorios marcados con (*) para confirmar tu cita.",
          "error"
        );
        return;
      }

      const especialidad = sanitizePlainText(document.getElementById("especialidad_servicio").value, 120);
      const modalidad = sanitizePlainText(document.getElementById("modalidad_atencion").value, 120);
      const fecha = sanitizePlainText(document.getElementById("fecha_cita").value, 20);
      const hora = sanitizePlainText(document.getElementById("hora_cita").value, 20);
      const nombre = sanitizePlainText(document.getElementById("nombre_completo").value, 100);
      const correo = sanitizePlainText(document.getElementById("correo_electronico").value, 120);
      const whatsapp = sanitizePlainText(document.getElementById("whatsapp").value, 25);
      const empresa = sanitizePlainText(document.getElementById("empresa_negocio").value, 120);
      const presupuesto = sanitizePlainText(document.getElementById("presupuesto_estimado").value, 120);
      const dolorTexto = sanitizePlainText(document.getElementById("dolor_principal").value, 900);

      if (!isValidEmail(correo)) {
        showFeedback("⚠️ Por favor ingresa un correo electrónico válido (ej. nombre@dominio.com).", "error");
        return;
      }

      if (!isValidPhone(whatsapp)) {
        showFeedback("⚠️ Por favor ingresa un número de WhatsApp o teléfono válido (7 a 15 dígitos).", "error");
        return;
      }

      const isMobile = window.innerWidth < 768 ? "Móvil" : "Escritorio";
      const consentStamp = new Date().toISOString().slice(0, 16).replace("T", " ");

      const dolorConReserva = `[Cita: ${especialidad} | ${fecha} ${hora} | ${modalidad} | Origen: ${isMobile} | Consentimiento LOPDP: Aceptado ${consentStamp} UTC] Motivo/Dolor: ${dolorTexto}`;

      const fullPayload = {
        nombre_completo: nombre,
        correo_electronico: correo,
        whatsapp: whatsapp,
        empresa_negocio: empresa,
        presupuesto_estimado: presupuesto,
        dolor_principal: dolorConReserva
      };

      if (currentAuthUser && currentAuthUser.id && !String(currentAuthUser.id).startsWith("local-")) {
        fullPayload.user_id = currentAuthUser.id;
      }

      const corePayload = {
        nombre_completo: nombre,
        correo_electronico: correo,
        whatsapp: whatsapp,
        empresa_negocio: empresa,
        presupuesto_estimado: presupuesto,
        dolor_principal: dolorConReserva
      };

      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>Cifrando y guardando en Supabase...</span>";

      try {
        if (supabaseClient) {
          let { error } = await supabaseClient.from("leads").insert([fullPayload]);
          if (error) {
            const retry = await supabaseClient.from("leads").insert([corePayload]);
            error = retry.error;
          }
          if (error) throw error;

          lastSubmitTimestamp = Date.now();
          saveLocalBackup(fullPayload);
          showFeedback(
            `✅ <strong>¡Reservación y consentimiento LOPDP registrados de forma segura en Supabase!</strong><br/>` +
              `Paciente/Cliente: <strong>${escapeHtml(nombre)}</strong> · Área: <strong>${escapeHtml(especialidad)}</strong> (${escapeHtml(fecha)} a las ${escapeHtml(hora)}).`,
            "success"
          );
          form.reset();
          if (fechaInput) fechaInput.value = fecha;
          if (currentAuthUser) await applyAuthState(currentAuthUser);
          await loadLeadsCount();
        } else {
          lastSubmitTimestamp = Date.now();
          saveLocalBackup(fullPayload);
          showFeedback(
            `✅ <strong>¡Reserva Guardada Localmente de Forma Segura!</strong><br/>` +
              `Paciente/Cliente: <strong>${escapeHtml(nombre)}</strong> · Área: <strong>${escapeHtml(especialidad)}</strong>.`,
            "success"
          );
          form.reset();
          if (fechaInput) fechaInput.value = fecha;
          if (currentAuthUser) await applyAuthState(currentAuthUser);
          await loadLeadsCount();
        }
      } catch (err) {
        console.error("Error al insertar en Supabase:", err);
        showFeedback(
          `❌ Error al guardar en Supabase: ${escapeHtml(err.message || "Verifica la tabla leads y las políticas RLS.")}`,
          "error"
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // ==========================================================================
  // 7. Panel Administrativo de Citas / Leads con Enmascaramiento LOPDP
  // ==========================================================================
  const adminDialog = document.getElementById("adminDialog");
  const openAdminBtn = document.getElementById("openAdminBtn");
  const closeAdminBtn = document.getElementById("closeAdminBtn");
  const refreshLeadsBtn = document.getElementById("refreshLeadsBtn");
  const leadsTableBody = document.getElementById("leadsTableBody");
  const adminPrivacyNotice = document.getElementById("adminPrivacyNotice");

  async function fetchLeads() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(25);
      if (!error && Array.isArray(data)) {
        return data;
      }
    }
    return JSON.parse(localStorage.getItem("biomedic_leads_backup") || "[]");
  }

  async function loadLeadsCount() {
    const rows = await fetchLeads();
    if (leadsCountBadge) {
      leadsCountBadge.textContent = String(rows.length);
    }
    return rows;
  }

  async function renderAdminTable() {
    if (!leadsTableBody) return;
    leadsTableBody.innerHTML =
      '<tr><td colspan="6" class="empty-cell">Consultando base de datos cifrada...</td></tr>';
    const rows = await loadLeadsCount();

    const isAuthenticated = Boolean(currentAuthUser);
    if (adminPrivacyNotice) {
      adminPrivacyNotice.innerHTML = isAuthenticated
        ? `🔓 <strong>Sesión Verificada (${escapeHtml(currentAuthUser.email)}):</strong> Visualizando registros completos bajo autorización LOPDP.`
        : `🔒 <strong>Protección LOPDP Activa (Modo Invitado):</strong> Los teléfonos y correos se muestran parcialmente enmascarados para proteger la privacidad de los pacientes. Inicia sesión con <strong>Supabase Auth</strong> para ver los datos completos.`;
    }

    if (!rows.length) {
      leadsTableBody.innerHTML =
        '<tr><td colspan="6" class="empty-cell">Aún no hay reservaciones registradas. ¡Haz una prueba en el formulario!</td></tr>';
      return;
    }

    leadsTableBody.innerHTML = rows
      .map((r) => {
        const dateStr = r.created_at
          ? new Date(r.created_at).toLocaleString("es-EC", {
              dateStyle: "short",
              timeStyle: "short"
            })
          : "Reciente";
        const displayPhone = isAuthenticated ? r.whatsapp || "" : maskPhone(r.whatsapp || "");
        const displayEmail = isAuthenticated
          ? r.correo_electronico || ""
          : maskEmail(r.correo_electronico || "");

        return `
          <tr>
            <td>${escapeHtml(dateStr)}</td>
            <td><strong>${escapeHtml(r.nombre_completo || "")}</strong></td>
            <td>${escapeHtml(displayPhone)}<br/><small>${escapeHtml(displayEmail)}</small></td>
            <td>${escapeHtml(r.empresa_negocio || "")}</td>
            <td>${escapeHtml(r.presupuesto_estimado || "")}</td>
            <td>${escapeHtml(r.dolor_principal || "")}</td>
          </tr>
        `;
      })
      .join("");
  }

  if (openAdminBtn && adminDialog) {
    openAdminBtn.addEventListener("click", async () => {
      adminDialog.showModal();
      await renderAdminTable();
    });
  }

  if (closeAdminBtn && adminDialog) {
    closeAdminBtn.addEventListener("click", () => adminDialog.close());
  }

  if (refreshLeadsBtn) {
    refreshLeadsBtn.addEventListener("click", renderAdminTable);
  }

  // ==========================================================================
  // 8. Gestión de Galletas (Cookies) y Centro Legal / Privacidad LOPDP
  // ==========================================================================
  const COOKIE_KEY = "biomedic_cookie_consent_v1";
  const cookieBanner = document.getElementById("cookieBanner");
  const cookieAcceptAllBtn = document.getElementById("cookieAcceptAllBtn");
  const cookieEssentialBtn = document.getElementById("cookieEssentialBtn");
  const resetCookiesBtn = document.getElementById("resetCookiesBtn");
  const cookieCurrentStatusText = document.getElementById("cookieCurrentStatusText");

  const legalDialog = document.getElementById("legalDialog");
  const closeLegalBtn = document.getElementById("closeLegalBtn");
  const acceptLegalModalBtn = document.getElementById("acceptLegalModalBtn");
  const legalTabs = document.querySelectorAll(".legal-tab");
  const openLegalTriggers = document.querySelectorAll("[data-open-legal]");

  function updateCookieStatusLabel() {
    if (!cookieCurrentStatusText) return;
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) {
      cookieCurrentStatusText.textContent = "Pendiente de selección";
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      cookieCurrentStatusText.textContent =
        parsed.level === "all"
          ? `Aceptadas todas (${new Date(parsed.timestamp).toLocaleDateString("es-EC")})`
          : `Solo esenciales (${new Date(parsed.timestamp).toLocaleDateString("es-EC")})`;
    } catch (_e) {
      cookieCurrentStatusText.textContent = "Configurado";
    }
  }

  function saveCookieConsent(level) {
    const payload = {
      level,
      timestamp: new Date().toISOString(),
      regulation: "LOPDP-Ecuador"
    };
    localStorage.setItem(COOKIE_KEY, JSON.stringify(payload));
    if (cookieBanner) cookieBanner.hidden = true;
    updateCookieStatusLabel();
  }

  function initCookieBanner() {
    const existing = localStorage.getItem(COOKIE_KEY);
    if (!existing && cookieBanner) {
      cookieBanner.hidden = false;
    }
    updateCookieStatusLabel();
  }

  if (cookieAcceptAllBtn) {
    cookieAcceptAllBtn.addEventListener("click", () => saveCookieConsent("all"));
  }

  if (cookieEssentialBtn) {
    cookieEssentialBtn.addEventListener("click", () => saveCookieConsent("essential"));
  }

  if (resetCookiesBtn) {
    resetCookiesBtn.addEventListener("click", () => {
      localStorage.removeItem(COOKIE_KEY);
      localStorage.removeItem("biomedic_leads_backup");
      updateCookieStatusLabel();
      if (legalDialog && legalDialog.open) legalDialog.close();
      if (cookieBanner) cookieBanner.hidden = false;
    });
  }

  function switchLegalTab(tabName) {
    legalTabs.forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-legal-tab") === tabName);
    });
    const panes = ["privacidad", "cookies", "terminos", "seguridad"];
    panes.forEach((p) => {
      const el = document.getElementById(`legalPane-${p}`);
      if (el) el.hidden = p !== tabName;
    });
    updateCookieStatusLabel();
  }

  legalTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-legal-tab");
      if (target) switchLegalTab(target);
    });
  });

  openLegalTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-open-legal") || "privacidad";
      switchLegalTab(tab);
      if (legalDialog) legalDialog.showModal();
    });
  });

  if (closeLegalBtn && legalDialog) {
    closeLegalBtn.addEventListener("click", () => legalDialog.close());
  }

  if (acceptLegalModalBtn && legalDialog) {
    acceptLegalModalBtn.addEventListener("click", () => {
      if (!localStorage.getItem(COOKIE_KEY)) {
        saveCookieConsent("all");
      }
      const consentCheckbox = document.getElementById("consent_lopdp");
      if (consentCheckbox) consentCheckbox.checked = true;
      legalDialog.close();
    });
  }

  initAuthSession();
  loadLeadsCount();
  initCookieBanner();
})();

