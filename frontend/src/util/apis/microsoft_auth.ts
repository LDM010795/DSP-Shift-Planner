/**
 * Microsoft Organization Authentication API für Shift-Planner
 *
 * Integriert mit DSP Employee Management System
 */

import axios from "axios";

// Basis-URL für Microsoft Services
const MICROSOFT_API_URL =
  import.meta.env.VITE_MICROSOFT_API_URL ||
  "http://127.0.0.1:8000/api/microsoft";

// Separate Axios-Instanz für Microsoft Auth (keine JWT-Interceptors nötig)
const microsoftApi = axios.create({
  baseURL: MICROSOFT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Für Session-basierte State-Verwaltung
});

// --- Types ---

export interface MicrosoftLoginResponse {
  success: boolean;
  message: string;
  redirect_url: string;
  state: string;
  instructions: string[];
}

export interface MicrosoftCallbackRequest {
  code: string;
  state: string;
  tool_slug: string;
}

export interface EmployeeInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    title: string;
  };
  max_working_hours: number;
  is_active: boolean;
}

export interface MicrosoftAuthResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
  employee_info?: EmployeeInfo; // DSP Employee Daten wenn verfügbar
  role_info: {
    role_name: string;
    groups: string[];
    is_staff: boolean;
    is_superuser: boolean;
    permissions: {
      can_access_admin: boolean;
      can_manage_users: boolean;
      can_manage_content: boolean;
      can_access_shift_planner: boolean; // Neue Permission für Shift-Planner
    };
  };
  organization_info: {
    display_name: string;
    job_title: string;
    department: string;
    office_location: string;
    account_enabled: boolean;
  };
  tokens: {
    access: string;
    refresh: string;
  };
  expires_in: number;
}

export interface MicrosoftUserStatusResponse {
  success: boolean;
  active: boolean;
  user?: {
    email: string;
    display_name: string;
    job_title: string;
    department: string;
    account_enabled: boolean;
  };
  employee_verified?: boolean; // Ob Employee im System existiert
  error?: string;
}

export interface MicrosoftErrorResponse {
  success: false;
  error: string;
  error_code?: string;
}

// --- API Functions ---

/**
 * 1. Startet Microsoft Organization Login Flow für Shift-Planner
 */
export const startMicrosoftLogin = (): void => {
  const loginUrl = `${MICROSOFT_API_URL}/auth/login/shift-planner/`;
  // Direkte Navigation statt AJAX-Aufruf, um CORS-Redirect-Probleme zu umgehen
  window.location.href = loginUrl;
};

/**
 * 2. SHIFT-PLANNER SPEZIFISCH: Sendet OAuth Code für Authentication und Employee-Abgleich
 */
export const authenticateWithMicrosoft = async (
  callbackData: MicrosoftCallbackRequest
): Promise<MicrosoftAuthResponse> => {
  try {
    const response = await microsoftApi.post<MicrosoftAuthResponse>(
      `/auth/callback/${callbackData.tool_slug}/`,
      { code: callbackData.code, state: callbackData.state } // Nur code und state im Body senden
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    throw new Error(
      axiosError.response?.data?.error ||
        "Failed to authenticate with Microsoft"
    );
  }
};

/**
 * 3. Prüft Organization User Status und Employee-Berechtigung
 */
export const checkMicrosoftUserStatus = async (
  accessToken: string
): Promise<MicrosoftUserStatusResponse> => {
  try {
    const response = await microsoftApi.get<MicrosoftUserStatusResponse>(
      "/auth/user-status/?app=shift-planner",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    throw new Error(
      axiosError.response?.data?.error || "Failed to check user status"
    );
  }
};

// --- Utility Functions ---

/**
 * Extrahiert Auth-Code und State aus URL-Parametern (nach Microsoft Redirect)
 */
export const extractCallbackFromUrl = (): {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
} => {
  const urlParams = new URLSearchParams(window.location.search);

  return {
    code: urlParams.get("code") || undefined,
    state: urlParams.get("state") || undefined,
    error: urlParams.get("error") || undefined,
    errorDescription: urlParams.get("error_description") || undefined,
  };
};

/**
 * Räumt URL-Parameter nach Microsoft OAuth auf
 */
export const cleanupUrlAfterAuth = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");

  window.history.replaceState({}, document.title, url.toString());
};

export default {
  startMicrosoftLogin,
  authenticateWithMicrosoft,
  checkMicrosoftUserStatus,
  extractCallbackFromUrl,
  cleanupUrlAfterAuth,
};
