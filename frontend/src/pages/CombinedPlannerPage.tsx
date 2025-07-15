import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AvailabilityTable from "../components/AvailabilityTable";
import ScheduleTable from "../components/ScheduleTable";
import {
  generateMonthDates,
  type AvailabilityData,
  type ScheduleData,
  isBerlinHoliday,
} from "../lib/utils";

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

interface CombinedPlannerPageProps {
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

export default function CombinedPlannerPage({
  isAdmin,
  currentMonth,
  setCurrentMonth,
  availabilityData,
  setAvailabilityData,
  scheduleData,
  setScheduleData,
  currentTab,
  onTabChange,
}: CombinedPlannerPageProps) {
  const [isSaving, setIsSaving] = useState(false);

  const dates = generateMonthDates(currentMonth);

  // Availability handlers
  const handleAvailabilityChange = (
    employee: string,
    date: string,
    status: "available" | "unavailable"
  ) => {
    setAvailabilityData((prev) => ({
      ...prev,
      [employee]: {
        ...prev[employee],
        [date]: status,
      },
    }));
  };

  const handleAvailabilitySave = async () => {
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
  };

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

  const changeMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

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

      {/* Render the appropriate table based on currentTab */}
      {currentTab === "availability" ? (
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
      ) : (
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
      )}
    </div>
  );
} 