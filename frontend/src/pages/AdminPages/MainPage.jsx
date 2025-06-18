import React, { useContext, useEffect, useState } from "react";
import { Building2, Users, UserPlus } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

import CreateClient from "../CreateClient";
import CreateCompany from "../CreateCompany";
import Employee from "../Employee";
import { toast } from "react-toastify";
import AllClients from "../Clients/AllClients";
import { TbReport } from "react-icons/tb";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDownLong } from "react-icons/fa6";

import empImage from "../../assets/newImage.png";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";
import image4 from "../../assets/image4.png";
import image5 from "../../assets/image5.png";
import currency from "../../assets/currency.png";
import MakeReport from "../MakeReport";
import CreateProcessLess from "../ProcessesCreation/CreateProcessLess";
import CreateProcessGreater from "../ProcessesCreation/CreateProcessGreater";

const links = [
  {
    href: "/",
    label: "الصفحة الرئيسية",
    description: "العودة إلى الصفحة الرئيسية",
    icon: <Building2 className="w-6 h-6 text-indigo-500" />,
    component: null,
  },
  {
    href: "/create-client",
    label: "إنشاء عميل",
    description: "الوصول إلى وحدة إنشاء عميل",
    icon: <UserPlus className="w-6 h-6 text-cyan-600" />,
    component: <CreateClient />,
  },
  {
    href: "/create-process-less",
    label: "إنشاء عملية",
    description: "إنشاء  عملية أقل من 10000",
    icon: <FaArrowDownLong className="w-6 h-6 text-yellow-500" />,
    component: <CreateProcessLess />,
  },
  {
    href: "/create-process-greater",
    label: "إنشاء عملية",
    description: "إنشاء  عملية أكثر من 10000",
    icon: <FaArrowUp className="w-6 h-6 text-yellow-500" />,
    component: <CreateProcessGreater />,
  },
  {
    href: "/create-company",
    label: "إدخال معلومات الشركة",
    description: "الوصول إلى وحدة معلومات الشركة",
    icon: <Building2 className="w-6 h-6 text-green-600" />,
    component: <CreateCompany />,
  },
  {
    href: "/clients",
    label: "قائمة العملاء",
    description: "الوصول إلى العملاء الأعلى دخلًا",
    icon: <Users className="w-6 h-6 text-purple-600" />,
    component: <AllClients />,
  },
  {
    href: "/employee",
    label: "إدارة الموظفين",
    description: "الوصول إلى وحدة الموظفين",
    icon: <UserPlus className="w-6 h-6 text-yellow-500" />,
    component: <Employee />,
  },
  {
    href: "/make-report",
    label: "📝 إنشاء تقرير",
    description: "إنشاء  تقرير شهري أو سنوي",
    icon: <TbReport className="w-6 h-6 text-yellow-500" />,
    component: <MakeReport />,
  },
];

const MainPage = () => {
  const { userData, backendUrl, token } = useContext(AppContext);
  const [companyData, setCompanyData] = useState({});

  const [activeHref, setActiveHref] = useState(() => {
    return localStorage.getItem("activeHref") || "/";
  });

  useEffect(() => {
    localStorage.setItem("activeHref", activeHref);
  }, [activeHref]);

  const activeComponent =
    links.find((link) => link.href === activeHref)?.component || null;

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data } = await axios.get(backendUrl + "/api/admin/get-company");
        if (data.success) {
          setCompanyData(data.company);
        } else {
          toast.error(data.error || "فشل في جلب بيانات الشركة");
        }
      } catch (error) {
        toast.error(error.response?.data?.error || "فشل في جلب بيانات الشركة");
      }
    };
    fetchCompanyData();
  }, []);

  const images = [currency, empImage, image1, image2, image3, image4, image5];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("next");

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection("next");
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex h-screen bg-gray-50 -mt-3">
      <aside className="bg-white border-r p-4 shadow-sm w-16 lg:w-64 transition-all duration-300">
        {/* Sidebar header */}
        <div className="mb-6 text-center hidden lg:block">
          <h2 className="text-xl font-bold text-indigo-600">
            {" "}
            ({userData.username})
          </h2>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          {links.map(({ href, label, icon }) => (
            <button
              key={href}
              onClick={() => setActiveHref(href)}
              className={`w-full text-right flex items-center lg:justify-between justify-center px-4 py-3 rounded-lg transition-all font-medium text-sm
          ${
            activeHref === href
              ? "bg-indigo-600 text-white"
              : "hover:bg-indigo-50 text-indigo-700"
          }`}
            >
              {/* Icon always shown */}
              <span className="lg:ml-3">{icon}</span>

              {/* Label only on large screens */}
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {activeComponent || (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="col-span-1 space-y-8">
                {/* Slider */}
                <div className="relative w-full h-70 rounded-3xl overflow-hidden shadow-xl border border-cyan-200">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{
                      transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                  >
                    {images.map((src, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <img
                          src={src}
                          alt={`Slide ${index + 1}`}
                          onError={(e) =>
                            (e.target.src = "/fallback-image.png")
                          }
                          className="w-full h-auto max-h-screen object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow border">
                <div className="flex items-start gap-4">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <Building2 className="h-8 w-8 text-cyan-700" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-indigo-700 mb-2">
                      مرحبًا بك في نظام صرافة{" "}
                      <span className="text-cyan-600">الرائد</span>
                    </h1>
                    <p className="text-gray-600 text-sm">
                      نظامك الشامل لإدارة عمليات الصرافة بكفاءة. يمكنك متابعة
                      التحويلات، إدارة الأسعار، مراقبة العمليات وتتبع العملات.
                      ابدأ من القائمة الجانبية.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-500" />
                  معلومات الشركة
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: "اسم الشركة", value: companyData.name },
                  {
                    label: "رقم الهاتف",
                    value: companyData.phoneNumber || "لا يوجد",
                  },
                  { label: "اسم المدير", value: companyData.administratorName },
                  { label: "العملة", value: companyData.exchangeCurrency },
                  {
                    label: "العنوان",
                    value: `${companyData.address?.city ?? ""} - ${
                      companyData.address?.street ?? ""
                    }`,
                  },
                  {
                    label: "ضابط وحدة الالتزام",
                    value: companyData.complianceUnitOfficer,
                  },
                ].map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-3 rounded-md border text-right"
                  >
                    <div className="text-gray-500 text-xs">{label}</div>
                    <div className="text-indigo-800 font-medium truncate">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveHref("/create-company")}
                className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
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
