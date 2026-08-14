import React, { useContext, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/Navbar";
import { AppContext } from "./context/AppContext";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import ResetPassword from "./components/ResetPassword";
import NotFound from "./pages/NotFound";

import MainPage from "./pages/AdminPages/MainPage";
import AddEmployee from "./pages/AdminPages/AddEmployee";
import EmployeeMainPage from "./Employee/EmployeeMainPage";
import CreateClient from "./pages/CreateClient";
import CreateCompany from "./pages/CreateCompany";
import Employee from "./pages/Employee";
import CTS from "./components/CTS";
import KYC from "./components/KYC";
import CreateProcessLess from "./pages/ProcessesCreation/CreateProcessLess";
import CreateProcessGreater from "./pages/ProcessesCreation/CreateProcessGreater";
import AllClients from "./pages/Clients/AllClients";
import MakeReport from "./pages/MakeReport";
import MakeReportForGreater from "./pages/MakeReportForGreater";

const App = () => {
  const { token, userData, loading } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Save last visited path
  useEffect(() => {
    localStorage.setItem("lastPath", location.pathname + location.search);
  }, [location]);

  // Restore last path only if it's allowed for the current role (avoids sending employees to admin-only routes)
  const allowedPathsByRole = {
    admin: [
      "/",
      "/create-client",
      "/create-process-less",
      "/create-process-greater",
      "/create-company",
      "/clients",
      "/employee",
      "/add-employee",
      "/make-report",
      "/make-report-greater",
      "/cts",
      "/kyc",
      "/employee-main-page",
    ],
    employee: [
      "/",
      "/create-client",
      "/create-process-less",
      "/create-process-greater",
      "/clients",
      "/make-report",
      "/make-report-greater",
      "/cts",
      "/kyc",
      "/employee-main-page",
    ],
  };

  useEffect(() => {
    const lastPath = localStorage.getItem("lastPath");
    const pathOnly = lastPath?.split("?")[0] || "";
    const role = userData?.role;
    if (
      lastPath &&
      window.location.pathname === "/" &&
      role &&
      allowedPathsByRole[role]
    ) {
      const allowed = allowedPathsByRole[role];
      if (allowed.includes(pathOnly)) {
        navigate(lastPath);
      }
    }
  }, [navigate, userData?.role]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <div className="text-lg font-medium text-primary-600">جارٍ التحميل...</div>
      </div>
    );
  }

  // Define route groups
  const employeeRoutes = (
    <>
      <Route path="/create-client" element={<CreateClient />} />
      <Route path="/employee-main-page" element={<EmployeeMainPage />} />
      <Route
        path="/create-process-greater"
        element={<CreateProcessGreater />}
      />
      <Route path="/create-process-less" element={<CreateProcessLess />} />
      <Route path="/cts" element={<CTS />} />
      <Route path="/kyc" element={<KYC />} />
      <Route path="/clients" element={<AllClients />} />
      <Route path="/make-report" element={<MakeReport />} />
      <Route path="/make-report-greater" element={<MakeReportForGreater />} />
    </>
  );

  const adminRoutes = (
    <>
      <Route path="/add-employee" element={<AddEmployee />} />
      <Route path="/employee" element={<Employee />} />
      <Route path="/create-company" element={<CreateCompany />} />
      {employeeRoutes}
    </>
  );

  return (
    <div className="w-full min-h-screen bg-surface-50 flex flex-col">
      {token && <Navbar />}

      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="colored"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />

      <main className="flex-grow">
          <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />

          {!token ? (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
            </>
          ) : userData?.role === "admin" ? (
            <>
              <Route path="/" element={<MainPage />} />
              {adminRoutes}
            </>
          ) : (
            <>
              <Route path="/" element={<EmployeeMainPage />} />
              {employeeRoutes}
            </>
          )}

          <Route path="*" element={<NotFound />} />
          </Routes>
      </main>
    </div>
  );
};

export default App;
