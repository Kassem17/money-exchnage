import React, { useState, useEffect, useRef, useContext } from "react";
import useEditProcess from "../hooks/useEditProcess";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const EditProcess = ({ process, onClose }) => {
  const { editProcess, loading, error } = useEditProcess();
  const { backendUrl, token } = useContext(AppContext);
  const [clientData, setClientData] = useState(null);

  const [formData, setFormData] = useState({
    clientId: process.clientId._id || process.clientId,
    processType: process.processType,
    exchangeRate: process.exchangeRate,
    processDate: process.processDate?.split("T")[0],
    moneySource: process.moneySource,
    moneyDestination: process.moneyDestination,
    fromCurrency: process.fromCurrency,
    toCurrency: process.toCurrency,
    amount:
      process.processType === "Buy"
        ? process.processAmountSell
        : process.processAmountBuy,
  });

  const [calculatedValue, setCalculatedValue] = useState("");
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    const fetchClientData = async () => {
      if (process.clientId && typeof process.clientId === "object") {
        setClientData(process.clientId);
        return;
      }

      if (process.clientId) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/employee/get-client/${process.clientId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (data.success) {
            setClientData(data.client);
          }
        } catch (error) {
          console.error("Error fetching client data:", error);
        }
      }
    };

    fetchClientData();
  }, [process.clientId, backendUrl, token]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + "/api/employee/get-currency"
        );
        if (data.success) {
          setCurrencies(data.currencies);
        } else {
          toast.error(data.message);
        }
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

  useEffect(() => {
    const amount = parseFloat(formData.amount);
    const rate = parseFloat(formData.exchangeRate);

    if (!isNaN(amount) && !isNaN(rate)) {
      const calculated =
        formData.processType === "Buy" ? amount * rate : amount / rate;

      setCalculatedValue(calculated.toFixed(2));
    } else {
      setCalculatedValue("");
    }
  }, [formData.amount, formData.exchangeRate, formData.processType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      processAmountSell:
        formData.processType === "Buy" ? formData.amount : calculatedValue,
      processAmountBuy:
        formData.processType === "Sell" ? formData.amount : calculatedValue,
    };

    const updated = await editProcess(process._id, finalData);
    if (updated) onClose();
  };

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
  const rowStyle = "flex items-center gap-3";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-red-500"
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-2 text-center">تعديل</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
          dir="rtl"
          autoComplete="off"
        >
          {/* Utility Class: Row Style */}

          {/* Process Type */}
          <div className={rowStyle}>
            <label className="w-32 text-sm font-medium text-gray-700">
              نوع العملية
            </label>
            <select
              name="processType"
              value={formData.processType}
              onChange={handleChange}
              className="flex-1 border p-2 rounded"
            >
              <option value="Buy">شراء ✖</option>
              <option value="Sell">بيع ➗</option>
            </select>
          </div>

          {/* Amount */}
          <div className={rowStyle}>
            <label className="w-32 text-sm font-medium text-gray-700">
              المبلغ
            </label>
            <input
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              className="flex-1 border p-2 rounded text-left"
              autoComplete="off"
            />
          </div>

          {/* Exchange Rate */}
          <div className={rowStyle}>
            <label className="w-32 text-sm font-medium text-gray-700">
              سعر الصرف
            </label>
            <input
              name="exchangeRate"
              type="number"
              value={formData.exchangeRate}
              onChange={handleChange}
              className="flex-1 border p-2 rounded text-left"
              autoComplete="off"
            />
          </div>

          {/* Calculated Value */}
          <div className={rowStyle}>
            <label className="w-32 text-sm font-medium text-gray-700">
              النتيجة
            </label>
            <input
              type="text"
              value={calculatedValue}
              readOnly
              className="flex-1 border p-2 rounded bg-gray-100 text-left"
              autoComplete="off"
            />
          </div>

          {/* From Currency */}
          <div className={rowStyle}>
            <label className="w-32 text-sm font-medium text-gray-700">من</label>
            <select
              name="fromCurrency"
              value={formData.fromCurrency}
              onChange={handleChange}
              className="flex-1 border p-2 rounded"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          {/* To Currency */}
          <div className={rowStyle}>
            <label className="w-32 text-sm font-medium text-gray-700">
              الى
            </label>
            <select
              name="toCurrency"
              value={formData.toCurrency}
              onChange={handleChange}
              className="flex-1 border p-2 rounded"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          {/* Process Date */}
          <div className={rowStyle}>
            <label className="w-32 text-sm font-medium text-gray-700">
              التاريخ
            </label>
            <input
              type="date"
              name="processDate"
              value={formData.processDate}
              onChange={handleChange}
              className="flex-1 border p-2 rounded text-center"
            />
          </div>

          {/* Money Source / Destination */}

          <>
            <div className={rowStyle}>
              <label className="w-32 text-sm font-medium text-gray-700">
                مصدر الأموال
              </label>
              <input
                name="moneySource"
                value={formData.moneySource}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
                autoComplete="off"
              />
            </div>
            <div className={rowStyle}>
              <label className="w-32 text-sm font-medium text-gray-700">
                وجهة إستعمال الاموال
              </label>
              <input
                name="moneyDestination"
                value={formData.moneyDestination}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
                autoComplete="off"
              />
            </div>
          </>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Saving..." : "حفظ"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProcess;
