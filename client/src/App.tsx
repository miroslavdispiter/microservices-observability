import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TravelsPage } from "./pages/TravelPlan/TravelsPage";
import { TravelDetailsPage } from "./pages/TravelPlan/TravelDetailsPage";

const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - User */}
          <Route
            path="/travels"
            element={
              <ProtectedRoute>
                <TravelsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/travels/:id"
            element={
              <ProtectedRoute>
                <TravelDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;