/**
 * DSP Shift-Planner App
 *
 * Hauptanwendung mit Microsoft Organization Authentication und Employee-Integration
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useMicrosoftAuth } from "./hooks/useMicrosoftAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import "./App.css";

const AppContent: React.FC = () => {
  const { isLoading } = useMicrosoftAuth();

  // Global Loading State für OAuth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              DSP Shift-Planner
            </h2>
            <p className="text-gray-600">
              Microsoft Authentifizierung läuft...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Page - öffentlich zugänglich */}
      <Route path="/" element={<LoginPage />} />

      {/* Dashboard - nur für authentifizierte DSP-Mitarbeiter */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Attendance Page */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback für unbekannte Routen */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
