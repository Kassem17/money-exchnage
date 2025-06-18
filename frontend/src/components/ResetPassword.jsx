import axios from "axios";
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { backendUrl } = useContext(AppContext);

  const [showPassword, setShowPassword] = useState(false);

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        {
          username,
          newPassword,
        }
      );

      if (data.success) {
        toast.success("✅ تمت إعادة تعيين كلمة المرور بنجاح!");
        setUsername("");
        setNewPassword("");
      } else {
        toast.error("❌ " + (data.message || "فشل في إعادة التعيين"));
      }
    } catch (error) {
      toast.error("❌ حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-pink-600">
          🔐 إعادة تعيين كلمة المرور
        </h2>

        <form onSubmit={resetPassword} className="space-y-5" autoComplete="off">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              اسم المستخدم
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border border-pink-300 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              placeholder="exampleuser"
              autoComplete="off"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border border-pink-300 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              placeholder="••••••••"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-white hover:text-gray-300 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
