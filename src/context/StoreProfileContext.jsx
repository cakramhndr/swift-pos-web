import { createContext, useState, useEffect, useCallback } from "react";
import { getStoreProfile } from "@/api/store";

export const StoreProfileContext = createContext(null);

export function StoreProfileProvider({ children }) {
  const [storeProfile, setStoreProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await getStoreProfile();
      setStoreProfile(res.data.data);
    } catch {
      setStoreProfile(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshStoreProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <StoreProfileContext.Provider
      value={{ storeProfile, loading, error, refreshStoreProfile }}
    >
      {children}
    </StoreProfileContext.Provider>
  );
}
