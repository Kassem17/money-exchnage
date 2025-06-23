import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import KYC from "./KYC";
import CTS from "./CTS";
import EditProcess from "./EditProcess";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { formatDate } from "../utils/formatDate";
import { formatWithCommas } from "../utils/formatWithComma";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ProcessDetailsModal = ({ process, onClose, userData, employeeData }) => {
  if (!process) return null;
  const modalRef = useRef(null);

  const { backendUrl, token } = useContext(AppContext);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const client = userData.find((cli) =>
    cli.processes?.some((pro) => pro._id === process._id)
  );

  const [modalType, setModalType] = useState(null);
  const [showEditModel, setShowEditModel] = useState(false);

  const [selectedProcess, setSelectedProcess] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [currenciesData, setCurrenciesData] = useState([]);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + "/api/employee/get-currency"
        );
        if (data.success) {
          setCurrenciesData(data.currencies);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchCurrencyData();
    socket.on("Currency:Added", (newCurrency) => {
      setCurrenciesData((prev) => [...prev, newCurrency]);
    });

    return () => socket.off("Currency:Added");
  }, [backendUrl]);

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/employee/delete-process/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        setDeleteConfirm(null);
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error("Failed to delete process");
    }
  };

  let from = process.fromCurrency;
  let to = process.toCurrency;

  const toCurrencyName = currenciesData.find((c) => c.code === to)?.name || "";
  const fromCurrencyName =
    currenciesData.find((c) => c.code === from)?.name || "";

  const handlePrint = () => {
    const content = document.getElementById("printable-area");
    if (!content) {
      alert("لا يوجد محتوى للطباعة");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");

    printWindow.document.write(`
    <html lang="ar" dir="rtl">
      <head>
        <title>${formatDate(process.processDate)}---تفاصيل العملية</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              font-size: 12px;
              -webkit-print-color-adjust: exact;
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f9fafb;
            margin: 0;
            padding: 30px;
            color: #1f2937;
            direction: rtl;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgb(0 0 0 / 0.1);
            max-width: 700px;
            margin: 0 auto;
            padding: 25px 35px;
          }
          h1 {
            text-align: center;
            font-size: 22px;
            margin-bottom: 25px;
            color: #2563eb;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 12px;
            font-size: 14px;
          }
          tbody tr {
            background: #f3f4f6;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
            display: table-row;
          }
          th, td {
            padding: 12px 16px;
            vertical-align: middle;
          }
          th {
            text-align: right;
            width: 40%;
            font-weight: 600;
            color: #374151;
            border-right: 4px solid #2563eb;
            border-radius: 8px 0 0 8px;
          }
          td {
            background: white;
            border-radius: 0 8px 8px 0;
            font-weight: 700;
            color: #111827;
            word-wrap: break-word;
          }
          .process-type {
            display: inline-block;
            padding: 6px 18px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 14px;
            color: white;
          }
          .sell {
            background-color: #dc2626; /* red */
          }
          .buy {
            background-color: #16a34a; /* green */
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
            text-align: right;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🧾 تفاصيل العملية</h1>
          <h1><strong>إسم العميل:</strong> ${client.fullname}   </h1>

          <table>
            <tbody>
              <tr>
                <th>تاريخ العملية</th>
                <td>${formatDate(process.processDate)}</td>
              </tr>
              <tr>
                <th>تحويل العملات</th>
                <td>${fromCurrencyName} -> ${toCurrencyName}</td>
              </tr>
              <tr>
                <th>المبلغ المحول</th>
                <td>${formatWithCommas(
                  process.processAmountSell
                )} → ${formatWithCommas(process.processAmountBuy)}  </td>
              </tr>
              <tr>
                <th>سعر الصرف</th>
                <td>${formatWithCommas(process.exchangeRate)} ${
      process.toCurrency
    }</td>
              </tr>
              <tr>
                <th>مصدر الأموال</th>
                <td>${process.moneySource}</td>
              </tr>
              <tr>
                <th>وجهة الأموال</th>
                <td>${process.moneyDestination}</td>
              </tr>
              <tr>
                <th>نوع العملية</th>
                <td>
                  <span class="process-type ${
                    process.processType === "Sell" ? "sell" : "buy"
                  }">
                    ${process.processType === "Sell" ? "بيع" : "شراء"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>تم الطباعة بتاريخ: ${formatDate(new Date())}</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto transition-all duration-300 space-y-8"
      >
        {/* Header */}
        <div
          id="printable-area"
          className="flex justify-between items-center border-b pb-4 border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🧾 <span>تفاصيل العملية</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition dark:text-gray-300 dark:hover:text-red-400"
            aria-label="إغلاق"
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
          {[
            { label: "تاريخ العملية", value: formatDate(process.processDate) },
            {
              label: "تحويل العملات",
              value: `${fromCurrencyName} -> ${toCurrencyName}`,
            },
            {
              label: "المبلغ المحول",
              value: `${formatWithCommas(
                process.processAmountBuy
              )} → ${formatWithCommas(process.processAmountSell)}`,
            },
            {
              label: "سعر الصرف",
              value: `${formatWithCommas(process.exchangeRate)} ${
                process.toCurrency
              }`,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-1 shadow-sm"
            >
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {item.label}
              </p>
              <p className="text-gray-900 dark:text-white font-bold">
                {item.value}
              </p>
            </div>
          ))}

          {/* Process Type */}
          <div className="sm:col-span-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
              نوع العملية
            </p>
            <span
              className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                process.processType === "Sell"
                  ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                  : "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
              }`}
            >
              {process.processType === "Sell" ? "بيع" : "شراء"}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
          {/* Money Source */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
              مصدر الأموال
            </p>
            <p className="text-gray-900 dark:text-white font-semibold">
              {process.moneySource}
            </p>
          </div>

          {/* Money Destination */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
              وجهة الأموال
            </p>
            <p className="text-gray-900 dark:text-white font-semibold">
              {process.moneyDestination}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2">
          {/* Edit Button */}
          <div className="flex justify-start ">
            <button
              disabled={!employeeData.editProcess}
              onClick={() => {
                setShowEditModel(true);
                setSelectedProcess(process);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm shadow transition"
            >
              تعديل العملية
            </button>
            <button
              onClick={() => setDeleteConfirm(process._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 ml-4 rounded-lg text-sm shadow transition"
            >
              مسح العملية
            </button>
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow transition ml-4"
            >
              طباعة العملية
            </button>
          </div>

          {/* Conditional Buttons for Greater Clients */}
          {process?.processAmountBuy >= 10000 && (
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "عرض KYC", type: "KYC" },
                { label: "عرض CTS", type: "CTS" },
              ].map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => setModalType(btn.type)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 text-white px-5 py-2.5 rounded-xl shadow-sm text-sm transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {modalType === "KYC" && (
          <KYC
            formData={{
              clientName: client?.fullname,
              clientId: client?._id,
              moneySource: process?.moneySource,
            }}
            onClose={() => setModalType(null)}
          />
        )}
        {modalType === "CTS" && (
          <CTS
            formData={{
              clientName: client?.fullname,
              clientId: client?._id,
              processDate: process?.processDate,
              fromCurrency: fromCurrencyName,
              amount: process?.processAmountBuy,
              moneySource: process?.moneySource,
              moneyDestination: process?.moneyDestination,
            }}
            onClose={() => setModalType(null)}
          />
        )}
        {showEditModel && (
          <EditProcess
            process={selectedProcess}
            onClose={() => {
              setShowEditModel(false);
              setSelectedProcess(null);
            }}
          />
        )}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                تأكيد الحذف
              </h3>
              <p className="text-gray-600 mb-6 text-right">
                هل أنت متأكد أنك تريد حذف هذا الموظف؟ لا يمكن التراجع عن هذا
                الإجراء.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessDetailsModal;
