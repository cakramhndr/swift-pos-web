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
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getMeApi();

      setUser(res.data?.data ?? res.data?.user ?? res.data);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const res = await loginApi(email, password);

    console.log("FULL RESPONSE =", res);
    console.log("DATA =", res.data);

    const token = res.data?.data?.token;

    if (!token) {
      throw new Error("Token tidak ditemukan di response login");
    }

    localStorage.setItem("token", token);

    console.log("TOKEN SAVED =", localStorage.getItem("token"));

    const user = res.data?.data?.user;

    if (user) {
      setUser(user);
      setLoading(false);
    }

    return res.data;
  };

  // Hotfix 11.8.2: Only clear auth on successful logout.
  // Do NOT clear auth when logout is blocked by SHIFT_STILL_OPEN (409).
  // Preserve existing behaviour for unexpected errors (clear auth).
  const logout = async () => {
    try {
      await logoutApi();

      // Success — only now clear auth
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      const code = error?.response?.data?.code;
      const status = error?.response?.status;

      // Hotfix 11.8.1/11.8.2: Block logout if shift is still open
      // Do NOT clear auth state — just throw back to AppSidebar
      if (status === 409 && code === "SHIFT_STILL_OPEN") {
        throw error;
      }

      // Unexpected errors (expired token, network, etc.)
      // Preserve existing behaviour: clear auth
      console.error(error);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
