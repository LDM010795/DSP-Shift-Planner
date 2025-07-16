/**
 * Token Receiver Component - Shift-Planner
 *
 * Empfängt und verarbeitet Authentication Tokens von MP-Portal.
 * Ermöglicht nahtloses Single Sign-On zwischen DSP Frontends.
 *
 * Features:
 * - Token-Extraktion aus URL-Parametern
 * - Automatische User-Authentifizierung
 * - Sichere Token-Speicherung
 * - Error Handling und Fallback
 *
 * Author: DSP Development Team
 * Created: 12.07.2025
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface TokenReceiverProps {
  onTokenReceived?: (token: string, userInfo: UserInfo) => void;
  onError?: (error: string) => void;
}

const TokenReceiver: React.FC<TokenReceiverProps> = ({
  onTokenReceived,
  onError,
}) => {
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState<string>("Token wird verarbeitet...");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    processUrlToken();
  }, []);

  const processUrlToken = async (): Promise<void> => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const mpToken = urlParams.get("mp_token");
      const source = urlParams.get("source");

      // Validiere dass Token von MP-Portal kommt
      if (!mpToken || source !== "mp-portal") {
        throw new Error("Kein gültiger MP-Portal Token gefunden");
      }

      // Validiere Token mit Backend
      await validateToken(mpToken);
    } catch (err) {
      console.error("Token processing failed:", err);
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Token-Verarbeitung fehlgeschlagen"
      );

      if (onError) {
        onError(err instanceof Error ? err.message : "Unknown error");
      }
    }
  };

  const validateToken = async (token: string): Promise<void> => {
    try {
      setMessage("Token wird validiert...");

      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

      // Sende Token an Backend zur Validierung
      const response = await fetch(`${backendUrl}/api/auth/validate-token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.error || "Token-Validierung fehlgeschlagen");
      }

      // Speichere validierte Daten
      localStorage.setItem("shift_planner_access_token", token);
      localStorage.setItem("shift_planner_user", JSON.stringify(data.user));
      localStorage.setItem(
        "shift_planner_employee",
        JSON.stringify(data.employee_info)
      );

      setUserInfo(data.user);
      setStatus("success");
      setMessage("Erfolgreich authentifiziert!");

      // Callback für Parent-Komponente
      if (onTokenReceived && data.user) {
        onTokenReceived(token, data.user);
      }

      // Auto-redirect nach kurzer Delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      console.error("Token validation failed:", err);
      throw err;
    }
  };

  /**
   * Navigiert zurück zum MP-Portal
   */
  const handleBackToPortal = (): void => {
    const portalUrl = "http://localhost:5173"; // MP-Portal URL
    window.location.href = portalUrl;
  };

  /**
   * Versucht Token-Verarbeitung erneut
   */
  const handleRetry = (): void => {
    setStatus("processing");
    processUrlToken();
  };

  const renderStatusIcon = () => {
    switch (status) {
      case "processing":
        return (
          <div className="w-16 h-16 border-4 border-dsp-orange/30 border-t-dsp-orange rounded-full animate-spin" />
        );
      case "success":
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        );
      case "error":
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsp-blue-50 to-dsp-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-dsp-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-dsp-orange" />
          </div>
          <h1 className="text-2xl font-bold text-dsp-gray-900 mb-2">
            Token-Verarbeitung
          </h1>
          <p className="text-dsp-gray-600">
            Ihre Anmeldung wird verarbeitet...
          </p>
        </div>

        {/* Status Content */}
        <div className="text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">{renderStatusIcon()}</div>

          {/* Status Message */}
          <p className="text-dsp-gray-600 mb-6">{message}</p>

          {/* User Info (bei Erfolg) */}
          {status === "success" && userInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <p className="text-green-800 font-medium">
                Willkommen, {userInfo.first_name} {userInfo.last_name}
              </p>
              <p className="text-green-600 text-sm">{userInfo.email}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === "error" && (
              <>
                <button
                  onClick={handleRetry}
                  className="w-full bg-dsp-orange text-white py-3 px-6 rounded-lg font-medium hover:bg-dsp-orange/90 transition-colors"
                >
                  Erneut versuchen
                </button>
                <button
                  onClick={handleBackToPortal}
                  className="w-full flex items-center justify-center space-x-2 text-dsp-gray-600 hover:text-dsp-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Zurück zum Portal</span>
                </button>
              </>
            )}

            {status === "success" && (
              <div className="text-sm text-dsp-gray-500">
                Sie werden automatisch weitergeleitet...
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TokenReceiver;
