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

  if (supabaseAuthForm) {
    supabaseAuthForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (document.getElementById("auth_email").value || "").trim();
      const password = document.getElementById("auth_password").value || "";
      const nombre = (document.getElementById("auth_nombre").value || "").trim();
      const whatsapp = (document.getElementById("auth_whatsapp").value || "").trim();
      const rol = document.getElementById("auth_rol").value || "Paciente / Familiar";

      if (!email || password.length < 6) {
        showAuthFeedback("⚠️ Ingresa un correo válido y una contraseña de al menos 6 caracteres.", "error");
        return;
      }

      authSubmitBtn.disabled = true;
      authSubmitBtn.textContent = "Procesando con Supabase Auth...";

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
                  rol
                }
              }
            });
            if (error) throw error;
            if (data.user) {
              await applyAuthState(data.user);
              showAuthFeedback("✅ ¡Cuenta creada e iniciada con Supabase Auth!", "success");
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
          // Simulación funcional local mientras se colocan las llaves de Supabase en .env
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
        showAuthFeedback(`❌ Error de autenticación: ${err.message || "Verifica tus credenciales"}`, "error");
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
  // 6. Envío del Formulario Filtro + Reservación hacia Supabase (`public.leads`)
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
      localStorage.setItem("biomedic_leads_backup", JSON.stringify(current));
    } catch (e) {
      console.warn("No se pudo guardar backup local:", e);
    }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        showFeedback(
          "⚠️ Por favor completa todos los campos obligatorios marcados con (*) para confirmar tu cita.",
          "error"
        );
        return;
      }

      const especialidad = document.getElementById("especialidad_servicio").value;
      const modalidad = document.getElementById("modalidad_atencion").value;
      const fecha = document.getElementById("fecha_cita").value;
      const hora = document.getElementById("hora_cita").value;
      const nombre = document.getElementById("nombre_completo").value.trim();
      const correo = document.getElementById("correo_electronico").value.trim();
      const whatsapp = document.getElementById("whatsapp").value.trim();
      const empresa = document.getElementById("empresa_negocio").value.trim();
      const presupuesto = document.getElementById("presupuesto_estimado").value;
      const dolorTexto = document.getElementById("dolor_principal").value.trim();

      const isMobile = window.innerWidth < 768 ? "Móvil" : "Escritorio";

      const dolorConReserva = `[Cita: ${especialidad} | ${fecha} ${hora} | ${modalidad} | Origen: ${isMobile}] Motivo/Dolor: ${dolorTexto}`;

      const fullPayload = {
        nombre_completo: nombre,
        correo_electronico: correo,
        whatsapp: whatsapp,
        empresa_negocio: empresa,
        presupuesto_estimado: presupuesto,
        dolor_principal: dolorConReserva,
        especialidad_servicio: especialidad,
        fecha_cita: fecha,
        hora_cita: hora,
        modalidad_atencion: modalidad,
        dispositivo_origen: isMobile
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
      submitBtn.innerHTML = "<span>Guardando reservación en Supabase...</span>";

      try {
        if (supabaseClient) {
          let { error } = await supabaseClient.from("leads").insert([fullPayload]);
          if (error) {
            const retry = await supabaseClient.from("leads").insert([corePayload]);
            error = retry.error;
          }
          if (error) throw error;

          saveLocalBackup(fullPayload);
          showFeedback(
            `✅ <strong>¡Reservación y registro confirmados en Supabase!</strong><br/>` +
              `Paciente/Cliente: <strong>${nombre}</strong> · Área: <strong>${especialidad}</strong> (${fecha} a las ${hora}).`,
            "success"
          );
          form.reset();
          if (fechaInput) fechaInput.value = fecha;
          if (currentAuthUser) await applyAuthState(currentAuthUser);
          await loadLeadsCount();
        } else {
          saveLocalBackup(fullPayload);
          showFeedback(
            `✅ <strong>¡Simulación de Reserva Guardada Localmente!</strong><br/>` +
              `Cuando conectemos tus llaves de Supabase en el archivo <code>.env</code>, este envío se insertará directamente en la tabla <code>leads</code>.`,
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
          `❌ Error al guardar en Supabase: ${err.message || "Verifica la tabla leads y las políticas RLS."}`,
          "error"
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // 7. Panel Administrativo de Citas / Leads (Modal `<dialog>`)
  const adminDialog = document.getElementById("adminDialog");
  const openAdminBtn = document.getElementById("openAdminBtn");
  const closeAdminBtn = document.getElementById("closeAdminBtn");
  const refreshLeadsBtn = document.getElementById("refreshLeadsBtn");
  const leadsTableBody = document.getElementById("leadsTableBody");

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
      '<tr><td colspan="6" class="empty-cell">Consultando base de datos...</td></tr>';
    const rows = await loadLeadsCount();
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
        return `
          <tr>
            <td>${dateStr}</td>
            <td><strong>${escapeHtml(r.nombre_completo || "")}</strong></td>
            <td>${escapeHtml(r.whatsapp || "")}<br/><small>${escapeHtml(r.correo_electronico || "")}</small></td>
            <td>${escapeHtml(r.empresa_negocio || "")}</td>
            <td>${escapeHtml(r.presupuesto_estimado || "")}</td>
            <td>${escapeHtml(r.dolor_principal || "")}</td>
          </tr>
        `;
      })
      .join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  initAuthSession();
  loadLeadsCount();
})();
