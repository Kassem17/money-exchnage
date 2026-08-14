import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav
      id="navbar-print-hide"
      className="sticky top-0 z-40 border-b border-surface-200 bg-white/95 backdrop-blur-sm shadow-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-surface-800 hover:text-primary-600 transition"
            aria-label="الصفحة الرئيسية"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">صيرفة</span>
          </button>

          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
