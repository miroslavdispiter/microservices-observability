import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface NavbarProps {
  activeTravelPlanId?: number;
}

export const Navbar = ({ activeTravelPlanId }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Current user:", user);
  console.log("User role:", user?.role);
  console.log("Is Admin:", user?.role === "Admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/travels"
              className="text-white text-xl font-bold tracking-wide"
            >
              ✈️ TravelPlanner
            </Link>
            <div className="hidden md:flex gap-2">
              <Link
                to="/travels"
                className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                  isActive("/travels") ? "bg-white/20" : ""
                }`}
              >
                My Travels
              </Link>

              {/* Travel Plan Context Menu */}
              {activeTravelPlanId && (
                <>
                  <Link
                    to={`/travels/${activeTravelPlanId}`}
                    className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                      isActive(`/travels/${activeTravelPlanId}`)
                        ? "bg-white/20"
                        : ""
                    }`}
                  >
                    📊 Overview
                  </Link>
                  <Link
                    to={`/travels/${activeTravelPlanId}/destinations`}
                    className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                      isActive(`/travels/${activeTravelPlanId}/destinations`)
                        ? "bg-white/20"
                        : ""
                    }`}
                  >
                    📍 Destinations
                  </Link>
                  <Link
                    to={`/travels/${activeTravelPlanId}/activities`}
                    className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                      isActive(`/travels/${activeTravelPlanId}/activities`)
                        ? "bg-white/20"
                        : ""
                    }`}
                  >
                    🎯 Activities
                  </Link>
                  <Link
                    to={`/travels/${activeTravelPlanId}/expenses`}
                    className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                      isActive(`/travels/${activeTravelPlanId}/expenses`)
                        ? "bg-white/20"
                        : ""
                    }`}
                  >
                    💰 Expenses
                  </Link>
                  <Link
                    to={`/travels/${activeTravelPlanId}/checklist`}
                    className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                      isActive(`/travels/${activeTravelPlanId}/checklist`)
                        ? "bg-white/20"
                        : ""
                    }`}
                  >
                    📋 Checklist
                  </Link>
                </>
              )}

              {/* Admin Link - UVEK VIDLJIV za Admin korisnike */}
              {user?.role === "Admin" && (
                <Link
                  to="/admin/dashboard"
                  className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                    isActive("/admin/dashboard") || isActive("/admin/travel-plans")
                      ? "bg-white/20"
                      : ""
                  }`}
                >
                  🛡️ Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-white text-sm">
              <span className="font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-white/70 ml-2">
                ({user?.role})
              </span>
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