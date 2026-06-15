import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import { useSharedPlan } from "../contexts/sharing/SharedPlanContext";

export const SharedPlanLayout = () => {
  const { sharingToken, plan, isLoading, error, isViewOnly } = useSharedPlan();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams<{ token: string }>();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-gray-600">Loading shared travel plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan || !sharingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            {error || "This sharing link is invalid or has expired."}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100">
      {/* Shared Plan Navbar */}
      <nav className="bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="text-white text-xl font-bold tracking-wide flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                {plan.title}
              </div>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => navigate(`/shared/${token}`)}
                  className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                    isActive(`/shared/${token}`) ? "bg-white/20" : ""
                  }`}
                >
                  📊 Overview
                </button>

                {!isViewOnly && (
                  <>
                    <button
                      onClick={() => navigate(`/shared/${token}/destinations`)}
                      className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                        isActive(`/shared/${token}/destinations`) ? "bg-white/20" : ""
                      }`}
                    >
                      📍 Destinations
                    </button>
                    <button
                      onClick={() => navigate(`/shared/${token}/activities`)}
                      className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                        isActive(`/shared/${token}/activities`) ? "bg-white/20" : ""
                      }`}
                    >
                      🎯 Activities
                    </button>
                    <button
                      onClick={() => navigate(`/shared/${token}/expenses`)}
                      className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                        isActive(`/shared/${token}/expenses`) ? "bg-white/20" : ""
                      }`}
                    >
                      💰 Expenses
                    </button>
                    <button
                      onClick={() => navigate(`/shared/${token}/checklist`)}
                      className={`text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all ${
                        isActive(`/shared/${token}/checklist`) ? "bg-white/20" : ""
                      }`}
                    >
                      📋 Checklist
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-white text-sm">
                <span
                  className={`px-3 py-1 rounded-lg font-semibold ${
                    isViewOnly
                      ? "bg-blue-600/50"
                      : "bg-green-600/50"
                  }`}
                >
                  {sharingToken.accessType} Access
                </span>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg
                           transition-all font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <Outlet />
    </div>
  );
};