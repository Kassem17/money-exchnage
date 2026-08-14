import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import {
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  User,
  Lock,
} from "lucide-react";

const MIN_PASSWORD_LENGTH = 6;

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const errors = {
    passwordLength: newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH,
    passwordMismatch:
      confirmPassword.length > 0 && newPassword !== confirmPassword,
  };
  const canSubmitStep2 =
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    newPassword === confirmPassword;

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("أدخل اسم المستخدم");
      return;
    }
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!canSubmitStep2) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { username: username.trim(), newPassword }
      );

      if (data.success) {
        setSuccess(true);
        toast.success(data.message || "تم تغيير كلمة المرور بنجاح");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      } else {
        toast.error(data.message || "فشل في تغيير كلمة المرور");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "حدث خطأ في الاتصال. حاول لاحقًا.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="card py-10">
            <div className="inline-flex p-4 rounded-full bg-primary-100 text-primary-600 mb-4">
              <CheckCircle2 className="h-14 w-14" />
            </div>
            <h2 className="text-xl font-bold text-surface-800 mb-2">
              تم تغيير كلمة المرور بنجاح
            </h2>
            <p className="text-surface-600 mb-6">
              يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة. جاري تحويلك...
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <div
                className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-button bg-primary-100 text-primary-600">
              <KeyRound className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-800">
                إعادة تعيين كلمة المرور
              </h1>
              <p className="text-sm text-surface-500 mt-0.5">
                {step === 1
                  ? "أدخل اسم المستخدم للمتابعة"
                  : `تغيير كلمة المرور لـ ${username}`}
              </p>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <label htmlFor="username" className="label mb-1.5">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400 pointer-events-none" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pr-10"
                    placeholder="أدخل اسم المستخدم"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  تسجيل الدخول
                </Link>
                <button type="submit" className="btn-primary flex-1">
                  التالي
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                تغيير اسم المستخدم
              </button>

              <div>
                <label htmlFor="newPassword" className="label mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400 pointer-events-none" />
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="6 أحرف على الأقل"
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-700"
                    aria-label={showNewPassword ? "إخفاء" : "إظهار"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.passwordLength && (
                  <p className="text-red-600 text-xs mt-1">
                    كلمة المرور يجب أن تكون 6 أحرف على الأقل
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="أعد إدخال كلمة المرور"
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-700"
                    aria-label={showConfirmPassword ? "إخفاء" : "إظهار"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.passwordMismatch && (
                  <p className="text-red-600 text-xs mt-1">
                    كلمة المرور غير متطابقة
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                >
                  إلغاء
                </Link>
                <button
                  type="submit"
                  disabled={loading || !canSubmitStep2}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? "جاري الحفظ..." : "تغيير كلمة المرور"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-surface-500 mt-4">
          تذكرت كلمة المرور؟{" "}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
