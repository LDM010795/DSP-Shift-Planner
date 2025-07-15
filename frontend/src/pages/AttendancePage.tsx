import React, { useEffect, useState } from "react";
import { format, addMonths } from "date-fns";
import MonthAttendanceTable from "../components/attendance/MonthAttendanceTable";
import type { Attendance } from "../util/apis/attendanceApi";
import {
  fetchAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../util/apis/attendanceApi";
import { useAuth } from "../context/AuthContext";
import { fetchDepartments, type Department } from "../util/apis/departmentApi";

const AttendancePage: React.FC = () => {
  const { employee, user } = useAuth();
  const [monthDate, setMonthDate] = useState<Date>(new Date());
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  const isAdmin =
    employee?.position?.title?.toLowerCase().includes("admin") ||
    employee?.position?.title?.toLowerCase().includes("leitung") ||
    employee?.position?.title?.toLowerCase().includes("manager");

  const loadAttendances = async (date: Date) => {
    const deptId = isAdmin
      ? selectedDeptId ?? departments[0]?.id
      : employee?.department.id;
    if (!deptId) return;
    if (!isAdmin && !employee) return; // Safety for non-logged employee
    setLoading(true);
    try {
      const data = await fetchAttendances(
        date.getMonth() + 1,
        date.getFullYear(),
        deptId
      );
      setAttendances(data);
    } catch (err) {
      console.error("Fehler beim Laden der Anwesenheiten:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendances(monthDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDate, employee, selectedDeptId]);

  useEffect(() => {
    if (isAdmin) {
      fetchDepartments()
        .then((deps) => {
          setDepartments(deps);
          // Standardmäßig erste Abteilung wählen, falls noch nichts gewählt
          if (deps.length && selectedDeptId === null) {
            setSelectedDeptId(deps[0].id);
          }
        })
        .catch((err) =>
          console.error("Fehler beim Laden der Abteilungen:", err)
        );
    }
  }, [isAdmin]);

  const handleHoursChange = async (
    employeeId: number,
    date: Date,
    hours: number | null
  ) => {
    // Aktuell bearbeiten wir nur den eigenen Datensatz des eingeloggten Mitarbeiters
    if (!employee || employeeId !== employee.id) return;
    const iso = format(date, "yyyy-MM-dd");
    const existing = attendances.find(
      (a) => a.date === iso && a.employee === employeeId
    );

    try {
      if (hours === null || hours === 0 || Number.isNaN(hours)) {
        if (existing) {
          await deleteAttendance(existing.id);
          setAttendances((prev) => prev.filter((a) => a.id !== existing.id));
        }
        return;
      }

      if (existing) {
        const updated = await updateAttendance(existing.id, { hours });
        setAttendances((prev) =>
          prev.map((a) => (a.id === existing.id ? updated : a))
        );
      } else {
        const created = await createAttendance({
          employee: employee.id,
          department: employee.department.id,
          date: iso,
          hours,
        });
        setAttendances((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Anwesenheit:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Anwesenheit {format(monthDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <>
                  <select
                    value={selectedDeptId?.toString() || ""}
                    onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id.toString()}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {selectedDeptId && (
                    <span className="text-gray-600 text-sm italic">
                      Abteilung:{" "}
                      {departments.find((d) => d.id === selectedDeptId)?.name}
                    </span>
                  )}
                </>
              )}
              {!isAdmin && (
                <span className="text-gray-600 text-sm italic">
                  Abteilung: {employee?.department.name}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setMonthDate((prev) => addMonths(prev, -1))}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
            >
              ← Vorheriger Monat
            </button>
            <button
              onClick={() => setMonthDate((prev) => addMonths(prev, 1))}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
            >
              Nächster Monat →
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-dsp-orange-light border-t-dsp-orange"></div>
              <span className="ml-3 text-gray-600">
                Lade Anwesenheitsdaten...
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <MonthAttendanceTable
              monthDate={monthDate}
              attendances={attendances}
              onChange={handleHoursChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
