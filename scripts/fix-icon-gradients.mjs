/**
 * Fix icon gradient containers: Replace className-based gradient stops
 * with inline style gradients that use var(--color-accent) and var(--color-accent-hover)
 *
 * Also fix from-accent / to-accent-hover for buttons by adding CSS in index.css
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const files = [
  "src/pages/Dashboard.jsx",
  "src/pages/Transactions.jsx",
  "src/pages/Products.jsx",
  "src/pages/Customers.jsx",
  "src/pages/Inventory.jsx",
  "src/pages/InventoryLogs.jsx",
  "src/pages/Reports.jsx",
  "src/pages/Analytics.jsx",
  "src/pages/Settings.jsx",
  "src/pages/ReceiptBuilder.jsx",
  "src/pages/ProductDetail.jsx",
  "src/components/layout/AppSidebar.jsx",
];

/**
 * Convert className gradient to inline style gradient:
 * - bg-gradient-to-br → backgroundImage: linear-gradient(135deg, ...)
 * - bg-gradient-to-r → backgroundImage: linear-gradient(to right, ...)
 *
 * Replaces the from-accent to-accent-hover with inline style
 * and removes from-accent to-accent-hover from className
 */
function fixGradientIcons(content) {
  // Pattern: className="...bg-gradient-to-br from-accent to-accent-hover..." with optional children
  // We need to handle both icon containers and buttons

  // For icon containers (div with icon inside, rounded-2xl or rounded-xl)
  let result = content;

  // 1. bg-gradient-to-br from-accent to-accent-hover (icon containers)
  result = result.replace(
    /className="([^"]*)bg-gradient-to-br from-accent to-accent-hover([^"]*)"([^>]*)>/g,
    (match, before, after, rest) => {
      const newClassName = `className="${before}bg-gradient-to-br${after}" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}${rest}>`;
      return newClassName;
    },
  );

  // 2. bg-gradient-to-r from-accent to-accent-hover (buttons)
  result = result.replace(
    /className="([^"]*)bg-gradient-to-r from-accent to-accent-hover([^"]*)"/g,
    (match, before, after) => {
      // Only convert if it doesn't already have a style prop
      const precedingText = result.slice(0, result.indexOf(match));
      const lastOpenBrace = precedingText.lastIndexOf("{");
      const lastCloseBrace = precedingText.lastIndexOf("}");
      // Check if there's already a style= on this element
      if (
        !precedingText.endsWith("style={{") &&
        !precedingText.endsWith("style={")
      ) {
        const newClassName = `className="${before}bg-gradient-to-r${after}" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}`;
        return newClassName;
      }
      // If there's already a style prop, just clean up className
      const newClassName = `className="${before}bg-gradient-to-r${after}"`;
      return newClassName;
    },
  );

  // 3. from-accent to-accent-hover without bg-gradient prefix (modal bars)
  result = result.replace(
    /className="([^"]*)from-accent to-accent-hover([^"]*)"/g,
    (match, before, after) => {
      return `className="${before}${after}" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}`;
    },
  );

  // 4. from-accent via-accent-light to-accent-hover
  result = result.replace(
    /className="([^"]*)from-accent via-accent-light to-accent-hover([^"]*)"/g,
    (match, before, after) => {
      return `className="${before}${after}" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))"}}`;
    },
  );

  return result;
}

let count = 0;
for (const relPath of files) {
  const fullPath = path.resolve(root, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log("SKIP:", relPath);
    continue;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  const beforeLength = content.length;
  content = fixGradientIcons(content);

  if (content.length !== beforeLength) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log("FIXED:", relPath);
    count++;
  } else {
    console.log("OK:", relPath);
  }
}

console.log(
  `\nFixed ${count} files - converted gradient className to inline style`,
);
