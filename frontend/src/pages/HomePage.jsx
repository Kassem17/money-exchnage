import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/bg.avif";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Coins, ArrowLeft } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  const features = [
    {
      title: "أسعار تنافسية",
      desc: "أفضل أسعار صرف في السوق مع شفافية كاملة",
      icon: TrendingUp,
    },
    {
      title: "أمان مطلق",
      desc: "تشفير متقدم وحماية للبيانات وفق أعلى المعايير",
      icon: Shield,
    },
    {
      title: "دعم عملات متعدد",
      desc: "أكثر من 50 عملة تقليدية ورقمية",
      icon: Coins,
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(13, 148, 136, 0.25) 100%), url(${backgroundImage})`,
      }}
    >
      <div className="min-h-screen px-6 md:px-16 flex flex-col justify-center text-white">
        <motion.div
          className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="space-y-8" dir="rtl" variants={itemVariants}>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                منصة الصيرفة الأكثر تطورًا
                <span className="block mt-2 text-primary-300">
                  لإدارة نسبة المخاطر
                </span>
              </h1>
              <p className="mt-4 text-surface-200 text-lg">
                حلول مالية مبتكرة لتحويل العملات بكل سهولة وأمان
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-4">
                <span className="w-1 h-8 bg-primary-400 rounded-full" />
                لماذا نتميز؟
              </h3>
              <div className="space-y-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-card bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-400/40 transition"
                      variants={itemVariants}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex-shrink-0 p-2 rounded-lg bg-primary-500/20">
                        <Icon className="w-5 h-5 text-primary-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {feature.title}
                        </h4>
                        <p className="mt-0.5 text-sm text-surface-300">
                          {feature.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div variants={itemVariants}>
              <button
                onClick={() => navigate("/login")}
                className="btn-primary bg-primary-500 hover:bg-primary-600 text-white inline-flex items-center gap-2 py-3 px-6 text-base"
              >
                <ArrowLeft className="h-5 w-5" />
                تسجيل الدخول
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-400 rounded-full" />
              الميزات الرئيسية
            </h2>
            <ul className="space-y-4" dir="rtl">
              {[
                "أسعار صرف لحظية وتحديثات مباشرة",
                "دعم متعدد العملات بما فيها الرقمية",
                "معاملات آمنة بتشفير بنكي",
                "أداة تحويل فورية مع خيار تثبيت السعر",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-surface-200">
                  <span className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
