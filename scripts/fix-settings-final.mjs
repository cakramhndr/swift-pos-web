/**
 * Fix remaining hardcoded brand accent colors in Settings.jsx
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Fix Settings.jsx remaining brand color issues
const file = path.resolve(root, "src/pages/Settings.jsx");
let c = fs.readFileSync(file, "utf8");
let mod = false;

const reps = [
  // 1. Toggle checked state
  ['checked ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700"', 'checked ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"'],
  
  // 2. Card Radius selected pill
  ['appearance.cardRadius === r.value ? "bg-violet-600 text-white shadow-sm"', 'appearance.cardRadius === r.value ? "bg-accent text-white shadow-sm"'],
  
  // 3. Font Scale selected pill
  ['appearance.fontScale === f.value ? "bg-violet-600 text-white shadow-sm"', 'appearance.fontScale === f.value ? "bg-accent text-white shadow-sm"'],
  
  // 4. Payment method toggle
  ['method.enabled ? "bg-violet-600"', 'method.enabled ? "bg-accent"'],
  
  // 5. Role toggle
  ['role?.active ? "bg-violet-600"', 'role?.active ? "bg-accent"'],
  
  // 6. Hero decorative colors
  ['bg-fuchsia-300/20 blur-2xl', 'bg-accent/10 blur-2xl'],
  ['bg-violet-300/20 blur-xl', 'bg-accent/10 blur-xl'],
  ['text-sm text-violet-200 mt-1', 'text-sm text-white/80 mt-1'],
  
  // 7. Category card hover glow - from-violet-500/5 via-transparent to-purple-500/5
  ['from-violet-500/5 via-transparent to-purple-500/5', 'from-accent/5 via-transparent to-accent-hover/5'],
  
  // 8. Plan badge text
  ['rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300', 'rounded-full bg-accent-light dark:bg-accent/30 text-accent dark:text-accent'],
  
  // 9. Detail header icon bg - from-violet-50 to-purple-100 dark:from-violet-950/50 dark:to-purple-900/30
  // WITH border-violet-100/50 dark:border-violet-800/30
  ['from-violet-50 to-purple-100 dark:from-violet-950/50 dark:to-purple-900/30 flex items-center justify-center border border-violet-100/50 dark:border-violet-800/30',
   'bg-accent-light dark:bg-accent/20 flex items-center justify-center border border-accent/50 dark:border-accent/30'],
   
  // 10. Detail header icon color
  ['text-violet-600 dark:text-violet-400', 'text-accent dark:text-accent'],
  
  // 11. Profile sidebar icon backgrounds - from-violet-500 to-purple-600
  ['from-violet-500 to-purple-600 flex', 'from-accent to-accent-hover flex'],
  
  // 12. Receipt preview icon bg
  ['from-purple-500 to-violet-600 flex', 'from-accent to-accent-hover flex'],
  
  // 13. Live preview badge
  ['from-violet-600 to-purple-600 text-[10px]', 'from-accent to-accent-hover text-[10px]'],

  // 14. Category hover border
  ['hover:border-violet-200 dark:hover:border-violet-700/60 hover:shadow-lg hover:shadow-violet-500/5 dark:hover:shadow-violet-500/5', 'hover:border-accent dark:hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5 dark:hover:shadow-accent/5'],
  
  // 15. Group hover text on ChevronRight
  ['group-hover:text-violet-500', 'group-hover:text-accent'],
  
  // 16. Back button hover
  ['hover:text-violet-600 dark:hover:text-violet-400', 'hover:text-accent dark:hover:text-accent'],
  
  // 17. Focus rings on inputs
  ['focus:border-violet-400 focus:ring-2 focus:ring-violet-100', 'focus:border-accent focus:ring-2 focus:ring-accent/20'],
  
  // 18. SaveBtn shadow
  ['hover:shadow-violet-500/20', 'hover:shadow-accent/20'],
  
  // 19. User+Roles toggle bg
  ['bg-violet-600" : "bg-gray-200 dark:bg-gray-700"}`', 'bg-accent" : "bg-gray-200 dark:bg-gray-700"}`'],
  
  // 20. BadgeCheck text-violet-500
  ['text-violet-500', 'text-accent'],
  
  // 21. border-violet-300 dark:hover:border-violet-600
  ['hover:border-violet-300 dark:hover:border-violet-600', 'hover:border-accent dark:hover:border-accent'],
  
  // 22. Dark mode accent hover
  ['dark:hover:bg-violet-900/30', 'dark:hover:bg-accent/30'],
  ['dark:hover:bg-violet-900/20', 'dark:hover:bg-accent/20'],
  ['dark:hover:bg-purple-900/30', 'dark:hover:bg-accent/30'],
  ['dark:hover:bg-purple-900/20', 'dark:hover:bg-accent/20'],

  // 23. Input select focus
  ['focus:border-violet-400 focus:ring-2 focus:ring-violet-100', 'focus:border-accent focus:ring-2 focus:ring-accent/20'],
  
  // 24. Add new user button hover
  ['hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400', 'hover:border-accent dark:hover:border-accent hover:text-accent dark:hover:text-accent'],
  
  // 25. hover:bg-violet-50
  ['hover:bg-violet-50', 'hover:bg-accent-light'],
  ['hover:bg-purple-50', 'hover:bg-accent-light'],
  
  // 26. Category hover border + shadow accent
  ['hover:border-violet-200 dark:hover:border-violet-700/60', 'hover:border-accent dark:hover:border-accent/60'],
  ['hover:shadow-lg hover:shadow-violet-500/5', 'hover:shadow-lg hover:shadow-accent/5'],
  ['dark:hover:shadow-violet-500/5', 'dark:hover:shadow-accent/5'],
];

for (const [search, replace] of reps) {
  if (c.includes(search)) {
    c = c.replaceAll(search, replace);
    mod = true;
    console.log(`  REPLACED: ${search.substring(0, 50)}...`);
  }
}

if (mod) {
  fs.writeFileSync(file, c, "utf8");
  console.log("\nSettings.jsx UPDATED");
} else {
  console.log("\nSettings.jsx - no changes");
}

// Also fix the replace-colors.ps1 to have proper paths
console.log("Done");