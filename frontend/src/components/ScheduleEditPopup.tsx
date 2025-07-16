import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface ScheduleEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee: string;
  date: string;
  tempShift: "morning" | "evening" | "off" | "holiday" | "custom";
  setTempShift: (
    shift: "morning" | "evening" | "off" | "holiday" | "custom"
  ) => void;
  tempHours: string;
  setTempHours: (hours: string) => void;
  tempActivity: "TA" | "D" | "D/TA" | "";
  setTempActivity: (activity: "TA" | "D" | "D/TA" | "") => void;
  tempGroups: string;
  setTempGroups: (groups: string) => void;
}

const ScheduleEditPopup = ({
  isOpen,
  onClose,
  onSave,
  employee,
  date,
  tempShift,
  setTempShift,
  tempHours,
  setTempHours,
  tempActivity,
  setTempActivity,
  tempGroups,
  setTempGroups,
}: ScheduleEditPopupProps) => {
  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[150]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Schicht planen
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mitarbeiter: {employee}
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datum: {new Date(date).toLocaleDateString("de-DE")}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schicht-Art
            </label>
            <div className="grid grid-cols-1 gap-3">
              {/* Keine Angabe */}
              <button
                onClick={() => {
                  if (tempShift === "off") {
                    // Toggle zurück zu custom
                    setTempShift("custom");
                    setTempHours("8");
                    setTempActivity("");
                    setTempGroups("");
                  } else {
                    // Setze auf off
                    setTempShift("off");
                    setTempHours("0");
                    setTempActivity("");
                    setTempGroups("");
                  }
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  tempShift === "off"
                    ? "border-gray-400 bg-gray-50 text-gray-800"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg">-</div>
                  <div className="text-sm font-medium">Keine Angabe</div>
                  <div className="text-xs text-gray-500">Feld leeren</div>
                </div>
              </button>

              {/* Activity Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    if (tempActivity === "TA") {
                      setTempActivity("");
                    } else if (tempActivity === "D/TA") {
                      setTempActivity("D");
                    } else {
                      setTempActivity("TA");
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    tempActivity === "TA" || tempActivity === "D/TA"
                      ? "border-blue-400 bg-blue-50 text-blue-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">TA</div>
                    <div className="text-xs text-gray-500">Teaching Assist</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (tempActivity === "D") {
                      setTempActivity("");
                    } else if (tempActivity === "D/TA") {
                      setTempActivity("TA");
                    } else {
                      setTempActivity("D");
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    tempActivity === "D" || tempActivity === "D/TA"
                      ? "border-green-400 bg-green-50 text-green-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">D</div>
                    <div className="text-xs text-gray-500">Dozent</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setTempActivity("D/TA");
                  }}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    tempActivity === "D/TA"
                      ? "border-purple-400 bg-purple-50 text-purple-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">D/TA</div>
                    <div className="text-xs text-gray-500">Beide</div>
                  </div>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Wählen Sie eine Tätigkeit oder D/TA für beide
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stunden
            </label>
            <input
              type="number"
              min="0"
              max="12"
              step="0.5"
              value={tempHours}
              onChange={(e) => setTempHours(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
              placeholder="8"
            />
            <p className="text-xs text-gray-500 mt-1">
              {tempShift === "custom"
                ? "Geben Sie die gewünschte Stundenzahl ein"
                : "Standardwerte können angepasst werden"}
            </p>
          </div>

          {/* Groups Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gruppen (optional)
            </label>
            <input
              type="text"
              value={tempGroups}
              onChange={(e) => setTempGroups(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
              placeholder="z.B. 5 / 6 / 7"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optionale Gruppenangabe (z.B. "5 / 6 / 7")
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Abbrechen
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-dsp-orange to-dsp-orange_medium text-white rounded-xl hover:opacity-90 transition-opacity duration-200"
            >
              Speichern
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ScheduleEditPopup;
