import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  Building2,
  Users,
  UserPlus,
  FileText,
  ArrowUp,
  ArrowDown,
  LayoutDashboard,
  ChevronLeft,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";
import CreateClient from "../CreateClient";
import CreateCompany from "../CreateCompany";
import Employee from "../Employee";
import AllClients from "../Clients/AllClients";
import CreateProcessLess from "../ProcessesCreation/CreateProcessLess";
import CreateProcessGreater from "../ProcessesCreation/CreateProcessGreater";
import MakeReport from "../MakeReport";
import MakeReportForGreater from "../MakeReportForGreater";

import currency from "../../assets/currency.png";
import empImage from "../../assets/newImage.png";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";
import image4 from "../../assets/image4.png";
import image5 from "../../assets/image5.png";

const links = [
  { href: "/", label: "الصفحة الرئيسية", icon: LayoutDashboard },
  { href: "/create-client", label: "إنشاء عميل", icon: UserPlus },
  { href: "/create-process-less", label: "عملية أقل من 10000", icon: ArrowDown },
  { href: "/create-process-greater", label: "عملية أكثر من 10000", icon: ArrowUp },
  { href: "/create-company", label: "معلومات الشركة", icon: Building2 },
  { href: "/clients", label: "قائمة العملاء", icon: Users },
  { href: "/employee", label: "إدارة الموظفين", icon: UserPlus },
  { href: "/make-report", label: "تقرير أقل من 10000", icon: FileText },
  { href: "/make-report-greater", label: "تقرير أكثر من 10000", icon: FileText },
];

const MainPage = () => {
  const { userData, company: companyFromContext } = useContext(AppContext);
  const [activeHref, setActiveHref] = useState(() => {
    return localStorage.getItem("activeHref") || "/";
  });

  const activeLink = useMemo(
    () => links.find((l) => l.href === activeHref),
    [activeHref]
  );

  useEffect(() => {
    localStorage.setItem("activeHref", activeHref);
  }, [activeHref]);

  const companyData = companyFromContext || {};
  const images = useMemo(
    () => [currency, empImage, image1, image2, image3, image4, image5],
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const renderContent = () => {
    switch (activeHref) {
      case "/create-client":
        return <CreateClient />;
      case "/create-process-less":
        return <CreateProcessLess />;
      case "/create-process-greater":
        return <CreateProcessGreater />;
      case "/create-company":
        return <CreateCompany />;
      case "/clients":
        return <AllClients />;
      case "/employee":
        return <Employee />;
      case "/make-report":
        return <MakeReport />;
      case "/make-report-greater":
        return <MakeReportForGreater />;
      default:
        return null;
    }
  };

  const toDisplay = (v) => {
    if (v == null || typeof v === "object") return "—";
    const s = String(v);
    return s.trim() === "" ? "—" : s;
  };

  const companyFields = [
    { label: "اسم الشركة", value: toDisplay(companyData.name) },
    { label: "رقم الهاتف", value: toDisplay(companyData.phoneNumber) },
    { label: "اسم المدير", value: toDisplay(companyData.administratorName) },
    { label: "العملة", value: toDisplay(companyData.exchangeCurrency) },
    {
      label: "العنوان",
      value:
        [companyData.address?.city, companyData.address?.street]
          .filter(Boolean)
          .join(" – ") || "—",
    },
    {
      label: "ضابط وحدة الالتزام",
      value: toDisplay(companyData.complianceUnitOfficer),
    },
  ];

  return (
    <div className="flex min-h-screen bg-surface-50">
      <aside className="w-16 lg:w-56 flex-shrink-0 border-r border-surface-200 bg-white shadow-nav">
        <div className="flex flex-col h-full p-3">
          <div className="mb-4 hidden lg:block px-2 py-3">
            <p className="text-sm font-medium text-surface-500">مرحبًا،</p>
            <p className="text-base font-bold text-surface-800 truncate">
              {userData?.username != null ? String(userData.username) : "—"}
            </p>
          </div>
          <nav className="space-y-1 flex-1">
            {links.map(({ href, label, icon: Icon }) => (
              <button
                key={href}
                onClick={() => setActiveHref(href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition ${
                  activeHref === href
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-surface-600 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="hidden lg:inline truncate text-right">
                  {label}
                </span>
                {activeHref === href && (
                  <ChevronLeft className="h-4 w-4 mr-auto hidden lg:block" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {renderContent() !== null ? (
          renderContent()
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
            <div className="space-y-6">
              {images.length > 0 && (
                <div className="rounded-card overflow-hidden border border-surface-200 bg-white shadow-card">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {images.map((src, i) => (
                      <div key={i} className="w-full flex-shrink-0">
                        <img
                          src={src}
                          alt=""
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'%3E%3Crect fill='%23f1f5f9' width='400' height='200'/%3E%3Ctext fill='%2394a3b8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14'%3Eصورة%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-button bg-primary-100 text-primary-600">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-surface-800 mb-2">
                      مرحبًا في نظام الصيرفة
                    </h1>
                    <p className="text-surface-600 text-sm leading-relaxed">
                      نظامك الشامل لإدارة عمليات الصرافة. تابع التحويلات،
                      الأسعار، والعمليات من القائمة الجانبية.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-surface-800 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  معلومات الشركة
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {companyFields.map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-50 rounded-input p-3 border border-surface-100 text-right"
                  >
                    <div className="text-surface-500 text-xs">{label}</div>
                    <div className="text-surface-800 font-medium truncate mt-0.5">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveHref("/create-company")}
                className="mt-4 w-full btn-primary"
              >
                تعديل المعلومات
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainPage;
