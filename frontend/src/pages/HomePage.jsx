import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/bg.avif";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
      }}
    >
      <div className="min-h-screen px-6 md:px-16 flex flex-col justify-center text-white">
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* LEFT: Hero Content */}
          <motion.div className="space-y-10" dir="rtl" variants={itemVariants}>
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                منصة الصيرفة الأكثر تطورًا لإدارة نسبة المخاطر في الشركة
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                حلول مالية مبتكرة لتحويل العملات بكل سهولة وأمان
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-semibold text-white flex items-center">
                <span className="w-3 h-8 bg-blue-500 rounded-full ml-3"></span>
                لماذا نتميز عن الآخرين؟
              </h3>

              {/* Features List */}
              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "أسعار تنافسية",
                    desc: "أفضل أسعار صرف في السوق مع شفافية كاملة",
                    icon: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
                  },
                  {
                    title: "أمان مطلق",
                    desc: "تشفير متقدم وحماية للبيانات وفق أعلى المعايير",
                    icon: (
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ),
                  },
                  {
                    title: "دعم عملات متعدد",
                    desc: "أكثر من 50 عملة تقليدية ورقمية",
                    icon: (
                      <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    ),
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition duration-300 shadow-lg"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start">
                      <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                        <svg
                          className="w-6 h-6 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {feature.icon}
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-100">
                          {feature.title}
                        </h4>
                        <p className="mt-1 text-gray-300 text-sm">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div className="flex" variants={itemVariants}>
              <button
                onClick={() => navigate("/login")}
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg group"
              >
                <span className="relative z-10">تسجيل الدخول</span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-700 to-cyan-600"></span>
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT: Features Overview */}
          <motion.div className="space-y-8" variants={itemVariants}>
            <motion.div
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-blue-500 rounded-full ml-3"></div>
                <h2 className="text-2xl font-semibold">الميزات الرئيسية</h2>
              </div>

              <div className="space-y-4" dir="rtl">
                {[
                  {
                    title: "أسعار صرف لحظية",
                    desc: "تحديثات مباشرة مع رسوم بيانية تاريخية وتنبيهات",
                  },
                  {
                    title: "دعم متعدد العملات",
                    desc: "أكثر من 50 عملة بما فيها الرقمية والنادرة",
                  },
                  {
                    title: "معاملات آمنة",
                    desc: "تشفير بنكي وطبقة حماية مزدوجة",
                  },
                  {
                    title: "أداة تحويل فورية",
                    desc: "حاسبة تكاليف مع خيار تثبيت السعر",
                  },
                ].map((item, idx) => (
                  <div className="flex items-start space-x-3" key={idx}>
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-100">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-300 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
