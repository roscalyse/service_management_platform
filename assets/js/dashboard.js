// Constants for Storage Keys
const STORAGE_KEYS = {
    TYRE_RECORDS: "tyreRecords",
    BATTERY_RECORDS: "batteryRecords",
    USER: "user"
};

// Ensure user is logged in
const currentUser = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.USER) || "null");
if (!currentUser) {
    window.location.href = "login.html";
}

// Utility functions to read records
function getTyreRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TYRE_RECORDS) || "[]");
}

function getBatteryRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BATTERY_RECORDS) || "[]");
}

// Render Staff Performance Table
function renderStaffPerformance() {
    const tbody = document.querySelector("#staffPerformanceTable tbody");
    if (!tbody) return;

    // Aggregate data
    const tyreRecords = getTyreRecords();
    const batteryRecords = getBatteryRecords();

    // Structure: { "John Doe": { transactions: 0, revenue: 0 } }
    const performanceData = {};

    // Process Tyre Records
    tyreRecords.forEach(record => {
        const attendant = record.attendant || "Unknown";
        if (!performanceData[attendant]) {
            performanceData[attendant] = { transactions: 0, revenue: 0 };
        }
        performanceData[attendant].transactions += 1;
        performanceData[attendant].revenue += Number(record.total || 0);
    });

    // Process Battery Records
    batteryRecords.forEach(record => {
        const attendant = record.attendant || "Unknown";
        if (!performanceData[attendant]) {
            performanceData[attendant] = { transactions: 0, revenue: 0 };
        }
        performanceData[attendant].transactions += 1;
        performanceData[attendant].revenue += Number(record.price || 0);
    });

    // Handle empty state
    if (Object.keys(performanceData).length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No transactions found.</td></tr>`;
        return;
    }

    // Convert object to array and sort by revenue descending
    const sortedPerformers = Object.entries(performanceData)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue);

    // Generate HTML
    tbody.innerHTML = sortedPerformers.map(p => `
        <tr>
            <td class="fw-bold">${p.name}</td>
            <td>${p.transactions}</td>
            <td class="text-success fw-bold">${p.revenue.toLocaleString()}</td>
        </tr>
    `).join("");
}

// Render Battery Inventory
async function renderInventory() {
    const tbody = document.querySelector("#inventoryTable tbody");
    if (!tbody) return;

    try {
        // Fetch Base Inventory Configuration
        const response = await fetch("./assets/json/battery_models.json");
        const batteryModels = await response.json();

        // Get All Battery Sales
        const batteryRecords = getBatteryRecords();

        // Count only "sale" transactions by model
        const soldCounts = {};
        batteryRecords.forEach(r => {
            if (r.type === "sale" && r.model) {
                soldCounts[r.model] = (soldCounts[r.model] || 0) + 1;
            }
        });

        // Generate HTML
        tbody.innerHTML = batteryModels.map(modelData => {
            const sold = soldCounts[modelData.model] || 0;
            const remaining = modelData.quantity - sold;

            // Determine Status Color based on remaining percentage
            let statusBadge = "";
            let percentage = (remaining / modelData.quantity) * 100;

            if (percentage > 50) {
                statusBadge = `<span class="badge bg-success">Healthy</span>`;
            } else if (percentage > 20) {
                statusBadge = `<span class="badge bg-warning text-dark">Low Stock</span>`;
            } else {
                statusBadge = `<span class="badge bg-danger">Critical</span>`;
            }

            return `
                <tr>
                    <td class="fw-bold">${modelData.model}</td>
                    <td>${modelData.quantity}</td>
                    <td>${sold}</td>
                    <td class="fw-bold ${remaining <= (modelData.quantity * 0.2) ? 'text-danger' : ''}">${remaining}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error("Failed to load inventory data:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load inventory data.</td></tr>`;
    }
}

// Initialize Dashboard on Load
window.addEventListener("load", () => {
    renderStaffPerformance();
    renderInventory();
});
