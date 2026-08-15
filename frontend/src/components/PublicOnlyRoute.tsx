import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface PublicOnlyRouteProps {
  children: ReactNode;
}

function PublicOnlyRoute({
  children,
}: PublicOnlyRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicOnlyRoute;