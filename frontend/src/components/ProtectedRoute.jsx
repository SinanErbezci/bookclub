import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // ⏳ wait until auth is resolved
  if (loading) {
    return null; // or <Spinner />
  }

  // 🔒 not logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;