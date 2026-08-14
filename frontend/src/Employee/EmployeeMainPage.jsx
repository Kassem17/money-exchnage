import React, { useContext, useState, useEffect, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import CreateClient from "../pages/CreateClient";
import PermissionsModal from "../components/PermissionModel";
import CreateProcessGreater from "../pages/ProcessesCreation/CreateProcessGreater";
import CreateProcessLess from "../pages/ProcessesCreation/CreateProcessLess";
import AllClients from "../pages/Clients/AllClients";
import MakeReport from "../pages/MakeReport";
import MakeReportForGreater from "../pages/MakeReportForGreater";
import {
  Home,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Users,
  FileText,
  ChevronLeft,
  Shield,
} from "lucide-react";

import currency from "../assets/currency.png";
import empImage from "../assets/newImage.png";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";

const imageSlides = [currency, empImage, image1, image2, image3, image4, image5];

const EmployeeMainPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { userData } = useContext(AppContext);

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "home";
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = useMemo(
    () => [
      {
        key: "home",
        label: "الصفحة الرئيسية",
        icon: Home,
        active: activePage === "home",
        disabled: false,
      },
      {
        key: "create-client",
        label: "إنشاء عميل",
        icon: UserPlus,
        active: activePage === "create-client",
        disabled:
          !(userData?.createClientGreater || userData?.createClientLess),
      },
      {
        key: "create-process-greater",
        label: "عملية أكثر من 10000",
        icon: ArrowUp,
        active: activePage === "create-process-greater",
        disabled: !userData?.createProcessGreater,
      },
      {
        key: "create-process-less",
        label: "عملية أقل من 10000",
        icon: ArrowDown,
        active: activePage === "create-process-less",
        disabled: !userData?.createProcessLess,
      },
      {
        key: "clients",
        label: "قائمة العملاء",
        icon: Users,
        active: activePage === "clients",
        disabled: false,
      },
      {
        key: "make-report",
        label: "تقرير أقل من 10000",
        icon: FileText,
        active: activePage === "make-report",
        disabled: false,
      },
      {
        key: "make-report-greater",
        label: "تقرير أكثر من 10000",
        icon: FileText,
        active: activePage === "make-report-greater",
        disabled: false,
      },
    ],
    [activePage, userData?.createClientGreater, userData?.createClientLess, userData?.createProcessGreater, userData?.createProcessLess]
  );

  const renderContent = () => {
    switch (activePage) {
      case "create-client":
        return <CreateClient />;
      case "create-process-greater":
        return <CreateProcessGreater />;
      case "create-process-less":
        return <CreateProcessLess />;
      case "clients":
        return <AllClients />;
      case "make-report":
        return <MakeReport />;
      case "make-report-greater":
        return <MakeReportForGreater />;
      default:
        return (
          <div className="flex items-center justify-center p-6 min-h-[24rem]">
            <div className="w-full max-w-4xl">
              <div className="rounded-card overflow-hidden border border-surface-200 bg-white shadow-card relative">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                  }}
                >
                  {imageSlides.map((src, i) => (
                    <div
                      key={i}
                      className="w-full flex-shrink-0 h-80 bg-surface-100"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'%3E%3Crect fill='%23f1f5f9' width='400' height='200'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentIndex(
                      (currentIndex - 1 + imageSlides.length) % imageSlides.length
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
                  aria-label="السابق"
                >
                  &#10094;
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((currentIndex + 1) % imageSlides.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
                  aria-label="التالي"
                >
                  &#10095;
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {imageSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentIndex
                          ? "w-6 bg-primary-600"
                          : "w-2 bg-surface-300 hover:bg-surface-400"
                      }`}
                      aria-label={`الشريحة ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-50">
      <aside className="w-56 flex-shrink-0 border-r border-surface-200 bg-white shadow-nav flex flex-col">
        <div className="p-4 border-b border-surface-100">
          <h1 className="text-lg font-bold text-surface-800 text-center">
            لوحة الموظف
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3" dir="rtl">
            <span className="font-medium text-surface-700">
              {userData?.username ?? "—"}
            </span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {userData?.role === "employee" ? "موظف" : userData?.role ?? "—"}
            </span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => !item.disabled && setActivePage(item.key)}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-button text-sm font-medium transition ${
                  item.active
                    ? "bg-primary-600 text-white"
                    : "text-surface-600 hover:bg-primary-50 hover:text-primary-700"
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-right">{item.label}</span>
                </div>
                {item.active && <ChevronLeft className="h-4 w-4" />}
              </button>
            );
          })}
          <div className="pt-4">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-button bg-primary-50 text-primary-700 hover:bg-primary-100 transition text-sm font-medium"
            >
              <Shield className="h-4 w-4" />
              عرض الصلاحيات
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
      </div>

      <PermissionsModal
        userData={userData}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default EmployeeMainPage;