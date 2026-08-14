import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileQuestion } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center"
      >
        <div className="card py-10">
          <div className="inline-flex p-4 rounded-full bg-primary-100 text-primary-600 mb-6">
            <FileQuestion className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-surface-800 mb-2">
            وصول غير مسموح
          </h1>
          <p className="text-surface-600 mb-6">
            عذرًا، ليس لديك صلاحية الوصول إلى هذه الصفحة. تواصل مع الإدارة
            لطلب الصلاحيات.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </button>
        </div>
      </motion.div>
    </div>
  );
}
