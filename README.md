# Service Management Platform

A lightweight, client-side web application built with HTML, CSS, and JavaScript that provides basic service management features for a hypothetical business. It includes dashboards for staff performance and battery inventory, as well as pages for services, reports, and user login/logout. The project leverages Bootstrap 5 for styling and responsiveness.

## 📝 Project Description

This repository contains a small-scale service management platform designed for demonstration and educational purposes. It emphasizes front-end technologies and simulated data to showcase how a simple dashboard and CRUD interfaces (focuses on create and retrieve) might be implemented without a backend server. The platform includes:

- **Dashboard**: Overview of staff performance and inventory tracking.
- **Services Page**: Interface for listing and managing available services. transactions made here are stored on the locacl storage
- **Reports Page**: Generate sample reports (e.g., tyre services). dynamically picking data from    local storage
- **Login Page**: Simple login/logout flow (static, no authentication logic).
- **Assets**: CSS, JavaScript, and JSON data for simulated records.


## 🚀 Getting Started

### Prerequisites

All you need is a modern web browser. No server setup or build tools are required.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/roscalyse/service_management_platform.git
   cd service_management_platform
   ```
2. **Serve the files from a local web server**
   > **Important:** the app uses `fetch()` to load JSON data, which will fail when pages are opened directly with `file://` URLs. Always run a server.
   - Use the **Go Live** extension in VS Code, or run a simple Python/Node server:
     ```bash
     # with Python 3
     python -m http.server 8000

     # with Node.js (if you have http-server installed)
     npx http-server -c-1
     ```
   - Open `http://localhost:8000/index.html` (or whatever port your server uses).

The application should load and display the dashboard. Navigate between pages using the navigation bar.

### Usage

1. **Dashboard**
   - View staff performance and inventory summaries.
   - Data is pulled from JSON files under `assets/json` (e.g. `users.json`, `battery_models.json`).
2. **Services & Reports**
   - Check out the services and reports pages for sample data lists.
   - tyre and battery transactions added are stored to the local storage
   - Modify the JSON files to experiment with different content.
3. **Login/Logout**
   - Clicking "Logout" will simply take you to `login.html` (no real authentication).

## 📁 Project Structure

```
index.html
login.html
reports.html
services.html
assets/
  css/
  images/
  js/
    auth.js
    dashboard.js
    reports.js
    services.js
  json/
    battery_models.json
    tyre_service.json
    users.json
```

## 🛠 Customization

- Add or update JSON files under `assets/json` for new data.
- Modify JavaScript files in `assets/js` to change behavior or add features.
- Replace Bootstrap components with your own styling if desired.

## 📄 License

This project is open source and available.

---

Feel free to adapt the README content above for your GitHub repository description, and tweak the project details as necessary.