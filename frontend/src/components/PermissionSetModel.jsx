import { useState, useEffect, useRef } from "react";

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
      category: "process",
    },
    {
      key: "createProcessLess",
      labelEn: "Create Process (Below Limit)",
      labelAr: "إنشاء عملية (تحت الحد)",
      category: "process",
    },
    {
      key: "createClientLess",
      labelEn: "Create Client (Below Limit)",
      labelAr: "إنشاء عميل (تحت الحد)",
      category: "client",
    },
    {
      key: "createClientGreater",
      labelEn: "Create Client (Above Limit)",
      labelAr: "إنشاء عميل (فوق الحد)",
      category: "client",
    },
    {
      key: "accessClientLess",
      labelEn: "Access Client (Below Limit)",
      labelAr: "الوصول إلى عميل (تحت الحد)",
      category: "client",
    },
    {
      key: "accessClientGreater",
      labelEn: "Access Client (Above Limit)",
      labelAr: "الوصول إلى عميل (فوق الحد)",
      category: "client",
    },
    {
      key: "editClient",
      labelEn: "Edit Client",
      labelAr: "تعديل بيانات العميل",
      category: "client",
    },
    {
      key: "editProcess",
      labelEn: "Edit Process",
      labelAr: "تعديل العمليات",
      category: "process",
    },
    {
      key: "canDeleteClient",
      labelEn: "Delete Client",
      labelAr: "مسح بيانات العميل",
      category: "client",
    },
    {
      key: "accessProcesses",
      labelEn: "Access Processes",
      labelAr: "الوصول الى بيانات العملية",
      category: "process",
    },
  ];

  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [activeTab, setActiveTab] = useState("all");

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

  const filteredPermissions = permissionList.filter(
    (perm) => activeTab === "all" || perm.category === activeTab
  );

  const modelRef = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelRef.current && !modelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modelRef}
        className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              إدارة صلاحيات الموظف
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {employee?.username || "Employee Name"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl font-bold p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 -mt-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            جميع الصلاحيات
          </button>
          <button
            onClick={() => setActiveTab("client")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "client"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            صلاحيات العملاء
          </button>
          <button
            onClick={() => setActiveTab("process")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "process"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            صلاحيات العمليات
          </button>
        </div>

        {/* Permissions List */}
        <div className="space-y-4">
          {filteredPermissions.map(({ key, labelAr, labelEn }) => (
            <div
              key={key}
              className="flex items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selectedPermissions[key]}
                  onChange={() => handleCheckboxChange(key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <div className="mr-3 flex-1">
                <h4 className="text-gray-800 dark:text-gray-200 font-medium">
                  {labelAr}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {labelEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
}
