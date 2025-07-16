import axios from "axios";
import dayjs from "dayjs";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const attendanceApi = axios.create({
  baseURL: `${API_BASE_URL}/employees`,
  withCredentials: true,
});

export interface Attendance {
  id: number;
  employee: number;
  employee_full_name: string;
  department: number;
  department_name: string;
  date: string; // YYYY-MM-DD
  hours: string; // decimal string
  created_at: string;
  updated_at: string;
}

export interface AttendanceCreate {
  employee: number;
  department: number;
  date: string;
  hours: string | number;
}

export const fetchAttendances = async (
  month: number,
  year: number,
  department?: number
): Promise<Attendance[]> => {
  const params: Record<string, string | number> = { month, year };
  if (department) params.department = department;
  const res = await attendanceApi.get<Attendance[]>("/attendances/", {
    params,
  });
  return res.data;
};

export const createAttendance = async (
  payload: AttendanceCreate
): Promise<Attendance> => {
  const res = await attendanceApi.post<Attendance>("/attendances/", payload);
  return res.data;
};

export const updateAttendance = async (
  id: number,
  payload: Partial<AttendanceCreate>
): Promise<Attendance> => {
  const res = await attendanceApi.patch<Attendance>(
    `/attendances/${id}/`,
    payload
  );
  return res.data;
};

export const deleteAttendance = async (id: number): Promise<void> => {
  await attendanceApi.delete(`/attendances/${id}/`);
};

export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const start = dayjs(date).startOf("month").toDate();
  const end = dayjs(date).endOf("month").toDate();
  return { start, end };
};
