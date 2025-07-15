/**
 * Login-Seite für DSP Shift-Planner
 *
 * Ausschließlich Microsoft Organization Authentication für DSP-Mitarbeiter
 */

import React, { useState } from "react";
import { Calendar, Shield, Building } from "lucide-react";
import MicrosoftLoginButton from "../components/MicrosoftLoginButton";
import { useMicrosoftAuth } from "../hooks/useMicrosoftAuth";

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { isLoading } = useMicrosoftAuth();

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-dsp-orange-light border-t-dsp-orange mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Anmeldung läuft...
            </h2>
            <p className="text-gray-600 text-sm">
              Sie werden mit Microsoft authentifiziert und Ihre
              Mitarbeiterberechtigung wird geprüft.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-dsp-orange rounded-lg mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            DSP Shift-Planner
          </h1>
          <p className="text-gray-600 text-sm">
            Internes Schichtmanagement-Tool
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Mitarbeiter-Anmeldung
            </h3>
            <p className="text-gray-600 text-sm">Nur für DSP-Mitarbeiter</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="ml-3 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Microsoft Login */}
          <div className="space-y-4">
            <MicrosoftLoginButton
              onError={handleLoginError}
              onSuccess={() => setError(null)}
            />

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Bei Problemen wenden Sie sich an den Administrator.
              </p>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-dsp-orange-light rounded-md p-3">
              <div className="flex items-start">
                <Shield className="w-4 h-4 text-dsp-orange mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Sicherheitshinweis
                  </h4>
                  <p className="text-xs text-gray-700 mt-1">
                    Zugriff nur über DSP Microsoft-Konto.
                    Mitarbeiterberechtigung wird automatisch überprüft.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            DataSmartPoint GmbH - Internes Tool
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
