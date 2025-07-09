/**
 * Login-Seite für DSP Shift-Planner
 *
 * Ausschließlich Microsoft Organization Authentication für DSP-Mitarbeiter
 */

import React, { useState } from "react";
import { Calendar, Users, Clock, Shield, Building } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Anmeldung läuft...
            </h2>
            <p className="text-gray-600">
              Sie werden mit Microsoft authentifiziert und Ihre
              Mitarbeiterberechtigung wird geprüft.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="pt-8 pb-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DSP Shift-Planner
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Intelligente Schichtplanung für DSP-Mitarbeiter
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 pb-8">
        <div className="max-w-4xl w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Features Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Modernes Schichtmanagement
                </h2>
                <p className="text-gray-600 mb-6">
                  Optimieren Sie Ihre Arbeitsplanung mit unserem intelligenten
                  Shift-Planner, der speziell für DSP-Mitarbeiter entwickelt
                  wurde.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Team-Koordination
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Koordinieren Sie Schichten mit Ihren Kollegen und
                      vermeiden Sie Überschneidungen.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Stundentracking
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Automatische Überwachung Ihrer maximalen Arbeitsstunden
                      basierend auf Ihrem Mitarbeiterprofil.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Sichere Authentifizierung
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Zugriff nur für registrierte DSP-Mitarbeiter über
                      Microsoft Organization Account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Abteilungsbasiert
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Planung berücksichtigt automatisch Ihre Abteilung und
                      Position im Unternehmen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Section */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Anmeldung
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Melden Sie sich mit Ihrem DSP Microsoft-Konto an
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Shield className="w-5 h-5 text-red-600" />
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
                      Nur für registrierte DSP-Mitarbeiter.
                      <br />
                      Bei Problemen wenden Sie sich an Ihren Administrator.
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-900">
                          Sicherheitshinweis
                        </h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Der Zugriff erfolgt über Ihr DSP Microsoft-Konto. Ihre
                          Mitarbeiterberechtigung wird automatisch überprüft.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-sm text-gray-500">
          © 2024 DataSmartPoint GmbH - Shift-Planner
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
