import { useContext } from "react";
import { StoreProfileContext } from "@/context/StoreProfileContext";

export default function useStoreProfile() {
  const context = useContext(StoreProfileContext);
  if (!context) {
    throw new Error(
      "useStoreProfile must be used within a StoreProfileProvider",
    );
  }
  return context;
}
