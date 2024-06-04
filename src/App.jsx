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
      <Routes>
        <Route path="/" element={<DashboardPage />}/>

        <Route path="/reports" >
          <Route index element={<ReportsPage />} />
          <Route path=":id" element={<ReportDetailsPage />}/>
          <Route path="new" />
        </Route>

        <Route path="/incident_group/:id" element={<IncidentGroupPage />}></Route>

        <Route path="/emergency"></Route>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="*" element={<NotFoundPage />}/>
      </Routes>
    </>
  );
}

export default App;
