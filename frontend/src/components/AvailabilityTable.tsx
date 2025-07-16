import { motion, AnimatePresence } from "framer-motion";
import { useState, memo } from "react";
import {
  Download,
  Upload,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import type { AvailabilityData } from "../lib/utils";
import { isBerlinHoliday, getHolidayName, isWeekend } from "../lib/utils";
import { useShallowCallback } from "../lib/performanceUtils";

interface AvailabilityTableProps {
  employees: string[];
  dates: string[];
  availabilityData: AvailabilityData;
  onAvailabilityChange: (
    employee: string,
    date: string,
    status: "available" | "unavailable"
  ) => void;
  currentUser: string;
  isAdmin: boolean;
  currentTab: "availability" | "schedule";
  onTabChange: (tab: "availability" | "schedule") => void;
  currentMonth: Date;
  onMonthChange: (direction: "prev" | "next") => void;
  // Speichern entfernt – Props nicht mehr benötigt
}

const AvailabilityTable = memo(function AvailabilityTable({
  employees,
  dates,
  availabilityData,
  onAvailabilityChange,
  currentTab,
  onTabChange,
  currentMonth,
  onMonthChange,
  // Speichern entfernt – Props nicht mehr benötigt
  currentUser,
  isAdmin,
}: AvailabilityTableProps) {
  const [showLegend, setShowLegend] = useState(false);

  // Statistiken berechnen
  const getStats = () => {
    let totalDays = 0;
    let availableDays = 0;
    let unavailableDays = 0;

    Object.values(availabilityData).forEach((employeeData) => {
      Object.values(employeeData).forEach((status) => {
        totalDays++;
        if (status === "available") availableDays++;
        else if (status === "unavailable") unavailableDays++;
      });
    });

    return { totalDays, availableDays, unavailableDays };
  };

  const stats = getStats();

  const getStatusColor = (
    status: "available" | "unavailable",
    isWeekend: boolean = false,
    isHoliday: boolean = false
  ) => {
    if (isWeekend) {
      return "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed";
    }

    if (isHoliday) {
      return "bg-purple-200 border-purple-300 text-purple-700 cursor-not-allowed";
    }

    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 hover:bg-green-200 text-green-800 cursor-pointer";
      case "unavailable":
        return "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-600 cursor-pointer";
      default:
        return "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-600 cursor-pointer";
    }
  };

  const getStatusIcon = (
    status: "available" | "unavailable",
    isWeekend: boolean = false,
    isHoliday: boolean = false
  ) => {
    if (isWeekend) {
      return "-";
    }

    if (isHoliday) {
      return "🎉";
    }

    switch (status) {
      case "available":
        return "✓";
      case "unavailable":
        return "-";
      default:
        return "-";
    }
  };

  const getNextStatus = (
    current: "available" | "unavailable"
  ): "available" | "unavailable" => {
    switch (current) {
      case "available":
        return "unavailable";
      case "unavailable":
        return "available";
      default:
        return "available";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const weekday = date.toLocaleDateString("de-DE", { weekday: "short" });
    return { day, weekday };
  };

  const isWeekendDay = (dateStr: string) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6; // Sonntag = 0, Samstag = 6
  };

  return (
    <div className="space-y-0">
      {/* Compact Header with controls */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 border-b-0 p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <Upload className="w-3 h-3" />
              <span>Import</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Month Navigation and Stats */}
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

          {/* Compact Stats */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span className="text-gray-600">Gesamt:</span>
              <span className="font-semibold text-gray-900">
                {stats.totalDays}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-gray-600">Verfügbar:</span>
              <span className="font-semibold text-gray-900">
                {stats.availableDays}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <XCircle className="w-3 h-3 text-red-600" />
              <span className="text-gray-600">Nicht verfügbar:</span>
              <span className="font-semibold text-gray-900">
                {stats.unavailableDays}
              </span>
            </div>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200"
            >
              <Info className="w-3 h-3" />
              <span>Legende</span>
            </button>
          </div>
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
              Verfügbarkeits-Legende:
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-gray-700">Verfügbar</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                <span className="text-gray-700">Nicht verfügbar</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                <span className="text-gray-700">
                  Wochenende (nicht editierbar)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded flex items-center justify-center">
                  <span className="text-xs">🎉</span>
                </div>
                <span className="text-gray-700">
                  Feiertag (nicht editierbar)
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Table with rounded bottom corners */}
      <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl border border-gray-200/50 border-t-0 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {currentTab === "availability" && (
            <motion.div
              key="availability-table"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
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
                      const isWeekend = isWeekendDay(date);
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {employees.map((employee, employeeIndex) => (
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
                        const isWeekend = isWeekendDay(date);
                        const isHoliday = isBerlinHoliday(date);
                        const holidayName = getHolidayName(date);
                        // Standard ist "unavailable", nur wenn explizit "available" gesetzt ist
                        const status =
                          availabilityData[employee]?.[date] || "unavailable";

                        return (
                          <td
                            key={`${employee}-${date}`}
                            className={`px-2 py-3 ${
                              isHoliday
                                ? "bg-purple-100/30"
                                : isWeekend
                                ? "bg-gray-100/30"
                                : ""
                            }`}
                          >
                            <motion.button
                              onClick={() => {
                                if (isWeekend || isHoliday) return;
                                const canEdit = isAdmin || employee === currentUser;
                                if (canEdit) {
                                  onAvailabilityChange(
                                    employee,
                                    date,
                                    getNextStatus(status)
                                  );
                                }
                              }}
                              whileHover={
                                !isWeekend && !isHoliday
                                  ? {
                                      scale: (isAdmin || employee === currentUser) ? 1.05 : 1,
                                      y: (isAdmin || employee === currentUser) ? -1 : 0,
                                    }
                                  : {}
                              }
                              whileTap={
                                !isWeekend && !isHoliday && (isAdmin || employee === currentUser)
                                  ? { scale: 0.95 }
                                  : {}
                              }
                              className={`w-full h-10 rounded-xl border-2 transition-all duration-200 flex items-center justify-center font-bold text-sm shadow-sm ${
                                !isWeekend && !isHoliday && (isAdmin || employee === currentUser)
                                  ? "hover:shadow-md"
                                  : ""
                              } ${getStatusColor(
                                status,
                                isWeekend,
                                isHoliday
                              )} ${
                                !(isAdmin || employee === currentUser) &&
                                !isWeekend &&
                                !isHoliday
                                  ? "cursor-not-allowed opacity-60"
                                  : ""
                              }`}
                              title={
                                isHoliday
                                  ? `${employee} - ${new Date(date).toLocaleDateString("de-DE")}: ${holidayName} (Feiertag)`
                                  : isWeekend
                                  ? `${employee} - ${new Date(date).toLocaleDateString("de-DE")}: Wochenende (nicht verfügbar)`
                                  : `${employee} - ${new Date(date).toLocaleDateString("de-DE")}: ${status === "available" ? "Verfügbar" : "Nicht verfügbar"}`
                              }
                              disabled={isWeekend || isHoliday}
                            >
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={`${status}-${isWeekend}-${isHoliday}`}
                                className="text-lg"
                              >
                                {getStatusIcon(status, isWeekend, isHoliday)}
                              </motion.span>
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
      </div>
    </div>
  );
});

export default AvailabilityTable;
