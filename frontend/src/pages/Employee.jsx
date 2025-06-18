import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { RiAdminLine } from "react-icons/ri";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { MdLoop } from "react-icons/md";
import { toast } from "react-toastify";
import { CiViewList } from "react-icons/ci";
import PermissionSetModel from "../components/PermissionSetModel";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Update this to your backend URL in production

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const { backendUrl, token } = useContext(AppContext);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + "/api/admin/get-employee",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (data.success) {
          setEmployees(data.employees);
        } else {
          console.error("Failed to fetch employees:", data.message);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    socket.on("employee:created", (newEmployee) => {
      setEmployees((prev) => [...prev, newEmployee]);
    });

    socket.on("employee:statusChanged", (updatedEmployee) => {
      setEmployees((prev) =>
        prev.map((employee) =>
          employee._id === updatedEmployee._id ? updatedEmployee : employee
        )
      );
    });

    socket.on("employee:deleted", (deletedId) => {
      setEmployees((prev) => prev.filter((emp) => emp._id !== deletedId));
    });

    return () => {
      socket.off("employee:created");
      socket.off("employee:statusChanged");
      socket.off("employee:deleted");
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/delete-employee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        setDeleteConfirm(null); // Close the confirmation modal
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits
    return `${day}/${month}/${year}`;
  };

  const handleChangeStatus = async (username) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        socket.emit("employee:statusChanged", data.isActive);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeRole = async (username) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/set-as-admin",
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        socket.emit("employee:adminSet", data.employee);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const [showPermissionModel, setShowPermissionModel] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleSavePermissions = async (permissions, username) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/set-permissions",
        {
          username: selectedEmployee.username,
          permissions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to set permissions");
      console.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 -mt-9">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الموظفين</h1>
            <p className="text-gray-600 mt-2 text-base">
              إدارة مستخدمي النظام والتحكم في صلاحياتهم
            </p>
          </div>
          <button
            onClick={() => navigate("/add-employee")}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow transition"
          >
            <FiPlus className="text-xl" />
            <span className="font-medium">إضافة موظف جديد</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow border border-gray-200">
          {/* Search and Info */}
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن موظف..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap self-center">
              عرض <span className="font-semibold">{indexOfFirstItem + 1}</span>-
              <span className="font-semibold">
                {Math.min(indexOfLastItem, filteredEmployees.length)}
              </span>
              من{" "}
              <span className="font-semibold">{filteredEmployees.length}</span>{" "}
              موظف
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    "الإجراءات",
                    "تاريخ الإضافة",
                    "الحالة",
                    "رقم الهاتف",
                    "اسم المستخدم",
                  ].map((head, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 ${
                        i === 0 || i === 2 ? "text-center" : "text-right"
                      } font-semibold text-gray-500 uppercase tracking-wider`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length ? (
                  currentItems.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setDeleteConfirm(employee._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                            title="حذف"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleChangeStatus(employee.username)
                            }
                            className={`p-1 rounded-full hover:bg-gray-100 ${
                              employee.isActive
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                            title={employee.isActive ? "تعطيل" : "تفعيل"}
                          >
                            <MdLoop className="w-5 h-5" />
                          </button>
                          {employee.role !== "admin" && (
                            <button
                              onClick={() => changeRole(employee.username)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                              title="ترقية إلى مدير"
                            >
                              <RiAdminLine className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const emp = employees.find(
                                (e) => e.username === employee.username
                              );
                              setSelectedEmployee(emp);
                              setShowPermissionModel(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100"
                            title="إدارة الصلاحيات"
                          >
                            <CiViewList className="w-5 h-5" />
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-right text-gray-500">
                        {formatDate(employee.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            employee.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employee.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-right text-gray-900">
                        {employee.phoneNumber || "لا يوجد"}
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3 text-right">
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {employee._id.substring(18, 24)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      لا يوجد موظفين
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                الصفحة <span className="font-semibold">{currentPage}</span> من{" "}
                <span className="font-semibold">{totalPages}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum =
                    totalPages <= 5
                      ? i + 1
                      : currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Permission Modal */}
        {showPermissionModel && selectedEmployee && (
          <PermissionSetModel
            show={showPermissionModel}
            onClose={() => {
              setShowPermissionModel(false);
              setSelectedEmployee(null);
            }}
            onSave={(permissions) =>
              handleSavePermissions(permissions, selectedEmployee.username)
            }
            employee={selectedEmployee}
          />
        )}

        {/* Delete Modal */}
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
                هل أنت متأكد أنك تريد حذف هذا الموظف؟ لا يمكن التراجع عن هذا
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
      </motion.div>
    </div>
  );
};

export default Employee;
