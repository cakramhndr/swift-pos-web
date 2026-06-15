import useStoreProfile from "@/hooks/useStoreProfile";
import { ShoppingCart } from "lucide-react";

export default function StoreHeader({
  showLogo = true,
  showAddress = true,
  showPhone = true,
}) {
  const { storeProfile, loading, error } = useStoreProfile();

  const name = storeProfile?.name || "SwiftPOS";
  const address = storeProfile?.address || "";
  const phone = storeProfile?.phone || "";
  const logoUrl = storeProfile?.logo_url || null;

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent shadow-md shadow-accent/20">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              SwiftPOS
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        {showLogo && (
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent shadow-md shadow-accent/20 shrink-0 overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingCart size={20} className="text-white" />
            )}
            <div className="absolute inset-0 rounded-xl bg-white/[0.08]" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            {name}
          </p>
          {showPhone && phone && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{phone}</p>
          )}
        </div>
      </div>
      {showAddress && address && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {address}
        </p>
      )}
    </div>
  );
}
