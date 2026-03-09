let tyre_div = document.getElementById("tyre_table");
let battery_div = document.getElementById("battery_table");
let battery_btn = document.getElementById("battery_btn");
let clinic_btn = document.getElementById("clinic_btn");

battery_btn.addEventListener("click", () => {
  tyre_div.classList.add("d-none");
  battery_div.classList.remove("d-none");

  battery_btn.classList.add("active");
  clinic_btn.classList.remove("active");
});
clinic_btn.addEventListener("click", () => {
  battery_div.classList.add("d-none");
  tyre_div.classList.remove("d-none");

  clinic_btn.classList.add("active");

  battery_btn.classList.remove("active");
});

const STORAGE_KEYS = {
  TYRE_RECORDS: "tyreRecords",
  BATTERY_RECORDS: "batteryRecords"
};

// helpers for rendering stored records
function getTyreRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TYRE_RECORDS) || '[]');
}
function getBatteryRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BATTERY_RECORDS) || '[]');
}
function renderTyreTable(filterType = 'all') {
  const tbody = document.querySelector('#tyreTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  let records = getTyreRecords();
  // apply filter if a specific service type is selected
  if (filterType !== 'all') {
    records = records.filter(r => r.services?.some(s => s.type === filterType));
  }
  let total = 0;
  records.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.plate}</td><td>${r.services.map(s => s.name).join(', ')}</td><td>${r.total}</td><td>${r.attendant}</td><td>${new Date(r.date).toLocaleString()}</td>`;
    tbody.appendChild(tr);
    total += r.total;
  });
  const revenueEl = document.getElementById('tyreTotalRevenue');
  if (revenueEl) revenueEl.textContent = total;
}

// battery table rendering
function renderBatteryTable(filterType = 'all') {
  const tbody = document.querySelector('#batteryTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  let records = getBatteryRecords();
  if (filterType !== 'all') {
    records = records.filter(r => r.type === filterType);
  }
  let total = 0;
  records.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.plate}</td><td>${r.type}</td><td>${r.model}</td><td>${r.price}</td><td>${r.customer}</td><td>${r.attendant}</td><td>${new Date(r.date).toLocaleString()}</td>`;
    tbody.appendChild(tr);
    total += r.price;
  });
  const revenueEl = document.getElementById('batteryTotalRevenue');
  if (revenueEl) revenueEl.textContent = total;
}

function addListenerIfSafe(id, eventType, callback) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(eventType, callback);
}

window.addEventListener('load', () => {
  // initial render with no filter applied
  renderTyreTable();
  renderBatteryTable();
  // wire up filter dropdowns
  addListenerIfSafe('tyreFilter', 'change', (e) => renderTyreTable(e.target.value));
  addListenerIfSafe('batteryFilter', 'change', (e) => renderBatteryTable(e.target.value));
});
