import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, "../src/pages");

const files = [
  "Products.jsx",
  "Transactions.jsx",
  "Inventory.jsx",
  "Customers.jsx",
  "Reports.jsx",
  "InventoryLogs.jsx",
  "Analytics.jsx",
  "ProductDetail.jsx",
  "Dashboard.jsx",
];

let totalFixed = 0;

files.forEach((filename) => {
  const fp = path.join(pagesDir, filename);
  if (!fs.existsSync(fp)) return;

  let c = fs.readFileSync(fp, "utf8");
  const before = c;

  // 1. Fix table row hover: hover:bg-violet-50/30 -> hover:bg-gray-100 dark:hover:bg-gray-700/50
  c = c.replace(
    /border-t border-\[#ececf2\] dark:border-gray-700 cursor-pointer transition-colors hover:bg-violet-50\/30 dark:hover:bg-gray-700\/50/g,
    "border-t border-[#ececf2] dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
  );
  c = c.replace(
    /border-t border-\[#ececf2\] dark:border-gray-700 transition-colors hover:bg-violet-50\/30 dark:hover:bg-gray-700\/50/g,
    "border-t border-[#ececf2] dark:border-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
  );
  
  // General transition-colors hover classes
  c = c.replace(
    /transition-colors hover:bg-violet-50\/30 dark:hover:bg-gray-700\/50/g,
    "transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
  );

  // 2. Fix selected row in Products
  c = c.replace(
    '${selectedIds.includes(product.id) ? "bg-purple-50" : ""}',
    '${selectedIds.includes(product.id) ? "bg-purple-50 dark:bg-gray-700/30" : ""}'
  );

  // 3. Fix group hover in Transactions recent orders
  c = c.replace(
    'group hover:bg-gray-50 dark:bg-gray-800/50 transition-colors duration-150',
    'group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150'
  );

  // 4. Fix Inventory variant row hover
  c = c.replace(
    'border-t border-purple-100 transition-colors hover:bg-purple-50/50',
    'border-t border-purple-100 dark:border-purple-800/30 transition-colors hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
  );

  // 5. Fix ALL input/select/textarea fields missing dark classes
  // Pattern: inputs with border-border-[#ececf2] px-4 py-3 outline-none (no dark: after)
  c = c.replace(
    /(border-\[#ececf2\] px-4 py-3(?: text-sm)? outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100(?: cursor-pointer)?(?: bg-white)?)(?!\s*dark:)/g,
    (match) => {
      if (match.includes("dark:")) return match;
      const isSelect = match.includes("cursor-pointer");
      const hasBgWhite = match.includes("bg-white");
      const extras = [];
      if (!match.includes("dark:bg-gray-700")) extras.push("dark:bg-gray-700");
      if (!match.includes("dark:text-white")) extras.push("dark:text-white");
      if (!match.includes("dark:border-gray-600")) extras.push("dark:border-gray-600");
      if (!isSelect && !match.includes("dark:placeholder-gray-400")) extras.push("dark:placeholder-gray-400");
      return match + " " + extras.join(" ");
    }
  );

  // Pattern: inputs with px-4 py-2.5 text-sm (search inputs etc.)
  c = c.replace(
    /(border-\[#ececf2\](?: bg-white)? px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100(?: cursor-pointer)?)(?!\s*dark:)/g,
    (match) => {
      if (match.includes("dark:")) return match;
      const isSelect = match.includes("cursor-pointer");
      const extras = ["dark:bg-gray-700", "dark:text-white", "dark:border-gray-600"];
      if (!isSelect) extras.push("dark:placeholder-gray-400");
      return match + " " + extras.join(" ");
    }
  );

  // Pattern: inputs with rounded-xl
  c = c.replace(
    /(border-\[#ececf2\] px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100)(?!\s*dark:)/g,
    (match) => {
      if (match.includes("dark:")) return match;
      return match + " dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400";
    }
  );

  // Pattern: textarea fields
  c = c.replace(
    /(border-\[#ececf2\] bg-white py-2\.5 px-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none)(?!\s*dark:)/g,
    (match) => {
      if (match.includes("dark:")) return match;
      return match + " dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600";
    }
  );

  // Pattern: rounded-xl py-2 px-3 inputs
  c = c.replace(
    /(border-\[#ececf2\] bg-white py-2 px-3 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100)(?!\s*dark:)/g,
    (match) => {
      if (match.includes("dark:")) return match;
      return match + " dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600";
    }
  );

  // Clean up duplicated dark classes
  c = c.replace(/dark:bg-gray-700 dark:bg-gray-700/g, "dark:bg-gray-700");
  c = c.replace(/dark:text-white dark:text-white/g, "dark:text-white");
  c = c.replace(/dark:border-gray-600 dark:border-gray-600/g, "dark:border-gray-600");

  // Fix dark:hover:bg-violet-900/30/30 -> dark:hover:bg-gray-700/50
  c = c.replace(/dark:hover:bg-violet-900\/30\/30/g, "dark:hover:bg-gray-700/50");
  c = c.replace(/dark:hover:bg-purple-900\/20\/40/g, "dark:hover:bg-purple-900/20");
  c = c.replace(/dark:hover:bg-purple-900\/20\/50/g, "dark:hover:bg-purple-900/20");

  if (c !== before) {
    fs.writeFileSync(fp, c);
    totalFixed++;
    console.log(`  Fixed: ${filename}`);
  }
});

console.log(`\nDone! Fixed ${totalFixed} files.`);