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
import ScheduleEditPopup from "./ScheduleEditPopup";

interface ScheduleTableProps {
  employees: string[];
  dates: string[];
  scheduleData: ScheduleData;
  availabilityData: AvailabilityData;
  onScheduleChange: (
    employee: string,
    date: string,
    shift: "morning" | "evening" | "off" | "holiday" | "custom",
    hours: string,
    activity?: "TA" | "D" | "D/TA" | "",
    groups?: string
  ) => void;
  isEditable: boolean;
  isAdmin: boolean;
  currentUser: string;
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
  currentUser,
  currentTab,
  onTabChange,
  currentMonth,
  onMonthChange,
}: ScheduleTableProps) {
  const [editingCell, setEditingCell] = useState<{
    employee: string;
    date: string;
  } | null>(null);
  const [tempShift, setTempShift] = useState<
    "morning" | "evening" | "off" | "holiday" | "custom"
  >("custom");
  const [tempHours, setTempHours] = useState<string>("");
  const [tempActivity, setTempActivity] = useState<"TA" | "D" | "D/TA" | "">(
    ""
  );
  const [tempGroups, setTempGroups] = useState<string>("");
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

  // HINZUFÜGUNG: Stunden-Mapping & Helfer für Überstunden-Berechnung
  const SHIFT_HOURS: Record<
    "morning" | "evening" | "off" | "holiday" | "custom",
    number
  > = {
    morning: 8,
    evening: 8,
    off: 0,
    holiday: 0,
    custom: 0, // Wird durch individuelle Stunden überschrieben
  };

  // Hilfsfunktion: Bestimme Montag der Kalenderwoche als eindeutigen Key (YYYY-MM-DD)
  const getWeekKey = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDay(); // Sonntag=0, Montag=1, ...
    const diff = (day + 6) % 7; // Tage seit Montag
    const monday = new Date(date);
    monday.setDate(date.getDate() - diff);
    return monday.toISOString().split("T")[0];
  };

  const calculateWeeklyTotals = (employee: string): number[] => {
    const empSchedule = scheduleData[employee] || {};
    const weeklyTotals: Record<string, number> = {};

    dates.forEach((dateStr) => {
      const schedule = empSchedule[dateStr];
      let hours = 0;
      if (schedule) {
        if (schedule.shift === "custom") {
          const parsed = parseFloat(schedule.hours);
          if (!isNaN(parsed)) hours = parsed;
        } else {
          hours = SHIFT_HOURS[schedule.shift] ?? 0;
        }
      }

      const weekKey = getWeekKey(dateStr);
      weeklyTotals[weekKey] = (weeklyTotals[weekKey] || 0) + hours;
    });

    return Object.values(weeklyTotals);
  };

  const getMaxHours = (employee: string): number => {
    // Beispiel-Logik für Teilzeitkräfte – nach Bedarf anpassen
    if (
      employee.includes("Tom") ||
      employee.includes("Jan") ||
      employee.includes("Emma")
    ) {
      return 25;
    }
    return 40; // Standard Vollzeit
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

    // Feiertage haben immer Priorität – weiterhin nicht editierbar
    if (isHoliday) {
      return {
        shift: "holiday" as const,
        hours: "0h",
        isClickable: false,
        tooltip: `Feiertag: ${getHolidayName(date)}`,
      };
    }

    // Wochenende: Für Admins editierbar, sonst gesperrt
    if (isWeekendDay) {
      return {
        shift: schedule?.shift ?? "off",
        hours: schedule?.hours ?? "0h",
        isClickable: isAdmin, // nur Admins dürfen
        tooltip: isAdmin
          ? "Wochenende – klick zum Planen"
          : "Wochenende - nicht editierbar",
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
    shift: "morning" | "evening" | "off" | "holiday" | "custom"
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
      case "custom":
        return "Flexible Zeit";
      default:
        return "Unbekannt";
    }
  };

  // Performance: Optimized cell click handler
  const handleCellClick = useCallback(
    (employee: string, date: string) => {
      const cellState = getCellState(employee, date);

      if (!cellState.isClickable) return;

      // Für Feiertage: keine Aktion
      if (isBerlinHoliday(date)) return;

      // Immer Popup öffnen, damit Werte angepasst werden können
      setEditingCell({ employee, date });

      // Vorbelegen mit aktuellem Zustand oder Defaults
      if (cellState.shift === "off") {
        setTempShift("custom");
        setTempHours("8");
        setTempActivity("");
        setTempGroups("");
      } else {
        setTempShift(cellState.shift as any);
        setTempHours(cellState.hours.replace("h", ""));
        // Hole aktuelle Werte aus scheduleData
        const currentSchedule = scheduleData[employee]?.[date];
        setTempActivity(currentSchedule?.activity || "");
        setTempGroups(currentSchedule?.groups || "");
      }
    },
    [onScheduleChange]
  );

  // Performance: Optimized edit handlers
  const handleSaveEdit = useCallback(() => {
    if (!editingCell) return;

    onScheduleChange(
      editingCell.employee,
      editingCell.date,
      tempShift,
      tempHours,
      tempActivity,
      tempGroups
    );
    setEditingCell(null);
  }, [
    editingCell,
    tempShift,
    tempHours,
    tempActivity,
    tempGroups,
    onScheduleChange,
  ]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setTempShift("custom"); // Zurück auf custom
    setTempHours("");
    setTempActivity("");
    setTempGroups("");
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
                              ? "text-gray-500 bg-gray-100/50"
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
                    {/* NEUE Kopfzeile für Wochenstunden */}
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-[130px] border-l border-gray-200/50">
                      Ø&nbsp;Wochen­stunden
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {employees.map((employee, employeeIndex) => {
                    // Map WeekKey -> hours to ermitteln, welche Wochen Überstunden haben
                    const weekHours: Record<string, number> = {};
                    dates.forEach((d) => {
                      const weekKey = getWeekKey(d);
                      const sched = scheduleData[employee]?.[d];
                      let hrs = 0;
                      if (sched) {
                        if (sched.shift === "custom") {
                          const p = parseFloat(sched.hours);
                          if (!isNaN(p)) hrs = p;
                        } else {
                          hrs = SHIFT_HOURS[sched.shift];
                        }
                      }
                      weekHours[weekKey] = (weekHours[weekKey] || 0) + hrs;
                    });

                    const maxHours = getMaxHours(employee);
                    const overtimeWeeks = new Set(
                      Object.entries(weekHours)
                        .filter(([, h]) => h > maxHours)
                        .map(([k]) => k)
                    );

                    const isOvertime = overtimeWeeks.size > 0;
                    const averageWeekly =
                      Object.values(weekHours).length > 0
                        ? Object.values(weekHours).reduce((a, b) => a + b, 0) /
                          Object.values(weekHours).length
                        : 0;

                    return (
                      <tr
                        key={employee}
                        className={`transition-colors duration-200 ${
                          employee === currentUser
                            ? "bg-dsp-orange/10 hover:bg-dsp-orange/20"
                            : "hover:bg-dsp-orange/5"
                        }`}
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
                          const weekKey = getWeekKey(date);
                          const isOverWeek = overtimeWeeks.has(weekKey);
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
                                  ? "bg-gray-200/40"
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
                                className={`w-full h-20 rounded-xl border-2 transition-all duration-200 flex items-center justify-center font-bold text-sm shadow-sm relative ${
                                  cellState.isClickable
                                    ? "hover:shadow-md cursor-pointer"
                                    : "cursor-not-allowed"
                                } ${getShiftColor(cellState.shift)} ${
                                  isWeekend && cellState.shift === "off"
                                    ? "bg-gray-200 border-gray-300 text-gray-600"
                                    : ""
                                } ${
                                  isAdmin && isOverWeek
                                    ? "ring-2 ring-red-400"
                                    : ""
                                }`}
                                title={cellState.tooltip}
                                disabled={!cellState.isClickable}
                              >
                                {/* 3-EBENEN DESIGN: Activity (oben), Groups (mitte), Hours (unten) */}
                                <div className="flex flex-col items-center justify-center w-full h-full text-center">
                                  {/* EBENE 1: Activity/Role Label (Oben) */}
                                  <span className="text-sm font-bold mb-1">
                                    {scheduleData[employee]?.[date]?.activity ||
                                      getShiftLabel(cellState.shift)}
                                  </span>

                                  {/* EBENE 2: Groups (Mitte) */}
                                  {cellState.shift !== "off" &&
                                    cellState.shift !== "holiday" && (
                                      <div className="mb-1 px-2 py-0.5 bg-white bg-opacity-50 rounded text-xs font-medium">
                                        {scheduleData[employee]?.[date]
                                          ?.groups || "-"}
                                      </div>
                                    )}

                                  {/* EBENE 3: Hours (Unten) */}
                                  {cellState.shift !== "off" &&
                                    cellState.shift !== "holiday" && (
                                      <span className="text-xs opacity-75">
                                        {cellState.hours}
                                      </span>
                                    )}
                                </div>

                                {/* Edit Icon für verfügbare aber ungeplante Schichten */}
                                {cellState.isClickable &&
                                  cellState.shift === "off" &&
                                  !isHoliday &&
                                  !isWeekend && (
                                    <Edit className="w-3 h-3 absolute top-1 right-1 text-dsp-orange" />
                                  )}
                              </motion.button>
                            </td>
                          );
                        })}
                        {/* Wochenstunden-Zelle */}
                        <td
                          className={`px-4 py-3 text-center align-middle border-l border-gray-200/50 min-w-[130px] ${
                            isOvertime
                              ? "bg-red-50 text-red-700"
                              : "text-gray-900"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold">
                              {averageWeekly.toFixed(1)}h
                            </span>
                            <span className="text-xs text-gray-500">
                              / {maxHours}h
                            </span>
                            {isOvertime && (
                              <span className="text-xs font-medium text-red-600">
                                Überstunden!
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

        {/* Schedule Edit Popup */}
        <ScheduleEditPopup
          isOpen={!!editingCell}
          onClose={handleCancelEdit}
          onSave={handleSaveEdit}
          employee={editingCell?.employee || ""}
          date={editingCell?.date || ""}
          tempShift={tempShift}
          setTempShift={setTempShift}
          tempHours={tempHours}
          setTempHours={setTempHours}
          tempActivity={tempActivity}
          setTempActivity={setTempActivity}
          tempGroups={tempGroups}
          setTempGroups={setTempGroups}
        />
      </div>
    </div>
  );
});

export default ScheduleTable;
