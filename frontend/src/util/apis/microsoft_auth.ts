/**
 * Microsoft Organization Authentication API für Shift-Planner
 *
 * Verwendet die zentrale Unified Microsoft Auth Library
 * für konsistente OAuth-Integration.
 */

// --- Types ---

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
  employee_info?: EmployeeInfo;
  role_info: {
    role_name: string;
    groups: string[];
    is_staff: boolean;
    is_superuser: boolean;
    permissions: {
      can_access_admin: boolean;
      can_manage_users: boolean;
      can_manage_content: boolean;
      can_access_shift_planner: boolean;
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
  employee_verified?: boolean;
  error?: string;
}

// --- Configuration ---

const TOOL_SLUG = "shift-planner";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// --- API Functions ---

/**
 * 1. Startet Microsoft Organization Login Flow für Shift-Planner
 */
export const startMicrosoftLogin = (): void => {
  const loginUrl = `${BACKEND_URL}/api/microsoft/auth/login/${TOOL_SLUG}/`;
  console.log("🚀 Redirecting to Microsoft login:", loginUrl);
  window.location.href = loginUrl;
};

/**
 * 2. Sendet OAuth Code für Authentication und Employee-Abgleich
 */
export const authenticateWithMicrosoft = async (
  callbackData: MicrosoftCallbackRequest
): Promise<MicrosoftAuthResponse> => {
  try {
    const apiUrl = `${BACKEND_URL}/api/microsoft/auth/callback/${TOOL_SLUG}/`;
    console.log("🔐 Authenticating with Microsoft:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: callbackData.code,
        state: callbackData.state,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to authenticate with Microsoft"
      );
    }

    return await response.json();
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
    const apiUrl = `${BACKEND_URL}/api/microsoft/auth/user-status/?app=${TOOL_SLUG}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to check user status");
    }

    return await response.json();
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    throw new Error(
      axiosError.response?.data?.error || "Failed to check user status"
    );
  }
};

// --- Utility Functions ---

/**
 * Extrahiert Auth-Code und State aus URL-Parametern
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
