import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const pagesDir = path.join(root, "src", "pages");
const uiDir = path.join(root, "src", "components", "ui");

const files = [];
fs.readdirSync(pagesDir)
  .filter((f) => f.endsWith(".jsx"))
  .forEach((f) => files.push(path.join(pagesDir, f)));
fs.readdirSync(uiDir)
  .filter((f) => f.endsWith(".jsx"))
  .forEach((f) => files.push(path.join(uiDir, f)));

console.log("Processing", files.length, "files...");

function addDarkToClass(className, darkClass) {
  // Replaces a single Tailwind class with itself + dark variant
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

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const transforms = [
  // Card containers
  addDarkToClass(
    "bg-white rounded-3xl shadow-sm",
    "dark:bg-gray-800 dark:shadow-none",
  ),

  // Background fills
  addDarkToClass("bg-[#f8f8fc]", "dark:bg-gray-750"),
  addDarkToClass("bg-gray-50", "dark:bg-gray-800"),

  // Text
  addDarkToClass("text-gray-900", "dark:text-white"),
  addDarkToClass("text-gray-700", "dark:text-gray-200"),
  addDarkToClass("text-gray-600", "dark:text-gray-300"),
  addDarkToClass("text-gray-500", "dark:text-gray-400"),
  addDarkToClass("text-gray-400", "dark:text-gray-400"),

  // Borders
  addDarkToClass("border-[#ececf2]", "dark:border-gray-700"),
  addDarkToClass("border-gray-200", "dark:border-gray-700"),
  addDarkToClass("border-gray-100", "dark:border-gray-700"),
  addDarkToClass("border-gray-50", "dark:border-gray-700"),

  // Dividers
  addDarkToClass("divide-gray-50", "dark:divide-gray-700"),
  addDarkToClass("divide-[#ececf2]", "dark:divide-gray-700"),

  // Table header
  addDarkToClass(
    "bg-gradient-to-r from-[#f8f8fc] to-white",
    "dark:from-gray-750 dark:to-gray-800",
  ),

  // Input bg
  (content) =>
    content.replace(/bg-white(?!( dark| |\n))/g, (m, offset) => {
      const ctx = content.slice(Math.max(0, offset - 50), offset + 80);
      if (
        ctx.includes("bg-gradient") ||
        ctx.includes("from-violet") ||
        ctx.includes("to-white") ||
        ctx.includes("dark:")
      )
        return m;
      return "bg-white dark:bg-gray-700";
    }),

  // bg-gray-100 (skip gradients)
  (content) =>
    content.replace(/bg-gray-100(?! dark)/g, (m, offset) => {
      const ctx = content.slice(Math.max(0, offset - 50), offset + 80);
      if (
        ctx.includes("bg-gradient") ||
        ctx.includes("via-") ||
        ctx.includes("dark:")
      )
        return m;
      return "bg-gray-100 dark:bg-gray-700";
    }),

  // placeholder
  (content) =>
    content.replace(/placeholder-gray-400(?! dark)/g, (m, offset) => {
      if (content.slice(Math.max(0, offset - 200), offset).includes("dark:"))
        return m;
      return "placeholder-gray-400 dark:placeholder-gray-500";
    }),
];

let updatedCount = 0;

files.forEach((fp) => {
  let content = fs.readFileSync(fp, "utf8");
  const before = content;

  transforms.forEach((fn) => {
    content = fn(content);
  });

  if (content !== before) {
    fs.writeFileSync(fp, content);
    console.log("  Updated:", path.basename(fp));
    updatedCount++;
  }
});

console.log(`Done! Updated ${updatedCount} files.`);
