import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Berliner gesetzliche Feiertage für ein Jahr berechnen
export function getBerlinHolidays(year: number): { [date: string]: string } {
  const holidays: { [date: string]: string } = {};

  // Feste Feiertage
  holidays[`${year}-01-01`] = "Neujahr";
  holidays[`${year}-05-01`] = "Tag der Arbeit";
  holidays[`${year}-10-03`] = "Tag der Deutschen Einheit";
  holidays[`${year}-12-25`] = "1. Weihnachtsfeiertag";
  holidays[`${year}-12-26`] = "2. Weihnachtsfeiertag";

  // Berechnung für Ostern (Gaußsche Osterformel)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easter = new Date(year, month - 1, day);

  // Osterbezogene Feiertage
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  holidays[goodFriday.toISOString().split("T")[0]] = "Karfreitag";

  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  holidays[easterMonday.toISOString().split("T")[0]] = "Ostermontag";

  const ascensionDay = new Date(easter);
  ascensionDay.setDate(easter.getDate() + 39);
  holidays[ascensionDay.toISOString().split("T")[0]] = "Christi Himmelfahrt";

  const whitMonday = new Date(easter);
  whitMonday.setDate(easter.getDate() + 50);
  holidays[whitMonday.toISOString().split("T")[0]] = "Pfingstmontag";

  return holidays;
}

// Prüft ob ein Datum ein Berliner Feiertag ist
export function isBerlinHoliday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const holidays = getBerlinHolidays(year);
  return dateStr in holidays;
}

// Gibt den Namen des Feiertags zurück, wenn es einer ist
export function getHolidayName(dateStr: string): string | null {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const holidays = getBerlinHolidays(year);
  return holidays[dateStr] || null;
}

// Generate dates for a given month
export function generateMonthDates(date: Date): string[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    // Formatiere manuell statt toISOString() zu verwenden um Zeitzonenproblemen vorzubeugen
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    dates.push(dateStr);
  }

  return dates;
}

// Format date to German locale
export function formatDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", options);
}

// Check if date is weekend
export function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

// Get weekday name
export function getWeekdayName(dateStr: string, short: boolean = true): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    weekday: short ? "short" : "long",
  });
}

// Get month name
export function getMonthName(date: Date, long: boolean = true): string {
  return date.toLocaleDateString("de-DE", {
    month: long ? "long" : "short",
  });
}

// Calculate shift hours - Nachtschicht entfernt, custom hinzugefügt
export function calculateShiftHours(
  shift: "morning" | "evening" | "off" | "holiday" | "custom"
): number {
  switch (shift) {
    case "morning":
      return 8; // 08:00-16:00
    case "evening":
      return 8; // 16:00-00:00
    case "off":
      return 0;
    case "holiday":
      return 0;
    case "custom":
      return 0; // Wird individuell vom User bestimmt
    default:
      return 0;
  }
}

// Types
export type AvailabilityStatus = "available" | "unavailable";

export type AvailabilityData = {
  [employee: string]: {
    [date: string]: AvailabilityStatus;
  };
};

// ShiftType ohne night, dafür mit holiday und custom
export type ShiftType = "morning" | "evening" | "off" | "holiday" | "custom";

export type ScheduleEntry = {
  shift: ShiftType;
  hours: string;
  activity?: "TA" | "D" | "D/TA" | "";
  groups?: string;
};

export type ScheduleData = {
  [employee: string]: {
    [date: string]: ScheduleEntry;
  };
};

export type Employee = {
  id: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
};

export type AvailabilityStats = {
  totalDays: number;
  availableDays: number;
  unavailableDays: number;
};

export type ScheduleStats = {
  totalShifts: number;
  morningShifts: number;
  eveningShifts: number;
  // nightShifts entfernt
  offDays: number;
  holidayDays: number; // neu hinzugefügt
};

// Validation functions
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export function isValidShift(shift: string): shift is ShiftType {
  return ["morning", "evening", "off", "holiday", "custom"].includes(shift);
}

export function isValidAvailability(
  status: string
): status is AvailabilityStatus {
  return ["available", "unavailable"].includes(status);
}

// Helper functions for shift management
export function getShiftDisplayName(shift: ShiftType): string {
  switch (shift) {
    case "morning":
      return "Frühschicht";
    case "evening":
      return "Spätschicht";
    case "off":
      return "Frei";
    case "holiday":
      return "Feiertag";
    case "custom":
      return "Flexible Zeit";
    default:
      return "Unbekannt";
  }
}

export function getShiftColor(shift: ShiftType): string {
  switch (shift) {
    case "morning":
      return "yellow";
    case "evening":
      return "orange";
    case "off":
      return "gray";
    case "holiday":
      return "purple"; // Feiertage in lila wie vorher Nachtschicht
    case "custom":
      return "blue"; // Custom in blau
    default:
      return "gray";
  }
}

export function getAvailabilityColor(status: AvailabilityStatus): string {
  switch (status) {
    case "available":
      return "green";
    case "unavailable":
      return "red";
    default:
      return "gray";
  }
}
