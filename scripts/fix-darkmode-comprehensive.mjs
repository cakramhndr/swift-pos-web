import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const pagesDir = path.join(root, "src", "pages");

const files = [
  "Dashboard.jsx",
  "Products.jsx",
  "Transactions.jsx",
  "Inventory.jsx",
  "InventoryLogs.jsx",
  "Customers.jsx",
  "Reports.jsx",
  "Analytics.jsx",
  "ProductDetail.jsx",
  "Settings.jsx",
  "CRM.jsx",
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addDarkToClass(className, darkClass) {
  const regex = new RegExp(`\\b${escapeRegex(className)}\\b`, "g");
  return (content) => {
    return content.replace(regex, (match, offset) => {
      const ctx = content.slice(
        Math.max(0, offset - 300),
        offset + match.length + 50,
      );
      if (ctx.includes("dark:") || ctx.includes("bg-gradient")) return match;
      return `${match} ${darkClass}`;
    });
  };
}

const transforms = [
  // ─── Page containers (bg-white rounded-3xl shadow-sm) ───
  addDarkToClass(
    "bg-white rounded-3xl shadow-sm",
    "dark:bg-gray-800 dark:shadow-none",
  ),

  // ─── Card backgrounds ───
  addDarkToClass("bg-[#f8f8fc]", "dark:bg-gray-800"),

  // ─── Text colors ───
  addDarkToClass("text-gray-900", "dark:text-white"),
  addDarkToClass("text-gray-700", "dark:text-gray-200"),
  addDarkToClass("text-gray-600", "dark:text-gray-300"),
  addDarkToClass("text-gray-500", "dark:text-gray-400"),
  addDarkToClass("text-gray-400", "dark:text-gray-400"),
  addDarkToClass("text-gray-300", "dark:text-gray-500"),

  // ─── Borders ───
  addDarkToClass("border-[#ececf2]", "dark:border-gray-700"),
  addDarkToClass("border-gray-200", "dark:border-gray-700"),
  addDarkToClass("border-gray-100", "dark:border-gray-700"),
  addDarkToClass("border-gray-50", "dark:border-gray-700"),
  addDarkToClass("border-gray-300", "dark:border-gray-600"),

  // ─── Dividers ───
  addDarkToClass("divide-gray-50", "dark:divide-gray-700"),
  addDarkToClass("divide-[#ececf2]", "dark:divide-gray-700"),

  // ─── Table header gradient ───
  addDarkToClass(
    "bg-gradient-to-r from-[#f8f8fc] to-white",
    "dark:from-gray-800 dark:to-gray-800",
  ),

  // ─── Misc background fills ───
  addDarkToClass("bg-gray-50", "dark:bg-gray-800"),
  addDarkToClass("bg-gray-100", "dark:bg-gray-700"),
  addDarkToClass("bg-white", "dark:bg-gray-800"),

  // ─── Hover states ───
  addDarkToClass("hover:bg-gray-50", "dark:hover:bg-gray-700"),
  addDarkToClass("hover:bg-violet-50", "dark:hover:bg-violet-900/30"),
  addDarkToClass("hover:bg-violet-50/30", "dark:hover:bg-gray-700/50"),
  addDarkToClass("hover:bg-red-50", "dark:hover:bg-red-900/20"),

  // ─── Status badges & colored backgrounds ───
  addDarkToClass("bg-red-100", "dark:bg-red-900/30"),
  addDarkToClass("bg-green-100", "dark:bg-green-900/30"),
  addDarkToClass("bg-yellow-100", "dark:bg-yellow-900/30"),
  addDarkToClass("bg-blue-100", "dark:bg-blue-900/30"),
  addDarkToClass("bg-purple-100", "dark:bg-purple-900/30"),
  addDarkToClass("bg-violet-100", "dark:bg-violet-900/30"),
  addDarkToClass("bg-emerald-100", "dark:bg-emerald-900/30"),
  addDarkToClass("bg-orange-100", "dark:bg-orange-900/30"),
  addDarkToClass("bg-amber-100", "dark:bg-amber-900/30"),
  addDarkToClass("bg-rose-100", "dark:bg-rose-900/30"),
  addDarkToClass("bg-indigo-100", "dark:bg-indigo-900/30"),

  // ─── Text colored badges ───
  addDarkToClass("text-red-700", "dark:text-red-300"),
  addDarkToClass("text-green-700", "dark:text-green-300"),
  addDarkToClass("text-yellow-700", "dark:text-yellow-300"),
  addDarkToClass("text-blue-700", "dark:text-blue-300"),
  addDarkToClass("text-violet-700", "dark:text-violet-300"),
  addDarkToClass("text-purple-700", "dark:text-purple-300"),
  addDarkToClass("text-emerald-700", "dark:text-emerald-300"),

  addDarkToClass("text-red-600", "dark:text-red-400"),
  addDarkToClass("text-green-600", "dark:text-green-400"),
  addDarkToClass("text-yellow-600", "dark:text-yellow-400"),
  addDarkToClass("text-blue-600", "dark:text-blue-400"),
  addDarkToClass("text-violet-600", "dark:text-violet-400"),
  addDarkToClass("text-purple-600", "dark:text-purple-400"),
  addDarkToClass("text-orange-600", "dark:text-orange-400"),
  addDarkToClass("text-amber-600", "dark:text-amber-400"),
  addDarkToClass("text-emerald-600", "dark:text-emerald-400"),

  addDarkToClass("text-red-500", "dark:text-red-400"),
  addDarkToClass("text-purple-500", "dark:text-purple-400"),

  // ─── Modals (bg-white shadow-2xl) ───
  (content) =>
    content.replace(/rounded-3xl bg-white p-6 shadow-2xl/g, (m, offset) => {
      const ctx = content.slice(
        Math.max(0, offset - 50),
        offset + m.length + 50,
      );
      if (ctx.includes("dark:bg-gray-800")) return m;
      return "rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl";
    }),

  // ─── Input fields: search inputs ───
  (content) =>
    content.replace(
      /rounded-2xl border border-[#ececf2] bg-white py-2\.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        return (
          m +
          " dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        );
      },
    ),

  // ─── Input fields: general text inputs ───
  (content) =>
    content.replace(
      /rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        const ctx = content.slice(Math.max(0, offset - 200), offset + m.length);
        if (m.includes("cursor-pointer")) {
          return m + " dark:bg-gray-700 dark:text-white dark:border-gray-600";
        }
        return (
          m +
          " dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
        );
      },
    ),

  // ─── Input fields: rounded-2xl py-2.5 px-4 ───
  (content) =>
    content.replace(
      /rounded-2xl border border-[#ececf2] px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        const ctx = content.slice(Math.max(0, offset - 200), offset + m.length);
        if (m.includes("cursor-pointer")) {
          return m + " dark:bg-gray-700 dark:text-white dark:border-gray-600";
        }
        return (
          m +
          " dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
        );
      },
    ),

  // ─── Input fields: rounded-xl py-2.5 px-4 ───
  (content) =>
    content.replace(
      /rounded-xl border border-[#ececf2] px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        return m + " dark:bg-gray-700 dark:text-white dark:border-gray-600";
      },
    ),

  // ─── Textarea fields ───
  (content) =>
    content.replace(
      /rounded-2xl border border-[#ececf2] bg-white py-2\.5 px-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        return (
          m +
          " dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
        );
      },
    ),

  // ─── Input fields: rounded-xl py-2 px-3 ───
  (content) =>
    content.replace(
      /rounded-xl border border-[#ececf2] bg-white py-2 px-3 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        return (
          m +
          " dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
        );
      },
    ),

  // ─── Select dropdowns ───
  (content) =>
    content.replace(
      /rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        return m + " dark:bg-gray-700 dark:text-white dark:border-gray-600";
      },
    ),

  // ─── bg-red-50/50 border border-red-100/80 ───
  (content) =>
    content.replace(/bg-red-50\/50 border border-red-100\/80/g, (m, offset) => {
      if (m.includes("dark:")) return m;
      return m + " dark:bg-red-900/20 dark:border-red-800/30";
    }),

  // ─── bg-emerald-50 border border-emerald-100/80 ───
  (content) =>
    content.replace(
      /bg-emerald-50 border border-emerald-100\/80/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        return m + " dark:bg-emerald-900/20 dark:border-emerald-800/30";
      },
    ),

  // ─── bg-purple-50 border border-purple-200 ───
  (content) =>
    content.replace(
      /bg-purple-50 border border-purple-200 rounded-lg/g,
      (m, offset) => {
        if (m.includes("dark:")) return m;
        return m + " dark:bg-purple-900/20 dark:border-purple-800/30";
      },
    ),

  // ─── placeholder-gray-400 ───
  (content) =>
    content.replace(/placeholder-gray-400(?! dark)/g, (m, offset) => {
      if (content.slice(Math.max(0, offset - 200), offset).includes("dark:"))
        return m;
      return "placeholder-gray-400 dark:placeholder-gray-500";
    }),
];

let updatedCount = 0;

files.forEach((filename) => {
  const fp = path.join(pagesDir, filename);
  if (!fs.existsSync(fp)) {
    console.log(`  Skipped: ${filename} (not found)`);
    return;
  }

  let content = fs.readFileSync(fp, "utf8");
  const before = content;

  transforms.forEach((fn) => {
    content = fn(content);
  });

  // Clean up duplicate dark classes
  content = content
    .replace(/dark:bg-gray-800 dark:bg-gray-800/g, "dark:bg-gray-800")
    .replace(/dark:bg-gray-700 dark:bg-gray-700/g, "dark:bg-gray-700")
    .replace(
      /dark:border-gray-700 dark:border-gray-700/g,
      "dark:border-gray-700",
    )
    .replace(/dark:text-white dark:text-white/g, "dark:text-white")
    .replace(/dark:text-gray-400 dark:text-gray-400/g, "dark:text-gray-400")
    .replace(
      /dark:bg-gray-800 dark:shadow-none/g,
      "dark:bg-gray-800 dark:shadow-none",
    );

  if (content !== before) {
    fs.writeFileSync(fp, content);
    console.log(`  Updated: ${filename}`);
    updatedCount++;
  } else {
    console.log(`  No changes: ${filename}`);
  }
});

console.log(`\nDone! Updated ${updatedCount} files.`);
