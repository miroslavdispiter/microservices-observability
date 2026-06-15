import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { TravelsPage } from "./pages/travelPlan/TravelsPage";
import { TravelDetailsPage } from "./pages/travelPlan/TravelDetailsPage";
import { DestinationsPage } from "./pages/destination/DestinationsPage";
import { ActivitiesPage } from "./pages/activity/ActivitiesPage";
import { ExpensesPage } from "./pages/expense/ExpensesPage";
import { ChecklistPage } from "./pages/checklist/ChecklistPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminTravelPlansPage } from "./pages/admin/AdminTravelPlansPage";
import { SharedPlanPage } from "./pages/sharing/SharedPlanPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Shared Plan - NO AUTH REQUIRED */}
      <Route path="/shared/:token" element={<SharedPlanPage />} />

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
        path="/travels/:id/activities"
        element={
          <ProtectedRoute>
            <ActivitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/travels/:id/expenses"
        element={
          <ProtectedRoute>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/travels/:id/checklist"
        element={
          <ProtectedRoute>
            <ChecklistPage />
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
      <Route
        path="/admin/travel-plans"
        element={
          <ProtectedRoute requiredRole="Admin">
            <AdminTravelPlansPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}