import React, { useState, useEffect, useRef, useContext } from "react";
import useEditProcess from "../hooks/useEditProcess";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { socket } from "../utils/socket";
import {
  formatWithCommas,
  formatNumberWithCommas,
} from "../utils/formatWithComma";

const EditProcess = ({ process, onClose }) => {
  const { editProcess, loading, error } = useEditProcess();
  const { backendUrl, token } = useContext(AppContext);
  const [calculatedValue, setCalculatedValue] = useState("");
  const [operation, setOperation] = useState("*");
  const [processType, setProcessType] = useState(process.processType || "Buy");
  const [currencySelectorTarget, setCurrencySelectorTarget] = useState(null);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [currencySearchTerm, setCurrencySearchTerm] = useState("");

  const [formData, setFormData] = useState({
    clientId: process.clientId._id || process.clientId,
    exchangeRate: process.exchangeRate,
    processDate: process.processDate?.split("T")[0],
    moneySource: process.moneySource,
    moneyDestination: process.moneyDestination,
    fromCurrency: process.fromCurrency,
    toCurrency: process.toCurrency,
    amount: process.processAmountBuy,
  });

  const [currencies, setCurrencies] = useState([]);
  const modalRef = useRef(null);

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (process.clientId && typeof process.clientId === "object") {
        return;
      }
      if (process.clientId) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/employee/get-client/${process.clientId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (data.success) {
            // Handle client data if needed
          }
        } catch (error) {
          console.error("Error fetching client data:", error);
        }
      }
    };
    fetchClientData();
  }, [process.clientId, backendUrl, token]);

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + "/api/employee/get-currency"
        );
        if (data.success) setCurrencies(data.currencies);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchCurrencies();
    socket.on("Currency:Added", (newCurrency) => {
      setCurrencies((prev) => [...prev, newCurrency]);
    });
    return () => socket.off("Currency:Added");
  }, [backendUrl]);

  // Calculate amount
  useEffect(() => {
    const amount = parseFloat(formData.amount);
    const rate = parseFloat(formData.exchangeRate);
    if (!isNaN(amount) && !isNaN(rate)) {
      setCalculatedValue(
        (operation === "*" ? amount * rate : amount / rate).toFixed(2)
      );
    } else {
      setCalculatedValue("");
    }
  }, [formData.amount, formData.exchangeRate, operation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updated = await editProcess(process._id, {
      ...formData,
      exchangeRate: String(formData.exchangeRate).replace(/,/g, ""),
      amount: String(formData.amount).replace(/,/g, ""),
      processType,
      processAmountSell: calculatedValue,
      processAmountBuy: String(formData.amount).replace(/,/g, ""),
    });

    if (updated) onClose();
  };

  // Currency modal functions
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
    const currency = currencies.find((c) => c.code === code);
    return currency ? `${currency.name} (${currency.code})` : code;
  };

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
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">تعديل العملية</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4" dir="rtl">
          {/* Process Type */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="processType"
                value="Buy"
                checked={processType === "Buy"}
                onChange={() => setProcessType("Buy")}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm font-medium">شراء</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="processType"
                value="Sell"
                checked={processType === "Sell"}
                onChange={() => setProcessType("Sell")}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm font-medium">بيع</span>
            </label>
          </div>

          {/* Operation */}
          <div>
            <label className="block text-sm font-medium mb-1">
              العملية الحسابية
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="*">ضرب (✖)</option>
              <option value="/">قسمة (➗)</option>
            </select>
          </div>

          {/* Amount and Exchange Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المبلغ</label>
              <input
                name="amount"
                type="text"
                value={formatNumberWithCommas(formData.amount)}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                سعر الصرف
              </label>
              <input
                name="exchangeRate"
                type="text"
                value={formatWithCommas(formData.exchangeRate)}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="0.0000"
                step="0.0001"
              />
            </div>
          </div>

          {/* Calculated Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">
              المبلغ المحول
            </label>
            <div className="p-2 bg-gray-100 rounded border">
              {formatWithCommas(calculatedValue) || "سيتم الحساب"}{" "}
              {formData.toCurrency}
            </div>
          </div>

          {/* Currency Selection - Matches ConversionForm style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">من عملة</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openCurrencySelector("from")}
                  className="flex-1 p-2 border rounded text-right"
                >
                  {getCurrencyLabel(formData.fromCurrency)}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenCurrencyModel(true)}
                  className="p-2 border rounded text-blue-600"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">إلى عملة</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openCurrencySelector("to")}
                  className="flex-1 p-2 border rounded text-right"
                >
                  {getCurrencyLabel(formData.toCurrency)}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenCurrencyModel(true)}
                  className="p-2 border rounded text-blue-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              تاريخ العملية
            </label>
            <input
              type="date"
              name="processDate"
              value={formData.processDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Money Source/Destination */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                مصدر الأموال
              </label>
              <input
                name="moneySource"
                value={formData.moneySource}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                وجهة الأموال
              </label>
              <input
                name="moneyDestination"
                value={formData.moneyDestination}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>

      {/* Currency Modal - Matches ConversionForm style */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg w-full max-w-xs max-h-[80vh] shadow-xl flex flex-col"
          >
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-lg font-semibold">اختر العملة</h2>
              <input
                type="text"
                placeholder="ابحث..."
                value={currencySearchTerm}
                onChange={(e) => setCurrencySearchTerm(e.target.value)}
                className="w-full p-2 mt-2 border rounded"
              />
            </div>
            <div className="overflow-y-auto">
              <ul className="divide-y">
                {currencies
                  .filter((currency) =>
                    [currency.name, currency.code, currency.symbol].some(
                      (field) =>
                        field
                          ?.toLowerCase()
                          .includes(currencySearchTerm.toLowerCase())
                    )
                  )
                  .map((currency) => (
                    <li key={currency.code}>
                      <button
                        className="w-full text-right p-3 hover:bg-gray-50"
                        onClick={() => selectCurrency(currency.code)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{currency.name}</span>
                          <span className="text-gray-500">{currency.code}</span>
                        </div>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={() => setIsCurrencyModalOpen(false)}
                className="w-full py-2 bg-gray-100 rounded hover:bg-gray-200"
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

export default EditProcess;
