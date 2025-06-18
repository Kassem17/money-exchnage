import { useNavigate } from "react-router-dom";
import logo from "../../public/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  

  return (
    <nav className="bg-blue-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-white cursor-pointer"
          >
            <span className="text-lg font-bold">
              <img
                className="w-8 h-8 rounded-full bg-yellow-300 mr-2"
                src={logo}
                alt=""
              />
            </span>
            <span className="text-base font-semibold tracking-wide">
              صيرفة{" "}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-white text-blue-600 text-sm font-medium px-3 py-1.5 rounded-md shadow hover:bg-blue-100 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
