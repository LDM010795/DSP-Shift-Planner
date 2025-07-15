import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import AvailabilityTable from "../components/AvailabilityTable";
import ScheduleTable from "../components/ScheduleTable";
import {
  generateMonthDates,
  type AvailabilityData,
  type ScheduleData,
  isBerlinHoliday,
} from "../lib/utils";
import { useShallowCallback } from "../lib/performanceUtils";

const mockEmployees = [
  "Max Mustermann",
  "Anna Schmidt",
  "Tom Weber",
  "Lisa Müller",
  "Peter Klein",
  "Sarah Johnson",
  "Mike Johnson",
  "Emma Brown",
];

interface PlannerPageProps {
  isAdmin: boolean;
  currentMonth: Date;
  setCurrentMonth: (month: Date) => void;
  availabilityData: AvailabilityData;
  setAvailabilityData: (
    data: AvailabilityData | ((prev: AvailabilityData) => AvailabilityData)
  ) => void;
  scheduleData: ScheduleData;
  setScheduleData: (
    data: ScheduleData | ((prev: ScheduleData) => ScheduleData)
  ) => void;
  currentTab: "availability" | "schedule";
  onTabChange: (tab: "availability" | "schedule") => void;
}

export default function PlannerPage({
  isAdmin,
  currentMonth,
  setCurrentMonth,
  availabilityData,
  setAvailabilityData,
  scheduleData,
  setScheduleData,
  currentTab,
  onTabChange,
}: PlannerPageProps) {
  const [isSaving, setIsSaving] = useState(false);

  const dates = generateMonthDates(currentMonth);

  // Performance: Optimized availability handlers
  const handleAvailabilityChange = useShallowCallback(
    (employee: string, date: string, status: "available" | "unavailable") => {
      setAvailabilityData((prev) => ({
        ...prev,
        [employee]: {
          ...prev[employee],
          [date]: status,
        },
      }));
    },
    [setAvailabilityData]
  );

  const handleAvailabilitySave = useCallback(async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);

    const event = new CustomEvent("showToast", {
      detail: {
        message: "Verfügbarkeiten erfolgreich gespeichert! ✅",
        type: "success",
      },
    });
    window.dispatchEvent(event);
  }, []);

  // Schedule handlers
  const handleScheduleChange = (
    employee: string,
    date: string,
    shift: "morning" | "evening" | "off" | "holiday" | "custom",
    hours: string
  ) => {
    // Nur Admins können Änderungen vornehmen
    if (!isAdmin) return;

    // Feiertage automatisch setzen, falls nicht bereits gesetzt
    if (isBerlinHoliday(date)) {
      setScheduleData((prev) => ({
        ...prev,
        [employee]: {
          ...prev[employee],
          [date]: { shift: "holiday", hours: "0" },
        },
      }));
      return;
    }

    // Nur erlauben wenn Verfügbarkeit vorhanden ist (außer bei Feiertagen)
    const availability = availabilityData[employee]?.[date];
    if (!availability || availability === "unavailable") {
      return; // Keine Änderung erlaubt
    }

    setScheduleData((prev) => ({
      ...prev,
      [employee]: {
        ...prev[employee],
        [date]: { shift, hours },
      },
    }));

    // Auto-save für Admin-Modus (nach kurzer Verzögerung)
    if (isAdmin) {
      setTimeout(() => {
        handleAutoSave();
      }, 500);
    }
  };

  const handleAutoSave = async () => {
    // Stiller Auto-Save ohne UI-Feedback
    // In einem echten System würde hier ein API-Call stattfinden
    console.log("Auto-saving schedule data...");
  };

  const changeMonth = useCallback(
    (direction: "prev" | "next") => {
      const newMonth = new Date(currentMonth);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      setCurrentMonth(newMonth);
    },
    [currentMonth, setCurrentMonth]
  );

  return (
    <div className="space-y-0">
      {/* Simple Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Verfügbarkeiten & Schichtplan
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {currentTab === "availability"
            ? "Verwalten Sie Ihre Verfügbarkeiten"
            : isAdmin
            ? "Verwalten Sie die Schichtpläne Ihrer Mitarbeiter"
            : "Ihr aktueller Schichtplan"}
        </p>
      </motion.div>

      {/* Container mit zentraler Tab Navigation und Tables */}
      <div className="relative">
        {/* Zentrale Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-t-2xl border border-gray-200/50 border-b-0 p-4">
          <div className="flex items-center justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1 relative">
              <motion.button
                onClick={() => onTabChange("availability")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentTab === "availability"
                    ? "text-dsp-orange z-10"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Verfügbarkeiten
              </motion.button>
              <motion.button
                onClick={() => onTabChange("schedule")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentTab === "schedule"
                    ? "text-dsp-orange z-10"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Schichtplan
              </motion.button>

              {/* Animated Background */}
              <motion.div
                layoutId="centralTabBackground"
                className="absolute bg-white shadow-sm rounded-md"
                initial={false}
                animate={{
                  x: currentTab === "availability" ? 4 : "calc(50% + 2px)",
                  width:
                    currentTab === "availability"
                      ? "calc(50% - 6px)"
                      : "calc(50% - 6px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  duration: 0.3,
                }}
                style={{
                  top: 4,
                  bottom: 4,
                }}
              />
            </div>
          </div>
        </div>

        {/* Container für beide Tables - smoother Übergang */}
        <div className="relative">
          {/* Availability Table */}
          <motion.div
            initial={false}
            animate={{
              opacity: currentTab === "availability" ? 1 : 0,
              x: currentTab === "availability" ? 0 : -50,
              pointerEvents: currentTab === "availability" ? "auto" : "none",
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            className="w-full"
            style={{
              position: currentTab === "availability" ? "relative" : "absolute",
              top: currentTab === "availability" ? 0 : 0,
              left: 0,
              right: 0,
              zIndex: currentTab === "availability" ? 10 : 1,
            }}
          >
            <AvailabilityTable
              employees={mockEmployees}
              dates={dates}
              availabilityData={availabilityData}
              onAvailabilityChange={handleAvailabilityChange}
              currentTab={currentTab}
              onTabChange={onTabChange}
              currentMonth={currentMonth}
              onMonthChange={changeMonth}
              onSave={handleAvailabilitySave}
              isSaving={isSaving}
            />
          </motion.div>

          {/* Schedule Table */}
          <motion.div
            initial={false}
            animate={{
              opacity: currentTab === "schedule" ? 1 : 0,
              x: currentTab === "schedule" ? 0 : 50,
              pointerEvents: currentTab === "schedule" ? "auto" : "none",
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            className="w-full"
            style={{
              position: currentTab === "schedule" ? "relative" : "absolute",
              top: currentTab === "schedule" ? 0 : 0,
              left: 0,
              right: 0,
              zIndex: currentTab === "schedule" ? 10 : 1,
            }}
          >
            <ScheduleTable
              employees={mockEmployees}
              dates={dates}
              scheduleData={scheduleData}
              availabilityData={availabilityData}
              onScheduleChange={handleScheduleChange}
              isEditable={isAdmin}
              isAdmin={isAdmin}
              currentTab={currentTab}
              onTabChange={onTabChange}
              currentMonth={currentMonth}
              onMonthChange={changeMonth}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
