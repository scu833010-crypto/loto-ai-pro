// app.js — lógica de la app de Registro de Préstamos.
// Todo vive en el navegador: los datos se guardan en localStorage, no hay
// servidor ni servicio externo, así que no tiene ningún costo.

const STORAGE_KEY = "prestamos_v1";
const CONFIG_KEY = "prestamos_config_v1";

const DIAS_POR_FRECUENCIA = {
  semanal: 7,
  quincenal: 15,
  mensual: 30,
};

// ---------- Estado y persistencia ----------

function cargarPrestamos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("No se pudo leer el almacenamiento local:", e);
    return [];
  }
}

function guardarPrestamos(prestamos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prestamos));
}

function cargarConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : { moneda: "RD$" };
  } catch (e) {
    return { moneda: "RD$" };
  }
}

function guardarConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

let prestamos = cargarPrestamos();
let config = cargarConfig();

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- Cálculo financiero: interés simple sobre saldo ----------
//
// Cada préstamo tiene una tasa de interés por período (según su frecuencia
// de pago: semanal, quincenal o mensual). El interés se acumula sobre el
// capital que queda pendiente, proporcional a los días transcurridos.
// Cada abono se aplica primero al interés acumulado, y lo que sobra reduce
// el capital.

function diasEntre(fechaA, fechaB) {
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.max(0, (fechaB.getTime() - fechaA.getTime()) / msPorDia);
}

function calcularEstado(prestamo, hoy = new Date()) {
  const periodoDias = DIAS_POR_FRECUENCIA[prestamo.frecuenciaPago] || 30;
  const tasa = prestamo.tasaInteres / 100;

  const pagosOrdenados = [...(prestamo.pagos || [])].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );

  let saldoCapital = prestamo.monto;
  let interesPendiente = 0;
  let fechaUltimoEvento = new Date(prestamo.fechaInicio);

  for (const pago of pagosOrdenados) {
    const fechaPago = new Date(pago.fecha);
    const dias = diasEntre(fechaUltimoEvento, fechaPago);
    interesPendiente += saldoCapital * tasa * (dias / periodoDias);

    let montoRestante = pago.monto;
    if (montoRestante <= interesPendiente) {
      interesPendiente -= montoRestante;
    } else {
      montoRestante -= interesPendiente;
      interesPendiente = 0;
      saldoCapital = Math.max(0, saldoCapital - montoRestante);
    }
    fechaUltimoEvento = fechaPago;
  }

  // Interés acumulado desde el último evento (pago o inicio) hasta hoy.
  const diasHastaHoy = diasEntre(fechaUltimoEvento, hoy);
  interesPendiente += saldoCapital * tasa * (diasHastaHoy / periodoDias);

  const totalPendiente = saldoCapital + interesPendiente;

  const proximoPago = new Date(fechaUltimoEvento);
  proximoPago.setDate(proximoPago.getDate() + periodoDias);

  const diasParaVencer = Math.round(diasEntre(hoy, proximoPago));
  const diasAtraso = Math.round(diasEntre(proximoPago, hoy));

  let estadoPago = "al_dia";
  if (totalPendiente <= 0.01) {
    estadoPago = "pagado";
  } else if (hoy >= proximoPago) {
    estadoPago = "vencido";
  } else if (diasParaVencer <= 3) {
    estadoPago = "proximo";
  }

  return {
    saldoCapital,
    interesPendiente,
    totalPendiente,
    proximoPago,
    diasParaVencer,
    diasAtraso,
    estadoPago,
  };
}

// ---------- Formato ----------

function formatoMoneda(valor) {
  const redondeado = Math.round(valor * 100) / 100;
  return `${config.moneda}${redondeado.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatoFecha(fecha) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return d.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const ETIQUETAS_ESTADO = {
  al_dia: { texto: "Al día", clase: "badge-ok" },
  proximo: { texto: "Vence pronto", clase: "badge-warn" },
  vencido: { texto: "Vencido", clase: "badge-danger" },
  pagado: { texto: "Pagado", clase: "badge-ok" },
};

// ---------- Mensajes predeterminados ----------

function rellenarPlantilla(clave, prestamo, estado, datosExtra = {}) {
  const plantilla = (window.MENSAJES_PREDETERMINADOS || {})[clave] || "";
  const valores = {
    nombre: prestamo.deudor,
    monto: formatoMoneda(datosExtra.monto ?? estado.totalPendiente),
    fecha: formatoFecha(datosExtra.fecha ?? estado.proximoPago),
    saldo: formatoMoneda(estado.totalPendiente),
    capital: formatoMoneda(estado.saldoCapital),
    interes: formatoMoneda(estado.interesPendiente),
    dias: datosExtra.dias ?? estado.diasAtraso,
  };
  return plantilla.replace(/\{(\w+)\}/g, (match, clave2) =>
    valores[clave2] !== undefined ? valores[clave2] : match
  );
}

function linkWhatsApp(telefono, texto) {
  const soloDigitos = (telefono || "").replace(/\D/g, "");
  const base = soloDigitos
    ? `https://wa.me/${soloDigitos}`
    : `https://wa.me/`;
  return `${base}?text=${encodeURIComponent(texto)}`;
}

// ---------- Render ----------

const listaEl = document.getElementById("lista-prestamos");
const resumenEl = document.getElementById("resumen");
const monedaInput = document.getElementById("config-moneda");

function render() {
  guardarPrestamos(prestamos);
  renderResumen();
  renderLista();
}

function renderResumen() {
  const hoy = new Date();
  let totalPendiente = 0;
  let vencidos = 0;
  let proximos = 0;

  for (const p of prestamos) {
    const estado = calcularEstado(p, hoy);
    totalPendiente += estado.totalPendiente;
    if (estado.estadoPago === "vencido") vencidos++;
    if (estado.estadoPago === "proximo") proximos++;
  }

  resumenEl.innerHTML = `
    <div class="resumen-item">
      <span class="resumen-num">${prestamos.length}</span>
      <span class="resumen-label">Préstamos activos</span>
    </div>
    <div class="resumen-item">
      <span class="resumen-num">${formatoMoneda(totalPendiente)}</span>
      <span class="resumen-label">Total por cobrar</span>
    </div>
    <div class="resumen-item">
      <span class="resumen-num badge-danger-text">${vencidos}</span>
      <span class="resumen-label">Vencidos</span>
    </div>
    <div class="resumen-item">
      <span class="resumen-num badge-warn-text">${proximos}</span>
      <span class="resumen-label">Vencen pronto</span>
    </div>
  `;
}

function renderLista() {
  if (prestamos.length === 0) {
    listaEl.innerHTML = `<p class="vacio">Todavía no has registrado ningún préstamo. Usa el formulario de arriba para agregar el primero.</p>`;
    return;
  }

  const hoy = new Date();

  // Vencidos primero, luego próximos, luego al día/pagados.
  const orden = { vencido: 0, proximo: 1, al_dia: 2, pagado: 3 };
  const ordenados = [...prestamos].sort((a, b) => {
    const ea = calcularEstado(a, hoy).estadoPago;
    const eb = calcularEstado(b, hoy).estadoPago;
    return orden[ea] - orden[eb];
  });

  listaEl.innerHTML = ordenados
    .map((p) => {
      const estado = calcularEstado(p, hoy);
      const badge = ETIQUETAS_ESTADO[estado.estadoPago];
      return `
      <div class="tarjeta" data-id="${p.id}">
        <div class="tarjeta-header">
          <div>
            <strong>${escapeHtml(p.deudor)}</strong>
            <span class="badge ${badge.clase}">${badge.texto}</span>
          </div>
          <button class="btn-icono btn-eliminar" data-id="${p.id}" title="Eliminar préstamo">✕</button>
        </div>
        <div class="tarjeta-cuerpo">
          <div class="dato"><span>Capital prestado</span><strong>${formatoMoneda(p.monto)}</strong></div>
          <div class="dato"><span>Capital pendiente</span><strong>${formatoMoneda(estado.saldoCapital)}</strong></div>
          <div class="dato"><span>Interés acumulado</span><strong>${formatoMoneda(estado.interesPendiente)}</strong></div>
          <div class="dato"><span>Total pendiente</span><strong>${formatoMoneda(estado.totalPendiente)}</strong></div>
          <div class="dato"><span>Próximo vencimiento</span><strong>${formatoFecha(estado.proximoPago)}</strong></div>
          <div class="dato"><span>Tasa / frecuencia</span><strong>${p.tasaInteres}% ${p.frecuenciaPago}</strong></div>
        </div>
        <div class="tarjeta-acciones">
          <button class="btn btn-secundario btn-abono" data-id="${p.id}">Registrar abono</button>
          <button class="btn btn-secundario btn-recordatorio" data-id="${p.id}">Recordatorio</button>
          <button class="btn btn-secundario btn-historial" data-id="${p.id}">Historial (${(p.pagos || []).length})</button>
        </div>
        <div class="panel-oculto" id="panel-abono-${p.id}"></div>
        <div class="panel-oculto" id="panel-recordatorio-${p.id}"></div>
        <div class="panel-oculto" id="panel-historial-${p.id}"></div>
      </div>
    `;
    })
    .join("");
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ---------- Formulario: nuevo préstamo ----------

document.getElementById("form-nuevo-prestamo").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;

  const prestamo = {
    id: generarId(),
    deudor: form.deudor.value.trim(),
    telefono: form.telefono.value.trim(),
    monto: parseFloat(form.monto.value),
    tasaInteres: parseFloat(form.tasaInteres.value),
    frecuenciaPago: form.frecuenciaPago.value,
    fechaInicio: form.fechaInicio.value,
    metodoPago: form.metodoPago.value,
    notas: form.notas.value.trim(),
    pagos: [],
  };

  if (!prestamo.deudor || isNaN(prestamo.monto) || prestamo.monto <= 0) {
    alert("Revisa el nombre y el monto del préstamo.");
    return;
  }
  if (!prestamo.fechaInicio) {
    prestamo.fechaInicio = new Date().toISOString().slice(0, 10);
  }

  prestamos.push(prestamo);
  render();
  form.reset();
});

// ---------- Delegación de eventos sobre la lista ----------

listaEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;
  const prestamo = prestamos.find((p) => p.id === id);
  if (!prestamo) return;

  if (btn.classList.contains("btn-eliminar")) {
    if (confirm(`¿Eliminar el préstamo de ${prestamo.deudor}? Esta acción no se puede deshacer.`)) {
      prestamos = prestamos.filter((p) => p.id !== id);
      render();
    }
    return;
  }

  if (btn.classList.contains("btn-abono")) {
    togglePanelAbono(prestamo);
    return;
  }

  if (btn.classList.contains("btn-recordatorio")) {
    togglePanelRecordatorio(prestamo);
    return;
  }

  if (btn.classList.contains("btn-historial")) {
    togglePanelHistorial(prestamo);
    return;
  }
});

function cerrarPaneles(exceptoId) {
  document.querySelectorAll(".panel-oculto").forEach((el) => {
    if (el.id !== exceptoId) el.innerHTML = "";
  });
}

function togglePanelAbono(prestamo) {
  const panelId = `panel-abono-${prestamo.id}`;
  const panel = document.getElementById(panelId);
  if (panel.innerHTML) {
    cerrarPaneles();
    return;
  }
  cerrarPaneles(panelId);

  const hoyStr = new Date().toISOString().slice(0, 10);
  panel.innerHTML = `
    <form class="form-abono">
      <label>Monto del abono
        <input type="number" name="monto" min="0.01" step="0.01" required />
      </label>
      <label>Fecha
        <input type="date" name="fecha" value="${hoyStr}" required />
      </label>
      <label>Notas (opcional)
        <input type="text" name="notas" placeholder="Ej: pago por transferencia" />
      </label>
      <div class="panel-acciones">
        <button type="submit" class="btn btn-primario">Guardar abono</button>
        <button type="button" class="btn btn-texto btn-cancelar">Cancelar</button>
      </div>
    </form>
  `;

  panel.querySelector(".btn-cancelar").addEventListener("click", () => {
    panel.innerHTML = "";
  });

  panel.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const monto = parseFloat(e.target.monto.value);
    const fecha = e.target.fecha.value;
    const notas = e.target.notas.value.trim();
    if (isNaN(monto) || monto <= 0) {
      alert("El monto del abono debe ser mayor a cero.");
      return;
    }
    prestamo.pagos = prestamo.pagos || [];
    prestamo.pagos.push({ id: generarId(), monto, fecha, notas });
    panel.innerHTML = "";
    render();
  });
}

function togglePanelRecordatorio(prestamo) {
  const panelId = `panel-recordatorio-${prestamo.id}`;
  const panel = document.getElementById(panelId);
  if (panel.innerHTML) {
    cerrarPaneles();
    return;
  }
  cerrarPaneles(panelId);

  const estado = calcularEstado(prestamo);
  const claveSugerida =
    estado.estadoPago === "vencido"
      ? "recordatorioVencido"
      : estado.estadoPago === "pagado"
      ? "confirmacionPago"
      : "recordatorioProximo";

  const opciones = Object.keys(window.MENSAJES_PREDETERMINADOS || {})
    .map(
      (clave) =>
        `<option value="${clave}" ${clave === claveSugerida ? "selected" : ""}>${clave}</option>`
    )
    .join("");

  panel.innerHTML = `
    <div class="bloque-recordatorio">
      <label>Plantilla
        <select class="select-plantilla">${opciones}</select>
      </label>
      <textarea class="texto-mensaje" rows="4" readonly></textarea>
      <div class="panel-acciones">
        <button type="button" class="btn btn-secundario btn-copiar">Copiar mensaje</button>
        <a class="btn btn-primario btn-whatsapp" target="_blank" rel="noopener">Enviar por WhatsApp</a>
        <button type="button" class="btn btn-texto btn-cancelar">Cerrar</button>
      </div>
    </div>
  `;

  const textarea = panel.querySelector(".texto-mensaje");
  const select = panel.querySelector(".select-plantilla");
  const linkBtn = panel.querySelector(".btn-whatsapp");

  function actualizarMensaje() {
    const texto = rellenarPlantilla(select.value, prestamo, estado);
    textarea.value = texto;
    linkBtn.href = linkWhatsApp(prestamo.telefono, texto);
  }
  actualizarMensaje();
  select.addEventListener("change", actualizarMensaje);

  panel.querySelector(".btn-copiar").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      const btn = panel.querySelector(".btn-copiar");
      const original = btn.textContent;
      btn.textContent = "¡Copiado!";
      setTimeout(() => (btn.textContent = original), 1500);
    } catch (e) {
      textarea.select();
      document.execCommand("copy");
    }
  });

  panel.querySelector(".btn-cancelar").addEventListener("click", () => {
    panel.innerHTML = "";
  });
}

function togglePanelHistorial(prestamo) {
  const panelId = `panel-historial-${prestamo.id}`;
  const panel = document.getElementById(panelId);
  if (panel.innerHTML) {
    cerrarPaneles();
    return;
  }
  cerrarPaneles(panelId);

  const pagos = [...(prestamo.pagos || [])].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  if (pagos.length === 0) {
    panel.innerHTML = `<p class="vacio">Todavía no hay abonos registrados para este préstamo.</p>`;
    return;
  }

  panel.innerHTML = `
    <table class="tabla-historial">
      <thead><tr><th>Fecha</th><th>Monto</th><th>Notas</th><th></th></tr></thead>
      <tbody>
        ${pagos
          .map(
            (pago) => `
          <tr>
            <td>${formatoFecha(pago.fecha)}</td>
            <td>${formatoMoneda(pago.monto)}</td>
            <td>${escapeHtml(pago.notas || "")}</td>
            <td><button class="btn-icono btn-borrar-pago" data-pago="${pago.id}" title="Eliminar abono">✕</button></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  panel.querySelectorAll(".btn-borrar-pago").forEach((btn) => {
    btn.addEventListener("click", () => {
      prestamo.pagos = prestamo.pagos.filter((pg) => pg.id !== btn.dataset.pago);
      render();
    });
  });
}

// ---------- Configuración (moneda) ----------

monedaInput.value = config.moneda;
monedaInput.addEventListener("change", () => {
  config.moneda = monedaInput.value.trim() || "RD$";
  guardarConfig(config);
  render();
});

// ---------- Exportar / importar respaldo ----------

document.getElementById("btn-exportar").addEventListener("click", () => {
  const datos = JSON.stringify({ prestamos, config }, null, 2);
  const blob = new Blob([datos], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prestamos-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("input-importar").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const datos = JSON.parse(reader.result);
      if (!Array.isArray(datos.prestamos)) throw new Error("Formato inválido");
      if (
        !confirm(
          "Esto reemplazará todos los préstamos guardados actualmente en este navegador. ¿Continuar?"
        )
      )
        return;
      prestamos = datos.prestamos;
      config = datos.config || config;
      monedaInput.value = config.moneda;
      guardarConfig(config);
      render();
    } catch (err) {
      alert("El archivo no parece un respaldo válido de esta app.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// ---------- Arranque ----------

render();
