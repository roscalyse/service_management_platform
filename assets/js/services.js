const STORAGE_KEYS = {
  TYRE_RECORDS: "tyreRecords",
  BATTERY_RECORDS: "batteryRecords",
  USER: "user"
};

// require user to be logged in; otherwise redirect to login page
const currentUser = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.USER) || "null");
if (!currentUser) {
  window.location.href = "login.html";
}

let tyre_div = document.getElementById("tyre_clinic_div");
let battery_div = document.getElementById("battery_div");
let battery_btn = document.getElementById("battery_btn");
let clinic_btn = document.getElementById("clinic_btn");
let tyreServiceForm = document.getElementById("tyreServiceForm");
let services_body = document.getElementById("services_body");
let model_body = document.getElementById("model_body");
let tyreForm = document.getElementById("tyreServiceForm");
let batteryForm = document.getElementById("batteryForm");
let numberPlate = document.getElementById("numberPlate");
let message = document.getElementById("message");
let bmessage = document.getElementById("bmessage");

// cache of battery model data loaded from JSON
let batteryModels = [];
if (!bmessage) {
  console.warn("battery message element not found (id=bmessage)");
}
let tyre_preview = document.getElementById("tyre_preview");
let tyre_preview_body = document.querySelector("#tyre_preview .card-body");

// simple storage helpers for tyre service records
function getTyreRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TYRE_RECORDS) || "[]");
}
function saveTyreRecord(rec) {
  const list = getTyreRecords();
  list.push(rec);
  localStorage.setItem(STORAGE_KEYS.TYRE_RECORDS, JSON.stringify(list));
  updateRunningTotal();
}
function updateRunningTotal() {
  const total = getTyreRecords().reduce((sum, r) => sum + (r.total || 0), 0);
  const elem = document.getElementById("tyreRunningTotal");
  if (elem) elem.textContent = total;
}

// battery storage helpers
function getBatteryRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BATTERY_RECORDS) || "[]");
}
function saveBatteryRecord(rec) {
  const list = getBatteryRecords();
  list.push(rec);
  localStorage.setItem(STORAGE_KEYS.BATTERY_RECORDS, JSON.stringify(list));
  updateBatteryRunningTotal();
}
function updateBatteryRunningTotal() {
  const total = getBatteryRecords().reduce((sum, r) => sum + (r.price || 0), 0);
  const elem = document.getElementById("batteryRunningTotal");
  if (elem) elem.textContent = total;
}

// update running totals on page load
window.addEventListener("load", () => {
  updateRunningTotal();
  updateBatteryRunningTotal();
});

// update the small preview card with whatever the user has entered/checked
function updateTyrePreview() {
  const plate = numberPlate.value.trim();
  const checked = Array.from(
    document.querySelectorAll(".service-checkbox:checked"),
  );
  const services = checked.map((cb) => {
    return cb.nextElementSibling?.textContent || cb.value;
  });
  const total = checked.reduce(
    (sum, cb) => sum + Number(cb.dataset.price || 0),
    0,
  );

  let html = `<p><strong>NumberPlate:</strong> ${plate || "<em>(none)</em>"}</p>`;
  if (services.length) {
    html +=
      `<p><strong>Services:</strong><ul>` +
      services.map((s) => `<li>${s}</li>`).join("") +
      `</ul></p>`;
    html += `<p><strong>Total:</strong> UGX ${total}</p>`;
  } else {
    html += "<p><em>No services selected</em></p>";
  }
  if (tyre_preview_body) tyre_preview_body.innerHTML = html;
}

// battery preview
let battery_preview = document.getElementById("battery_preview");
let battery_preview_body = document.querySelector(
  "#battery_preview .card-body",
);
function updateBatteryPreview() {
  const plate = document.getElementById("batteryPlate")?.value.trim() || "";
  const customer = document.getElementById("customerName")?.value.trim() || "";
  const type = document.getElementById("transactionType")?.value || "";
  const model = document.getElementById("batteryModel")?.value || "";

  // compute price from cached models instead of input field
  let price = 0;
  if (model && type && batteryModels.length) {
    const item = batteryModels.find(i => i.model === model);
    if (item) {
      price = type === 'sale' ? item.sale : item.rent;
    }
  }

  let html = `<p><strong>Plate:</strong> ${plate || "<em>(none)</em>"}</p>`;
  if (model) html += `<p><strong>Model:</strong> ${model}</p>`;
  if (type) html += `<p><strong>Type:</strong> ${type}</p>`;
  if (price) html += `<p><strong>Price:</strong> UGX ${price}</p>`;
  if (customer) html += `<p><strong>Customer:</strong> ${customer}</p>`;
  if (battery_preview_body) battery_preview_body.innerHTML = html;
}

// wire battery inputs for preview
["batteryPlate", "customerName", "transactionType", "batteryModel"].forEach(
  (id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateBatteryPreview);
  },
);

// when model or type changes, we just refresh the preview (price is computed there)
function setBatteryPrice() {
  updateBatteryPreview();
}

["batteryModel", "transactionType"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", setBatteryPrice);
});

numberPlate.addEventListener("input", updateTyrePreview);

async function loadServices() {
  const response = await fetch("./assets/json/tyre_service.json");
  const service = await response.json();

  // generate checkboxes with a unique id per item and a shared class
  let service_html = service
    .map((item) => {
      return `<div class="form-check">
                <input class="form-check-input service-checkbox" id="tyreService-${item.service_type}" name="tyreServices" type="checkbox" value="${item.service_type}"
                    data-price="${item.price}">
                <label class="form-check-label" for="tyreService-${item.service_type}">${item.name} (UGX ${item.price})</label>
               </div>`;
    })
    .join(" ");
  services_body.innerHTML = service_html;
  // once the checkboxes exist, wire up change event to refresh preview
  services_body.addEventListener("change", (e) => {
    if (e.target.classList.contains("service-checkbox")) {
      updateTyrePreview();
    }
  });
  // update preview in case anything is pre-filled
  updateTyrePreview();
}
loadServices();

// load data from battery json
async function loadBatteryData() {
  const response = await fetch("./assets/json/battery_models.json");
  const results = await response.json();
  batteryModels = results; // keep copy for price calculations

  // map using each item rather than the whole results array
  let model_html = results
    .map((item) => {
      return `<option value="${item.model}">${item.model}</option>`;
    })
    .join(" ");
  model_body.innerHTML = model_html;
}
loadBatteryData();

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
function validatePlateNumber(plateNumber) {
  return /^U[A-Za-z]{2}\s\d{3}[A-Za-z]$/.test(plateNumber);
}
// console.log(validatePlateNumber("Uas 678g"));

function validateName(name) {
  return /^[A-Za-z\s]+$/.test(name);
}

function showMessage(element, text, isError = false) {
  if (!element) return;
  element.innerHTML = text;
  element.className = "message";
  element.style.display = "block";
  element.classList.add(isError ? "error" : "success");
}

tyreForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // validate number plate first
  if (!validatePlateNumber(numberPlate.value)) {
    showMessage(message, "Please input a valid Number Plate", true);
    return; // stop processing
  }

  // make sure at least one of the dynamically generated checkboxes is checked
  const checkedBoxes = document.querySelectorAll(".service-checkbox:checked");
  if (checkedBoxes.length === 0) {
    showMessage(message, "Please check at least one service", true);
    return;
  }

  // compute total price (optional) and show success
  const total = Array.from(checkedBoxes).reduce((sum, cb) => {
    return sum + Number(cb.dataset.price || 0);
  }, 0);

  // save record to localStorage for reports (also updates running total)
  const servicesSelected = Array.from(checkedBoxes).map((cb) => ({
    type: cb.value,
    name: cb.nextElementSibling?.textContent || cb.value,
    price: Number(cb.dataset.price || 0),
  }));
  const currentUser = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.USER) || "null");
  saveTyreRecord({
    plate: numberPlate.value.trim(),
    services: servicesSelected,
    total,
    attendant: currentUser?.name || "",
    date: new Date().toISOString(),
  });

  showMessage(message, "Tyre service record saved successfully!", false);

  // after successful submission, refresh preview as well
  updateTyrePreview();
});

function validateBatteryForm(plate, customer, type, model, price) {
  if (!validatePlateNumber(plate)) {
    return { isValid: false, message: "Please input a valid Number Plate" };
  }
  if (!validateName(customer)) {
    return { isValid: false, message: "Please input a valid Customer Name" };
  }
  if (!type || !model || !price) {
    return { isValid: false, message: "Please complete the battery transaction fields" };
  }
  return { isValid: true };
}

// battery form handler
batteryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const plate = document.getElementById("batteryPlate")?.value.trim() || "";
  const customer = document.getElementById("customerName")?.value.trim() || "";
  const type = document.getElementById("transactionType")?.value || "";
  const model = document.getElementById("batteryModel")?.value || "";
  // derive price from loaded batteryModels
  let price = 0;
  if (model && type && batteryModels.length) {
    const item = batteryModels.find(i => i.model === model);
    if (item) price = type === 'sale' ? item.sale : item.rent;
  }

  const validation = validateBatteryForm(plate, customer, type, model, price);
  if (!validation.isValid) {
    showMessage(bmessage, validation.message, true);
    if (!validatePlateNumber(plate)) console.warn("Invalid plate number:", plate);
    return;
  }

  const currentUser = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.USER) || "null");
  saveBatteryRecord({
    plate,
    customer,
    type,
    model,
    price,
    attendant: currentUser?.name || "",
    date: new Date().toISOString(),
  });

  showMessage(bmessage, "Battery record saved successfully!", false);
  updateBatteryPreview();
});
