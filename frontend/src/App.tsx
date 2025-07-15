/**
 * DSP Shift-Planner App
 *
 * Hauptanwendung mit Microsoft Organization Authentication und Employee-Integration
 * Unterstützt Token-Sharing von MP-Portal für Single Sign-On
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import PlannerPage from "./pages/PlannerPage";
import TokenReceiver from "./components/TokenReceiver";
import Toast from "./components/Toast";
import { type AvailabilityData, type ScheduleData } from "./lib/utils";

type TabType = "availability" | "schedule";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("availability");
  const [isAdmin, setIsAdmin] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: string }>
  >([]);

  // Gemeinsamer State für beide Tabellen
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>(
    {}
  );
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});

  // Token-Sharing: Check für MP-Portal Token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasMpToken = urlParams.has('mp_token') && urlParams.get('source') === 'mp-portal';

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
              <motion.button
                onClick={() => setIsAdmin(!isAdmin)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isAdmin
                    ? "bg-gradient-to-r from-dsp-orange to-dsp-orange_medium text-white shadow-md hover:opacity-90"
                    : "bg-white text-dsp-orange border-2 border-dsp-orange hover:bg-dsp-orange_light"
                }`}
              >
                {isAdmin ? "👑 Admin Modus" : "👤 Mitarbeiter Modus"}
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
