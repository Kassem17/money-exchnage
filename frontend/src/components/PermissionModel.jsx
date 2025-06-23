import React from "react";

export default function PermissionsModal({ userData, isOpen, onClose }) {
  if (!isOpen) return null;

  const permissions = [
    { name: "إنشاء عمليات أكثر من 10000", key: "createProcessGreater" },
    { name: "إنشاء عمليات أقل من 10000", key: "createProcessLess" },
    { name: "إنشاء عملاء أقل من 10000", key: "createClientLess" },
    { name: "إنشاء عملاء أكثر من 10000", key: "createClientGreater" },
    { name: "تعديل العملاء", key: "editClient" },
    { name: "الوصول إلى عملاء أقل من 10000", key: "accessClientLess" },
    { name: "الوصول إلى عملاء أكثر من 10000", key: "accessClientGreater" },
    { name: "تعديل العمليات", key: "editProcess" },
    { name: "مسح بيانات العميل", key: "canDeleteClient" },
    { name: "الوصول إلى العمليات", key: "accessProcesses" }
  ];

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal container */}
      <div
        className="fixed top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 z-50 p-6 transition-all duration-300"
        dir="rtl"
      >
        {/* Modal header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">صلاحيات المستخدم</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Permissions table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصلاحية
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission) => (
                <tr key={permission.key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {permission.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userData[permission.key] 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {userData[permission.key] ? "مفعّل" : "غير مفعّل"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Close button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            إغلاق
          </button>
        </div>
      </div>
    </>
  );
}