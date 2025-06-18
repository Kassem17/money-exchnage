import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useCompany from "../hooks/useCompany";

const CreateCompany = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    administratorName: "",
    exchangeCurrency: "",
    address: { city: "", street: "" },
    complianceUnitOfficer: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const { fetchCompany, createCompany, updateCompany, loading } = useCompany();

  useEffect(() => {
    const loadCompany = async () => {
      const existing = await fetchCompany();
      if (existing) {
        setFormData(existing);
        setIsEditMode(true);
      }
    };
    loadCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const [, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? updateCompany : createCompany;
    const result = await action(formData);
    setMessage(result.success ? result.data.message : result.message);
    setIsError(!result.success);
  };

  const inputFields = [
    { name: "name", placeholder: "إسم الشركة", icon: "🏢" },
    { name: "phoneNumber", placeholder: "رقم الهاتف", icon: "📞" },
    {
      name: "administratorName",
      placeholder: "المدير العام",
      icon: "👤",
    },
    { name: "exchangeCurrency", placeholder: "عملة الشركة", icon: "💱" },
    { name: "address.city", placeholder: "المدينة", icon: "🏙️" },
    { name: "address.street", placeholder: "الشارع", icon: "🏘️" },
    {
      name: "complianceUnitOfficer",
      placeholder: "مسؤول وحدة الإمتثال",
      icon: "🛡️",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br  py-4 px-4 sm:px-6 lg:px-8 -mt-7"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            {isEditMode ? "Update Company" : "Create Company"}
          </motion.h2>
          <p className="text-lg text-gray-600">
            {isEditMode
              ? "Edit your company details"
              : "Add your company information to get started"}
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 -mt-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputFields.map(({ name, placeholder, icon }, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <label className="flex text-sm font-medium text-gray-700 mb-1">
                  {icon} {placeholder}
                </label>
                <input
                  type="text"
                  name={name}
                  placeholder={placeholder}
                  value={
                    name.includes("address.")
                      ? formData.address[name.split(".")[1]]
                      : formData[name]
                  }
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400"
                />
              </motion.div>
            ))}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`mt-8 w-full py-3 px-4 rounded-xl text-white font-semibold text-lg shadow-md transition-all duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Processing...
              </div>
            ) : isEditMode ? (
              "Update Company"
            ) : (
              "Create Company"
            )}
          </motion.button>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-3 rounded-lg text-center font-medium ${
                isError
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {message}
            </motion.div>
          )}
        </motion.form>
      </div>
    </motion.div>
  );
};

export default CreateCompany;
