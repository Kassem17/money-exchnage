import { useContext, useState } from "react";
import useCreateClients from "../hooks/useCreateClients";
import { AppContext } from "../context/AppContext";

// Reusable Input Field Component with focus styling
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-purple-600">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border border-gray-300 rounded-md p-2 text-sm outline-none transition-all duration-300 
                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
      required={required}
    />
  </div>
);

// Reusable Select Field Component
const SelectField = ({ label, name, value, options, onChange }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-purple-600">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border border-gray-300 rounded-md p-2 text-sm outline-none transition-all duration-300
                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white`}
    >
      <option value="">اختر {label}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const CreateClient = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phoneNumber: "",
    work: "",
    dateOfBirth: "",
    minimum: "",
    maximum: "",
    currentAddress: { country: "", district: "", building: "", street: "" },
    bornAddress: { country: "", district: "" },
    IDnumber: "",
    nationality: "",
    resident: false,
    clientType: "",
    yearlyIncome: "",
    financialStatus: "",
    banksDealingWith: [{ bankName: "" }],
    ownerOfEconomicActivity: "",
    registrationNumber: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { createClient, loading } = useCreateClients();
  const { userData } = useContext(AppContext);

  // Generic handler for flat fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("currentAddress.") || name.startsWith("bornAddress.")) {
      const [field, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [key]: value },
      }));
    } else if (name === "resident") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handlers for banks
  const handleBankChange = (index, value) => {
    const updatedBanks = [...formData.banksDealingWith];
    updatedBanks[index].bankName = value;
    setFormData({ ...formData, banksDealingWith: updatedBanks });
  };

  const addBankField = () => {
    setFormData((prev) => ({
      ...prev,
      banksDealingWith: [...prev.banksDealingWith, { bankName: "" }],
    }));
  };

  const removeBankField = (index) => {
    if (formData.banksDealingWith.length > 1) {
      const updatedBanks = formData.banksDealingWith.filter(
        (_, i) => i !== index
      );
      setFormData({ ...formData, banksDealingWith: updatedBanks });
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic frontend validation
    if (!formData.fullname || !formData.phoneNumber || !formData.clientType) {
      setError("❌ يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const response = await createClient(formData);
      console.log("Server Response:", response); // Debugging line

      if (response?.success) {
        setSuccess("✅ تم إضافة العميل بنجاح.");
        resetForm();
      } else {
        setError(`❌ ${response?.error || "حدث خطأ أثناء إضافة العميل"}`);
      }
    } catch (err) {
      console.error("Error creating client:", err); // Log full error
      setError(
        `⚠️ ${
          err.response?.data?.error ||
          err.message ||
          "حدث خطأ غير متوقع في الاتصال بالخادم"
        }`
      );
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: "",
      phoneNumber: "",
      work: "",
      dateOfBirth: "",
      minimum: "",
      maximum: "",
      currentAddress: { country: "", district: "", building: "", street: "" },
      bornAddress: { country: "", district: "" },
      IDnumber: "",
      nationality: "",
      resident: false,
      clientType: "",
      yearlyIncome: "",
      financialStatus: "",
      banksDealingWith: [{ bankName: "" }],
      ownerOfEconomicActivity: "",
      registrationNumber: "",
    });
  };

  return (
    <div className=" bg-gradient-to-br from-blue-300 via-indigo-100 to-purple-300 py-6 px-4 sm:px-6 lg:px-8 -mt-9">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="p-6 ">
          <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700 ">
            إضافة عميل جديد
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md animate-pulse">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md animate-pulse">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            dir="rtl"
            autoComplete="off"
            className="-mt-6"
          >
            {/* Personal Info */}
            <div className="mb-2 flex gap-10 ">
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-600 ">
                  نوع العميل
                </label>
                <select
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleChange}
                  className="w-72 border border-gray-300 rounded-md p-2 text-sm outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">اختر نوع العميل</option>
                  {userData.createClientGreater && (
                    <option value="greater than 10000">أكثر من 10000</option>
                  )}
                  {userData.createClientLess && (
                    <option value="less than 10000">أقل من 10000</option>
                  )}
                </select>
              </div>
              {/* resident */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="resident"
                  checked={formData.resident}
                  onChange={handleChange}
                  className="h-4 w-4 accent-indigo-500"
                />
                <label className="mr-2 text-sm text-purple-600 font-semibold">
                  مقيم
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {/* fullname */}
              <InputField
                label="الاسم الكامل"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
              {/* phone number */}
              <InputField
                label="رقم الهاتف"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              {/* Id number */}
              <InputField
                label="رقم الهوية"
                name="IDnumber"
                value={formData.IDnumber}
                onChange={handleChange}
                required
              />
              {/* work */}
              <InputField
                label="المهنة"
                name="work"
                value={formData.work}
                onChange={handleChange}
                required
              />
              {/* date of birth */}
              <InputField
                label="تاريخ الميلاد"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                type="date"
                required
              />
            </div>
            {/* Extra Fields */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-6">
              {/* nationality */}
              <InputField
                label="الجنسية"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
              {/* registrationNumber */}
              <InputField
                label="رقم السجل"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
              <InputField
                label="الحد الأدنى"
                name="minimum"
                value={formData.minimum}
                onChange={handleChange}
              />
              <InputField
                label="الحد الأقصى"
                name="maximum"
                value={formData.maximum}
                onChange={handleChange}
              />
            </div>

            {/* Address Section */}
            <p className="font-semibold mb-0.5 ">العنوان :</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <InputField
                label="بلد الإقامة"
                name="currentAddress.country"
                value={formData.currentAddress.country}
                onChange={handleChange}
                required
              />
              <InputField
                label="المدينة"
                name="currentAddress.district"
                value={formData.currentAddress.district}
                onChange={handleChange}
                required
              />
              <InputField
                label="المبنى/الطابق"
                name="currentAddress.building"
                value={formData.currentAddress.building}
                onChange={handleChange}
              />
              <InputField
                label="الشارع"
                name="currentAddress.street"
                value={formData.currentAddress.street}
                onChange={handleChange}
              />
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-">
              {/* yearly income */}
              <InputField
                label="الدخل السنوي"
                name="yearlyIncome"
                value={formData.yearlyIncome}
                onChange={handleChange}
                type="number"
              />
              {/* financial Status */}
              <SelectField
                label="الحالة المالية"
                name="financialStatus"
                value={formData.financialStatus}
                onChange={handleChange}
                options={[
                  { value: "good", label: "جيدة" },
                  { value: "bad", label: "سيئة" },
                ]}
              />
              {/* ownerOfEconomicActivity */}
              <InputField
                label="صاحب النشاط الاقتصادي"
                name="ownerOfEconomicActivity"
                value={formData.ownerOfEconomicActivity}
                onChange={handleChange}
              />
              {/* banks dealing with */}
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-600">
                  البنوك
                </label>
                {formData.banksDealingWith.map((bank, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 space-x-reverse mb-2"
                  >
                    <input
                      type="text"
                      value={bank.bankName}
                      onChange={(e) => handleBankChange(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md p-2 text-sm outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="اسم البنك"
                    />
                    {formData.banksDealingWith.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBankField(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBankField}
                  className="mt-1 text-blue-500 hover:underline text-sm transition-colors"
                >
                  + إضافة بنك
                </button>
              </div>
            </div>

            {/* Birth Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InputField
                label="بلد الميلاد"
                name="bornAddress.country"
                value={formData.bornAddress.country}
                onChange={handleChange}
              />
              <InputField
                label="مدينة الميلاد"
                name="bornAddress.district"
                value={formData.bornAddress.district}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "جاري الإضافة..." : "إضافة عميل"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClient;
