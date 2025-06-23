import { useContext, useState, useEffect } from "react";
import useCreateClients from "../hooks/useCreateClients";
import { useEditClient } from "../hooks/useEditClient";
import { AppContext } from "../context/AppContext";

// Reusable Input Field Component
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
      className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      required={required}
    />
  </div>
);

// Reusable Select Field Component
const SelectField = ({ label, name, value, options, onChange }) => {
  // Fallback to the first option's value if `value` is empty and options exist
  const selectedValue = value || (options.length > 0 ? options[0].value : "");

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-purple-600">
        {label}
      </label>
      <select
        name={name}
        value={selectedValue}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const CreateClient = () => {
  const [mode, setMode] = useState("create"); // 'create' or 'edit'
  const [currentClientId, setCurrentClientId] = useState(null);
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
    financialStatus: "-",
    banksDealingWith: [{ bankName: "" }],
    ownerOfEconomicActivity: "",
    registrationNumber: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { createClient, loading: createLoading } = useCreateClients();
  const {
    editClient,
    loading: editLoading,
    success: editSuccess,
  } = useEditClient();
  const { userData } = useContext(AppContext);
  const loading = createLoading || editLoading;

  // Handle edit success
  useEffect(() => {
    if (editSuccess) {
      setSuccess("✅ تم تحديث بيانات العميل بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    }
  }, [editSuccess]);

  // Generic handler for form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("currentAddress.") || name.startsWith("bornAddress.")) {
      const [field, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [key]: value },
      }));
    } else if (name === "resident") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
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
    setFormData((prev) => ({ ...prev, banksDealingWith: updatedBanks }));
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
      setFormData((prev) => ({ ...prev, banksDealingWith: updatedBanks }));
    }
  };

  // Submit handler for both create and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Add this line

    setError("");
    setSuccess("");

    // Validation
    if (!formData.fullname || !formData.phoneNumber || !formData.clientType) {
      setError("❌ يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      if (mode === "create") {
        const response = await createClient(formData);

        if (response?.success) {
          setSuccess("✅ تم إضافة العميل بنجاح.");
          setCurrentClientId(response.client._id); // Store the created client ID
          setMode("edit"); // Switch to edit mode
        } else {
          setError(`❌ ${response?.error || "حدث خطأ أثناء إضافة العميل"}`);
        }
      } else if (mode === "edit" && currentClientId) {
        await editClient(currentClientId, formData);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        `⚠️ ${err.response?.data?.error || err.message || "حدث خطأ غير متوقع"}`
      );
    }
  };

  // Reset form to create mode
  const resetToCreateMode = () => {
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
      financialStatus: "-",
      banksDealingWith: [{ bankName: "" }],
      ownerOfEconomicActivity: "",
      registrationNumber: "",
    });
    setCurrentClientId(null);
    setMode("create");
    setSuccess("");
    setError("");
  };

  return (
    <div className="bg-gradient-to-br from-blue-300 via-indigo-100 to-purple-300 py-6 px-4 sm:px-6 lg:px-8 -mt-9">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-center text-indigo-700">
              {mode === "edit" ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
            </h2>
            {mode === "edit" && (
              <button
                onClick={resetToCreateMode}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                عميل جديد
              </button>
            )}
          </div>
          {error && (
            <div className="mb-5 p-1 bg-red-100 text-red-700 rounded-md animate-pulse -mt-4">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-1 bg-green-100 text-green-700 rounded-md animate-pulse -mt-4">
              {success}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            dir="rtl"
            autoComplete="off"
            className="-mt-6"
            noValidate
          >
            {/* Personal Info */}
            <div className="mb-2 flex gap-10 ">
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-600 ">
                  نوع العميل *
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
                label="الإسم الكامل*"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
              {/* phone number */}
              <InputField
                label="رقم الهاتف*"
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
              />
              {/* work */}
              <InputField
                label="المهنة"
                name="work"
                value={formData.work}
                onChange={handleChange}
              />
              {/* date of birth */}
              <InputField
                label="تاريخ الميلاد*"
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
              />
              <InputField
                label="الحد الأدنى"
                name="minimum"
                value={formData.minimum}
                onChange={handleChange}
                type="number"
              />
              <InputField
                label="الحد الأقصى"
                name="maximum"
                value={formData.maximum}
                onChange={handleChange}
                type="number"
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
              />
              <InputField
                label="المدينة"
                name="currentAddress.district"
                value={formData.currentAddress.district}
                onChange={handleChange}
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
                  { value: "-", label: "غير محدد" },
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

            {/* Submit and Reset Buttons */}
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                disabled={loading || (mode === "edit" && !userData.editClient)}
                className={`px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                } ${
                  mode === "edit" && !userData.editClient
                    ? "cursor-not-allowed opacity-20"
                    : ""
                }`}
              >
                {loading
                  ? mode === "edit"
                    ? "جاري التحديث..."
                    : "جاري الإضافة..."
                  : mode === "edit"
                  ? "تحديث العميل"
                  : "إضافة عميل"}
              </button>

              {mode === "edit" && (
                <button
                  type="button"
                  onClick={resetToCreateMode}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md shadow-md hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
                >
                  إعادة تعيين النموذج
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClient;
