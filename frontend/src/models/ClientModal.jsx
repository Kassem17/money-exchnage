import React from "react";

const ClientModal = ({
  isClientModalOpen,
  setIsClientModalOpen,
  createClientModelData,
  handleClientDataChange,
  handleBankChange,
  addBankField,
  removeBankField,
  handleCreateClient,
  isSubmitting,
  isMinGreaterThanMax,
}) => {
  if (!isClientModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-3 border-b border-gray-200 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold text-gray-800">إنشاء عميل جديد</h2>
          <button
            onClick={() => setIsClientModalOpen(false)}
            className="text-gray-500 hover:text-gray-800 text-xl p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleCreateClient}
          dir="rtl"
          className="p-4"
          autoComplete="off"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الاسم الكامل
              </label>
              <input
                autoComplete="off"
                type="text"
                name="fullname"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                value={createClientModelData.fullname}
                onChange={handleClientDataChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                رقم الهاتف
              </label>
              <input
                autoComplete="off"
                type="text"
                name="phoneNumber"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                value={createClientModelData.phoneNumber}
                onChange={handleClientDataChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                رقم الهوية
              </label>
              <input
                autoComplete="off"
                type="text"
                name="IDnumber"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                value={createClientModelData.IDnumber}
                onChange={handleClientDataChange}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                تاريخ الميلاد
              </label>
              <input
                autoComplete="off"
                name="dateOfBirth"
                className="w-full text-center px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                value={createClientModelData.dateOfBirth}
                onChange={handleClientDataChange}
                type="date"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الحالة المالية
              </label>
              <select
                name="financialStatus"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                value={createClientModelData.financialStatus}
                onChange={handleClientDataChange}
              >
                <option value="medium">متوسطة</option>
                <option value="excellent">ممتازة</option>
                <option value="good">جيدة</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الجنسية
              </label>
              <input
                autoComplete="off"
                name="nationality"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                value={createClientModelData.nationality}
                onChange={handleClientDataChange}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                رقم السجل
              </label>
              <input
                autoComplete="off"
                name="registrationNumber"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                value={createClientModelData.registrationNumber}
                onChange={handleClientDataChange}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                المهنة
              </label>
              <input
                autoComplete="off"
                name="work"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                value={createClientModelData.work}
                onChange={handleClientDataChange}
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                مقيم
              </label>
              <input
                type="checkbox"
                id="resident"
                name="resident"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={createClientModelData.resident}
                onChange={handleClientDataChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              العنوان الحالي
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  البلد
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  name="currentAddress.country"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  value={createClientModelData.currentAddress.country}
                  onChange={handleClientDataChange}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  المدينة
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  name="currentAddress.district"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  value={createClientModelData.currentAddress.district}
                  onChange={handleClientDataChange}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  مبني-طابق
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  name="currentAddress.building"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  value={createClientModelData.currentAddress.building}
                  onChange={handleClientDataChange}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  شارع
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  name="currentAddress.street"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  value={createClientModelData.currentAddress.street}
                  onChange={handleClientDataChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              عنوان الميلاد
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  البلد
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  name="bornAddress.country"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  value={createClientModelData.bornAddress.country}
                  onChange={handleClientDataChange}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  المدينة
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  name="bornAddress.district"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  value={createClientModelData.bornAddress.district}
                  onChange={handleClientDataChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              الحدود المالية
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  الحد الأدنى
                </label>
                <input
                  autoComplete="off"
                  type="number"
                  name="minimum"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  value={createClientModelData.minimum}
                  onChange={handleClientDataChange}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  الحد الأقصى
                </label>
                <input
                  autoComplete="off"
                  type="number"
                  name="maximum"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  value={createClientModelData.maximum}
                  onChange={handleClientDataChange}
                />
              </div>
            </div>
            {isMinGreaterThanMax && (
              <p className="text-red-500 text-xs mt-1">
                الحد الأدنى لا يمكن أن يكون أكبر من الحد الأقصى
              </p>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              معلومات إضافية
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  البنوك المتعامل معها
                </label>
                {createClientModelData.banksDealingWith.map((bank, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      autoComplete="off"
                      type="text"
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      value={bank.bankName}
                      onChange={(e) => handleBankChange(index, e.target.value)}
                    />
                    {createClientModelData.banksDealingWith.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBankField(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBankField}
                  className="text-xs text-orange-600 hover:text-orange-800 mt-1"
                >
                  + إضافة بنك آخر
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  صاحب الحق الإقتصادي
                </label>
                <input
                  autoComplete="off"
                  name="ownerOfEconomicActivity"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                  value={createClientModelData.ownerOfEconomicActivity}
                  onChange={handleClientDataChange}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  الدخل السنوي
                </label>
                <input
                  autoComplete="off"
                  name="yearlyIncome"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                  value={createClientModelData.yearlyIncome}
                  onChange={handleClientDataChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-3 py-1.5 text-sm font-medium text-white rounded ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
