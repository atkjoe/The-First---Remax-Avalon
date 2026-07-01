import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Properties from "./pages/Properties.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import Requests from "./pages/Requests.jsx";
import Sell from "./pages/Sell.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
