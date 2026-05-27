import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const pagesDir = path.join(root, "src", "pages");
const uiDir = path.join(root, "src", "components", "ui");

const files = [];

// Collect all page files
fs.readdirSync(pagesDir)
  .filter((f) => f.endsWith(".jsx"))
  .forEach((f) => files.push(path.join(pagesDir, f)));

// Collect all ui component files
fs.readdirSync(uiDir)
  .filter((f) => f.endsWith(".jsx"))
  .forEach((f) => files.push(path.join(uiDir, f)));

// Helper: only if not already containing dark:
const noDark = (prefix) => {
  return (m, offset, str) => {
    const before = str.slice(Math.max(0, offset - 200), offset);
    if (before.includes("dark:")) return m; // already has dark somewhere before
    return prefix + m;
  };
};

const replacements = [
  // Card containers
  [
    /bg-white rounded-3xl shadow-sm/g,
    noDark("bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-none "),
  ],

  // Background fills
  [/bg-\[#f8f8fc\]/g, noDark("bg-[#f8f8fc] dark:bg-gray-750 ")],

  // Text colors - add dark: variant before existing class
  [/text-gray-900/g, noDark("text-gray-900 dark:text-white ")],
  [/text-gray-700/g, noDark("text-gray-700 dark:text-gray-200 ")],
  [/text-gray-600/g, noDark("text-gray-600 dark:text-gray-300 ")],
  [
    /text-gray-500/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      if (m.includes("dark:")) return m;
      return m + " dark:text-gray-400";
    },
  ],
  [
    /text-gray-400(?! dark:text-gray-400)/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      return m + " dark:text-gray-400";
    },
  ],

  // Border colors
  [
    /border-\[#ececf2\](?! dark:border-gray-700)/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      return m + " dark:border-gray-700";
    },
  ],
  [
    /border-gray-200(?! dark:border-gray-700)/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      return m + " dark:border-gray-700";
    },
  ],
  [
    /border-gray-100(?! dark:border-gray-700)/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      return m + " dark:border-gray-700";
    },
  ],
  [
    /border-gray-50(?! dark:border)/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      return m + " dark:border-gray-700";
    },
  ],

  // Dividers
  [
    /divide-gray-50(?! dark:divide)/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      return m + " dark:divide-gray-700";
    },
  ],

  // Table header bg
  [
    /bg-gradient-to-r from-\[\#f8f8fc\] to-white/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      return "bg-gradient-to-r from-[#f8f8fc] dark:from-gray-750 to-white dark:to-gray-800";
    },
  ],

  // bg-gray-50
  [
    /bg-gray-50(?! dark:bg-gray-800)/g,
    (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 200), offset);
      if (before.includes("dark:")) return m;
      return m + " dark:bg-gray-800";
    },
  ],
];

console.log("Fixing dark mode in", files.length, "files...");

let updatedCount = 0;

files.forEach((fp) => {
  let content = fs.readFileSync(fp, "utf8");
  const before = content;

  replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });

  // Handle bg-white specifically - skip gradients
  content = content.replace(/bg-white(?! dark)/g, (m, offset) => {
    const context = content.slice(Math.max(0, offset - 50), offset + 80);
    if (
      context.includes("bg-gradient") ||
      context.includes("from-violet") ||
      context.includes("to-white") ||
      context.includes("dark:")
    ) {
      return m;
    }
    return "bg-white dark:bg-gray-700";
  });

  // Handle bg-gray-100 - skip gradients
  content = content.replace(/bg-gray-100(?! dark)/g, (m, offset) => {
    const context = content.slice(Math.max(0, offset - 50), offset + 80);
    if (
      context.includes("bg-gradient") ||
      context.includes("via-") ||
      context.includes("dark:")
    ) {
      return m;
    }
    return "bg-gray-100 dark:bg-gray-700";
  });

  // Handle placeholder
  content = content.replace(/placeholder-gray-400(?! dark)/g, (m, offset) => {
    if (content.slice(Math.max(0, offset - 200), offset).includes("dark:"))
      return m;
    return "placeholder-gray-400 dark:placeholder-gray-500";
  });

  if (content !== before) {
    fs.writeFileSync(fp, content);
    console.log("  Updated:", path.basename(fp));
    updatedCount++;
  }
});

console.log(`Done! Updated ${updatedCount} files.`);
