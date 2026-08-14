import { useState } from "react";
import useLogin from "../hooks/useLogin";
import backgroundImage from "../assets/bg.avif";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ username, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-surface-900/70 backdrop-blur-sm z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div>
              <h2 className="text-2xl font-bold text-white">مرحبًا بعودتك</h2>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-white/80">سجّل الدخول للمتابعة</p>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm text-white/80 hover:text-white flex items-center gap-1 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  الرئيسية
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="label text-white/90 mb-1.5">
                اسم المستخدم
              </label>
              <input
                autoComplete="off"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field bg-white/15 border-white/20 text-white placeholder-white/50 focus:border-primary-400 focus:ring-primary-400/30"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label text-white/90 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  autoComplete="off"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field bg-white/15 border-white/20 text-white placeholder-white/50 pr-10 focus:border-primary-400 focus:ring-primary-400/30"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 hover:text-white transition"
                  aria-label={showPassword ? "إخفاء" : "إظهار"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-left">
              <a
                href="/reset-password"
                className="text-sm text-white/70 hover:underline"
              >
                نسيت كلمة المرور؟
              </a>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary bg-primary-500 hover:bg-primary-600 py-3 rounded-button font-medium disabled:opacity-50"
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
