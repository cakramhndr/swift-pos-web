import fs from "fs";

const pages = [
  "Transactions.jsx", "Inventory.jsx", "InventoryLogs.jsx",
  "Customers.jsx", "Reports.jsx", "Analytics.jsx", "ProductDetail.jsx"
];

pages.forEach((filename) => {
  const fp = "src/pages/" + filename;
  if (!fs.existsSync(fp)) {
    console.log(`  Skipped: ${filename} (not found)`);
    return;
  }

  let c = fs.readFileSync(fp, "utf8");
  const before = c;

  // ═══ 1. FIX STATUS BADGES/PILLS ═══
  // Completed badge (green)
  c = c.replace(
    /rounded-full bg-green-100 dark:bg-green-900\/30 px-3 py-1 text-xs font-medium text-green-700/g,
    "rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300"
  );
  c = c.replace(
    /rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700/g,
    "rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300"
  );

  // Danger badge (red)
  c = c.replace(
    /rounded-full bg-red-50 text-red-600 dark:text-red-400 ring-1 ring-red-200/g,
    "rounded-full bg-red-500/15 border border-red-500/30 text-red-300"
  );

  // Warning badge (yellow/amber)
  c = c.replace(
    /bg-yellow-50 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-200/g,
    "bg-amber-500/15 border border-amber-500/30 text-amber-300"
  );
  c = c.replace(
    /bg-yellow-50 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-200/g,
    "bg-amber-500/15 border border-amber-500/30 text-amber-300"
  );

  // Green success badge
  c = c.replace(
    /bg-green-50 text-green-700 dark:text-green-300 ring-1 ring-green-200/g,
    "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
  );

  // Inline text badge (Completed with CheckCircle)
  c = c.replace(
    /rounded-full bg-green-100 dark:bg-green-900\/30 px-3 py-1\.5 text-xs font-medium text-green-700/g,
    "rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-300"
  );

  // ═══ 2. FIX TABLE HEADER GRADIENTS ═══
  c = c.replace(
    /bg-gradient-to-r from-\[#f8f8fc\] dark:from-gray-800 to-white dark:to-gray-800 text-left text-sm text-gray-500 dark:text-gray-400/g,
    "bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-sm text-gray-500 dark:text-gray-400"
  );

  // ═══ 3. FIX TABLE ROW HOVER ═══
  // Generic table row hover in dark mode
  c = c.replace(
    /hover:bg-gray-100 dark:hover:bg-gray-700\/50 transition-colors/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
  );
  // Add subtle shadow to row hover
  c = c.replace(
    /dark:hover:bg-gray-700\/60 transition-colors/g,
    "dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors"
  );

  // ═══ 4. FIX BUTTONS WITH EXPORT/ACTION BUTTONS ═══
  c = c.replace(
    /className="flex items-center gap-2 rounded-2xl border border-violet-200 dark:border-violet-800\/40 px-4 py-2\.5 font-semibold text-violet-600 dark:text-violet-300 transition-all hover:bg-violet-50/g,
    'className="relative z-10 flex items-center gap-2 rounded-2xl border border-violet-200 dark:border-violet-800/40 px-4 py-2.5 text-sm font-semibold text-violet-600 dark:text-violet-300 transition-all duration-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5'
  );
  c = c.replace(
    /className="flex items-center gap-2 rounded-2xl border border-violet-200 px-4 py-2\.5 font-semibold text-violet-600 transition-all hover:bg-violet-50/g,
    'className="relative z-10 flex items-center gap-2 rounded-2xl border border-violet-200 dark:border-violet-800/40 px-4 py-2.5 text-sm font-semibold text-violet-600 dark:text-violet-300 transition-all duration-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5'
  );

  // ═══ 5. FIX SEARCH INPUTS ═══
  c = c.replace(
    /className="w-full rounded-2xl border border-\[#ececf2\] dark:border-gray-700 bg-white dark:bg-gray-800 py-2\.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/g,
    'className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"'
  );
  c = c.replace(
    /className="w-full rounded-2xl border border-\[#ececf2\] dark:border-gray-700 py-2\.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/g,
    'className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"'
  );

  // ═══ 6. FIX SELECT DROPDOWNS ═══
  c = c.replace(
    /className="rounded-2xl border border-\[#ececf2\] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"/g,
    'className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"'
  );
  c = c.replace(
    /className="rounded-2xl border border-\[#ececf2\] px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"/g,
    'className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"'
  );

  // ═══ 7. FIX PAGINATION BUTTONS ═══
  c = c.replace(
    /flex h-9 w-9 items-center justify-center rounded-xl border border-\[#ececf2\] dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900\/30 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40/g,
    "flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
  );

  // ═══ 8. FIX SKU/MONO BADGES ═══
  c = c.replace(
    /bg-gray-100 dark:bg-gray-700 px-2\.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300/g,
    "bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400"
  );
  c = c.replace(
    /rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300/g,
    "rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400"
  );

  // ═══ 9. FIX "More items" BADGE ═══
  c = c.replace(
    /bg-violet-50 dark:bg-violet-900\/30 px-2\.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400/g,
    "bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 text-xs font-medium text-violet-300"
  );

  // ═══ 10. FIX TABLE OUTER CONTAINER ═══
  c = c.replace(
    /rounded-3xl border border-\[#ececf2\] dark:border-gray-700 bg-white shadow-sm/g,
    "rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
  );

  // ═══ 11. FIX INNER TABLE BORDER ═══
  c = c.replace(
    /rounded-2xl border border-\[#ececf2\]/g,
    "rounded-2xl border border-[#ececf2] dark:border-gray-700"
  );

  // ═══ 12. FIX TEXT COLORS (consistency) ═══
  c = c.replace(
    /text-sm text-gray-500 dark:text-gray-400 mb-1/g,
    "text-sm text-gray-500 dark:text-gray-400 mb-1"
  );

  // ═══ 13. FIX CHECKBOX VISIBILITY ═══
  c = c.replace(
    /rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer/g,
    "rounded border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 focus:ring-purple-500 cursor-pointer"
  );

  // ═══ 14. FIX HOVER STATES ON BUTTONS (generic) ═══
  c = c.replace(
    /hover:bg-violet-50 dark:hover:bg-violet-900\/30 hover:shadow-sm/g,
    "hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.12)] hover:-translate-y-0.5"
  );

  // ═══ 15. FIX STAT CARDS (border, bg) ═══
  c = c.replace(
    /rounded-2xl border border-\[#ececf2\] p-6 transition-all hover:border-violet-200/g,
    "rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]"
  );
  c = c.replace(
    /rounded-2xl border border-\[#ececf2\] p-5 shadow-sm transition-all hover:shadow-md/g,
    "rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]"
  );

  // ═══ 16. FIX SUBTITLE TEXT ═══
  c = c.replace(
    /text-sm font-medium text-gray-500 dark:text-gray-400/g,
    "text-sm font-medium text-gray-500 dark:text-gray-400"
  );

  // ═══ 17. FIX TAB NAVIGATION ═══
  c = c.replace(
    /rounded-xl px-5 py-2\.5 text-sm font-semibold transition-all/g,
    "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200"
  );

  // ═══ 18. FIX ACTIVE TAB BUTTON ═══
  c = c.replace(
    /bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm/g,
    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
  );

  // ═══ 19. FIX "LIVE" STATUS INDICATOR ═══
  c = c.replace(
    /flex items-center gap-2 rounded-2xl bg-\[#f8f8fc\] dark:bg-gray-700 px-4 py-2\.5/g,
    "flex items-center gap-2 rounded-2xl bg-[#f8f8fc] dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50 px-4 py-2.5"
  );

  // ═══ 20. CLEAN UP DUPLICATE DARK CLASSES ═══
  c = c.replace(/dark:bg-gray-800 dark:bg-gray-800/g, "dark:bg-gray-800");
  c = c.replace(/dark:border-gray-700 dark:border-gray-700/g, "dark:border-gray-700");
  c = c.replace(/dark:bg-gray-700 dark:bg-gray-700/g, "dark:bg-gray-700");
  c = c.replace(/dark:text-gray-400 dark:text-gray-400/g, "dark:text-gray-400");
  c = c.replace(/dark:text-white dark:text-white/g, "dark:text-white");

  if (c !== before) {
    fs.writeFileSync(fp, c);
    console.log(`  ✅ Fixed: ${filename}`);
  } else {
    console.log(`  No changes: ${filename}`);
  }
});

console.log("\nAll pages updated!");