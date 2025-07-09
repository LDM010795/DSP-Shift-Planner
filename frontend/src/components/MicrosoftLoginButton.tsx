/**
 * Microsoft Organization Login Button für DSP Shift-Planner
 *
 * Sicherer Button für Microsoft Organization Authentication mit Employee-Validation
 */

import React from "react";
import { useMicrosoftAuth } from "../hooks/useMicrosoftAuth";

interface MicrosoftLoginButtonProps {
  className?: string;
  disabled?: boolean;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

const MicrosoftLoginButton: React.FC<MicrosoftLoginButtonProps> = ({
  className = "",
  disabled = false,
  onError,
  onSuccess,
}) => {
  const { isLoading, error, loginWithMicrosoft, clearError } = useMicrosoftAuth();

  const handleMicrosoftLogin = async (): Promise<void> => {
    try {
      clearError();
      await loginWithMicrosoft();
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Microsoft login failed";
      onError?.(errorMessage);
    }
  };

  // Fehlerbehandlung
  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  return (
    <button
      type="button"
      onClick={handleMicrosoftLogin}
      disabled={disabled || isLoading}
      className={`
        flex items-center justify-center gap-3 w-full px-6 py-4 
        bg-white border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl
        hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-blue-200
        transition-all duration-200 ease-in-out
        text-gray-800 font-semibold text-lg
        ${className}
      `}
      aria-label="Mit Microsoft anmelden"
    >
      {/* Microsoft Logo */}
      <svg
        className="w-6 h-6"
        viewBox="0 0 23 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="12" y="1" width="10" height="10" fill="#00A4EF" />
        <rect x="1" y="12" width="10" height="10" fill="#00BCF2" />
        <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
      </svg>

      {/* Button Text */}
      <span>
        {isLoading ? "Anmeldung läuft..." : "Mit Microsoft anmelden"}
      </span>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-300 border-t-blue-600"></div>
      )}
    </button>
  );
};

export default MicrosoftLoginButton; 