import api from "@/lib/api";

export function getStoreProfile() {
  return api.get("/store/profile");
}

export function updateStoreProfile(formData) {
  return api.put("/store/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
