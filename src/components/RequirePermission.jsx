import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Route-level permission guard.
 * Renders children only if the current user has the specified permission.
 * Otherwise redirects to the dashboard.
 *
 * Usage in App.jsx:
 *   <Route path="/cash-register" element={
 *     <RequirePermission permission="manage shifts">
 *       <CashRegister />
 *     </RequirePermission>
 *   } />
 */
export default function RequirePermission({ permission, children }) {
  const { user } = useAuth();

  const userPermissions = user?.permissions || [];

  if (!userPermissions.includes(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
