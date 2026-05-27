import fs from "fs";

// All page files to process
const PAGES = [
  "Dashboard.jsx",
  "Transactions.jsx",
  "Products.jsx",
  "Inventory.jsx",
  "InventoryLogs.jsx",
  "Customers.jsx",
  "Reports.jsx",
  "Analytics.jsx",
  "ProductDetail.jsx",
];

const SRC = "src/pages/";

function fixFile(filename) {
  const fp = SRC + filename;
  if (!fs.existsSync(fp)) {
    console.log(`  [SKIP] ${filename}: not found`);
    return;
  }

  let c = fs.readFileSync(fp, "utf8");
  const before = c;

  // ════════════════════════════════════════════════════════════════
  // 1. FIX ALL TYPOGRAPHY
  // ════════════════════════════════════════════════════════════════

  // H1 titles: text-gray-900 without dark variant
  c = c.replace(
    /text-3xl font-bold tracking-tight text-gray-900(?! dark:)/g,
    "text-3xl font-bold tracking-tight text-gray-900 dark:text-white",
  );
  // H2 titles
  c = c.replace(
    /text-lg font-bold text-gray-900(?! dark:)/g,
    "text-lg font-bold text-gray-900 dark:text-white",
  );
  c = c.replace(
    /text-base font-bold text-gray-900(?! dark:)/g,
    "text-base font-bold text-gray-900 dark:text-white",
  );
  c = c.replace(
    /text-xl font-bold text-gray-900(?! dark:)/g,
    "text-xl font-bold text-gray-900 dark:text-white",
  );
  // Generic text-gray-900 that should have dark:text-white
  c = c.replace(
    /font-semibold text-gray-900(?! dark:)/g,
    "font-semibold text-gray-900 dark:text-white",
  );
  c = c.replace(
    /font-bold text-gray-900(?! dark:)/g,
    "font-bold text-gray-900 dark:text-white",
  );
  // text-gray-700 -> dark:text-gray-200
  c = c.replace(
    /text-gray-700(?! dark:)(?!-)(?! )/g,
    "text-gray-700 dark:text-gray-200",
  );
  // text-gray-600 -> dark:text-gray-300 (better contrast)
  c = c.replace(
    /text-gray-600(?! dark:)(?!-)(?! )/g,
    "text-gray-600 dark:text-gray-300",
  );
  // text-gray-500 -> dark:text-gray-400
  c = c.replace(
    /text-gray-500(?! dark:)(?!-)(?! )/g,
    "text-gray-500 dark:text-gray-400",
  );

  // ════════════════════════════════════════════════════════════════
  // 2. FIX TEXT-BLACK
  // ════════════════════════════════════════════════════════════════
  c = c.replace(/text-black(?! dark:)/g, "text-black dark:text-white");

  // ════════════════════════════════════════════════════════════════
  // 3. FIX STATS CARD ICONS
  // ════════════════════════════════════════════════════════════════
  // Replace old icon bubble patterns with consistent dark-mode aware style

  // Blue icon bubbles
  c = c.replace(
    /flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100(?! border)/g,
    "flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30",
  );
  c = c.replace(
    /flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100(?! border)/g,
    "flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30",
  );

  // Green icon bubbles
  c = c.replace(
    /flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100(?! border)/g,
    "flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30",
  );
  c = c.replace(
    /flex h-10 w-10 items-center justify-center rounded-xl bg-green-100(?! border)/g,
    "flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30",
  );

  // Amber icon bubbles
  c = c.replace(
    /flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100(?! border)/g,
    "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30",
  );
  c = c.replace(
    /flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100(?! border)/g,
    "flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30",
  );

  // Purple icon bubbles
  c = c.replace(
    /flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100(?! border)/g,
    "flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/30",
  );
  c = c.replace(
    /flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100(?! border)/g,
    "flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/30",
  );

  // Orange icon bubbles
  c = c.replace(
    /flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100(?! border)/g,
    "flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30",
  );
  c = c.replace(
    /flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100(?! border)/g,
    "flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30",
  );

  // ════════════════════════════════════════════════════════════════
  // 4. FIX CARD HOVER EFFECTS
  // ════════════════════════════════════════════════════════════════
  // Replace old stat card hover patterns with refined version
  c = c.replace(
    /transition-all duration-200 hover:border-violet-200 hover:shadow-md(?! dark)/g,
    "transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]",
  );

  // For Analytics page - card without growth bar
  c = c.replace(
    /transition-all duration-200 hover:border-violet-200 hover:shadow-md/g,
    "transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]",
  );

  // ════════════════════════════════════════════════════════════════
  // 5. FIX SEGMENTED TABS (Inventory Logs tab bar)
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /rounded-2xl bg-\[#f8f8fc\] dark:bg-gray-800\/80 p-1\.5/g,
    "rounded-2xl bg-[#f8f8fc] dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 p-1.5",
  );
  // Inactive tab
  c = c.replace(
    /text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200/g,
    "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white",
  );

  // ════════════════════════════════════════════════════════════════
  // 6. FIX SEGMENT CARDS IN CRM (Analytics)
  // ════════════════════════════════════════════════════════════════
  if (filename === "Analytics.jsx") {
    // Fix VIP segment button colors
    c = c.replace(
      /border-amber-400 bg-amber-50/g,
      "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20",
    );
    c = c.replace(
      /hover:border-amber-200 hover:bg-amber-50\/50/g,
      "hover:border-amber-300 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
    );
    // Regular segment button
    c = c.replace(
      /border-blue-400 bg-blue-50/g,
      "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20",
    );
    c = c.replace(
      /hover:border-blue-200 hover:bg-blue-50\/50/g,
      "hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
    );
    // New segment button
    c = c.replace(
      /border-green-400 bg-green-50/g,
      "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20",
    );
    c = c.replace(
      /hover:border-green-200 hover:bg-green-50\/50/g,
      "hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10",
    );
    // Inactive segment button
    c = c.replace(
      /border-red-400 bg-red-50/g,
      "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20",
    );
    c = c.replace(
      /hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900\/20\/50/g,
      "hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
    );
    // Fix segment badge VIP/Inactive
    c = c.replace(
      /VIP: "bg-amber-100 text-amber-700"/g,
      'VIP: "bg-amber-500/15 border border-amber-500/30 text-amber-300"',
    );
    c = c.replace(
      /Inactive: "bg-red-100 text-red-700"/g,
      'Inactive: "bg-red-500/15 border border-red-500/30 text-red-300"',
    );
    // Fix segment icon colors dark
    c = c.replace(
      /text-amber-600 dark:text-amber-400/,
      "text-amber-600 dark:text-amber-300",
    );
    c = c.replace(/text-amber-700/, "text-amber-700 dark:text-amber-300");
    c = c.replace(/text-blue-700/, "text-blue-700 dark:text-blue-300");
    c = c.replace(/text-green-700/, "text-green-700 dark:text-green-300");
    c = c.replace(
      /text-red-700 dark:text-red-300/,
      "text-red-400 dark:text-red-300",
    );
    // Fix inactive card bg
    c = c.replace(/bg-red-100(?! dark:)/g, "bg-red-100 dark:bg-red-900/30");
  }

  // ════════════════════════════════════════════════════════════════
  // 7. FIX REPORTS PERIOD FILTERS (segmented buttons)
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /border border-\[#ececf2\] dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900\/30 hover:shadow-\[0_0_12px_-2px_rgba\(168,85,247,0\.15\)\] dark:hover:shadow-\[0_0_12px_-2px_rgba\(168,85,247,0\.1\)\] hover:text-violet-600 transition-all duration-200/g,
    "px-4 py-2 rounded-xl text-sm font-medium transition-all border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-800/60 text-gray-600 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-gray-700/60 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 dark:hover:text-white",
  );

  // ════════════════════════════════════════════════════════════════
  // 8. FIX INVENTORY LOGS TAB (active/inactive)
  // ════════════════════════════════════════════════════════════════
  // Active tab: bg-white -> bg-violet-600 with glow
  c = c.replace(
    /bg-white text-gray-900 dark:text-white shadow-sm/g,
    "bg-violet-600 dark:bg-violet-600 text-white dark:text-white shadow-lg shadow-violet-500/20",
  );
  // Inactive tab: already handled above

  // ════════════════════════════════════════════════════════════════
  // 9. FIX ALL BORDER-B AND DIVIDE STYLES
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /border-b border-\[#ececf2\] dark:border-gray-700/g,
    "border-b border-[#ececf2] dark:border-gray-700/60",
  );
  c = c.replace(
    /border-t border-\[#ececf2\] dark:border-gray-700/g,
    "border-t border-[#ececf2] dark:border-gray-700/60",
  );
  c = c.replace(
    /divide-y divide-\[#ececf2\]/g,
    "divide-y divide-[#ececf2] dark:divide-gray-700/50",
  );

  // ════════════════════════════════════════════════════════════════
  // 10. FIX BUTTON HOVER STATES
  // ════════════════════════════════════════════════════════════════
  // Manage Categories / similar secondary buttons
  c = c.replace(
    /hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-200",
  );
  // Bulk action buttons
  c = c.replace(
    /hover:bg-gray-50 dark:hover:bg-gray-700/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200",
  );

  // ════════════════════════════════════════════════════════════════
  // 11. FIX REPORTS ACTIVE PERIOD BUTTON
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm(?! dark)/g,
    "bg-gradient-to-r from-violet-600 to-purple-600 text-white dark:text-white shadow-lg shadow-violet-500/20",
  );

  // ════════════════════════════════════════════════════════════════
  // 12. FIX ICON TEXT COLORS IN DARK MODE
  // ════════════════════════════════════════════════════════════════
  c = c.replace(/text-blue-600(?! dark:)/g, "text-blue-600 dark:text-blue-400");
  c = c.replace(
    /text-green-600(?! dark:)/g,
    "text-green-600 dark:text-green-400",
  );
  c = c.replace(
    /text-amber-600(?! dark:)/g,
    "text-amber-600 dark:text-amber-400",
  );
  c = c.replace(
    /text-orange-600(?! dark:)/g,
    "text-orange-600 dark:text-orange-400",
  );
  c = c.replace(/text-red-600(?! dark:)/g, "text-red-600 dark:text-red-400");

  // ════════════════════════════════════════════════════════════════
  // 13. FIX TABLE HEADER TEXT
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /text-gray-500 dark:text-gray-400/g,
    "text-gray-500 dark:text-gray-400",
  );
  // Already good, but ensure uppercase tracking is consistent
  c = c.replace(
    /text-xs uppercase tracking-wider/g,
    "text-xs uppercase tracking-[0.08em]",
  );

  // ════════════════════════════════════════════════════════════════
  // 14. FIX MODAL BACKGROUNDS
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl/g,
    "rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm",
  );

  // ════════════════════════════════════════════════════════════════
  // 15. FIX GRADIENT TO WHITE SECTIONS (receipt/Invoice BG)
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /bg-gradient-to-r from-\[#f8f8fc\] to-white(?! dark)/g,
    "bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60",
  );

  // ════════════════════════════════════════════════════════════════
  // 16. FIX PRODUCT CARD IN TRANSACTIONS
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /bg-gradient-to-br from-violet-50 to-purple-50/g,
    "bg-gradient-to-br from-violet-50 dark:from-violet-900/30 to-purple-50 dark:to-purple-900/30",
  );

  // ════════════════════════════════════════════════════════════════
  // 17. FIX "Needs attention" section in CRM
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /rounded-2xl border border-red-200 bg-red-50\/50 overflow-hidden/g,
    "rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 overflow-hidden",
  );
  c = c.replace(
    /border-b border-red-200/g,
    "border-b border-red-200 dark:border-red-800/50",
  );
  c = c.replace(
    /divide-y divide-red-200/g,
    "divide-y divide-red-200 dark:divide-red-800/30",
  );

  // ════════════════════════════════════════════════════════════════
  // 18. FIX PAYMENT METHOD BADGES (gray translucent)
  // ════════════════════════════════════════════════════════════════
  c = c.replace(
    /inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300/g,
    "inline-flex items-center gap-1 rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400",
  );

  // ════════════════════════════════════════════════════════════════
  // 19. CLEAN DUPLICATE CLASSES
  // ════════════════════════════════════════════════════════════════
  c = c.replace(/dark:bg-gray-800 dark:bg-gray-800/g, "dark:bg-gray-800");
  c = c.replace(
    /dark:border-gray-700 dark:border-gray-700/g,
    "dark:border-gray-700",
  );
  c = c.replace(/dark:bg-gray-700 dark:bg-gray-700/g, "dark:bg-gray-700");
  c = c.replace(/dark:text-white dark:text-white/g, "dark:text-white");
  c = c.replace(/dark:text-gray-400 dark:text-gray-400/g, "dark:text-gray-400");
  c = c.replace(/dark:text-gray-200 dark:text-gray-200/g, "dark:text-gray-200");
  c = c.replace(/dark:text-gray-300 dark:text-gray-300/g, "dark:text-gray-300");
  c = c.replace(
    /transition-all duration-200 duration-200/g,
    "transition-all duration-200",
  );

  if (c !== before) {
    fs.writeFileSync(fp, c);
    console.log(`  ✅ Fixed: ${filename}`);
  } else {
    console.log(`  No changes: ${filename}`);
  }
}

// Process all pages
console.log("=== Full Dark Mode Polish ===\n");
PAGES.forEach(fixFile);

console.log("\n✅ Complete!");
console.log("Changes applied:");
console.log(
  "  - Fixed all typography (text-gray-900, text-gray-700, etc. with dark variants)",
);
console.log(
  "  - Fixed all stats card icon bubbles (translucent bg, border, dark mode)",
);
console.log("  - Fixed card hover effects (consistent violet glow)");
console.log("  - Fixed segmented tabs (Inventory Logs, Reports, CRM)");
console.log("  - Fixed CRM segment cards (dark mode backgrounds)");
console.log("  - Fixed Reports period filter buttons");
console.log("  - Fixed borders and dividers (subtle dark variants)");
console.log("  - Fixed button hover states");
console.log("  - Fixed modal backgrounds (blur + dark variant)");
console.log("  - Fixed icon text colors in dark mode");
console.log("  - Fixed gradient backgrounds for dark mode");
console.log("  - Fixed CRM 'needs attention' section");
console.log("  - Fixed payment method badges");
