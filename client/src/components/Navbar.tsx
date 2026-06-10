import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/travels" className="text-white text-xl font-bold tracking-wide">
              ✈️ TravelPlanner
            </Link>
            <div className="hidden md:flex gap-4">
              <Link
                to="/travels"
                className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
              >
                My Travels
              </Link>
              {user?.role === "Admin" && (
                <Link
                  to="/admin/dashboard"
                  className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-white text-sm">
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              <span className="text-white/70 ml-2">({user?.role})</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg
                         transition-all font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};