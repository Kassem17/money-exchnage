import React, { useEffect, useRef, useCallback } from "react";

const CurrencyModal = ({
  openCurrencyModel,
  setOpenCurrencyModel,
  currencyData,
  handleCurrencyChange,
  handleAddCurrency,
  currencyLoading,
}) => {
  const modalRef = useRef();

  // Handle click outside the modal
  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenCurrencyModel(false);
      }
    },
    [setOpenCurrencyModel]
  );

  useEffect(() => {
    if (openCurrencyModel) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openCurrencyModel, handleClickOutside]);

  if (!openCurrencyModel) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-xl w-full max-w-md animate-fade-in"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">إضافة عملة جديدة</h2>
          <button
            onClick={() => setOpenCurrencyModel(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleAddCurrency}
          className="space-y-4"
          autoComplete="off"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاسم <span className="text-red-500">*</span>
            </label>
            <input
              autoComplete="off"
              type="text"
              name="name"
              value={currencyData.name}
              onChange={handleCurrencyChange}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الرمز (USD, EUR, etc.) <span className="text-red-500">*</span>
            </label>
            <input
              autoComplete="off"
              type="text"
              name="code"
              value={currencyData.code}
              onChange={handleCurrencyChange}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              maxLength="3"
              placeholder="ثلاثة أحرف"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الرمز المختصر ($, €, etc.) <span className="text-red-500">*</span>
            </label>
            <input
              autoComplete="off"
              type="text"
              name="symbol"
              value={currencyData.symbol}
              onChange={handleCurrencyChange}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              maxLength="3"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpenCurrencyModel(false)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              disabled={currencyLoading}
            >
              {currencyLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري الإضافة...
                </span>
              ) : (
                "إضافة عملة"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CurrencyModal;
