import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const KYC = ({ formData, onClose }) => {
  const { backendUrl, token } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("processId");

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `نموذج اعرف عميلك - ${clientName}`;

    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 0;
          background: white;
        }
        .print-border, .print-border-bottom, .print-border-table, 
        .print-border-table th, .print-border-table td {
          border: 1px solid #000 !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
      document.head.removeChild(style);
    }, 500);
  };

  const [client, setClient] = useState({});

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + `/api/employee/get-client/${formData.clientId}`
        );
        if (data.success) {
          setClient(data.client);
        } else {
          toast.error("please fill the process form");
        }
      } catch (error) {
        console.log("please fill the process form");
      }
    };

    if (token) {
      fetchClient();
    }
  }, []);

  const address = client?.currentAddress || {};
  const clientName = client?.fullname || "العميل";

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto  print:bg-transparent print:m-7"
      dir="rtl"
    >
      <div
        ref={modalRef}
        className="bg-white max-w-3xl w-full h-screen p-6 print:p-2 mx-auto my-8 rounded-lg shadow-lg relative overflow-y-auto print:shadow-none print:rounded-none print:max-h-full print:overflow-visible print:w-full print:static"
      >
        <div className="flex  mb-4 no-print">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-red-600 font-bold text-3xl"
            aria-label="Close"
          >
            ×
          </button>

          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            طباعة كـ PDF
          </button>
        </div>

        {/* Printable Content */}
        <div className="print-content space-y-6 print:space-y-10">
          {/* Title */}
          <div className="text-center mb-6 print:mb-2">
            <p className="text-2xl font-semibold underline">
              نموذج اعرف عميلك (K.Y.C)
            </p>
          </div>

          {/* Client Info */}
          <div className="p-4 print:p-2  bg-gray-50 break-inside-avoid">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border border-black">
                  <td className="p-2 w-1/2 font-semibold flex gap-2 text-nowrap">
                    الاسم و الشهرة:
                    <span className="font-normal">
                      {formData?.clientName || "لا يوجد"}
                    </span>
                  </td>
                  <td className="p-2 border-r border-black w-1/2 font-semibold ">
                    <span className="ml-2">الجنسية:</span>
                    <span className="ml-2 font-normal">
                      {client?.nationality || "لا يوجد"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold flex gap-2">
                    مقيم:
                    <span
                      className={`font-semibold ${
                        client?.resident ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {client?.resident ? "نعم" : "لا"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td className="p-2 font-semibold border-r  border-black">
                    <span>العنوان الكامل:</span>

                    <span className="mr-2 font-normal">
                      {[address.district, address.city, address.country]
                        .filter(Boolean)
                        .join(", ") || "غير متوفر"}
                    </span>
                  </td>
                  <td className="p-2 font-semibold border-r border-black">
                    <span>رقم الهاتف:</span>
                    <span className="mr-2 font-normal">
                      {client?.phoneNumber || "غير متوفر"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>مهنة العميل:</span>
                    <span className="mr-2 font-normal">
                      {client?.work || "غير محدد"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>الوضع المالي:</span>
                    <span
                      className={`mr-2 font-medium ${
                        client?.financialStatus === "good"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {client?.financialStatus === "good" ? "جيد" : "سيئ"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>مصدر اموال العملية:</span>
                    <span className="mr-2 font-normal">
                      {formData?.moneySource || "غير محدد"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>المصارف التي يتعامل معها:</span>
                    <span className="mr-2 font-normal">
                      {client?.banksDealingWith?.length > 0
                        ? client.banksDealingWith
                            .map((b) => b.bankName)
                            .join(", ")
                        : "لا يوجد مصارف"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>المدخول السنوي:</span>
                    <span className="mr-2 font-normal">
                      {client?.yearlyIncome || "غير محدد"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black print-border-bottom">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>صاحب الحق الاقتصادي من تنفيذ العمليات:</span>
                    <span className={`mr-2 font-medium`}>
                      {client?.ownerOfEconomicActivity
                        ? client?.ownerOfEconomicActivity
                        : "غير محدد"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Declaration */}
          <div className="p-4 print:p-2  break-inside-avoid print:mb-4">
            <p className="text-justify leading-relaxed text-sm">
              أنا الموقع أدناه، اسمي وتوقيعي، أقر وأعترف بأن مصدر المبالغ
              المسلمة من قبلي لشركتكم لا علاقة له بتبييض الأموال أو تمويل
              الإرهاب، وأتعهد تعهداً لا رجوع عنه بتزويد إدارة شركتكم عند أول طلب
              بجميع المستندات التي تثبت مصدر أموالي. كما أنني أقر أن صاحب الحق
              الاقتصادي المذكور أعلاه صحيح، وفي حال أي تعديل سأقوم بإبلاغ شركتكم
              فوراً.
            </p>
          </div>

          {/* Signatures */}
          <div className="flex justify-end mt-6 print:mt-6 break-inside-avoid">
            <div className="w-64 space-y-6 print:space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">التاريخ:</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">الاسم الثلاثي:</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">التوقيع:</span>
              </div>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
  @page {
    size: A4;
    margin: 10mm;
  }

  @media print {
    html, body {
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
       overflow: hidden !important;
    height: 100% !important;
    }

    .no-print {
      display: none !important;
    }

    .print-content {
      transform: scale(0.95);
      transform-origin: top center;
      padding: 0 !important;
      margin: 0 !important;
      font-size: 12px !important;
      line-height: 1.4;
    }

    .print-content {
    page-break-after: avoid !important;
    page-break-before: avoid !important;
    break-inside: avoid !important;
  }

    .print-border,
    .print-border-table,
    .print-border-table td,
    .print-border-table th {
      border: 1px solid black !important;
    }

    table {
      width: 100% !important;
      table-layout: fixed;
    }

    td, th {
      padding: 4px !important;
      font-size: 12px !important;
    }

    .break-inside-avoid {
      break-inside: avoid !important;
    }
  }
`}</style>
      </div>
    </div>
  );
};

export default KYC;
