import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const CTS = ({ formData, onClose }) => {
  const { backendUrl, token, company, userData } = useContext(AppContext);
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
        <div className="print-content space-y-6 print:space-y-11">
          {/* Title */}
          <div className="text-center mb-6 print:mb-2">
            <p className="text-2xl font-semibold underline">
              إستمارة عملية نقدية (C.T.S)
            </p>
          </div>
          {/* Client Info */}
          <div className="p-4 print:p-2  bg-gray-50  break-inside-avoid">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border border-black">
                  <td className="p-2 border-r border-black w-1/2 font-semibold ">
                    التاريخ:
                    <span className="mr-10 font-normal">
                      {formData?.processDate
                        ? (() => {
                            const d = new Date(formData.processDate);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const year = String(d.getFullYear()).slice(2);
                            return `${day}/${month}/${year}`;
                          })()
                        : "لا يوجد"}
                    </span>
                  </td>
                </tr>

                <tr className="border border-black">
                  <td className="p-2 w-1/2 font-semibold flex gap-2 text-nowrap">
                    الاسم الثلاثي للعميل المنفذ للعملية:
                    <span className="font-normal">
                      {formData?.clientName || "لا يوجد"}
                    </span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td className="p-2 w-1/2 font-semibold flex gap-2 text-nowrap">
                    الجنسية :
                    <span className="font-normal">
                      {client?.nationality || "لا يوجد"}
                    </span>
                  </td>
                </tr>

                <tr className="border border-black">
                  <td className="p-2 w-1/2 font-semibold flex gap-2 text-nowrap">
                    نوع العملة :
                    <span className="font-normal">
                      {formData?.fromCurrency || "لا يوجد"}
                    </span>
                  </td>
                </tr>

                <tr className="border border-black">
                  <td className="p-2 w-1/2 font-semibold flex gap-2 text-nowrap">
                    قيمة العملية :
                    <span className="font-normal">
                      {formData?.amount || "لا يوجد"}
                    </span>
                  </td>
                </tr>

                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold flex gap-2">
                    مصدر أموال هذه العملية :
                    <span className="font-normal">{formData.moneySource}</span>
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold flex gap-2">
                    وجهة إستعمال أموال هذه العملية :
                    <span className="font-normal">
                      {formData.moneyDestination}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Declaration */}
          <div className="p-4 print:p-2 border border-black bg-gray-50 print-border break-inside-avoid ">
            <p className="text-justify leading-relaxed text-sm">
              أنا الموقع أدناه، اسمي وتوقيعي، أقر واعترف بأن مصدر المبلغ المبين
              أعلاه لا علاقة له بتبييض الأموال أو تمويل الإرهاب، وأتعهد تعهداً
              لا رجوع عنه بتزويد إدارة شركتكم عند أول طلب بجميع المستندات التي
              تثبت مصدر الأموال المذكورة أعلاه في هذه الاستمارة.
            </p>
          </div>
          {/* Signatures */}
          <div className="flex justify-end mt-6 print:mt-8 break-inside-avoid">
            <div className="w-64 space-y-6 print:space-y-3 text-sm">
              <div className="flex ">
                <span className="font-semibold">التاريخ:</span>
                <span className="mr-10 font-normal">
                  {formData?.processDate
                    ? (() => {
                        const d = new Date(formData.processDate);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = String(d.getFullYear()).slice(2);
                        return `${day}/${month}/${year}`;
                      })()
                    : "لا يوجد"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">الاسم الثلاثي:</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">التوقيع:</span>
              </div>
            </div>
          </div>
          <div className="p-4 print:mt-5">
            <table className="w-full border border-black print-border-table">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border border-black text-center print-border-table">
                    موظف منفذ العملية
                  </th>
                  <th className="py-2 px-4 border border-black text-center print-border-table">
                    موظف وحدة الامتثال
                  </th>
                  <th className="py-2 px-10 border border-black text-center print-border-table">
                    الإدارة
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-5 px-4 border border-black text-xl text-center print-border-table">
                    {userData.username}
                  </td>
                  <td className="py-5 px-4 border border-black text-xl text-center print-border-table">
                    {company.complianceUnitOfficer}
                  </td>
                  <td className="py-5 px-4 text-center border text-xl border-black print-border-table">
                    {company.administratorName}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          ;
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

export default CTS;
