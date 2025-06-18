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
import MakeReport from "./pages/MakeReport";
import CreateProcessLess from "./pages/ProcessesCreation/CreateProcessLess";
import CreateProcessGreater from "./pages/ProcessesCreation/CreateProcessGreater";
import AllClients from "./pages/Clients/AllClients";

const App = () => {
  const { token, userData, loading } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Save last visited path
  useEffect(() => {
    localStorage.setItem("lastPath", location.pathname + location.search);
  }, [location]);

  // Restore last path if user lands at "/"
  useEffect(() => {
    const lastPath = localStorage.getItem("lastPath");
    if (lastPath && window.location.pathname === "/") {
      navigate(lastPath);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-blue-600">
          جارٍ التحميل...
        </div>
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
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed Navbar */}
      {token && <Navbar />}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="colored"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />

      {/* Main Content */}
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />

          {!token ? (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
            </>
          ) : userData.role === "admin" ? (
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
