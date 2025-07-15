/**
 * Dashboard für DSP Shift-Planner
 *
 * Übersichtsseite für authentifizierte DSP-Mitarbeiter
 */

import React from "react";
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Settings,
  LogOut,
  UserCheck,
  Building,
  Badge,
  CalendarCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMicrosoftAuth } from "../hooks/useMicrosoftAuth";

const DashboardPage: React.FC = () => {
  const { user, employee, logout, canManageShifts } = useAuth();
  const navigate = useNavigate();
  const { resetOAuthSession } = useMicrosoftAuth();

  const handleLogout = () => {
    resetOAuthSession();
    logout();
  };

  if (!user || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-dsp-orange-light border-t-dsp-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Mitarbeiterdaten...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Anwesenheit",
      description: "Arbeitszeiten erfassen",
      icon: CalendarCheck,
      color: "bg-dsp-orange",
      action: () => navigate("/attendance"),
      comingSoon: false,
    },
    {
      title: "Schichtplan anzeigen",
      description: "Aktuelle und geplante Schichten einsehen",
      icon: Calendar,
      color: "bg-blue-500",
      action: () => console.log("Navigate to schedule"),
      comingSoon: true,
    },
    {
      title: "Neue Schicht planen",
      description: "Neue Arbeitsschicht eintragen",
      icon: Clock,
      color: "bg-green-500",
      action: () => console.log("Navigate to new shift"),
      comingSoon: true,
    },
    {
      title: "Team-Übersicht",
      description: "Kollegen und deren Schichten anzeigen",
      icon: Users,
      color: "bg-purple-500",
      action: () => console.log("Navigate to team view"),
      comingSoon: true,
    },
    {
      title: "Statistiken",
      description: "Arbeitsstunden und Trends analysieren",
      icon: TrendingUp,
      color: "bg-indigo-500",
      action: () => console.log("Navigate to statistics"),
      comingSoon: true,
    },
  ];

  const adminActions = canManageShifts()
    ? [
        {
          title: "Mitarbeiter verwalten",
          description: "Team-Mitglieder und Berechtigungen verwalten",
          icon: UserCheck,
          color: "bg-red-500",
          action: () => console.log("Navigate to user management"),
          comingSoon: true,
        },
        {
          title: "Abteilungsplanung",
          description: "Übergreifende Schichtplanung für die Abteilung",
          icon: Building,
          color: "bg-gray-600",
          action: () => console.log("Navigate to department planning"),
          comingSoon: true,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-dsp-orange" />
                  <h1 className="ml-3 text-xl font-bold text-gray-900">
                    DSP Shift-Planner
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {employee.position.title} • {employee.department.name}
                  </p>
                </div>
                <div className="w-8 h-8 bg-dsp-orange rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {employee.first_name[0]}
                    {employee.last_name[0]}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Willkommen, {employee.first_name}
                </h2>
                <p className="text-gray-600 text-sm">
                  Schichtmanagement-Tool für DSP-Mitarbeiter
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-dsp-orange-light rounded-lg p-3">
                  <div className="flex items-center text-gray-900">
                    <Clock className="w-4 h-4 mr-2 text-dsp-orange" />
                    <span className="text-sm font-medium">
                      Max. {employee.max_working_hours}h/Woche
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-base font-semibold text-gray-900">
                    {employee.is_active ? "Aktiv" : "Inaktiv"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Abteilung</p>
                  <p className="text-base font-semibold text-gray-900">
                    {employee.department.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Badge className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="text-base font-semibold text-gray-900">
                    {employee.position.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Schnellzugriff
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    disabled={action.comingSoon}
                    className={`
                      relative p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 text-left
                      ${
                        action.comingSoon
                          ? "opacity-75 cursor-not-allowed"
                          : "hover:shadow-lg cursor-pointer"
                      }
                    `}
                  >
                    {action.comingSoon && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Bald verfügbar
                        </span>
                      </div>
                    )}
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 ${action.color} rounded-lg mb-3`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-base font-medium text-gray-900 mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Actions */}
          {adminActions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verwaltung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      disabled={action.comingSoon}
                      className={`
                        relative p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 text-left
                        ${
                          action.comingSoon
                            ? "opacity-75 cursor-not-allowed"
                            : "hover:shadow-lg cursor-pointer"
                        }
                      `}
                    >
                      {action.comingSoon && (
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Bald verfügbar
                          </span>
                        </div>
                      )}
                      <div
                        className={`inline-flex items-center justify-center w-10 h-10 ${action.color} rounded-lg mb-3`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-base font-medium text-gray-900 mb-1">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Development Notice */}
          <div className="bg-dsp-orange-light border border-dsp-orange-medium rounded-lg p-4">
            <div className="flex items-start">
              <Settings className="w-5 h-5 text-dsp-orange mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-base font-medium text-gray-900 mb-2">
                  Entwicklung in vollem Gange
                </h4>
                <p className="text-gray-700 mb-3 text-sm">
                  Der DSP Shift-Planner wird derzeit entwickelt. Die
                  Schichtplanungs-Features werden schrittweise verfügbar
                  gemacht. Sie können sich bereits anmelden und Ihre
                  Mitarbeiterdaten werden automatisch synchronisiert.
                </p>
                <div className="bg-white rounded-lg p-3 border border-dsp-orange-medium">
                  <h5 className="font-medium text-gray-900 mb-2 text-sm">
                    Geplante Features:
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Interaktive Schichtplanung</li>
                    <li>• Team-Kalender mit Kollegen-Übersicht</li>
                    <li>• Automatische Stundenberechnung</li>
                    <li>• Urlaubsplanung Integration</li>
                    <li>• Mobile App für unterwegs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
