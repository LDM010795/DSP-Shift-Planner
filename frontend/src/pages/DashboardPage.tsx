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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
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
      color: "bg-teal-500",
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
      color: "bg-orange-500",
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
          color: "bg-indigo-500",
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
                  <Calendar className="w-8 h-8 text-blue-600" />
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
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-2">
                  Willkommen, {employee.first_name}! 👋
                </h2>
                <p className="text-blue-100">
                  Verwalten Sie Ihre Schichten intelligent und effizient.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center text-white">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      Max. {employee.max_working_hours}h/Woche
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {employee.is_active ? "Aktiv" : "Inaktiv"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Abteilung</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {employee.department.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Badge className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {employee.position.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
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
                      relative p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left
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
                      className={`inline-flex items-center justify-center w-12 h-12 ${action.color} rounded-lg mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
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
            <div className="mb-8">
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
                        relative p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left
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
                        className={`inline-flex items-center justify-center w-12 h-12 ${action.color} rounded-lg mb-4`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
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

          {/* Coming Soon Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Settings className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h4 className="text-lg font-medium text-blue-900 mb-2">
                  Entwicklung in vollem Gange
                </h4>
                <p className="text-blue-700 mb-4">
                  Der DSP Shift-Planner wird derzeit entwickelt. Die
                  Schichtplanungs-Features werden schrittweise verfügbar
                  gemacht. Sie können sich bereits anmelden und Ihre
                  Mitarbeiterdaten werden automatisch synchronisiert.
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">
                    Geplante Features:
                  </h5>
                  <ul className="text-sm text-blue-700 space-y-1">
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
