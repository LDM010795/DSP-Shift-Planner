import React, { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  format,
  isWeekend,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import Holidays from "date-holidays";
import clsx from "clsx";
import type { Attendance } from "../../util/apis/attendanceApi";

interface MonthAttendanceTableProps {
  monthDate: Date; // ein beliebiges Datum innerhalb des gewünschten Monats
  attendances: Attendance[];
  /**
   * Callback, wenn der Benutzer Stunden für einen Mitarbeiter ändert
   * @param employeeId  ID des Mitarbeiters
   * @param date        Datum (Date-Objekt)
   * @param hours       Stunden (null = löschen)
   */
  onChange: (employeeId: number, date: Date, hours: number | null) => void;
}

const hd = new Holidays("DE", "BE"); // Deutschland/Berlin

const MonthAttendanceTable: React.FC<MonthAttendanceTableProps> = ({
  monthDate,
  attendances,
  onChange,
}) => {
  // Liste aller Tage des Monats (ISO-String)
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(monthDate),
      end: endOfMonth(monthDate),
    }).map((d) => ({
      date: d,
      iso: format(d, "yyyy-MM-dd"),
      isWeekend: isWeekend(d),
      holiday: hd.isHoliday(d) as Holidays.Holiday | false,
    }));
  }, [monthDate]);

  // Alle beteiligten Mitarbeiter (distinct nach ID)
  const employees = useMemo(() => {
    const map = new Map<number, string>();
    attendances.forEach((a) => map.set(a.employee, a.employee_full_name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [attendances]);

  // Lokaler UI-State für Bearbeitung
  const [localHours, setLocalHours] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    attendances.forEach((a) => {
      const key = `${a.employee}|${a.date}`;
      initial[key] = a.hours.toString();
    });
    return initial;
  });

  const handleInput = (
    employeeId: number,
    date: Date,
    value: string
  ) => {
    const iso = format(date, "yyyy-MM-dd");
    const key = `${employeeId}|${iso}`;
    setLocalHours((prev) => ({ ...prev, [key]: value }));
    const hoursNum = value === "" ? null : parseFloat(value);
    onChange(employeeId, date, hoursNum);
  };

  return (
    <div className="overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm">
      <table className="min-w-max text-xs sm:text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white border-b px-2 py-1 text-left">Mitarbeiter</th>
            {days.map((d) => (
              <th
                key={d.iso}
                className={clsx(
                  "px-1 py-1 border-b text-center",
                  d.holiday
                    ? "bg-yellow-50 text-yellow-800"
                    : d.isWeekend
                    ? "bg-gray-100 text-gray-500"
                    : "bg-gray-50 text-gray-700"
                )}
              >
                {format(d.date, "d")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50">
              {/* Mitarbeitername */}
              <td className="sticky left-0 z-10 bg-white border-r px-2 py-1 whitespace-nowrap font-medium text-gray-900">
                {emp.name}
              </td>
              {/* Stunden pro Tag */}
              {days.map((d) => {
                const key = `${emp.id}|${d.iso}`;
                const isDisabled = d.isWeekend || !!d.holiday;
                return (
                  <td
                    key={key}
                    className={clsx(
                      "border px-1 py-1 text-center",
                      d.holiday
                        ? "bg-yellow-50"
                        : d.isWeekend
                        ? "bg-gray-100"
                        : "bg-white"
                    )}
                  >
                    {isDisabled ? (
                      <span className="text-[10px] text-gray-500 italic">
                        {d.holiday ? d.holiday.name : "-"}
                      </span>
                    ) : (
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max="24"
                        value={localHours[key] ?? ""}
                        onChange={(e) =>
                          handleInput(emp.id, d.date, e.target.value)
                        }
                        className="w-16 border rounded px-1 py-0.5 text-[10px] sm:text-xs focus:outline-[#ff863d]"
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthAttendanceTable;
