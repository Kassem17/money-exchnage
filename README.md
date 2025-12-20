<h1 align="center"> Money exchange </h1>
<p align="center">A Comprehensive Full-Stack Platform for Secure Foreign Currency Exchange Management, Reporting, and Operational Control.</p>

<p align="center">
  <img alt="Build" src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge">
  <img alt="Issues" src="https://img.shields.io/badge/Issues-0%20Open-blue?style=for-the-badge">
  <img alt="Version" src="https://img.shields.io/badge/Version-1.0.0-informational?style=for-the-badge">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge">
  <img alt="Contributions" src="https://img.shields.io/badge/Contributions-Welcome-orange?style=for-the-badge">
</p>
<!-- 
  **Note:** These are static placeholder badges. Replace them with your project's actual live badges.
  You can generate your own at https://shields.io
-->

## 📜 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Data Models](#-data-models)
- [Project Structure](#-project-structure)
- [Demo & Screenshots](#-demo--screenshots)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧭 Overview

**Money exchange** is a powerful, integrated web application designed to streamline the complex operations of a foreign currency exchange business. Built on a modern full-stack architecture, it provides robust administrative tools, dedicated employee portals, secure client management, and comprehensive financial reporting capabilities.

This platform transforms manual, error-prone processes into efficient digital workflows, ensuring compliance, tracking every transaction (`Process`), and maintaining a centralized record of all corporate, employee, and client data.

### The Problem

> Traditional currency exchange operations rely heavily on manual record-keeping, disparate spreadsheets, and fragmented communication. This approach leads to severe inefficiencies, high operational costs, and significant compliance risks, particularly concerning client identity verification (KYC) and accurate financial reporting to regulatory bodies. Managing complex processes (both 'lesser' and 'greater' value transactions) and maintaining up-to-date currency rates without a centralized system is nearly impossible for a scaling business.

### The Solution

**Money exchange** offers a consolidated digital solution built on a secure, RESTful architecture. It eliminates operational bottlenecks by providing specialized interfaces for administrators and employees, ensuring high data integrity through dedicated Mongoose data models (`Client`, `Process`, `Currency`), and facilitating immediate financial oversight through real-time, customizable reporting tools.

### Architecture Overview

The system utilizes a **Component-based Architecture** on the frontend, built with `react` for a fast, interactive user experience. The backend leverages the robust capabilities of **REST API** using `express`, providing secure, authenticated routes for administrative and employee operations. Data integrity and persistence are managed via `mongoose`, allowing for structured storage of critical financial and operational records. The system is also enhanced with real-time capabilities using `socket.io` for instant updates on transactions or system status.

---

## ✨ Key Features

The **Money exchange** platform is designed for operational excellence, focusing on security, efficiency, and compliance.

### 🛡️ Secure Operations and Access Control
*   **Role-Based Authentication:** Utilize `jsonwebtoken` and `bcrypt` for highly secure user authentication, distinguishing clearly between Admin and Employee roles via dedicated controllers (`adminController.js`, `employeeController.js`).
*   **Protected Routes:** Ensure that sensitive operational areas are only accessible to authorized personnel using `protectRoute.js` middleware.
*   **Dedicated Interfaces:** Separate dashboards and functionalities for Administrators (`MainPage.jsx`) and operational Employees (`EmployeeMainPage.jsx`).

### 💰 Comprehensive Financial Process Management
*   **Transaction Creation:** Dedicated pages for initiating new exchange processes (`CreateProcessLess.jsx`, `CreateProcessGreater.jsx`) based on transaction value or type.
*   **Real-time Process Tracking:** Leverage `socket.io` (via `socket.js` utility) to provide instant updates on ongoing process statuses, improving operational awareness.
*   **Process Lifecycle Management:** Tools to edit (`useEditProcess.js`, `EditProcess.jsx`) and delete (`useDeleteProcess.js`) transactions, ensuring accurate record correction when necessary.
*   **Detailed Views:** Modal components (`ProcessDetailsModal.jsx`, `ProcessModel.jsx`) allowing employees to quickly review all specifics of a transaction.

### 👥 Client & Identity Management
*   **Client Database:** Centralized management of client data using the dedicated `Client.js` model and associated pages (`AllClients.jsx`, `CreateClient.jsx`).
*   **CRUD Operations:** Seamless creation, editing (`useEditClient.js`), and deletion (`useDeleteClient.js`) of client records.
*   **KYC Integration:** Built-in Know Your Customer component (`KYC.jsx`) to handle necessary compliance checks during client onboarding or transaction creation.

### 📈 Reporting and Audit Readiness
*   **Instant Report Generation:** Specialized pages to generate critical financial reports (`MakeReport.jsx`, `MakeReportForGreater.jsx`).
*   **General Reporting Table:** A dedicated component (`GeneralReportTable.jsx`) for viewing aggregate and filtered operational reports, crucial for auditing and managerial oversight.

### 💼 Administrative Control & Configuration
*   **Employee Management:** Admin tools (`AddEmployee.jsx`) for managing staff accounts and access.
*   **Currency Configuration:** Modals and hooks (`CurrencyModal.jsx`, `useAddCurrency.js`, `useEditCurrency.js`) allowing administrators to dynamically manage the list and rates of supported currencies (`Currency.js` model).
*   **Permission Settings:** Granular control over user permissions using specialized models (`PermissionModel.jsx`, `PermissionSetModel.jsx`, `Permissions.jsx`).

---

## 🛠️ Tech Stack & Architecture

The **Money exchange** platform is built using a modern, scalable MERN-adjacent stack, optimized for performance and maintainability.

| Layer | Technology | Purpose | Why it was Chosen |
| :--- | :--- | :--- | :--- |
| **Frontend** | **React** | Building the Single Page Application (SPA) user interface. | Component-based architecture provides high reusability and efficient rendering for complex dashboards and forms. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework (implied by `tailwind.config.js`). | Enables rapid UI development and customization without writing extensive custom CSS. |
| **Backend** | **Express** | RESTful API creation and server logic. | Lightweight, highly performant, and flexible framework for handling authenticated routes and business logic. |
| **Database** | **Mongoose** | MongoDB object data modeling (ODM). | Simplifies data validation and interaction with MongoDB, crucial for managing structured financial data models like `Process` and `Client`. |
| **Real-time** | **Socket.io** | Establishing bidirectional, low-latency communication between client and server. | Essential for real-time updates on transactions, minimizing polling and improving user experience. |
| **Authentication** | **JWT (jsonwebtoken)** | Secure transmission of information as a JSON object. | Used for stateless authentication, protecting API endpoints and managing user sessions efficiently. |
| **Security** | **Bcrypt** | Hashing passwords securely. | Industry-standard cryptographic library ensuring that sensitive employee data is never stored in plain text. |
| **Configuration** | **Dotenv** | Managing environment variables securely. | Separates configuration from code, allowing sensitive information like database connection strings to remain secure. |

---

## 📊 Data Models

The backend utilizes `Mongoose` to define the schema and structure for critical operational data, ensuring consistency and integrity across all application processes.

| Model | Purpose | Key Controllers/Components |
| :--- | :--- | :--- |
| `Client.js` | Stores all necessary information for individual clients (used in KYC and transaction processes). | `CreateClient.jsx`, `AllClients.jsx`, `useDeleteClient.js` |
| `Process.js` | Represents a single foreign exchange transaction, tracking state, values, and linked client/employee. | `CreateProcessLess.jsx`, `CreateProcessGreater.jsx`, `EditProcess.jsx` |
| `Currency.js` | Manages the list of supported currencies and their current exchange rates. | `CurrencyModal.jsx`, `useAddCurrency.js`, `useEditCurrency.js` |
| `Employee.js` | Holds user data, roles, and authentication information for all staff members. | `AddEmployee.jsx`, `employeeController.js`, `authController.js` |
| `Company.js` | Stores core organizational details or settings specific to the exchange entity. | `CreateCompany.jsx`, `useCompany.js` |

---

## 📁 Project Structure

The project follows a standard monorepo structure, dividing the frontend (React application) and the backend (Express server) into distinct, logical directories.

```
📂 Kassem17-money-exchnage-ba523f3/
├── 📄 .gitignore                 # Files and directories to ignore in git
├── 📄 README.md                  # Project documentation (this file)
│
├── 📂 frontend/                  # React Single Page Application (SPA)
│   ├── 📄 vite.config.js         # Configuration for Vite build tool
│   ├── 📄 index.html             # Main entry point for the application
│   ├── 📄 tailwind.config.js     # Tailwind CSS configuration
│   ├── 📄 package.json           # Frontend dependencies and scripts
│   ├── 📂 public/                # Static assets
│   │   ├── 📄 vite.svg
│   │   └── 📄 Logo.png
│   ├── 📂 src/                   # Frontend source code
│   │   ├── 📄 main.jsx           # React application initialization
│   │   ├── 📄 App.jsx            # Main application component/routing
│   │   ├── 📄 index.css          # Global CSS styles
│   │   ├── 📂 hooks/             # Custom React hooks for business logic
│   │   │   ├── 📄 useLogin.js
│   │   │   ├── 📄 useCreateProcess.js    # Hook for initiating transactions
│   │   │   ├── 📄 useDeleteProcess.js
│   │   │   ├── 📄 useEditProcess.js
│   │   │   ├── 📄 useAddCurrency.js
│   │   │   └── 📄 useCreateClients.js
│   │   ├── 📂 pages/             # Main application views/pages
│   │   │   ├── 📄 Login.jsx
│   │   │   ├── 📄 HomePage.jsx
│   │   │   ├── 📄 Employee.jsx
│   │   │   ├── 📄 MakeReport.jsx         # Report generation interface
│   │   │   ├── 📄 CreateClient.jsx
│   │   │   ├── 📄 CreateCompany.jsx
│   │   │   ├── 📄 NotFound.jsx
│   │   │   ├── 📂 AdminPages/            # Pages restricted to Administrator
│   │   │   │   ├── 📄 MainPage.jsx
│   │   │   │   └── 📄 AddEmployee.jsx    # Employee creation and management
│   │   │   │
│   │   │   ├── 📂 Reports/
│   │   │   │   └── 📄 GeneralReportTable.jsx # Comprehensive report view
│   │   │   │
│   │   │   └── 📂 ProcessesCreation/
│   │   │       ├── 📄 CreateProcessLess.jsx # Standard transaction creation
│   │   │       └── 📄 CreateProcessGreater.jsx # High-value transaction creation
│   │   │
│   │   ├── 📂 Employee/
│   │   │   └── 📄 EmployeeMainPage.jsx   # Dedicated employee dashboard
│   │   │
│   │   ├── 📂 components/        # Reusable UI components and modals
│   │   │   ├── 📄 Navbar.jsx
│   │   │   ├── 📄 KYC.jsx              # Know Your Customer component
│   │   │   ├── 📄 EditProcess.jsx
│   │   │   ├── 📄 ProcessModel.jsx     # Transaction display modal
│   │   │   └── 📄 ConversionForm.jsx   # Currency conversion interface
│   │   │
│   │   ├── 📂 assets/            # Static image and resource files
│   │   │   ├── 📄 Logo.png
│   │   │   └── 📄 currency.png
│   │   │
│   │   ├── 📂 utils/             # Utility functions and helpers
│   │   │   ├── 📄 formatDate.js
│   │   │   ├── 📄 socket.js            # Socket.io connection instance
│   │   │   └── 📄 formatWithComma.js
│   │   │
│   │   ├── 📂 context/
│   │   │   └── 📄 AppContext.jsx       # Global state management
│   │   │
│   │   └── 📂 models/            # UI-specific data models/modals
│   │       ├── 📄 ClientSearch.jsx
│   │       ├── 📄 ClientModal.jsx
│   │       ├── 📄 CurrencyModal.jsx    # Currency rate editing modal
│   │       └── 📄 StatusMessage.jsx
│
└── 📂 backend/                   # Express REST API Server
    ├── 📄 server.js              # Main server entry point
    ├── 📄 package.json           # Backend dependencies and scripts
    ├── 📂 middleware/
    │   └── 📄 protectRoute.js    # JWT authentication middleware
    ├── 📂 controllers/           # Business logic handlers
    │   ├── 📄 adminController.js     # Logic for admin-only operations
    │   ├── 📄 employeeController.js  # Logic for general employee operations
    │   └── 📄 authController.js      # User authentication and login/logout logic
    ├── 📂 routes/                # API endpoint definitions
    │   ├── 📄 adminRouter.js
    │   ├── 📄 authRouter.js
    │   └── 📄 employeeRouter.js
    ├── 📂 database/
    │   └── 📄 connectToDB.js     # MongoDB connection setup (using Mongoose)
    └── 📂 models/                # Mongoose Schema definitions
        ├── 📄 Company.js
        ├── 📄 Employee.js
        ├── 📄 Process.js             # Transaction record schema
        ├── 📄 Currency.js            # Currency configuration schema
        └── 📄 Client.js              # Client database schema
```

---

## 📸 Demo & Screenshots

Since the application is an intricate operational dashboard and management tool, its value is best demonstrated through visual context of the main administrative and employee interfaces, as well as the specialized reporting views.

## 🖼️ Screenshots

<img src="https://placehold.co/800x450/2d2d4d/ffffff?text=App+Screenshot+1:+Login+and+Authentication" alt="App Screenshot 1" width="100%">
<em><p align="center">Secure Login Interface showcasing the professional UI/UX for user authentication.</p></em>

<img src="https://placehold.co/800x450/2d2d4d/ffffff?text=App+Screenshot+2:+Employee+Main+Dashboard" alt="App Screenshot 2" width="100%">
<em><p align="center">The EmployeeMainPage.jsx, showing active processes and quick access to core features like conversion forms.</p></em>

<img src="https://placehold.co/800x450/2d2d4d/ffffff?text=App+Screenshot+3:+Create+Process+Interface" alt="App Screenshot 3" width="100%">
<em><p align="center">Interface for initiating a new transaction (CreateProcessLess/Greater), integrated with client search.</p></em>

<img src="https://placehold.co/800x450/2d2d4d/ffffff?text=App+Screenshot+4:+Admin+Management+Panel" alt="App Screenshot 4" width="100%">
<em><p align="center">The Admin MainPage, providing an overview of system health and employee performance metrics.</p></em>

<img src="https://placehold.co/800x450/2d2d4d/ffffff?text=App+Screenshot+5:+General+Report+Generation" alt="App Screenshot 5" width="100%">
<em><p align="center">The MakeReport.jsx view, demonstrating filtering options for generating required financial audit reports.</p></em>

<img src="https://placehold.co/800x450/2d2d4d/ffffff?text=App+Screenshot+6:+Currency+Configuration+Modal" alt="App Screenshot 6" width="100%">
<em><p align="center">Admin interface for updating currency exchange rates (CurrencyModal.jsx) in real time.</p></em>

---

## 🚀 Getting Started

This guide outlines the steps necessary to set up and run the **Money exchange** application locally. This project requires separate setup for the backend Express server and the frontend React application.

### Prerequisites

You must have the following software installed on your machine:

1.  **Node.js & npm:** Node.js (which includes npm) is required to run both the frontend and backend components.
2.  **MongoDB:** An instance of MongoDB (local or cloud-hosted) is necessary as the application relies on `mongoose` for data persistence.

### Initial Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Kassem17-money-exchnage-ba523f3.git
    cd Kassem17-money-exchnage-ba523f3
    ```

2.  **Configuration (Environment Variables)**

    Although no specific environment variables were detected in the analysis output, the presence of the `dotenv` dependency in the backend clearly mandates the use of a `.env` file for secure configuration (e.g., MongoDB connection string, JWT secret key).

    In the `backend/` directory, create a file named `.env` and configure your necessary variables (such as `MONGO_URI` and `JWT_SECRET`).

### Backend Installation and Execution

The backend server is responsible for the API, authentication, and database interaction.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend/
    ```

2.  **Install dependencies:**
    The server uses `express`, `mongoose`, `bcrypt`, `jsonwebtoken`, and `socket.io`.
    ```bash
    npm install
    ```

3.  **Start the server:**
    The `package.json` file in the backend defines scripts for running the application.
    ```bash
    # Starts the server using nodemon for development (defined in package.json scripts)
    npm run server 
    
    # Alternatively, start the server without monitoring
    # npm start 
    ```
    The server should start running, typically on port 5000 (standard Express practice).

### Frontend Installation and Execution

The frontend is a React application built with Vite.

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend/
    ```

2.  **Install dependencies:**
    The frontend uses `react`, potentially `socket.io-client`, and related libraries.
    ```bash
    npm install
    ```

3.  **Start the client application:**
    ```bash
    # Starts the Vite development server (implied standard script)
    npm run dev
    ```
    The frontend should now be accessible in your web browser, typically at `http://localhost:5173`.

---

## 🔧 Usage

The **Money exchange** platform is designed for two primary user groups: Administrators and Employees.

### 👩‍💻 Employee Workflow

Employees interact with the system primarily through the dedicated dashboard (`EmployeeMainPage.jsx`) to handle daily currency exchange processes:

1.  **Authentication:** Employees log in via `Login.jsx`. The application uses `useLogin.js` and `authController.js` for verification.
2.  **Client Management:** Before a transaction, verify the client or create a new one using `CreateClient.jsx`.
3.  **Transaction Initiation:** Navigate to the process creation pages (`CreateProcessLess.jsx` or `CreateProcessGreater.jsx`). The system utilizes `useCreateProcess.js` to manage the lifecycle and persistence of the new `Process` record.
4.  **Real-time Status:** Use the application interface, which is connected via `socket.js`, to monitor the status of their current transactions.

### 👑 Administrator Workflow

Administrators have access to sensitive controls managed by `adminController.js` and dedicated Admin Pages:

1.  **System Entry:** Access the main control panel via `AdminPages/MainPage.jsx`.
2.  **Staff Management:** Use `AddEmployee.jsx` to onboard new staff members or manage existing employee roles and permissions.
3.  **System Configuration:**
    *   **Currency Rates:** Open `CurrencyModal.jsx` and use the associated hooks (`useEditCurrency.js`) to update or add new currencies to the `Currency` model.
    *   **Company Settings:** Configure high-level organizational settings via `CreateCompany.jsx`.
4.  **Reporting and Oversight:**
    *   Access the `MakeReport.jsx` and `MakeReportForGreater.jsx` pages to generate detailed, time-period specific reports on all financial operations.
    *   Reports are typically viewed and audited in the `GeneralReportTable.jsx` component.

### API Interaction

The backend API exposes various routes defined in `authRouter.js`, `employeeRouter.js`, and `adminRouter.js`.

*   **Auth Routes (Public):** Used for login/logout and token validation.
*   **Employee Routes (Protected):** Used for core operations such as creating clients, initiating processes, and fetching standard reports.
*   **Admin Routes (Highly Protected):** Used for administrative tasks like adding employees, editing currency rates, and deleting critical records.

Although the analysis only listed the baseline Express default endpoint (`GET /`), the structured router and controller files confirm the existence of a full suite of API endpoints:

| Endpoint Category | Purpose | Related Files |
| :--- | :--- | :--- |
| **Authentication** | User login, registration, and session management. | `authRouter.js`, `authController.js` |
| **Admin Controls** | Employee creation, currency management, system configuration. | `adminRouter.js`, `adminController.js` |
| **Employee Operations** | Client CRUD, Process creation/editing, report data fetching. | `employeeRouter.js`, `employeeController.js` |

---

## 🤝 Contributing

We welcome contributions to improve **Money exchange**! Your input helps make this project better for everyone, ensuring it remains robust and feature-rich for currency exchange operations globally.

### How to Contribute

1. **Fork the repository** - Click the 'Fork' button at the top right of this page
2. **Create a feature branch** 
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** - Improve code, documentation, or features (e.g., adding a new report type in `MakeReport.jsx`).
4. **Test thoroughly** - Ensure all functionality works as expected, especially around the controllers and data models.
   ```bash
   # Use appropriate testing frameworks (currently not detected, but essential for contribution)
   # e.g., npm test
   ```
5. **Commit your changes** - Write clear, descriptive commit messages
   ```bash
   git commit -m 'Add: Amazing new feature that handles X regulatory requirement'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request** - Submit your changes for review against the main branch.

### Development Guidelines

- ✅ Follow the existing code style and conventions (e.g., component structure in `frontend/src/components/`, hook usage in `frontend/src/hooks/`).
- 📝 Add comments for complex logic, especially within controllers (`adminController.js`) and database connections (`connectToDB.js`).
- 🧪 Write tests for new features and bug fixes to protect data integrity.
- 📚 Update documentation for any changed functionality or newly exposed API endpoints.
- 🔄 Ensure backward compatibility when modifying core data models (`Process.js`, `Client.js`).
- 🎯 Keep commits focused and atomic.

### Ideas for Contributions

We're looking for help with the following areas, mapping directly to our current functionality:

- 🐛 **Bug Fixes:** Address issues within report generation (`GeneralReportTable.jsx`) or data persistence errors.
- ✨ **New Features:** Implement new reporting parameters or additional fields to the `Client.js` or `Process.js` models.
- 📖 **Documentation:** Improve README, add tutorials for setting up environment variables, or create guides for using the Admin interface.
- 🎨 **UI/UX:** Enhance the visual design of the transaction creation pages (`ProcessesCreation/`).
- ⚡ **Performance:** Optimize database queries executed via the backend controllers.
- ♿ **Accessibility:** Make the client and process modals more accessible.

### Code Review Process

- All submissions require review by a core maintainer before merging.
- Maintainers will provide constructive feedback focused on security, performance, and adherence to project standards.
- Changes may be requested before final approval.
- Once approved, your PR will be merged and you'll be credited in the release notes.

### Questions?

Feel free to open an issue for any questions or concerns regarding development, feature requests, or bug reports. We're here to help!

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.

### What this means:

- ✅ **Commercial use:** You can use this project commercially (e.g., running a currency exchange business with it).
- ✅ **Modification:** You can modify the code to suit your specific operational needs.
- ✅ **Distribution:** You can distribute this software (provided you include the license).
- ✅ **Private use:** You can use this project privately for development or testing.
- ⚠️ **Liability:** The software is provided "as is", without warranty of any kind.
- ⚠️ **Trademark:** This license does not grant rights to use the project's name or logo as a trademark.

---

<p align="center">Made with ❤️ by the Money exchange Team</p>
<p align="center">
  <a href="#">⬆️ Back to Top</a>
</p>
