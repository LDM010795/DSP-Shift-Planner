/**
 * DSP Shift-Planner App
 *
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut } from "lucide-react";
import PlannerPage from "./pages/PlannerPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";
import TokenReceiver from "./components/TokenReceiver";
import Toast from "./components/Toast";
import { type AvailabilityData, type ScheduleData } from "./lib/utils";

type TabType = "availability" | "schedule";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("availability");
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: string }>
  >([]);

  // Gemeinsamer State für beide Tabellen
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>(
    {}
  );
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});

  const { hasShiftPlannerAccess, isLoading, logout, canManageShifts, user } = useAuth();

  // Admin-Rechte werden aus den Benutzerberechtigungen abgeleitet
  const isAdmin = canManageShifts() || (user?.is_staff ?? false);

  // Token-Sharing: Check für MP-Portal Token in URL (vorher berechnen, kein Hook)
  const urlParams = new URLSearchParams(window.location.search);
  const hasMpToken =
    urlParams.has("mp_token") && urlParams.get("source") === "mp-portal";

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { message, type } = event.detail;
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4000);
    };

    window.addEventListener("showToast", handleShowToast as EventListener);
    return () =>
      window.removeEventListener("showToast", handleShowToast as EventListener);
  }, []);

  // Zeige TokenReceiver wenn MP-Portal Token vorhanden
  if (hasMpToken) {
    return <TokenReceiver />;
  }

  // Auth-Guard jetzt NACH allen Hooks
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Lade...
      </div>
    );
  }

  if (!hasShiftPlannerAccess()) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Simplified Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-dsp-orange to-dsp-orange_medium rounded-xl flex items-center justify-center shadow-md">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Schichtplaner
                  </h1>
                  <p className="text-xs text-gray-500">DSP Personalplanung</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Logout */}
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 rounded-xl text-sm font-medium bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-100 transition-all duration-200"
                title="Abmelden"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Fullscreen */}
      <main className="w-full px-6 lg:px-8 py-6">
        <PlannerPage
          isAdmin={isAdmin}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          availabilityData={availabilityData}
          setAvailabilityData={setAvailabilityData}
          scheduleData={scheduleData}
          setScheduleData={setScheduleData}
          currentTab={activeTab}
          onTabChange={setActiveTab}
        />
      </main>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
