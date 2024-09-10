import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/incidents/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { auth } from "./config/firebase";
import { useNavigate } from "react-router-dom";
import ReportDetailsPage from "./pages/incidents/ReportDetailsPage";
import IncidentGroupPage from "./pages/incidents/IncidentGroupPage";
import EmergenciesPage from "./pages/emergencies/EmergenciesPage";
import EmergencyDetailsPage from "./pages/emergencies/EmergencyDetailsPage";
import { IncidentProvider } from "./core/IncidentContext";
import { ReportProvider } from "./core/ReportContext";
import ComplaintsPage from "./pages/complaints/ComplaintsPage";
import ComplaintDetailsPage from "./pages/complaints/ComplaintDetailsPage";
import SchedulesPage from "./pages/schedule/SchedulesPage";
import NewsPage from "./pages/news/NewsPage";
import NewsDetailsPage from "./pages/news/NewsDetailsPage";
import UsersPage from "./pages/users/UsersPage";
import UserDetailsPage from "./pages/users/UserDetailsPage";
import SupportTicketsPage from "./pages/support/SupportTicketsPage";
import TicketDetailsPage from "./pages/support/TicketDetailsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import NoAccessPage from "./pages/NoAccessPage";
import ProtectedRoute from "./core/ProtectedRoute";
import { AuthProvider } from "./core/AuthContext";
import './styles/statuses.css';
import AuditLogsPage from "./pages/audit/AuditLogsPage";

function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user == null) {
        navigate("/login");
      }

      setCurrentUser(user);
    });
  });
  return (
    <>
      <IncidentProvider>
        <ReportProvider>
          <AuthProvider>
          <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/no-access" element={<NoAccessPage />} />
        <Route path="*" element={<NotFoundPage />} />

        <Route element={<ProtectedRoute requiredPermission="view_incidents" />}>
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
          <Route path="/incident_group/:id" element={<IncidentGroupPage />}></Route>
        </Route>

        <Route element={<ProtectedRoute requiredPermission="view_emergencies" />}>
          <Route path="/emergencies" element={<EmergenciesPage />} />
          <Route path="/emergencies/:id" element={<EmergencyDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="view_complaints" />}>
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="view_news" />}>
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="view_users" />}>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="view_tickets" />}>
          <Route path="/tickets" element={<SupportTicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="view_audits" />}>
          <Route path="/audits" element={<AuditLogsPage/>}/>
        </Route>

        <Route element={<ProtectedRoute requiredPermission="view_settings" />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Routes>
          </AuthProvider>
        </ReportProvider>
      </IncidentProvider>
    </>
  );
}

export default App;
