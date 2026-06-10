import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { TravelsPage } from "./pages/travelPlan/TravelsPage";
import { TravelDetailsPage } from "./pages/travelPlan/TravelDetailsPage";
import { DestinationsPage } from "./pages/destination/DestinationsPage";

const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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
      <Route
        path="/travels/:id/destinations"
        element={
          <ProtectedRoute>
            <DestinationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}