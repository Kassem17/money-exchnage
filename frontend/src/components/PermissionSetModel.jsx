import { useState, useEffect } from "react";

export default function PermissionSetModel({
  show,
  onClose,
  onSave,
  employee,
}) {
  const permissionList = [
    {
      key: "createProcessGreater",
      labelEn: "Create Process (Above Limit)",
      labelAr: "إنشاء عملية (فوق الحد)",
    },
    {
      key: "createProcessLess",
      labelEn: "Create Process (Below Limit)",
      labelAr: "إنشاء عملية (تحت الحد)",
    },
    {
      key: "createClientLess",
      labelEn: "Create Client (Below Limit)",
      labelAr: "إنشاء عميل (تحت الحد)",
    },
    {
      key: "createClientGreater",
      labelEn: "Create Client (Above Limit)",
      labelAr: "إنشاء عميل (فوق الحد)",
    },
    {
      key: "accessClientLess",
      labelEn: "Access Client (Below Limit)",
      labelAr: "الوصول إلى عميل (تحت الحد)",
    },
    {
      key: "accessClientGreater",
      labelEn: "Access Client (Above Limit)",
      labelAr: "الوصول إلى عميل (فوق الحد)",
    },
    {
      key: "editClient",
      labelEn: "Edit Client",
      labelAr: "تعديل العميل",
    },
  ];

  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    if (employee) {
      const initialPermissions = {};
      permissionList.forEach(({ key }) => {
        initialPermissions[key] = !!employee[key];
      });
      setSelectedPermissions(initialPermissions);
    }
  }, [employee]);

  const handleCheckboxChange = (permission) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const handleSave = () => {
    const grantedPermissions = Object.keys(selectedPermissions).filter(
      (key) => selectedPermissions[key]
    );
    onSave(grantedPermissions);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-800 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {employee.username} أعطي صلاحيات 
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Permissions List */}
        <div className="space-y-6">
          {permissionList.map(({ key, labelEn, labelAr }, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`perm-${index}`}
                checked={!!selectedPermissions[key]}
                onChange={() => handleCheckboxChange(key)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label
                htmlFor={`perm-${index}`}
                className="text-gray-700 dark:text-gray-300"
              >
                {labelAr} / {labelEn}
              </label>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
