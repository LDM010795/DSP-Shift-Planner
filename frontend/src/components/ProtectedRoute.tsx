/**
 * ProtectedRoute für DSP Shift-Planner
 *
 * Schützt Routen und stellt sicher, dass nur authentifizierte DSP-Mitarbeiter Zugriff haben
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresManagement?: boolean; // Optional: Erfordert Management-Berechtigung
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresManagement = false,
}) => {
  const { isAuthenticated, isLoading, hasShiftPlannerAccess, canManageShifts } =
    useAuth();

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Überprüfe Berechtigung...</p>
        </div>
      </div>
    );
  }

  // WICHTIG: Erneut prüfen nach dem Laden, da sich der Zustand geändert haben könnte.
  if (!isAuthenticated || !hasShiftPlannerAccess()) {
    return <Navigate to="/" replace />;
  }

  // Management-Berechtigung erforderlich, aber nicht vorhanden
  if (requiresManagement && !canManageShifts()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Management-Berechtigung erforderlich
            </h2>
            <p className="text-gray-600 mb-6">
              Diese Funktion ist nur für Mitarbeiter mit Management-Berechtigung
              verfügbar.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-dsp-orange to-dsp-orange_medium text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Alle Checks bestanden - Zeige geschützte Route
  return <>{children}</>;
};

export default ProtectedRoute;
