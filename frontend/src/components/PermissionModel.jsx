import React from "react";

export default function PermissionsModal({ userData, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* الخلفية الداكنة */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={onClose}
      ></div>

      {/* صندوق المودال */}
      <div
        className="fixed top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg max-w-md w-full p-5 z-50"
        dir="rtl"
      >
        <h2 className="text-lg font-bold mb-4 text-gray-800 text-right">الصلاحيات:</h2>

        <table className="w-full text-right border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-3 py-1">الصلاحية</th>
              <th className="border border-gray-300 px-3 py-1">مفعّل</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-1">إنشاء عمليات أكثر من 10000</td>
              <td className="border border-gray-300 px-3 py-1">
                {userData.createProcessGreater ? "نعم" : "لا"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1">إنشاء عمليات أقل من 10000</td>
              <td className="border border-gray-300 px-3 py-1">
                {userData.createProcessLess ? "نعم" : "لا"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1">إنشاء عملاء أقل من 10000</td>
              <td className="border border-gray-300 px-3 py-1">
                {userData.createClientLess ? "نعم" : "لا"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1">إنشاء عملاء أكثر من 10000</td>
              <td className="border border-gray-300 px-3 py-1">
                {userData.createClientGreater ? "نعم" : "لا"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1">تعديل العملاء</td>
              <td className="border border-gray-300 px-3 py-1">
                {userData.editClient ? "نعم" : "لا"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1">الوصول إلى عملاء أقل من 10000</td>
              <td className="border border-gray-300 px-3 py-1">
                {userData.accessClientLess ? "نعم" : "لا"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1">الوصول إلى عملاء أكثر من 10000</td>
              <td className="border border-gray-300 px-3 py-1">
                {userData.accessClientGreater ? "نعم" : "لا"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* زر إغلاق */}
        <button
          onClick={onClose}
          className="mt-5 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded text-sm font-semibold"
        >
          إغلاق
        </button>
      </div>
    </>
  );
}
