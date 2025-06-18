import React, { useState } from "react";

const ConversionForm = ({
  formData,
  setFormData,
  handleChange,
  operation,
  setOperation,
  currenciesData = [],
  setOpenCurrencyModel,
  calculateAmount,
}) => {
  const [currencySelectorTarget, setCurrencySelectorTarget] = useState(null); // 'from' or 'to'
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-800">معلومات التحويل</h3>
        <p className="mt-1 text-sm text-gray-500">أدخل تفاصيل عملية التحويل</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المبلغ <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
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
            <option value="*">شراء (✖)</option>
            <option value="/">بيع (➗)</option>
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
            type="number"
            name="exchangeRate"
            value={formData.exchangeRate}
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
            value={formData.calculatedAmount || "سيتم الحساب تلقائياً"}
            readOnly
            className="w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed shadow-sm"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={calculateAmount}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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

      {/* Modal for currency selection */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-xs w-full max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              اختر العملة
            </h2>

            {/* Search Input */}
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرمز أو الكود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            {/* Currency List */}
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
                      {currency.name} ({currency.symbol || currency.code})
                    </button>
                  </li>
                ))}
            </ul>

            {/* Close Button */}
            <button
              onClick={() => setIsCurrencyModalOpen(false)}
              className="mt-4 w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionForm;
