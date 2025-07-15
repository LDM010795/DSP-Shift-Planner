import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AvailabilityTable from "../components/AvailabilityTable";
import { generateMonthDates, type AvailabilityData } from "../lib/utils";

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

interface AvailabilityPageProps {
  currentMonth: Date;
  setCurrentMonth: (month: Date) => void;
  availabilityData: AvailabilityData;
  setAvailabilityData: (
    data: AvailabilityData | ((prev: AvailabilityData) => AvailabilityData)
  ) => void;
  currentTab: "availability" | "schedule";
  onTabChange: (tab: "availability" | "schedule") => void;
}

export default function AvailabilityPage({
  currentMonth,
  setCurrentMonth,
  availabilityData,
  setAvailabilityData,
  currentTab,
  onTabChange,
}: AvailabilityPageProps) {
  const [isSaving, setIsSaving] = useState(false);

  const dates = generateMonthDates(currentMonth);

  useEffect(() => {
    // Initialize empty availability data
    const initialData: AvailabilityData = {};
    mockEmployees.forEach((employee) => {
      initialData[employee] = {};
      dates.forEach((date) => {
        // Add some random initial data for demonstration
        const random = Math.random();
        if (random > 0.8) {
          initialData[employee][date] = "unavailable";
        } else {
          initialData[employee][date] = "available";
        }
      });
    });
    setAvailabilityData(initialData);
  }, [currentMonth]);

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

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);

    // Show success feedback
    const event = new CustomEvent("showToast", {
      detail: {
        message: "Verfügbarkeiten erfolgreich gespeichert! ✅",
        type: "success",
      },
    });
    window.dispatchEvent(event);
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
      {/* Simple Page Title - viel kleiner und kompakter */}
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
          Verwalten Sie Ihre Verfügbarkeiten und Schichtpläne
        </p>
      </motion.div>

      {/* Availability Table with integrated header */}
      <AvailabilityTable
        employees={mockEmployees}
        dates={dates}
        availabilityData={availabilityData}
        onAvailabilityChange={handleAvailabilityChange}
        currentTab={currentTab}
        onTabChange={onTabChange}
        currentMonth={currentMonth}
        onMonthChange={changeMonth}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
