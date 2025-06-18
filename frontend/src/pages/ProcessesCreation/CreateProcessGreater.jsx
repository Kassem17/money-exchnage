import React, { useState, useEffect, useContext, useRef } from "react";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import useCreateProcess from "../../hooks/useCreateProcess";
import useAddCurrency from "../../hooks/useAddCurrency";
import useCreateClients from "../../hooks/useCreateClients";
import useEditProcess from "../../hooks/useEditProcess";
import io from "socket.io-client";
import StatusMessage from "../../models/StatusMessage";
import ClientSearch from "../../models/ClientSearch";
import ConversionForm from "../../models/ConversionForm";
import CurrencyModal from "../../models/CurrencyModal";
import ClientModal from "../../models/ClientModal";
import { ShieldCheck, UserCheck } from "lucide-react";
import KYC from "../../components/KYC";
import CTS from "../../components/CTS";

const socket = io("http://localhost:5000");

const CreateProcessGreater = () => {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const { addCurrency, loading: currencyLoading } = useAddCurrency();
  const [operation, setOperation] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    fromCurrency: "USD",
    toCurrency: "LBP",
    exchangeRate: "",
    calculatedAmount: "",
    clientName: "",
    clientId: "",
    moneySource: "",
    moneyDestination: "",
    processDate: format(new Date(), "yyyy-MM-dd"),
    processId: null,
  });

  const { createClient, loading: createClientLoading } = useCreateClients();
  const {
    createProcess,
    loading: createLoading,
    error: createError,
    successMessage: createSuccessMessage,
  } = useCreateProcess();
  const {
    editProcess,
    loading: editLoading,
    error: editError,
    successMessage: editSuccessMessage,
  } = useEditProcess();

  const [clientData, setClientData] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const ref = useRef(null);
  const [hightLightedIndex, setHighLightedIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currenciesData, setCurrenciesData] = useState([]);
  const [openCurrencyModel, setOpenCurrencyModel] = useState(false);
  const [currencyData, setCurrencyData] = useState({
    name: "",
    symbol: "",
    code: "",
  });
  const [createClientModelData, setCreateClientModelData] = useState({
    fullname: "",
    phoneNumber: "",
    work: "",
    dateOfBirth: "",
    minimum: "",
    maximum: "",
    currentAddress: { country: "", district: "", building: "", street: "" },
    IDnumber: "",
    nationality: "",
    resident: false,
    bornAddress: { country: "", district: "" },
    clientType: "less than 10000",
    yearlyIncome: "",
    financialStatus: "",
    banksDealingWith: [{ bankName: "" }],
    ownerOfEconomicActivity: "",
    registrationNumber: "",
  });
  const [isMinGreaterThanMax, setIsMinGreaterThanMax] = useState(false);

  const { backendUrl, token } = useContext(AppContext);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + "/api/employee/client-greater",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) {
          setAllClients(data.clients);
        }

        if (clientId) {
          const { data } = await axios.get(
            backendUrl + `/api/employee/get-client/${clientId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (data.success) {
            setClientData(data.client);
            setFormData((prev) => ({
              ...prev,
              clientName: data.client.fullname,
              clientId: data.client._id,
            }));
            setSearchTerm(data.client.fullname);
          }
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
    socket.on("client:created", (newClient) => {
      setClientData(newClient);
    });

    return () => {
      socket.off("client:created");
    };
  }, [clientId, backendUrl, token]);

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

  useEffect(() => {
    const fetchProcessData = async () => {
      if (formData.processId) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/employee/get-process/${formData.processId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (data.success) {
            const process = data.process;
            setFormData({
              amount:
                process.processType === "Buy"
                  ? process.processAmountBuy
                  : process.processAmountSell,
              fromCurrency: process.fromCurrency,
              toCurrency: process.toCurrency,
              exchangeRate: process.exchangeRate,
              calculatedAmount:
                process.processType === "Buy"
                  ? process.processAmountSell
                  : process.processAmountBuy,
              clientName: process.clientName,
              clientId: process.clientId,
              moneySource: process.moneySource,
              moneyDestination: process.moneyDestination,
              processDate: format(new Date(process.processDate), "yyyy-MM-dd"),
              processId: process._id,
            });
            setOperation(process.processType === "Buy" ? "*" : "/");
          }
        } catch (error) {
          console.error("Error fetching process data:", error);
        }
      }
    };
    fetchProcessData();
  }, [formData.processId, backendUrl, token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const min = parseFloat(createClientModelData.minimum);
    const max = parseFloat(createClientModelData.maximum);
    setIsMinGreaterThanMax(!isNaN(min) && !isNaN(max) && min > max);
  }, [createClientModelData.minimum, createClientModelData.maximum]);

  const filteredClients = allClients.filter(
    (client) =>
      client.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phoneNumber.toString().includes(searchTerm)
  );

  const handleClientSelect = (client) => {
    setFormData((prev) => ({
      ...prev,
      clientName: client.fullname,
      clientId: client._id,
    }));
    setClientData(client);
    setSearchTerm(client.fullname);
    setShowClientDropdown(false);
  };

  const calculateAmount = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.amount) {
      setErrorMessage("الرجاء إدخال المبلغ");
      return;
    }

    if (!formData.exchangeRate) {
      setErrorMessage("الرجاء إدخال سعر الصرف");
      return;
    }

    const amount = parseFloat(formData.amount);
    const rate = parseFloat(formData.exchangeRate);

    if (isNaN(amount)) {
      setErrorMessage("المبلغ المدخل غير صحيح");
      return;
    }

    if (isNaN(rate)) {
      setErrorMessage("سعر الصرف المدخل غير صحيح");
      return;
    }

    if (formData.fromCurrency === formData.toCurrency) {
      setErrorMessage("لا يمكن تحويل العملة لنفسها");
      return;
    }

    let result;
    const { fromCurrency, toCurrency } = formData;

    if (operation === "*") {
      result = (amount * rate).toFixed(2);
    } else if (operation === "/") {
      result = (amount / rate).toFixed(2);
    } else {
      setErrorMessage("تحويل العملة غير مدعوم حالياً");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      calculatedAmount: result,
    }));

    setSuccessMessage(
      `تم التحويل: ${amount} ${fromCurrency} = ${result} ${toCurrency}`
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const submissionData = {
        clientId: formData.clientId,
        processDate: formData.processDate,
        processAmountSell: formData.calculatedAmount,
        processAmountBuy: formData.amount,
        exchangeRate: formData.exchangeRate,
        processType: operation === "*" ? "Buy" : "Sell",
        moneySource: formData.moneySource || "",
        moneyDestination: formData.moneyDestination || "",
        toCurrency: formData.toCurrency,
        fromCurrency: formData.fromCurrency,
      };

      if (formData.processId) {
        const response = await editProcess(formData.processId, submissionData);
        if (response) {
          setSuccessMessage("تم تحديث العملية بنجاح");
        }
      } else {
        const response = await createProcess(submissionData);
        if (response?.success && response?.process?._id) {
          setFormData((prev) => ({
            ...prev,
            processId: response.process._id,
          }));
          setSuccessMessage("تم حفظ العملية بنجاح");
        }
      }
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء حفظ العملية");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    setCurrencyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCurrency = async (e) => {
    e.preventDefault();
    try {
      await addCurrency(currencyData);
      setCurrencyData({ name: "", symbol: "", code: "" });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleClientDataChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("currentAddress.") || name.startsWith("bornAddress.")) {
      const [field, key] = name.split(".");
      setCreateClientModelData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [key]: value },
      }));
    } else if (name === "resident") {
      setCreateClientModelData({ ...createClientModelData, [name]: checked });
    } else {
      setCreateClientModelData({ ...createClientModelData, [name]: value });
    }
  };

  const handleBankChange = (index, value) => {
    const banks = [...createClientModelData.banksDealingWith];
    banks[index].bankName = value;
    setCreateClientModelData({
      ...createClientModelData,
      banksDealingWith: banks,
    });
  };

  const addBankField = () => {
    setCreateClientModelData((prev) => ({
      ...prev,
      banksDealingWith: [...prev.banksDealingWith, { bankName: "" }],
    }));
  };

  const removeBankField = (index) => {
    if (createClientModelData.banksDealingWith.length > 1) {
      const banks = [...createClientModelData.banksDealingWith];
      banks.splice(index, 1);
      setCreateClientModelData({
        ...createClientModelData,
        banksDealingWith: banks,
      });
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await createClient(createClientModelData);
      setCreateClientModelData({
        fullname: "",
        phoneNumber: "",
        work: "",
        dateOfBirth: "",
        currentAddress: { country: "", district: "", building: "", street: "" },
        IDnumber: "",
        nationality: "",
        resident: false,
        bornAddress: { country: "", district: "" },
        clientType: "less than 10000",
        yearlyIncome: "",
        financialStatus: "",
        banksDealingWith: [{ bankName: "" }],
        ownerOfEconomicActivity: "",
        registrationNumber: "",
        minimum: "",
        maximum: "",
      });
      setIsClientModalOpen(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  const formatCurrencyOption = (currency) => ({
    value: currency.code,
    label: `${currency.name} (${currency.code})`,
    data: currency,
  });

  const CustomDropdownIndicator = (props) => {
    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpenCurrencyModel(true)}
          className="h-full px-2 text-blue-600 hover:text-blue-700 text-sm border-r border-gray-300"
        >
          +
        </button>
        <div {...props.innerProps} className="px-2 cursor-pointer">
          <svg
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    );
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "42px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px #bfdbfe" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      textAlign: "right",
      direction: "rtl",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 20,
      textAlign: "right",
    }),
    singleValue: (provided) => ({
      ...provided,
      textAlign: "right",
      direction: "rtl",
    }),
    placeholder: (provided) => ({
      ...provided,
      textAlign: "right",
    }),
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };
  const onClose = () => {
    setModalVisible(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            جار تحميل بيانات العميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 -mt-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-xl text-center sm:text-3xl font-extrabold text-indigo-700">
          عمليات أكثر من 10000
        </h1>

        {/* Status Messages - More compact */}

        <StatusMessage
          successMessage={
            successMessage || createSuccessMessage || editSuccessMessage
          }
          errorMessage={errorMessage || createError || editError}
        />

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-2 -mt-2"
          dir="rtl"
          autoComplete="off"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClientSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredClients={filteredClients}
              handleClientSelect={handleClientSelect}
              showClientDropdown={showClientDropdown}
              setShowClientDropdown={setShowClientDropdown}
              hightLightedIndex={hightLightedIndex}
              setHighLightedIndex={setHighLightedIndex}
              formData={formData}
              setFormData={setFormData}
              setIsClientModalOpen={setIsClientModalOpen}
              clientData={clientData}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ العملية <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="processDate"
                value={formData.processDate}
                onChange={handleChange}
                className="w-full text-center p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                required
              />
            </div>
          </div>

          <ConversionForm
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            operation={operation}
            setOperation={setOperation}
            currenciesData={currenciesData}
            setOpenCurrencyModel={setOpenCurrencyModel}
            calculateAmount={calculateAmount}
            customSelectStyles={customSelectStyles}
            formatCurrencyOption={formatCurrencyOption}
            CustomDropdownIndicator={CustomDropdownIndicator}
          />

          {/* Money Source & Destination - Single row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مصدر الأموال *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="moneySource"
                  value={formData.moneySource}
                  onChange={handleChange}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="مصدر الأموال"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                وجهة الأموال *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="moneyDestination"
                  value={formData.moneyDestination}
                  onChange={handleChange}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="وجهة الأموال"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting || createLoading || editLoading}
              className={`w-full py-3 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSubmitting || createLoading || editLoading
                  ? "bg-gray-400 cursor-not-allowed focus:ring-gray-400"
                  : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
              }`}
            >
              {isSubmitting || createLoading || editLoading ? (
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
                  {formData.processId ? "جار التحديث..." : "جار الحفظ..."}
                </span>
              ) : formData.processId ? (
                "تحديث العملية"
              ) : (
                "حفظ العملية"
              )}
            </button>

            {formData.processId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    amount: "",
                    fromCurrency: "USD",
                    toCurrency: "LBP",
                    exchangeRate: "",
                    calculatedAmount: "",
                    clientName: "",
                    clientId: "",
                    moneySource: "",
                    moneyDestination: "",
                    processDate: format(new Date(), "yyyy-MM-dd"),
                    processId: null,
                  });
                  setOperation("");
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                بدء عملية جديدة
              </button>
            )}
          </div>

          {/* Action Buttons - More compact */}
          <div className="flex gap-3 justify-center pt-3">
            <button
              type="button"
              onClick={() => openModal("kyc")}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow"
            >
              <UserCheck className="w-3.5 h-3.5" />
              KYC
            </button>

            <button
              type="button"
              onClick={() => openModal("cts")}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              CTS
            </button>
          </div>
        </form>

        {/* Currency Modal */}
        <CurrencyModal
          openCurrencyModel={openCurrencyModel}
          setOpenCurrencyModel={setOpenCurrencyModel}
          currencyData={currencyData}
          handleCurrencyChange={handleCurrencyChange}
          handleAddCurrency={handleAddCurrency}
          currencyLoading={currencyLoading}
        />

        {/* Info Modal */}
        {modalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-11/12 max-w-md relative">
              <button
                onClick={() => setModalVisible(false)}
                className="absolute top-2 left-2 text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-3">
                {modalType.toUpperCase()} معلومات
              </h3>
              <div
                id="printable-content"
                className="space-y-2 text-sm text-right"
              >
                {modalType === "kyc" ? (
                  <div>
                    <KYC formData={formData} onClose={onClose} />
                  </div>
                ) : modalType === "cts" ? (
                  <div>
                    <CTS formData={formData} onClose={onClose} />
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => window.print()}
                className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
              >
                طباعة
              </button>
            </div>
          </div>
        )}

        {/* Client Creation Modal */}
        <ClientModal
          isClientModalOpen={isClientModalOpen}
          setIsClientModalOpen={setIsClientModalOpen}
          createClientModelData={createClientModelData}
          handleClientDataChange={handleClientDataChange}
          handleBankChange={handleBankChange}
          addBankField={addBankField}
          removeBankField={removeBankField}
          handleCreateClient={handleCreateClient}
          isSubmitting={isSubmitting || createLoading || editLoading}
          isMinGreaterThanMax={isMinGreaterThanMax}
        />
      </div>
    </div>
  );
};

export default CreateProcessGreater;
