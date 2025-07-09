import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const departmentApi = axios.create({
  baseURL: `${API_BASE_URL}/employees`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// JWT Token anhängen
const ACCESS_TOKEN_KEY = "shift_planner_access_token";

departmentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export const fetchDepartments = async (): Promise<Department[]> => {
  const res = await departmentApi.get<Department[]>(
    "/departments/?is_active=true"
  );
  return res.data;
};

export default departmentApi;
