import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import CreateClient from "../pages/CreateClient";

import PermissionsModal from "../components/PermissionModel";
import CreateProcessGreater from "../pages/ProcessesCreation/CreateProcessGreater";
import CreateProcessLess from "../pages/ProcessesCreation/CreateProcessLess";
import AllClients from "../pages/Clients/AllClients";
import {
  Home,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Users,
  FileText,
  ChevronRight,
  Circle,
} from "lucide-react";

import empImage from "../assets/newImage.png";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import currency from "../assets/currency.png";
import MakeReport from "../pages/MakeReport";


const EmployeeMainPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { userData } = useContext(AppContext);

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "home";
  });

  const images = [currency, empImage, image1, image2, image3, image4, image5];
  const [currentIndex, setCurrentIndex] = useState(0);

  const [direction, setDirection] = useState("next");

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection("next");
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);
  // Handle dot click
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  // Save activePage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

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
      default:
        return (
          <div className="h-full w-full flex items-center justify-center p-6 relative overflow-hidden -mt-16 bg-gray-100">
            <div className="relative w-full max-w-4xl h-96 overflow-hidden rounded-xl shadow-2xl bg-white">
              {/* Sliding Container */}
              <div
                className="flex h-full  transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {images.map((slide, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 h-full relative"
                  >
                    <img
                      src={slide}
                      alt={`Slide ${index + 1}`}
                      onError={(e) => (e.target.src = "/fallback-image.png")}
                      className="w-full h-full object-cover"
                    />
                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                      <h3 className="text-xl font-semibold">{slide.title}</h3>
                      <p className="mt-1 text-sm">{slide.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() =>
                  goToSlide((currentIndex - 1 + images.length) % images.length)
                }
                aria-label="Previous Slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
              >
                &#10094;
              </button>
              <button
                onClick={() => goToSlide((currentIndex + 1) % images.length)}
                aria-label="Next Slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
              >
                &#10095;
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-4 h-4 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-indigo-600 scale-125 shadow-lg"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  const navItems = [
    {
      key: "home",
      label: "الصفحة الرئيسية",
      icon: <Home className="w-5 h-5" />,
      active: activePage === "home",
    },
    {
      key: "create-client",
      label: "إنشاء عميل",
      icon: <UserPlus className="w-5 h-5" />,
      active: activePage === "create-client",
      disabled: !userData.createClientGreater && !userData.createClientLess,
    },
    {
      key: "create-process-greater",
      label: "إنشاء عملية > 1000",
      icon: <ArrowUp className="w-5 h-5" />,
      active: activePage === "create-process-greater",
      disabled: !userData.createProcessGreater,
    },
    {
      key: "create-process-less",
      label: "إنشاء عملية < 1000",
      icon: <ArrowDown className="w-5 h-5" />,
      active: activePage === "create-process-less",
      disabled: !userData.createProcessLess,
    },
    {
      key: "clients",
      label: "قائمة العملاء",
      icon: <Users className="w-5 h-5" />,
      active: activePage === "clients",
    },
    {
      key: "make-report",
      label: "إنشاء تقرير",
      icon: <FileText className="w-5 h-5" />,
      active: activePage === "make-report",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-indigo-700">لوحة الموظف</h1>
          <div className="flex items-center mt-2">
            <div className="mr-3 flex gap-2" dir="rtl">
              <p className="font-medium text-gray-800">{userData.username}</p>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {userData.role === "employee" ? "موظف" : userData.role}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => !item.disabled && setActivePage(item.key)}
              disabled={item.disabled}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-right transition-all ${
                item.active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center">
                <span className="ml-3">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.active && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
          <div className=" pt-4 ">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <span>عرض الصلاحيات</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
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
