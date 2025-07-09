/**
 * React Hook für Microsoft Organization Authentication im Shift-Planner
 *
 * Integriert Employee-Validation für DSP Mitarbeiter
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  startMicrosoftLogin,
  authenticateWithMicrosoft,
  extractCallbackFromUrl,
  cleanupUrlAfterAuth,
} from "../util/apis/microsoft_auth";

interface UseMicrosoftAuthReturn {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginWithMicrosoft: () => void; // Geändert zu void, da kein Promise mehr zurückgegeben wird
  handleMicrosoftCallback: () => Promise<void>;
  clearError: () => void;
  resetOAuthSession: () => void;
}

export const useMicrosoftAuth = (): UseMicrosoftAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, setAuthTokens, setUser, setEmployee } = useAuth();

  // React StrictMode Protection: Verhindert doppelte OAuth-Callback-Verarbeitung
  const callbackProcessedRef = useRef(false);

  /**
   * Startet den Microsoft Login-Flow für Shift-Planner
   */
  const loginWithMicrosoft = useCallback((): void => {
    setIsLoading(true);
    setError(null);
    // Direkte Navigation zur Backend-Login-URL
    startMicrosoftLogin();
  }, []);

  /**
   * Verarbeitet Microsoft OAuth2 Callback nach Redirect
   */
  const handleMicrosoftCallback = useCallback(async (): Promise<void> => {
    if (callbackProcessedRef.current) {
      console.log("OAuth Callback wird bereits verarbeitet, überspringe.");
      return;
    }
    callbackProcessedRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      const {
        code,
        state,
        error: urlError,
        errorDescription,
      } = extractCallbackFromUrl();

      if (urlError) {
        throw new Error(errorDescription || urlError);
      }

      if (!code || !state) {
        // Normaler Seitenaufruf ohne OAuth-Parameter, nichts tun.
        setIsLoading(false);
        return;
      }

      // Annahme für dieses Projekt
      const effectiveToolSlug = "shift-planner";

      console.log(`🚀 Starte Microsoft Authentication für Tool: ${effectiveToolSlug}...`);

      const authResponse = await authenticateWithMicrosoft({
        code,
        state,
        tool_slug: effectiveToolSlug,
      });

      if (!authResponse.success) {
        throw new Error(authResponse.message || "Microsoft authentication failed");
      }

      // Alle Validierungen (Employee-Existenz, Tool-Zugriff) passieren jetzt im Backend.
      // Wir vertrauen der Antwort des Backends.
      const { tokens, user, employee_info } = authResponse;

      setAuthTokens({ access: tokens.access, refresh: tokens.refresh });
      setUser(user);
      if (employee_info) {
        setEmployee(employee_info);
      }

      cleanupUrlAfterAuth();
      console.log("✅ Shift-Planner Authentication successful.");

      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication callback failed";
      setError(errorMessage);
      console.error("❌ Shift-Planner auth callback error:", err);
      cleanupUrlAfterAuth();
      navigate("/"); // Bei Fehler zurück zur Login-Seite
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setAuthTokens, setUser, setEmployee]);

  /**
   * Automatische Callback-Behandlung bei Page Load
   */
  useEffect(() => {
    // StrictMode-sichere Überprüfung, um doppelte Ausführung zu verhindern
    const sessionKey = "shift_planner_oauth_processed";
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const { code, state } = extractCallbackFromUrl();
    if (code && state && !isAuthenticated) {
      // Setze den Lock sofort, bevor der asynchrone Call startet
      sessionStorage.setItem(sessionKey, "true");
      handleMicrosoftCallback();
    }
  }, [handleMicrosoftCallback, isAuthenticated]);

  /**
   * Fehler zurücksetzen
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Reset OAuth Session State (für Logout)
   * Ermöglicht erneuten Login nach Logout
   */
  const resetOAuthSession = useCallback((): void => {
    callbackProcessedRef.current = false;
    sessionStorage.removeItem("shift_planner_oauth_processed");
    console.log("🧹 Shift-Planner OAuth Session State zurückgesetzt");
  }, []);

  return {
    isLoading,
    error,
    isAuthenticated,
    loginWithMicrosoft,
    handleMicrosoftCallback,
    clearError,
    resetOAuthSession,
  };
};
