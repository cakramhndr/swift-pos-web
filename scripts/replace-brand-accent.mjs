/**
 * Precision replacement: Only replace purple/violet/fuchsia where they serve as
 * PRIMARY BRAND ACCENT colors (buttons, active nav, hero banners, primary icons).
 *
 * DO NOT replace:
 * - Category icon backgrounds (from-violet-50, from-purple-50 - semantic icons)
 * - Success/green, danger/red, warning/yellow, info/blue colors
 * - Status badges, stock alerts, delete buttons
 * - Purple/violet used in permission badges (they use distinct colors by design)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Only these patterns are PRIMARY BRAND ACCENT - they MUST be replaced
const brandAccentReplacements = [
  // ─── SIDEBAR NAV: Active nav item background ───
  [
    "from-purple-600/90 to-purple-500/90 text-white shadow-lg shadow-purple-500/20 dark:shadow-purple-500/15",
    "bg-accent text-white shadow-lg shadow-accent/20",
  ],

  // ─── PRIMARY BUTTON gradients (the main CTA buttons) ───
  ["from-violet-600 to-purple-600", "from-accent to-accent-hover"],
  ["from-violet-500 to-purple-600", "from-accent to-accent-hover"],
  ["from-purple-500 to-violet-600", "from-accent to-accent-hover"],
  ["from-violet-500 to-purple-500", "from-accent to-accent-hover"],

  // ─── HERO / GRADIENT BANNERS ───
  [
    "from-violet-700 via-purple-600 to-fuchsia-600",
    "from-accent via-accent-hover to-accent-dark",
  ],
  [
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-accent via-accent-light to-accent-hover",
  ],

  // ─── MODAL / CARD header accent bars ───
  // (these are brand decorative elements)

  // ─── ICON CONTAINERS (primary branding icons that use purple/violet gradient) ───
  // These are icon backgrounds like the sidebar logo, stat card icons, etc.
  // They use "from-violet-500 to-purple-600" patterns - already covered above

  // ─── LIVE PREVIEW / ACTIVE STATE badges ───
  [
    "from-violet-600 to-purple-600 text-[10px] font-semibold text-white",
    "from-accent to-accent-hover text-[10px] font-semibold text-white",
  ],

  // ─── ACTIVE TAB / PAGE button (pagination active) ───
  [
    "from-violet-600 to-purple-600 text-white dark:text-white shadow-lg shadow-violet-500/20",
    "from-accent to-accent-hover text-white dark:text-white shadow-lg shadow-accent/20",
  ],

  // ─── SAVE BUTTON in settings ───
  // Already covered by from-violet-600 to-purple-600

  // ─── VIOLET TEXT used as links/primary text ───
  ["text-violet-600", "text-accent"],
  ["text-violet-700", "text-accent"],
  ["text-violet-400", "text-accent"],
  ["text-violet-500", "text-accent"],
  ["text-violet-300", "text-accent"],
  ["text-purple-600", "text-accent"],
  ["text-purple-700", "text-accent"],
  ["text-purple-500", "text-accent"],
  ["text-purple-400", "text-accent"],

  // ─── VIOLET as HOVER/ACTIVE border ───
  [
    "hover:border-violet-200 dark:hover:border-violet-700/60 hover:shadow-lg hover:shadow-violet-500/5 dark:hover:shadow-violet-500/5",
    "hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5",
  ],
  ["hover:border-violet-400", "hover:border-accent"],
  ["hover:border-violet-300", "hover:border-accent"],
  ["dark:hover:border-violet-600", "dark:hover:border-accent"],
  ["hover:border-purple-300", "hover:border-accent"],
  ["hover:border-purple-400", "hover:border-accent"],

  // ─── VIOLET HOVER text on links ───
  ["hover:text-violet-600", "hover:text-accent"],
  ["hover:text-violet-700", "hover:text-accent"],
  ["hover:text-violet-400", "hover:text-accent"],
  ["hover:text-purple-600", "hover:text-accent"],
  ["hover:text-purple-700", "hover:text-accent"],

  // ─── VIOLET hover bg on category cards ───
  ["hover:bg-violet-50", "hover:bg-accent-light"],
  ["dark:hover:bg-violet-900/30", "dark:hover:bg-accent/30"],
  ["hover:bg-purple-50", "hover:bg-accent-light"],
  ["dark:hover:bg-purple-900/30", "dark:hover:bg-accent/30"],

  // ─── GROUP HOVER text ───
  ["group-hover:text-violet-600", "group-hover:text-accent"],
  ["group-hover:text-violet-400", "group-hover:text-accent"],
  ["group-hover:text-violet-500", "group-hover:text-accent"],

  // ─── VIOLET shadow on hover ───
  ["hover:shadow-violet-500/20", "hover:shadow-accent/20"],
  [
    "hover:shadow-lg hover:shadow-violet-500/5",
    "hover:shadow-lg hover:shadow-accent/5",
  ],

  // ─── VIOLET focus rings (brand interaction) ───
  ["focus:ring-violet-100", "focus:ring-accent/20"],
  ["focus:border-violet-400", "focus:border-accent"],
  ["focus:ring-purple-500", "focus:ring-accent"],

  // ─── BRAND ICON backgrounds (gradient icon containers) ───
  // These need inline style gradient to maintain the gradient look
  // DO NOT replace flat - they need gradient appearance

  // ─── BACK BUTTON accent ───
  ["hover:text-violet-600 dark:hover:text-violet-400", "hover:text-accent"],

  // ─── HOVER SHADOW on primary elements ───
  ["shadow-violet-500/20", "shadow-accent/20"],

  // ─── DARK MODE variants ───
  ["dark:hover:bg-purple-900/20", "dark:hover:bg-accent/20"],
  ["dark:hover:bg-violet-900/20", "dark:hover:bg-accent/20"],
  ["dark:bg-violet-100 dark:text-violet-900/30", "dark:bg-accent-light"],

  // ─── Modals with purple accent bar ───
  [
    "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500",
    "bg-gradient-to-r from-accent via-accent-light to-accent-hover",
  ],
  [
    "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-3xl",
    "from-accent via-accent-light to-accent-hover",
  ],
  [
    "h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500",
    "h-1 from-accent via-accent-light to-accent-hover",
  ],
  [
    "h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-3xl",
    "h-1 from-accent via-accent-light to-accent-hover",
  ],

  // ─── Active tab buttons ───
  [
    "bg-gradient-to-r from-violet-600 to-purple-600 text-white dark:text-white shadow-lg shadow-violet-500/20",
    "from-accent to-accent-hover text-white dark:text-white shadow-lg shadow-accent/20",
  ],
];

const files = [
  "src/pages/Transactions.jsx",
  "src/pages/Customers.jsx",
  "src/pages/Inventory.jsx",
  "src/pages/InventoryLogs.jsx",
  "src/pages/Products.jsx",
  "src/pages/Reports.jsx",
  "src/pages/Analytics.jsx",
  "src/pages/Settings.jsx",
  "src/pages/ReceiptBuilder.jsx",
  "src/pages/ProductDetail.jsx",
  "src/components/layout/AppSidebar.jsx",
  "src/pages/Dashboard.jsx",
];

let count = 0;

for (const relPath of files) {
  const fullPath = path.resolve(root, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log("SKIP:", relPath);
    continue;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  let modified = false;

  for (const [search, replace] of brandAccentReplacements) {
    if (content.includes(search)) {
      content = content.replaceAll(search, replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log("MODIFIED:", relPath);
    count++;
  } else {
    console.log("OK:", relPath);
  }
}

console.log(
  `\nDone - ${count} files modified with brand accent replacements only`,
);
