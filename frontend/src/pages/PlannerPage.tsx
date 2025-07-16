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
// useShallowCallback entfernt – Standard useCallback genügt hier
import { useAuth } from "../context/AuthContext";
import {
  upsertAvailability,
  upsertSchedule,
  fetchAvailabilities,
  fetchSchedules,
  type AvailabilityDto,
  type ScheduleDto,
} from "../services/shiftPlannerApi";

type EmployeeDto = {
  id: number;
  full_name: string;
  max_working_hours: number;
  position_title: string;
  department: number;
  department_name: string;
};

const EMPLOYEE_API_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

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
  const { user, employee: loggedEmployee } = useAuth();
  const currentUserFullName = user
    ? `${user.first_name} ${user.last_name}`
    : "";

  // Mitarbeiter aus Backend
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | "all">(
    loggedEmployee?.department.id ?? "all"
  );

  // Falls Employee später geladen wird, Standardabteilung nachziehen
  useEffect(() => {
    if (loggedEmployee && selectedDept === "all") {
      setSelectedDept(loggedEmployee.department.id);
    }
  }, [loggedEmployee]);

  const departments: Array<[number, string]> = Array.from(
    new Map(employees.map((e) => [e.department, e.department_name])).entries()
  );

  // Läd Verfügbarkeiten sobald Mitarbeiter geladen oder Monat gewechselt wird
  useEffect(() => {
    const loadAvailabilities = async () => {
      if (employees.length === 0) return;

      // Optional: Nur Einträge dieses Monats laden und Client-seitig filtern
      const data: AvailabilityDto[] = await fetchAvailabilities();

      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();

      const mapped: AvailabilityData = {};

      data.forEach((item) => {
        const dateObj = new Date(item.date);
        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month) {
          return; // ignore anderer Monat
        }

        const emp = employees.find((e) => e.id === item.employee);
        if (!emp) return;

        const name = emp.full_name;
        if (!mapped[name]) mapped[name] = {};
        mapped[name][item.date] = item.status;
      });

      setAvailabilityData(mapped);
    };

    loadAvailabilities();
  }, [employees, currentMonth]);

  // Läd Schichtpläne sobald Mitarbeiter geladen oder Monat gewechselt wird
  useEffect(() => {
    const loadSchedules = async () => {
      if (employees.length === 0) return;

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        new Date(year, month + 1, 0).getDate()
      ).padStart(2, "0")}`;

      const data: ScheduleDto[] = await fetchSchedules({
        date__gte: startDate,
        date__lte: endDate,
      });

      const mapped: ScheduleData = {};

      data.forEach((item) => {
        const emp = employees.find((e) => e.id === item.employee);
        if (!emp) return;

        const name = emp.full_name;
        if (!mapped[name]) mapped[name] = {};
        mapped[name][item.date] = {
          shift: item.shift_type,
          hours: item.hours,
          activity: item.activity,
          groups: item.groups,
        };
      });

      setScheduleData(mapped);
    };

    loadSchedules();
  }, [employees, currentMonth]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `${EMPLOYEE_API_URL}/api/shift-planner/employees/`
        );
        if (!res.ok) throw new Error("Fehler beim Laden der Mitarbeiter");
        const data: EmployeeDto[] = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: {
              message: "Mitarbeiter konnten nicht geladen werden",
              type: "error",
            },
          })
        );
      }
    };

    fetchEmployees();
  }, []);

  const dates = generateMonthDates(currentMonth);

  const filteredEmployees =
    selectedDept === "all"
      ? employees
      : employees.filter((e) => e.department === selectedDept);

  // Performance: Optimized availability handlers
  const handleAvailabilityChange = useCallback(
    (employee: string, date: string, status: "available" | "unavailable") => {
      setAvailabilityData((prev) => ({
        ...prev,
        [employee]: {
          ...prev[employee],
          [date]: status,
        },
      }));

      // Persist sofort (Fire-and-Forget)
      const emp = employees.find((e) => e.full_name === employee);
      if (emp) {
        upsertAvailability(emp.id, date, status);
      }
    },
    [setAvailabilityData, employees]
  );

  // Schedule handlers
  const handleScheduleChange = (
    employee: string,
    date: string,
    shift: "morning" | "evening" | "off" | "holiday" | "custom",
    hours: string,
    activity?: "TA" | "D" | "D/TA" | "",
    groups?: string
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

    // Wochenende-Sonderfall: Admin darf planen auch ohne Verfügbarkeit
    const isWeekendDay = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;

    if (!isWeekendDay) {
      // Für Werktage weiterhin Verfügbarkeitsprüfung
      const availability = availabilityData[employee]?.[date];
      if (!availability || availability === "unavailable") {
        return; // Keine Änderung erlaubt
      }
    }

    setScheduleData((prev) => ({
      ...prev,
      [employee]: {
        ...prev[employee],
        [date]: { shift, hours, activity, groups },
      },
    }));

    // persist immediately if admin
    const emp = employees.find((e) => e.full_name === employee);
    if (emp) {
      upsertSchedule(emp.id, date, shift, hours, activity ?? "", groups ?? "");
    }

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
            <div className="flex bg-gray-100 rounded-lg p-1 relative space-x-4 items-center">
              {/* Department Selector */}
              <select
                value={selectedDept}
                onChange={(e) => {
                  const val =
                    e.target.value === "all" ? "all" : Number(e.target.value);
                  setSelectedDept(val);
                }}
                className="px-3 py-2 text-sm text-gray-700 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange"
              >
                <option value="all">Alle Abteilungen</option>
                {departments.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              {/* Verfügbarkeiten Tab */}
              <motion.button
                onClick={() => onTabChange("availability")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 overflow-hidden ${
                  currentTab === "availability"
                    ? "text-dsp-orange"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {currentTab === "availability" && (
                  <motion.div
                    layoutId="centralTabBackground"
                    className="absolute inset-0 bg-white shadow-sm rounded-md"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      duration: 0.3,
                    }}
                  />
                )}
                <span className="relative z-10">Verfügbarkeiten</span>
              </motion.button>

              {/* Schichtplan Tab */}
              <motion.button
                onClick={() => onTabChange("schedule")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 overflow-hidden ${
                  currentTab === "schedule"
                    ? "text-dsp-orange"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {currentTab === "schedule" && (
                  <motion.div
                    layoutId="centralTabBackground"
                    className="absolute inset-0 bg-white shadow-sm rounded-md"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      duration: 0.3,
                    }}
                  />
                )}
                <span className="relative z-10">Schichtplan</span>
              </motion.button>
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
              employees={filteredEmployees.map((e) => e.full_name)}
              dates={dates}
              availabilityData={availabilityData}
              onAvailabilityChange={handleAvailabilityChange}
              currentTab={currentTab}
              onTabChange={onTabChange}
              currentMonth={currentMonth}
              onMonthChange={changeMonth}
              currentUser={currentUserFullName}
              isAdmin={isAdmin}
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
              employees={filteredEmployees.map((e) => e.full_name)}
              dates={dates}
              scheduleData={scheduleData}
              availabilityData={availabilityData}
              onScheduleChange={handleScheduleChange}
              isEditable={isAdmin}
              isAdmin={isAdmin}
              currentUser={currentUserFullName}
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
