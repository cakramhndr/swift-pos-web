import fs from "fs";

const pages = [
  "Transactions.jsx",
  "Inventory.jsx",
  "InventoryLogs.jsx",
  "Customers.jsx",
  "Reports.jsx",
  "Analytics.jsx",
  "ProductDetail.jsx",
];

pages.forEach((filename) => {
  const fp = "src/pages/" + filename;
  if (!fs.existsSync(fp)) {
    console.log(`  Skipped: ${filename} (not found)`);
    return;
  }

  let c = fs.readFileSync(fp, "utf8");
  const before = c;

  // ═══ 1. FIX ALL STATUS BADGES/PILLS ═══
  // Old badge patterns -> new Products-style badges

  // Green/emerald success badges
  c = c.replace(
    /bg-green-50 text-green-700 dark:text-green-300 ring-1 ring-green-200/g,
    "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
  );
  c = c.replace(
    /bg-green-100 text-green-700 dark:text-green-300 ring-1 ring-green-200/g,
    "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
  );
  c = c.replace(
    /rounded-full bg-green-100 dark:bg-green-900\/30 text-green-700/g,
    "rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
  );
  c = c.replace(
    /rounded-full bg-green-100 dark:bg-green-900\/30 px-3 py-1 text-xs font-medium text-green-700/g,
    "rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300",
  );

  // Red danger badges
  c = c.replace(
    /rounded-full bg-red-50 text-red-600 dark:text-red-400 ring-1 ring-red-200/g,
    "rounded-full bg-red-500/15 border border-red-500/30 text-red-300",
  );
  c = c.replace(
    /bg-red-100 dark:bg-red-900\/30 text-red-700/g,
    "bg-red-500/15 border border-red-500/30 text-red-300",
  );

  // Yellow/amber warning badges
  c = c.replace(
    /bg-yellow-50 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-200/g,
    "bg-amber-500/15 border border-amber-500/30 text-amber-300",
  );
  c = c.replace(
    /bg-yellow-100 text-yellow-700/g,
    "bg-amber-500/15 border border-amber-500/30 text-amber-300",
  );
  c = c.replace(
    /bg-yellow-100 dark:bg-yellow-900\/30 text-yellow-700/g,
    "bg-amber-500/15 border border-amber-500/30 text-amber-300",
  );

  // Blue/info badges
  c = c.replace(
    /bg-blue-100 text-blue-700/g,
    "bg-violet-500/15 border border-violet-500/30 text-violet-300",
  );

  // Gray default badges
  c = c.replace(
    /bg-gray-50 dark:bg-gray-800 px-2\.5 py-0\.5 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-gray-200/g,
    "bg-gray-500/15 border border-gray-500/30 px-2.5 py-0.5 text-xs font-medium text-gray-400",
  );

  // ═══ 2. FIX TABLE HEADER ROWS ═══
  // All table header gradients should have dark mode support
  c = c.replace(
    /bg-gradient-to-r from-\[#f8f8fc\] to-white text-left text-sm text-gray-500/g,
    "bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-sm text-gray-500 dark:text-gray-400",
  );
  // Fix standalone table header rows without dark
  c = c.replace(
    /bg-gradient-to-r from-\[#f8f8fc\] to-white text-left text-gray-500/g,
    "bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-gray-500 dark:text-gray-400",
  );

  // ═══ 3. FIX TABLE ROW HOVER (all variants) ═══
  c = c.replace(
    /hover:bg-gray-100 dark:hover:bg-gray-700\/50 transition-colors/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors",
  );
  c = c.replace(
    /hover:bg-gray-100 dark:hover:bg-gray-700\/50 transition-colors duration-150/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors duration-150",
  );

  // ═══ 4. FIX ALL SEARCH INPUTS ═══
  // All variants of search/input fields
  c = c.replace(
    /className="w-full rounded-2xl border border-\[#ececf2\] dark:border-gray-700 bg-white dark:bg-gray-800 py-2\.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/g,
    'className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"',
  );
  c = c.replace(
    /className="w-full rounded-2xl border border-\[#ececf2\] dark:border-gray-700 py-2\.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/g,
    'className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"',
  );
  // Search in Reports/Inventory
  c = c.replace(
    /className="w-56 rounded-2xl border border-\[#ececf2\] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2\.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"/g,
    'className="w-56 rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"',
  );

  // ═══ 5. FIX ALL SELECT DROPDOWNS ═══
  // Select with bg-white dark:bg-gray-800
  c = c.replace(
    /className="rounded-2xl border border-\[#ececf2\] dark:border-gray-700 px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer bg-white dark:bg-gray-800"/g,
    'className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"',
  );
  // Select with dark:bg-gray-700 already
  c = c.replace(
    /className="rounded-2xl border border-\[#ececf2\] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"/g,
    'className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"',
  );
  // Select with dark:text-white already
  c = c.replace(
    /className="rounded-2xl border border-\[#ececf2\] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer dark:text-white"/g,
    'className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"',
  );
  // Plain select without explicit bg
  c = c.replace(
    /className="rounded-2xl border border-\[#ececf2\] dark:border-gray-700 px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"/g,
    'className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"',
  );

  // ═══ 6. FIX PAGINATION BUTTONS ═══
  c = c.replace(
    /flex h-9 w-9 items-center justify-center rounded-xl border border-\[#ececf2\] dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900\/30 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40/g,
    "flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40",
  );

  // ═══ 7. FIX SKU/MONO BADGES ═══
  c = c.replace(
    /bg-gray-100 dark:bg-gray-700 px-2\.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300/g,
    "bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400",
  );
  c = c.replace(
    /rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300/g,
    "rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400",
  );
  // inline-flex count badges
  c = c.replace(
    /inline-flex items-center justify-center rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200/g,
    "inline-flex items-center justify-center rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-sm font-semibold text-gray-500 dark:text-gray-400",
  );

  // ═══ 8. FIX "more items" BADGE ═══
  c = c.replace(
    /bg-violet-50 dark:bg-violet-900\/30 px-2\.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400/g,
    "bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 text-xs font-medium text-violet-300",
  );

  // ═══ 9. FIX OUTER TABLE CONTAINERS ═══
  c = c.replace(
    /rounded-3xl border border-\[#ececf2\] dark:border-gray-700 bg-white shadow-sm/g,
    "rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm",
  );

  // ═══ 10. FIX INNER TABLE BORDERS ═══
  c = c.replace(
    /rounded-2xl border border-\[#ececf2\](?! dark)/g,
    "rounded-2xl border border-[#ececf2] dark:border-gray-700",
  );

  // ═══ 11. FIX STAT CARDS ═══
  // Top-level stat cards with p-6
  c = c.replace(
    /rounded-2xl border border-\[#ececf2\] dark:border-gray-700 p-6 transition-all(?! tab)/g,
    "rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200",
  );
  // Stat cards with p-5
  c = c.replace(
    /rounded-2xl border border-\[#ececf2\] dark:border-gray-700 p-5 shadow-sm transition-all hover:shadow-md/g,
    "rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]",
  );
  // Stat cards that may still miss dark:bg
  c = c.replace(
    /rounded-2xl border border-\[#ececf2\] dark:border-gray-700 bg-white p-5 shadow-sm transition-all hover:shadow-md/g,
    "rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]",
  );

  // ═══ 12. FIX TAB BAR BACKGROUND ═══
  c = c.replace(
    /rounded-2xl bg-\[#f8f8fc\] p-1\.5/g,
    "rounded-2xl bg-[#f8f8fc] dark:bg-gray-800/80 p-1.5",
  );

  // ═══ 13. FIX INACTIVE TAB BUTTONS ═══
  c = c.replace(
    /text-gray-500 hover:text-gray-700/g,
    "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
  );

  // ═══ 14. FIX "LIVE" STATUS INDICATOR ═══
  c = c.replace(
    /flex items-center gap-2 rounded-2xl bg-\[#f8f8fc\] px-4 py-2\.5(?! dark)/g,
    "flex items-center gap-2 rounded-2xl bg-[#f8f8fc] dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50 px-4 py-2.5",
  );

  // ═══ 15. FIX EMPTY STATE ICON CONTAINERS ═══
  c = c.replace(
    /flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/g,
    "flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50",
  );
  c = c.replace(
    /flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/g,
    "flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50",
  );

  // ═══ 16. FIX ICON BUBBLE BACKGROUNDS (stat card icons) ═══
  c = c.replace(
    /bg-purple-100 dark:bg-purple-900\/30/g,
    "bg-purple-100 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/30",
  );
  c = c.replace(
    /bg-yellow-100 dark:bg-yellow-900\/30/g,
    "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-800/30",
  );
  c = c.replace(
    /bg-red-100 dark:bg-red-900\/30/g,
    "bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30",
  );
  c = c.replace(
    /bg-green-100 dark:bg-green-900\/30/g,
    "bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30",
  );
  c = c.replace(
    /bg-blue-100 dark:bg-blue-900\/30/g,
    "bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30",
  );
  c = c.replace(
    /bg-orange-100 dark:bg-orange-900\/30/g,
    "bg-orange-100 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30",
  );

  // ═══ 17. FIX CHECKBOX VISIBILITY ═══
  c = c.replace(
    /rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer/g,
    "rounded border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 focus:ring-purple-500 cursor-pointer",
  );

  // ═══ 18. FIX PERIOD FILTER BUTTONS (Reports) ═══
  c = c.replace(
    /border border-\[#ececf2\] dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900\/30 hover:shadow-\[0_0_12px_-2px_rgba\(168,85,247,0\.15\)\] dark:hover:shadow-\[0_0_12px_-2px_rgba\(168,85,247,0\.1\)\] hover:text-violet-600 transition-all duration-200/g,
    "border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 transition-all duration-200",
  );

  // ═══ 19. FIX DATE INPUTS (Reports) ═══
  c = c.replace(
    /className="rounded-xl border border-\[#ececf2\] dark:border-gray-700 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/g,
    'className="rounded-xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"',
  );

  // ═══ 20. FIX PAYMENT METHOD BADGES ═══
  c = c.replace(
    /inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300/g,
    "inline-flex items-center gap-1 rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400",
  );

  // ═══ 21. FIX TABLE DIVIDE STYLE ═══
  c = c.replace(
    /divide-y divide-gray-50\/80/g,
    "divide-y divide-gray-100 dark:divide-gray-700/50",
  );

  // ═══ 22. FIX BORDER-B ON TABLE HEADERS ═══
  c = c.replace(
    /border-b border-gray-100 dark:border-gray-700\/80/g,
    "border-b border-gray-200 dark:border-gray-700/60",
  );

  // ═══ 23. FIX PRODUCT CARD IN TRANSACTIONS ═══
  c = c.replace(
    /className="group cursor-pointer rounded-2xl border border-\[#ececf2\] dark:border-gray-700 p-4 text-left transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0\.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"/g,
    'className="group cursor-pointer rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-left transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"',
  );

  // ═══ 24. FIX VARIANT PICKER BADGES ═══
  c = c.replace(
    /bg-red-50 text-red-600 dark:text-red-400 ring-1 ring-red-200/g,
    "bg-red-500/15 border border-red-500/30 text-red-300",
  );

  // ═══ 25. FIX INVENTORY RESTOCK/ADJUST BUTTONS ═══
  c = c.replace(
    /inline-flex items-center gap-1 rounded-lg border border-violet-200 px-2\.5 py-1\.5 text-xs font-medium text-violet-600 transition-all hover:bg-violet-50 dark:hover:bg-violet-900\/30 hover:shadow-\[0_0_16px_-2px_rgba\(168,85,247,0\.2\)\] dark:hover:shadow-\[0_0_16px_-2px_rgba\(168,85,247,0\.12\)\] hover:-translate-y-0\.5/g,
    "inline-flex items-center gap-1 rounded-lg border border-violet-200 dark:border-violet-800/40 px-2.5 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-300 transition-all duration-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.12)] hover:-translate-y-0.5",
  );
  c = c.replace(
    /inline-flex items-center gap-1 rounded-lg border border-\[#ececf2\] dark:border-gray-700 px-2\.5 py-1\.5 text-xs font-medium text-gray-600 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm/g,
    "inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.2)] hover:-translate-y-0.5",
  );

  // ═══ 26. FIX VARIANT ROW IN INVENTORY (expandable) ═══
  c = c.replace(
    /border-t border-purple-100 transition-colors hover:bg-purple-50 dark:hover:bg-purple-900\/20/g,
    "border-t border-purple-100 dark:border-purple-900/30 transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20",
  );

  // ═══ 27. FIX REF ID BADGE ═══
  c = c.replace(
    /text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 px-2 py-1 rounded-lg/g,
    "text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2 py-1 rounded-lg",
  );

  // ═══ 28. FIX ENRICHED SUPPLIER TABLE BORDERS ═══
  c = c.replace(
    /border-t border-\[#ececf2\] dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700\/50/g,
    "border-t border-[#ececf2] dark:border-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]",
  );

  // ═══ 29. FIX INVENTORY HEADER TH STYLES ═══
  c = c.replace(
    /text-\[12px\] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400 w-/g,
    "text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-",
  );

  // ═══ 30. CLEAN UP DUPLICATE CLASSES ═══
  c = c.replace(/dark:bg-gray-800 dark:bg-gray-800/g, "dark:bg-gray-800");
  c = c.replace(
    /dark:border-gray-700 dark:border-gray-700/g,
    "dark:border-gray-700",
  );
  c = c.replace(/dark:bg-gray-700 dark:bg-gray-700/g, "dark:bg-gray-700");
  c = c.replace(/dark:text-gray-400 dark:text-gray-400/g, "dark:text-gray-400");
  c = c.replace(/dark:text-white dark:text-white/g, "dark:text-white");
  c = c.replace(
    /transition-all duration-200 duration-200/g,
    "transition-all duration-200",
  );

  if (c !== before) {
    fs.writeFileSync(fp, c);
    const diffs = [...c.matchAll(/✅|FIX/g)].length;
    console.log(`  ✅ Fixed: ${filename}`);
  } else {
    console.log(`  No changes: ${filename}`);
  }
});

// ─── Also fix Dashboard if needed ─────────────────────────────────────
const dashFp = "src/pages/Dashboard.jsx";
if (fs.existsSync(dashFp)) {
  let d = fs.readFileSync(dashFp, "utf8");
  const dashBefore = d;

  // Fix border-b on Dashboard table headers
  d = d.replace(
    /border-b border-gray-100 dark:border-gray-700\/80/g,
    "border-b border-gray-200 dark:border-gray-700/60",
  );
  // Fix Recent Orders table row hover
  d = d.replace(
    /hover:bg-gray-100 dark:hover:bg-gray-700\/50 transition-colors duration-150/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors duration-150",
  );
  // Fix divide style
  d = d.replace(
    /divide-y divide-gray-50\/80/g,
    "divide-y divide-gray-100 dark:divide-gray-700/50",
  );

  if (d !== dashBefore) {
    fs.writeFileSync(dashFp, d);
    console.log("  ✅ Fixed: Dashboard.jsx");
  }
}

console.log("\n✅ Dark mode consistency applied to all pages!");
