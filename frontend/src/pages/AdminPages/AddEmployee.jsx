import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Permissions from "../../components/Permissions";
import { EyeOffIcon, EyeIcon } from "lucide-react";
import { socket } from "../../utils/socket";

const AddEmployee = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phoneNumber: "",
    createClientGreater: false,
    createClientLess: false,
    createProcessGreater: false,
    createProcessLess: false,
    editClient: false,
    accessClientLess: false,
    accessClientGreater: false,
    editProcess: false,
    canDeleteClient: false,
    accessProcesses: false,
    role: "employee",
  });
  const [loading, setLoading] = useState(false);
  const { backendUrl, token } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        backendUrl + "/api/admin/create-employee",
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        toast.success("تم إضافة الموظف بنجاح!");
        socket.emit("employee:created", data.employee);
        setFormData({
          username: "",
          password: "",
          phoneNumber: "",
          createClientGreater: false,
          createClientLess: false,
          createProcessGreater: false,
          createProcessLess: false,
          editClient: false,
          accessClientLess: false,
          accessClientGreater: false,
          editProcess: false,
          canDeleteClient: false,
          accessProcesses: false,
          role: "employee",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: "",
      password: "",
      phoneNumber: "",
      createClientGreater: false,
      createClientLess: false,
      createProcessGreater: false,
      createProcessLess: false,
      editClient: false,
      accessClientLess: false,
      accessClientGreater: false,
      role: "employee",
      editProcess: false,
      canDeleteClient: false,
      accessProcesses: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-8 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <form
          className="flex flex-col lg:flex-row items-start gap-8"
          dir="rtl"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* Left Section - Form Fields */}
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bold text-purple-800 border-b pb-2">
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المستخدم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع المستخدم
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    const perms = {
                      createClientGreater: role === "admin",
                      createClientLess: role === "admin",
                      createProcessGreater: role === "admin",
                      createProcessLess: role === "admin",
                      editClient: role === "admin",
                      accessClientLess: role === "admin",
                      accessClientGreater: role === "admin",
                      editProcess: role === "admin",
                      canDeleteClient: role === "admin",
                      accessProcesses: role === "admin",
                    };
                    setFormData((prev) => ({ ...prev, role, ...perms }));
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 bg-white"
                >
                  <option value="employee">موظف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
            </div>

            <Permissions formData={formData} setFormData={setFormData} />
          </div>

          {/* Right Section - Actions */}
          <div className="w-full lg:w-72 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin mr-2 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  جارٍ الإضافة...
                </span>
              ) : (
                "إضافة الموظف"
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3 border border-purple-400 text-purple-700 font-semibold rounded-lg hover:bg-purple-100"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
