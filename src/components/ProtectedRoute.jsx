import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While checking the token on mount, show a centered spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Checking authentication…</span>
        </div>
      </div>
    );
  }

  // No user → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated → render children
  return children;
}
