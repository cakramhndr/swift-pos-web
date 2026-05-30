/**
 * Final pass: Replace ALL remaining branding purple/violet with accent CSS variables.
 * Only replaces BRAND accent colors. Preserves semantic colors.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const files = [
  "src/pages/Transactions.jsx",
  "src/pages/Customers.jsx",
  "src/pages/Inventory.jsx",
  "src/pages/InventoryLogs.jsx",
  "src/pages/Products.jsx",
  "src/pages/Reports.jsx",
  "src/pages/Analytics.jsx",
  "src/pages/Dashboard.jsx",
  "src/pages/ProductDetail.jsx",
  "src/components/layout/AppSidebar.jsx",
  "src/pages/Settings.jsx",
];

// Only exact brand accent color replacements
const reps = [
  // === Sidebar ===
  ["bg-gradient-to-br from-purple-600 to-purple-500 shadow-md shadow-purple-500/20 dark:shadow-purple-500/10", "bg-accent shadow-md shadow-accent/20"],
  ["bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-400/15 dark:to-purple-500/15 border border-purple-200/50 dark:border-purple-500/20", "bg-accent/10 border border-accent/30"],
  ["? \"bg-purple-500/15 text-accent border border-purple-500/20\"", '? "bg-accent/15 text-accent border border-accent/20"'],
  ["isDark ? \"bg-purple-500/30\"", 'isDark ? "bg-accent/30"'],

  // === Active tab buttons (InventoryLogs) ===
  ["? \"bg-violet-600 dark:bg-violet-600 text-white dark:text-white shadow-lg shadow-accent/20\"", '? "bg-accent text-white shadow-lg shadow-accent/20"'],

  // === Stat card icon containers (Reports, Analytics, Customers, Inventory) ===
  // "bg-purple-100 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/30"
  ["bg-purple-100 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/30", "bg-accent-light dark:bg-accent/20 border border-accent/30"],

  // === Stat card icon text ===  
  ["text-purple-600 dark:text-purple-400", "text-accent dark:text-accent"],
  ["text-violet-600 dark:text-violet-400", "text-accent dark:text-accent"],
  ["text-violet-600", "text-accent"],
  ["text-violet-500", "text-accent"],
  ["text-purple-600", "text-accent"],
  ["text-purple-500", "text-accent"],

  // === Dashboard revenue progress bars ===
  ["bg-purple-500", "bg-accent"],
  ["bg-purple-200", "bg-accent-light"],
  ["text-purple-600 dark:text-purple-400", "text-accent dark:text-accent"],
  ["text-purple-300 dark:text-accent", "text-accent/50"],
  ["hover:border-violet-200/80", "hover:border-accent/80"],

  // === ProductDetail category badge ===
  ["rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-accent", "rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent"],
  ["border border-violet-200 px-5 py-3 text-sm font-medium text-accent", "border border-accent px-5 py-3 text-sm font-medium text-accent"],

  // === Transaction item stock badge ===
  ["? \"bg-violet-100 dark:bg-violet-900/30 text-accent group-hover:bg-violet-600 group-hover:text-white\"", '? "bg-accent-light dark:bg-accent/20 text-accent group-hover:bg-accent group-hover:text-white"'],
  ["? \"border-violet-400 bg-violet-50\"", '? "border-accent bg-accent-light"'],
  ["? \"border-violet-400 bg-violet-50\"", '? "border-accent bg-accent-light"'],

  // === More items badge ===
  ["rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-accent dark:text-accent", "rounded-lg bg-accent-light px-2.5 py-1 text-xs font-medium text-accent"],
  
  // === Product variants badge ===
  ["bg-purple-100 dark:bg-purple-900/30 text-accent dark:text-accent px-2 py-0.5 rounded-full", "bg-accent-light dark:bg-accent/20 text-accent px-2 py-0.5 rounded-full"],
  
  // === Selected products count bar ===
  ["bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-900/20 dark:border-purple-800/30", "bg-accent-light border border-accent rounded-lg dark:bg-accent/20 dark:border-accent/30"],

  // === Table row hover selected ===
  ["? \"bg-purple-50 dark:bg-gray-700/30\"", '? "bg-accent-light dark:bg-gray-700/30"'],
  ["bg-purple-50/30", "bg-accent-light/50"],
  ["bg-purple-50 dark:bg-purple-900/30", "bg-accent-light dark:bg-accent/20"],

  // === Inventory variant rows ===
  ["border-t border-purple-100 dark:border-purple-900/30", "border-t border-accent/30"],
  
  // === Category badge ===
  ["border border-purple-300 text-accent dark:text-accent rounded-md", "border border-accent text-accent rounded-md"],

  // === Variant count label ===
  ["text-accent dark:text-accent border border-violet-200 px-2 py-0.5 rounded-md", "text-accent border border-accent px-2 py-0.5 rounded-md"],

  // === Import/Category bottom border ===
  ["border border-purple-200 dark:border-purple-800/40 px-4 py-3", "border border-accent dark:border-accent/40 px-4 py-3"],

  // === Manage category button ===
  ["border-purple-200 dark:border-purple-800/40 px-5 py-2.5", "border-accent dark:border-accent/40 px-5 py-2.5"],
  ["dark:text-purple-300", "dark:text-accent"],

  // === Selected ids checkbox ===  
  ["text-purple-600 dark:text-purple-400", "text-accent"],
  ["text-purple-600 dark:focus:ring-purple-500", "text-accent focus:ring-accent"],

  // === Analytics segment ===
  ["bg-violet-500/15 border border-violet-500/30 text-accent", "bg-accent/15 border border-accent/30 text-accent"],

  // === Dark mode bg variants ===
  ["dark:bg-purple-900/30", "dark:bg-accent/30"],
  ["dark:bg-purple-900/20", "dark:bg-accent/20"],
  ["dark:bg-purple-950/50", "dark:bg-accent/20"],
  ["dark:bg-violet-900/30", "dark:bg-accent/30"],
  ["dark:bg-violet-900/20", "dark:bg-accent/20"],
  ["dark:bg-violet-950/50", "dark:bg-accent/20"],

  // === InventoryLogs stat icons ===
  ["bg-violet-100 dark:bg-violet-900/30 border border-violet-200/50 dark:border-violet-800/30", "bg-accent-light dark:bg-accent/20 border border-accent/30"],
  ["text-accent dark:text-accent border border-violet-200", "text-accent border border-accent"],
  ["hover:border-violet-200", "hover:border-accent"],
  ["border-violet-200 dark:border-violet-800/40", "border-accent"],
  ["border-violet-200", "border-accent"],

  // === Dark mode border ===
  ["dark:border-purple-800", "dark:border-accent"],
  ["dark:border-purple-800/30", "dark:border-accent/30"],
  ["dark:border-purple-800/40", "dark:border-accent/40"],
  ["dark:border-purple-500/20", "dark:border-accent/20"],
  ["dark:border-violet-800/40", "dark:border-accent/40"],
  ["dark:border-violet-700/60", "dark:border-accent/60"],

  // === Dark hover ===
  ["dark:hover:bg-violet-900/30", "dark:hover:bg-accent/30"],
  ["dark:hover:bg-violet-900/20", "dark:hover:bg-accent/20"],
  ["dark:hover:bg-purple-900/30", "dark:hover:bg-accent/30"],
  ["dark:hover:bg-purple-900/20", "dark:hover:bg-accent/20"],
  ["dark:hover:border-violet-600", "dark:hover:border-accent"],
  ["dark:hover:border-violet-700/60", "dark:hover:border-accent/60"],

  // === Reports pagination ===
  // Already handled above
];

let totalFixed = 0;

for (const filePath of files) {
  const fullPath = path.resolve(root, filePath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, "utf8");
  let modified = false;

  for (const [search, replace] of reps) {
    if (content.includes(search)) {
      content = content.replaceAll(search, replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log("FIXED:", filePath);
    totalFixed++;
  } else {
    console.log("OK:", filePath);
  }
}

console.log(`\nTotal: ${totalFixed} files fixed`);