import React, { useState, useRef, useEffect } from "react";
import {
  formatWithCommas,
  formatNumberWithCommas,
} from "../utils/formatWithComma";

const ConversionForm = ({
  formData,
  setFormData,
  handleChange,
  operation,
  setOperation,
  currenciesData = [],
  setOpenCurrencyModel,
  calculateAmount,
  clientData,
  setType,
  location,
}) => {
  const [currencySelectorTarget, setCurrencySelectorTarget] = useState(null);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [amountWarning, setAmountWarning] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCurrencyModalOpen(false);
      }
    };

    if (isCurrencyModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCurrencyModalOpen]);

  useEffect(() => {
    const rawAmount = formData.amount;
    const amount = parseFloat(rawAmount);

    // If amount is not a valid number
    if (!rawAmount || isNaN(amount)) {
      setAmountWarning("الرجاء إدخال مبلغ صالح.");
      setIsSubmitDisabled(true);
      return;
    }

    const clientType = clientData?.clientType?.trim(); // Trim any extra spaces

    if (
      clientType === "less than 10000" &&
      location === "processLess" &&
      amount >= 10000
    ) {
      setAmountWarning("المبلغ يجب أن يكون أقل من 10000 لهذا العميل.");
      setIsSubmitDisabled(true);
    } else if (location === "greaterProcess" && amount < 10000) {
      setAmountWarning("المبلغ يجب أن يكون 10000 أو أكثر لهذا العميل.");
      setIsSubmitDisabled(true);
    } else {
      setAmountWarning("");
      setIsSubmitDisabled(false);
    }
  }, [formData.amount, clientData]);

  const openCurrencySelector = (target) => {
    setCurrencySelectorTarget(target);
    setIsCurrencyModalOpen(true);
  };

  const selectCurrency = (code) => {
    setFormData((prev) => ({
      ...prev,
      [currencySelectorTarget === "from" ? "fromCurrency" : "toCurrency"]: code,
    }));
    setIsCurrencyModalOpen(false);
  };

  const getCurrencyLabel = (code) => {
    const currency = currenciesData.find((c) => c.code === code);
    return currency ? `${currency.name} (${currency.code})` : code;
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-3">
      <div className="border-b border-gray-200 pb-4 flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            معلومات التحويل
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            أدخل تفاصيل عملية التحويل
          </p>
        </div>
        {/* Process Type */}
        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-10 p-3 -mt-9  rounded-2xl shadow-lg bg-white">
            {/* Sell Option */}
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="sell"
                name="transactionType"
                value="sell" // Changed to lowercase for consistency
                onChange={(e) => setType(e.target.value)}
                className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <label
                htmlFor="sell"
                className="text-xl font-medium text-gray-700"
              >
                بيع
              </label>
            </div>

            {/* Buy Option */}
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="buy"
                name="transactionType"
                value="buy"
                onChange={(e) => setType(e.target.value)}
                className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <label
                htmlFor="buy"
                className="text-xl font-medium text-gray-700"
              >
                شراء
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المبلغ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="amount"
            value={formatNumberWithCommas(formData.amount)}
            onChange={handleChange}
            className={`w-full p-3 text-sm border rounded-lg shadow-sm ${
              amountWarning
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
          {amountWarning && (
            <p className="text-red-500 text-xs mt-1">{amountWarning}</p>
          )}
        </div>

        {/* Operation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            العملية <span className="text-red-500">*</span>
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            required
          >
            <option value="">اختر العملية</option>
            <option value="*">(✖)</option>
            <option value="/">(➗)</option>
          </select>
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            من عملة *
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openCurrencySelector("from")}
              className="flex-1 p-3 text-sm border border-gray-300 rounded-lg bg-white text-right shadow-sm"
            >
              {getCurrencyLabel(formData.fromCurrency)}
            </button>
            <button
              type="button"
              onClick={() => setOpenCurrencyModel(true)}
              className="p-2 border rounded text-blue-600 hover:text-blue-700 border-gray-300"
            >
              +
            </button>
          </div>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            إلى عملة *
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openCurrencySelector("to")}
              className="flex-1 p-3 text-sm border border-gray-300 rounded-lg bg-white text-right shadow-sm"
            >
              {getCurrencyLabel(formData.toCurrency)}
            </button>
            <button
              type="button"
              onClick={() => setOpenCurrencyModel(true)}
              className="p-2 border rounded text-blue-600 hover:text-blue-700 border-gray-300"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Exchange rate + calculated amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            سعر الصرف <span className="text-red-500">*</span> (
            {formData.fromCurrency} → {formData.toCurrency})
          </label>
          <input
            type="text"
            name="exchangeRate"
            value={formatNumberWithCommas(formData.exchangeRate)}
            onChange={handleChange}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            min="0"
            step="0.0001"
            placeholder="سعر الصرف"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المبلغ المحول ({formData.toCurrency})
          </label>
          <input
            type="text"
            value={
              formatWithCommas(formData.calculatedAmount) ||
              "سيتم الحساب تلقائياً"
            }
            readOnly
            className="w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed shadow-sm"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={calculateAmount}
        disabled={isSubmitDisabled}
        className={`w-full py-3 font-medium text-sm rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isSubmitDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
        }`}
      >
        <div className="flex items-center justify-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          حساب المبلغ المحول
        </div>
      </button>

      {/* Modal */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg w-full max-w-xs max-h-[80vh] shadow-lg overflow-hidden flex flex-col"
          >
            <div className="sticky top-0 bg-white z-10 border-b p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                اختر العملة
              </h2>
              <input
                type="text"
                placeholder="ابحث بالاسم أو الرمز أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="overflow-y-auto px-4 py-2 flex-1">
              <ul className="space-y-2">
                {currenciesData
                  .filter((currency) =>
                    [currency.name, currency.symbol, currency.code].some(
                      (field) =>
                        field.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  )
                  .map((currency) => (
                    <li key={currency.code}>
                      <button
                        className="w-full text-right px-3 py-2 hover:bg-blue-50 rounded text-sm"
                        onClick={() => selectCurrency(currency.code)}
                      >
                        <div className="grid grid-cols-3 items-center text-sm px-4 py-2 hover:bg-blue-50 rounded cursor-pointer transition-colors">
                          <span className="text-gray-800 font-medium text-right">
                            {currency.name}
                          </span>
                          <span className="text-gray-600 text-center mr-10">
                            ({currency.code})
                          </span>
                          <span className="text-gray-500 text-left">
                            ({currency.symbol || "-"})
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setIsCurrencyModalOpen(false)}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionForm;
