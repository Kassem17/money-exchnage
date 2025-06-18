import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { EyeIcon, X } from "lucide-react";
import { useEditClient } from "../../hooks/useEditClient";
import io from "socket.io-client";
import ProcessDetailsModal from "../../components/ProcessDetailsModal";
import useDeleteClient from "../../hooks/useDeleteClient";
import { motion } from "framer-motion";

const socket = io("http://localhost:5000");

const AllClients = () => {
  // Context and hooks
  const { backendUrl, token, userData: employeeData } = useContext(AppContext);
  const navigate = useNavigate();
  const { editClient } = useEditClient();
  const { deleteClient, loading: deleteLoading } = useDeleteClient();

  // State management
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("");
  const rowsPerPage = 10;

  // Modal states
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [showBanksModal, setShowBanksModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClientProcesses, setSelectedClientProcesses] = useState([]);
  const [showProcessesModal, setShowProcessesModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableClient, setEditableClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/employee/get-clients`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) {
          setUserData(data.clients);
          setFilteredData(data.clients);
        } else {
          toast.error(data.message || "فشل في جلب العملاء");
          setUserData([]);
          setFilteredData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();

    // Socket listeners
    socket.on("client:created", (newClient) => {
      setUserData((prev) => [...prev, newClient]);
    });

    socket.on("client:deleted", (deletedClient) => {
      const id =
        typeof deletedClient === "string" ? deletedClient : deletedClient._id;
      setUserData((prev) => prev.filter((client) => client._id !== id));
    });

    socket.on("client:updated", (updatedClient) => {
      setUserData((prev) =>
        prev.map((client) =>
          client._id === updatedClient._id ? updatedClient : client
        )
      );
    });

    return () => {
      socket.off("client:created");
      socket.off("client:updated");
      socket.off("client:deleted");
    };
  }, [backendUrl, token]);

  // Filtering and pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(userData);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = userData.filter(
        (client) =>
          client.fullname.toLowerCase().includes(lower) ||
          client.phoneNumber.toLowerCase().includes(lower) ||
          client.IDnumber.toLowerCase().includes(lower)
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, userData]);

  // Helper functions
  const handleProcessClick = (process) => {
    setSelectedProcess(process);
    setShowProcessModal(true);
  };

  const handleBanksClick = (banks) => {
    setSelectedBanks(banks || []);
    setShowBanksModal(true);
  };

  const handleClientInfoClick = (client) => {
    setSelectedClient(client);
    setEditableClient({ ...client });
    setShowClientModal(true);
  };

  const handleShowProcesses = (client) => {
    setSelectedClientProcesses(client.processes || []);
    setShowProcessesModal(true);
  };

  const handleSave = async () => {
    await editClient(editableClient._id, editableClient);
    setEditMode(false);
  };

  const handleDelete = async (id) => {
    await deleteClient(id);
    setDeleteConfirm(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-xl font-semibold text-blue-600 animate-pulse">
          جارٍ التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 -mt-9">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          {selectedFilter === ""
            ? "قائمة العملاء"
            : selectedFilter === "greater"
            ? "العملاء الذين دخلهم أكثر من 10000"
            : "العملاء الذين دخلهم أقل من 10000"}
        </h2>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <div className="w-full max-w-md">
            <input
              type="text"
              placeholder="ابحث بالاسم أو الهاتف أو السجل"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 text-right">
            <p className="mr-20 flex items-center text-gray-700">
              <svg
                className="w-5 h-5 text-indigo-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-2xl font-bold text-indigo-600 mr-2">
                {userData.length}
              </span>
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={selectedFilter === "less"}
                onChange={() =>
                  setSelectedFilter((prev) => (prev === "less" ? "" : "less"))
                }
                className="accent-blue-600 w-4 h-4"
              />
              أقل من 10000
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={selectedFilter === "greater"}
                onChange={() =>
                  setSelectedFilter((prev) =>
                    prev === "greater" ? "" : "greater"
                  )
                }
                className="accent-blue-600 w-4 h-4"
              />
              أكثر من 10000
            </label>
          </div>
        </div>

        {/* Clients Table */}
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-24">
            لا يوجد عملاء لعرضهم
          </div>
        ) : (
          <div className="overflow-x-auto rounded shadow ring-1 ring-blue-200 dark:ring-gray-700">
            <table className="min-w-full text-xs border-collapse border border-blue-200 dark:border-gray-700">
              <thead className="bg-blue-100 dark:bg-gray-700 text-blue-900 dark:text-gray-200 uppercase tracking-wide text-center">
                <tr>
                  {[
                    "الإجراءات",
                    "العمليات",
                    "رقم الهاتف",
                    "رقم السجل",
                    "رقم الهوية",
                    "الاسم و الشهرة",
                    "#",
                  ].map((header, i) => (
                    <th
                      key={i}
                      className="px-2 py-1 border border-blue-200 dark:border-gray-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-center text-blue-900 dark:text-gray-100">
                {currentRows
                  .reverse()
                  .filter((client) => {
                    if (selectedFilter === "greater")
                      return client.clientType === "greater than 10000";
                    if (selectedFilter === "less")
                      return client.clientType === "less than 10000";
                    return true;
                  })
                  .map((client, index) => (
                    <tr
                      key={client._id}
                      className="hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="px-2 py-1 border">
                        <div className="flex justify-center gap-2">
                          {((client.clientType === "greater than 10000" &&
                            employeeData.createProcessGreater) ||
                            (client.clientType === "less than 10000" &&
                              employeeData.createProcessLess)) && (
                            <button
                              onClick={() => {
                                const path =
                                  client.clientType === "greater than 10000"
                                    ? "/create-process-greater"
                                    : "/create-process-less";
                                navigate(`${path}?clientId=${client._id}`);
                              }}
                              className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-600 hover:text-white"
                              title="عملية"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          )}
                          {((client.clientType === "greater than 10000" &&
                            employeeData.accessClientGreater) ||
                            (client.clientType === "less than 10000" &&
                              employeeData.accessClientLess)) && (
                            <button
                              onClick={() => handleClientInfoClick(client)}
                              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                              title="عرض"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(client._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                            title="حذف"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-1 border">
                        <button
                          onClick={() => handleShowProcesses(client)}
                          disabled={!client.processes?.length}
                          className={`px-2 py-1 rounded text-xs ${
                            client.processes?.length
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-gray-100 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {client.processes?.length || 0} عمليات
                        </button>
                      </td>
                      <td className="px-2 py-1 border hidden sm:table-cell">
                        {client.phoneNumber}
                      </td>
                      <td className="px-2 py-1 border">
                        {client.registrationNumber}
                      </td>
                      <td className="px-2 py-1 border">{client.IDnumber}</td>
                      <td className="px-2 py-1 border text-right">
                        &#x202B;{client.fullname}&#x202C; -{" "}
                        <span dir="rtl" className="inline-block">
                          {client.clientType === "greater than 10000"
                            ? "أكثر"
                            : "أقل"}
                        </span>
                      </td>
                      <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              عرض {(currentPage - 1) * rowsPerPage + 1} إلى{" "}
              {Math.min(currentPage * rowsPerPage, filteredData.length)} من{" "}
              {filteredData.length} عميل
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="السابق"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-xs ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } transition`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-1">...</span>
                )}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => goToPage(totalPages)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="التالي"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Client Info Modal */}
        {showClientModal && selectedClient && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl max-w-7xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-right space-y-8 border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-600 -mb-7">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  👤 {selectedClient.fullname}
                  <div
                    dir="rtl"
                    className="text-sm text-gray-600 dark:text-gray-300 mt-1"
                  >
                    <span className="font-medium">أنشئ بواسطة:</span>{" "}
                    {selectedClient.employeeId?.username}
                  </div>
                </h2>
                <div className="flex items-center gap-4">
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      ✏️ تعديل
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                      >
                        💾 حفظ
                      </button>
                      <button
                        onClick={() => {
                          setEditableClient({ ...selectedClient });
                          setEditMode(false);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
                      >
                        ❌ إلغاء
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowClientModal(false)}
                    className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                  >
                    ✖️
                  </button>
                </div>
              </div>

              {/* Three-column Info Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 border-b pb-1 border-gray-300 dark:border-gray-600">
                    📝 المعلومات الشخصية
                  </h3>
                  <ul className="space-y-2">
                    {[
                      [": الاسم", "fullname"],
                      [": رقم الهوية", "IDnumber"],
                      [": رقم السجل", "registrationNumber"],
                      [": الهاتف", "phoneNumber"],
                      [":ت. الميلاد", "dateOfBirth"],
                    ].map(([label, key]) => (
                      <li
                        key={key}
                        className="flex flex-row-reverse justify-between items-center gap-4 bg-white/60 dark:bg-gray-700 p-2 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
                      >
                        <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm whitespace-nowrap">
                          {label}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100 text-sm text-left break-words">
                          {editMode ? (
                            key === "dateOfBirth" ? (
                              <input
                                type="date"
                                className="bg-white dark:bg-gray-800 text-sm rounded px-2 py-1"
                                value={
                                  editableClient.dateOfBirth?.split("T")[0] ||
                                  ""
                                }
                                onChange={(e) =>
                                  setEditableClient({
                                    ...editableClient,
                                    dateOfBirth: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <input
                                type="text"
                                className="bg-white dark:bg-gray-800 text-sm rounded px-2 py-1"
                                value={editableClient[key] || ""}
                                onChange={(e) =>
                                  setEditableClient({
                                    ...editableClient,
                                    [key]: e.target.value,
                                  })
                                }
                              />
                            )
                          ) : key === "dateOfBirth" ? (
                            new Date(
                              selectedClient.dateOfBirth
                            ).toLocaleDateString()
                          ) : (
                            selectedClient[key]
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Work Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 border-b pb-1 border-gray-300 dark:border-gray-600">
                    💼 معلومات العمل
                  </h3>
                  <ul className="space-y-2">
                    {[
                      [": الجنسية", selectedClient.nationality, "nationality"],
                      [": العمل", editableClient.work, "work"],
                      [
                        ": الوضع المالي",
                        editableClient.financialStatus === "good"
                          ? "جيد"
                          : "سيئ",
                        "financialStatus",
                      ],
                      [
                        ":مقيم؟",
                        editableClient.resident ? "نعم" : "لا",
                        "resident",
                      ],
                      [
                        ": صاحب الحق الإقتصادي",
                        editableClient.ownerOfEconomicActivity || "لا يوجد",
                        "ownerOfEconomicActivity",
                      ],
                      [
                        ": نوع العميل",
                        editableClient.clientType === "greater than 10000"
                          ? "أكثر من 10000"
                          : "أقل من 10000",
                        "clientType",
                      ],
                      [
                        ": الدخل السنوي",
                        `${editableClient.yearlyIncome} $`,
                        "yearlyIncome",
                      ],
                    ].map(([label, value, key], idx) => (
                      <li
                        key={idx}
                        className="flex flex-row-reverse justify-between items-center gap-4 bg-white/60 dark:bg-gray-700 p-2 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
                      >
                        <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm whitespace-nowrap">
                          {label}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100 text-sm text-left break-words">
                          {editMode && key !== "nationality" ? (
                            key === "resident" ? (
                              <select
                                value={editableClient[key] ? "yes" : "no"}
                                onChange={(e) =>
                                  setEditableClient({
                                    ...editableClient,
                                    [key]: e.target.value === "yes",
                                  })
                                }
                                className="bg-white dark:bg-gray-800 text-sm rounded px-2 py-1"
                              >
                                <option value="yes">نعم</option>
                                <option value="no">لا</option>
                              </select>
                            ) : key === "financialStatus" ? (
                              <select
                                value={editableClient[key]}
                                onChange={(e) =>
                                  setEditableClient({
                                    ...editableClient,
                                    [key]: e.target.value,
                                  })
                                }
                                className="bg-white dark:bg-gray-800 text-sm rounded px-2 py-1"
                              >
                                <option value="good">جيد</option>
                                <option value="bad">سيئ</option>
                              </select>
                            ) : key === "clientType" ? (
                              <select
                                value={editableClient[key]}
                                onChange={(e) =>
                                  setEditableClient({
                                    ...editableClient,
                                    [key]: e.target.value,
                                  })
                                }
                                className="bg-white dark:bg-gray-800 text-sm rounded px-2 py-1"
                              >
                                <option value="greater than 10000">
                                  أكثر من 10000
                                </option>
                                <option value="less than 10000">
                                  أقل من 10000
                                </option>
                              </select>
                            ) : (
                              <input
                                type={
                                  key === "yearlyIncome" ? "number" : "text"
                                }
                                value={editableClient[key] || ""}
                                onChange={(e) =>
                                  setEditableClient({
                                    ...editableClient,
                                    [key]:
                                      key === "yearlyIncome"
                                        ? +e.target.value
                                        : e.target.value,
                                  })
                                }
                                className="bg-white dark:bg-gray-800 text-sm rounded px-2 py-1"
                              />
                            )
                          ) : (
                            value
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Address Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 border-b pb-1 border-gray-300 dark:border-gray-600">
                    🏠 العناوين
                  </h3>

                  <ul className="space-y-4">
                    {[
                      {
                        label: "📌 عنوان السكن",
                        key: "currentAddress",
                        fields: ["country", "district", "street", "building"],
                      },
                      {
                        label: "🎂 مكان الولادة",
                        key: "bornAddress",
                        fields: ["country", "district"],
                      },
                    ].map(({ label, key, fields }) => (
                      <li key={key} className="space-y-2">
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-200 border-r-4 border-blue-500 pr-2">
                          {label}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {fields.map((fieldName) => (
                            <div
                              key={fieldName}
                              className="flex flex-row-reverse items-center justify-between gap-4 bg-white/60 dark:bg-gray-700 p-2 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
                            >
                              <label className="font-semibold text-gray-700 dark:text-gray-200 text-sm whitespace-nowrap">
                                {fieldName === "district"
                                  ? "منطقة"
                                  : fieldName === "country"
                                  ? "البلد"
                                  : fieldName === "street"
                                  ? "الشارع"
                                  : fieldName === "building"
                                  ? "البناية"
                                  : fieldName}
                              </label>

                              <span className="text-gray-800 dark:text-gray-100 text-sm text-left break-words w-full max-w-[180px]">
                                {editMode ? (
                                  <input
                                    type="text"
                                    className="w-full bg-white dark:bg-gray-800 text-sm rounded px-2 py-1"
                                    value={
                                      editableClient[key]?.[fieldName] || ""
                                    }
                                    onChange={(e) =>
                                      setEditableClient({
                                        ...editableClient,
                                        [key]: {
                                          ...editableClient[key],
                                          [fieldName]: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder={`أدخل ${fieldName}`}
                                  />
                                ) : (
                                  selectedClient[key]?.[fieldName] || "-"
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-wrap justify-center gap-6">
                <div className="bg-white/60 dark:bg-gray-700 text-center p-4 rounded-xl w-40 border shadow">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                    عدد المعاملات
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedClient?.processes?.length ?? 0}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-700 text-center p-4 rounded-xl w-40 border shadow">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                    تاريخ التعامل
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(() => {
                      const d = new Date(selectedClient.createdAt);
                      const day = String(d.getDate()).padStart(2, "0");
                      const month = String(d.getMonth() + 1).padStart(2, "0");
                      const year = String(d.getFullYear()).slice(-2);
                      return `${day}/${month}/${year}`;
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() =>
                    handleBanksClick(selectedClient.banksDealingWith)
                  }
                >
                  🏦 عرض البنوك المتعامل معها
                </button>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processes Modal */}
        {showProcessesModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-3xl p-6 shadow-lg max-h-[80vh] overflow-y-auto border border-gray-300 dark:border-gray-700 transition-all">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  العمليات ({selectedClientProcesses.length})
                </h2>
                <button
                  onClick={() => setShowProcessesModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                  aria-label="إغلاق"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedClientProcesses.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 text-lg py-16">
                  لا توجد عمليات متاحة
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedClientProcesses.map((process, idx) => (
                    <div
                      key={idx}
                      className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedProcess(process);
                        setShowProcessModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          العملية #{idx + 1}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            process.processType === "Sell"
                              ? "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200"
                              : "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200"
                          }`}
                        >
                          {process.processType === "Sell" ? "بيع" : "شراء"}
                        </span>
                      </div>
                      <div>
                        {process?.processDate
                          ? (() => {
                              const d = new Date(process.processDate);
                              const day = String(d.getDate()).padStart(2, "0");
                              const month = String(d.getMonth() + 1).padStart(
                                2,
                                "0"
                              );
                              const year = String(d.getFullYear()).slice(2);
                              return `${day}/${month}/${year}`;
                            })()
                          : "لا يوجد"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Process Details Modal */}
        {showProcessModal && selectedProcess && (
          <ProcessDetailsModal
            onClose={() => setShowProcessModal(false)}
            process={selectedProcess}
            userData={userData}
          />
        )}

        {/* Banks Modal */}
        {showBanksModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  البنوك المتعامل معها
                </h2>
                <button
                  onClick={() => setShowBanksModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                  aria-label="إغلاق"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedBanks.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 text-base">
                  لا توجد بنوك متاحة حالياً
                </div>
              ) : (
                <ul className="space-y-2 list-inside text-right text-gray-800 dark:text-gray-100">
                  {selectedBanks.map((bank, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md shadow-sm"
                    >
                      {bank.bankName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                تأكيد الحذف
              </h3>
              <p className="text-gray-600 mb-6 text-right">
                هل أنت متأكد أنك تريد حذف هذا العميل ؟ لا يمكن التراجع عن هذا
                الإجراء.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllClients;
