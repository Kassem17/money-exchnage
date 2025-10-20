import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { formatWithCommas } from "../utils/formatWithComma";
import { useEditClient } from "../hooks/useEditClient";
import { socket } from "../utils/socket";

const KYC = ({ formData, onClose }) => {
  const { backendUrl, token } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("processId");
  const { editClient, loading } = useEditClient();
  const [isEditing, setIsEditing] = useState(false);
  const [client, setClient] = useState({});
  const [formValues, setFormValues] = useState({
    client: {},
    address: {},
  });

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
        input, select {
          border: none !important;
          background: transparent !important;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        input:focus, select:focus {
          outline: none !important;
          box-shadow: none !important;
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

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + `/api/employee/get-client/${formData.clientId}`
        );
        if (data.success) {
          setClient(data.client);
          // Initialize form values with current client data
          setFormValues({
            client: { ...data.client },
            address: { ...(data.client.currentAddress || {}) },
          });
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
  }, [formData.clientId, token, backendUrl]);

  const address = client?.currentAddress || {};
  const clientName = client?.fullname || "العميل";

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset form values to original when canceling edit
    if (isEditing) {
      setFormValues({
        client: { ...client },
        address: { ...(client.currentAddress || {}) },
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [name]: value,
      },
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleFinancialStatusChange = (e) => {
    setFormValues((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        financialStatus: e.target.value,
      },
    }));
  };

  const handleResidentChange = (e) => {
    setFormValues((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        resident: e.target.checked,
      },
    }));
  };

  const handleBanksChange = (e) => {
    const banks = e.target.value
      .split(",")
      .map((bank) => ({ bankName: bank.trim() }));
    setFormValues((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        banksDealingWith: banks,
      },
    }));
  };

  const handleSave = async () => {
    try {
      // Prepare the data to send - only include changed fields if needed
      const updatedClient = {
        ...formValues.client,
        currentAddress: formValues.address,
      };

      // Remove undefined or null values to avoid overwriting with null
      Object.keys(updatedClient).forEach((key) => {
        if (updatedClient[key] === undefined || updatedClient[key] === null) {
          delete updatedClient[key];
        }
      });

      const result = await editClient(client._id, updatedClient);
      if (result.success) {
        setClient(result.client);
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("فشل في تحديث البيانات: " + error.message);
    }
  };

  const [signatures, setSignatures] = useState({
    date: "",
    fullName: "",
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto print:bg-transparent print:m-7"
      dir="rtl"
    >
      <div className="bg-white max-w-3xl w-full h-screen p-6 print:p-2 mx-auto my-8 rounded-lg shadow-lg relative overflow-y-auto print:shadow-none print:rounded-none print:max-h-full print:overflow-visible print:w-full print:static">
        <div className="flex justify-between mb-4 no-print">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-red-600 font-bold text-3xl"
            aria-label="Close"
          >
            ×
          </button>

          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
              >
                تعديل البيانات
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
                >
                  {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
                <button
                  onClick={handleEditToggle}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                >
                  إلغاء
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              طباعة كـ PDF
            </button>
          </div>
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
          <div className="p-4 print:p-2 bg-gray-50 break-inside-avoid">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border border-black">
                  <td className="p-2 w-1/2 font-semibold flex gap-2 text-nowrap">
                    الاسم و الشهرة:
                    <span className="font-normal">
                      {client?.fullname || "لا يوجد"}
                    </span>
                  </td>
                  <td className="p-2 border-r border-black w-1/2 font-semibold">
                    <span className="ml-2">الجنسية:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="nationality"
                        value={formValues.client.nationality || ""}
                        onChange={handleInputChange}
                        className="border-b border-gray-400 px-1 w-full mr-2"
                      />
                    ) : (
                      <span className="ml-2 font-normal">
                        {client?.nationality || "لا يوجد"}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold flex gap-2">
                    مقيم:
                    {isEditing ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formValues.client.resident || false}
                          onChange={handleResidentChange}
                          className="form-checkbox h-4 w-4"
                        />
                        <span>{formValues.client.resident ? "نعم" : "لا"}</span>
                      </label>
                    ) : (
                      <span
                        className={`font-semibold ${
                          client?.resident ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {client?.resident ? "نعم" : "لا"}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border border-black">
                  <td className="p-2 font-semibold border-r border-black">
                    <span>العنوان الكامل:</span>
                    {isEditing ? (
                      <div className="flex flex-col gap-1 mt-1">
                        <input
                          type="text"
                          name="country"
                          placeholder="البلد"
                          value={formValues.address.country || ""}
                          onChange={handleAddressChange}
                          className="border-b border-gray-400 px-1"
                        />
                        <input
                          type="text"
                          name="district"
                          placeholder="المدينة"
                          value={formValues.address.district || ""}
                          onChange={handleAddressChange}
                          className="border-b border-gray-400 px-1"
                        />
                        <input
                          type="text"
                          name="building"
                          placeholder="مبنى\طابق"
                          value={formValues.address.building || ""}
                          onChange={handleAddressChange}
                          className="border-b border-gray-400 px-1"
                        />
                        <input
                          type="text"
                          name="street"
                          placeholder="الشارع"
                          value={formValues.address.street || ""}
                          onChange={handleAddressChange}
                          className="border-b border-gray-400 px-1"
                        />
                      </div>
                    ) : (
                      <span className="mr-2 font-normal">
                        {[address.district, address.street, address.building]
                          .filter(Boolean)
                          .join(",  ") || "غير متوفر"}
                      </span>
                    )}
                  </td>
                  <td className="p-2 font-semibold border-r border-black">
                    <span>رقم الهاتف:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formValues.client.phoneNumber || ""}
                        onChange={handleInputChange}
                        className="border-b border-gray-400 px-1 w-full mr-2"
                      />
                    ) : (
                      <span className="mr-2 font-normal">
                        {client?.phoneNumber || "غير متوفر"}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>مهنة العميل:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="work"
                        value={formValues.client.work || ""}
                        onChange={handleInputChange}
                        className="border-b border-gray-400 px-1 w-full mr-2"
                      />
                    ) : (
                      <span className="mr-2 font-normal">
                        {client?.work || "غير محدد"}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>الوضع المالي:</span>
                    {isEditing ? (
                      <select
                        name="financialStatus"
                        value={formValues.client.financialStatus || "medium"}
                        onChange={handleFinancialStatusChange}
                        className="border border-gray-400 px-1 mr-2"
                      >
                        <option value="good">جيد</option>
                        <option value="medium">متوسط</option>
                        <option value="excellent">ممتاز</option>
                      </select>
                    ) : (
                      <span className={`mr-2 font-medium`}>
                        {client?.financialStatus === "good"
                          ? "جيد"
                          : client?.financialStatus === "medium"
                          ? "متوسط"
                          : client?.financialStatus === "excellent"
                          ? "ممتاز"
                          : "غير محدد"}
                      </span>
                    )}
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
                    {isEditing ? (
                      <input
                        type="text"
                        name="banksDealingWith"
                        value={
                          formValues.client.banksDealingWith?.length > 0
                            ? formValues.client.banksDealingWith
                                .map((b) => b.bankName)
                                .join(", ")
                            : ""
                        }
                        onChange={handleBanksChange}
                        className="border-b border-gray-400 px-1 w-full mr-2"
                        placeholder="أدخل المصارف مفصولة بفواصل"
                      />
                    ) : (
                      <span className="mr-2 font-normal">
                        {client?.banksDealingWith?.length > 0
                          ? client.banksDealingWith
                              .map((b) => b.bankName)
                              .join(", ")
                          : "لا يوجد مصارف"}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border border-black">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>المدخول السنوي:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        name="yearlyIncome"
                        value={formValues.client.yearlyIncome || ""}
                        onChange={handleInputChange}
                        className="border-b border-gray-400 px-1 w-32 mr-2"
                      />
                    ) : (
                      <span className="mr-2 font-normal">
                        {formatWithCommas(client?.yearlyIncome) || "غير محدد"}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border border-black print-border-bottom">
                  <td colSpan="2" className="p-2 font-semibold">
                    <span>صاحب الحق الاقتصادي من تنفيذ العمليات:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="ownerOfEconomicActivity"
                        value={formValues.client.ownerOfEconomicActivity || ""}
                        onChange={handleInputChange}
                        className="border-b border-gray-400 px-1 w-full mr-2"
                      />
                    ) : (
                      <span className={`mr-2 font-medium`}>
                        {client?.ownerOfEconomicActivity
                          ? client?.ownerOfEconomicActivity
                          : "غير محدد"}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Declaration */}
          <div className="p-4 print:p-2 break-inside-avoid print:mb-4">
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
          <div className="flex justify-end mt-6 print:mt-8 break-inside-avoid">
            <div className="w-64 space-y-6 print:space-y-3 text-sm">
              <div className="flex  items-center">
                <span className="font-semibold">التاريخ:</span>
                <input
                  type="date"
                  value={signatures.date}
                  onChange={(e) =>
                    setSignatures({ ...signatures, date: e.target.value })
                  }
                  className="border-b mr-2 border-gray-400 px-1 w-32 text-center"
                />
              </div>
              <div className="flex  items-center">
                <span className="font-semibold text-nowrap">
                  الاسم الثلاثي:
                </span>
                <input
                  type="text"
                  value={signatures.fullName}
                  onChange={(e) =>
                    setSignatures({ ...signatures, fullName: e.target.value })
                  }
                  className="mr-2  px-1 w-full"
                />
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
              input[type="date"]::-webkit-calendar-picker-indicator {
              display: none;
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

            input, select {
              border: none !important;
              background: transparent !important;
              appearance: none;
              -webkit-appearance: none;
              -moz-appearance: none;
            }
            input:focus, select:focus {
              outline: none !important;
              box-shadow: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default KYC;
