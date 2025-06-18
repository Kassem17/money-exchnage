import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import KYC from "./KYC";
import CTS from "./CTS";
import EditProcess from "./EditProcess";

const ProcessDetailsModal = ({ process, onClose, userData }) => {
  if (!process) return null;
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

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const client = userData.find((cli) =>
    cli.processes?.some((pro) => pro._id === process._id)
  );

  const [modalType, setModalType] = useState(null);
  const [showEditModel, setShowEditModel] = useState(false);

  const [selectedProcess, setSelectedProcess] = useState(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto transition-all duration-300 space-y-8"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 border-gray-200 dark:border-gray-700">
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
              value: `${process.fromCurrency} → ${process.toCurrency}`,
            },
            {
              label: "المبلغ المحول",
              value: `${process.processAmountBuy} → ${process.processAmountSell}`,
            },
            {
              label: "سعر الصرف",
              value: `${process.exchangeRate} ${process.toCurrency}`,
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
              onClick={() => {
                setShowEditModel(true);
                setSelectedProcess(process);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm shadow transition"
            >
              تعديل العملية
            </button>
          </div>

          {/* Conditional Buttons for Greater Clients */}
          {client.clientType === "greater than 10000" && (
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
              fromCurrency: process?.fromCurrency,
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
      </div>
    </div>
  );
};

export default ProcessDetailsModal;
