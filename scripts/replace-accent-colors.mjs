/**
 * Replace hardcoded purple/violet/fuchsia accent brand colors with CSS variables.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "..");
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
];

const replacements = [
  // Gradient strings (exact matches)
  ["from-violet-600 to-purple-600", "from-accent to-accent-hover"],
  ["from-violet-500 to-purple-600", "from-accent to-accent-hover"],
  ["from-purple-500 to-violet-600", "from-accent to-accent-hover"],
  [
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-accent via-accent-light to-accent-hover",
  ],
  [
    "from-violet-700 via-purple-600 to-fuchsia-600",
    "from-accent via-accent-hover to-accent-dark",
  ],
  [
    "from-violet-500/5 via-transparent to-purple-500/5",
    "from-accent/5 via-transparent to-accent-hover/5",
  ],

  // Text colors
  [/text-violet-600/g, "text-accent"],
  [/text-violet-700/g, "text-accent"],
  [/text-violet-500/g, "text-accent"],
  [/text-violet-400/g, "text-accent"],
  [/text-violet-300/g, "text-accent"],
  [/text-purple-600/g, "text-accent"],
  [/text-purple-700/g, "text-accent"],
  [/text-purple-500/g, "text-accent"],
  [/text-purple-400/g, "text-accent"],
  [/text-purple-300/g, "text-accent"],

  // Background colors
  [/bg-violet-600/g, "bg-accent"],
  [/bg-violet-500/g, "bg-accent"],
  [/bg-purple-600/g, "bg-accent"],
  [/bg-purple-500/g, "bg-accent"],
  [/bg-purple-200/g, "bg-accent-light"],
  [/bg-violet-200/g, "bg-accent-light"],
  [/bg-purple-100/g, "bg-accent-light"],
  [/bg-violet-100/g, "bg-accent-light"],
  [/bg-purple-50/g, "bg-accent-light"],
  [/bg-violet-50/g, "bg-accent-light"],

  // Opaque backgrounds
  [/(bg-purple-500)\/15/g, "$1\\/15"],
  [/(bg-purple-500)\/30/g, "$1\\/30"],
  [/(bg-violet-500)\/15/g, "$1\\/15"],
  [/(bg-violet-500)\/30/g, "$1\\/30"],
  [/(bg-purple-100)\/30/g, "$1\\/30"],
  [/(bg-violet-50)\/30/g, "$1\\/30"],

  // Dark mode bg
  [/dark:bg-purple-900\/30/g, "dark:bg-accent\\/30"],
  [/dark:bg-purple-900\/20/g, "dark:bg-accent\\/20"],
  [/dark:bg-purple-950\/50/g, "dark:bg-accent\\/20"],
  [/dark:bg-violet-900\/30/g, "dark:bg-accent\\/30"],
  [/dark:bg-violet-900\/20/g, "dark:bg-accent\\/20"],
  [/dark:bg-violet-950\/50/g, "dark:bg-accent\\/20"],

  // Border colors
  [/border-purple-200/g, "border-accent"],
  [/border-purple-300/g, "border-accent"],
  [/(border-purple-200)\/50/g, "$1\\/50"],
  [/(border-purple-500)\/20/g, "$1\\/20"],
  [/border-violet-200/g, "border-accent"],
  [/border-violet-300/g, "border-accent"],
  [/(border-violet-200)\/80/g, "$1\\/80"],
  [/(border-violet-200)\/50/g, "$1\\/50"],
  [/(border-violet-500)\/20/g, "$1\\/20"],

  // Dark mode borders
  [/dark:border-purple-800/g, "dark:border-accent"],
  [/(dark:border-purple-800)\/30/g, "$1\\/30"],
  [/(dark:border-purple-800)\/40/g, "$1\\/40"],
  [/(dark:border-purple-500)\/20/g, "$1\\/20"],
  [/(dark:border-violet-800)\/40/g, "$1\\/40"],
  [/(dark:border-violet-700)\/60/g, "$1\\/60"],

  // Shadows
  [/(shadow-purple-500)\/20/g, "$1\\/20"],
  [/(shadow-violet-500)\/20/g, "$1\\/20"],
  [/(shadow-violet-500)\/15/g, "$1\\/15"],
  [/(shadow-purple-500)\/10/g, "$1\\/10"],
  [/(dark:shadow-purple-500)\/15/g, "$1\\/15"],
  [/(dark:shadow-purple-500)\/10/g, "$1\\/10"],
  [/(dark:shadow-violet-500)\/15/g, "$1\\/15"],

  // Focus/ring
  [/ring-violet-500/g, "ring-accent"],
  [/focus:ring-violet-100/g, "focus:ring-accent\\/20"],
  [/focus:border-violet-400/g, "focus:border-accent"],
  [/focus:ring-purple-500/g, "focus:ring-accent"],

  // Hover text
  [/hover:text-violet-600/g, "hover:text-accent"],
  [/hover:text-violet-700/g, "hover:text-accent"],
  [/hover:text-violet-400/g, "hover:text-accent"],
  [/hover:text-purple-600/g, "hover:text-accent"],
  [/hover:text-purple-700/g, "hover:text-accent"],

  // Hover bg
  [/hover:bg-violet-50/g, "hover:bg-accent-light"],
  [/hover:bg-purple-50/g, "hover:bg-accent-light"],

  // Dark mode hover bg
  [/(dark:hover:bg-violet-900)\/30/g, "$1\\/30"],
  [/(dark:hover:bg-violet-900)\/20/g, "$1\\/20"],
  [/(dark:hover:bg-purple-900)\/30/g, "$1\\/30"],
  [/(dark:hover:bg-purple-900)\/20/g, "$1\\/20"],

  // Hover border
  [/hover:border-violet-300/g, "hover:border-accent"],
  [/hover:border-violet-400/g, "hover:border-accent"],
  [/hover:border-purple-300/g, "hover:border-accent"],
  [/dark:hover:border-violet-600/g, "dark:hover:border-accent"],
  [/(dark:hover:border-violet-700)\/60/g, "$1\\/60"],

  // Group hover
  [/group-hover:text-violet-600/g, "group-hover:text-accent"],
  [/group-hover:text-violet-400/g, "group-hover:text-accent"],
  [/group-hover:text-violet-500/g, "group-hover:text-accent"],
  [/dark:group-hover:text-violet-400/g, "dark:group-hover:text-accent"],
];

let totalModified = 0;

for (const relPath of files) {
  const fullPath = path.resolve(srcDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log("SKIP:", relPath);
    continue;
  }
  let content = fs.readFileSync(fullPath, "utf8");
  let modified = false;

  for (const [search, replace] of replacements) {
    if (search instanceof RegExp) {
      while (search.test(content)) {
        content = content.replace(search, replace);
        modified = true;
      }
      search.lastIndex = 0;
    } else {
      if (content.includes(search)) {
        content = content.replaceAll(search, replace);
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log("UPDATED:", relPath);
    totalModified++;
  } else {
    console.log("OK:", relPath, "(no changes)");
  }
}

console.log("\nTotal files modified:", totalModified);
