const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "..", "src", "pages");
const uiDir = path.join(__dirname, "..", "src", "components", "ui");

const files = [];

// Collect all page files
fs.readdirSync(pagesDir)
  .filter((f) => f.endsWith(".jsx"))
  .forEach((f) => files.push(path.join(pagesDir, f)));

// Collect all ui component files
fs.readdirSync(uiDir)
  .filter((f) => f.endsWith(".jsx"))
  .forEach((f) => files.push(path.join(uiDir, f)));

// Replacement rules - applied in order
const replacements = [
  // Page card containers
  [
    /bg-white rounded-3xl shadow-sm/g,
    "bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-none",
  ],

  // Background fills
  [/bg-\[#f8f8fc\]/g, "bg-[#f8f8fc] dark:bg-gray-750"],
  [/bg-gray-50/g, "bg-gray-50 dark:bg-gray-800"],
  [
    /bg-gray-100\/?/g,
    (m) => (m.includes("dark:") ? m : m + " dark:bg-gray-700"),
  ],

  // Text colors
  [/text-gray-900(?! dark)/g, "text-gray-900 dark:text-white"],
  [/text-gray-700(?! dark)/g, "text-gray-700 dark:text-gray-200"],
  [/text-gray-600(?! dark)/g, "text-gray-600 dark:text-gray-300"],
  [/text-gray-500(?! dark)/g, "text-gray-500 dark:text-gray-400"],
  [/text-gray-400(?! dark:)/g, "text-gray-400 dark:text-gray-400"],

  // Border colors
  [/border-\[\#ececf2\](?! dark)/g, "border-[#ececf2] dark:border-gray-700"],
  [/border-gray-200(?! dark)/g, "border-gray-200 dark:border-gray-700"],
  [/border-gray-100(?! dark)/g, "border-gray-100 dark:border-gray-700"],
  [/border-gray-50(?! dark)/g, "border-gray-50 dark:border-gray-700"],

  // Dividers
  [/divide-gray-50/g, "divide-gray-50 dark:divide-gray-700"],
  [/divide-\[\#ececf2\]/g, "divide-[#ececf2] dark:divide-gray-700"],

  // Table header bg
  [
    /bg-gradient-to-r from-\[\#f8f8fc\] to-white/g,
    "bg-gradient-to-r from-[#f8f8fc] dark:from-gray-750 to-white dark:to-gray-800",
  ],

  // Inputs
  [
    /bg-white(?! dark)/g,
    (m, offset, str) => {
      // Don't replace inside complex gradient or modal overlays
      if (
        str
          .slice(Math.max(0, offset - 20), offset + 50)
          .includes("bg-gradient") ||
        str.slice(Math.max(0, offset - 30), offset + 50).includes("from-violet")
      ) {
        return m;
      }
      return "bg-white dark:bg-gray-700";
    },
  ],

  // placeholders
  [/placeholder-gray-400/g, "placeholder-gray-400 dark:placeholder-gray-500"],
  [/placeholder-gray-500/g, "placeholder-gray-500 dark:placeholder-gray-400"],
];

console.log("Fixing dark mode in", files.length, "files...");

files.forEach((fp) => {
  let content = fs.readFileSync(fp, "utf8");
  const before = content;

  replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });

  // Also fix bg-gray-100 specifically (not gradient)
  content = content.replace(
    /(?<!dark:)bg-gray-100/g,
    "bg-gray-100 dark:bg-gray-700",
  );

  if (content !== before) {
    fs.writeFileSync(fp, content);
    console.log("  Updated:", path.basename(fp));
  }
});

console.log("Done!");
