import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Download,
  ChevronLeft,
  ChevronRight,
  Info,
  Eye,
} from "lucide-react";
import { useState, memo, useCallback } from "react";
import type { ScheduleData, AvailabilityData } from "../lib/utils";
import { isBerlinHoliday, getHolidayName, isWeekend } from "../lib/utils";
import { useShallowCallback } from "../lib/performanceUtils";

interface ScheduleTableProps {
  employees: string[];
  dates: string[];
  scheduleData: ScheduleData;
  availabilityData: AvailabilityData;
  onScheduleChange: (
    employee: string,
    date: string,
    shift: "morning" | "evening" | "off" | "holiday" | "custom",
    hours: string
  ) => void;
  isEditable: boolean;
  isAdmin: boolean;
  currentTab: "availability" | "schedule";
  onTabChange: (tab: "availability" | "schedule") => void;
  currentMonth: Date;
  onMonthChange: (direction: "prev" | "next") => void;
}

const ScheduleTable = memo(function ScheduleTable({
  employees,
  dates,
  scheduleData,
  availabilityData,
  onScheduleChange,
  isEditable,
  isAdmin,
  currentTab,
  onTabChange,
  currentMonth,
  onMonthChange,
}: ScheduleTableProps) {
  const [editingCell, setEditingCell] = useState<{
    employee: string;
    date: string;
  } | null>(null);
  const [tempShift, setTempShift] = useState<"morning" | "evening" | "custom">(
    "custom"
  ); // Custom als Standard
  const [tempHours, setTempHours] = useState("");
  const [showLegend, setShowLegend] = useState(false);

  const getShiftColor = (
    shift: "morning" | "evening" | "off" | "holiday" | "custom"
  ) => {
    switch (shift) {
      case "morning":
        return "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200";
      case "evening":
        return "bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200";
      case "holiday":
        return "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200";
      case "custom":
        return "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200";
      case "off":
        return "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
      default:
        return "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
    }
  };

  const getShiftLabel = (
    shift: "morning" | "evening" | "off" | "holiday" | "custom"
  ) => {
    switch (shift) {
      case "morning":
        return "F";
      case "evening":
        return "S";
      case "holiday":
        return "🎉";
      case "custom":
        return "⏰";
      case "off":
        return "-";
      default:
        return "-";
    }
  };

  const getShiftIcon = (
    shift: "morning" | "evening" | "off" | "holiday" | "custom"
  ) => {
    switch (shift) {
      case "morning":
        return "☀️";
      case "evening":
        return "🌅";
      case "holiday":
        return "🎉";
      case "custom":
        return "⏰";
      case "off":
        return "-";
      default:
        return "-";
    }
  };

  const getNextShift = (
    current: "morning" | "evening" | "off" | "holiday" | "custom"
  ): "morning" | "evening" | "off" | "holiday" | "custom" => {
    switch (current) {
      case "morning":
        return "evening";
      case "evening":
        return "custom";
      case "custom":
        return "off";
      case "off":
        return "morning";
      case "holiday":
        return "holiday"; // Feiertage bleiben Feiertage
      default:
        return "morning";
    }
  };

  const getShiftHours = (
    shift: "morning" | "evening" | "off" | "holiday" | "custom"
  ) => {
    switch (shift) {
      case "morning":
        return "8h";
      case "evening":
        return "8h";
      case "custom":
        return "0h"; // Wird vom User eingegeben
      case "off":
        return "0h";
      case "holiday":
        return "0h";
      default:
        return "0h";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const weekday = date.toLocaleDateString("de-DE", { weekday: "short" });
    return { day, weekday };
  };

  const getCellState = (employee: string, date: string) => {
    const availability = availabilityData[employee]?.[date];
    const schedule = scheduleData[employee]?.[date];
    const isHoliday = isBerlinHoliday(date);
    const isWeekendDay = isWeekend(date);

    // Feiertage haben immer Priorität
    if (isHoliday) {
      return {
        shift: "holiday" as const,
        hours: "0h",
        isClickable: false,
        tooltip: `Feiertag: ${getHolidayName(date)}`,
      };
    }

    // Wochenenden sind nicht editierbar
    if (isWeekendDay) {
      return {
        shift: "off" as const,
        hours: "0h",
        isClickable: false,
        tooltip: "Wochenende - nicht editierbar",
      };
    }

    // Keine Verfügbarkeit = nicht klickbar, grau
    if (!availability || availability === "unavailable") {
      return {
        shift: "off" as const,
        hours: "0h",
        isClickable: false,
        tooltip: "Nicht verfügbar",
      };
    }

    // Verfügbar aber keine Schicht geplant = klickbar mit Stift
    if (!schedule) {
      return {
        shift: "off" as const,
        hours: "0h",
        isClickable: isEditable,
        tooltip: "Verfügbar - Klicken um Schicht zu planen",
      };
    }

    // Schicht geplant = klickbar
    return {
      shift: schedule.shift,
      hours: schedule.hours,
      isClickable: isEditable && !isHoliday && !isWeekendDay,
      tooltip: `${getShiftDisplayName(schedule.shift)} - ${schedule.hours}`,
    };
  };

  const getShiftDisplayName = (
    shift: "morning" | "evening" | "off" | "holiday"
  ) => {
    switch (shift) {
      case "morning":
        return "Frühschicht";
      case "evening":
        return "Spätschicht";
      case "holiday":
        return "Feiertag";
      case "off":
        return "Frei";
      default:
        return "Unbekannt";
    }
  };

  // Performance: Optimized cell click handler
  const handleCellClick = useShallowCallback(
    (employee: string, date: string) => {
      const cellState = getCellState(employee, date);

      if (!cellState.isClickable) return;

      // Für Feiertage: keine Aktion
      if (isBerlinHoliday(date)) return;

      if (cellState.shift === "off" && cellState.isClickable) {
        // Neuen Termin planen
        setEditingCell({ employee, date });
        setTempShift("custom"); // Standard auf custom setzen
        setTempHours("8");
      } else {
        // Existierende Schicht durchschalten (ohne holiday)
        const nextShift = getNextShift(cellState.shift);
        if (nextShift !== "holiday") {
          onScheduleChange(
            employee,
            date,
            nextShift as any,
            getShiftHours(nextShift)
          );
        }
      }
    },
    [onScheduleChange, tempShift, tempHours]
  );

  // Performance: Optimized edit handlers
  const handleSaveEdit = useCallback(() => {
    if (!editingCell) return;

    onScheduleChange(
      editingCell.employee,
      editingCell.date,
      tempShift,
      tempHours
    );
    setEditingCell(null);
  }, [editingCell, tempShift, tempHours, onScheduleChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setTempShift("custom"); // Zurück auf custom
    setTempHours("");
  }, []);

  return (
    <div className="space-y-0">
      {/* Compact Header with controls */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 border-b-0 p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <Download className="w-3 h-3" />
              <span>Exportieren</span>
            </button>

            {/* Admin/Mitarbeiter Indikator */}
            {isAdmin ? (
              <div className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-gradient-to-r from-dsp-orange to-dsp-orange_medium text-white rounded-lg">
                <Edit className="w-3 h-3" />
                <span>Admin-Modus</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg">
                <Eye className="w-3 h-3" />
                <span>Ansicht</span>
              </div>
            )}
          </div>
        </div>

        {/* Month Navigation and Legend */}
        <div className="flex items-center justify-between">
          {/* Month Navigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onMonthChange("prev")}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
              {currentMonth.toLocaleDateString("de-DE", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() => onMonthChange("next")}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Legend Button */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <Info className="w-3 h-3" />
            <span>Schichtarten & Zeiten</span>
          </button>
        </div>

        {/* Legend Popup */}
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Schichtarten & Zeiten:
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-700">F</span>
                </div>
                <span className="text-gray-700">Frühschicht (08:00-16:00)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-700">S</span>
                </div>
                <span className="text-gray-700">Spätschicht (16:00-00:00)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">⏰</span>
                </div>
                <span className="text-gray-700">
                  Flexible Zeit (individuelle Stunden)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded flex items-center justify-center">
                  <span className="text-xs">🎉</span>
                </div>
                <span className="text-gray-700">
                  Feiertag (Berliner Feiertage)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">-</span>
                </div>
                <span className="text-gray-700">Frei</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                <span className="text-gray-700">
                  Wochenende (nicht editierbar)
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Table with rounded bottom corners */}
      <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl border border-gray-200/50 border-t-0 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {currentTab === "schedule" && (
            <motion.div
              key="schedule-table"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-x-auto"
            >
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200/50">
                  <tr>
                    <th className="sticky left-0 z-20 bg-gray-50/80 backdrop-blur-sm px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200/50 min-w-[200px]">
                      Mitarbeiter
                    </th>
                    {dates.map((date) => {
                      const { day, weekday } = formatDate(date);
                      const isWeekend =
                        new Date(date).getDay() === 0 ||
                        new Date(date).getDay() === 6;
                      const isHoliday = isBerlinHoliday(date);
                      const holidayName = getHolidayName(date);

                      return (
                        <th
                          key={date}
                          className={`px-3 py-4 text-center text-sm font-semibold min-w-[70px] transition-colors duration-200 ${
                            isHoliday
                              ? "text-purple-700 bg-purple-100/50"
                              : isWeekend
                              ? "text-red-600 bg-red-50/60"
                              : "text-gray-900"
                          }`}
                          title={
                            isHoliday ? holidayName || "Feiertag" : undefined
                          }
                        >
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-500 font-normal">
                              {weekday}
                            </span>
                            <span className="text-sm font-bold">{day}</span>
                            {isHoliday && (
                              <span className="text-xs text-purple-600 font-medium">
                                🎉
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {employees.map((employee, employeeIndex) => (
                    <tr
                      key={employee}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="sticky left-0 z-10 bg-white/90 backdrop-blur-sm px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-dsp-orange to-dsp-orange_medium rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {employee
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span>{employee}</span>
                        </div>
                      </td>
                      {dates.map((date) => {
                        const cellState = getCellState(employee, date);
                        const isWeekend =
                          new Date(date).getDay() === 0 ||
                          new Date(date).getDay() === 6;
                        const isHoliday = isBerlinHoliday(date);

                        return (
                          <td
                            key={`${employee}-${date}`}
                            className={`px-2 py-3 ${
                              isHoliday
                                ? "bg-purple-100/30"
                                : isWeekend
                                ? "bg-red-50/40"
                                : ""
                            }`}
                          >
                            <motion.button
                              onClick={() => handleCellClick(employee, date)}
                              whileHover={
                                cellState.isClickable
                                  ? {
                                      scale: 1.05,
                                      y: -1,
                                    }
                                  : {}
                              }
                              whileTap={
                                cellState.isClickable ? { scale: 0.95 } : {}
                              }
                              className={`w-full h-10 rounded-xl border-2 transition-all duration-200 flex items-center justify-center font-bold text-sm shadow-sm relative ${
                                cellState.isClickable
                                  ? "hover:shadow-md cursor-pointer"
                                  : "cursor-not-allowed"
                              } ${getShiftColor(cellState.shift)}`}
                              title={cellState.tooltip}
                              disabled={!cellState.isClickable}
                            >
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={cellState.shift}
                                className="text-lg"
                              >
                                {getShiftLabel(cellState.shift)}
                              </motion.span>

                              {/* Edit Icon für verfügbare aber ungeplante Schichten */}
                              {cellState.isClickable &&
                                cellState.shift === "off" &&
                                !isHoliday && (
                                  <Edit className="w-3 h-3 absolute top-1 right-1 text-dsp-orange" />
                                )}

                              {/* Stunden-Anzeige */}
                              {cellState.shift !== "off" &&
                                cellState.shift !== "holiday" && (
                                  <span className="absolute bottom-0 right-1 text-xs text-gray-500">
                                    {cellState.hours}
                                  </span>
                                )}
                            </motion.button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile-friendly note */}
              <div className="md:hidden p-4 bg-blue-50/50 border-t border-gray-200/50">
                <p className="text-xs text-blue-600 text-center">
                  💡 Tipp: Drehen Sie Ihr Gerät für eine bessere Tabellenansicht
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editing Popup - außerhalb der Tabelle */}
        {editingCell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleCancelEdit}
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
                    Mitarbeiter: {editingCell.employee}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum:{" "}
                    {new Date(editingCell.date).toLocaleDateString("de-DE")}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schicht-Art
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Custom Zeit - Standard Option */}
                    <button
                      onClick={() => {
                        setTempShift("custom");
                        if (!tempHours) setTempHours("8");
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        tempShift === "custom"
                          ? "border-blue-400 bg-blue-50 text-blue-800"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg">⏰</div>
                        <div className="text-sm font-medium">Flexible Zeit</div>
                        <div className="text-xs text-gray-500">
                          Eigene Stunden eingeben
                        </div>
                      </div>
                    </button>

                    {/* Vordefinierte Schichten */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setTempShift("morning");
                          setTempHours("8");
                        }}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                          tempShift === "morning"
                            ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg">☀️</div>
                          <div className="text-sm font-medium">Frühschicht</div>
                          <div className="text-xs text-gray-500">
                            08:00-16:00
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setTempShift("evening");
                          setTempHours("8");
                        }}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                          tempShift === "evening"
                            ? "border-orange-400 bg-orange-50 text-orange-800"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg">🌅</div>
                          <div className="text-sm font-medium">Spätschicht</div>
                          <div className="text-xs text-gray-500">
                            16:00-00:00
                          </div>
                        </div>
                      </button>
                    </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
                    placeholder="8"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {tempShift === "custom"
                      ? "Geben Sie die gewünschte Stundenzahl ein"
                      : "Standardwerte können angepasst werden"}
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-dsp-orange to-dsp-orange_medium text-white rounded-xl hover:opacity-90 transition-opacity duration-200"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

export default ScheduleTable;
