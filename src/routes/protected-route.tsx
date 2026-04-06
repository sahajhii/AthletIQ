import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <div className="section-shell py-20 text-sm text-muted-foreground">Loading account...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
