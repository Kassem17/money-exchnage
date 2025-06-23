import { useState } from "react";
import useLogin from "../hooks/useLogin";
import backgroundImage from "../assets/bg.avif";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowBigLeftDash } from "lucide-react";

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
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />

      {/* Floating Decorative Shapes with subtle motion */}
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: 10 }}
        transition={{
          repeat: Infinity,
          duration: 4,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl z-0"
      />
      <motion.div
        initial={{ y: 10 }}
        animate={{ y: -10 }}
        transition={{
          repeat: Infinity,
          duration: 6,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-400 to-teal-300 rounded-full opacity-30 blur-2xl z-0"
      />

      {/* Glass Login Card with entrance animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Heading */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome Back 👋
            </h2>
            <div className="items-center flex gap-10 w-full ">
              <p className="text-sm text-white/70 text-start">
                Login to continue
              </p>
              <p
                onClick={() => navigate("/")}
                className="text-sm mt-1 text-end text-white/70 cursor-pointer flex"
              >
                <ArrowBigLeftDash /> القائمة الرئيسية
              </p>
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm text-white mb-1">
              Username
            </label>
            <input
              autoComplete="off"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm text-white mb-1">
              Password
            </label>
            <div className="relative">
              <input
                autoComplete="off"
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/20 text-white placeholder-gray-300 shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="••••••••"
                required
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
          </div>

          {/* Forgot Password */}
          <div className="text-right text-sm">
            <a href="/reset-password" className="text-white/70 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button with click animation */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-pink-500 transition-all shadow-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Sign In"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
