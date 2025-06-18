import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full flex flex-col items-center text-center p-6 rounded-xl shadow-xl bg-white"
      >
        <Player
          autoplay
          loop
          src="https://assets6.lottiefiles.com/packages/lf20_jcikwtux.json"
          style={{ height: "220px", width: "220px" }}
        />

        <h1 className="text-3xl font-bold text-yellow-700 mb-3">
          وصول غير مسموح
        </h1>
        <p className="text-base text-gray-700 mb-2 font-medium">
          عذرًا، ليس لديك صلاحية الوصول إلى هذه الصفحة.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          يرجى التواصل مع مركز الاتصال لمزيد من التفاصيل أو طلب صلاحية.
        </p>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-xl"
        >
          <ArrowLeft size={18} />
          العودة إلى الصفحة الرئيسية
        </button>
      </motion.div>
    </div>
  );
}
