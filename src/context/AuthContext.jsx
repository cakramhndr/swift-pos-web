import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { loginApi, logoutApi, getMeApi, isAuthenticated } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check existing token

  // ── Fetch current user (called on mount & after login) ──
  const fetchUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getMeApi();
      setUser(res.data.data ?? res.data.user ?? res.data);
    } catch {
      // Token invalid / expired → clear
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks-exhaustive-deps
    fetchUser();
  }, []);

  // ── Login ──────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const token = res.data.token ?? res.data.access_token;

    if (!token) {
      throw new Error("No token returned from server");
    }

    localStorage.setItem("token", token);
    await fetchUser(); // re-fetch user after storing token
    return res.data;
  };

  // ── Logout ─────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Even if server fails, clear local state
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const value = { user, loading, login, logout, fetchUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
