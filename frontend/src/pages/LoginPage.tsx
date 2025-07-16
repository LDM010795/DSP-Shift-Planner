import { motion } from "framer-motion";
import { useMicrosoftAuth } from "../hooks/useMicrosoftAuth";

export default function LoginPage() {
  const { loginWithMicrosoft, isLoading, error, clearError } =
    useMicrosoftAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          DSP Schichtplaner Login
        </h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            <p className="text-sm">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-xs text-red-600 underline"
            >
              Fehler ausblenden
            </button>
          </div>
        )}

        <button
          onClick={loginWithMicrosoft}
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? "Weiterleitung..." : "Mit Microsoft anmelden"}
        </button>
      </motion.div>
    </div>
  );
}
