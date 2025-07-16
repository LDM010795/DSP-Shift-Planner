import { getAuthHeaders } from "../util/authHeaders";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function upsertAvailability(
  employeeId: number,
  date: string,
  status: "available" | "unavailable"
) {
  const res = await fetch(`${BASE_URL}/api/shift-planner/availabilities/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ employee: employeeId, date, status }),
  });
  if (!res.ok) {
    console.error("Failed to save availability", await res.text());
  }
}

export async function upsertSchedule(
  employeeId: number,
  date: string,
  shift_type: "morning" | "evening" | "off" | "holiday" | "custom",
  hours: string,
  activity: "TA" | "D" | "D/TA" | "" = "",
  groups: string = ""
) {
  const res = await fetch(`${BASE_URL}/api/shift-planner/schedules/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      employee: employeeId,
      date,
      shift_type,
      hours,
      activity,
      groups,
    }),
  });
  if (!res.ok) {
    console.error("Failed to save schedule", await res.text());
  }
}

// Response DTOs
export interface AvailabilityDto {
  id: number;
  employee: number;
  date: string;
  status: "available" | "unavailable";
  note?: string;
}

export interface ScheduleDto {
  id: number;
  employee: number;
  date: string;
  shift_type: "morning" | "evening" | "off" | "holiday" | "custom";
  hours: string;
  activity?: "TA" | "D" | "D/TA" | "";
  groups?: string;
}

/**
 * Läd alle Verfügbarkeiten (optional filterbar via Query-Params)
 *
 * @returns Array von AvailabilityDto oder leeres Array bei Fehler
 */
export async function fetchAvailabilities(queryParams: Record<string, string> = {}): Promise<AvailabilityDto[]> {
  // Build query string z. B. { employee: "1", date__gte: "2025-07-01" }
  const query = new URLSearchParams(queryParams).toString();

  const url = `${BASE_URL}/api/shift-planner/availabilities/${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch availabilities", await res.text());
      return [];
    }

    return (await res.json()) as AvailabilityDto[];
  } catch (err) {
    console.error("Error fetching availabilities", err);
    return [];
  }
}

/**
 * Holt Schichtpläne (optional Query-Params)
 */
export async function fetchSchedules(queryParams: Record<string, string> = {}): Promise<ScheduleDto[]> {
  const query = new URLSearchParams(queryParams).toString();
  const url = `${BASE_URL}/api/shift-planner/schedules/${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch schedules", await res.text());
      return [];
    }

    return (await res.json()) as ScheduleDto[];
  } catch (err) {
    console.error("Error fetching schedules", err);
    return [];
  }
} 