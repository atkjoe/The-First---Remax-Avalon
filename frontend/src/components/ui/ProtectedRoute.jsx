import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
