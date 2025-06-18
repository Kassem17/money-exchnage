import React from "react";

const PERMISSIONS = [
  { id: "createProcessGreater", label: "انشاء عملية > 10000" },
  { id: "createProcessLess", label: "انشاء عملية < 10000" },
  { id: "createClientLess", label: "انشاء عميل < 10000" },
  { id: "createClientGreater", label: "انشاء عميل > 10000" },
  { id: "accessClientGreater", label: "السماح بالوصول لقائمة العملاء > 10000" },
  { id: "accessClientLess", label: "السماح بالوصول لقائمة العملاء < 10000" },
  { id: "editClient", label: "السماح بتعديل معلومات العميل" },
];

const Permissions = ({ formData, setFormData }) => {
  const allChecked = PERMISSIONS.every((perm) => formData[perm.id]);

  const toggleAll = (checked) => {
    setFormData((prev) => {
      const updated = { ...prev };
      PERMISSIONS.forEach((perm) => {
        updated[perm.id] = checked;
      });
      return updated;
    });
  };

  const toggleSingle = (id, checked) => {
    setFormData((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <p className="text-xl font-medium text-gray-700 mb-3 text-right">
        الصلاحيات
      </p>

      <div className="flex items-center justify-end " >
        <label htmlFor="selectAll" className="ml-2 block text-sm text-gray-700">
          تحديد الكل
        </label>
        <input
          type="checkbox"
          id="selectAll"
          checked={allChecked}
          onChange={(e) => toggleAll(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PERMISSIONS.map((perm) => (
          <div className="flex items-center justify-end" key={perm.id}>
            <label
              htmlFor={perm.id}
              className="ml-2 block text-xl text-gray-700"
            >
              {perm.label}
            </label>
            <input
              type="checkbox"
              id={perm.id}
              checked={formData[perm.id]}
              onChange={(e) => toggleSingle(perm.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Permissions;
