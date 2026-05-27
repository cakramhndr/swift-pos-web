import fs from "fs";

const pages = [
  "Transactions.jsx",
  "Inventory.jsx",
  "InventoryLogs.jsx",
  "Customers.jsx",
  "Reports.jsx",
  "Analytics.jsx",
  "ProductDetail.jsx",
  "Dashboard.jsx",
];

pages.forEach((filename) => {
  const fp = "src/pages/" + filename;
  if (!fs.existsSync(fp)) {
    console.log(`  Skipped: ${filename} (not found)`);
    return;
  }

  let c = fs.readFileSync(fp, "utf8");
  const before = c;

  // ═══ Fix 1: Table row hover - catch all variants ═══
  // Pattern: hover:bg-violet-50 dark:hover:bg-gray-700/50 transition-colors
  c = c.replace(
    /hover:bg-violet-50 dark:hover:bg-gray-700\/50 transition-colors/g,
    "hover:bg-violet-50 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors",
  );
  // Pattern: hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors (with "cursor-pointer" between)
  c = c.replace(
    /hover:bg-gray-100 dark:hover:bg-gray-700\/50 cursor-pointer transition-colors/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] cursor-pointer transition-colors",
  );
  // Pattern: hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors (Inventory)
  c = c.replace(
    /hover:bg-gray-100 dark:hover:bg-gray-700\/50 transition-colors/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors",
  );
  // Pattern: hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors (with bg-white in middle)
  c = c.replace(
    /bg-white dark:bg-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700\/50/g,
    "bg-white dark:bg-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]",
  );

  // ═══ Fix 2: Inventory badges (green/yellow stock status) ═══
  // Old: bg-green-100 text-green-700
  c = c.replace(
    /bg-green-100 text-green-700/g,
    "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
  );
  // Old: bg-red-100 dark:bg-red-900/30 text-red-700
  c = c.replace(
    /bg-red-100 dark:bg-red-900\/30 text-red-700/g,
    "bg-red-500/15 border border-red-500/30 text-red-300",
  );
  // Old: bg-yellow-100 text-yellow-700
  c = c.replace(
    /bg-yellow-100 text-yellow-700/g,
    "bg-amber-500/15 border border-amber-500/30 text-amber-300",
  );
  // Old: px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.color}
  // But also raw badges in Customers (Active Inactive New)
  // Fix Customers status badges
  c = c.replace(
    /"Active":"bg-green-100 dark:bg-green-900\/30 text-green-700","Inactive":"bg-gray-100 text-gray-600 dark:text-gray-300","New":"bg-blue-100 text-blue-700"/g,
    '"Active":"bg-emerald-500/15 border border-emerald-500/30 text-emerald-300","Inactive":"bg-gray-500/15 border border-gray-500/30 text-gray-400","New":"bg-violet-500/15 border border-violet-500/30 text-violet-300"',
  );
  // Also directly fix the object literal pattern
  c = c.replace(
    /Active: "bg-green-100 dark:bg-green-900\/30 text-green-700"/g,
    'Active: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"',
  );
  c = c.replace(
    /Inactive: "bg-gray-100 text-gray-600 dark:text-gray-300"/g,
    'Inactive: "bg-gray-500/15 border border-gray-500/30 text-gray-400"',
  );
  c = c.replace(
    /New: "bg-blue-100 text-blue-700"/g,
    'New: "bg-violet-500/15 border border-violet-500/30 text-violet-300"',
  );

  // ═══ Fix 3: Checkboxes - all variants ═══
  // The checkbox in Products is already correct
  // Transactions has no checkboxes (no bulk select)
  // But some files might still have old checkbox patterns
  c = c.replace(
    /rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer/g,
    "rounded border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 focus:ring-purple-500 cursor-pointer",
  );

  // ═══ Fix 4: Select dropdowns ═══
  // Some selects might have escaped the previous regex
  // Pattern: select with px-4 py-3 instead of py-2.5
  c = c.replace(
    /className="rounded-2xl border border-\[#ececf2\] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"/g,
    'className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer dark:text-white"',
  );

  // ═══ Fix 5: Empty state container icons with ring ═══
  c = c.replace(
    /flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/g,
    "flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50",
  );

  // ═══ Fix 6: "color" class for badge/system status ═══
  // Some files use template literal `${status.color}` for badges - these might fall through
  // Fix the getStockStatus function in Inventory
  c = c.replace(
    /color: "bg-green-100 text-green-700"/g,
    'color: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"',
  );
  c = c.replace(
    /color: "bg-yellow-100 text-yellow-700"/g,
    'color: "bg-amber-500/15 border border-amber-500/30 text-amber-300"',
  );
  c = c.replace(
    /color: "bg-red-100 dark:bg-red-900\/30 text-red-700"/g,
    'color: "bg-red-500/15 border border-red-500/30 text-red-300"',
  );

  // ═══ Fix 7: Data table in Reports (salesByProduct rows) ═══
  c = c.replace(
    /bg-white dark:bg-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700\/50/g,
    "bg-white dark:bg-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]",
  );

  // ═══ Fix 8: Dashboard specific fixes ═══
  if (filename === "Dashboard.jsx") {
    // Dashboard already handled most by previous runs
  }

  // ═══ Fix 9: Analytics specific ──────────────────────────────────
  if (filename === "Analytics.jsx") {
    // Fix the hover:bg-violet-50 dark:hover:bg-gray-700/50 transition-colors
    c = c.replace(
      /hover:bg-violet-50 dark:hover:bg-gray-700\/50 transition-colors/g,
      "hover:bg-violet-50 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors",
    );
  }

  // ═══ Fix 10: ProductDetail specifics ═══
  if (filename === "ProductDetail.jsx") {
    c = c.replace(
      /hover:bg-violet-50 dark:hover:bg-gray-700\/50/g,
      "hover:bg-violet-50 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]",
    );
  }

  // ═══ Final: Clean duplicates ═══
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
    console.log(`  ✅ Fixed: ${filename}`);
  } else {
    console.log(`  No changes: ${filename}`);
  }
});

console.log("\n✅ Round 2: Dark mode consistency applied!");
