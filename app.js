(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'didi-rentabilidad-history-v1';
  const SETTINGS_KEY = 'didi-rentabilidad-settings-v1';
  let currentTrip = null;
  let history = readJson(STORAGE_KEY, []);
  let settings = readJson(SETTINGS_KEY, { minKm: 3000, minHour: 30000 });

  function readJson(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
    catch { return fallback; }
  }
  const cop = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(n));
  const number = (n, digits = 1) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: digits }).format(n);
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function updateSettingsInputs() {
    $('min-km').value = settings.minKm;
    $('min-hour').value = settings.minHour;
  }
  function recommendation(trip) {
    return trip.perKm >= settings.minKm && trip.perHour >= settings.minHour;
  }
  function calculate(trip) {
    trip.perKm = trip.fare / trip.km;
    trip.perHour = trip.fare * 60 / trip.minutes;
    trip.recommended = recommendation(trip);
    const low = trip.perKm < settings.minKm * 0.8 || trip.perHour < settings.minHour * 0.8;
    trip.level = trip.recommended ? 'good' : (low ? 'bad' : 'mid');
    return trip;
  }
  function renderResult(trip, scroll = true) {
    currentTrip = trip;
    $('result-section').classList.remove('hidden');
    $('result-fare').textContent = cop(trip.fare);
    $('per-km').textContent = cop(trip.perKm);
    $('per-hour').textContent = cop(trip.perHour);
    $('result-distance').textContent = `${number(trip.km)} km`;
    $('result-time').textContent = `${number(trip.minutes, 0)} min`;
    const badge = $('result-badge');
    const L = {
      good: ['Buena oferta', 'Rentabilidad favorable', '¡Está bien pago, acéptalo!'],
      mid: ['Regular', 'Oferta intermedia', 'Está regular, tú decides'],
      bad: ['Bajo tus límites', 'Revisa esta oferta', 'Está mal pago, mejor rechaza']
    }[trip.level];
    badge.className = `status-badge ${trip.level === 'good' ? 'good' : trip.level === 'bad' ? 'bad' : ''}`;
    badge.textContent = L[0];
    $('result-title').textContent = L[1];
    $('verdict').className = `verdict ${trip.level}`;
    $('v-fare').textContent = cop(trip.fare);
    $('v-km').textContent = cop(trip.perKm);
    $('v-hour').textContent = cop(trip.perHour);
    $('v-km-d').textContent = `${number(trip.km)} km`;
    $('v-min-d').textContent = `${number(trip.minutes, 0)} min`;
    $('v-text').textContent = L[2];
    $('save-message').textContent = '';
    if (scroll) $('result-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  $('trip-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const fare = Number($('fare').value);
    const km = Number($('km').value);
    const minutes = Number($('minutes').value);
    if (!(fare > 0 && km > 0 && minutes > 0)) {
      alert('Ingresa un valor, una distancia y un tiempo mayores que cero.');
      return;
    }
    renderResult(calculate({
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      fare, km, minutes, note: $('note').value.trim(),
      createdAt: new Date().toISOString(), decision: null
    }));
  });
  // Cálculo en vivo: el semáforo se actualiza mientras escribes
  ['fare', 'km', 'minutes'].forEach(id => $(id).addEventListener('input', () => {
    const fare = Number($('fare').value), km = Number($('km').value), minutes = Number($('minutes').value);
    if (fare > 0 && km > 0 && minutes > 0) {
      renderResult(calculate({ id: currentTrip ? currentTrip.id : `${Date.now()}-${Math.random()}`, fare, km, minutes, note: $('note').value.trim(), createdAt: new Date().toISOString(), decision: null }), false);
    }
  }));
  $('accept-btn').addEventListener('click', () => saveCurrent('accepted'));
  $('reject-btn').addEventListener('click', () => saveCurrent('rejected'));

  function saveCurrent(decision) {
    if (!currentTrip) return;
    const entry = { ...currentTrip, decision };
    history.unshift(entry);
    history = history.slice(0, 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    $('save-message').textContent = decision === 'accepted' ? 'Servicio guardado como aceptado.' : 'Servicio guardado como rechazado.';
    renderHistory();
  }
  $('save-settings').addEventListener('click', () => {
    const minKm = Number($('min-km').value);
    const minHour = Number($('min-hour').value);
    if (minKm < 0 || minHour < 0 || !Number.isFinite(minKm) || !Number.isFinite(minHour)) {
      $('settings-message').textContent = 'Ingresa límites válidos, iguales o mayores que cero.';
      return;
    }
    settings = { minKm, minHour };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    $('settings-message').textContent = 'Límites guardados. Se aplicarán a la próxima evaluación.';
  });
  $('clear-history').addEventListener('click', () => {
    if (!history.length) return;
    if (confirm('¿Seguro que quieres borrar todo el historial guardado en este dispositivo?')) {
      history = [];
      localStorage.removeItem(STORAGE_KEY);
      renderHistory();
    }
  });
  function renderHistory() {
    $('stat-count').textContent = history.length;
    const accepted = history.filter(x => x.decision === 'accepted');
    $('stat-accepted').textContent = accepted.length;
    $('stat-total').textContent = cop(accepted.reduce((sum, x) => sum + x.fare, 0));
    const list = $('history-list');
    if (!history.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">↗</div><strong>Aún no tienes servicios</strong><p>Calcula tu primera oferta y guárdala como aceptada o rechazada.</p></div>';
      return;
    }
    list.innerHTML = history.map(item => {
      const acceptedItem = item.decision === 'accepted';
      const date = new Date(item.createdAt);
      const dateText = Number.isNaN(date.getTime()) ? '' : date.toLocaleString('es-CO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
      return `<article class="history-item">
        <div class="history-item-top">
          <div><strong>${cop(item.fare)}</strong><div class="item-date">${dateText}</div></div>
          <span class="item-status ${acceptedItem ? 'accepted' : 'rejected'}">${acceptedItem ? 'ACEPTADO' : 'RECHAZADO'}</span>
        </div>
        <div class="item-metrics"><span>${number(item.km)} km</span><span>${number(item.minutes,0)} min</span><span>${cop(item.perKm)}/km</span><span>${cop(item.perHour)}/h</span></div>
        ${item.note ? `<p class="item-note">${safe(item.note)}</p>` : ''}
        <button class="delete-item" data-delete="${safe(item.id)}" type="button">Eliminar registro</button>
      </article>`;
    }).join('');
    list.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => {
      history = history.filter(item => item.id !== button.dataset.delete);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      renderHistory();
    }));
  }
  updateSettingsInputs();
  renderHistory();
})();