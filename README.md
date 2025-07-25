# Shift-Planner - Employee Scheduling System

## 🕐 Überblick

Der Shift-Planner ist eine **React-basierte Schichtplanungsanwendung** für DSP-Mitarbeiter mit Microsoft Organization Authentication und integrierter Anwesenheitsverfolgung.

**Technische Bewertung: ⭐⭐⭐⭐ (GUT - IN ENTWICKLUNG)**

### 🎯 Hauptfeatures

- 🔐 **Microsoft OAuth Integration** für Organisation-Authentication
- 📅 **Anwesenheitsverfolgung** mit Monatsübersichten
- 👥 **Employee Dashboard** mit personalisierten Informationen
- ⚡ **Responsive Design** mit Tailwind CSS
- 🛡️ **Protected Routes** für sichere Navigation

## 🏗️ Architektur

### Projektstruktur

```
frontend/src/
├── components/
│   ├── attendance/
│   │   └── MonthAttendanceTable.tsx    # Anwesenheitstabelle
│   ├── MicrosoftLoginButton.tsx        # OAuth Login Component
│   └── ProtectedRoute.tsx              # Route-Schutz
│
├── pages/
│   ├── LoginPage.tsx                   # Microsoft OAuth Login
│   ├── DashboardPage.tsx              # Haupt-Dashboard
│   └── AttendancePage.tsx             # Anwesenheitsseite
│
├── context/
│   └── AuthContext.tsx                # Authentication State Management
│
├── hooks/
│   └── useMicrosoftAuth.ts            # OAuth Integration Hook
│
├── util/apis/
│   ├── attendanceApi.ts               # Anwesenheits-API
│   ├── departmentApi.ts               # Abteilungs-API
│   └── microsoft_auth.ts              # OAuth API-Calls
│
└── types/                             # TypeScript Definitionen
```

### 🔐 Authentication Flow

```typescript
// hooks/useMicrosoftAuth.ts
export const useMicrosoftAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = useCallback(async () => {
    // Microsoft OAuth Redirect
    const authUrl = `${API_BASE_URL}/api/microsoft/auth/login/shift-planner/`;
    window.location.href = authUrl;
  }, []);
  
  // OAuth Callback Handler
  const handleCallback = useCallback(async () => {
    // Prevent React Strict Mode double execution
    const callbackHandled = sessionStorage.getItem('shift_planner_oauth_handled');
    if (callbackHandled) return;
    
    sessionStorage.setItem('shift_planner_oauth_handled', 'true');
    // Process OAuth callback...
  }, []);
};
```

### 📅 Attendance Management

```typescript
// components/attendance/MonthAttendanceTable.tsx
interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'holiday' | 'sick';
  hours?: number;
  note?: string;
}

const MonthAttendanceTable: React.FC<Props> = ({ month, year }) => {
  // Calendar Generation mit Feiertagen
  // Anwesenheitsstatus-Anzeige
  // Export-Funktionalität
};
```

## ⚙️ Backend-Integration

### API-Endpunkte

```
/api/microsoft/
├── auth/login/shift-planner/    # OAuth Initiation
├── auth/callback/               # OAuth Callback
└── employee-info/               # Employee Data

/api/employees/
├── departments/                 # Department Information
└── {employee_id}/              # Employee Details
```

### Employee Data Structure

```typescript
interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: {
    id: number;
    name: string;
    description?: string;
  };
  position?: string;
  hire_date?: string;
  is_active: boolean;
}
```

## 🎨 UI/UX Design

### Design System
- **Framework**: Tailwind CSS 3.4
- **Color Scheme**: Blue/Indigo gradient design
- **Typography**: Clean, professional font stack
- **Responsive**: Mobile-first approach

### Komponenten-Bibliothek
```typescript
// Basis-Komponenten
- Loading Spinner mit Gradient
- Microsoft Login Button
- Navigation Header
- Dashboard Cards
- Attendance Table
```

## 🛠️ Development Setup

### Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev              # Port 5174

# Production Build
npm run build

# Type Checking
npm run build           # TypeScript Check included
```

### Dependencies

```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^6.28.0",
  "axios": "^1.7.2",
  "date-fns": "^4.1.0",
  "date-holidays": "^3.24.4",
  "tailwindcss": "^3.4.4",
  "typescript": "~5.8.3",
  "vite": "^7.0.3"
}
```

### Environment Configuration

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=DSP Shift-Planner
```

## 📈 Aktuelle Features

### ✅ Implementiert:
- Microsoft OAuth Authentication
- Employee Dashboard
- Basic Attendance Tracking
- Department Integration
- Responsive Design
- Protected Routes

### 🚧 In Entwicklung:
- Comprehensive Shift Scheduling
- Manager Dashboard
- Advanced Attendance Analytics
- Vacation Request System
- Shift Swap Functionality

### 📋 Geplant:
- Calendar Integration
- Mobile Push Notifications
- Reporting Dashboard
- Time Tracking Integration
- Shift Template System

## 🔍 Architektur-Bewertung

### ✅ Stärken:
- **Saubere React-Architektur**: Gute Component-Organisation
- **Microsoft Integration**: Funktionale OAuth-Implementierung  
- **TypeScript**: Type-Safety implementiert
- **Modern Stack**: React 19, Vite, Tailwind CSS
- **API Integration**: Gut strukturierte API-Calls

### ⚠️ Verbesserungsbereiche:
- **Feature-Vollständigkeit**: Shift-Management noch grundlegend
- **Backend-Models**: Entsprechende Backend-Models fehlen teilweise
- **Testing**: Keine Tests implementiert
- **Performance**: Noch keine spezifischen Optimierungen
- **Error Handling**: Basis-Implementation, aber ausbaufähig

### 🎯 Empfohlene nächste Schritte:

1. **Backend Models erweitern**:
```python
# shift_planner/models.py
class Shift(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20)
    
class AttendanceRecord(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=20)
    hours_worked = models.DecimalField(max_digits=4, decimal_places=2)
```

2. **Frontend Features erweitern**:
   - Shift Calendar Component
   - Vacation Request Form
   - Manager Approval System
   - Advanced Filtering & Search

3. **Testing implementieren**:
   - Component Tests für UI
   - Integration Tests für API
   - E2E Tests für Auth Flow

---

**Der Shift-Planner zeigt eine solide Grundlage mit gutem Potential für Erweiterung zu einem vollwertigen Schichtplanungssystem.**

*Dokumentation erstellt: Dezember 2024*  
*Version: 1.0.0*
