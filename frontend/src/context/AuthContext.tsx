/**
 * AuthContext für DSP Shift-Planner
 *
 * Verwaltet Microsoft Authentication und Employee-Daten
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { EmployeeInfo } from "../util/apis/microsoft_auth";

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  // Authentication State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  employee: EmployeeInfo | null;
  tokens: AuthTokens | null;

  // Authentication Actions
  setAuthTokens: (tokens: AuthTokens) => void;
  setUser: (user: AuthUser) => void;
  setEmployee: (employee: EmployeeInfo | null) => void;
  logout: () => void;

  // Permission Checks
  hasShiftPlannerAccess: () => boolean;
  canManageShifts: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [employee, setEmployeeState] = useState<EmployeeInfo | null>(null);
  const [tokens, setTokensState] = useState<AuthTokens | null>(null);

  // Token Storage Keys
  const ACCESS_TOKEN_KEY = "shift_planner_access_token";
  const REFRESH_TOKEN_KEY = "shift_planner_refresh_token";
  const USER_KEY = "shift_planner_user";
  const EMPLOYEE_KEY = "shift_planner_employee";

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const storedEmployee = localStorage.getItem(EMPLOYEE_KEY);

        if (accessToken && refreshToken) {
          setTokensState({ access: accessToken, refresh: refreshToken });

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserState(parsedUser);
            setIsAuthenticated(true);
          }

          if (storedEmployee) {
            const parsedEmployee = JSON.parse(storedEmployee);
            setEmployeeState(parsedEmployee);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Bei Fehler Auth-State zurücksetzen
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set Authentication Tokens
  const setAuthTokens = (newTokens: AuthTokens) => {
    setTokensState(newTokens);
    localStorage.setItem(ACCESS_TOKEN_KEY, newTokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, newTokens.refresh);
    setIsAuthenticated(true);
  };

  // Set User Data
  const setUser = (newUser: AuthUser) => {
    setUserState(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  // Set Employee Data
  const setEmployee = (newEmployee: EmployeeInfo | null) => {
    setEmployeeState(newEmployee);
    if (newEmployee) {
      localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(newEmployee));
    } else {
      localStorage.removeItem(EMPLOYEE_KEY);
    }
  };

  // Logout Function
  const logout = () => {
    setIsAuthenticated(false);
    setUserState(null);
    setEmployeeState(null);
    setTokensState(null);

    // Clear localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EMPLOYEE_KEY);

    console.log("🔓 User logged out from Shift-Planner");
  };

  // Permission Checks
  const hasShiftPlannerAccess = (): boolean => {
    // User muss authentifiziert sein UND als Employee registriert sein
    return (
      isAuthenticated &&
      user !== null &&
      employee !== null &&
      employee.is_active
    );
  };

  const canManageShifts = (): boolean => {
    // Zusätzliche Berechtigung für Schichtmanagement
    // Kann später erweitert werden (z.B. basierend auf Position oder Department)
    const isManagerPosition =
      employee?.position?.title?.includes("Manager") ?? false;
    return (
      hasShiftPlannerAccess() && (user?.is_staff === true || isManagerPosition)
    );
  };

  const contextValue: AuthContextType = {
    // State
    isAuthenticated,
    isLoading,
    user,
    employee,
    tokens,

    // Actions
    setAuthTokens,
    setUser,
    setEmployee,
    logout,

    // Permissions
    hasShiftPlannerAccess,
    canManageShifts,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom Hook für AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
